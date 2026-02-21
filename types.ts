
export interface Question {
  id: number;
  pergunta: string;
  alternativas: string[];
  correta: number;
  comentario: string;
}

export const QuizMode = {
  STUDY: 'study',
  TEST: 'test'
} as const;

export type QuizMode = typeof QuizMode[keyof typeof QuizMode];

export const AppStatus = {
  SETUP: 'setup',
  RUNNING: 'running',
  FINISHED: 'finished'
} as const;

export type AppStatus = typeof AppStatus[keyof typeof AppStatus];

export interface QuizState {
  questions: Question[];
  currentIdx: number;
  userAnswers: Record<number, number>; // question id -> selected alternative index
  mode: QuizMode;
  totalTime: number; // in seconds
  timeLeft: number;
  status: AppStatus;
}
