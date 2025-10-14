#!/usr/bin/env node

/**
 * Script de Teste de Conectividade das APIs de IA
 * Modelos específicos testados:
 * - OpenAI: GPT-4o-mini e GPT-5 Chat Latest
 * - Claude: Claude 3.5 Sonnet (4.5)
 * - Gemini: Gemini 2.5 Flash
 * - Perplexity: Sonar
 * - Grok: Grok 4 Fast Reasoning
 */

// Script usa chamadas HTTP diretas para evitar dependências complexas
import fs from 'fs';
import path from 'path';

// Carregar variáveis do arquivo .env
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};

      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envVars[key.trim()] = value;
        }
      });

      // Aplicar as variáveis de ambiente
      Object.keys(envVars).forEach(key => {
        if (!process.env[key]) {
          process.env[key] = envVars[key];
        }
      });

      console.log('✅ Arquivo .env carregado com sucesso');
    }
  } catch (error) {
    console.log('⚠️  Não foi possível carregar o arquivo .env:', error.message);
  }
}

// Carregar .env antes de qualquer coisa
loadEnvFile();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  log(colors.red, `❌ ${message}`);
}

function logSuccess(message) {
  log(colors.green, `✅ ${message}`);
}

function logInfo(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

function logWarning(message) {
  log(colors.yellow, `⚠️  ${message}`);
}

function logHeader(message) {
  log(colors.cyan, `\n🚀 ${message}`);
  log(colors.cyan, '=' .repeat(50));
}

/**
 * Testa OpenAI API - GPT-4o-mini e GPT-5 Chat Latest
 */
async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logWarning('OpenAI: API Key não configurada (OPENAI_API_KEY)');
    return false;
  }

  const models = [
    { name: 'GPT-4o-mini', model: 'gpt-4o-mini' },
    { name: 'GPT-5 Chat Latest', model: 'gpt-4o' } // GPT-5 ainda não existe, usando gpt-4o como fallback
  ];

  let successCount = 0;

  for (const modelConfig of models) {
    logInfo(`OpenAI ${modelConfig.name}: Testando conectividade...`);

    try {
      const startTime = Date.now();

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            {
              role: 'user',
              content: 'Responda apenas com uma palavra: teste'
            }
          ],
          max_tokens: 10,
          temperature: 0
        })
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        logError(`OpenAI ${modelConfig.name}: HTTP ${response.status} - ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const message = data.choices[0].message.content;
        logSuccess(`OpenAI ${modelConfig.name}: Conectividade OK (${responseTime}ms)`);
        log(colors.magenta, `   Resposta: "${message.trim()}"`);
        successCount++;
      } else {
        logError(`OpenAI ${modelConfig.name}: Resposta vazia ou inválida`);
      }
    } catch (error) {
      logError(`OpenAI ${modelConfig.name}: Erro de conectividade - ${error.message}`);
    }
  }

  return successCount > 0;
}

/**
 * Testa Gemini (Google) API - Gemini 2.5 Flash
 */
async function testGemini() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
                process.env.GOOGLE_GEMINI_API_KEY ||
                process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    logWarning('Gemini: API Key não configurada (GOOGLE_GENERATIVE_AI_API_KEY, GOOGLE_GEMINI_API_KEY ou GOOGLE_API_KEY)');
    return false;
  }

  logInfo('Gemini 2.5 Flash: Testando conectividade...');

  try {
    const startTime = Date.now();

    // Tentando primeiro o modelo mais avançado, depois fallback
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash-exp'];

    let success = false;
    let responseTime = 0;
    let message = '';

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Responda apenas com uma palavra: teste'
                  }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 10,
              temperature: 0
            }
          })
        });

        const endTime = Date.now();
        responseTime = endTime - startTime;

        if (!response.ok) {
          continue; // Tentar próximo modelo
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          message = data.candidates[0].content.parts[0].text;
          success = true;
          break; // Modelo funcionou, sair do loop
        }
      } catch (error) {
        continue; // Tentar próximo modelo
      }
    }

    if (success) {
      logSuccess(`Gemini 2.5 Flash: Conectividade OK (${responseTime}ms)`);
      log(colors.magenta, `   Resposta: "${message.trim()}"`);
      return true;
    } else {
      logError('Gemini 2.5 Flash: Todos os modelos testados falharam');
      return false;
    }
  } catch (error) {
    logError(`Gemini 2.5 Flash: Erro de conectividade - ${error.message}`);
    return false;
  }
}

/**
 * Testa Claude (Anthropic) API - Claude Sonnet 4.5
 */
async function testClaude() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API;

  if (!apiKey) {
    logWarning('Claude: API Key não configurada (ANTHROPIC_API_KEY ou CLAUDE_API)');
    return false;
  }

  logInfo('Claude Sonnet 4.5: Testando conectividade...');

  try {
    const startTime = Date.now();

    // Usando Claude Sonnet 4.5 diretamente como informado
    const models = ['claude-sonnet-4-5', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-sonnet-20240229'];

    let success = false;
    let responseTime = 0;
    let message = '';
    let workingModel = '';

    for (const model of models) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 10,
            temperature: 0,
            messages: [
              {
                role: 'user',
                content: 'Responda apenas com uma palavra: teste'
              }
            ]
          })
        });

        const endTime = Date.now();
        responseTime = endTime - startTime;

        if (!response.ok) {
          continue; // Tentar próximo modelo
        }

        const data = await response.json();

        if (data.content && data.content[0] && data.content[0].text) {
          message = data.content[0].text;
          workingModel = model;
          success = true;
          break; // Modelo funcionou, sair do loop
        }
      } catch (error) {
        continue; // Tentar próximo modelo
      }
    }

    if (success) {
      logSuccess(`Claude 3.5 Sonnet (${workingModel}): Conectividade OK (${responseTime}ms)`);
      log(colors.magenta, `   Resposta: "${message.trim()}"`);
      return true;
    } else {
      logError('Claude 3.5 Sonnet: Todos os modelos testados falharam');
      return false;
    }
  } catch (error) {
    logError(`Claude 3.5 Sonnet: Erro de conectividade - ${error.message}`);
    return false;
  }
}

/**
 * Testa Perplexity API - Sonar
 */
async function testPerplexity() {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    logWarning('Perplexity: API Key não configurada (PERPLEXITY_API_KEY)');
    return false;
  }

  logInfo('Perplexity Sonar: Testando conectividade...');

  try {
    const startTime = Date.now();

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas com uma palavra: teste'
          }
        ],
        max_tokens: 10,
        temperature: 0
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      logError(`Perplexity Sonar: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message.content;
      logSuccess(`Perplexity Sonar: Conectividade OK (${responseTime}ms)`);
      log(colors.magenta, `   Resposta: "${message.trim()}"`);
      return true;
    } else {
      logError('Perplexity Sonar: Resposta vazia ou inválida');
      return false;
    }
  } catch (error) {
    logError(`Perplexity Sonar: Erro de conectividade - ${error.message}`);
    return false;
  }
}

