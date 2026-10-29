import { QuizMode, type Question } from '../../types/quiz.ts';

function isTextList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 &&
    value.every(item => typeof item === 'string' && item.trim().length > 0);
}

export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('O questionário deve ser um array com pelo menos uma questão.');
  }

  const ids = new Set<number>();
  return value.map((question, index) => {
    if (!question || !Number.isSafeInteger(question.id) ||
        typeof question.pergunta !== 'string' || !question.pergunta.trim() ||
        (question.comentario !== undefined && typeof question.comentario !== 'string')) {
      throw new Error(`Questão ${index + 1} inválida. Verifique id, pergunta e comentário.`);
    }
    if (question.tipo === 'associacao') {
      if (!isTextList(question.conceitos) || question.conceitos.length < 2 ||
          !isTextList(question.descricoes) ||
          !Array.isArray(question.correta) || question.correta.length !== question.descricoes.length ||
          !question.correta.every((answer: unknown) => answer === null ||
            typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer < question.conceitos.length) ||
          !question.conceitos.every((_: string, concept: number) => question.correta.filter((answer: unknown) => answer === concept).length === 1)) {
        throw new Error(`Questão ${index + 1}: associe cada conceito exatamente uma vez no gabarito. Use null para descrições sem correspondência.`);
      }
    } else if ((question.tipo !== undefined && question.tipo !== 'multipla_escolha') ||
        !isTextList(question.alternativas) || question.alternativas.length < 2 ||
        !Number.isInteger(question.correta) || question.correta < 0 || question.correta >= question.alternativas.length) {
      throw new Error(`Questão ${index + 1}: tipo, alternativas ou resposta correta inválidos.`);
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
