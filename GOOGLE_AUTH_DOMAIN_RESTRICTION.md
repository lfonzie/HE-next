# 🔐 Autenticação Google com Restrição de Domínio

## 📋 O que foi implementado

O sistema agora restringe o login via Google apenas para emails do domínio **@colegioose.com.br**, com permissões diferenciadas:

- ✅ **Email do domínio @colegioose.com.br**: Permitido (criado como `STUDENT` por padrão)
- 👑 **fonseca@colegioose.com.br**: Criado/atualizado como `ADMIN` (SuperAdmin)
- ❌ **Outros domínios**: Login bloqueado com mensagem de erro

## 🛠️ Configuração Necessária

### 1. Adicionar no arquivo `.env.local` (Desenvolvimento)

```bash
# Google OAuth - Domínio Restrito
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
GOOGLE_ALLOWED_DOMAIN="colegioose.com.br"
GOOGLE_SUPERADMIN_EMAIL="fonseca@colegioose.com.br"
```

### 2. Configurar no Render (Produção)

Acesse o painel do Render e adicione as variáveis de ambiente:

```bash
GOOGLE_ALLOWED_DOMAIN=colegioose.com.br
GOOGLE_SUPERADMIN_EMAIL=fonseca@colegioose.com.br
```

**Importante:** Se essas variáveis não forem definidas, o sistema usa os valores padrão:
- `GOOGLE_ALLOWED_DOMAIN`: `colegioose.com.br`
- `GOOGLE_SUPERADMIN_EMAIL`: `fonseca@colegioose.com.br`

## 🔄 Como Funciona

### Fluxo de Autenticação

1. **Usuário tenta fazer login com Google**
   
2. **Sistema valida o domínio do email**
   - ✅ Se terminar com `@colegioose.com.br` → Continua
   - ❌ Caso contrário → Bloqueia e mostra erro

3. **Sistema define a role**
   - 👑 Se email = `fonseca@colegioose.com.br` → `ADMIN`
   - 👨‍🎓 Outros emails do domínio → `STUDENT`

4. **Verifica se usuário já existe no banco**
   - ✅ **Existe**: 
     - Se for superadmin e role diferente de ADMIN → Atualiza para ADMIN
     - Caso contrário → Mantém role atual
   - ✨ **Não existe**: Cria novo usuário com role apropriada

### Exemplo de Logs

```bash
✅ [AUTH] Email autorizado: professor@colegioose.com.br (Usuário padrão)
✨ [AUTH] Novo usuário criado: professor@colegioose.com.br (STUDENT)

✅ [AUTH] Email autorizado: fonseca@colegioose.com.br (SUPERADMIN)
🔄 [AUTH] Role atualizada para ADMIN: fonseca@colegioose.com.br

❌ [AUTH] Email externo@gmail.com não autorizado. Apenas @colegioose.com.br permitido.
```

## 🎯 Roles Disponíveis

| Role | Descrição | Como é atribuída |
|------|-----------|------------------|
| `ADMIN` | SuperAdmin com acesso total | Email = `fonseca@colegioose.com.br` |
| `STUDENT` | Aluno/Staff padrão | Outros emails `@colegioose.com.br` |
| `TEACHER` | Professor | Pode ser alterado manualmente no banco de dados |

## 🔧 Alterando Roles Manualmente

Para promover um usuário de `STUDENT` para `TEACHER`:

```sql
UPDATE "User" 
SET role = 'TEACHER' 
WHERE email = 'professor@colegioose.com.br';
```

**Nota:** O SuperAdmin (`fonseca@colegioose.com.br`) sempre será `ADMIN`, mesmo que alterado manualmente.

## 🚨 Mensagens de Erro

Se um usuário com email não autorizado tentar fazer login, verá:

```
Apenas emails @colegioose.com.br são autorizados para login.
```

## 📝 Modificações nos Arquivos

### `lib/auth.ts`
- Adicionada validação de domínio
- Lógica para SuperAdmin automático
- Logs detalhados para debugging

### `env.local.example` e `env.production.example`
- Adicionadas variáveis `GOOGLE_ALLOWED_DOMAIN` e `GOOGLE_SUPERADMIN_EMAIL`

## 🧪 Testando

1. **Login com email autorizado:**
   - Use qualquer email `@colegioose.com.br`
   - Deve criar usuário como `STUDENT`

2. **Login com SuperAdmin:**
   - Use `fonseca@colegioose.com.br`
   - Deve criar/atualizar como `ADMIN`

3. **Login com email não autorizado:**
   - Use qualquer email de outro domínio
   - Deve bloquear com mensagem de erro

## 🔄 Mudando o Domínio ou SuperAdmin

Para usar um domínio diferente ou outro email como SuperAdmin, basta alterar as variáveis de ambiente:

```bash
GOOGLE_ALLOWED_DOMAIN="outrodominio.com.br"
GOOGLE_SUPERADMIN_EMAIL="admin@outrodominio.com.br"
```

E reiniciar o servidor.

