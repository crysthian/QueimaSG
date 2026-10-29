import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateQuestions, validateQuizSettings } from '../../src/domain/quiz/validation.ts';
import { isAnswerComplete, isAnswerCorrect, updateAssociationAnswer } from '../../src/domain/quiz/answers.ts';
import { validateDisciplineIndex } from '../../src/domain/quiz/catalog.ts';

const choice = { id: 1, pergunta: 'Escolha', alternativas: ['A', 'B'], correta: 0 };
const association = {
  id: 2, tipo: 'associacao', pergunta: 'Associe', conceitos: ['A', 'B'],
  descricoes: ['Primeira', 'Segunda', 'Terceira'], correta: [1, null, 0],
};

test('accepts mixed quizzes and legacy questions with optional comments', () => {
  const questions = validateQuestions([choice, association]);
  assert.equal(questions.length, 2);
  assert.equal(questions[0].comentario, '');
  assert.equal(isAnswerCorrect(questions[0], 0), true);
  assert.equal(isAnswerCorrect(questions[0], 1), false);
  assert.equal(isAnswerCorrect(questions[0], [0]), false);
});

test('association requires every concept exactly once and checks each pair including blanks', () => {
  assert.equal(isAnswerCorrect(association, [1, null, 0]), true);
  for (const answer of [undefined, 0, [], [1], [1, undefined, 0], new Array(3), [1, 0, 0], [1, 0, 1, 1], [1, 0, null]]) {
    assert.equal(isAnswerCorrect(association, answer), false);
  }
  assert.equal(isAnswerComplete(association, [1, 0, null]), true);
  assert.equal(isAnswerComplete(association, [1, 0, 0]), false);
  assert.equal(isAnswerComplete(association, [1, 0, 2]), false);
});

test('unused descriptions remain blank without requiring additional answers', () => {
  const question = { ...association, descricoes: ['1', '2', '3', '4', '5', '6'], correta: [1, null, null, null, 0, null] };
  assert.doesNotThrow(() => validateQuestions([question]));
  assert.equal(isAnswerCorrect(question, [1, null, null, null, 0, null]), true);
  assert.equal(isAnswerComplete(question, [1, null, null, null, null, null]), false);
  assert.equal(isAnswerComplete(question, [1, undefined, null, null, 0, null]), false);
});

test('changing a pair preserves the other choices without mutating the saved answer', () => {
  const first = updateAssociationAnswer(undefined, 3, 0, 1);
  const second = updateAssociationAnswer(first, 3, 2, 0);
  const third = updateAssociationAnswer(second, 3, 0, null);
  assert.deepEqual(first, [1, null, null]);
  assert.deepEqual(second, [1, null, 0]);
  assert.deepEqual(third, [null, null, 0]);
  assert.deepEqual(updateAssociationAnswer(second, 3, 1, 1), [null, 1, 0]);
  assert.deepEqual(updateAssociationAnswer(second, 3, 2, 1), [null, null, 1]);
});

test('rejects invalid quiz data and association mappings', () => {
  for (const value of [[], {}, [null], [choice, choice], [{ ...choice, correta: 2 }],
    [{ ...choice, tipo: 'outro' }], [{ ...association, conceitos: ['A'] }],
    [{ ...association, descricoes: [''] }], [{ ...association, correta: [1] }],
    [{ ...association, correta: [1, 0, 2] }], [{ ...association, correta: [1, 0, 0.5] }],
    [{ ...association, correta: [1, 1, 0] }], [{ ...association, correta: [1, null, null] }]]) {
    assert.throws(() => validateQuestions(value));
  }
});

test('incomplete and wrong associations are included when retaking mistakes', () => {
  const questions = validateQuestions([choice, association]);
  assert.deepEqual(questions.filter(q => !isAnswerCorrect(q, { 1: 0, 2: [1] }[q.id])).map(q => q.id), [2]);
  assert.deepEqual(questions.filter(q => !isAnswerCorrect(q, { 1: 0, 2: [1, null, 0] }[q.id])), []);
});

test('validates count and time settings', () => {
  for (const count of [0, -1, 1.5, 3, NaN, Infinity]) assert.ok(validateQuizSettings(2, count, 'test', 15));
  for (const time of [0, -1, NaN, Infinity]) assert.ok(validateQuizSettings(2, 1, 'test', time));
  assert.ok(validateQuizSettings(0, 1, 'study', 15));
  assert.equal(validateQuizSettings(2, 2, 'test', 15), null);
  assert.equal(validateQuizSettings(2, 1, 'study', 0), null);
});

test('all disciplines listed in the catalog and the association example remain valid', () => {
  const catalog = validateDisciplineIndex(JSON.parse(readFileSync(new URL('../../public/questionarios/index.json', import.meta.url), 'utf8')));
  const files = new Set([...catalog.map(discipline => `questionarios/${encodeURIComponent(discipline.id)}.json`), 'modelos/ModeloAssociacao.json']);
  for (const file of files) {
    const questions = validateQuestions(JSON.parse(readFileSync(new URL(`../../public/${file}`, import.meta.url), 'utf8')));
    assert.ok(questions.length > 0, file);
  }
});
