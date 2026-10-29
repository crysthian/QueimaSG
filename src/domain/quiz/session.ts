import { AppStatus, QuizMode, type Question, type QuizState } from '../../types/quiz.ts';
import { isAnswerCorrect } from './answers.ts';

export function createInitialQuizState(): QuizState {
  return {
    questions: [],
    currentIdx: 0,
    userAnswers: {},
    mode: QuizMode.STUDY,
    totalTime: 0,
    timeLeft: 0,
    status: AppStatus.SETUP,
  };
}

export function selectQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

export function retakeWrongQuestions(state: QuizState): QuizState {
  const questions = state.questions.filter(question => !isAnswerCorrect(question, state.userAnswers[question.id]));
  if (questions.length === 0) return state;

  return {
    ...state,
    questions,
    currentIdx: 0,
    userAnswers: {},
    status: AppStatus.RUNNING,
    timeLeft: state.totalTime,
  };
}

export function updateQuizTime(state: QuizState, deadline: number, now: number): QuizState {
  if (state.status !== AppStatus.RUNNING || state.mode !== QuizMode.TEST) return state;
  const timeLeft = Math.max(0, Math.ceil((deadline - now) / 1000));
  if (timeLeft === state.timeLeft && timeLeft > 0) return state;

  return {
    ...state,
    timeLeft,
    status: timeLeft === 0 ? AppStatus.FINISHED : state.status,
  };
}
