#!/bin/bash

# Setup script for HubEdu.ai environment variables
echo "🔧 Setting up HubEdu.ai environment..."

# Create .env.local file
cat > .env.local << 'EOF'
# Environment variables for local development

# Database (REQUIRED - Update with your PostgreSQL connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu_db"

# NextAuth.js (REQUIRED - Generate a secure secret)
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (REQUIRED - Get from platform.openai.com)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# External APIs
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Unsplash API (opcional - para busca de imagens)
UNSPLASH_ACCESS_KEY="QLwU2RvlL-4pIi5UP3_YYbgyyxXGt5unln1xBzzkezM"
UNSPLASH_SECRET_KEY="UYj7_oSSR8PLsTcMqHHFvTnqywW_ZT7U-L6OKjCY3Ng"

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
EOF

echo "✅ Created .env.local file"
echo ""
echo "⚠️  IMPORTANT: You need to update the following variables in .env.local:"
echo "   1. DATABASE_URL - Set up a PostgreSQL database"
echo "   2. NEXTAUTH_SECRET - Generate a secure secret (32+ characters)"
echo "   3. OPENAI_API_KEY - Get from platform.openai.com"
echo ""
echo "🔑 To generate a secure NEXTAUTH_SECRET, run:"
echo "   openssl rand -base64 32"
echo ""
echo "📚 For database setup options:"
echo "   - Local PostgreSQL"
echo "   - Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
echo "   - Cloud: Neon, Supabase, or Railway"
echo ""
echo "🚀 After updating .env.local, run:"
echo "   npx prisma db push"
echo "   npx prisma db seed"
echo "   npm run dev"
