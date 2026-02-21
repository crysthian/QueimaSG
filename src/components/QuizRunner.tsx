
import React, { useState } from 'react';
import { type QuizState, QuizMode } from '../../types';

interface QuizRunnerProps {
  state: QuizState;
  onAnswer: (id: number, idx: number) => void;
  onNavigate: (dir: number) => void;
  onFinish: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ state, onAnswer, onNavigate, onFinish }) => {
  const currentQuestion = state.questions[state.currentIdx];
  const userAnswer = state.userAnswers[currentQuestion.id];
  const isStudyMode = state.mode === QuizMode.STUDY;
  
  // Track if "Check Answer" was clicked in study mode
  const [showExplanation, setShowExplanation] = useState(false);

  // Reset explanation visibility when question changes
  React.useEffect(() => {
    setShowExplanation(false);
  }, [state.currentIdx]);

  const handleSelect = (idx: number) => {
    if (showExplanation && isStudyMode) return; // Prevent change after checking in study mode
    onAnswer(currentQuestion.id, idx);
  };

  const progress = ((state.currentIdx + 1) / state.questions.length) * 100;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden transition-colors">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8 min-h-[400px] transition-colors">
        {/* Question Area */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              Questão {currentQuestion.id}
            </span>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
               {state.currentIdx + 1} / {state.questions.length}
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight text-justify whitespace-pre-line">
            {currentQuestion.pergunta}
          </h3>
        </div>

        {/* Alternatives Area */}
        <div className="space-y-3">
          {currentQuestion.alternativas.map((alt, idx) => {
            const isSelected = userAnswer === idx;
            const isCorrect = idx === currentQuestion.correta;
            
            let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ";
            
            if (showExplanation && isStudyMode) {
              if (isCorrect) btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300";
              else if (isSelected) btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300";
              else btnClass += "border-slate-100 dark:border-slate-800 opacity-60";
            } else {
              if (isSelected) btnClass += "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100";
              else btnClass += "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300";
            }

            return (
              <button 
                key={idx} 
                onClick={() => handleSelect(idx)}
                className={btnClass}
                disabled={showExplanation && isStudyMode}
              >
                <div className={`w-8 h-8 flex-shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-medium text-base md:text-lg">{alt}</span>
              </button>
            );
          })}
        </div>

        {/* Study Mode Explanation */}
        {showExplanation && isStudyMode && (
          <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-indigo-500 animate-in fade-in slide-in-from-top-2 duration-300">
             <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Explicação do Gabarito
             </h4>
             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{currentQuestion.comentario}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate(-1)}
              disabled={state.currentIdx === 0}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button 
              onClick={() => onNavigate(1)}
              disabled={state.currentIdx === state.questions.length - 1}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {isStudyMode && !showExplanation && (
               <button 
                 onClick={() => setShowExplanation(true)}
                 disabled={userAnswer === undefined}
                 className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
               >
                 Verificar
               </button>
            )}
            {state.currentIdx === state.questions.length - 1 ? (
              <button 
                onClick={onFinish}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 dark:shadow-none active:scale-95"
              >
                Finalizar Prova
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