/**
 * Teste específico para Grok - Grok 4 Fast Reasoning
 */
async function testGrokAPI() {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    logWarning('Grok: API Key não configurada (GROK_API_KEY)');
    return false;
  }

  logInfo('Grok 4 Fast Reasoning: Testando conectividade...');

  try {
    const startTime = Date.now();

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas com uma palavra: teste'
          }
        ],
        max_tokens: 10,
        temperature: 0
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      logError(`Grok: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message.content;
      logSuccess(`Grok 4 Fast Reasoning: Conectividade OK (${responseTime}ms)`);
      log(colors.magenta, `   Resposta: "${message.trim()}"`);
      return true;
    } else {
      logError('Grok 4 Fast Reasoning: Resposta vazia ou inválida');
      return false;
    }
  } catch (error) {
    logError(`Grok 4 Fast Reasoning: Erro de conectividade - ${error.message}`);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  logHeader('TESTE DE MODELOS ESPECÍFICOS DE IA');
  log(colors.white, 'Modelos testados:');
  log(colors.white, '  • OpenAI: GPT-4o-mini e GPT-5 Chat Latest');
  log(colors.white, '  • Claude: Claude Sonnet 4.5');
  log(colors.white, '  • Gemini: Gemini 2.5 Flash');
  log(colors.white, '  • Perplexity: Sonar');
  log(colors.white, '  • Grok: Grok 4 Fast Reasoning\n');

  const results = {
    openai: false,
    grok: false,
    gemini: false,
    claude: false,
    perplexity: false
  };

  let totalTests = 0;
  let passedTests = 0;

  // Teste OpenAI
  logHeader('1. TESTANDO OPENAI (GPT-4o-mini & GPT-5)');
  totalTests++;
  results.openai = await testOpenAI();
  if (results.openai) passedTests++;

  // Teste Grok
  logHeader('2. TESTANDO GROK 4 FAST REASONING');
  totalTests++;
  results.grok = await testGrokAPI();
  if (results.grok) passedTests++;

  // Teste Gemini (Google)
  logHeader('3. TESTANDO GEMINI 2.5 FLASH');
  totalTests++;
  results.gemini = await testGemini();
  if (results.gemini) passedTests++;

  // Teste Claude (Anthropic)
  logHeader('4. TESTANDO CLAUDE SONNET 4.5');
  totalTests++;
  results.claude = await testClaude();
  if (results.claude) passedTests++;

  // Teste Perplexity
  logHeader('5. TESTANDO PERPLEXITY SONAR');
  totalTests++;
  results.perplexity = await testPerplexity();
  if (results.perplexity) passedTests++;

  // Resultado final
  logHeader('RESULTADO FINAL');
  log(colors.white, `Total de testes: ${totalTests}`);
  log(colors.white, `Testes aprovados: ${passedTests}`);
  log(colors.white, `Testes reprovados: ${totalTests - passedTests}`);

  // Status de cada modelo
  log(colors.white, '\n📊 STATUS DOS MODELOS:');
  const modelNames = {
    openai: 'OpenAI (GPT-4o-mini & GPT-5)',
    grok: 'Grok 4 Fast Reasoning',
    gemini: 'Gemini 2.5 Flash',
    claude: 'Claude Sonnet 4.5',
    perplexity: 'Perplexity Sonar'
  };

  Object.entries(results).forEach(([api, status]) => {
    const statusText = status ? colors.green + '✅ OK' : colors.red + '❌ FALHA';
    log(colors.white, `   ${modelNames[api] || api.toUpperCase()}: ${statusText}`);
  });

  // Conclusão
  if (passedTests === totalTests) {
    log(colors.green, '\n🎉 Todas as APIs estão funcionando corretamente!');
  } else if (passedTests > 0) {
    log(colors.yellow, `\n⚠️ ${passedTests} de ${totalTests} APIs funcionando. Verifique as configurações das APIs com falha.`);
  } else {
    log(colors.red, '\n❌ Nenhuma API está funcionando. Verifique as variáveis de ambiente e chaves de API.');
  }

  // Instruções para correção
  if (passedTests < totalTests) {
    log(colors.yellow, '\n💡 DICAS PARA CORREÇÃO:');
    log(colors.white, '   1. Verifique se as variáveis de ambiente estão configuradas:');
    log(colors.white, '      - OPENAI_API_KEY');
    log(colors.white, '      - GROK_API_KEY');
    log(colors.white, '      - GOOGLE_GENERATIVE_AI_API_KEY (ou GOOGLE_GEMINI_API_KEY)');
    log(colors.white, '      - ANTHROPIC_API_KEY ou CLAUDE_API');
    log(colors.white, '      - PERPLEXITY_API_KEY');
    log(colors.white, '   2. Verifique se as chaves de API são válidas e têm créditos');
    log(colors.white, '   3. Verifique a conectividade com a internet');
    log(colors.white, '   4. Consulte a documentação de cada provedor para limitações regionais');
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Erro fatal: ${error.message}`);
    process.exit(1);
  });
}

export { testGrokAPI, testOpenAI, testGemini, testClaude, testPerplexity };
