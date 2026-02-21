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
    "id": 1, // Identificador/Número da questão
    "pergunta": "Loren ipsum dolor sit amet?", // Texto da pergunta
    "alternativas": [
      "Loren ipsum dolor sit amet, consectetur adipiscing elit.", // Alternativa A
      "Loren ipsum dolor sit amet", // Alternativa B
      "Loren ipsum", // Alternativa C
      "Loren ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." // Alternativa D
    ],
    "correta": 3, // Índice da alternativa correta (0 para A, 1 para B, 2 para C, 3 para D)
    "comentario": "A alternativa correta é a **D**." // Comentário explicativo para a resposta correta (opcional)
  }
]
```
