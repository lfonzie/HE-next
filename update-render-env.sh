#!/bin/bash

# Script to update Render environment variables
# This script provides the exact commands to run in Render dashboard

echo "🚀 Render Environment Variables Update Script"
echo "=============================================="
echo ""
echo "Follow these steps to update your Render service environment variables:"
echo ""
echo "1. Go to Render Dashboard: https://dashboard.render.com"
echo "2. Navigate to your service: your-app-name"
echo "3. Click on 'Environment' tab"
echo "4. Add or update the following environment variables:"
echo ""

# Database Configuration
echo "📊 DATABASE CONFIGURATION:"
echo "DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require&channel_binding=require&connect_timeout=10"
echo ""
echo "DIRECT_URL=postgresql://username:password@hostname:port/database?sslmode=require&channel_binding=require&connect_timeout=10"
echo ""

# NextAuth Configuration
echo "🔐 NEXTAUTH CONFIGURATION:"
echo "NEXTAUTH_SECRET=your_nextauth_secret_here"
echo ""
echo "NEXTAUTH_URL=https://your-app-name.onrender.com"
echo ""

# API Keys
echo "🔑 API KEYS:"
echo "OPENAI_API_KEY=your_openai_api_key_here"
echo ""

# Public URLs
echo "🌐 PUBLIC URLS:"
echo "NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com/api"
echo ""

# Unsplash API
echo "📸 UNSPLASH API:"
echo "UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here"
echo ""
echo "UNSPLASH_SECRET_KEY=your_unsplash_secret_key_here"
echo ""

# Feature Flags
echo "🚩 FEATURE FLAGS:"
echo "NEXT_PUBLIC_ENABLE_ANALYTICS=false"
echo ""
echo "NEXT_PUBLIC_ENABLE_DEBUG=false"
echo ""

# API Configuration
echo "⚙️  API CONFIGURATION:"
echo "API_PRIORITY_MODE=hybrid"
echo ""
echo "ENEM_API_PRIORITY=hybrid"
echo ""
echo "ENEM_ENABLE_REAL_QUESTIONS=true"
echo ""
echo "ENEM_ENABLE_DATABASE_FALLBACK=true"
echo ""
echo "ENEM_ENABLE_AI_FALLBACK=true"
echo ""
echo "OPENAI_API_PRIORITY=api"
echo ""
echo "OPENAI_MODEL_SELECTION=auto"
echo ""
echo "UNSPLASH_API_PRIORITY=api"
echo ""
echo "UNSPLASH_ENABLE_IMAGE_SEARCH=true"
echo ""
echo "UNSPLASH_ENABLE_AUTO_IMAGES=true"
echo ""

# General Settings
echo "🔧 GENERAL SETTINGS:"
echo "API_CACHE_TIMEOUT=300000"
echo ""
echo "API_ENABLE_RETRIES=true"
echo ""
echo "API_MAX_RETRIES=3"
echo ""
echo "API_ENABLE_LOGGING=true"
echo ""

# ENEM API
echo "📚 ENEM API:"
echo "ENEM_API_BASE=https://your-app-name.onrender.com"
echo ""
echo "ENEM_API_PREFIX=/v1"
echo ""

echo "5. Save all changes"
echo "6. Click 'Manual Deploy' to trigger a new deployment"
echo "7. Monitor the deployment logs for any errors"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "- The DATABASE_URL uses pooled connection for better performance"
echo "- The DIRECT_URL is used for migrations and CLI operations"
echo "- Both URLs include connect_timeout=10 to handle Neon serverless delays"
echo "- SSL and channel binding are required for Neon connections"
echo ""
echo "🔍 TROUBLESHOOTING:"
echo "If you still get authentication errors:"
echo "1. Verify the role 'neondb_owner' exists in your Neon console"
echo "2. Check that the password is correct"
echo "3. Ensure the database name 'neondb' is correct"
echo "4. Verify the hostname includes the correct region"
echo ""
echo "✅ After updating, test the login functionality on your deployed app!"