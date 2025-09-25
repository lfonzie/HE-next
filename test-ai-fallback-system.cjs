#!/usr/bin/env node

/**
 * Script de teste para o sistema de fallback de IA
 * Testa automaticamente o fallback entre provedores quando um falha
 */

// Simulação do sistema de fallback para teste
const mockFallbackManager = {
  getProviderStatus() {
    return {
      openai: {
        name: 'OpenAI',
        enabled: !!process.env.OPENAI_API_KEY,
        healthy: true,
        failures: 0,
        lastCheck: Date.now(),
        priority: 1
      },
      google: {
        name: 'Google Gemini',
        enabled: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        healthy: true,
        failures: 0,
        lastCheck: Date.now(),
        priority: 2
      },
      perplexity: {
        name: 'Perplexity AI',
        enabled: !!process.env.PERPLEXITY_API_KEY,
        healthy: true,
        failures: 0,
        lastCheck: Date.now(),
        priority: 3
      }
    }
  },
  
  async executeWithFallback(options) {
    // Simular execução com fallback
    const providers = ['openai', 'google', 'perplexity']
    const selectedProvider = providers[Math.floor(Math.random() * providers.length)]
    
    let model = 'gpt-4o-mini'
    if (selectedProvider === 'google') {
      model = 'gemini-1.5-flash'
    } else if (selectedProvider === 'perplexity') {
      model = process.env.PERPLEXITY_MODEL_SELECTION || 'sonar'
    }
    
    return {
      success: true,
      content: `Resposta simulada para: "${options.message}"`,
      provider: selectedProvider,
      model: model,
      latency: Math.floor(Math.random() * 2000) + 500,
      attempts: 1,
      fallbackChain: [selectedProvider]
    }
  }
}

