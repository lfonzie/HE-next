// lib/system-prompts/lessons.ts

export const LESSON_CREATION_PROMPT = `You are a teacher creating interactive lesson plans. Respond in strict JSON with fields: title, subject, level, objective, outline[], cards[]. 

Each card must have a "type" from: reading, math, quiz, flashcards, video, code, whiteboard, assignment.

For "reading" cards, use "html" field (clean HTML, no <script> tags).
For "math" cards, use "latex" field with LaTeX expressions.
For "quiz" cards, include question, choices[], correctIndex, explanation.
For "flashcards" cards, include items[] with front/back pairs.
For "video" cards, include provider ("youtube", "vimeo", "url") and src.
For "code" cards, include language, starter code, and optional tests.
For "whiteboard" cards, just include the type.
For "assignment" cards, include prompt and optional rubric.

Create 3-8 cards that progressively build understanding of the topic.`;

export const LESSON_TYPES = {
  reading: {
    description: "Conteúdo textual com HTML seguro",
    fields: ["title", "html"]
  },
  math: {
    description: "Expressões matemáticas em LaTeX",
    fields: ["title", "latex"]
  },
  quiz: {
    description: "Perguntas de múltipla escolha",
    fields: ["title", "question", "choices", "correctIndex", "explanation"]
  },
  flashcards: {
    description: "Cartões de estudo com frente e verso",
    fields: ["title", "items"]
  },
  video: {
    description: "Conteúdo em vídeo",
    fields: ["title", "provider", "src"]
  },
  code: {
    description: "Exercícios de programação",
    fields: ["title", "language", "starterCode", "tests"]
  },
  whiteboard: {
    description: "Quadro branco interativo",
    fields: ["title"]
  },
  assignment: {
    description: "Tarefas e projetos",
    fields: ["title", "prompt", "rubric"]
  }
};

export const LESSON_DIFFICULTY_LEVELS = {
  beginner: {
    description: "Conteúdo básico para iniciantes",
    characteristics: ["Conceitos fundamentais", "Exemplos simples", "Linguagem clara"]
  },
  intermediate: {
    description: "Conteúdo intermediário",
    characteristics: ["Conceitos mais complexos", "Aplicações práticas", "Análise moderada"]
  },
  advanced: {
    description: "Conteúdo avançado",
    characteristics: ["Conceitos complexos", "Análise crítica", "Aplicações avançadas"]
  }
};

export const LESSON_SUBJECTS = [
  "Matemática",
  "Física", 
  "Química",
  "Biologia",
  "História",
  "Geografia",
  "Português",
  "Literatura",
  "Inglês",
  "Espanhol",
  "Filosofia",
  "Sociologia",
  "Artes",
  "Educação Física",
  "Informática",
  "Economia",
  "Psicologia",
  "Medicina",
  "Engenharia",
  "Direito"
];
