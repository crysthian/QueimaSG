import type { MultipleChoiceQuestion, QuestionAnswer } from '../../types/quiz';

interface MultipleChoiceOptionsProps {
  question: MultipleChoiceQuestion;
  answer: QuestionAnswer | undefined;
  showCorrection: boolean;
  onSelect: (index: number) => void;
}

export function MultipleChoiceOptions({ question, answer, showCorrection, onSelect }: MultipleChoiceOptionsProps) {
  return (
    <div className="space-y-3">
      {question.alternativas.map((alt, idx) => {
        const isSelected = answer === idx;
        const isCorrect = idx === question.correta;

        let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ";

        if (showCorrection) {
          if (isCorrect) btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300";
          else if (isSelected) btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300";
          else btnClass += "border-slate-100 dark:border-slate-800 opacity-60";
        } else {
          if (isSelected) btnClass += "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100";
          else btnClass += "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300";
        }

        return (
          <button
            type="button"
            aria-pressed={isSelected}
            key={idx}
            onClick={() => onSelect(idx)}
            className={btnClass}
            disabled={showCorrection}
          >
            <div className={`w-8 h-8 flex-shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-500'}`}>
              {String.fromCharCode(65 + idx)}
            </div>
            <span className="font-medium text-base md:text-lg">{alt}</span>
          </button>
        );
      })}
    </div>
  );
}
