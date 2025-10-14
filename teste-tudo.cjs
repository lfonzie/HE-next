#!/usr/bin/env node

// Script principal para executar todos os testes do HubEdu.ia
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 SUITE COMPLETA DE TESTES - HUBEDU.IA')
console.log('========================================\n')

async function runTest(testName, scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executando: ${testName}`)
    console.log('-'.repeat(50))
    
    const testProcess = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    })
    
    testProcess.on('close', (code) => {
      console.log('')
      if (code === 0) {
        console.log(`✅ ${testName}: SUCESSO`)
        resolve(true)
      } else {
        console.log(`❌ ${testName}: FALHOU (código ${code})`)
        resolve(false)
      }
      console.log('')
    })
    
    testProcess.on('error', (error) => {
      console.log(`❌ ${testName}: ERRO - ${error.message}`)
      reject(error)
    })
  })
}

async function runAllTests() {
  const tests = [
    {
      name: 'Teste do Servidor',
      script: 'teste-servidor.cjs',
      required: true
    },
    {
      name: 'Teste Rápido do Sistema',
      script: 'teste-rapido.cjs',
      required: true
    },
    {
      name: 'Teste de APIs',
      script: 'teste-apis.cjs',
      required: false
    }
  ]

  const results = []
  
  for (const test of tests) {
    try {
      const success = await runTest(test.name, test.script)
      results.push({ name: test.name, success, required: test.required })
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO CRÍTICO - ${error.message}`)
      results.push({ name: test.name, success: false, required: test.required })
    }
  }

  // Relatório final
  console.log('📊 RELATÓRIO FINAL DOS TESTES')
  console.log('============================')
  
  let totalTests = results.length
  let passedTests = results.filter(r => r.success).length
  let failedRequiredTests = results.filter(r => r.required && !r.success).length
  
  console.log(`Total de testes: ${totalTests}`)
  console.log(`Testes aprovados: ${passedTests}`)
  console.log(`Testes reprovados: ${totalTests - passedTests}`)
  console.log(`Testes obrigatórios falharam: ${failedRequiredTests}`)
  console.log('')
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌'
    const required = result.required ? '(OBRIGATÓRIO)' : '(OPCIONAL)'
    console.log(`${status} ${result.name} ${required}`)
  }
  
  console.log('')
  
  if (failedRequiredTests === 0) {
    console.log('🎉 TODOS OS TESTES OBRIGATÓRIOS PASSARAM!')
    console.log('🚀 HubEdu.ia está pronto para lançamento!')
    console.log('')
    console.log('📝 PRÓXIMOS PASSOS:')
    console.log('1. Execute testes manuais no navegador')
    console.log('2. Verifique logs de erro')
    console.log('3. Teste com usuários reais')
    console.log('4. Prepare para deploy em produção')
  } else {
    console.log('⚠️ ALGUNS TESTES OBRIGATÓRIOS FALHARAM!')
    console.log('🔧 Corrija os problemas antes de prosseguir')
    console.log('')
    console.log('📝 AÇÕES RECOMENDADAS:')
    console.log('1. Verifique logs de erro')
    console.log('2. Confirme se o banco está configurado')
    console.log('3. Verifique variáveis de ambiente')
    console.log('4. Execute: npx prisma generate && npx prisma db push')
  }
  
  console.log('')
  console.log('📚 Para mais informações, consulte:')
  console.log('- GUIA_TESTES_COMPLETO.md')
  console.log('- README.md')
  console.log('- Logs do servidor')
}

// Verificar se scripts existem
const scripts = ['teste-servidor.cjs', 'teste-rapido.cjs', 'teste-apis.cjs']
const missingScripts = scripts.filter(script => !fs.existsSync(script))

if (missingScripts.length > 0) {
  console.log('❌ Scripts de teste não encontrados:')
  missingScripts.forEach(script => console.log(`   - ${script}`))
  console.log('')
  console.log('🔧 Execute primeiro:')
  console.log('   node teste-rapido.cjs')
  console.log('   node teste-apis.cjs')
  console.log('   node teste-servidor.cjs')
  process.exit(1)
}

// Executar todos os testes
runAllTests().catch(console.error)
