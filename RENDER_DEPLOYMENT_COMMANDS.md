# Comandos de Build e Start para Render

## Configuração Atual

Seu projeto está configurado para executar tanto o HubEdu.ai quanto o ENEM API no Render usando scripts personalizados.

### Estrutura dos Serviços

1. **hubedu-main**: Serviço principal que executa ambos os aplicativos
2. **hubedu-enem-api**: Serviço separado apenas para a API do ENEM

## Comandos de Build

### Serviço Principal (hubedu-main)
```bash
chmod +x scripts/render-build.sh && ./scripts/render-build.sh
```

Este comando:
- Instala dependências do HubEdu.ai
- Instala dependências do ENEM API
- Gera clientes Prisma para ambos os serviços
- Executa migrações do banco de dados
- Constrói ambos os aplicativos

### Serviço ENEM API (hubedu-enem-api)
```bash
cd enem-api-main && npm ci --prefer-offline --no-audit && npx prisma generate && npx prisma migrate deploy && npm run build
```

Este comando:
- Instala dependências do ENEM API
- Gera cliente Prisma
- Executa migrações
- Constrói o aplicativo

## Comandos de Start

### Serviço Principal (hubedu-main)
```bash
chmod +x scripts/render-start.sh && ./scripts/render-start.sh
```

Este comando:
- Inicia o ENEM API na porta 3001
- Inicia o HubEdu.ai na porta configurada pelo Render
- Gerencia ambos os processos simultaneamente
- Inclui logs e monitoramento

### Serviço ENEM API (hubedu-enem-api)
```bash
cd enem-api-main && npm start
```

Este comando:
- Inicia apenas o ENEM API na porta 3001

## Scripts Personalizados

### render-build.sh
- Script robusto com verificações de erro
- Instala dependências para ambos os serviços
- Executa migrações do banco de dados
- Constrói ambos os aplicativos
- Inclui logs coloridos e informativos

### render-start.sh
- Inicia ambos os serviços simultaneamente
- Gerencia processos em background
- Inclui verificação de portas
- Logs separados para cada serviço
- Cleanup automático ao parar

## Variáveis de Ambiente

### Serviço Principal
- `NODE_ENV=production`
- `NEXTAUTH_SECRET` (gerado automaticamente)
- `NEXTAUTH_URL=https://hubedu-main.onrender.com`
- `DATABASE_URL` (conectado ao banco hubedu-db)
- `ENEM_API_URL=https://hubedu-enem-api.onrender.com`
- Chaves de API (OpenAI, Google, GitHub)

### Serviço ENEM API
- `NODE_ENV=production`
- `PORT=3001`
- `DATABASE_URL` (conectado ao banco hubedu-enem-db)
- `NEXTAUTH_SECRET` (gerado automaticamente)
- `NEXTAUTH_URL=https://hubedu-enem-api.onrender.com`

## Bancos de Dados

1. **hubedu-db**: Banco principal do HubEdu.ai
2. **hubedu-enem-db**: Banco específico para o ENEM API

## Deploy no Render

Para fazer o deploy:

1. Conecte seu repositório GitHub ao Render
2. O Render detectará automaticamente o `render.yaml`
3. Criará os serviços e bancos de dados conforme configurado
4. Executará os comandos de build e start automaticamente

## Monitoramento

- Logs do HubEdu.ai: disponíveis no dashboard do Render
- Logs do ENEM API: disponíveis no dashboard do Render
- Ambos os serviços têm health checks automáticos

## Troubleshooting

Se houver problemas:

1. Verifique os logs no dashboard do Render
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se os bancos de dados estão acessíveis
4. Confirme que as portas estão corretas (3000 para HubEdu, 3001 para ENEM API)
