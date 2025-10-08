# 🎓 Configuração Específica - Colégio OSE

## 📋 Checklist de Implementação

### ✅ Pré-requisitos Verificados
- [x] Sistema embed implementado no HubEdu
- [x] Domínio `colegioose.com.br` configurado nas variáveis de ambiente
- [x] Páginas embed funcionais (`/embed/enem` e `/embed/redacao`)
- [x] Validação de segurança implementada

### 🚀 Implementação no Site Colegioose

#### 1. Páginas a Criar
```
https://colegioose.com.br/simulador-enem
https://colegioose.com.br/redacao-enem
```

#### 2. Código HTML para Simulador ENEM
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador ENEM - Colégio OSE</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    .embed-container { width: 100%; height: 100vh; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <div class="embed-container">
    <iframe 
      src="https://hubedu.ia.br/embed/enem"
      title="Simulador ENEM"
      allow="fullscreen"
    ></iframe>
  </div>
</body>
</html>
```

#### 3. Código HTML para Redação ENEM
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redação ENEM - Colégio OSE</title>
  <style>
    body { margin: 0; padding: 0; }
    .embed-container { width: 100%; min-height: 100vh; }
    iframe { width: 100%; min-height: 800px; border: none; }
  </style>
</head>
<body>
  <div class="embed-container">
    <iframe 
      src="https://hubedu.ia.br/embed/redacao"
      title="Redação ENEM"
      allow="fullscreen"
    ></iframe>
  </div>
</body>
</html>
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente Necessárias
```bash
# Produção (Render)
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"
EMBED_ALLOW_ALL_DEV="false"

# Desenvolvimento
EMBED_ALLOWED_DOMAINS="localhost,127.0.0.1,colegioose.com.br"
EMBED_ALLOW_ALL_DEV="true"
```

## 📱 Responsividade

### CSS Responsivo
```css
/* Desktop */
@media (min-width: 1200px) {
  iframe {
    min-height: 900px; /* ENEM */
    min-height: 800px; /* Redação */
  }
}

/* Tablet */
@media (max-width: 1024px) {
  iframe {
    min-height: 100vh;
  }
}

/* Mobile */
@media (max-width: 768px) {
  iframe {
    min-height: 100vh;
  }
}
```

## 🎨 Personalização Visual

### Cores do Colégio OSE
```css
:root {
  --colegioose-primary: #1e40af;   /* Azul */
  --colegioose-secondary: #dc2626;  /* Vermelho */
  --colegioose-accent: #f59e0b;    /* Amarelo */
}

.header {
  background: linear-gradient(135deg, var(--colegioose-primary), var(--colegioose-secondary));
  color: white;
  padding: 20px;
  text-align: center;
}
```

## 🔒 Segurança

### Headers Automáticos
O sistema já configura automaticamente:
- ✅ CORS para `colegioose.com.br`
- ✅ Content Security Policy
- ✅ Validação de origem

### Validação de Domínio
```javascript
// Verificar se o domínio está autorizado
const allowedDomains = [
  'colegioose.com.br',
  'www.colegioose.com.br'
];

const currentDomain = window.location.hostname;
const isAuthorized = allowedDomains.includes(currentDomain);
```

## 📊 Analytics e Monitoramento

### Eventos PostMessage
```javascript
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://hubedu.ia.br') return;
  
  // Eventos do ENEM
  if (event.data.type === 'exam_started') {
    console.log('Simulado iniciado');
  }
  if (event.data.type === 'exam_completed') {
    console.log('Simulado concluído:', event.data.score);
  }
  
  // Eventos da Redação
  if (event.data.type === 'essay_submitted') {
    console.log('Redação enviada:', event.data.sessionId);
  }
});
```

### Google Analytics Integration
```javascript
function trackHubEduEvent(eventName, parameters) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'HubEdu',
      event_label: 'Colegioose',
      ...parameters
    });
  }
}
```

## 🧪 Testes

### Teste Local
```bash
# 1. Iniciar servidor HubEdu
npm run dev

# 2. Testar URLs embed
curl http://localhost:3000/embed/enem
curl http://localhost:3000/embed/redacao

# 3. Testar em iframe
open exemplo-simulador-enem-colegioose.html
```

### Teste em Produção
```bash
# Verificar se domínio está autorizado
curl -H "Origin: https://colegioose.com.br" https://hubedu.ia.br/embed/enem

# Verificar headers CORS
curl -I https://hubedu.ia.br/embed/enem
```

## 🚀 Deploy

### Passos para Go-Live
1. **Verificar Configuração**: Confirmar que `colegioose.com.br` está em `EMBED_ALLOWED_DOMAINS`
2. **Deploy HubEdu**: Garantir que as páginas embed estão funcionando
3. **Implementar no Site**: Adicionar os iframes nas páginas do Colégio OSE
4. **Testar**: Verificar funcionamento em produção
5. **Monitorar**: Acompanhar logs e métricas

### URLs Finais
```
https://colegioose.com.br/simulador-enem
https://colegioose.com.br/redacao-enem
```

## 📞 Suporte

### Contatos
- **Suporte Técnico**: suporte@hubedu.ia.br
- **Documentação**: https://hubedu.ia.br/docs/embed
- **Status**: https://status.hubedu.ia.br

### Logs de Debug
```javascript
// Ativar logs detalhados
localStorage.setItem('hubedu-debug', 'true');

// Verificar status
console.log('HubEdu Status:', {
  domain: window.location.hostname,
  inIframe: window !== window.parent,
  module: 'enem' // ou 'redacao'
});
```

## ✅ Checklist Final

### Antes do Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio `colegioose.com.br` autorizado
- [ ] Páginas embed testadas localmente
- [ ] Código HTML preparado para o site

### Após o Deploy
- [ ] Iframes carregam sem erros
- [ ] Funcionalidades do ENEM funcionam
- [ ] Funcionalidades da Redação funcionam
- [ ] Responsividade em mobile
- [ ] Analytics configurado
- [ ] Monitoramento ativo

---

## 🎯 Resumo Executivo

**Status**: ✅ **PRONTO PARA IMPLEMENTAÇÃO**

**Tempo Estimado**: 2-4 horas
**Custo**: Sem custos adicionais
**Complexidade**: Baixa

**Próximo Passo**: Implementar os iframes no site do Colégio OSE usando os códigos HTML fornecidos.
