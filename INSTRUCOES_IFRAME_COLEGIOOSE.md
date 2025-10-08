# 📚 Instruções para Adicionar Iframes ENEM e Redação no Site Colegioose

## 🎯 Visão Geral

O sistema HubEdu já possui módulos embed prontos para incorporação em iframes. Este guia mostra como adicionar os módulos de **ENEM** e **Redação** no site do Colégio OSE.

## ✅ Status Atual

- ✅ **Sistema Embed Implementado**: `/embed/enem` e `/embed/redacao`
- ✅ **Validação de Domínio**: Configurado para `colegioose.com.br`
- ✅ **Componentes Prontos**: EmbedWrapper, páginas embed funcionais
- ✅ **Página de Teste**: `/embed-test.html` disponível

## 🚀 URLs para Incorporação

### URLs de Produção
```html
<!-- Simulador ENEM -->
https://hubedu.ia.br/embed/enem

<!-- Redação ENEM -->
https://hubedu.ia.br/embed/redacao
```

### URLs de Desenvolvimento (para testes locais)
```html
<!-- Simulador ENEM -->
http://localhost:3000/embed/enem

<!-- Redação ENEM -->
http://localhost:3000/embed/redacao
```

## 📋 Implementação no Site Colegioose

### Opção 1: Implementação Simples (Recomendada)

#### Para ENEM:
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

#### Para Redação:
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

