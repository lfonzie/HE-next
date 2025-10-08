# 🔍 Scripts de Investigação de Imagens - Questões ENEM

Este conjunto de scripts foi criado para investigar, listar e validar todas as URLs de imagens presentes nas questões do ENEM.

## 📋 Índice

- [Scripts Disponíveis](#-scripts-disponíveis)
- [Como Usar](#-como-usar)
- [Resultados da Investigação](#-resultados-da-investigação)
- [Relatórios Gerados](#-relatórios-gerados)
- [Problemas Encontrados](#-problemas-encontrados)
- [Próximos Passos](#-próximos-passos)

---

## 🛠️ Scripts Disponíveis

### 1. `investigate-enem-images.ts`
Investiga imagens nas questões do banco de dados Prisma (atualmente vazio).

**Comando:**
```bash
npm run investigate:enem-images
```

### 2. `investigate-enem-local-images.ts`
Investiga imagens nas questões armazenadas em arquivos JSON locais.

**Comando:**
```bash
npm run investigate:enem-local-images
```

**Principais funcionalidades:**
- Varre todos os anos de provas (2009-2023)
- Extrai URLs de imagens do texto das questões
- Identifica arquivos de imagem locais
- Gera estatísticas detalhadas
- Cria múltiplos formatos de relatório (JSON, CSV)

### 3. `validate-enem-images.ts`
Valida todas as URLs de imagens encontradas.

**Comando:**
```bash
npm run validate:enem-images
```

**Principais funcionalidades:**
- Verifica existência de arquivos locais
- Identifica URLs quebradas
- Lista imagens hospedadas em domínios externos
- Gera relatório de ações recomendadas

---

## 📊 Como Usar

### Investigação Completa

1. **Execute a investigação:**
   ```bash
   npm run investigate:enem-local-images
   ```

2. **Valide as URLs encontradas:**
   ```bash
   npm run validate:enem-images
   ```

3. **Consulte os relatórios:**
   ```bash
   cd scripts/reports
   ls -lh
   ```

### Análise dos Dados

**Ver resumo em Markdown:**
```bash
cat scripts/reports/RESUMO-INVESTIGACAO-IMAGENS.md
```

**Abrir CSV no Excel/Numbers:**
```bash
open scripts/reports/enem-local-image-references.csv
```

**Analisar JSON programaticamente:**
```javascript
const urls = require('./scripts/reports/enem-local-unique-urls.json');
console.log(`Total de URLs únicas: ${urls.length}`);

// URLs mais usadas
const topUrls = urls
  .sort((a, b) => b.occurrences - a.occurrences)
  .slice(0, 10);
console.table(topUrls);
```

---

## 📈 Resultados da Investigação

### Estatísticas Gerais

| Métrica | Valor |
|---------|-------|
| **Total de Questões** | 2.278 |
| **Questões com Imagens** | 714 (31,3%) |
| **Total de Referências** | 3.758 |
| **URLs Únicas** | 2.984 |
| **Arquivos Locais** | 1.489 (50%) |

### Distribuição por Disciplina

| Disciplina | Imagens | % |
|------------|---------|---|
| Matemática | 1.840 | 49,0% |
| Ciências da Natureza | 1.109 | 29,5% |
| Linguagens | 407 | 10,8% |
| Ciências Humanas | 402 | 10,7% |

### Anos com Mais Imagens

1. 🥇 **2018:** 463 imagens
2. 🥈 **2022:** 408 imagens
3. 🥉 **2021:** 353 imagens

### Tipos de Arquivo

| Formato | Quantidade | % |
|---------|-----------|---|
| PNG | 1.210 | 81,3% |
| JPG | 267 | 17,9% |
| BMP | 10 | 0,7% |
| JPEG | 2 | 0,1% |

---

## 📄 Relatórios Gerados

Todos os relatórios são salvos em `scripts/reports/`:

### 1. JSON Detalhado

**enem-local-all-image-references.json** (1.2 MB)
- Lista completa de todas as 3.758 referências
- Campos: questionId, year, discipline, language, field, url, alt, markdown

**enem-local-unique-urls.json** (799 KB)
- 2.984 URLs únicas com estatísticas
- Campos: url, occurrences, questions, fields, years, disciplines

**enem-local-questions-with-images.json** (587 KB)
- 714 questões que contêm imagens
- Campos: questionId, year, discipline, language, imageCount, fields, urls, localFiles

**enem-validation-results.json**
- Resultados da validação
- Categorias: válidas, externas, ausentes, quebradas

### 2. CSV para Planilhas

**enem-local-image-references.csv** (786 KB)
- Formato compatível com Excel, Google Sheets, Numbers
- Todas as 3.758 referências em formato tabular
- Fácil filtragem e análise

### 3. Markdown

**RESUMO-INVESTIGACAO-IMAGENS.md**
- Resumo executivo com todas as estatísticas
- Gráficos e tabelas formatadas
- Recomendações e observações

**missing-files-todo.txt**
- Lista de arquivos ausentes (se houver)
- Checklist para restauração

---

## ⚠️ Problemas Encontrados

### 1. URLs Quebradas (1)

```
https://enem.dev/broken-image.svg
├─ Ocorrências: 6
├─ Questões afetadas: 5
└─ Disciplinas: linguagens, matemática, ciências-humanas
```

**Questões afetadas:**
- 2023-1-espanhol
- 2023-1-ingles
- 2023-22
- 2023-136
- 2023-137

**Ação:** Corrigir ou substituir essas imagens

### 2. Imagens em Domínios Externos (3)

```
1. http://images.quebarato.com.br/photos/big/2/D/15A12D_2.jpg
   └─ 1 questão afetada

2. http://www.edmontonculturalcapital.com/gallery/edjazzfestival/JazzQuartet.jpg
   └─ 1 questão afetada

3. http://www.filmica.com/jacintaescudos/archivos/Led-Zeppelin.jpg
   └─ 1 questão afetada
```

**Risco:** Links externos podem quebrar a qualquer momento

**Ação:** Baixar e hospedar localmente ou no enem.dev

### 3. Arquivos Locais Ausentes (0)

✅ **Boa notícia:** Todos os 1.489 arquivos locais existem!

---

## 🔧 Próximos Passos

### Prioridade Alta 🔴

1. **Corrigir imagem quebrada**
   ```bash
   # Investigar as 5 questões afetadas
   grep "broken-image.svg" scripts/reports/enem-local-image-references.csv
   
   # Substituir pela imagem correta
   # Atualizar os arquivos details.json
   ```

2. **Migrar imagens externas**
   ```bash
   # Baixar as 3 imagens externas
   # Hospedar no enem.dev ou localmente
   # Atualizar referências nas questões
   ```

### Prioridade Média 🟡

3. **Atualizar URLs HTTP para HTTPS**
   - As 3 URLs externas ainda usam HTTP
   - Migrar para HTTPS quando hospedar no enem.dev

4. **Padronizar formato de imagens**
   - 81% já são PNG (ótimo para gráficos)
   - Considerar converter os 10 arquivos BMP para PNG

### Prioridade Baixa 🟢

5. **Otimizar imagens**
   - Comprimir PNGs sem perda de qualidade
   - Reduzir tamanho dos JPEGs
   - Considerar formato WebP para melhor performance

6. **Adicionar alt text**
   - Melhorar acessibilidade
   - Muitas imagens não têm descrição alternativa

---

## 📝 Comandos Úteis

### Buscar Questões com Imagens Quebradas

```bash
# No CSV
grep "broken-image" scripts/reports/enem-local-image-references.csv

# No JSON
jq '.[] | select(.url | contains("broken-image"))' scripts/reports/enem-local-all-image-references.json
```

### Listar Imagens de um Ano Específico

```bash
# Ano 2023
jq '.[] | select(.year == 2023)' scripts/reports/enem-local-all-image-references.json | less

# CSV
grep ",2023," scripts/reports/enem-local-image-references.csv
```

### Contar Imagens por Disciplina

```bash
jq 'group_by(.discipline) | map({discipline: .[0].discipline, count: length})' \
   scripts/reports/enem-local-all-image-references.json
```

### Verificar Domínios Únicos

```bash
jq -r '.[] | select(.url | startswith("http")) | .url' \
   scripts/reports/enem-local-all-image-references.json | \
   sed -E 's|https?://([^/]+).*|\1|' | \
   sort -u
```

---

## 🔄 Re-executar a Investigação

Se houver atualizações nas questões:

```bash
# Investigar novamente
npm run investigate:enem-local-images

# Validar novamente
npm run validate:enem-images

# Comparar resultados
diff scripts/reports/enem-validation-results.json \
     scripts/reports/enem-validation-results.json.backup
```

---

## 📚 Estrutura dos Dados

### Formato da Questão (details.json)

```json
{
  "title": "Questão 7 - ENEM 2023",
  "index": 7,
  "year": 2023,
  "language": null,
  "discipline": "linguagens",
  "context": "Texto da questão com ![imagem](url)",
  "files": ["/caminho/para/imagem.png"],
  "correctAlternative": "A",
  "alternativesIntroduction": "Texto introdutório",
  "alternatives": [
    {
      "letter": "A",
      "text": "Texto da alternativa",
      "file": null,
      "isCorrect": true
    }
  ]
}
```

### Padrões de URL Suportados

1. **Markdown padrão:** `![alt](url)`
2. **Markdown sem alt:** `!(url)`
3. **URL direta:** `https://exemplo.com/imagem.png`
4. **Caminho relativo:** `/QUESTOES_ENEM/public/2023/questions/7/imagem.png`

---

## 🐛 Troubleshooting

### Script não encontra as questões

```bash
# Verificar se o diretório existe
ls -la QUESTOES_ENEM/public/

# Verificar permissões
chmod -R 755 QUESTOES_ENEM/
```

### Erro ao gerar relatórios

```bash
# Criar diretório de relatórios
mkdir -p scripts/reports

# Verificar permissões
chmod 755 scripts/reports
```

### JSONs muito grandes para abrir

```bash
# Ver tamanho dos arquivos
ls -lh scripts/reports/

# Usar jq para análise
jq '.' scripts/reports/enem-local-unique-urls.json | less

# Extrair apenas parte dos dados
jq '.[:10]' scripts/reports/enem-local-all-image-references.json
```

---

## 👥 Contribuindo

Se você encontrar bugs ou tiver sugestões:

1. Execute a investigação e validação
2. Documente o problema encontrado
3. Sugira melhorias nos scripts
4. Abra uma issue ou PR

---

## 📄 Licença

Estes scripts fazem parte do projeto HubEdu e seguem a mesma licença do projeto principal.

---

**Última atualização:** 8 de Outubro de 2025
**Versão dos scripts:** 1.0.0


