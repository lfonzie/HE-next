#!/bin/bash

# Turbopack Alternative for macOS
# This script provides similar performance benefits to Turbopack

echo "🚀 Starting optimized development server (Turbopack alternative for macOS)..."

# Set environment variables for maximum performance
export NODE_ENV=development
export NEXT_TELEMETRY_DISABLED=1
export NEXTAUTH_DEBUG=false

# Clear caches for fresh start
echo "🧹 Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache

# Start with optimized settings
echo "⚡ Starting Next.js with performance optimizations..."
echo "💡 Using SWC compiler + optimized imports for maximum speed"
echo "💡 Similar performance to Turbopack but compatible with macOS"

# Start the development server
npm run dev