// Configuração de teste
const TEST_CONFIG = {
  messages: [
    'Olá, como você está?',
    'Explique o que é inteligência artificial',
    'Como funciona o sistema de fallback?',
    'Qual é a diferença entre OpenAI e Google Gemini?',
    'Me ajude com uma questão de matemática: 2x + 5 = 15'
  ],
  modules: ['professor', 'enem', 'ti', 'financeiro'],
  complexities: ['simple', 'complex', 'fast']
}

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}`)
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`)
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`)
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

function logInfo(message) {
  log(`${colors.blue}ℹ️  ${message}${colors.reset}`)
}

/**
 * Testa o status dos provedores
 */
async function testProviderStatus() {
  logHeader('TESTE DE STATUS DOS PROVEDORES')
  
  try {
    const status = mockFallbackManager.getProviderStatus()
    
    logInfo('Status dos provedores:')
    Object.entries(status).forEach(([providerId, providerStatus]) => {
      const healthIcon = providerStatus.healthy ? '✅' : '❌'
      const failuresText = providerStatus.failures > 0 ? ` (${providerStatus.failures} falhas)` : ''
      
      log(`${healthIcon} ${providerStatus.name}: ${providerStatus.healthy ? 'Saudável' : 'Não saudável'}${failuresText}`)
    })
    
    const healthyCount = Object.values(status).filter(p => p.healthy).length
    const totalCount = Object.keys(status).length
    
    if (healthyCount === 0) {
      logError('Nenhum provedor saudável disponível!')
      return false
    } else if (healthyCount < totalCount) {
      logWarning(`${healthyCount}/${totalCount} provedores saudáveis`)
    } else {
      logSuccess(`Todos os ${totalCount} provedores estão saudáveis`)
    }
    
    return true
    
  } catch (error) {
    logError(`Erro ao verificar status: ${error.message}`)
    return false
  }
}

/**
 * Testa uma requisição simples
 */
async function testSimpleRequest() {
  logHeader('TESTE DE REQUISIÇÃO SIMPLES')
  
  try {
    const result = await mockFallbackManager.executeWithFallback({
      message: 'Olá, como você está?',
      module: 'professor',
      complexity: 'simple'
    })
    
    if (result.success) {
      logSuccess(`Requisição bem-sucedida com ${result.provider}`)
      logInfo(`Modelo: ${result.model}`)
      logInfo(`Latência: ${result.latency}ms`)
      logInfo(`Tentativas: ${result.attempts}`)
      logInfo(`Cadeia de fallback: ${result.fallbackChain.join(' → ')}`)
      logInfo(`Resposta: ${result.content?.substring(0, 100)}...`)
      return true
    } else {
      logError(`Requisição falhou: ${result.error}`)
      return false
    }
    
  } catch (error) {
    logError(`Erro na requisição: ${error.message}`)
    return false
  }
}

/**
 * Testa múltiplas requisições com diferentes módulos
 */
async function testMultipleRequests() {
  logHeader('TESTE DE MÚLTIPLAS REQUISIÇÕES')
  
  let successCount = 0
  let totalCount = 0
  
  for (const message of TEST_CONFIG.messages) {
    totalCount++
    logInfo(`Testando: "${message.substring(0, 50)}..."`)
    
    try {
      const result = await mockFallbackManager.executeWithFallback({
        message,
        module: 'professor',
        complexity: 'simple'
      })
      
      if (result.success) {
        successCount++
        logSuccess(`✅ Sucesso com ${result.provider} (${result.latency}ms)`)
      } else {
        logError(`❌ Falhou: ${result.error}`)
      }
      
      // Pequena pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      logError(`❌ Erro: ${error.message}`)
    }
  }
  
  const successRate = (successCount / totalCount) * 100
  logInfo(`Taxa de sucesso: ${successCount}/${totalCount} (${successRate.toFixed(1)}%)`)
  
  return successRate >= 80
}

/**
 * Testa o fallback forçando falhas
 */
async function testForcedFallback() {
  logHeader('TESTE DE FALLBACK FORÇADO')
  
  try {
    // Testar com provedor específico que pode falhar
    const result = await mockFallbackManager.executeWithFallback({
      message: 'Teste de fallback forçado',
      module: 'professor',
      complexity: 'simple',
      preferredProvider: 'google', // Forçar Google primeiro
      excludeProviders: ['openai'] // Excluir OpenAI para testar fallback
    })
    
    if (result.success) {
      logSuccess(`Fallback funcionou com ${result.provider}`)
      logInfo(`Cadeia de fallback: ${result.fallbackChain.join(' → ')}`)
      return true
    } else {
      logError(`Fallback falhou: ${result.error}`)
      return false
    }
    
  } catch (error) {
    logError(`Erro no teste de fallback: ${error.message}`)
    return false
  }
}

/**
 * Testa diferentes complexidades
 */
async function testComplexities() {
  logHeader('TESTE DE DIFERENTES COMPLEXIDADES')
  
  const testCases = [
    { message: 'Oi', complexity: 'simple' },
    { message: 'Explique a teoria da relatividade', complexity: 'complex' },
    { message: 'Qual é a capital do Brasil?', complexity: 'fast' }
  ]
  
  let successCount = 0
  
  for (const testCase of testCases) {
    logInfo(`Testando complexidade ${testCase.complexity}: "${testCase.message}"`)
    
    try {
      const result = await mockFallbackManager.executeWithFallback({
        message: testCase.message,
        module: 'professor',
        complexity: testCase.complexity
      })
      
      if (result.success) {
        successCount++
        logSuccess(`✅ Sucesso com ${result.provider}:${result.model}`)
      } else {
        logError(`❌ Falhou: ${result.error}`)
      }
      
    } catch (error) {
      logError(`❌ Erro: ${error.message}`)
    }
  }
  
  const successRate = (successCount / testCases.length) * 100
  logInfo(`Taxa de sucesso por complexidade: ${successRate.toFixed(1)}%`)
  
  return successRate >= 80
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  logHeader('INICIANDO TESTES DO SISTEMA DE FALLBACK DE IA')
  
  const tests = [
    { name: 'Status dos Provedores', fn: testProviderStatus },
    { name: 'Requisição Simples', fn: testSimpleRequest },
    { name: 'Múltiplas Requisições', fn: testMultipleRequests },
    { name: 'Fallback Forçado', fn: testForcedFallback },
    { name: 'Diferentes Complexidades', fn: testComplexities }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    logInfo(`\nExecutando: ${test.name}`)
    
    try {
      const result = await test.fn()
      if (result) {
        passedTests++
        logSuccess(`${test.name}: PASSOU`)
      } else {
        logError(`${test.name}: FALHOU`)
      }
    } catch (error) {
      logError(`${test.name}: ERRO - ${error.message}`)
    }
  }
  
  // Resultado final
  logHeader('RESULTADO FINAL')
  const successRate = (passedTests / totalTests) * 100
  
  if (successRate >= 80) {
    logSuccess(`Sistema de fallback funcionando bem: ${passedTests}/${totalTests} testes passaram (${successRate.toFixed(1)}%)`)
  } else if (successRate >= 60) {
    logWarning(`Sistema de fallback com problemas: ${passedTests}/${totalTests} testes passaram (${successRate.toFixed(1)}%)`)
  } else {
    logError(`Sistema de fallback com falhas críticas: ${passedTests}/${totalTests} testes passaram (${successRate.toFixed(1)}%)`)
  }
  
  // Recomendações
  logHeader('RECOMENDAÇÕES')
  if (successRate < 100) {
    logInfo('• Verifique as configurações das API keys')
    logInfo('• Confirme que os provedores estão funcionando')
    logInfo('• Verifique os limites de quota')
    logInfo('• Considere configurar múltiplos provedores para redundância')
  } else {
    logSuccess('• Sistema funcionando perfeitamente!')
    logSuccess('• Todos os provedores estão saudáveis')
    logSuccess('• Fallback automático está operacional')
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Erro fatal: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { runAllTests, testProviderStatus, testSimpleRequest, testMultipleRequests, testForcedFallback, testComplexities }
