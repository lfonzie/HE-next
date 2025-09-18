#!/usr/bin/env node

/**
 * Script para testar a refatoração do componente /aulas
 * Executa testes específicos e gera relatório de cobertura
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Iniciando testes da refatoração do componente /aulas...\n')

// Verificar se as dependências de teste estão instaladas
const requiredDeps = [
  '@testing-library/react',
  '@testing-library/jest-dom',
  'jest',
  'jest-environment-jsdom'
]

console.log('📦 Verificando dependências de teste...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const missingDeps = requiredDeps.filter(dep => !packageJson.devDependencies?.[dep])

if (missingDeps.length > 0) {
  console.log(`❌ Dependências faltando: ${missingDeps.join(', ')}`)
  console.log('💡 Execute: npm install --save-dev ' + missingDeps.join(' '))
  process.exit(1)
}

console.log('✅ Todas as dependências estão instaladas\n')

// Executar testes específicos da refatoração
const testFiles = [
  'tests/components/AulaGenerator.test.tsx',
  'tests/hooks/useAulaGeneration.test.ts',
  'tests/hooks/useAulaCache.test.ts'
]

console.log('🧪 Executando testes da refatoração...\n')

try {
  // Executar testes com cobertura
  const testCommand = `npx jest ${testFiles.join(' ')} --coverage --coverageReporters=text --coverageReporters=html --verbose`
  
  console.log(`📋 Comando: ${testCommand}\n`)
  
  execSync(testCommand, { 
    stdio: 'inherit',
    cwd: process.cwd()
  })
  
  console.log('\n✅ Todos os testes passaram!')
  
  // Verificar cobertura
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
  
  if (fs.existsSync(coveragePath)) {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    const total = coverage.total
    
    console.log('\n📊 Relatório de Cobertura:')
    console.log(`   Linhas: ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`)
    console.log(`   Funções: ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`)
    console.log(`   Branches: ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`)
    console.log(`   Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`)
    
    // Verificar se atingiu o threshold
    const threshold = 70
    const passed = Object.values(total).every(metric => metric.pct >= threshold)
    
    if (passed) {
      console.log(`\n🎯 Meta de cobertura atingida (${threshold}%+)`)
    } else {
      console.log(`\n⚠️  Meta de cobertura não atingida (${threshold}%+)`)
    }
  }
  
  console.log('\n📁 Relatório HTML disponível em: coverage/index.html')
  
} catch (error) {
  console.error('\n❌ Erro ao executar testes:', error.message)
  process.exit(1)
}

// Verificar se os arquivos refatorados existem
console.log('\n🔍 Verificando arquivos refatorados...')

const refactoredFiles = [
  'hooks/useAulaGeneration.ts',
  'hooks/useAulaCache.ts',
  'hooks/useAulaProgress.ts',
  'hooks/useAulaValidation.ts',
  'components/aulas/AulaGenerator.tsx',
  'components/aulas/AulaPreview.tsx',
  'components/aulas/AulaProgress.tsx',
  'components/aulas/AulaSuggestions.tsx',
  'components/aulas/AulasPageRefactored.tsx'
]

let allFilesExist = true

refactoredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - Arquivo não encontrado`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('\n🎉 Refatoração completa! Todos os arquivos foram criados.')
} else {
  console.log('\n⚠️  Alguns arquivos da refatoração estão faltando.')
}

console.log('\n📚 Documentação disponível em: AULAS_REFACTORING_README.md')
console.log('\n🚀 Para usar a versão refatorada, importe:')
console.log('   import AulasPageRefactored from "@/components/aulas/AulasPageRefactored"')


