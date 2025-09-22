#!/bin/bash

# Script de teste para a API de busca semântica de imagens
# Uso: ./test-semantic-images.sh "sua busca aqui"

QUERY="${1:-aula sobre como funciona a internet}"
BASE_URL="http://localhost:3000"

echo "🔍 Testando busca semântica: '$QUERY'"
echo "================================================"

# Teste básico
echo "📡 Teste básico:"
curl -s "${BASE_URL}/api/semantic-images?q=${QUERY// /%20}" | jq '.'

echo -e "\n"

# Teste com orientação
echo "📡 Teste com orientação landscape:"
curl -s "${BASE_URL}/api/semantic-images?q=${QUERY// /%20}&orientation=landscape" | jq '.'

echo -e "\n"

# Teste com mais resultados por provedor
echo "📡 Teste com mais resultados (perProvider=20):"
curl -s "${BASE_URL}/api/semantic-images?q=${QUERY// /%20}&perProvider=20" | jq '.'

echo -e "\n"

# Teste de erro (sem query)
echo "📡 Teste de erro (sem query):"
curl -s "${BASE_URL}/api/semantic-images" | jq '.'

echo -e "\n"

# Teste com query vazia
echo "📡 Teste com query vazia:"
curl -s "${BASE_URL}/api/semantic-images?q=" | jq '.'

echo -e "\n"
echo "✅ Testes concluídos!"
echo ""
echo "💡 Dicas:"
echo "- Use jq para formatação JSON mais legível"
echo "- Substitua localhost:3000 pela URL do seu ambiente"
echo "- Teste diferentes queries educacionais"
echo "- Verifique os scores semânticos nos resultados"
