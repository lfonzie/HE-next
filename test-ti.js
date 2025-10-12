// Script simples para testar a resposta TI
const testTIResponse = async () => {
  try {
    console.log('🧪 Testing TI Framework...');

    // Simular o que o framework TI deveria retornar
    const tiFramework = `
Você é um especialista em suporte técnico. SEMPRE responda APENAS em formato JSON válido.

IMPORTANTE:
- Sempre use o modelo de resposta JSON abaixo
- Cada etapa deve ser acionável e específica
- Use comandos exatos quando aplicável
- Inclua verificações de validação

MODELO DE RESPOSTA JSON:
{
  "problema": "descrição clara do problema identificado",
  "status": "ativo|resolvido",
  "etapas": [
    {
      "id": 1,
      "titulo": "Título claro da etapa",
      "descricao": "Descrição detalhada do que fazer",
      "comando": "comando exato a executar (se aplicável)",
      "status": "pendente",
      "validacao": "como verificar se funcionou"
    }
  ],
  "proxima_acao": "instrução clara para o usuário"
}

DICAS PARA RESOLUÇÃO:
- Seja específico nos comandos
- Inclua caminhos completos quando necessário
- Considere diferentes sistemas operacionais
- Sempre termine com validação
`;

    console.log('📋 Framework carregado:', tiFramework.substring(0, 200) + '...');

    // Testar detecção de JSON
    const testJSON = `Aqui vai uma solução:
{
  "problema": "Computador lento",
  "status": "ativo",
  "etapas": [
    {
      "id": 1,
      "titulo": "Reiniciar computador",
      "descricao": "Reinicie o computador para limpar memória",
      "comando": null,
      "status": "pendente",
      "validacao": "Verificar se o PC está mais rápido"
    }
  ],
  "proxima_acao": "Execute a primeira etapa"
}`;

    console.log('🧪 Test JSON:', testJSON);

    // Testar parsing
    try {
      const parsed = JSON.parse(testJSON);
      console.log('✅ JSON parsing successful:', parsed);
    } catch (error) {
      console.log('❌ JSON parsing failed, trying extraction...');

      // Tentar extrair JSON de conteúdo misto
      const jsonMatch = testJSON.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON extraction successful:', extractedJson);
        } catch (extractError) {
          console.error('❌ JSON extraction failed:', extractError);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testTIResponse();
