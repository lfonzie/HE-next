# 🧪 Teste de Validação de Clima

## Como Testar

### 1️⃣ Teste via Console do Navegador

Abra o console do navegador (F12) e execute:

```javascript
// Importar a função de validação
import { validateWeatherIntentSync } from './lib/intent-detection';

// Testes que DEVEM ser aceitos (clima)
console.log('✅ Clima em São Paulo:', validateWeatherIntentSync('Clima em São Paulo')); // true
console.log('✅ Tempo em Londres:', validateWeatherIntentSync('Como está o tempo em Londres?')); // true
console.log('✅ Vai chover:', validateWeatherIntentSync('Vai chover hoje?')); // true
console.log('✅ Temperatura:', validateWeatherIntentSync('Temperatura em Nova York')); // true

// Testes que NÃO DEVEM ser aceitos (duração)
console.log('❌ Tempo de viagem:', validateWeatherIntentSync('Qual o tempo de viagem de SP a RJ?')); // false
console.log('❌ Quanto tempo leva:', validateWeatherIntentSync('Quanto tempo leva para chegar?')); // false
console.log('❌ Tempo de espera:', validateWeatherIntentSync('Tempo de espera na fila')); // false
console.log('❌ Tempo de preparo:', validateWeatherIntentSync('Tempo de preparo do alimento')); // false
```

### 2️⃣ Teste via Interface do Chat

#### ✅ Casos que DEVEM abrir o modal de clima:

1. Digite no chat: **"Clima em São Paulo"**
   - ✅ Deve abrir modal de clima
   - 📍 Deve mostrar clima de São Paulo

2. Digite no chat: **"Como está o tempo em Londres?"**
   - ✅ Deve abrir modal de clima
   - 📍 Deve mostrar clima de Londres

3. Digite no chat: **"Vai chover hoje?"**
   - ✅ Pode abrir modal de clima (se detectar cidade)

4. Digite no chat: **"Temperatura em Nova York"**
   - ✅ Deve abrir modal de clima
   - 📍 Deve mostrar clima de Nova York

#### ❌ Casos que NÃO DEVEM abrir o modal de clima:

1. Digite no chat: **"Qual o tempo de viagem de São Paulo a Rio?"**
   - ❌ NÃO deve abrir modal de clima
   - ✅ Deve processar como pergunta normal
   - 💬 Deve responder sobre tempo de viagem

2. Digite no chat: **"Quanto tempo leva para chegar em Brasília?"**
   - ❌ NÃO deve abrir modal de clima
   - ✅ Deve processar como pergunta normal
   - 💬 Deve responder sobre tempo de viagem

3. Digite no chat: **"Tempo de espera na fila do banco"**
   - ❌ NÃO deve abrir modal de clima
   - ✅ Deve processar como pergunta normal

4. Digite no chat: **"Quanto tempo de estudo preciso?"**
   - ❌ NÃO deve abrir modal de clima
   - ✅ Deve processar como pergunta normal

### 3️⃣ Verificar Logs no Console

Ao testar, verifique os logs no console:

```
# Logs de ACEITE (deve abrir modal):
✅ [WEATHER-VALIDATION] Accepted: contains "clima"
✅ [CHAT] Opening weather modal for: São Paulo

# Logs de REJEIÇÃO (não deve abrir modal):
🚫 [WEATHER-VALIDATION] Rejected: contains "viagem"
🚫 [CHAT] Not a weather query, processing normally: Qual o tempo de viagem...
```

---

## 📊 Checklist de Testes

### Testes Positivos (Devem Abrir Modal)
- [ ] "Clima em São Paulo"
- [ ] "Tempo em Londres"
- [ ] "Como está o clima em Paris?"
- [ ] "Temperatura em Nova York"
- [ ] "Vai chover hoje?"
- [ ] "Está chovendo em Curitiba?"
- [ ] "Previsão do tempo em Brasília"
- [ ] "Como está o tempo hoje?"

### Testes Negativos (NÃO Devem Abrir Modal)
- [ ] "Qual o tempo de viagem de SP a RJ?"
- [ ] "Quanto tempo leva para chegar?"
- [ ] "Tempo de espera na fila"
- [ ] "Tempo de preparo do alimento"
- [ ] "Quanto tempo demora o exercício?"
- [ ] "Tempo de estudo necessário"
- [ ] "Configurar timer de 5 minutos"
- [ ] "Quanto tempo de descanso?"

### Testes de Edge Cases
- [ ] "tempo" (ambíguo - deve rejeitar)
- [ ] "clima" (sem cidade - deve processar normalmente)
- [ ] "São Paulo" (sem mencionar clima - não deve abrir)
- [ ] "temperatura" (sem contexto - pode ou não abrir)

---

## 🐛 Se Encontrar Problemas

### Problema: Modal abre quando não deveria
1. Verifique os logs no console
2. Identifique qual palavra-chave ativou
3. Adicione à lista negra em `validateWeatherIntentSync()`

### Problema: Modal não abre quando deveria
1. Verifique se a cidade foi detectada corretamente
2. Verifique se há palavras da lista negra na mensagem
3. Adicione padrão ou palavra-chave à lista positiva

### Problema: Erro no console
1. Verifique se os imports estão corretos
2. Verifique se não há erros de TypeScript
3. Execute `npm run build` para verificar

---

## 📈 Métricas Esperadas

- **Taxa de Acerto (Clima Real)**: > 95%
- **Taxa de Falso Positivo**: < 5%
- **Tempo de Validação**: < 1ms
- **Taxa de Falso Negativo**: < 5%

---

## ✅ Resultado Esperado

Após os testes, você deve ver:
- ✅ Modal de clima abre apenas para perguntas sobre clima/tempo meteorológico
- ✅ Perguntas sobre duração/tempo cronológico são processadas normalmente
- ✅ Logs informativos no console mostram o processo de validação
- ✅ UX melhorada: usuário não vê mais modais incorretos

