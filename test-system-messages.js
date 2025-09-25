// test-system-messages.mjs
// Script para testar o novo sistema de system messages

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 Testando Sistema de System Messages...\n')

// Teste 1: Verificar se o arquivo JSON existe
console.log('1. Verificando arquivo system-message.json...')
const jsonPath = path.join(process.cwd(), 'system-message.json')

if (fs.existsSync(jsonPath)) {
  console.log('✅ Arquivo system-message.json encontrado')
  
  try {
    const content = fs.readFileSync(jsonPath, 'utf-8')
    const config = JSON.parse(content)
    
    console.log(`✅ JSON válido com ${Object.keys(config).length} módulos:`)
    Object.keys(config).forEach(module => {
      const moduleConfig = config[module]
      console.log(`   - ${module}: ${moduleConfig.name} (${moduleConfig.is_active ? 'ativo' : 'inativo'})`)
    })
  } catch (error) {
    console.log('❌ Erro ao ler/parsear JSON:', error.message)
  }
} else {
  console.log('❌ Arquivo system-message.json não encontrado')
}

// Teste 2: Verificar se o loader funciona
console.log('\n2. Testando loader de system messages...')
try {
  // Simular import do loader (em ambiente real seria import)
  const loaderPath = path.join(process.cwd(), 'lib', 'system-message-loader.ts')
  
  if (fs.existsSync(loaderPath)) {
    console.log('✅ Arquivo system-message-loader.ts encontrado')
    
    // Verificar se as funções estão definidas
    const loaderContent = fs.readFileSync(loaderPath, 'utf-8')
    
    const requiredFunctions = [
      'loadSystemMessages',
      'getSystemPrompt',
      'getModuleConfig',
      'getAvailableModules',
      'reloadSystemMessages',
      'isModuleActive',
      'getModuleSettings'
    ]
    
    requiredFunctions.forEach(func => {
      if (loaderContent.includes(`export function ${func}`) || loaderContent.includes(`export const ${func}`)) {
        console.log(`   ✅ Função ${func} encontrada`)
      } else {
        console.log(`   ❌ Função ${func} não encontrada`)
      }
    })
  } else {
    console.log('❌ Arquivo system-message-loader.ts não encontrado')
  }
} catch (error) {
  console.log('❌ Erro ao testar loader:', error.message)
}

// Teste 3: Verificar se as APIs foram criadas
console.log('\n3. Verificando APIs administrativas...')
const apiPaths = [
  'app/api/admin/system-messages/route.ts',
  'app/api/admin/system-messages/reload/route.ts',
  'app/admin/system-messages/page.tsx'
]

apiPaths.forEach(apiPath => {
  const fullPath = path.join(process.cwd(), apiPath)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${apiPath} encontrado`)
  } else {
    console.log(`❌ ${apiPath} não encontrado`)
  }
})

// Teste 4: Verificar se os arquivos de API foram atualizados
console.log('\n4. Verificando atualizações nos arquivos de API...')
const apiFiles = [
  'lib/ai-sdk-config.ts',
  'app/api/chat/ai-sdk-fast/route.ts',
  'app/api/chat/perplexity/route.ts',
  'app/api/chat/ai-sdk/route.ts'
]

apiFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8')
    if (content.includes('system-message-loader')) {
      console.log(`✅ ${filePath} atualizado para usar o novo loader`)
    } else {
      console.log(`❌ ${filePath} não foi atualizado`)
    }
  } else {
    console.log(`❌ ${filePath} não encontrado`)
  }
})

console.log('\n🎉 Teste concluído!')
console.log('\n📋 Próximos passos:')
console.log('1. Acesse /admin/system-messages para editar os prompts')
console.log('2. Teste o chat com diferentes módulos')
console.log('3. Verifique se os prompts estão sendo aplicados corretamente')
console.log('4. Use a interface para fazer ajustes finos nos prompts')
