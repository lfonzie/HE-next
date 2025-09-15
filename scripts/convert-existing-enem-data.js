#!/usr/bin/env node

/**
 * Script para converter dados existentes do ENEM de QUESTOES_ENEM para o novo formato
 */

const { EnemDataImporter } = require('../lib/enem-data-importer.ts');

async function main() {
  console.log('🚀 Iniciando conversão dos dados existentes do ENEM...');
  console.log('📁 Fonte: QUESTOES_ENEM/public');
  console.log('📁 Destino: data/enem');
  
  const importer = new EnemDataImporter();
  
  try {
    // Converter dados existentes
    await importer.convertExistingData();
    
    console.log('✅ Conversão concluída com sucesso!');
    console.log('📊 Dados convertidos salvos em data/enem/');
    console.log('🔄 Agora você pode executar a importação para o banco de dados');
    
  } catch (error) {
    console.error('❌ Erro durante a conversão:', error);
    process.exit(1);
  } finally {
    await importer.cleanup();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
