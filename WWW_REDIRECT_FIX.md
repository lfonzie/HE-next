# 🚨 CORREÇÃO: www vs sem www - redirect_uri_mismatch

## Problema Específico
```
redirect_uri=https://www.hubedu.ia.br/api/auth/callback/google
Error 400: redirect_uri_mismatch
```

## Causa
O sistema está tentando usar `www.hubedu.ia.br` mas você configurou apenas `hubedu.ia.br` no Google OAuth Console.

## ✅ Solução: Configure AMBAS as URLs

### 1. Google Cloud Console
- Acesse: https://console.cloud.google.com/
- Vá para **APIs & Services** → **Credentials**
- Edite seu **OAuth 2.0 Client ID**

### 2. Authorized redirect URIs
Adicione **AMBAS** as URLs:
```
https://hubedu.ia.br/api/auth/callback/google
https://www.hubedu.ia.br/api/auth/callback/google
```

### 3. Authorized JavaScript origins
Adicione **AMBAS** as URLs:
```
https://hubedu.ia.br
https://www.hubedu.ia.br
```

### 4. Salve e Aguarde
- Clique em **Save**
- Aguarde 5-10 minutos para propagação

## 🔍 Por que isso acontece?

1. **DNS Redirecionamento**: Seu domínio pode redirecionar automaticamente entre `www` e sem `www`
2. **Navegador**: Alguns navegadores adicionam `www` automaticamente
3. **CDN/Proxy**: Serviços como Cloudflare podem adicionar `www`
4. **Configuração de Servidor**: O servidor pode estar configurado para usar `www`

## 🚨 URLs Críticas

### ✅ CORRETO (configure ambas):
- `https://hubedu.ia.br/api/auth/callback/google`
- `https://www.hubedu.ia.br/api/auth/callback/google`

### ❌ INCORRETO:
- Configurar apenas uma das duas
- Usar HTTP em vez de HTTPS
- Usar domínio onrender.com

## 🔧 Verificação

Execute o script atualizado:
```bash
./scripts/check-google-oauth.sh
```

## 📋 Checklist Final

- [ ] Google Cloud Console acessado
- [ ] OAuth 2.0 Client ID editado
- [ ] `https://hubedu.ia.br/api/auth/callback/google` adicionada
- [ ] `https://www.hubedu.ia.br/api/auth/callback/google` adicionada
- [ ] `https://hubedu.ia.br` adicionada em JavaScript origins
- [ ] `https://www.hubedu.ia.br` adicionada em JavaScript origins
- [ ] Alterações salvas
- [ ] Aguardado 5-10 minutos

## 🎯 Resultado Esperado

Após configurar ambas as URLs, o login deve funcionar independentemente de o usuário acessar:
- `https://hubedu.ia.br/login`
- `https://www.hubedu.ia.br/login`

## 💡 Dica

Configure sempre ambas as variações (com e sem www) para evitar problemas futuros!
