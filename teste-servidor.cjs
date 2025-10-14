#!/usr/bin/env node

// Script para testar se o servidor está rodando e funcionando
const { spawn } = require('child_process')
const http = require('http')

const SERVER_URL = 'http://localhost:3000'
const MAX_RETRIES = 10
const RETRY_DELAY = 2000

function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.get(SERVER_URL, (res) => {
      resolve(res.statusCode)
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

async function waitForServer() {
  console.log('🔄 Aguardando servidor iniciar...')
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const statusCode = await checkServer()
      if (statusCode === 200) {
        console.log('✅ Servidor está rodando!')
        return true
      }
    } catch (error) {
      console.log(`⏳ Tentativa ${i + 1}/${MAX_RETRIES} - Servidor não está pronto...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    }
  }
  
  console.log('❌ Servidor não iniciou após', MAX_RETRIES * RETRY_DELAY / 1000, 'segundos')
  return false
}

function startServer() {
  console.log('🚀 Iniciando servidor de desenvolvimento...')
  
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  })

  server.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Ready') || output.includes('started server')) {
      console.log('📡 Servidor iniciado!')
    }
  })

  server.stderr.on('data', (data) => {
    console.error('❌ Erro do servidor:', data.toString())
  })

  server.on('close', (code) => {
    console.log(`🛑 Servidor encerrado com código ${code}`)
  })

  return server
}

async function testServer() {
  console.log('🧪 TESTE DO SERVIDOR HUBEDU.IA')
  console.log('==============================\n')

  // Verificar se servidor já está rodando
  try {
    const statusCode = await checkServer()
    if (statusCode === 200) {
      console.log('✅ Servidor já está rodando!')
      return true
    }
  } catch (error) {
    console.log('🔄 Servidor não está rodando, iniciando...')
  }

  // Iniciar servidor
  const serverProcess = startServer()
  
  // Aguardar servidor iniciar
  const serverReady = await waitForServer()
  
  if (!serverReady) {
    console.log('❌ Falha ao iniciar servidor')
    serverProcess.kill()
    return false
  }

  // Testar endpoints básicos
  console.log('\n🔍 Testando endpoints básicos...')
  
  const endpoints = [
    { path: '/', name: 'Página inicial' },
    { path: '/enem', name: 'Simulador ENEM' },
    { path: '/redacao', name: 'Correção de Redação' },
    { path: '/aulas', name: 'Biblioteca de Aulas' },
    { path: '/api/b2b-pricing?action=plans', name: 'API Pricing B2B' }
  ]

  for (const endpoint of endpoints) {
    try {
      const statusCode = await checkServer(endpoint.path)
      if (statusCode === 200 || statusCode === 401) {
        console.log(`✅ ${endpoint.name}: OK (${statusCode})`)
      } else {
        console.log(`⚠️ ${endpoint.name}: Status ${statusCode}`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERRO - ${error.message}`)
    }
  }

  console.log('\n🎉 TESTE DO SERVIDOR CONCLUÍDO!')
  console.log('')
  console.log('📝 PRÓXIMOS PASSOS:')
  console.log('1. Execute: node teste-rapido.cjs')
  console.log('2. Execute: node teste-apis.cjs')
  console.log('3. Acesse: http://localhost:3000')
  console.log('4. Teste manualmente cada funcionalidade')
  
  return true
}

// Executar teste
testServer().catch(console.error)
