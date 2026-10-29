export async function loadJsonFile(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${url} (HTTP ${response.status}). Verifique se o arquivo existe e se o nome está correto, incluindo maiúsculas e minúsculas.`);
  }

  const text = await response.text();
  if (response.headers.get('content-type')?.includes('text/html') || text.trimStart().startsWith('<')) {
    throw new Error(`O servidor retornou uma página HTML em vez de ${url}. Verifique se o arquivo está na pasta public e se o id no índice corresponde ao nome do arquivo, incluindo maiúsculas e minúsculas.`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`O arquivo ${url} contém JSON inválido. Verifique vírgulas, aspas e colchetes.`);
  }
}
