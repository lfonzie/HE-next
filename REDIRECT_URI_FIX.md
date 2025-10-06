# 🚨 CORREÇÃO: Error 400: redirect_uri_mismatch

## Problema
```
Access blocked: HubEdu.ia's request is invalid
Error 400: redirect_uri_mismatch
```

## Causa
A URL de redirecionamento configurada no Google OAuth Console não corresponde à URL que o NextAuth.js está tentando usar.

## ✅ Solução Passo a Passo

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto
- Navegue para **APIs & Services** → **Credentials**

### 2. Edite seu OAuth 2.0 Client ID
- Clique no ícone de edição (lápis) do seu OAuth 2.0 Client ID
- Vá para a seção **Authorized redirect URIs**

### 3. Configure as URLs Corretas

**Authorized redirect URIs:**
```
https://hubedu.ia.br/api/auth/callback/google
https://www.hubedu.ia.br/api/auth/callback/google
```

**Authorized JavaScript origins:**
```
https://hubedu.ia.br
https://www.hubedu.ia.br
```

### 4. Salve as Alterações
- Clique em **Save**
- Aguarde alguns minutos para as alterações serem propagadas

### 5. Verifique as Configurações

Execute o script de verificação:
```bash
./scripts/check-google-oauth.sh
```

## 🔍 URLs Importantes

### ✅ URLs Corretas (use estas):
- **Redirect URI**: `https://hubedu.ia.br/api/auth/callback/google`
- **Redirect URI**: `https://www.hubedu.ia.br/api/auth/callback/google`
- **JavaScript Origin**: `https://hubedu.ia.br`
- **JavaScript Origin**: `https://www.hubedu.ia.br`

### ❌ URLs Incorretas (NÃO use estas):
- `https://hubedu-ai-bz5i.onrender.com/api/auth/callback/google`
- `http://hubedu.ia.br/api/auth/callback/google` (sem HTTPS)
- `https://hubedu.ia.br/auth/callback/google` (sem /api)

## 🚨 Verificações Importantes

1. **Domínio correto**: `hubedu.ia.br` (não onrender.com)
2. **Protocolo HTTPS**: Sempre use HTTPS em produção
3. **Caminho completo**: `/api/auth/callback/google`
4. **Sem espaços**: Não adicione espaços nas URLs
5. **Case sensitive**: URLs são sensíveis a maiúsculas/minúsculas

## 🔧 Troubleshooting

### Se ainda não funcionar:

1. **Verifique o NEXTAUTH_URL no Render:**
   ```bash
   NEXTAUTH_URL=https://hubedu.ia.br
   ```

2. **Limpe o cache do navegador**
3. **Teste em modo incógnito**
4. **Aguarde 5-10 minutos** para propagação das alterações

### Logs para verificar:
- Console do navegador (F12)
- Logs do Render
- Network tab para ver requisições

## 📞 Suporte Adicional

Se o problema persistir:
1. Verifique se o domínio `hubedu.ia.br` está funcionando
2. Confirme se o SSL está ativo
3. Teste com um usuário diferente
4. Verifique se não há bloqueios de firewall

## ✅ Teste Final

Após configurar:
1. Acesse `https://hubedu.ia.br/login`
2. Clique em "Continuar com Google"
3. Deve redirecionar para o Google sem erro
4. Após autorizar, deve voltar para `hubedu.ia.br`
