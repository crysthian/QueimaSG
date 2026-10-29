import React, { useState, useEffect } from 'react';
import { QuizMode, type Question } from '../../types/quiz';
import { validateQuestions, validateQuizSettings } from '../../domain/quiz/validation';
import { loadJsonFile } from '../../services/loadJsonFile';
import { getDisciplineUrl, validateDisciplineIndex, type Discipline } from '../../domain/quiz/catalog';

interface QuizSetupProps {
  onStart: (questions: Question[], mode: QuizMode, timeLimit: number, count: number) => void;
}

type ImportMethod = 'upload' | 'discipline';

export const QuizSetup: React.FC<QuizSetupProps> = ({ onStart }) => {
  const [mode, setMode] = useState<QuizMode>(QuizMode.STUDY);
  const [time, setTime] = useState(15);
  const [count, setCount] = useState(10);
  const [loadedQuestions, setLoadedQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod>('discipline');
  const [disciplineId, setDisciplineId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  // Carrega a lista de questionários disponíveis no servidor
  useEffect(() => {
    const loadDisciplines = async () => {
      try {
        const data = await loadJsonFile(`${import.meta.env.BASE_URL}questionarios/index.json`);
        const disciplines = validateDisciplineIndex(data);
        setDisciplines(disciplines);
        setDisciplineId(disciplines[0].id);
      } catch (err) {
        console.error("Erro ao carregar índice de questionários", err);
        setError(err instanceof Error ? err.message : 'Falha ao carregar lista de disciplinas.');
      }
    };
    loadDisciplines();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadedQuestions(null);
    setError(null);
    setIsLoading(true);
    e.target.value = '';
    try {
      processLoadedQuestions(JSON.parse(await file.text()));
    } catch (error) {
      setError(error instanceof SyntaxError
        ? 'O arquivo contém JSON inválido. Verifique vírgulas, aspas e colchetes.'
        : error instanceof Error ? error.message : 'Não foi possível ler o arquivo selecionado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDiscipline = async () => {
    if (!disciplineId.trim()) {
      setError('Selecione uma disciplina.');
      return;
    }

    setIsLoading(true);
    setLoadedQuestions(null);
    setError(null);
    try {
      const json = await loadJsonFile(getDisciplineUrl(import.meta.env.BASE_URL, disciplineId));
      processLoadedQuestions(json);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível carregar a disciplina.');
    } finally {
      setIsLoading(false);
    }
  };

  const processLoadedQuestions = (value: unknown) => {
    const questions = validateQuestions(value);
    setLoadedQuestions(questions);
    setCount(questions.length);
    setError(null);
  };

  const handleStart = () => {
    if (isLoading) return;
    const validationError = validateQuizSettings(loadedQuestions?.length ?? 0, count, mode, time);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (loadedQuestions) onStart(loadedQuestions, mode, time, count);
  };

  const handleImportMethodChange = (method: ImportMethod) => {
    if (method !== importMethod) setLoadedQuestions(null);
    setImportMethod(method);
    setError(null);
  };

  const handleDisciplineChange = (id: string) => {
    setDisciplineId(id);
    setLoadedQuestions(null);
    setError(null);
  };

  const inputBaseStyles = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const disabledStyles = "disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">Prepare seu Simulado</h2>
        <p className="text-slate-500 dark:text-slate-400">Configure as opções abaixo para começar seus estudos.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8 transition-colors">

        {/* Origem das Questões */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Origem das Questões</label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              disabled={isLoading}
              onClick={() => handleImportMethodChange('discipline')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${importMethod === 'discipline' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Banco do App
            </button>
            <button
              disabled={isLoading}
              onClick={() => handleImportMethodChange('upload')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${importMethod === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Upload Local
            </button>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            {importMethod === 'upload' ? (
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  disabled={isLoading}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 cursor-pointer transition-all"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={disciplineId}
                    disabled={isLoading}
                    onChange={(e) => handleDisciplineChange(e.target.value)}
                    className={`${inputBaseStyles} py-2.5 text-sm cursor-pointer`}
                  >
                  {disciplines.length === 0 ? (
                    <option>Carregando questionário...</option>
                  ) : (
                    disciplines.map((quest) => (
                      <option key={quest.id} value={quest.id}>{quest.nome}</option>
                    ))
                  )}
                  </select>
                  <button
                    onClick={handleLoadDiscipline}
                    disabled={isLoading || !disciplineId}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    {isLoading ? '...' : 'Carregar'}
                  </button>
                </div>
              </div>
            )}

            {error && <p role="alert" className="mt-3 text-xs text-red-500 font-medium">{error}</p>}
            {loadedQuestions && !error && (
              <p className="mt-3 text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {loadedQuestions.length} questões prontas para uso.
              </p>
            )}
          </div>
        </div>

        {/* Modo de Atividade */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Modo de Atividade</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode(QuizMode.STUDY)}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${mode === QuizMode.STUDY ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
            >
              <span className={`font-bold ${mode === QuizMode.STUDY ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Modo Estudo</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Gabarito imediato e comentários durante a prova.</span>
            </button>
            <button
              onClick={() => setMode(QuizMode.TEST)}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${mode === QuizMode.TEST ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
            >
              <span className={`font-bold ${mode === QuizMode.TEST ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Modo Simulado</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tempo limite, sem dicas. Veja os resultados apenas no fim.</span>
            </button>
          </div>
        </div>

        {/* Ajustes de Parâmetros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Tempo Limite (min)</label>
            <input
              type="number"
              min={1}
              step={1}
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              disabled={mode === QuizMode.STUDY}
              className={`${inputBaseStyles} ${disabledStyles}`}
            />
            {mode === QuizMode.STUDY && <p className="text-[10px] text-slate-400 font-medium">Desativado em Modo Estudo</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Qtd. de Questões</label>
            <input
              type="number"
              max={loadedQuestions?.length ?? 0}
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={inputBaseStyles}
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={isLoading || !loadedQuestions}
          className="disabled:opacity-50 disabled:cursor-not-allowed w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
        >
          Iniciar Simulado
        </button>
      </div>
    </div>
  );
};
