import { useState, useEffect, useRef } from 'react';
import { MessageCircleQuestion, Clock, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import {
    useLessonQuestions,
    useCreateQuestion,
    useDeleteQuestion,
    useCreateAnswer,
    useDeleteAnswer,
} from '../hooks/useLessonQA';
import { useVideoPlayerContext } from '../context/useVideoPlayerContext';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import type { LessonQuestionDto, LessonAnswerDto } from '@/features/courses/types';

interface QATabContentProps {
    lessonId: string;
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
    const initials = name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    if (url) {
        return (
            <img
                src={url}
                alt={name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                }}
            />
        );
    }

    return (
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0">
            {initials}
        </div>
    );
}

function AnswerItem({
    answer,
    onDelete,
}: {
    answer: LessonAnswerDto;
    onDelete: (answerId: string) => void;
}) {
    const userId = useAuthStore((s) => s.user?.id);

    return (
        <div className="flex gap-3 pl-4 border-l-2 border-gray-100 group">
            <Avatar name={answer.userFullName} url={answer.userAvatarUrl} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{answer.userFullName}</span>
                    <span className="text-xs text-gray-400">
                        {new Date(answer.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {userId === answer.userId && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onDelete(answer.id)}
                        >
                            <Trash2 className="size-3 text-gray-400 hover:text-red-500" />
                        </Button>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{answer.content}</p>
            </div>
        </div>
    );
}

function QuestionItem({
    question,
    lessonId,
}: {
    question: LessonQuestionDto;
    lessonId: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const [answerContent, setAnswerContent] = useState('');
    const [showAnswerInput, setShowAnswerInput] = useState(false);

    const userId = useAuthStore((s) => s.user?.id);
    const createAnswer = useCreateAnswer();
    const deleteAnswer = useDeleteAnswer();
    const deleteQuestion = useDeleteQuestion();

    const handleSubmitAnswer = async () => {
        if (!answerContent.trim()) return;
        await createAnswer.mutateAsync({ lessonId, questionId: question.id, content: answerContent.trim() });
        setAnswerContent('');
        setShowAnswerInput(false);
        setExpanded(true);
    };

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors group">
            {/* Question header */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar name={question.userFullName} url={question.userAvatarUrl} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">{question.userFullName}</span>
                            {question.formattedTimestamp && (
                                <Badge variant="outline" className="font-mono text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50 gap-0.5">
                                    <Clock className="size-2.5" />
                                    {question.formattedTimestamp}
                                </Badge>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">
                                {new Date(question.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {userId === question.userId && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 shrink-0"
                                    onClick={() => deleteQuestion.mutate({ lessonId, questionId: question.id })}
                                >
                                    <Trash2 className="size-3 text-gray-400 hover:text-red-500" />
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap">{question.content}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs font-bold text-gray-500 gap-1"
                        onClick={() => setExpanded((v) => !v)}
                    >
                        <MessageCircleQuestion className="size-3.5" />
                        {question.answerCount} câu trả lời
                        {expanded ? <ChevronUp className="size-3 ml-0.5" /> : <ChevronDown className="size-3 ml-0.5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs font-bold text-indigo-600 gap-1"
                        onClick={() => setShowAnswerInput((v) => !v)}
                    >
                        <Send className="size-3.5" />
                        Trả lời
                    </Button>
                </div>

                {/* Answer input */}
                {showAnswerInput && (
                    <div className="mt-3 flex gap-2">
                        <Textarea
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            placeholder="Viết câu trả lời của bạn..."
                            className="min-h-15 text-sm resize-none"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    handleSubmitAnswer();
                                }
                            }}
                        />
                        <div className="flex flex-col gap-1 shrink-0">
                            <Button
                                size="sm"
                                className="h-8 bg-indigo-600 hover:bg-indigo-700 font-bold"
                                onClick={handleSubmitAnswer}
                                disabled={!answerContent.trim() || createAnswer.isPending}
                            >
                                <Send className="size-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 font-bold"
                                onClick={() => { setShowAnswerInput(false); setAnswerContent(''); }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Answers */}
            {expanded && question.answers.length > 0 && (
                <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3">
                    {question.answers.map((answer) => (
                        <AnswerItem
                            key={answer.id}
                            answer={answer}
                            onDelete={(answerId) => deleteAnswer.mutate({ lessonId, answerId })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function QATabContent({ lessonId }: QATabContentProps) {
    const [questionContent, setQuestionContent] = useState('');
    const listRef = useRef<HTMLDivElement>(null);
    const { data: questions = [], isLoading } = useLessonQuestions(lessonId);
    const createQuestion = useCreateQuestion();
    const { currentTimeRef } = useVideoPlayerContext();
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');

    useEffect(() => {
        const update = () => {
            const s = Math.floor(currentTimeRef.current);
            const mm = Math.floor(s / 60).toString().padStart(2, '0');
            const ss = (s % 60).toString().padStart(2, '0');
            setCurrentTimestamp(`${mm}:${ss}`);
        };
        update();
        const interval = setInterval(update, 500);
        return () => clearInterval(interval);
    }, [currentTimeRef]);

    const handleSubmit = async () => {
        if (!questionContent.trim()) return;
        await createQuestion.mutateAsync({
            lessonId,
            content: questionContent.trim(),
            videoTimestampSeconds: Math.floor(currentTimeRef.current),
        });
        setQuestionContent('');
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="space-y-4">
            {/* Create question */}
            <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                        <MessageCircleQuestion className="size-3.5" />
                        Đặt câu hỏi tại
                        <Badge variant="outline" className="font-mono text-[10px] text-indigo-600 border-indigo-200 bg-white">
                            <Clock className="size-3 mr-0.5" />
                            {currentTimestamp}
                        </Badge>
                    </span>
                </div>
                <Textarea
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="Bạn có thắc mắc gì về bài học này? Hỏi ngay để được giảng viên hoặc học viên khác hỗ trợ..."
                    className="min-h-20 text-sm resize-none bg-white"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                        onClick={handleSubmit}
                        disabled={!questionContent.trim() || createQuestion.isPending}
                    >
                        <MessageCircleQuestion className="size-3.5 mr-1.5" />
                        Đăng câu hỏi
                    </Button>
                </div>
            </div>

            {/* Questions list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <MessageCircleQuestion size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có câu hỏi nào cho bài học này.</p>
                    <p className="text-xs mt-1">Hãy là người đầu tiên đặt câu hỏi!</p>
                </div>
            ) : (
                <div ref={listRef} className="space-y-3">
                    {questions.map((q) => (
                        <QuestionItem key={q.id} question={q} lessonId={lessonId} />
                    ))}
                </div>
            )}
        </div>
    );
}
