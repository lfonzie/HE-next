#!/bin/bash

# Script para limpeza do app - Remove páginas de teste e demo
echo "🧹 Iniciando limpeza do app..."

# Lista de diretórios para remover
TEST_DIRS=(
    "app/test-auth"
    "app/test-freepik-fix"
    "app/test-freepik-search"
    "app/test-gemini-audio-page"
    "app/test-gemini-simple"
    "app/test-google-tts"
    "app/test-header"
    "app/test-hubedu-interactive"
    "app/test-image-providers"
    "app/test-image-validation"
    "app/test-images"
    "app/test-live-audio-aulas"
    "app/test-math"
    "app/test-openai-avatar"
    "app/test-progressive"
    "app/test-relevance-analysis"
    "app/test-tts"
    "app/test-unified-chat"
    "app/test-visual"
    "app/test-voices"
    "app/teste-imagens"
    "app/teste-imggen"
)

DEMO_DIRS=(
    "app/demo"
    "app/demo-enhanced"
    "app/demo-register"
    "app/demo-simple"
    "app/perplexity-demo"
    "app/pixabay-demo"
    "app/semantic-images-demo"
    "app/unsplash-demo"
    "app/multi-provider-demo"
    "app/responsive-demo"
    "app/sidebar-demo"
    "app/splash-test"
    "app/loading-demo"
)

DEBUG_DIRS=(
    "app/debug-auth"
    "app/clear-cache"
    "app/google-tts-setup"
    "app/tts-setup"
    "app/tts-speed-demo"
    "app/freepik-search"
    "app/api-demo"
)

AUDIO_EXPERIMENTAL_DIRS=(
    "app/gemini-audio"
    "app/gemini-live-auto"
    "app/gemini-live-optimized"
    "app/gemini-live-simple"
    "app/gemini-live-voice"
    "app/gemini-native-audio"
    "app/gemini-realtime-voice"
    "app/live-audio"
    "app/live-stream"
    "app/realtime"
    "app/realtime-media"
    "app/realtime-simple"
    "app/realtime-test"
)

STATUS_DIRS=(
    "app/status"
    "app/status-public"
    "app/status-simple"
)

BACKUP_FILES=(
    "app/page-backup.tsx"
    "app/page-coming-soon-backup.tsx"
    "app/page-landing-complete.tsx"
    "app/page-landing1709.tsx"
    "app/page-original-backup.tsx"
    "app/page-test.tsx"
    "app/page.tsx.backup"
    "app/page.tsx.backup2"
    "app/demo-enhanced/page.tsx.backup"
    "app/redacao/page.tsx.backup"
    "app/pagina-completa"
)

# Função para remover diretórios
remove_dirs() {
    local dirs=("$@")
    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo "🗑️  Removendo: $dir"
            rm -rf "$dir"
        else
            echo "⚠️  Não encontrado: $dir"
        fi
    done
}

# Função para remover arquivos
remove_files() {
    local files=("$@")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo "🗑️  Removendo: $file"
            rm -f "$file"
        else
            echo "⚠️  Não encontrado: $file"
        fi
    done
}

echo "📊 Estatísticas antes da limpeza:"
echo "   Diretórios de teste: ${#TEST_DIRS[@]}"
echo "   Diretórios de demo: ${#DEMO_DIRS[@]}"
echo "   Diretórios de debug: ${#DEBUG_DIRS[@]}"
echo "   Diretórios de áudio experimental: ${#AUDIO_EXPERIMENTAL_DIRS[@]}"
echo "   Diretórios de status: ${#STATUS_DIRS[@]}"
echo "   Arquivos backup: ${#BACKUP_FILES[@]}"
echo ""

# Remover diretórios
echo "🧹 Removendo páginas de teste..."
remove_dirs "${TEST_DIRS[@]}"

echo "🧹 Removendo páginas de demo..."
remove_dirs "${DEMO_DIRS[@]}"

echo "🧹 Removendo páginas de debug..."
remove_dirs "${DEBUG_DIRS[@]}"

echo "🧹 Removendo páginas de áudio experimental..."
remove_dirs "${AUDIO_EXPERIMENTAL_DIRS[@]}"

echo "🧹 Removendo páginas de status..."
remove_dirs "${STATUS_DIRS[@]}"

echo "🧹 Removendo arquivos backup..."
remove_files "${BACKUP_FILES[@]}"

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verificar se o app ainda funciona: npm run dev"
echo "2. Testar as funcionalidades principais"
echo "3. Remover APIs duplicadas se necessário"
echo "4. Organizar componentes restantes"
echo ""
echo "🎯 Páginas principais mantidas:"
echo "   - Autenticação: (auth)/"
echo "   - Dashboard: (dashboard)/"
echo "   - Funcionalidades: enem/, redacao/, simulador/, etc."
echo "   - Admin: admin/"
echo "   - Embed: embed/"
