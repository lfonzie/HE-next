#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test Gemini 2.5 TTS for aulas
async function testGeminiTTSAulas() {
  console.log('🎤 Testando Gemini 2.5 TTS para Aulas...\n');

  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ Erro: GEMINI_API_KEY não configurada');
    console.log('   Configure a variável de ambiente GEMINI_API_KEY');
    return;
  }

  console.log('✅ API Key encontrada');

  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);

    // Test different models
    const modelsToTest = [
      'gemini-2.5-flash-preview-tts',
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ];

    for (const modelName of modelsToTest) {
      console.log(`\n🔍 Testando modelo: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "audio/mpeg"
          }
        });

        const result = await model.generateContent([
          'Convert this text to speech in Portuguese Brazilian: "Olá, este é um teste do sistema de aulas."'
        ]);

        const response = await result.response;
        
        if (response.text) {
          console.log(`✅ ${modelName}: Sucesso!`);
          console.log(`   Tamanho da resposta: ${response.text().length} caracteres`);
          
          // Check if it looks like audio data
          if (response.text().length > 1000) {
            console.log('   📊 Parece ser dados de áudio (base64)');
          } else {
            console.log('   📝 Parece ser texto, não áudio');
          }
        } else {
          console.log(`⚠️  ${modelName}: Resposta vazia`);
        }

      } catch (modelError) {
        console.log(`❌ ${modelName}: Erro - ${modelError.message}`);
      }
    }

    // Test with TTS-specific configuration
    console.log('\n🎯 Testando configuração TTS específica...');
    
    try {
      const ttsModel = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-preview-tts",
        generationConfig: {
          responseMimeType: "audio/mpeg",
          responseSchema: {
            type: "object",
            properties: {
              audio: {
                type: "string",
                description: "Base64 encoded audio data"
              }
            }
          }
        }
      });

      const ttsResult = await ttsModel.generateContent([
        'Convert this text to speech in Portuguese Brazilian: "Teste do sistema de aulas com Gemini TTS."'
      ]);

      const ttsResponse = await ttsResult.response;
      
      if (ttsResponse.text) {
        console.log('✅ Configuração TTS: Sucesso!');
        console.log(`   Tamanho: ${ttsResponse.text().length} caracteres`);
      } else {
        console.log('⚠️  Configuração TTS: Resposta vazia');
      }

    } catch (ttsError) {
      console.log(`❌ Configuração TTS: Erro - ${ttsError.message}`);
    }

  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }

  console.log('\n📋 Resumo:');
  console.log('   - Se algum modelo funcionou, o Gemini TTS está disponível');
  console.log('   - Se nenhum funcionou, pode ser problema de API key ou modelo');
  console.log('   - Para aulas, use o modelo que retornou dados de áudio');
}

// Run the test
testGeminiTTSAulas().catch(console.error);
