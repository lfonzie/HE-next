#!/bin/bash

# Script para atualizar projetos existentes no Render
echo "🔄 Atualizando projetos existentes no Render..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Instruções para atualizar projetos existentes:${NC}"
echo ""
echo -e "${YELLOW}1. HubEdu.ai (Projeto Existente):${NC}"
echo "   - Build Command: npm install --prefer-offline --no-audit && npm run build"
echo "   - Start Command: npm start"
echo "   - Root Directory: . (raiz do repositório)"
echo "   - Health Check Path: /api/health"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT=10000"
echo "     ENEM_API_BASE=https://enem-api.onrender.com/v1"
echo "     ENEM_FALLBACK_MODEL=gpt-4o-mini"
echo "     NEXTAUTH_URL=https://seu-hubedu-app.onrender.com"
echo ""
echo -e "${YELLOW}2. ENEM API (Projeto Existente):${NC}"
echo "   - Build Command: npm install --prefer-offline --no-audit && npx prisma generate && npm run build"
echo "   - Start Command: npm start"
echo "   - Root Directory: enem-api-main"
echo "   - Health Check Path: /api/health"
echo "   - Environment Variables:"
echo "     NODE_ENV=production"
echo "     PORT=11000"
echo ""
echo -e "${GREEN}✅ Passos para atualizar:${NC}"
echo "1. Acesse o Render Dashboard"
echo "2. Vá para cada projeto existente"
echo "3. Atualize as configurações conforme acima"
echo "4. Faça deploy manual de ambos os projetos"
echo "5. Teste os endpoints de health check"
echo ""
echo -e "${BLUE}🔗 URLs para testar após deploy:${NC}"
echo "- Health HubEdu.ai: https://seu-hubedu-app.onrender.com/api/health"
echo "- Health ENEM API: https://enem-api.onrender.com/api/health"
echo "- Questões ENEM: https://seu-hubedu-app.onrender.com/api/enem/questions?area=linguagens&limit=5"
echo ""
echo -e "${YELLOW}💡 Dica:${NC} Mantenha todas as variáveis de ambiente existentes e apenas adicione/atualize as novas!"
