#!/usr/bin/env node

/**
 * Script para testar o sistema de roteamento de modelos
 * Testa diferentes tipos de mensagens para verificar se os chips aparecem corretamente
 */

const testMessages = {
  triviais: [
    "O que é fotossíntese?",
    "Qual a capital do Brasil?", 
    "Como se diz 'olá' em inglês?",
    "Quantos dias tem um ano?",
    "O que é água?"
  ],
  
  simples: [
    "Explique como funciona a fotossíntese",
    "Me ajude com matemática básica",
    "Como estudar para uma prova?",
    "Qual a diferença entre mitose e meiose?",
    "Explique a Revolução Francesa"
  ],
  
  complexas: [
    "Faça uma análise detalhada sobre os impactos socioeconômicos da Revolução Industrial no século XIX",
    "Explique a metodologia científica por trás da teoria da evolução de Darwin",
    "Compare e analise as diferentes abordagens pedagógicas: construtivismo vs behaviorismo", 
    "Desenvolva uma estratégia completa para resolver problemas de matemática avançada",
    "Analise criticamente os fatores que levaram à queda do Império Romano"
  ]
}

console.log('🧪 TESTE DO SISTEMA DE ROTEAMENTO DE MODELOS\n')

console.log('📋 INSTRUÇÕES DE TESTE:')
console.log('1. Abra o chat em http://localhost:3000/chat')
console.log('2. Abra o console do navegador (F12)')
console.log('3. Envie as mensagens abaixo uma por vez')
console.log('4. Verifique se os chips aparecem corretamente\n')

Object.entries(testMessages).forEach(([tipo, mensagens]) => {
  const chipEsperado = {
    triviais: '🟢 IA Eco (Gemini)',
    simples: '🔵 IA (GPT-4o Mini)', 
    complexas: '🟣 IA Turbo (GPT-4o/GPT-5)'
  }[tipo]
  
  console.log(`\n${chipEsperado} - Mensagens ${tipo.toUpperCase()}:`)
  console.log('─'.repeat(50))
  
  mensagens.forEach((msg, index) => {
    console.log(`${index + 1}. "${msg}"`)
  })
})

console.log('\n🔍 O QUE VERIFICAR:')
console.log('• Chip correto aparece abaixo do avatar do assistente')
console.log('• Console mostra logs de roteamento com provider/model/complexity')
console.log('• Resposta vem do modelo correto baseado na complexidade')

console.log('\n📊 RESULTADOS ESPERADOS:')
console.log('• Triviais → Gemini (rápido e econômico)')
console.log('• Simples → GPT-4o Mini (equilibrado)')
console.log('• Complexas → GPT-4o/GPT-5 (avançado)')

console.log('\n🚨 SE ALGO NÃO FUNCIONAR:')
console.log('• Verifique se as chaves de API estão configuradas')
console.log('• Confirme se o sistema de roteamento está ativo')
console.log('• Verifique logs de erro no console')
