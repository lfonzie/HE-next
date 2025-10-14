#!/usr/bin/env node

// Script para testar APIs do HubEdu.ia
const https = require('https')
const http = require('http')

const BASE_URL = 'http://localhost:3000'

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (error) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', reject)

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

async function testAPIs() {
  console.log('🌐 TESTE DE APIs DO HUBEDU.IA')
  console.log('==============================\n')

  const tests = [
    {
      name: '1️⃣ Teste de Rate Limiting B2C',
      tests: [
        {
          name: 'Enviar mensagem de chat',
          url: `${BASE_URL}/api/chat/unified`,
          method: 'POST',
          body: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            input: 'Olá, como você está?',
            module: 'chat'
          }
        }
      ]
    },
    {
      name: '2️⃣ Teste de Sistema de Certificados',
      tests: [
        {
          name: 'Obter certificados',
          url: `${BASE_URL}/api/certificates`,
          method: 'GET'
        },
        {
          name: 'Emitir certificado',
          url: `${BASE_URL}/api/certificates`,
          method: 'POST',
          body: {
            action: 'lesson_completed',
            module: 'aulas',
            metadata: {
              lessonId: 'test-lesson-id',
              title: 'Aula de Teste API'
            }
          }
        }
      ]
    },
    {
      name: '3️⃣ Teste de Pricing B2B',
      tests: [
        {
          name: 'Obter planos',
          url: `${BASE_URL}/api/b2b-pricing?action=plans`,
          method: 'GET'
        },
        {
          name: 'Calcular preço para 300 alunos',
          url: `${BASE_URL}/api/b2b-pricing?action=calculate&studentCount=300`,
          method: 'GET'
        },
        {
          name: 'Obter estatísticas',
          url: `${BASE_URL}/api/b2b-pricing?action=stats`,
          method: 'GET'
        }
      ]
    },
    {
      name: '4️⃣ Teste de Simulador ENEM',
      tests: [
        {
          name: 'Obter questões ENEM',
          url: `${BASE_URL}/api/enem/questions-simple`,
          method: 'GET'
        },
        {
          name: 'Criar sessão ENEM',
          url: `${BASE_URL}/api/enem/sessions`,
          method: 'POST',
          body: {
            mode: 'quick',
            areas: ['matematica'],
            questionCount: 5
          }
        }
      ]
    },
    {
      name: '5️⃣ Teste de Correção de Redação',
      tests: [
        {
          name: 'Obter temas de redação',
          url: `${BASE_URL}/api/redacao/temas`,
          method: 'GET'
        },
        {
          name: 'Avaliar redação',
          url: `${BASE_URL}/api/redacao/avaliar`,
          method: 'POST',
          body: {
            content: 'Esta é uma redação de teste para verificar se o sistema está funcionando corretamente.',
            theme: 'A importância da educação no Brasil'
          }
        }
      ]
    }
  ]

  for (const testGroup of tests) {
    console.log(testGroup.name)
    console.log('-'.repeat(50))

    for (const test of testGroup.tests) {
      try {
        console.log(`🔍 ${test.name}...`)
        
        const result = await makeRequest(test.url, {
          method: test.method,
          body: test.body
        })

        if (result.status >= 200 && result.status < 300) {
          console.log(`✅ ${test.name}: OK (${result.status})`)
          if (test.name.includes('Calcular preço')) {
            console.log(`   💰 Preço calculado: R$ ${result.data.calculations?.[0]?.monthlyPrice || 'N/A'}`)
          }
        } else {
          console.log(`⚠️ ${test.name}: Status ${result.status}`)
          if (result.status === 401) {
            console.log('   🔐 Requer autenticação (normal para algumas APIs)')
          }
        }

      } catch (error) {
        console.log(`❌ ${test.name}: ERRO - ${error.message}`)
      }
    }
    console.log('')
  }

  console.log('🎯 TESTE DE APIs CONCLUÍDO!')
  console.log('')
  console.log('📝 NOTAS:')
  console.log('- APIs que retornam 401 são normais (requerem autenticação)')
  console.log('- APIs que retornam 500 podem indicar problemas de configuração')
  console.log('- Para testes completos, execute com usuário autenticado')
}

// Executar testes
testAPIs().catch(console.error)
