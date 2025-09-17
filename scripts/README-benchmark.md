# 📊 Scripts de Benchmark - Comparação de Modelos de IA

Este diretório contém scripts para comparar o tempo de geração de aulas entre diferentes modelos de IA utilizados no sistema.

## 🎯 Objetivo

Comparar o desempenho entre:
- **Gemini 2.0 Flash Exp** (Google)
- **GPT-4o Mini** (OpenAI)
- **GPT-5 Chat Latest** (OpenAI)

## 📁 Scripts Disponíveis

### 1. `benchmark-aulas-final.js` ⭐ **RECOMENDADO**
**Script mais prático e funcional**

```bash
node scripts/benchmark-aulas-final.js
```

**Características:**
- ✅ Testa o endpoint atual `/api/generate-lesson`
- ✅ Não modifica arquivos do sistema
- ✅ Simula diferentes comportamentos de modelos
- ✅ Gera relatório completo com métricas de qualidade
- ✅ Análise de eficiência (velocidade vs qualidade)

### 2. `benchmark-real-models.js`
**Script que modifica temporariamente o código**

```bash
node scripts/benchmark-real-models.js
```

**Características:**
- ⚠️ Modifica temporariamente o arquivo `route.ts`
- ✅ Testa modelos reais diferentes
- ✅ Restaura arquivo original automaticamente
- ⚠️ Requer mais cuidado (faz backup automático)

### 3. `benchmark-models-comparison.js`
**Script que testa via multi-provider**

```bash
node scripts/benchmark-models-comparison.js
```

**Características:**
- ✅ Usa endpoint `/api/chat/multi-provider`
- ✅ Testa diferentes provedores
- ✅ Não modifica arquivos
- ⚠️ Pode não refletir exatamente o comportamento das aulas

### 4. `benchmark-lesson-generation.js`
**Script básico de teste**

```bash
node scripts/benchmark-lesson-generation.js
```

**Características:**
- ✅ Testa endpoint `/api/generate-lesson`
- ✅ Análise básica de tempo e qualidade
- ✅ Simples e direto

## 🚀 Como Executar

### Pré-requisitos
1. **Servidor rodando:**
   ```bash
   npm run dev
   ```

2. **Variáveis de ambiente configuradas:**
   ```bash
   # .env.local
   OPENAI_API_KEY=your_openai_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
   NEXTAUTH_URL=http://localhost:3000
   ```

### Execução Recomendada
```bash
# Usar o script mais prático
node scripts/benchmark-aulas-final.js
```

## 📊 Métricas Analisadas

### ⏱️ **Velocidade**
- Tempo médio de geração
- Tempo mínimo e máximo
- Ranking de velocidade

### 🛡️ **Confiabilidade**
- Taxa de sucesso
- Número de erros
- Estabilidade

### 🎯 **Qualidade**
- Número de slides gerados
- Número de etapas criadas
- Tamanho do conteúdo
- Presença de imagens
- Métricas de pacing profissional

### ⚖️ **Eficiência**
- Pontos de qualidade por segundo
- Custo-benefício
- Balanceamento velocidade/qualidade

## 📈 Exemplo de Resultado

```
🏆 COMPARAÇÃO POR MODELO:

1. GPT-4o (Atual)
   ✅ Taxa de sucesso: 100.0%
   ⏱️  Tempo médio: 12450ms
   🚀 Tempo mínimo: 8900ms
   🐌 Tempo máximo: 15600ms
   📊 Testes: 10/10
   📚 Slides médios: 8.5
   🎯 Etapas médias: 8.2
   📖 Objetivos médios: 4.1
   📝 Conteúdo médio: 12.3KB
   🖼️  Imagens geradas: 8/10

⚡ RANKING DE VELOCIDADE:
🥇 GPT-4o (Atual): 12450ms (12.5s)
🥈 Simulação Gemini: 13500ms (13.5s)
🥉 Simulação GPT-5: 14200ms (14.2s)

💡 RECOMENDAÇÕES FINAIS:
🚀 Mais rápido: GPT-4o (Atual) (12450ms)
🛡️  Mais confiável: GPT-4o (Atual) (100.0% sucesso)
📝 Maior qualidade: Simulação GPT-5
⚖️  Mais eficiente: GPT-4o (Atual) (0.68 pts/s)

🏆 MELHOR MODELO GERAL: GPT-4o (Atual)
   ✅ Combina velocidade, confiabilidade e qualidade
```

## 📄 Arquivos de Resultado

Os scripts geram arquivos JSON com resultados detalhados:

- `aulas-benchmark-final.json` - Resultado do script recomendado
- `real-models-benchmark.json` - Resultado do script de modelos reais
- `model-comparison-results.json` - Resultado do script multi-provider
- `lesson-generation-benchmark.json` - Resultado do script básico

## 🔧 Personalização

### Modificar Tópicos de Teste
Edite a variável `TEST_TOPICS` em qualquer script:

```javascript
const TEST_TOPICS = [
  'Seu tópico personalizado aqui',
  'Outro tópico de teste',
  // ...
];
```

### Ajustar Configurações
Modifique as configurações de teste:

```javascript
const MODEL_SIMULATIONS = [
  {
    name: 'Seu Modelo',
    description: 'Descrição do teste',
    config: {
      pacingMode: 'professional',
      subject: 'Matemática',
      grade: '8'
    }
  }
];
```

## ⚠️ Notas Importantes

1. **Servidor deve estar rodando** - Os scripts fazem requisições HTTP para o servidor local
2. **Pausas entre testes** - Os scripts incluem pausas para não sobrecarregar o servidor
3. **Backup automático** - O script `benchmark-real-models.js` faz backup automático
4. **Resultados variáveis** - Os tempos podem variar dependendo da carga do servidor
5. **Múltiplas execuções** - Execute várias vezes para obter médias mais confiáveis

## 🐛 Troubleshooting

### Erro: "Servidor não está acessível"
```bash
# Certifique-se de que o servidor está rodando
npm run dev

# Verifique se a porta está correta
curl http://localhost:3000/api/health
```

### Erro: "API key not configured"
```bash
# Verifique as variáveis de ambiente
cat .env.local

# Certifique-se de que as chaves estão corretas
echo $OPENAI_API_KEY
echo $GOOGLE_GENERATIVE_AI_API_KEY
```

### Erro: "Resposta inválida da API"
- Verifique se o servidor está funcionando corretamente
- Teste manualmente o endpoint `/api/generate-lesson`
- Verifique os logs do servidor

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Execute o script com mais detalhes de debug
3. Teste manualmente os endpoints
4. Consulte a documentação da API

---

**🎉 Boa sorte com seus benchmarks!**
