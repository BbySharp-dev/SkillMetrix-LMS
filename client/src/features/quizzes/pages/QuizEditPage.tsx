import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Trash2, Clock, Target, BookOpen, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useQuizDetail, useAddQuestion, useDeleteQuestion } from '../hooks/useQuizzes';
import { Button } from '@/components/ui';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { QuestionResponseDto } from '../types';
import { toast } from 'sonner';

export default function QuizEditPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const { data: quiz, isLoading } = useQuizDetail(quizId);
    const addQuestionMutation = useAddQuestion();
    const deleteQuestionMutation = useDeleteQuestion();

    const [addOpen, setAddOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        content: '',
        options: [
            { content: '', isCorrect: true },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
        ],
    });

    const handleAddQuestion = useCallback(async () => {
        if (!quizId) return;
        if (!newQuestion.content.trim()) {
            toast.error('Câu hỏi không được để trống');
            return;
        }
        const validOptions = newQuestion.options.filter(o => o.content.trim());
        if (validOptions.length < 2) {
            toast.error('Cần ít nhất 2 đáp án');
            return;
        }
        const correctCount = validOptions.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
            toast.error('Phải có đúng 1 đáp án đúng');
            return;
        }
        try {
            await addQuestionMutation.mutateAsync({
                quizId,
                data: {
                    content: newQuestion.content,
                    point: 1,
                    orderIndex: (quiz?.questions.length ?? 0) + 1,
                    options: newQuestion.options
                        .filter(o => o.content.trim())
                        .map((o, i) => ({ content: o.content, isCorrect: o.isCorrect, orderIndex: i + 1 })),
                },
            });
            setNewQuestion({
                content: '',
                options: [
                    { content: '', isCorrect: true },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                ],
            });
            setAddOpen(false);
        } catch {
        }
    }, [quizId, newQuestion, addQuestionMutation, quiz]);

    const handleDeleteQuestion = useCallback(async (questionId: string) => {
        if (!quizId) return;
        try {
            await deleteQuestionMutation.mutateAsync({ quizId, questionId });
        } catch {
        }
    }, [quizId, deleteQuestionMutation]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Không tìm thấy quiz</h2>
                <Link to="/instructor/courses" className="text-primary hover:underline">
                    Quay về khóa học
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                    <Link
                        to={`/instructor/quiz`}
                        className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
                    >
                        ← Quay về danh sách quiz
                    </Link>
                    <h1 className="text-2xl font-bold">{quiz.title}</h1>
                    {quiz.description && (
                        <p className="text-muted-foreground mt-1">{quiz.description}</p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>Đạt: {quiz.passingScore}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz.questions.length} câu</span>
                    </div>
                    {quiz.timeLimitMinutes && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{quiz.timeLimitMinutes} phút</span>
                        </div>
                    )}
                    {quiz.isFinalQuiz && (
                        <Badge variant="default">Quiz cuối kỳ</Badge>
                    )}
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm câu hỏi
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Thêm câu hỏi mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label className="font-semibold">Câu hỏi *</Label>
                                <textarea
                                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    rows={3}
                                    placeholder="Nhập nội dung câu hỏi..."
                                    value={newQuestion.content}
                                    onChange={(e) => setNewQuestion(p => ({ ...p, content: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label className="font-semibold mb-2 block">Đáp án *</Label>
                                <p className="text-xs text-muted-foreground mb-2">Đánh dấu đáp án đúng bằng nút bên trái</p>
                                <div className="space-y-2">
                                    {newQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setNewQuestion(p => ({
                                                    ...p,
                                                    options: p.options.map((o, i) => ({
                                                        ...o,
                                                        isCorrect: i === idx,
                                                    })),
                                                }))}
                                                className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                                    opt.isCorrect
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-gray-300'
                                                )}
                                            >
                                                {opt.isCorrect && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                            <Input
                                                placeholder={`Đáp án ${idx + 1}`}
                                                value={opt.content}
                                                onChange={(e) => setNewQuestion(p => ({
                                                    ...p,
                                                    options: p.options.map((o, i) => i === idx ? { ...o, content: e.target.value } : o),
                                                }))}
                                                className="flex-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setAddOpen(false)}>Hủy</Button>
                                <Button onClick={handleAddQuestion} disabled={addQuestionMutation.isPending}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {addQuestionMutation.isPending ? 'Đang lưu...' : 'Lưu câu hỏi'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {quiz.questions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                            <AlertCircle className="w-10 h-10 text-muted-foreground" />
                            <p className="font-medium text-muted-foreground">Chưa có câu hỏi nào</p>
                            <p className="text-sm text-muted-foreground">
                                Nhấn "Thêm câu hỏi" để bắt đầu tạo câu hỏi
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    quiz.questions.map((question, idx) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            index={idx + 1}
                            onDelete={() => handleDeleteQuestion(question.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function QuestionCard({
    question,
    index,
    onDelete,
}: {
    question: QuestionResponseDto;
    index: number;
    onDelete: () => void;
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">Câu {index}</span>
                            <span className="text-xs text-muted-foreground">{question.point} điểm</span>
                        </div>
                        <p className="font-medium text-sm leading-relaxed">{question.content}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-1.5">
                    {question.options
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((opt) => (
                            <div
                                key={opt.id}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm border',
                                    opt.isCorrect
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-muted/40 border-border'
                                )}
                            >
                                {opt.isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                                )}
                                <span className="flex-1">{opt.content}</span>
                                {opt.isCorrect && (
                                    <Badge variant="secondary" className="text-xs shrink-0">Đúng</Badge>
                                )}
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}
