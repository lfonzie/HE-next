# 📦 Módulos Embed - Sistema de Incorporação

## 📋 Visão Geral

O HubEdu permite que escolas autorizadas incorporem os módulos **ENEM** e **Redação** em seus próprios sites através de iframes, sem necessidade de autenticação.

### ⚠️ IMPORTANTE: Diferença entre URLs

- **`/enem` e `/redacao`**: Versões completas com autenticação (para usuários logados em hubedu.ia.br)
- **`/embed/enem` e `/embed/redacao`**: Versões para incorporação em iframe (SEM autenticação, apenas para domínios autorizados)

**Para incorporar no site da escola, use SEMPRE as URLs `/embed/*`**

## 🎯 Módulos Disponíveis

### 1. **Simulador ENEM Embed**
- **URL para iframe**: `https://hubedu.ia.br/embed/enem`
- **URL acesso direto**: `https://hubedu.ia.br/enem` (requer autenticação)
- **Funcionalidades**:
  - Simulados rápidos (15 questões)
  - Simulados oficiais completos (180 questões)
  - Questões reais do ENEM (2009-2023)
  - Personalização de áreas e dificuldade
  - Resultados detalhados com estatísticas

### 2. **Redação ENEM Embed**
- **URL para iframe**: `https://hubedu.ia.br/embed/redacao`
- **URL acesso direto**: `https://hubedu.ia.br/redacao` (requer autenticação)
- **Funcionalidades**:
  - Temas oficiais do ENEM
  - Editor de texto com contador de palavras
  - Timer opcional (simulando prova real)
  - Correção automática por IA
  - Feedback detalhado por competência

## 🔐 Configuração de Segurança

### Variáveis de Ambiente

#### Desenvolvimento (`.env.local`)
```bash
# Domínios autorizados (separados por vírgula)
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"

# Token opcional para validação adicional
EMBED_ACCESS_TOKEN=""

# Permitir todos em dev
EMBED_ALLOW_ALL_DEV="true"
```

#### Produção (Render ou `.env.production`)
```bash
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"
EMBED_ACCESS_TOKEN="seu-token-secreto-aqui"
EMBED_ALLOW_ALL_DEV="false"
```

### Como Funciona a Validação

1. **Validação por Domínio**: Apenas domínios listados em `EMBED_ALLOWED_DOMAINS` podem incorporar os módulos
2. **Validação por Token** (opcional): Header `x-embed-token` pode ser usado para autenticação adicional
3. **Modo Desenvolvimento**: Se `EMBED_ALLOW_ALL_DEV=true`, todos os domínios são permitidos em dev

## 🚀 Como Incorporar

### Exemplo Básico - ENEM

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador ENEM - Colégio OSE</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    .embed-container {
      width: 100%;
      height: 100vh;
      border: none;
    }
    
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <div class="embed-container">
    <iframe 
      src="https://hubedu.ia.br/embed/enem"
      title="Simulador ENEM"
      allow="fullscreen"
      loading="lazy"
    ></iframe>
  </div>
</body>
</html>
```

### Exemplo Básico - Redação

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redação ENEM - Colégio OSE</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    
    .embed-container {
      width: 100%;
      min-height: 100vh;
    }
    
    iframe {
      width: 100%;
      min-height: 800px;
      border: none;
    }
  </style>
</head>
<body>
  <div class="embed-container">
    <iframe 
      src="https://hubedu.ia.br/embed/redacao"
      title="Redação ENEM"
      allow="fullscreen"
      loading="lazy"
    ></iframe>
  </div>
</body>
</html>
```

