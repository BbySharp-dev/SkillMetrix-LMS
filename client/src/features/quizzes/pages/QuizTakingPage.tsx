import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizForTaking, useStartAttempt, useSubmitAttempt, useUserAttempts } from '../hooks/useQuizzes';
import { Button } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
import { CheckCircle2, XCircle, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubmitAnswerPayload } from '../types';

export default function QuizTakingPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const { data: quiz, isLoading, error } = useQuizForTaking(quizId);
    const { data: attempts = [] } = useUserAttempts(quizId);

    const startMutation = useStartAttempt();
    const submitMutation = useSubmitAttempt();

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [resultData, setResultData] = useState<Awaited<ReturnType<typeof submitMutation.mutateAsync>> | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!quizId || !attemptId || isSubmitted) return;

        const submitAnswers: SubmitAnswerPayload[] = quiz!.questions.map((q) => ({
            questionId: q.id,
            selectedOptionId: answers[q.id] ?? '',
        }));

        try {
            const result = await submitMutation.mutateAsync({ quizId, attemptId, answers: submitAnswers });
            setResultData(result);
            setIsSubmitted(true);
        } catch (err) {
            console.error('Submit quiz failed:', err);
        }
    }, [quizId, attemptId, quiz, answers, submitMutation, isSubmitted]);

    useEffect(() => {
        if (quiz?.timeLimitMinutes) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTimeLeft(quiz.timeLimitMinutes * 60);
        }
    }, [quiz]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || isSubmitted) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isSubmitted, handleSubmit]);

    const handleStartQuiz = useCallback(async () => {
        if (!quizId) return;
        try {
            const id = await startMutation.mutateAsync(quizId);
            setAttemptId(id);
        } catch (err) {
            console.error('Start quiz failed:', err);
        }
    }, [quizId, startMutation]);

    const handleSelectAnswer = useCallback((questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }, []);


    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz?.questions.length ?? 0;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    const currentQuestion = quiz?.questions[currentQuestionIndex];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <h2 className="text-xl font-semibold">Không thể tải quiz</h2>
                <p className="text-muted-foreground">Có thể bạn chưa đăng ký khóa học này.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!attemptId && !isSubmitted) {
        const latestAttempt = attempts[0];
        const canRetake = latestAttempt ? attempts.filter((a) => a.quizId === quizId).length < (quiz?.maxAttempts ?? 1) : true;

        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
                                {quiz?.description && (
                                    <p className="text-muted-foreground mt-2">{quiz.description}</p>
                                )}
                            </div>
                            {quiz?.isFinalQuiz && (
                                <Badge variant="default">Quiz cuối kỳ</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Câu hỏi:</span>
                                <span className="font-medium">{quiz?.questions.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Điểm đạt:</span>
                                <span className="font-medium">{quiz?.passingScore}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Thời gian:</span>
                                <span className="font-medium">{quiz?.timeLimitMinutes ?? 'Không giới hạn'} phút</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Số lần làm:</span>
                                <span className="font-medium">{attempts.length} / {quiz?.maxAttempts}</span>
                            </div>
                        </div>

                        {attempts.length > 0 && (
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <p className="text-sm font-medium mb-2">Lần làm gần nhất:</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className={cn('font-semibold', latestAttempt?.isPassed ? 'text-green-600' : 'text-red-500')}>
                                        {latestAttempt?.score.toFixed(0)}%
                                    </span>
                                    <Badge variant={latestAttempt?.isPassed ? 'default' : 'destructive'}>
                                        {latestAttempt?.isPassed ? 'Đạt' : 'Chưa đạt'}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                        {new Date(latestAttempt!.startedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleStartQuiz} disabled={!canRetake} className="flex-1">
                                {attempts.length === 0 ? 'Bắt đầu làm bài' : 'Làm lại'}
                            </Button>
                            {attempts.length > 0 && (
                                <Button variant="outline" onClick={() => navigate(`/quiz/${quizId}/results`)}>
                                    Xem kết quả
                                </Button>
                            )}
                        </div>

                        {!canRetake && (
                            <p className="text-sm text-destructive text-center">
                                Bạn đã hết số lần làm quiz này.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isSubmitted && quiz && attemptId) {
        return (
            <div className="max-w-2xl mx-auto py-4 px-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Thoát
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {answeredCount}/{totalQuestions} câu
                        </span>
                        {timeLeft !== null && (
                            <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(timeLeft)}
                            </Badge>
                        )}
                    </div>
                </div>

                <Progress value={progress} className="mb-6" />

                {currentQuestion && (
                    <Card className="mb-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Câu {currentQuestionIndex + 1} / {totalQuestions}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {currentQuestion.point} điểm
                                </span>
                            </div>
                            <p className="text-base font-medium leading-relaxed pt-2">
                                {currentQuestion.content}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {currentQuestion.options
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                                        className={cn(
                                            'w-full text-left px-4 py-3 rounded-lg border transition-all text-sm',
                                            answers[currentQuestion.id] === option.id
                                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                        )}
                                    >
                                        {option.content}
                                    </button>
                                ))}
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        Câu trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Chưa trả lời: {totalQuestions - answeredCount}
                    </span>
                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
                            Câu tiếp
                        </Button>
                    ) : (
                        <Button onClick={() => handleSubmit()} disabled={submitMutation.isPending}>
                            {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    {quiz.questions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={cn(
                                'w-8 h-8 rounded-full text-xs font-medium transition-all',
                                idx === currentQuestionIndex
                                    ? 'bg-primary text-primary-foreground'
                                    : answers[q.id]
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                            )}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (isSubmitted && resultData) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <Card className="mb-6">
                    <CardHeader className="text-center">
                        <div className={cn(
                            'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                            resultData.isPassed ? 'bg-green-100' : 'bg-red-100'
                        )}>
                            {resultData.isPassed ? (
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-500" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">{resultData.quizTitle}</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            {resultData.isPassed ? 'Chúc mừng! Bạn đã đạt yêu cầu.' : 'Bạn chưa đạt yêu cầu. Hãy thử lại nhé!'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-primary">{resultData.score.toFixed(0)}%</div>
                                <div className="text-sm text-muted-foreground mt-1">Điểm của bạn</div>
                            </div>
                            <div className="text-3xl text-muted-foreground">|</div>
                            <div>
                                <div className={cn(
                                    'text-4xl font-bold',
                                    resultData.score >= (quiz?.passingScore ?? 70) ? 'text-green-600' : 'text-red-500'
                                )}>
                                    {quiz?.passingScore}%
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">Điểm đạt</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <h3 className="text-lg font-semibold mb-4">Chi tiết câu trả lời</h3>
                <div className="space-y-4">
                    {resultData.answers.map((answer, idx) => (
                        <Card key={answer.questionId}>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    {answer.isCorrect ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{idx + 1}. {answer.questionContent}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Đã chọn:</span>
                                                <span className={cn(!answer.isCorrect && 'text-red-500 line-through')}>
                                                    {answer.selectedOptionContent}
                                                </span>
                                            </div>
                                            {!answer.isCorrect && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">Đáp án đúng:</span>
                                                    <span className="text-green-600 font-medium">{answer.correctOptionContent}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                        Quay lại khóa học
                    </Button>
                    <Button onClick={() => navigate(`/courses/${quiz?.courseId}`)} className="flex-1">
                        Tiếp tục học
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}