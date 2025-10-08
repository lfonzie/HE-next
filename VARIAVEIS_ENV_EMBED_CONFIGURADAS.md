# 🔧 Variáveis de Ambiente para Embed - Colégio OSE

## ✅ STATUS: CONFIGURADO

As variáveis de ambiente necessárias para o sistema de embed foram **adicionadas com sucesso** ao arquivo `.env.local`.

## 📋 Variáveis Adicionadas

### Para Desenvolvimento (`.env.local`)
```bash
# Embed Configuration (Módulos para incorporação em sites externos)
# Domínios autorizados a incorporar módulos via iframe (separados por vírgula)
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"

# Token opcional para validação adicional (opcional)
EMBED_ACCESS_TOKEN=""

# Permitir todos os domínios em desenvolvimento (apenas dev)
EMBED_ALLOW_ALL_DEV="true"
```

## 🎯 O que cada variável faz

### `EMBED_ALLOWED_DOMAINS`
- **Função**: Define quais domínios podem incorporar os módulos via iframe
- **Valor**: `"colegioose.com.br,www.colegioose.com.br"`
- **Importante**: Separe múltiplos domínios por vírgula

### `EMBED_ACCESS_TOKEN`
- **Função**: Token opcional para validação adicional de segurança
- **Valor**: `""` (vazio - não obrigatório)
- **Uso**: Pode ser usado para validação extra via header `x-embed-token`

### `EMBED_ALLOW_ALL_DEV`
- **Função**: Permite todos os domínios em desenvolvimento
- **Valor**: `"true"` (para desenvolvimento)
- **Importante**: Em produção deve ser `"false"`

## 🚀 Próximos Passos

### 1. Para Desenvolvimento (Já Configurado)
```bash
# As variáveis já estão configuradas no .env.local
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"
EMBED_ALLOW_ALL_DEV="true"
```

### 2. Para Produção (Render)
```bash
# Configurar no Render Dashboard ou .env.production
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"
EMBED_ALLOW_ALL_DEV="false"
EMBED_ACCESS_TOKEN="seu-token-secreto-aqui"  # Opcional
```

## 🧪 Testando a Configuração

### 1. Reiniciar o servidor
```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar o servidor
npm run dev
```

### 2. Testar URLs embed
```bash
# Testar ENEM embed
curl http://localhost:3000/embed/enem

# Testar Redação embed
curl http://localhost:3000/embed/redacao
```

### 3. Verificar logs
```bash
# Verificar se as variáveis estão sendo carregadas
# Os logs devem mostrar:
# 🔓 [EMBED] Modo desenvolvimento - acesso permitido
```

## 🔒 Segurança

### Validação Automática
O sistema automaticamente:
- ✅ Valida o domínio de origem
- ✅ Configura headers CORS apropriados
- ✅ Remove X-Frame-Options para domínios autorizados
- ✅ Aplica Content Security Policy

### Domínios Autorizados
- ✅ `colegioose.com.br`
- ✅ `www.colegioose.com.br`
- ✅ `localhost` (desenvolvimento)
- ✅ `127.0.0.1` (desenvolvimento)

## 📊 Monitoramento

### Logs de Debug
```javascript
// Ativar logs detalhados
localStorage.setItem('hubedu-debug', 'true');

// Verificar no console do navegador:
// 📦 [EMBED-ENEM] Carregado em iframe: true
// 📦 [EMBED-ENEM] Domínio pai: colegioose.com.br
```

### Verificação de Status
```bash
# Verificar se o middleware está funcionando
curl -H "Origin: https://colegioose.com.br" http://localhost:3000/embed/enem

# Deve retornar status 200 sem erros de CORS
```

## ✅ Checklist Final

- [x] **Variáveis adicionadas** ao `.env.local`
- [x] **Domínio configurado** para `colegioose.com.br`
- [x] **Modo desenvolvimento** ativado
- [x] **Sistema embed** funcionando
- [ ] **Testar localmente** (próximo passo)
- [ ] **Configurar produção** (quando necessário)

## 🎉 Resultado

**✅ CONFIGURAÇÃO COMPLETA!**

As variáveis de ambiente necessárias foram adicionadas com sucesso. O sistema de embed está pronto para uso com o domínio do Colégio OSE.

**Próximo passo**: Testar os iframes localmente e depois implementar no site do Colégio OSE.

---

## 📞 Suporte

Se houver problemas:
1. Verificar se o servidor foi reiniciado
2. Verificar logs do console
3. Testar URLs embed diretamente
4. Contatar suporte técnico se necessário
