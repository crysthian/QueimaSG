import { useState, useEffect } from 'react';
import { QuizSetup } from './components/QuizSetup';
import { QuizRunner } from './components/QuizRunner';
import { ResultsView } from './components/ResultsView';
import { type Question, QuizMode, AppStatus, type QuizState } from '../types';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIdx: 0,
    userAnswers: {},
    mode: QuizMode.STUDY,
    totalTime: 0,
    timeLeft: 0,
    status: AppStatus.SETUP,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    let timer: number;
    if (state.status === AppStatus.RUNNING && state.mode === QuizMode.TEST && state.timeLeft > 0) {
      timer = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1)
        }));
      }, 1000);
    } else if (state.timeLeft === 0 && state.mode === QuizMode.TEST && state.status === AppStatus.RUNNING && state.totalTime > 0) {
      // Time's up!
      setState(prev => ({ ...prev, status: AppStatus.FINISHED }));
    }
    return () => clearInterval(timer);
  }, [state.status, state.mode, state.timeLeft, state.totalTime]);

  const handleStartQuiz = (questions: Question[], mode: QuizMode, timeLimitMinutes: number, count: number) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, count);
    setState({
      questions: shuffled,
      currentIdx: 0,
      userAnswers: {},
      mode,
      totalTime: timeLimitMinutes * 60,
      timeLeft: timeLimitMinutes * 60,
      status: AppStatus.RUNNING,
    });
  };

  const handleAnswer = (questionId: number, alternativeIdx: number) => {
    setState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionId]: alternativeIdx }
    }));
  };

  const handleNavigate = (direction: number) => {
    setState(prev => ({
      ...prev,
      currentIdx: Math.min(Math.max(0, prev.currentIdx + direction), prev.questions.length - 1)
    }));
  };

  const handleFinish = () => {
    setState(prev => ({ ...prev, status: AppStatus.FINISHED }));
  };

  const handleRetakeWrong = () => {
    const wrongQuestions = state.questions.filter(q => state.userAnswers[q.id] !== q.correta);
    setState(prev => ({
      ...prev,
      questions: wrongQuestions,
      currentIdx: 0,
      userAnswers: {},
      status: AppStatus.RUNNING,
      timeLeft: prev.totalTime, // Reset time for the retake
    }));
  };

  const handleReset = () => {
    setState(prev => ({ ...prev, status: AppStatus.SETUP, questions: [] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <a href="/">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
              SG
            </div></a>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">QueimaSG</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {state.status === AppStatus.RUNNING && state.mode === QuizMode.TEST && state.totalTime > 0 && (
              <div className={`px-4 py-2 rounded-full font-mono font-bold text-sm border ${state.timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 animate-pulse' : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800'}`}>
                {Math.floor(state.timeLeft / 60)}:{(state.timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.344l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {state.status === AppStatus.SETUP && (
          <QuizSetup onStart={handleStartQuiz} />
        )}

        {state.status === AppStatus.RUNNING && (
          <QuizRunner 
            state={state} 
            onAnswer={handleAnswer} 
            onNavigate={handleNavigate} 
            onFinish={handleFinish} 
          />
        )}

        {state.status === AppStatus.FINISHED && (
          <ResultsView 
            state={state} 
            onRetakeWrong={handleRetakeWrong} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}

export default App