### Opção 2: Implementação Avançada com Seletor

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Módulos HubEdu - Colégio OSE</title>
  <style>
    .module-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .module-selector {
      margin-bottom: 20px;
      text-align: center;
    }
    
    .btn {
      padding: 10px 20px;
      margin: 0 10px;
      font-size: 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .btn:hover {
      background: #2563eb;
    }
    
    .btn.active {
      background: #1d4ed8;
    }
    
    iframe {
      width: 100%;
      min-height: 800px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="module-container">
    <div class="module-selector">
      <h2>Escolha o Módulo</h2>
      <button class="btn active" onclick="loadModule('enem')" id="btn-enem">
        📚 Simulador ENEM
      </button>
      <button class="btn" onclick="loadModule('redacao')" id="btn-redacao">
        ✍️ Redação ENEM
      </button>
    </div>
    
    <div id="iframe-container">
      <iframe 
        id="hubedu-iframe"
        src="https://hubedu.ia.br/embed/enem"
        title="Simulador ENEM"
        allow="fullscreen"
      ></iframe>
    </div>
  </div>

  <script>
    function loadModule(module) {
      const iframe = document.getElementById('hubedu-iframe');
      const url = `https://hubedu.ia.br/embed/${module}`;
      
      iframe.src = url;
      iframe.title = module === 'enem' ? 'Simulador ENEM' : 'Redação ENEM';
      
      // Atualizar botões ativos
      document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById(`btn-${module}`).classList.add('active');
    }
    
    // Listener para mensagens do iframe
    window.addEventListener('message', function(event) {
      // Validar origem
      if (event.origin !== 'https://hubedu.ia.br') return;
      
      console.log('Mensagem recebida do iframe:', event.data);
      
      // Processar eventos do iframe
      if (event.data.type === 'exam_completed') {
        alert(`Simulado concluído! Pontuação: ${event.data.score}`);
      }
    });
  </script>
</body>
</html>
```

## 📱 Responsividade

### CSS Responsivo Completo
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

/* Mobile */
@media (max-width: 768px) {
  iframe {
    width: 100%;
    min-height: 100vh;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  iframe {
    min-height: 900px; /* ENEM com questões */
    min-height: 800px; /* Redação */
  }
}
```

## 🔧 Integração com WordPress

### Método 1: Shortcode Personalizado
```php
// Adicionar ao functions.php
function colegioose_hubedu_shortcode($atts) {
    $atts = shortcode_atts(array(
        'module' => 'enem',
        'height' => '800px'
    ), $atts);
    
    $url = "https://hubedu.ia.br/embed/{$atts['module']}";
    
    return "<div style='width: 100%; height: {$atts['height']};'>
        <iframe src='{$url}' width='100%' height='100%' frameborder='0' allowfullscreen></iframe>
    </div>";
}
add_shortcode('hubedu', 'colegioose_hubedu_shortcode');

// Uso: [hubedu module="enem" height="800px"]
```

### Método 2: Bloco Gutenberg
```php
// Adicionar ao functions.php
function colegioose_hubedu_block() {
    wp_enqueue_script('hubedu-block', get_template_directory_uri() . '/js/hubedu-block.js');
    register_block_type('colegioose/hubedu', array(
        'editor_script' => 'hubedu-block',
    ));
}
add_action('init', 'colegioose_hubedu_block');
```

## 🎨 Estilização Personalizada

### Tema do Colégio OSE
```css
/* Cores do Colégio OSE */
:root {
  --colegioose-primary: #1e40af; /* Azul */
  --colegioose-secondary: #dc2626; /* Vermelho */
  --colegioose-accent: #f59e0b; /* Amarelo */
}

.hubedu-container {
  background: linear-gradient(135deg, var(--colegioose-primary), var(--colegioose-secondary));
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.hubedu-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.hubedu-header h2 {
  color: var(--colegioose-primary);
  margin-bottom: 10px;
}

.hubedu-iframe {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## 🔒 Configuração de Segurança

### Variáveis de Ambiente Necessárias
```bash
# Produção
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"
EMBED_ALLOW_ALL_DEV="false"

# Desenvolvimento
EMBED_ALLOWED_DOMAINS="localhost,127.0.0.1,colegioose.com.br"
EMBED_ALLOW_ALL_DEV="true"
```

### Headers de Segurança
O sistema automaticamente configura:
- ✅ CORS apropriado para domínios autorizados
- ✅ Content Security Policy para permitir iframe
- ✅ Remoção de X-Frame-Options para domínios autorizados

## 🧪 Testando a Implementação

### 1. Teste Local
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar página de teste
http://localhost:3000/embed-test.html
```

### 2. Teste em Produção
```bash
# Verificar se os domínios estão autorizados
curl -H "Origin: https://colegioose.com.br" https://hubedu.ia.br/embed/enem
```

### 3. Checklist de Testes
- [ ] Iframe carrega sem erros
- [ ] Funcionalidades do ENEM funcionam
- [ ] Funcionalidades da Redação funcionam
- [ ] Responsividade em mobile
- [ ] Comunicação postMessage funciona
- [ ] Sem erros de CORS

## 📊 Monitoramento e Analytics

### Eventos PostMessage Disponíveis
```javascript
// Escutar eventos do iframe
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://hubedu.ia.br') return;
  
  switch(event.data.type) {
    case 'exam_started':
      console.log('Simulado iniciado');
      break;
    case 'exam_completed':
      console.log('Simulado concluído:', event.data.score);
      break;
    case 'essay_submitted':
      console.log('Redação enviada:', event.data.sessionId);
      break;
  }
});
```

### Google Analytics Integration
```javascript
// Enviar eventos para GA4
function trackHubEduEvent(eventName, parameters) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'HubEdu',
      event_label: parameters.module || 'unknown',
      ...parameters
    });
  }
}
```

## 🚀 Deploy e Go-Live

### Passos para Produção
1. **Configurar Domínio**: Adicionar `colegioose.com.br` às variáveis de ambiente
2. **Deploy do HubEdu**: Garantir que as páginas embed estejam funcionando
3. **Implementar no Site**: Adicionar os iframes nas páginas do Colégio OSE
4. **Testar**: Verificar funcionamento em produção
5. **Monitorar**: Acompanhar logs e métricas

### URLs Finais para o Colégio OSE
```
https://colegioose.com.br/simulador-enem
https://colegioose.com.br/redacao-enem
```

## 📞 Suporte e Manutenção

### Contatos
- **Suporte Técnico**: suporte@hubedu.ia.br
- **Documentação**: https://hubedu.ia.br/docs/embed
- **Status**: https://status.hubedu.ia.br

### Logs e Debug
```javascript
// Ativar logs detalhados
localStorage.setItem('hubedu-debug', 'true');

// Verificar status do embed
console.log('HubEdu Embed Status:', {
  inIframe: window !== window.parent,
  parentDomain: document.referrer,
  module: window.location.pathname.split('/').pop()
});
```

## 🎯 Próximos Passos

1. ✅ **Implementar iframes** nas páginas do Colégio OSE
2. ✅ **Testar funcionalidades** em ambiente de produção
3. ✅ **Configurar analytics** para monitoramento
4. ✅ **Treinar equipe** sobre uso dos módulos
5. ✅ **Documentar processo** para manutenção futura

---

## 📋 Resumo Executivo

**Status**: ✅ **PRONTO PARA IMPLEMENTAÇÃO**

**O que está disponível**:
- ✅ Módulos embed funcionais (`/embed/enem` e `/embed/redacao`)
- ✅ Validação de domínio configurada para `colegioose.com.br`
- ✅ Componentes responsivos e otimizados
- ✅ Sistema de segurança implementado
- ✅ Documentação completa

**O que precisa ser feito**:
1. Implementar os iframes nas páginas do site Colegioose
2. Testar em ambiente de produção
3. Configurar monitoramento

**Tempo estimado**: 2-4 horas para implementação completa

**Custo**: Sem custos adicionais (sistema já implementado)

---

**🎉 Os módulos estão prontos para uso! Basta implementar os iframes no site do Colégio OSE seguindo este guia.**
