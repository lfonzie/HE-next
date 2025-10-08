# 🧪 Páginas de Teste - Gemini Audio Chat

## 📍 URLs Disponíveis

### 1. Página Completa (Recomendada) ⭐
**URL:** http://localhost:3000/gemini-audio

**Características:**
- ✅ Interface completa e profissional
- ✅ Componente GeminiAudioChat com todos os recursos
- ✅ Player de áudio integrado
- ✅ Botão de download
- ✅ Dark mode
- ✅ Responsivo
- ✅ Alertas de erro e sucesso

**Melhor para:** Demonstração completa do sistema

---

### 2. Página de Teste com Sugestões
**URL:** http://localhost:3000/test-gemini-audio-page

**Características:**
- ✅ Mesma interface da página completa
- ✅ Lista de prompts sugeridos
- ✅ Título indicando que é página de teste
- ✅ Informações adicionais sobre o sistema

**Melhor para:** Testar com prompts pré-definidos

---

### 3. Página Simples (Minimalista)
**URL:** http://localhost:3000/test-gemini-simple

**Características:**
- ✅ Interface minimalista sem dependências de UI
- ✅ Apenas texto (sem áudio)
- ✅ CSS inline simples
- ✅ Foco no texto gerado
- ✅ Rápida e leve

**Melhor para:** Testar apenas a geração de texto

---

## 🚀 Como Testar

### Método 1: Browser (Recomendado)

Abra seu navegador favorito e acesse qualquer uma das URLs acima:

```
Chrome/Safari/Firefox:
→ http://localhost:3000/gemini-audio
```

### Método 2: Comando Rápido

```bash
# Abrir automaticamente no navegador padrão (macOS)
open http://localhost:3000/gemini-audio

# Ou use curl para testar a API
curl -X POST http://localhost:3000/api/gemini-audio \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Olá, como vai?"}'
```

---

## 💡 Prompts Sugeridos para Teste

### Curtos (Rápidos)
```
1. "Olá, tudo bem?"
2. "Me conte uma curiosidade"
3. "O que é inteligência artificial?"
```

### Médios (Narrativa)
```
1. "Conte uma história curta sobre um astronauta corajoso"
2. "Explique física quântica de forma simples"
3. "Quais são os benefícios de aprender um novo idioma?"
```

### Longos (Detalhados)
```
1. "Crie um roteiro de estudos para o ENEM focado em matemática"
2. "Explique a teoria da relatividade de Einstein de forma que uma criança de 10 anos entenda"
3. "Conte uma história inspiradora sobre superação pessoal"
```

---

## 🎬 Fluxo de Teste Recomendado

### Passo 1: Teste Básico
```
URL: /test-gemini-simple
Prompt: "Olá, como vai?"
Objetivo: Verificar se a API responde
```

### Passo 2: Teste com Áudio
```
URL: /gemini-audio
Prompt: "Conte uma história curta"
Objetivo: Verificar geração de texto + áudio
```

### Passo 3: Teste de Performance
```
URL: /gemini-audio
Prompt: "Explique a teoria da relatividade"
Objetivo: Testar com prompt mais complexo
```

---

## 🐛 Troubleshooting

### Página não carrega
```bash
# Verificar se o servidor está rodando
lsof -ti:3000

# Se não estiver, iniciar:
npm run dev
```

### Erro 404
```
Certifique-se de acessar as URLs corretas:
✅ /gemini-audio
✅ /test-gemini-audio-page
✅ /test-gemini-simple

❌ /gemini-audio-chat (não existe)
❌ /test-audio (não existe)
```

### Erro na API
```
1. Verificar se GEMINI_API_KEY está configurada
2. Verificar logs do servidor (terminal)
3. Abrir DevTools do navegador (F12) → Console
```

---

## 📊 Comparação das Páginas

| Característica | Completa | Teste | Simples |
|----------------|----------|-------|---------|
| Interface UI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Áudio | ✅ | ✅ | ❌ |
| Download | ✅ | ✅ | ❌ |
| Dark Mode | ✅ | ✅ | ❌ |
| Sugestões | ❌ | ✅ | ✅ |
| Velocidade | Rápida | Rápida | Muito Rápida |

---

## 🔗 Links Úteis

- **API Endpoint:** http://localhost:3000/api/gemini-audio
- **Health Check:** http://localhost:3000/api/gemini-audio (GET)
- **Documentação:** Ver GEMINI_AUDIO_CHAT_IMPLEMENTATION.md
- **Guia Rápido:** Ver GEMINI_AUDIO_QUICK_START.md

---

## 📱 Teste no Mobile

As páginas são responsivas! Teste em:

1. **Chrome DevTools**
   - F12 → Toggle Device Toolbar (Ctrl+Shift+M)
   - Escolha iPhone/iPad

2. **Seu smartphone**
   - Conecte à mesma rede
   - Acesse: http://[SEU-IP]:3000/gemini-audio
   - Exemplo: http://192.168.1.100:3000/gemini-audio

---

## ✅ Checklist de Teste

- [ ] Página carrega corretamente
- [ ] Campo de texto funciona
- [ ] Botão de submit responde ao clique
- [ ] Loading aparece durante geração
- [ ] Texto é exibido corretamente
- [ ] Áudio é gerado (páginas completas)
- [ ] Player de áudio funciona
- [ ] Download de áudio funciona
- [ ] Erros são tratados adequadamente
- [ ] Interface é responsiva

---

**Bom teste! 🚀**

