import assert from 'node:assert/strict';
import test from 'node:test';
import { loadJsonFile } from '../../src/services/loadJsonFile.ts';

test('loads JSON preserving the requested filename casing', async context => {
  context.mock.method(globalThis, 'fetch', async url => {
    assert.equal(url, '/QueimaSG/modelos/ModeloAssociacao.json');
    return new Response('[{"id":1}]', { headers: { 'content-type': 'application/json' } });
  });
  assert.deepEqual(await loadJsonFile('/QueimaSG/modelos/ModeloAssociacao.json'), [{ id: 1 }]);
});

test('explains HTML fallback responses even with HTTP 200', async context => {
  context.mock.method(globalThis, 'fetch', async () => new Response('<!doctype html><html></html>', {
    headers: { 'content-type': 'text/html' },
  }));
  await assert.rejects(loadJsonFile('missing.json'), /página HTML.*missing\.json/);
});

test('detects HTML even without a content type', async context => {
  context.mock.method(globalThis, 'fetch', async () => new Response('  <!doctype html>'));
  await assert.rejects(loadJsonFile('missing.json'), /página HTML/);
});

test('reports missing files and malformed JSON separately', async context => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  await assert.rejects(loadJsonFile('missing.json'), /HTTP 404/);
  fetchMock.mock.mockImplementation(async () => new Response('[{"id":}]'));
  await assert.rejects(loadJsonFile('broken.json'), /broken\.json contém JSON inválido/);
});
