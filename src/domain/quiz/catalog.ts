export interface Discipline {
  id: string;
  nome: string;
}

export function validateDisciplineIndex(value: unknown): Discipline[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('O índice deve conter uma lista de disciplinas com id e nome preenchidos.');
  }

  const ids = new Set<string>();
  return value.map(item => {
    if (!item || typeof item.id !== 'string' || !item.id.trim() ||
        typeof item.nome !== 'string' || !item.nome.trim()) {
      throw new Error('O índice deve conter uma lista de disciplinas com id e nome preenchidos.');
    }
    if (ids.has(item.id)) {
      throw new Error(`A disciplina ${item.id} está repetida no índice.`);
    }
    ids.add(item.id);
    return { id: item.id, nome: item.nome };
  });
}

export function getDisciplineUrl(baseUrl: string, id: string): string {
  return `${baseUrl}questionarios/${encodeURIComponent(id.trim())}.json`;
}
