#!/usr/bin/env node

/**
 * Script para aplicar migrações do Prisma para as tabelas de telemetria
 * Execute: node scripts/migrate-telemetry.js
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Aplicando migrações do Prisma para telemetria...\n');

try {
  // Gerar cliente Prisma
  console.log('📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Aplicar migrações
  console.log('🗄️ Aplicando migrações do banco de dados...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ Migrações aplicadas com sucesso!');
  console.log('\n📊 Tabelas criadas:');
  console.log('  - TraceSpan (traces)');
  console.log('  - MetricPoint (métricas)');
  console.log('  - LogRecord (logs)');
  console.log('\n🔗 Próximos passos:');
  console.log('  1. Configure as variáveis de ambiente do OpenTelemetry');
  console.log('  2. Inicie o OTel Collector');
  console.log('  3. Acesse /status para ver o dashboard');

} catch (error) {
  console.error('❌ Erro ao aplicar migrações:', error.message);
  process.exit(1);
}
