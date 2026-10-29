
interface QuestionBase {
  id: number;
  pergunta: string;
  comentario: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  tipo?: 'multipla_escolha';
  alternativas: string[];
  correta: number;
}

export interface AssociationQuestion extends QuestionBase {
  tipo: 'associacao';
  conceitos: string[];
  descricoes: string[];
  correta: (number | null)[];
}

export type Question = MultipleChoiceQuestion | AssociationQuestion;
// null = descrição sem associação.
export type AssociationAnswer = (number | null)[];
export type QuestionAnswer = number | AssociationAnswer;

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
  userAnswers: Partial<Record<number, QuestionAnswer>>;
  mode: QuizMode;
  totalTime: number; // in seconds
  timeLeft: number;
  status: AppStatus;
}
