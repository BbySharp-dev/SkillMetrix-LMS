import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, Target, BookOpen, AlertCircle, Pencil, Eye } from 'lucide-react';
import { useQuizzesByCourse, useDeleteQuiz, useCreateQuiz } from '../hooks/useQuizzes';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { Input } from '@/components/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui';
import type { QuizResponseDto } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createQuizSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống'),
    description: z.string().optional(),
    passingScore: z.number().min(1).max(100),
    timeLimitMinutes: z.number().min(1).optional(),
    maxAttempts: z.number().min(1),
    isFinalQuiz: z.boolean(),
});

type CreateQuizFormData = z.infer<typeof createQuizSchema>;

export function QuizListPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const { data: quizzes = [], isLoading } = useQuizzesByCourse(courseId);
    const createMutation = useCreateQuiz();
    const deleteMutation = useDeleteQuiz();

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<QuizResponseDto | null>(null);

    const form = useForm<CreateQuizFormData>({
        resolver: zodResolver(createQuizSchema),
        defaultValues: {
            title: '',
            description: '',
            passingScore: 70,
            timeLimitMinutes: undefined,
            maxAttempts: 1,
            isFinalQuiz: false,
        },
    });

    const handleCreate = useCallback(async (data: CreateQuizFormData) => {
        if (!courseId) return;
        await createMutation.mutateAsync({
            courseId,
            title: data.title,
            description: data.description,
            passingScore: data.passingScore,
            timeLimitMinutes: data.timeLimitMinutes,
            maxAttempts: data.maxAttempts,
            isFinalQuiz: data.isFinalQuiz,
        });
        setCreateOpen(false);
        form.reset();
    }, [courseId, createMutation, form]);

    const handleDelete = useCallback(async () => {
        if (!deleteTarget || !courseId) return;
        await deleteMutation.mutateAsync({ quizId: deleteTarget.id, courseId });
        setDeleteTarget(null);
    }, [deleteTarget, courseId, deleteMutation]);

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Quiz</h1>
                    <p className="text-muted-foreground mt-1">Danh sách bài kiểm tra của khóa học</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo Quiz
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo Quiz mới</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu đề *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="VD: Bài kiểm tra chương 1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mô tả quiz (tùy chọn)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="passingScore"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Điểm đạt (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={100}
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maxAttempts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số lần làm</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="timeLimitMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thời gian (phút, để trống = không giới hạn)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="VD: 15"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isFinalQuiz"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    className="mt-1"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Quiz cuối kỳ</FormLabel>
                                                <p className="text-xs text-muted-foreground">
                                                    Học sinh chỉ thấy quiz cuối kỳ khi đăng ký khóa học
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo Quiz'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Link to={`/instructor/courses/${courseId}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
                ← Quay về khóa học
            </Link>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : quizzes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                        <AlertCircle className="w-12 h-12 text-muted-foreground" />
                        <div className="text-center">
                            <p className="font-medium">Chưa có quiz nào</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tạo quiz đầu tiên để kiểm tra học sinh
                            </p>
                        </div>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo Quiz
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{quiz.title}</h3>
                                            {quiz.isFinalQuiz && (
                                                <Badge variant="default">Quiz cuối kỳ</Badge>
                                            )}
                                        </div>
                                        {quiz.description && (
                                            <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                <span>Đạt: {quiz.passingScore}%</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{quiz.questionCount} câu hỏi</span>
                                            </div>
                                            {quiz.timeLimitMinutes && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{quiz.timeLimitMinutes} phút</span>
                                                </div>
                                            )}
                                            <span>Làm tối đa {quiz.maxAttempts} lần</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/instructor/quiz/${quiz.id}/edit`)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/instructor/quiz/${quiz.id}`)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(quiz)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmModal
                open={!!deleteTarget}
                title="Xóa Quiz"
                message={`Bạn có chắc muốn xóa quiz "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                confirmText="Xóa"
            />
        </div>
    );
}
