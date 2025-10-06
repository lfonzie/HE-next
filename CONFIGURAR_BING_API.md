# 🔧 Configuração da API do Bing Image Search

## 🎯 Por que o Bing é importante para Metallica?

O **Bing Image Search** é excelente para encontrar imagens específicas de bandas como Metallica porque:
- ✅ **Busca mais ampla** que outros provedores
- ✅ **Imagens específicas** de celebridades e bandas
- ✅ **Conteúdo histórico** e fotos oficiais
- ✅ **Melhor para temas específicos** como Metallica

## 🔑 Como obter a chave da API do Bing

### Passo 1: Acesse o Azure Portal
1. Vá para: https://portal.azure.com/
2. Faça login com sua conta Microsoft

### Passo 2: Criar um recurso de Bing Search
1. Clique em "Criar um recurso"
2. Procure por "Bing Search v7"
3. Clique em "Criar"

### Passo 3: Configurar o recurso
1. **Nome**: `HubEdu-Bing-Search` (ou qualquer nome)
2. **Assinatura**: Sua assinatura
3. **Grupo de recursos**: Crie um novo ou use existente
4. **Tipo de preço**: `F1` (gratuito - 1000 consultas/mês)
5. Clique em "Revisar + criar"

### Passo 4: Obter a chave
1. Após criar, vá para o recurso
2. Clique em "Chaves e ponto de extremidade"
3. Copie a **Chave 1**

### Passo 5: Configurar no projeto
1. Abra o arquivo `.env`
2. Substitua `BING_SEARCH_API_KEY=sua_chave_aqui` por:
   ```
   BING_SEARCH_API_KEY=sua_chave_real_aqui
   ```

## 🚀 Testando a configuração

Após configurar, teste com:
```bash
# Reiniciar o servidor
npm run dev

# Testar busca por Metallica
# O Bing deve aparecer como funcionando nos logs
```

## 📊 Limites da API gratuita

- **1000 consultas por mês** (gratuito)
- **Suficiente para testes** e uso moderado
- **Upgrade disponível** se necessário

## 🔧 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se a chave foi copiada corretamente
- Certifique-se de que não há espaços extras

### Erro: "Quota exceeded"
- Você atingiu o limite mensal
- Aguarde o próximo mês ou faça upgrade

### Bing não retorna imagens
- Verifique se o recurso está ativo no Azure
- Confirme que a chave está correta no `.env`

## ✅ Verificação

Após configurar, você deve ver nos logs:
```
✅ bing: X imagens encontradas pelo termo exato
```

Em vez de:
```
❌ bing: falha na busca pelo termo exato
```

## 🎯 Resultado esperado

Com Bing configurado, a busca por "metallica" deve retornar:
- ✅ **Imagens específicas** da banda Metallica
- ✅ **Fotos oficiais** dos membros
- ✅ **Capa de álbuns** do Metallica
- ✅ **Fotos de shows** do Metallica
- ✅ **Conteúdo histórico** da banda

**O Bing + Wikimedia são perfeitos para Metallica!** 🎸🤘
