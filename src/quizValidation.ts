import { QuizMode, type Question } from '../types';

export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('O questionário deve ser um array com pelo menos uma questão.');
  }

  const ids = new Set<number>();
  return value.map((question, index) => {
    if (!question || !Number.isSafeInteger(question.id) ||
        typeof question.pergunta !== 'string' || !question.pergunta.trim() ||
        !Array.isArray(question.alternativas) || question.alternativas.length < 2 ||
        question.alternativas.some((alternative: unknown) => typeof alternative !== 'string' || !alternative.trim()) ||
        !Number.isInteger(question.correta) || question.correta < 0 ||
        question.correta >= question.alternativas.length ||
        (question.comentario !== undefined && typeof question.comentario !== 'string')) {
      throw new Error(`Questão ${index + 1} inválida. Verifique id, pergunta, alternativas, correta e comentário.`);
    }
    if (ids.has(question.id)) {
      throw new Error(`O identificador ${question.id} está repetido no questionário.`);
    }
    ids.add(question.id);
    return { ...question, comentario: question.comentario ?? '' };
  });
}

export function validateQuizSettings(available: number, count: number, mode: QuizMode, minutes: number): string | null {
  if (available < 1) return 'Carregue um questionário antes de iniciar.';
  if (!Number.isInteger(count) || count < 1 || count > available) {
    return `Informe uma quantidade inteira entre 1 e ${available}.`;
  }
  if (mode === QuizMode.TEST && (!Number.isSafeInteger(minutes * 60) || minutes < 1)) {
    return 'Informe um tempo válido de pelo menos 1 minuto, em segundos inteiros.';
  }
  return null;
}