### Exemplo Avançado - Com Mensagens PostMessage

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Módulos HubEdu - Integração Avançada</title>
  <style>
    .module-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    iframe {
      width: 100%;
      min-height: 800px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .module-selector {
      margin-bottom: 20px;
      text-align: center;
    }
    
    button {
      padding: 10px 20px;
      margin: 0 10px;
      font-size: 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="module-container">
    <div class="module-selector">
      <h2>Escolha o Módulo</h2>
      <button onclick="loadModule('enem')">📚 Simulador ENEM</button>
      <button onclick="loadModule('redacao')">✍️ Redação</button>
    </div>
    
    <div id="iframe-container"></div>
  </div>

  <script>
    function loadModule(module) {
      const container = document.getElementById('iframe-container');
      const url = `https://hubedu.ia.br/embed/${module}`;
      
      container.innerHTML = `
        <iframe 
          id="hubedu-iframe"
          src="${url}"
          title="${module === 'enem' ? 'Simulador ENEM' : 'Redação ENEM'}"
          allow="fullscreen"
        ></iframe>
      `;
      
      // Listener para mensagens do iframe
      window.addEventListener('message', handleIframeMessage);
    }
    
    function handleIframeMessage(event) {
      // Validar origem
      if (event.origin !== 'https://hubedu.ia.br') return;
      
      console.log('Mensagem recebida do iframe:', event.data);
      
      // Processar eventos do iframe
      if (event.data.type === 'exam_completed') {
        alert(`Simulado concluído! Pontuação: ${event.data.score}`);
      }
    }
    
    // Carregar módulo ENEM por padrão
    loadModule('enem');
  </script>
</body>
</html>
```

## 📐 Dimensões Recomendadas

### Desktop
```css
iframe {
  width: 100%;
  min-height: 800px; /* Redação */
  min-height: 900px; /* ENEM com questões */
}
```

### Mobile
```css
@media (max-width: 768px) {
  iframe {
    width: 100%;
    min-height: 100vh;
  }
}
```

### Responsivo Completo
```css
.iframe-container {
  position: relative;
  width: 100%;
  padding-bottom: 100vh; /* Ajustar conforme necessário */
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
```

## 🛠️ Personalização

### Parâmetros de URL (Futura Implementação)

Você poderá personalizar o comportamento dos módulos através de parâmetros na URL:

```html
<!-- ENEM com configuração específica -->
<iframe src="https://hubedu.ia.br/embed/enem?mode=quick&questions=10"></iframe>

<!-- Redação com tema específico -->
<iframe src="https://hubedu.ia.br/embed/redacao?theme=2023"></iframe>
```

## 🔒 Segurança e Privacidade

### O que é Coletado

- **ENEM**: Respostas do simulado (armazenadas temporariamente)
- **Redação**: Texto da redação para correção (processado e descartado)
- **Nenhum dado pessoal** é coletado (sem login)

### Headers de Segurança

O sistema automaticamente configura:
- ✅ CORS apropriado para domínios autorizados
- ✅ Content Security Policy para permitir iframe
- ✅ Remoção de X-Frame-Options para domínios autorizados

## 🧪 Testando Localmente

### 1. Criar arquivo HTML de teste

Crie um arquivo `test-embed.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Teste Embed - HubEdu</title>
</head>
<body>
  <h1>Teste de Embed - ENEM</h1>
  <iframe 
    src="http://localhost:3000/embed/enem"
    width="100%"
    height="800px"
  ></iframe>
</body>
</html>
```

### 2. Servir o arquivo localmente

```bash
# Usando Python
python3 -m http.server 8000

# Acessar: http://localhost:8000/test-embed.html
```

### 3. Verificar Console

Abra o Developer Tools e verifique:
- Mensagens de log do embed
- Verificação de iframe
- Headers de CORS

## 📊 Exemplos de Uso

### WordPress

```php
<!-- Adicionar em uma página WordPress -->
<div style="width: 100%; height: 800px;">
  <iframe 
    src="https://hubedu.ia.br/embed/enem"
    width="100%"
    height="100%"
    frameborder="0"
    allowfullscreen
  ></iframe>
</div>
```

### React

```jsx
function EnemEmbed() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="https://hubedu.ia.br/embed/enem"
        title="Simulador ENEM"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        allow="fullscreen"
      />
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div class="embed-container">
    <iframe
      :src="embedUrl"
      title="HubEdu Module"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      module: 'enem', // ou 'redacao'
    }
  },
  computed: {
    embedUrl() {
      return `https://hubedu.ia.br/embed/${this.module}`
    }
  }
}
</script>

<style scoped>
.embed-container {
  width: 100%;
  min-height: 800px;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
```

## ❓ FAQ

### Como adicionar meu domínio aos autorizados?

1. Solicite ao administrador do HubEdu
2. Será adicionado à variável `EMBED_ALLOWED_DOMAINS`
3. Aguarde o deploy da atualização

### Os dados ficam salvos?

Dados do ENEM ficam temporariamente salvos (sessão). Redações são processadas e podem ser descartadas após correção, dependendo da configuração.

### Posso personalizar o estilo?

Não diretamente. O iframe mantém o estilo do HubEdu. Você pode apenas controlar o tamanho e posição do iframe.

### Funciona em mobile?

Sim! Ambos os módulos são responsivos e funcionam perfeitamente em dispositivos móveis.

### Preciso pagar?

Depende do acordo com sua escola. Contate o administrador do HubEdu.

## 🆘 Suporte

Para suporte técnico ou solicitação de acesso:
- **Email**: suporte@hubedu.ia.br
- **Documentação**: https://hubedu.ia.br/docs/embed

## 🔄 Changelog

### v1.0.0 (2025-01-08)
- ✨ Lançamento inicial
- 📦 Módulo ENEM embed
- ✍️ Módulo Redação embed
- 🔐 Sistema de validação por domínio
- 📱 Suporte responsivo completo

