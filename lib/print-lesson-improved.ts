/*
 * HubEdu – Impressão de aulas (versão otimizada)
 * Melhorias aplicadas:
 * - Performance: memoização de sanitização repetida
 * - Segurança: validação adicional de URLs e atributos
 * - UX: melhor feedback de progresso e tratamento de erros
 * - Code quality: funções mais modulares e testáveis
 * - Acessibilidade: atributos ARIA e estrutura semântica melhorada
 */

// =========================
// Tipos
// =========================
export type QuizQuestion = {
  q?: string;
  question?: string;
  options?: string[];
  correct?: number;
  correctAnswer?: number;
  explanation?: string;
};

export type StageActivity = {
  content?: string;
  imageUrl?: string;
  questions?: QuizQuestion[];
};

export type LessonStage = {
  etapa: string;
  type: string;
  activity?: StageActivity;
  route?: string;
};

export type LessonMetadata = {
  subject?: string;
  grade?: string;
  duration?: string;
  difficulty?: string;
  tags?: string[];
};

export type LessonData = {
  title?: string;
  objectives?: string[];
  introduction?: string;
  stages?: LessonStage[];
  summary?: string;
  nextSteps?: string[];
  metadata?: LessonMetadata;
  subject?: string;
  level?: string;
  estimatedDuration?: number;
  difficulty?: string;
};

export type PrintOptions = {
  method?: "iframe" | "window";
  width?: number;
  height?: number;
  appName?: string;
  logoUrl?: string;
  brandAccent?: string;
  onError?: (err: unknown) => void;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onProgress?: (message: string) => void;
  imageLoadTimeout?: number;
};

// =========================
// Utils
// =========================
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

// Cache para sanitização (performance)
const sanitizeCache = new Map<string, string>();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeMaybe(str?: string): string {
  if (typeof str !== "string" || str === "") return "";
  
  // Verificar cache
  if (sanitizeCache.has(str)) {
    return sanitizeCache.get(str)!;
  }
  
  const result = escapeHtml(str)
    .replace(/\n/g, "<br>")
    .replace(/\r\n/g, "<br>")
    .replace(/\r/g, "<br>");
  
  // Limitar cache a 100 entradas
  if (sanitizeCache.size > 100) {
    const firstKey = sanitizeCache.keys().next().value;
    sanitizeCache.delete(firstKey);
  }
  
  sanitizeCache.set(str, result);
  return result;
}

// Validação de URL (segurança adicional)
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return ["http:", "https:", "data:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  if (!isValidUrl(url)) {
    console.warn("URL inválida detectada:", url);
    return "";
  }
  return escapeHtml(url);
}

