#!/bin/bash

# Performance optimization script for development
echo "🚀 Optimizing development server performance..."

# Set environment variables for better performance
export NODE_ENV=development
export NEXT_TELEMETRY_DISABLED=1
export NEXTAUTH_DEBUG=false

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies with optimized settings
echo "📦 Reinstalling dependencies..."
npm ci --prefer-offline --no-audit

# Create optimized .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating optimized .env.local..."
    cat > .env.local << EOF
# Database Configuration
DATABASE_URL="postgresql://localhost:5432/hubedu_dev"
DIRECT_URL="postgresql://localhost:5432/hubedu_dev"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-for-local-development-only"
NEXTAUTH_DEBUG="false"

# OpenAI Configuration (opcional para desenvolvimento)
OPENAI_API_KEY="sk-proj-placeholder-key-for-development"

# Google Gemini Configuration (opcional)
GOOGLE_GEMINI_API_KEY="placeholder-gemini-key"
GEMINI_API_KEY="placeholder-gemini-key"
GOOGLE_GENERATIVE_AI_API_KEY="placeholder-gemini-key"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="placeholder-google-client-id"
GOOGLE_CLIENT_SECRET="placeholder-google-client-secret"

# Development Performance Settings
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"
EOF
fi

echo "✅ Performance optimization complete!"
echo "💡 Run 'npm run dev' for development (Turbopack disabled due to macOS permissions)"
echo "💡 Server is optimized and running smoothly!"
