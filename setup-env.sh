#!/bin/bash

# Environment Setup Script for HE-next
# This script helps you set up your environment variables properly

echo "🚀 Setting up environment variables for HE-next..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy template to .env.local
if [ -f "env.local.template" ]; then
    cp env.local.template .env.local
    echo "✅ Created .env.local from template"
else
    echo "❌ Template file not found. Please ensure env.local.template exists."
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local and replace placeholder values with your actual API keys"
echo "2. Get API keys from:"
echo "   - Unsplash: https://unsplash.com/developers"
echo "   - Pixabay: https://pixabay.com/api/docs/"
echo "   - Bing: https://azure.microsoft.com/en-us/services/cognitive-services/bing-image-search-api/"
echo "   - Pexels: https://www.pexels.com/api/"
echo "   - Google Gemini: https://ai.google.dev/"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo ""
echo "3. Generate a secure secret for NEXTAUTH_SECRET:"
echo "   openssl rand -base64 32"
echo ""
echo "4. Restart your development server after updating the environment variables"
echo ""
echo "🔧 Critical variables to fix log issues:"
echo "   - PIXABAY_API_KEY (fixes 'API key não configurada' error)"
echo "   - BING_SEARCH_API_KEY (fixes Bing search failures)"
echo "   - PEXELS_API_KEY (fixes Pexels search failures)"
echo "   - NEXTAUTH_SECRET (fixes JWT_SESSION_ERROR)"
echo "   - DEFAULT_SCHOOL_ID (fixes empty schoolId warning)"