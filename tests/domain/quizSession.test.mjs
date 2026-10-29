import assert from 'node:assert/strict';
import test from 'node:test';
import { AppStatus, QuizMode } from '../../src/types/quiz.ts';
import { createInitialQuizState, retakeWrongQuestions, selectQuestions, updateQuizTime } from '../../src/domain/quiz/session.ts';
import { getDisciplineUrl, validateDisciplineIndex } from '../../src/domain/quiz/catalog.ts';

const questions = [
  { id: 1, pergunta: 'Escolha', alternativas: ['A', 'B'], correta: 0 },
  { id: 2, tipo: 'associacao', pergunta: 'Associe', conceitos: ['A', 'B'], descricoes: ['1', '2', '3'], correta: [1, null, 0] },
];

test('selecting questions preserves the source and never duplicates a question', () => {
  const original = structuredClone(questions);
  const selected = selectQuestions(questions, 1);
  assert.equal(selected.length, 1);
  assert.ok(questions.includes(selected[0]));
  assert.deepEqual(questions, original);
  assert.equal(new Set(selectQuestions(questions, 2).map(question => question.id)).size, 2);
});

test('retaking mistakes clears answers and restores the full time limit', () => {
  const state = { ...createInitialQuizState(), questions, status: AppStatus.FINISHED,
    mode: QuizMode.TEST, totalTime: 60, timeLeft: 0, currentIdx: 1, userAnswers: { 1: 0, 2: [1, null, null] } };
  const retake = retakeWrongQuestions(state);
  assert.deepEqual(retake.questions.map(question => question.id), [2]);
  assert.deepEqual(retake.userAnswers, {});
  assert.equal(retake.currentIdx, 0);
  assert.equal(retake.timeLeft, 60);
  assert.equal(retake.status, AppStatus.RUNNING);
  assert.equal(state.timeLeft, 0);
  assert.equal(retakeWrongQuestions({ ...state, userAnswers: { 1: 0, 2: [1, null, 0] } }).status, AppStatus.FINISHED);
});

test('timer uses a fixed deadline and catches up after delayed callbacks', () => {
  const state = { ...createInitialQuizState(), questions, status: AppStatus.RUNNING,
    mode: QuizMode.TEST, totalTime: 60, timeLeft: 60 };
  const firstTick = updateQuizTime(state, 60000, 1100);
  const delayedTick = updateQuizTime(firstTick, 60000, 15000);
  assert.equal(firstTick.timeLeft, 59);
  assert.equal(delayedTick.timeLeft, 45);
  const finished = updateQuizTime(delayedTick, 60000, 61000);
  assert.equal(finished.timeLeft, 0);
  assert.equal(finished.status, AppStatus.FINISHED);
  assert.equal(updateQuizTime(finished, 60000, 62000), finished);
  const study = { ...state, mode: QuizMode.STUDY };
  assert.equal(updateQuizTime(study, 60000, 61000), study);
});

test('catalog preserves filename casing and rejects missing fields or duplicate ids', () => {
  const catalog = [{ id: 'DisciplinaA', nome: 'Disciplina A' }];
  assert.deepEqual(validateDisciplineIndex(catalog), catalog);
  assert.equal(getDisciplineUrl('/app/', 'DisciplinaA'), '/app/questionarios/DisciplinaA.json');
  assert.equal(getDisciplineUrl('/app/', 'Disciplina A'), '/app/questionarios/Disciplina%20A.json');
  for (const value of [[], {}, [null], [{ id: '', nome: 'A' }], [{ id: 'a' }], [...catalog, ...catalog]]) {
    assert.throws(() => validateDisciplineIndex(value));
  }
});
