import type { AssociationAnswer, Question, QuestionAnswer } from '../types.ts';

export function isAnswerComplete(question: Question, answer: QuestionAnswer | undefined): boolean {
  if (question.tipo !== 'associacao') {
    return typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer < question.alternativas.length;
  }
  return Array.isArray(answer) && answer.length === question.descricoes.length &&
    question.descricoes.every((_, index) => {
      const selected = answer[index];
      return selected === null || typeof selected === 'number' && Number.isInteger(selected) && selected >= 0 && selected < question.conceitos.length;
    }) && question.conceitos.every((_, concept) => answer.filter(selected => selected === concept).length === 1);
}

export function isAnswerCorrect(question: Question, answer: QuestionAnswer | undefined): boolean {
  if (!isAnswerComplete(question, answer)) return false;
  if (question.tipo === 'associacao') {
    return Array.isArray(answer) && question.correta.every((expected, index) => answer[index] === expected);
  }
  return answer === question.correta;
}

export function updateAssociationAnswer(answer: QuestionAnswer | undefined, count: number, index: number, concept: number | null): AssociationAnswer {
  return Array.from({ length: count }, (_, position) =>
    position === index ? concept : Array.isArray(answer) && answer[position] !== concept ? answer[position] ?? null : null);
}
