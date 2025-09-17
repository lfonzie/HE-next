// test-ai-router.js
// Script de teste para demonstrar o funcionamento do sistema de roteamento multi-fornecedor

const testCases = [
  {
    name: "Aula Interativa - Fotossíntese",
    text: "Crie uma aula interativa sobre fotossíntese com 5 slides",
    context: { module: "aula_interativa" },
    userProfile: { userType: "teacher" }
  },
  {
    name: "Questão ENEM - Matemática",
    text: "Gere uma questão de matemática no estilo ENEM sobre funções",
    context: { module: "enem" },
    userProfile: { userType: "student" }
  },
  {
    name: "Debug de Código React",
    text: "Ajude a debugar este código React que não está funcionando",
    context: { module: "ti" },
    userProfile: { userType: "developer" }
  },
  {
    name: "Suporte Geral",
    text: "Preciso de ajuda com minha conta",
    context: { module: "atendimento" },
    userProfile: { userType: "student" }
  },
  {
    name: "Conteúdo Sensível (PII)",
    text: "Meu CPF é 123.456.789-00 e preciso de ajuda",
    context: { module: "atendimento" },
    userProfile: { userType: "student" }
  }
];

async function testAIRouter() {
  console.log("🧪 Testando Sistema de Roteamento Multi-Fornecedor de IA\n");
  
  for (const testCase of testCases) {
    console.log(`📝 Teste: ${testCase.name}`);
    console.log(`📄 Texto: ${testCase.text}`);
    console.log(`🎯 Contexto: ${JSON.stringify(testCase.context)}`);
    console.log(`👤 Usuário: ${JSON.stringify(testCase.userProfile)}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai-router/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testCase,
          mode: 'shadow',
          canaryPercentage: 5
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Sucesso!");
        console.log(`🤖 Provedor Selecionado: ${result.result.provider}`);
        console.log(`🎯 Confiança: ${(result.result.trace.confidence * 100).toFixed(1)}%`);
        console.log(`⚡ Latência: ${result.result.metrics.latency}ms`);
        console.log(`💰 Custo: $${result.result.metrics.cost.toFixed(4)}`);
        console.log(`🔒 Segurança: ${result.result.safety.passed ? '✅ Aprovado' : '❌ Problemas'}`);
        
        if (result.result.safety.issues.length > 0) {
          console.log(`⚠️  Problemas de Segurança:`);
          result.result.safety.issues.forEach(issue => {
            console.log(`   - ${issue.type}: ${issue.description}`);
          });
        }
        
        if (result.result.trace.alternatives.length > 0) {
          console.log(`🔄 Alternativas:`);
          result.result.trace.alternatives.slice(0, 3).forEach((alt, index) => {
            console.log(`   ${index + 1}. ${alt.providerId}: ${alt.score.toFixed(2)}`);
          });
        }
      } else {
        console.log("❌ Erro:", result.error);
      }
    } catch (error) {
      console.log("❌ Erro de conexão:", error.message);
    }
    
    console.log("\n" + "=".repeat(80) + "\n");
  }
}

async function testRouterStatus() {
  console.log("📊 Status do Sistema de Roteamento\n");
  
  try {
    const response = await fetch('http://localhost:3000/api/ai-router/test?action=status');
    const result = await response.json();
    
    if (result.success) {
      console.log("🟢 Status:", result.status.enabled ? "Habilitado" : "Desabilitado");
      console.log("🎛️  Modo:", result.status.mode);
      console.log("📈 Canário:", `${result.status.canaryPercentage}%`);
      console.log("\n🤖 Provedores Disponíveis:");
      
      result.status.providers.forEach(provider => {
        const healthEmoji = {
          'healthy': '🟢',
          'degraded': '🟡',
          'unhealthy': '🔴'
        }[provider.health] || '⚪';
        
        console.log(`   ${healthEmoji} ${provider.name} (${provider.id})`);
      });
    } else {
      console.log("❌ Erro ao obter status:", result.error);
    }
  } catch (error) {
    console.log("❌ Erro de conexão:", error.message);
  }
}

async function testRouterMetrics() {
  console.log("📈 Métricas do Sistema\n");
  
  try {
    const response = await fetch('http://localhost:3000/api/ai-router/test?action=metrics');
    const result = await response.json();
    
    if (result.success) {
      console.log("📊 Últimas Métricas:");
      result.metrics.forEach((metric, index) => {
        console.log(`   ${index + 1}. ${metric.module} → ${metric.selectedProvider} (${metric.actualMetrics.latency}ms)`);
      });
      
      console.log("\n🏥 Saúde dos Provedores:");
      Object.entries(result.providerHealth).forEach(([provider, health]) => {
        const healthEmoji = {
          'healthy': '🟢',
          'degraded': '🟡',
          'unhealthy': '🔴'
        }[health] || '⚪';
        console.log(`   ${healthEmoji} ${provider}: ${health}`);
      });
      
      if (Object.keys(result.learningStats).length > 0) {
        console.log("\n🧠 Estatísticas de Aprendizado:");
        Object.entries(result.learningStats).forEach(([key, stats]) => {
          console.log(`   ${key}: ${stats.successRate.toFixed(2)} taxa de sucesso`);
        });
      }
    } else {
      console.log("❌ Erro ao obter métricas:", result.error);
    }
  } catch (error) {
    console.log("❌ Erro de conexão:", error.message);
  }
}

async function runAllTests() {
  console.log("🚀 Iniciando Testes do Sistema de Roteamento Multi-Fornecedor\n");
  
  await testRouterStatus();
  console.log("\n" + "=".repeat(80) + "\n");
  
  await testAIRouter();
  console.log("\n" + "=".repeat(80) + "\n");
  
  await testRouterMetrics();
  
  console.log("\n✨ Testes Concluídos!");
  console.log("\n📚 Para mais informações, consulte:");
  console.log("   - lib/ai-router/README.md");
  console.log("   - http://localhost:3000/api/ai-router/test?action=help");
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAIRouter,
  testRouterStatus,
  testRouterMetrics,
  runAllTests
};
