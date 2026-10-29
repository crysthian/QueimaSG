# QueimaSG - Plataforma de estudos

Este site tem como objetivo ser uma plataforma de estudos para os alunos do curso de formação. Ele é construído utilizando o framework Vite, que é uma ferramenta de construção rápida e leve para projetos web modernos.

## Funcionalidades

- Estudo por meio de questionários.
- Modo Estudo e Modo Simulado (com tempo estilo prova online) para diferentes formas de aprendizado.
- Visualização no final do simulado: Porcentagem, quantidade de acertos e erros, bem como quais foram, opção de encerrar o simulado ou responder novamente as que foram erradas.
- Opção de upload de questionário no padrão específico ou seleção no banco do app(utilizando o nome do módulo).

## Tecnologias Utilizadas
- Vite: para construção e desenvolvimento do projeto.
- React: para a construção da interface do usuário.
- Tailwind CSS: para estilização rápida e eficiente.


### Padrão de questionário para upload
O questionário deve ser enviado em formato JSON seguindo o padrão abaixo:
```json
[
  {
    "id": 1,
    "pergunta": "Qual é a alternativa correta?",
    "alternativas": [
      "Alternativa A",
      "Alternativa B",
      "Alternativa C",
      "Alternativa D"
    ],
    "correta": 3,
    "comentario": "A alternativa correta é a D."
  }
]
```

Cada questão deve ter um `id` único. O campo `correta` usa índices começando em zero
(0 para A, 1 para B e assim por diante). O campo `comentario` é opcional.
Os arquivos devem conter JSON válido, sem comentários de código.

### Questões de associação por clique

O mesmo questionário pode misturar questões tradicionais e questões com `"tipo": "associacao"`.
As questões existentes continuam funcionando sem alteração. O exemplo abaixo pode ser salvo
em um arquivo JSON para upload.

```json
[
  {
    "id": 1,
    "tipo": "associacao",
    "pergunta": "Associe cada descrição ao conceito correspondente.",
    "conceitos": ["Conceito A", "Conceito B", "Conceito C"],
    "descricoes": [
      "Descrição correspondente ao Conceito B.",
      "Descrição correspondente ao Conceito A.",
      "Descrição sem correspondência com os conceitos apresentados.",
      "Outra descrição sem correspondência.",
      "Descrição correspondente ao Conceito C.",
      "Mais uma descrição sem correspondência."
    ],
    "correta": [1, 0, null, null, 2, null],
    "comentario": "Conceito A → descrição 2; Conceito B → descrição 1; Conceito C → descrição 5."
  }
]
```

- `conceitos`: opções exibidas como botões na coluna da esquerda.
- `descricoes`: itens que o aluno deve associar, na ordem de exibição.
- `correta`: um índice de `conceitos` para cada descrição, começando em **0**. Use `null` nas descrições que devem ficar em branco. No exemplo, `[1, 0, null, null, 2, null]` corresponde a **2 – 1 – — – — – 3 – —** na numeração exibida ao aluno.
- Cada conceito deve ser associado a exatamente uma descrição. Pode haver mais descrições do que conceitos; as restantes ficam em branco, sem exigir um clique extra.
- `comentario` é opcional. No modo Estudo, cada descrição mostra seu gabarito mesmo sem comentário.

O aluno clica em um conceito e depois em uma descrição. Para mover um conceito, basta selecioná-lo
e clicar em outra descrição; a associação anterior é removida automaticamente. Também há um botão
para remover uma associação. As escolhas são preservadas ao navegar. No modo Estudo, a verificação
exige todos os conceitos associados e bloqueia alterações após mostrar o gabarito. No Simulado, o gabarito fica oculto.
A questão vale um acerto quando **todas** as associações estão corretas; questões incompletas
ou com algum erro entram na opção de refazer questões erradas.

O exemplo associa três conceitos a três das seis descrições e mantém as restantes em branco.
A conversão dos questionários antigos para esse formato é manual.

### Verificação local

Com Node.js 22.18+ (ou 24+), execute `npm test`, `npm run build` e `npm run lint`.

### Organização do código

- `src/App.tsx`: composição das telas e conexão com os hooks.
- `src/components/layout/`: cabeçalho da aplicação.
- `src/components/quiz/`: configuração, apresentação das questões e resultados.
- `src/hooks/`: estado do simulado, cronômetro e preferência de tema.
- `src/domain/quiz/`: regras de respostas, validação, sessão e catálogo de questionários.
- `src/services/`: carregamento de arquivos JSON.
- `src/types/`: tipos compartilhados da aplicação.
- `src/styles/`: estilos globais e configuração do tema no Tailwind.
- `src/config/`: metadados da aplicação.
- `public/questionarios/`: índice (`index.json`) e arquivos dos questionários.
- `public/modelos/`: modelos JSON para criar novos questionários.
- `tests/domain/`: testes das regras do simulado e do catálogo.
- `tests/services/`: testes do carregamento dos arquivos.

### Cadastro no banco do app

Coloque o questionário em `public/questionarios/` e cadastre-o em `public/questionarios/index.json`.
O campo `id` deve ser o nome exato do arquivo **sem `.json`**, preservando maiúsculas e minúsculas:

```json
[
  { "id": "disciplina-a", "nome": "Disciplina A" },
  { "id": "DisciplinaB", "nome": "Disciplina B" }
]
```

Nesse exemplo, crie os arquivos `public/questionarios/disciplina-a.json` e `public/questionarios/DisciplinaB.json`, respectivamente.
O campo `nome` é apenas o texto exibido no seletor. Se o servidor devolver HTML em vez de JSON,
confira o nome e a existência do arquivo; após publicar, confirme que a versão publicada inclui o arquivo.
