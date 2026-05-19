
export interface QuizResponseDto {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimitMinutes: number | null;
    maxAttempts: number;
    isFinalQuiz: boolean;
    questionCount: number;
    createdAt: string;
}

export interface QuizDetailDto {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimitMinutes: number | null;
    maxAttempts: number;
    isFinalQuiz: boolean;
    questions: QuestionResponseDto[];
    createdAt: string;
}

export interface QuizForTakingDto {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimitMinutes: number | null;
    maxAttempts: number;
    isFinalQuiz: boolean;
    questions: QuestionForTakingDto[];
    createdAt: string;
}

export interface QuestionResponseDto {
    id: string;
    content: string;
    point: number;
    orderIndex: number;
    options: OptionResponseDto[];
}

export interface QuestionForTakingDto {
    id: string;
    content: string;
    point: number;
    orderIndex: number;
    options: OptionForTakingDto[];
}

export interface OptionResponseDto {
    id: string;
    content: string;
    isCorrect: boolean;
    orderIndex: number;
}

export interface OptionForTakingDto {
    id: string;
    content: string;
    orderIndex: number;
}


export interface CreateQuizPayload {
    courseId: string;
    title: string;
    description?: string;
    passingScore?: number;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    isFinalQuiz?: boolean;
}

export interface UpdateQuizPayload {
    title?: string;
    description?: string;
    passingScore?: number;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    isFinalQuiz?: boolean;
}

export interface CreateQuestionPayload {
    content: string;
    point?: number;
    orderIndex: number;
    options: CreateOptionPayload[];
}

export interface CreateOptionPayload {
    content: string;
    isCorrect: boolean;
    orderIndex: number;
}

export interface UpdateQuestionPayload {
    content?: string;
    point?: number;
    orderIndex?: number;
}

export interface UpdateOptionPayload {
    content?: string;
    isCorrect?: boolean;
    orderIndex?: number;
}


export interface QuizAttemptSummaryDto {
    id: string;
    quizId: string;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    startedAt: string;
    submittedAt: string | null;
}

export interface QuizAttemptResultDto {
    id: string;
    quizId: string;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    startedAt: string;
    submittedAt: string | null;
    answers: AnswerResultDto[];
}

export interface AnswerResultDto {
    questionId: string;
    questionContent: string;
    selectedOptionId: string;
    selectedOptionContent: string;
    isCorrect: boolean;
    correctOptionId: string | null;
    correctOptionContent: string | null;
}

export interface SubmitAnswerPayload {
    questionId: string;
    selectedOptionId: string;
}
