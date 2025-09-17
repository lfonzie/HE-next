#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Finalizing migration...');

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🗄️ Updating database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🔍 Checking TypeScript types...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });

  console.log('🧹 Running linting...');
  execSync('npm run lint', { stdio: 'inherit' });

  console.log('\n✅ Migration finalized successfully!');
  console.log('\n🚀 Start development with: npm run dev');
} catch (error) {
  console.error('\n❌ Error during finalization:', error.message);
  console.log('\n🔧 Run manually:');
  console.log('1. npm install');
  console.log('2. npx prisma db push');
  console.log('3. npx prisma generate');
  console.log('4. npm run dev');
}

