
import React from 'react';
import { type QuizState } from '../../types';

interface ResultsViewProps {
  state: QuizState;
  onRetakeWrong: () => void;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ state, onRetakeWrong, onReset }) => {
  const correctCount = state.questions.filter(q => state.userAnswers[q.id] === q.correta).length;
  const totalCount = state.questions.length;
  const wrongCount = totalCount - correctCount;
  const percentage = Math.round((correctCount / totalCount) * 100);

  const getStatusColor = (p: number) => {
    if (p >= 70) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (p >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100">Resultado Final</h2>
        <p className="text-slate-500 dark:text-slate-400">Veja seu desempenho detalhado abaixo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-8 rounded-3xl border-2 text-center space-y-2 transition-colors ${getStatusColor(percentage)}`}>
           <div className="text-5xl font-black">{percentage}%</div>
           <div className="font-bold uppercase tracking-widest text-xs opacity-70">Taxa de Acerto</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-2 transition-colors">
           <div className="text-4xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
           <div className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs">Acertos</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-2 transition-colors">
           <div className="text-4xl font-bold text-red-600 dark:text-red-400">{wrongCount}</div>
           <div className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs">Erros</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Mapa de Respostas</h3>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
          {state.questions.map((q, idx) => {
            const isCorrect = state.userAnswers[q.id] === q.correta;
            const isAnswered = state.userAnswers[q.id] !== undefined;

            return (
              <div 
                key={q.id}
                className={`aspect-square flex items-center justify-center rounded-xl font-bold text-lg border-2 transition-all cursor-default
                  ${!isAnswered ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600' : 
                    isCorrect ? 'bg-green-500 border-green-600 text-white' : 'bg-red-500 border-red-600 text-white'}
                `}
                title={!isAnswered ? 'Não respondida' : isCorrect ? 'Correta' : 'Incorreta'}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {wrongCount > 0 && (
          <button 
            onClick={onRetakeWrong}
            className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refazer Questões Erradas
          </button>
        )}
        <button 
          onClick={onReset}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          Novo Simulado
        </button>
      </div>
    </div>
  );
};
