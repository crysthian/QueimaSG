import { useState } from 'react';
import type { AssociationQuestion, QuestionAnswer } from '../../types/quiz';
import { updateAssociationAnswer } from '../../domain/quiz/answers';

interface AssociationOptionsProps {
  question: AssociationQuestion;
  answer: QuestionAnswer | undefined;
  showCorrection: boolean;
  onChange: (answer: QuestionAnswer) => void;
}

export function AssociationOptions({ question, answer, showCorrection, onChange }: AssociationOptionsProps) {
  const [activeConcept, setActiveConcept] = useState<number | null>(null);
  const selections = Array.isArray(answer) ? answer : [];
  const assignedCount = question.conceitos.filter((_, concept) => selections.includes(concept)).length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-4 space-y-2">
        <p className="font-bold text-indigo-800 dark:text-indigo-200">Associe por clique</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Clique em um conceito e depois na descrição correspondente. Cada conceito deve ser usado uma vez.
          As descrições restantes ficam em branco. Para alterar, selecione novamente o conceito e outra descrição.
        </p>
        <p aria-live="polite" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {assignedCount} de {question.conceitos.length} conceitos associados
          {activeConcept !== null && !showCorrection ? ` · Selecione a descrição de ${question.conceitos[activeConcept]}` : ''}
        </p>
      </div>

      <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-5 items-start">
        <div className="sticky top-20 z-10 bg-white dark:bg-slate-900 py-2 mb-4 md:mb-0 space-y-3">
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Conceitos</h4>
          <div className="flex flex-wrap md:flex-col gap-2" role="group" aria-label="Escolha um conceito">
            {question.conceitos.map((concept, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={activeConcept === index}
                aria-label={`${concept}, ${selections.includes(index) ? `associado à descrição ${selections.indexOf(index) + 1}` : 'ainda sem associação'}`}
                disabled={showCorrection}
                onClick={() => setActiveConcept(activeConcept === index ? null : index)}
                className={`min-h-11 min-w-0 flex-1 md:flex-none break-words rounded-xl border-2 px-3 py-3 text-sm text-left font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${activeConcept === index
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'}`}
              >
                {index + 1}. {concept}
                <span className="hidden md:block text-xs font-normal mt-1">
                  {selections.includes(index) ? `Associado à descrição ${selections.indexOf(index) + 1}` : 'Ainda sem associação'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Descrições</h4>
          {question.descricoes.map((description, index) => {
            const selected = selections[index] ?? null;
            const expected = question.correta[index];
            const correct = selected === expected;
            return (
              <div key={index} className={`rounded-2xl border-2 overflow-hidden ${showCorrection
                ? correct ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : selected !== null ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                <button
                  type="button"
                  disabled={showCorrection || activeConcept === null}
                  aria-label={`Associar à descrição ${index + 1}: ${description}`}
                  onClick={() => {
                    if (activeConcept === null) return;
                    onChange(updateAssociationAnswer(answer, question.descricoes.length, index, activeConcept));
                    setActiveConcept(null);
                  }}
                  className="w-full text-left p-4 focus-visible:outline-2 focus-visible:outline-indigo-500 enabled:hover:bg-indigo-100 dark:enabled:hover:bg-indigo-900/40"
                >
                  <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Descrição {index + 1}</span>
                  <span className="flex gap-3 items-start text-slate-800 dark:text-slate-100">
                    <span className="flex-shrink-0 min-w-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-center font-bold">{selected === null ? '—' : selected + 1}</span>
                    <span className="whitespace-pre-line">{description}</span>
                  </span>
                  <span className="block mt-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {selected === null ? 'Sem associação' : question.conceitos[selected]}
                  </span>
                </button>
                {selected !== null && !showCorrection && (
                  <button
                    type="button"
                    aria-label={`Remover associação da descrição ${index + 1}`}
                    onClick={() => onChange(updateAssociationAnswer(answer, question.descricoes.length, index, null))}
                    className="min-h-11 px-4 pb-3 text-sm font-bold text-slate-600 dark:text-slate-300 underline"
                  >Remover associação</button>
                )}
                {showCorrection && (
                  <p className={`px-4 pb-4 text-sm font-bold ${correct ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {correct ? 'Correto' : 'Incorreto'} · Gabarito: {expected === null ? 'Sem associação' : question.conceitos[expected]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
