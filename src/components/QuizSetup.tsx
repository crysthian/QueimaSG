
import React, { useState } from 'react';
import { QuizMode, type Question } from '../../types';

interface QuizSetupProps {
  onStart: (questions: Question[], mode: QuizMode, timeLimit: number, count: number) => void;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    pergunta: "Qual é a principal função do React?",
    alternativas: [
      "Manipular bancos de dados SQL",
      "Construir interfaces de usuário",
      "Estilizar páginas com CSS",
      "Gerenciar servidores Apache"
    ],
    correta: 1,
    comentario: "O React é uma biblioteca JavaScript de código aberto com foco em criar interfaces de usuário em páginas web."
  },
  {
    id: 2,
    pergunta: "O que é o Virtual DOM?",
    alternativas: [
      "Uma cópia física do navegador",
      "Um plugin do VS Code",
      "Uma representação leve do DOM real em memória",
      "Um banco de dados de alta performance"
    ],
    correta: 2,
    comentario: "O Virtual DOM permite que o React atualize apenas as partes necessárias da página, melhorando a performance."
  }
];

type ImportMethod = 'upload' | 'discipline';

export const QuizSetup: React.FC<QuizSetupProps> = ({ onStart }) => {
  const [mode, setMode] = useState<QuizMode>(QuizMode.STUDY);
  const [time, setTime] = useState(15);
  const [count, setCount] = useState(10);
  const [fileContent, setFileContent] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod>('upload');
  const [disciplineName, setDisciplineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          processLoadedQuestions(json);
        } else {
          setError("O arquivo JSON deve ser um array de questões.");
        }
      } catch (e) {
        setError("Erro ao ler o arquivo JSON. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDiscipline = async () => {
    if (!disciplineName.trim()) {
      setError("Por favor, digite o nome da disciplina.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`public/${disciplineName.toLowerCase().trim()}.json`);
      if (!response.ok) {
        throw new Error("Arquivo da disciplina não encontrado no servidor.");
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        processLoadedQuestions(json);
      } else {
        setError("O arquivo da disciplina deve ser um array de questões.");
      }
    } catch (err) {
      setError("Não foi possível carregar a disciplina. Verifique se o arquivo existe na pasta do app.");
    } finally {
      setIsLoading(false);
    }
  };

  const processLoadedQuestions = (questions: Question[]) => {
    setFileContent(questions);
    setCount(questions.length);
    setError(null);
  };

  const handleStart = () => {
    const questions = fileContent || DEFAULT_QUESTIONS;
    onStart(questions, mode, time, count);
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
              onClick={() => { setImportMethod('upload'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${importMethod === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Upload Local
            </button>
            <button
              onClick={() => { setImportMethod('discipline'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${importMethod === 'discipline' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Banco do App
            </button>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            {importMethod === 'upload' ? (
              <div className="space-y-3">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 cursor-pointer transition-all"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: matematica, historia..."
                    value={disciplineName}
                    onChange={(e) => setDisciplineName(e.target.value)}
                    className={`${inputBaseStyles} py-2.5 text-sm`}
                  />
                  <button 
                    onClick={handleLoadDiscipline}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    {isLoading ? '...' : 'Carregar'}
                  </button>
                </div>
              </div>
            )}
            
            {error && <p className="mt-3 text-xs text-red-500 font-medium">{error}</p>}
            {fileContent && !error && (
              <p className="mt-3 text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {fileContent.length} questões prontas para uso.
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
              max={fileContent?.length || 10}
              min={1}
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              className={inputBaseStyles}
            />
          </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
        >
          Iniciar Simulado
        </button>
      </div>
    </div>
  );
};
