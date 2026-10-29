import { AppStatus } from './types/quiz';
import { AppHeader } from './components/layout/AppHeader';
import { QuizSetup } from './components/quiz/QuizSetup';
import { QuizRunner } from './components/quiz/QuizRunner';
import { ResultsView } from './components/quiz/ResultsView';
import { useQuiz } from './hooks/useQuiz';
import { useTheme } from './hooks/useTheme';

function App() {
  const { state, startQuiz, answerQuestion, navigate, finishQuiz, retakeWrong, resetQuiz } = useQuiz();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AppHeader state={state} darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {state.status === AppStatus.SETUP && (
          <QuizSetup onStart={startQuiz} />
        )}

        {state.status === AppStatus.RUNNING && (
          <QuizRunner
            state={state}
            onAnswer={answerQuestion}
            onNavigate={navigate}
            onFinish={finishQuiz}
          />
        )}

        {state.status === AppStatus.FINISHED && (
          <ResultsView
            state={state}
            onRetakeWrong={retakeWrong}
            onReset={resetQuiz}
          />
        )}
      </main>
    </div>
  );
}

export default App;
