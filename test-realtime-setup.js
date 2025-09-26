#!/usr/bin/env node

/**
 * Script de teste para OpenAI Realtime API
 * Verifica se a configuração está correta e testa a conectividade
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('\n🔍 Verificando arquivo de configuração...', 'blue');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), 'env.realtime.example');
  
  if (!fs.existsSync(envPath)) {
    log('❌ Arquivo .env.local não encontrado', 'red');
    if (fs.existsSync(envExamplePath)) {
      log('💡 Copie o arquivo de exemplo:', 'yellow');
      log(`   cp env.realtime.example .env.local`, 'yellow');
    }
    return false;
  }
  
  log('✅ Arquivo .env.local encontrado', 'green');
  return true;
}

function checkApiKey() {
  log('\n🔑 Verificando API key...', 'blue');
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
    
    if (!apiKeyMatch) {
      log('❌ OPENAI_API_KEY não encontrada no .env.local', 'red');
      return false;
    }
    
    const apiKey = apiKeyMatch[1].trim();
    
    if (apiKey === 'your_openai_api_key_here' || !apiKey) {
      log('❌ OPENAI_API_KEY não configurada', 'red');
      log('💡 Configure sua API key no arquivo .env.local:', 'yellow');
      log('   OPENAI_API_KEY=sk-your-actual-api-key-here', 'yellow');
      return false;
    }
    
    if (!apiKey.startsWith('sk-')) {
      log('⚠️  API key não parece ser válida (deve começar com "sk-")', 'yellow');
    }
    
    log('✅ OPENAI_API_KEY configurada', 'green');
    return true;
  } catch (error) {
    log('❌ Erro ao ler arquivo .env.local', 'red');
    return false;
  }
}

function testOpenAIConnection() {
  log('\n🌐 Testando conexão com OpenAI API...', 'blue');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const models = JSON.parse(data);
            const realtimeModels = models.data.filter(model => 
              model.id.includes('realtime')
            );
            
            if (realtimeModels.length > 0) {
              log('✅ Conexão com OpenAI API bem-sucedida', 'green');
              log(`📋 Modelos Realtime disponíveis: ${realtimeModels.map(m => m.id).join(', ')}`, 'green');
              resolve(true);
            } else {
              log('⚠️  Conexão OK, mas nenhum modelo Realtime encontrado', 'yellow');
              log('💡 Verifique se sua conta tem acesso ao Realtime API', 'yellow');
              resolve(false);
            }
          } catch (error) {
            log('❌ Erro ao processar resposta da API', 'red');
            resolve(false);
          }
        } else {
          log(`❌ Erro na API: ${res.statusCode}`, 'red');
          if (res.statusCode === 401) {
            log('💡 Verifique se sua API key está correta', 'yellow');
          }
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Erro de conexão: ${error.message}`, 'red');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      log('❌ Timeout na conexão com OpenAI API', 'red');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

function checkProjectStructure() {
  log('\n📁 Verificando estrutura do projeto...', 'blue');
  
  const requiredFiles = [
    'app/api/realtime/route.ts',
    'app/api/realtime/websocket/route.ts',
    'app/realtime/page.tsx',
    'hooks/useRealtime.ts',
    'hooks/useWebSocket.ts',
    'components/realtime/RealtimeComponents.tsx',
    'components/realtime/SimpleRealtimeExample.tsx'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file}`, 'red');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function checkDependencies() {
  log('\n📦 Verificando dependências...', 'blue');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json não encontrado', 'red');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['next', 'react', 'react-dom', 'openai'];
    
    let allDepsExist = true;
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log(`✅ ${dep}`, 'green');
      } else {
        log(`❌ ${dep}`, 'red');
        allDepsExist = false;
      }
    });
    
    return allDepsExist;
  } catch (error) {
    log('❌ Erro ao ler package.json', 'red');
    return false;
  }
}

async function main() {
  log('🚀 Teste de Configuração - OpenAI Realtime API', 'bold');
  log('=' .repeat(50), 'blue');
  
  const checks = [
    { name: 'Arquivo de configuração', fn: checkEnvFile },
    { name: 'API Key', fn: checkApiKey },
    { name: 'Estrutura do projeto', fn: checkProjectStructure },
    { name: 'Dependências', fn: checkDependencies },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const result = await check.fn();
    if (!result) {
      allPassed = false;
    }
  }
  
  // Teste de conexão apenas se tudo mais estiver OK
  if (allPassed) {
    const connectionResult = await testOpenAIConnection();
    if (!connectionResult) {
      allPassed = false;
    }
  }
  
  log('\n' + '=' .repeat(50), 'blue');
  
  if (allPassed) {
    log('🎉 Tudo configurado corretamente!', 'green');
    log('\n📋 Próximos passos:', 'blue');
    log('1. Execute: npm run dev', 'yellow');
    log('2. Acesse: http://localhost:3000/realtime', 'yellow');
    log('3. Teste a conexão WebRTC e WebSocket', 'yellow');
  } else {
    log('❌ Alguns problemas foram encontrados', 'red');
    log('\n💡 Verifique os erros acima e corrija antes de continuar', 'yellow');
  }
  
  log('\n📚 Documentação completa: OPENAI_REALTIME_README.md', 'blue');
}

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

main().catch(console.error);
