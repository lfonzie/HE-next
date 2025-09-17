// Teste do sistema de classificação
const testMessages = [
  "Como resolver uma equação de segundo grau?",
  "O computador não está ligando",
  "Preciso de uma declaração de matrícula",
  "Qual o valor da mensalidade?",
  "Quero saber sobre os benefícios dos funcionários",
  "Como criar um post para o Instagram da escola?",
  "Estou com ansiedade antes da prova",
  "Qual o calendário escolar deste ano?",
  "Preciso de ajuda com redação para o ENEM"
];

async function testClassification() {
  console.log("🧪 Testando sistema de classificação...\n");
  
  for (const message of testMessages) {
    try {
      const response = await fetch('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: message }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const classification = data.classification;
        
        console.log(`📝 "${message}"`);
        console.log(`   → Módulo: ${classification.module}`);
        console.log(`   → Confiança: ${Math.round(classification.confidence * 100)}%`);
        console.log(`   → Razão: ${classification.rationale}`);
        console.log(`   → Precisa imagens: ${classification.needsImages ? 'Sim' : 'Não'}\n`);
      } else {
        console.error(`❌ Erro na classificação: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Erro de rede: ${error.message}`);
    }
    
    // Pequena pausa entre as requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("✅ Teste de classificação concluído!");
}

// Executar teste se este arquivo for chamado diretamente
if (typeof window === 'undefined') {
  testClassification().catch(console.error);
}

module.exports = { testClassification };
