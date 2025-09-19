#!/bin/bash

# Fix Turbopack Permission Issues Script
# This script addresses common permission issues with Turbopack on macOS

echo "🔧 Fixing Turbopack Permission Issues..."

# 1. Stop any running Next.js processes
echo "📋 Stopping running Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# 2. Clear all caches
echo "🧹 Clearing caches..."
rm -rf .next
rm -rf /var/folders/*/T/next-* 2>/dev/null || true
rm -rf node_modules/.cache
rm -rf ~/.npm/_cacache 2>/dev/null || true

# 3. Fix project permissions
echo "🔐 Fixing project permissions..."
chmod -R u+rw .
chmod -R u+rw node_modules 2>/dev/null || true

# 4. Fix npm cache permissions
echo "📦 Fixing npm cache permissions..."
if [ -d ~/.npm ]; then
    chmod -R u+rw ~/.npm
fi

# 5. Create necessary directories with proper permissions
echo "📁 Creating directories with proper permissions..."
mkdir -p .next
mkdir -p node_modules/.cache
chmod -R u+rw .next
chmod -R u+rw node_modules/.cache 2>/dev/null || true

# 6. Check Node.js version compatibility
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version $NODE_VERSION may not be compatible with Turbopack"
    echo "   Recommended: Node.js 18 or later"
fi

# 7. Check if running on macOS and suggest TCC permissions
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - checking security settings..."
    echo "   If Turbopack still fails, check System Settings > Privacy & Security > Files and Folders"
    echo "   Ensure Terminal/Node.js has access to:"
    echo "   - Full Disk Access"
    echo "   - Developer Tools"
fi

echo "✅ Permission fixes completed!"
echo ""
echo "🚀 You can now try:"
echo "   npm run dev:turbo    # Start with Turbopack"
echo "   npm run dev          # Start with regular Webpack"
echo ""
echo "📝 If Turbopack still fails, the issue may be:"
echo "   - macOS security restrictions (TCC)"
echo "   - Turbopack experimental bugs"
echo "   - Use 'npm run dev' as fallback"
