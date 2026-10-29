import { useEffect, useRef, useState } from 'react';
import { AppStatus, QuizMode, type Question, type QuestionAnswer } from '../types/quiz';
import { createInitialQuizState, retakeWrongQuestions, selectQuestions, updateQuizTime } from '../domain/quiz/session';
import { validateQuizSettings } from '../domain/quiz/validation';

export function useQuiz() {
  const [state, setState] = useState(createInitialQuizState);
  const deadline = useRef(0);

  useEffect(() => {
    if (state.status !== AppStatus.RUNNING || state.mode !== QuizMode.TEST) return;

    const timer = window.setInterval(() => {
      setState(previous => updateQuizTime(previous, deadline.current, Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.status, state.mode]);

  function startQuiz(questions: Question[], mode: QuizMode, minutes: number, count: number) {
    if (validateQuizSettings(questions.length, count, mode, minutes)) return;
    const totalTime = mode === QuizMode.TEST ? minutes * 60 : 0;
    deadline.current = Date.now() + totalTime * 1000;
    setState({
      questions: selectQuestions(questions, count),
      currentIdx: 0,
      userAnswers: {},
      mode,
      totalTime,
      timeLeft: totalTime,
      status: AppStatus.RUNNING,
    });
  }

  function answerQuestion(questionId: number, answer: QuestionAnswer) {
    setState(previous => previous.status !== AppStatus.RUNNING ? previous : {
      ...previous,
      userAnswers: { ...previous.userAnswers, [questionId]: answer },
    });
  }

  function navigate(direction: number) {
    setState(previous => previous.status !== AppStatus.RUNNING ? previous : {
      ...previous,
      currentIdx: Math.min(Math.max(0, previous.currentIdx + direction), previous.questions.length - 1),
    });
  }

  function finishQuiz() {
    setState(previous => ({ ...previous, status: AppStatus.FINISHED }));
  }

  function retakeWrong() {
    deadline.current = Date.now() + state.totalTime * 1000;
    setState(retakeWrongQuestions);
  }

  function resetQuiz() {
    deadline.current = 0;
    setState(createInitialQuizState());
  }

  return { state, startQuiz, answerQuestion, navigate, finishQuiz, retakeWrong, resetQuiz };
}