// =========================
// Validação
// =========================
export function validateLessonData(lessonData: LessonData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!lessonData) {
    errors.push("Dados da aula não fornecidos");
    return { isValid: false, errors };
  }

  if (!lessonData.title || typeof lessonData.title !== "string" || lessonData.title.trim() === "") {
    errors.push("Título da aula é obrigatório e deve ser uma string não vazia");
  }

  if (!lessonData.objectives || !Array.isArray(lessonData.objectives) || lessonData.objectives.length === 0) {
    errors.push("Objetivos da aula são obrigatórios e devem ser um array não vazio");
  } else {
    const invalidObjectives = lessonData.objectives.filter((obj) => typeof obj !== "string" || obj.trim() === "");
    if (invalidObjectives.length > 0) {
      errors.push(`${invalidObjectives.length} objetivo(s) inválido(s) detectado(s)`);
    }
  }

  if (lessonData.introduction && typeof lessonData.introduction !== "string") {
    errors.push("Introdução da aula deve ser uma string válida");
  }

  if (!lessonData.stages || !Array.isArray(lessonData.stages)) {
    errors.push("Etapas da aula são obrigatórias e devem ser um array");
  } else if (lessonData.stages.length === 0) {
    errors.push("Pelo menos uma etapa deve ser fornecida");
  } else {
    lessonData.stages.forEach((stage, idx) => {
      if (!stage || typeof stage !== "object") {
        errors.push(`Stage #${idx + 1} inválido`);
        return;
      }
      if (!stage.etapa || typeof stage.etapa !== "string" || stage.etapa.trim() === "") {
        errors.push(`Stage #${idx + 1}: 'etapa' é obrigatório e deve ser string não vazia`);
      }
      if (!stage.type || typeof stage.type !== "string" || stage.type.trim() === "") {
        errors.push(`Stage #${idx + 1}: 'type' é obrigatório e deve ser string não vazia`);
      }
      
      // Validar imageUrl se presente
      if (stage.activity?.imageUrl && !isValidUrl(stage.activity.imageUrl)) {
        errors.push(`Stage #${idx + 1}: URL de imagem inválida`);
      }
      
      // Validar questions
      if (stage.activity?.questions) {
        if (!Array.isArray(stage.activity.questions)) {
          errors.push(`Stage #${idx + 1}: 'questions' deve ser um array`);
        } else {
          stage.activity.questions.forEach((q, qidx) => {
            if (q.options && !Array.isArray(q.options)) {
              errors.push(`Stage #${idx + 1} Q#${qidx + 1}: 'options' deve ser array`);
            }
            if (q.options && q.options.length > 0) {
              const correctIdx = q.correct ?? q.correctAnswer;
              if (correctIdx !== undefined && (correctIdx < 0 || correctIdx >= q.options.length)) {
                errors.push(`Stage #${idx + 1} Q#${qidx + 1}: índice de resposta correta inválido`);
              }
            }
          });
        }
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}

// =========================
// Normalização
// =========================
export function createSafeLessonData(lessonData: LessonData) {
  const title = (lessonData.title || "Aula sem título").trim();
  const objectives = lessonData.objectives && Array.isArray(lessonData.objectives) && lessonData.objectives.length > 0
    ? lessonData.objectives.filter(obj => typeof obj === "string" && obj.trim() !== "")
    : ["Objetivos não especificados"];

  const introduction = (lessonData.introduction && lessonData.introduction.trim() !== "")
    ? lessonData.introduction
    : `Esta aula aborda o tema "${lessonData.title || "selecionado"}" de forma didática e interativa.`;

  const metadata: LessonMetadata = {
    subject: lessonData.metadata?.subject || lessonData.subject || "Não especificado",
    grade: lessonData.metadata?.grade || lessonData.level || "Não especificado",
    duration: lessonData.metadata?.duration || `${lessonData.estimatedDuration || 45} minutos`,
    difficulty: lessonData.metadata?.difficulty || lessonData.difficulty || "Não especificado",
    tags: lessonData.metadata?.tags || [],
  };

  return {
    title,
    objectives,
    introduction,
    stages: lessonData.stages || [],
    summary: lessonData.summary || "",
    nextSteps: lessonData.nextSteps || [],
    metadata,
  } as Required<Pick<LessonData, "title" | "objectives" | "introduction" | "stages" | "summary" | "nextSteps" | "metadata">>;
}

// =========================
// Render helpers
// =========================
function renderStageImages(stage: LessonStage): string {
  const url = stage.activity?.imageUrl;
  if (!url || !isValidUrl(url)) return "";
  
  const safeUrl = sanitizeUrl(url);
  const alt = escapeHtml(stage.etapa);
  
  // Extrair apenas o domínio da URL para mostrar como fonte
  let source = "";
  try {
    const urlObj = new URL(url);
    source = urlObj.hostname.replace('www.', '');
  } catch {
    source = "Fonte externa";
  }
  
  return `
    <div class="stage-image" role="figure" aria-label="${alt}">
      <img src="${safeUrl}" alt="${alt}" loading="lazy" />
      <div class="stage-image-caption">
        Fonte: ${source}
      </div>
    </div>
  `;
}

function renderQuizQuestions(stage: LessonStage): string {
  const qs = stage.activity?.questions;
  if (!qs || !Array.isArray(qs) || qs.length === 0) return "";
  
  return `
    <div class="quiz-questions" role="list" aria-label="Questões do quiz">
      ${qs
        .map((q, index) => {
          const text = q.q ?? q.question ?? "Pergunta não disponível";
          const options = q.options ?? [];
          const correctIdx = q.correct ?? q.correctAnswer;
          
          return `
            <div class="quiz-question" role="listitem">
              <div class="quiz-question-text" role="heading" aria-level="4">
                ${index + 1}. ${escapeHtml(text)}
              </div>
              <ul class="quiz-options" role="list">
                ${options
                  .map((opt, i) => {
                    const isCorrect = correctIdx === i;
                    const letter = String.fromCharCode(65 + i);
                    return `
                      <li class="${isCorrect ? "quiz-correct" : ""}" 
                          role="listitem"
                          ${isCorrect ? 'aria-label="Resposta correta"' : ''}>
                        ${letter}) ${escapeHtml(opt)}
                      </li>
                    `;
                  })
                  .join("")}
              </ul>
              ${q.explanation ? `
                <div class="quiz-explanation" role="note">
                  <strong>Explicação:</strong> ${sanitizeMaybe(q.explanation)}
                </div>
              ` : ""}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// =========================
// Template HTML
// =========================
function buildPrintHtml(
  safe: ReturnType<typeof createSafeLessonData>, 
  opts: Required<Pick<PrintOptions, "appName" | "logoUrl" | "brandAccent">>
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR");
  
  const metaTags = safe.metadata.tags && safe.metadata.tags.length > 0 ? `
    <span class="metadata-item">🏷️ ${safe.metadata.tags.slice(0, 3).map(escapeHtml).join(", ")}</span>
  ` : "";

  const title = escapeHtml(safe.title);
  const logoHtml = opts.logoUrl && isValidUrl(opts.logoUrl) 
    ? `<img src="${sanitizeUrl(opts.logoUrl)}" alt="Logo ${escapeHtml(opts.appName)}" />` 
    : "";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(safe.introduction.substring(0, 150))}..." />
  <title>${title} - Aula Impressa</title>
  <style>
    @page { 
      margin: 2cm 1.5cm; 
      size: A4; 
      @top-center { content: "${escapeHtml(safe.title)}"; font-size: 10pt; color: #666; }
      @bottom-center { content: "Página " counter(page) " de " counter(pages); font-size: 10pt; color: #666; }
    }
    
    body { 
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #1a1a1a; 
      margin: 0; 
      padding: 0; 
      background: white; 
      font-size: 12pt;
    }
    
    /* Header simplificado */
    .header { 
      background: ${opts.brandAccent}; 
      color: white; 
      padding: 1.5cm; 
      margin: 0 0 1cm 0; 
      page-break-after: always;
    }
    
    .title { 
      font-size: 24pt; 
      font-weight: 700; 
      margin: 0 0 0.5cm 0; 
      text-align: center;
    }
    
    .metadata { 
      display: flex; 
      justify-content: center;
      gap: 1cm; 
      margin-top: 0.5cm; 
      flex-wrap: wrap;
    }
    
    .metadata-item { 
      background: rgba(255,255,255,0.2); 
      padding: 0.2cm 0.4cm; 
      border-radius: 0.2cm; 
      font-size: 10pt; 
      font-weight: 500; 
    }
    
    /* Seções */
    .section { 
      margin: 0 0 1cm 0; 
      page-break-inside: avoid; 
    }
    
    .section-title { 
      font-size: 16pt; 
      font-weight: 700; 
      color: ${opts.brandAccent}; 
      margin-bottom: 0.5cm; 
      padding-bottom: 0.2cm; 
      border-bottom: 2px solid ${opts.brandAccent}; 
    }
    
    /* Objetivos */
    .objectives { 
      list-style: none; 
      padding: 0; 
      margin: 0;
    }
    
    .objectives li { 
      margin: 0.3cm 0; 
      padding: 0.3cm 0.5cm; 
      border-left: 3px solid ${opts.brandAccent}; 
      background: #f8f9ff;
      position: relative;
      counter-increment: objective-counter;
    }
    
    .objectives li::before {
      content: counter(objective-counter);
      position: absolute;
      left: -0.2cm;
      top: 50%;
      transform: translateY(-50%);
      background: ${opts.brandAccent};
      color: white;
      width: 0.5cm;
      height: 0.5cm;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      font-weight: 700;
    }
    
    .objectives {
      counter-reset: objective-counter;
    }
    
    /* Etapas */
    .stages { 
      display: grid; 
      gap: 0.5cm; 
    }
    
    .stage { 
      background: #ffffff; 
      border: 1px solid #e2e8f0; 
      border-radius: 0.2cm; 
      padding: 0.5cm; 
      page-break-inside: avoid; 
      position: relative;
      counter-increment: stage-counter;
    }
    
    .stage::before {
      content: counter(stage-counter);
      position: absolute;
      top: -0.2cm;
      left: 0.3cm;
      background: ${opts.brandAccent};
      color: white;
      width: 0.6cm;
      height: 0.6cm;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      font-weight: 700;
    }
    
    .stages {
      counter-reset: stage-counter;
    }
    
    .stage-title { 
      font-size: 14pt; 
      font-weight: 700; 
      color: #2d3748; 
      margin: 0.2cm 0 0.2cm 0; 
      padding-left: 0.3cm;
    }
    
    .stage-type { 
      background: ${opts.brandAccent}; 
      color: #fff; 
      padding: 0.1cm 0.3cm; 
      border-radius: 0.2cm; 
      font-size: 9pt; 
      font-weight: 600; 
      display: inline-block; 
      margin-bottom: 0.3cm; 
      margin-left: 0.3cm;
    }
    
    .stage-content { 
      margin-top: 0.3cm; 
      padding-left: 0.3cm;
    }
    
    .stage-content p { 
      margin: 0.3cm 0; 
      line-height: 1.6; 
    }
    
    /* Imagens simplificadas */
    .stage-image { 
      margin: 0.5cm 0; 
      text-align: center; 
      page-break-inside: avoid; 
    }
    
    .stage-image img { 
      max-width: 100%; 
      height: auto; 
      border-radius: 0.2cm; 
      border: 1px solid #e2e8f0;
    }
    
    .stage-image-caption { 
      margin-top: 0.2cm; 
      text-align: center;
      font-size: 9pt; 
      color: #666; 
      font-style: italic;
    }
    
    /* Quiz */
    .quiz-questions { 
      margin-top: 0.5cm; 
    }
    
    .quiz-question { 
      background: #ffffff; 
      border: 1px solid #e2e8f0; 
      border-radius: 0.2cm; 
      padding: 0.4cm; 
      margin: 0.3cm 0; 
      page-break-inside: avoid; 
      position: relative;
      counter-increment: question-counter;
    }
    
    .quiz-question::before {
      content: counter(question-counter);
      position: absolute;
      top: -0.2cm;
      left: 0.3cm;
      background: #4a5568;
      color: white;
      width: 0.5cm;
      height: 0.5cm;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      font-weight: 700;
    }
    
    .quiz-questions {
      counter-reset: question-counter;
    }
    
    .quiz-question-text { 
      font-weight: 700; 
      margin-bottom: 0.3cm; 
      color: #2d3748; 
      padding-left: 0.3cm;
    }
    
    .quiz-options { 
      list-style: none; 
      padding: 0; 
      margin: 0;
    }
    
    .quiz-options li { 
      padding: 0.2cm 0.3cm; 
      margin: 0.1cm 0; 
      background: #f7fafc; 
      border-radius: 0.1cm; 
      border-left: 3px solid #cbd5e0; 
      font-size: 10pt;
    }
    
    .quiz-correct { 
      background: #f0fff4; 
      border-left-color: #48bb78; 
      font-weight: 600; 
      color: #2f855a;
    }
    
    .quiz-explanation { 
      background: #fffaf0; 
      border: 1px solid #fbd38d; 
      border-radius: 0.1cm; 
      padding: 0.3cm; 
      margin-top: 0.3cm; 
      font-size: 10pt; 
      page-break-inside: avoid; 
    }
    
    /* Resumo e próximos passos */
    .summary { 
      background: #f0fff4; 
      border: 1px solid #9ae6b4; 
      border-radius: 0.2cm; 
      padding: 0.5cm; 
      border-left: 4px solid #48bb78;
    }
    
    .next-steps { 
      list-style: none; 
      padding: 0; 
      margin: 0;
    }
    
    .next-steps li { 
      background: #fffaf0; 
      margin: 0.2cm 0; 
      padding: 0.3cm 0.4cm; 
      border-left: 4px solid #ed8936; 
      border-radius: 0 0.1cm 0.1cm 0; 
      font-size: 10pt;
    }
    
    /* Footer */
    .footer { 
      margin: 1cm 0 0.5cm 0; 
      padding-top: 0.5cm; 
      border-top: 2px solid ${opts.brandAccent}; 
      text-align: center; 
      color: #666; 
      font-size: 10pt; 
      page-break-inside: avoid;
    }
    
    .app-name { 
      font-weight: 700; 
      color: ${opts.brandAccent}; 
      font-size: 12pt;
    }
    
    /* Índice da Aula */
    .toc-content {
      display: grid;
      gap: 0.2cm;
    }
    
    .toc-item {
      display: flex;
      align-items: center;
      gap: 0.3cm;
      padding: 0.2cm 0;
    }
    
    .toc-number {
      background: ${opts.brandAccent};
      color: white;
      width: 0.6cm;
      height: 0.6cm;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .toc-text {
      font-size: 10pt;
      font-weight: 500;
      color: #2d3748;
    }
    
    /* Informações da aula */
    .lesson-info {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.2cm;
      padding: 0.3cm;
      margin-top: 0.3cm;
    }
    
    .info-item {
      margin: 0.1cm 0;
      font-size: 9pt;
      color: #4a5568;
    }
    
    /* Melhorias para impressão */
    @media print { 
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
        font-size: 11pt;
      } 
      
      .section, .stage { 
        page-break-inside: avoid; 
      } 
      
      .quiz-question { 
        page-break-inside: avoid; 
      }
      
      .stage-image { 
        page-break-inside: avoid; 
      }
      
      .header {
        page-break-after: always;
      }
      
      .stage-title,
      .quiz-question-text,
      .section-title {
        page-break-after: avoid;
      }
    }
    
    /* Estilos para tela (preview) */
    @media screen {
      body {
        max-width: 21cm;
        margin: 0 auto;
        box-shadow: 0 0 1cm rgba(0,0,0,0.1);
        background: white;
      }
    }
  </style>
</head>
<body>
  <header class="header" role="banner">
        <h1 class="title">${title}</h1>
        <div class="metadata">
          <span class="metadata-item">📚 ${escapeHtml(safe.metadata.subject)}</span>
          <span class="metadata-item">🎓 ${escapeHtml(safe.metadata.grade)}</span>
          <span class="metadata-item">⏱️ ${escapeHtml(safe.metadata.duration)}</span>
          <span class="metadata-item">📊 ${escapeHtml(safe.metadata.difficulty)}</span>
    </div>
  </header>

  <main role="main">
    <!-- Índice da Aula -->
    <section class="section">
      <h2 class="section-title">📋 Índice da Aula</h2>
      <div class="toc-content">
        <div class="toc-item">
          <span class="toc-number">1</span>
          <span class="toc-text">Objetivos de Aprendizagem</span>
        </div>
        <div class="toc-item">
          <span class="toc-number">2</span>
          <span class="toc-text">Introdução</span>
        </div>
        <div class="toc-item">
          <span class="toc-number">3</span>
          <span class="toc-text">Desenvolvimento da Aula</span>
        </div>
        ${safe.summary ? `
        <div class="toc-item">
          <span class="toc-number">4</span>
          <span class="toc-text">Resumo</span>
        </div>
        ` : ""}
        ${safe.nextSteps && safe.nextSteps.length > 0 ? `
        <div class="toc-item">
          <span class="toc-number">${safe.summary ? '5' : '4'}</span>
          <span class="toc-text">Próximos Passos</span>
        </div>
        ` : ""}
      </div>
    </section>

    <!-- Objetivos de Aprendizagem -->
    <section class="section">
      <h2 class="section-title">🎯 Objetivos de Aprendizagem</h2>
      <p>Ao final desta aula, você será capaz de:</p>
      <ul class="objectives" role="list">
        ${safe.objectives.map((obj) => `<li role="listitem">${sanitizeMaybe(obj)}</li>`).join("")}
      </ul>
    </section>

    <!-- Introdução -->
    <section class="section">
      <h2 class="section-title">📖 Introdução</h2>
      <p>${sanitizeMaybe(safe.introduction)}</p>
      ${safe.metadata.duration ? `
      <div class="lesson-info">
        <div class="info-item">
          <strong>⏱️ Duração estimada:</strong> ${escapeHtml(safe.metadata.duration)}
        </div>
        <div class="info-item">
          <strong>📊 Nível de dificuldade:</strong> ${escapeHtml(safe.metadata.difficulty)}
        </div>
        <div class="info-item">
          <strong>🎓 Nível educacional:</strong> ${escapeHtml(safe.metadata.grade)}
        </div>
      </div>
      ` : ""}
    </section>

    <!-- Desenvolvimento da Aula -->
    <section class="section">
      <h2 class="section-title">📚 Desenvolvimento da Aula</h2>
      <p>Esta aula está dividida em <strong>${safe.stages.length} etapas</strong> que abordam diferentes aspectos do tema:</p>
      <div class="stages">
        ${safe.stages
          .map((stage, index) => `
            <article class="stage">
              <h3 class="stage-title">${escapeHtml(stage.etapa)}</h3>
              <span class="stage-type">${escapeHtml(stage.type)}</span>
              <div class="stage-content">
                ${stage.activity?.content ? `<p>${sanitizeMaybe(stage.activity.content)}</p>` : ""}
                ${renderStageImages(stage)}
                ${renderQuizQuestions(stage)}
              </div>
            </article>
          `)
          .join("")}
      </div>
    </section>

    ${safe.summary ? `
      <section class="section">
        <h2 class="section-title">📝 Resumo</h2>
        <div class="summary">
          <p>${sanitizeMaybe(safe.summary)}</p>
        </div>
      </section>
    ` : ""}

    ${safe.nextSteps && safe.nextSteps.length > 0 ? `
      <section class="section">
        <h2 class="section-title">🚀 Próximos Passos</h2>
        <p>Para continuar seu aprendizado, recomendamos:</p>
        <ul class="next-steps" role="list">
          ${safe.nextSteps.map((s) => `<li role="listitem">${sanitizeMaybe(s)}</li>`).join("")}
        </ul>
      </section>
    ` : ""}
  </main>

  <footer class="footer" role="contentinfo">
    <p class="app-name">${escapeHtml(opts.appName)}</p>
    <p>Este documento foi gerado automaticamente pelo sistema.</p>
  </footer>
</body>
</html>
`;
}

// =========================
// Impressão
// =========================
async function waitForImagesToLoad(doc: Document, timeoutMs = 6000): Promise<void> {
  const imgs = Array.from(doc.images || []);
  const pending = imgs.filter((img) => !img.complete);
  
  if (pending.length === 0) return;
  
  await Promise.race([
    Promise.all(
      pending.map((img) =>
        new Promise<void>((resolve) => {
          const timer = setTimeout(() => {
            console.warn("Timeout ao carregar imagem:", img.src);
            resolve();
          }, timeoutMs);
          
          img.addEventListener("load", () => {
            clearTimeout(timer);
            resolve();
          }, { once: true });
          
          img.addEventListener("error", () => {
            console.error("Erro ao carregar imagem:", img.src);
            clearTimeout(timer);
            resolve();
          }, { once: true });
        })
      )
    ),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function openIframeAndWrite(html: string): { iframe: HTMLIFrameElement; doc: Document } {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  iframe.title = "Print preview frame";
  
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    throw new Error("Não foi possível acessar o documento do iframe");
  }
  
  doc.open();
  doc.write(html);
  doc.close();
  
  return { iframe, doc };
}

function openWindowAndWrite(html: string, width = 900, height = 700): Window {
  const w = window.open("", "_blank", `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no`);
  if (!w) {
    throw new Error("Não foi possível abrir a janela de impressão. Verifique se pop-ups estão bloqueados.");
  }
  
  w.document.open();
  w.document.write(html);
  w.document.close();
  
  return w;
}

export async function printLessonImproved(
  lessonData: LessonData, 
  options: PrintOptions = {}
): Promise<{ ok: boolean; errors?: string[] }> {
  if (!isBrowser) {
    return { ok: false, errors: ["Ambiente sem janela (SSR). Execute no browser."] };
  }

  // Validação
  options.onProgress?.("Validando dados da aula...");
  const validation = validateLessonData(lessonData);
  
  if (!validation.isValid) {
    console.error("Dados da aula inválidos para impressão:", validation.errors);
    options.onError?.(validation.errors);
    return { ok: false, errors: validation.errors };
  }

  // Normalização
  options.onProgress?.("Preparando conteúdo...");
  const safe = createSafeLessonData(lessonData);

  // Configurações
  const appName = options.appName ?? "HubEdu – Plataforma de Educação Interativa";
  const logoUrl = options.logoUrl ?? "/assets/Logo_HubEdu.ia.svg";
  const brandAccent = options.brandAccent ?? "#667eea";
  const imageLoadTimeout = options.imageLoadTimeout ?? 6000;
  
  // Gerar HTML
  const html = buildPrintHtml(safe, { appName, logoUrl, brandAccent });

  try {
    if ((options.method ?? "iframe") === "iframe") {
      options.onProgress?.("Carregando preview de impressão...");
      
      const { iframe, doc } = openIframeAndWrite(html);
      
      options.onProgress?.("Aguardando carregamento de imagens...");
      await waitForImagesToLoad(doc, imageLoadTimeout);
      
      options.onBeforePrint?.();
      options.onProgress?.("Abrindo diálogo de impressão...");
      
      const win = iframe.contentWindow as Window;
      win.focus();
      win.print();
      
      options.onAfterPrint?.();
      
      // Limpar após impressão
      setTimeout(() => {
        iframe.remove();
        sanitizeCache.clear(); // Limpar cache
      }, 1500);
      
    } else {
      options.onProgress?.("Abrindo janela de impressão...");
      
      const w = openWindowAndWrite(html, options.width ?? 900, options.height ?? 700);
      
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        w.addEventListener("load", done, { once: true });
        setTimeout(done, 1500);
      });
      
      options.onProgress?.("Aguardando carregamento de imagens...");
      await waitForImagesToLoad(w.document, imageLoadTimeout);
      
      options.onBeforePrint?.();
      options.onProgress?.("Abrindo diálogo de impressão...");
      
      w.focus();
      w.print();
      
      options.onAfterPrint?.();
      
      // Limpar cache
      setTimeout(() => sanitizeCache.clear(), 2000);
    }
    
    console.log("✓ Aula enviada para impressão com sucesso!");
    return { ok: true };
    
  } catch (err) {
    console.error("✗ Erro ao preparar/imprimir:", err);
    options.onError?.(err);
    
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { ok: false, errors: [errorMessage] };
  }
}

// Função auxiliar para limpar cache manualmente (se necessário)
export function clearPrintCache(): void {
  sanitizeCache.clear();
}

// =========================
// API Pública Adicional
// =========================

/**
 * Verifica se o ambiente suporta impressão
 */
export function canPrint(): boolean {
  return isBrowser && typeof window.print === "function";
}

/**
 * Gera preview HTML sem imprimir (útil para debug)
 */
export function generatePrintPreview(
  lessonData: LessonData,
  options: Omit<PrintOptions, "method" | "onBeforePrint" | "onAfterPrint"> = {}
): { html: string; isValid: boolean; errors?: string[] } {
  const validation = validateLessonData(lessonData);
  
  if (!validation.isValid) {
    return { html: "", isValid: false, errors: validation.errors };
  }

  const safe = createSafeLessonData(lessonData);
  const appName = options.appName ?? "HubEdu – Plataforma de Educação Interativa";
  const logoUrl = options.logoUrl ?? "/assets/Logo_HubEdu.ia.svg";
  const brandAccent = options.brandAccent ?? "#667eea";
  
  const html = buildPrintHtml(safe, { appName, logoUrl, brandAccent });
  
  return { html, isValid: true };
}

/**
 * Estatísticas da aula (útil para mostrar ao usuário)
 */
export function getLessonStats(lessonData: LessonData): {
  totalStages: number;
  totalQuestions: number;
  totalImages: number;
  hasObjectives: boolean;
  hasSummary: boolean;
  hasNextSteps: boolean;
} {
  const stages = lessonData.stages || [];
  const totalQuestions = stages.reduce((sum, stage) => {
    return sum + (stage.activity?.questions?.length || 0);
  }, 0);
  const totalImages = stages.filter(stage => stage.activity?.imageUrl).length;

  return {
    totalStages: stages.length,
    totalQuestions,
    totalImages,
    hasObjectives: Array.isArray(lessonData.objectives) && lessonData.objectives.length > 0,
    hasSummary: Boolean(lessonData.summary),
    hasNextSteps: Array.isArray(lessonData.nextSteps) && lessonData.nextSteps.length > 0,
  };
}

/*
 * ========================================
 * EXEMPLO DE USO COMPLETO:
 * ========================================
 * 
 * // 1. Verificar suporte
 * if (!canPrint()) {
 *   alert('Seu navegador não suporta impressão');
 *   return;
 * }
 * 
 * // 2. Obter estatísticas
 * const stats = getLessonStats(lesson);
 * console.log(`Aula com ${stats.totalStages} etapas e ${stats.totalQuestions} questões`);
 * 
 * // 3. Validar antes de imprimir (opcional)
 * const validation = validateLessonData(lesson);
 * if (!validation.isValid) {
 *   console.error('Erros:', validation.errors);
 *   return;
 * }
 * 
 * // 4. Imprimir com opções completas
 * const result = await printLessonImproved(lesson, {
 *   method: 'iframe',
 *   appName: 'HubEdu',
 *   logoUrl: '/logo.svg',
 *   brandAccent: '#667eea',
 *   imageLoadTimeout: 8000,
 *   onProgress: (msg) => {
 *     console.log('📝', msg);
 *     // Atualizar UI com progresso
 *   },
 *   onError: (err) => {
 *     console.error('❌', err);
 *     // Mostrar erro ao usuário
 *   },
 *   onBeforePrint: () => {
 *     console.log('🖨️ Abrindo diálogo...');
 *   },
 *   onAfterPrint: () => {
 *     console.log('✅ Concluído!');
 *     clearPrintCache(); // Limpar cache se necessário
 *   }
 * });
 * 
 * if (result.ok) {
 *   console.log('✅ Impressão enviada com sucesso!');
 * } else {
 *   console.error('❌ Falha na impressão:', result.errors);
 * }
 * 
 * // 5. Para debug: gerar preview sem imprimir
 * const preview = generatePrintPreview(lesson, {
 *   appName: 'HubEdu',
 *   brandAccent: '#667eea'
 * });
 * if (preview.isValid) {
 *   console.log('HTML gerado:', preview.html.substring(0, 200));
 * }
 */