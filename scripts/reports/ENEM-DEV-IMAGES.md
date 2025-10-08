# 🌐 Imagens do Domínio enem.dev

**Data:** 8 de Outubro de 2025  
**Domínio:** https://enem.dev  
**Script:** `filter-enem-dev-images.ts`

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **URLs Únicas** | 1.492 |
| **URLs Válidas** | 1.491 |
| **URLs Quebradas** | 1 |
| **Total de Referências** | 2.266 |
| **Questões Afetadas** | 714 |
| **Percentual do Total** | 99,8% das URLs HTTP |

---

## 📅 Distribuição por Ano

| Ano | URLs Únicas | % |
|-----|-------------|---|
| 2018 | 186 | 12,5% |
| 2022 | 161 | 10,8% |
| 2021 | 138 | 9,3% |
| 2020 | 131 | 8,8% |
| 2023 | 104 | 7,0% |
| 2012 | 103 | 6,9% |
| 2017 | 95 | 6,4% |
| 2014 | 86 | 5,8% |
| 2013 | 84 | 5,6% |
| 2016 | 83 | 5,6% |
| 2009 | 71 | 4,8% |
| 2019 | 71 | 4,8% |
| 2010 | 68 | 4,6% |
| 2015 | 62 | 4,2% |
| 2011 | 48 | 3,2% |

**Anos com mais imagens:**
1. 🥇 **2018:** 186 URLs
2. 🥈 **2022:** 161 URLs
3. 🥉 **2021:** 138 URLs

---

## 📁 Tipos de Arquivo

| Formato | Quantidade | % |
|---------|-----------|---|
| PNG | 1.211 | 81,2% |
| JPG | 267 | 17,9% |
| BMP | 10 | 0,7% |
| JPEG | 2 | 0,1% |
| SVG | 1 | 0,1% |

**Observação:** O SVG é a imagem quebrada (`broken-image.svg`)

---

## ⚠️ URL Quebrada

```
https://enem.dev/broken-image.svg
```

**Impacto:**
- ❌ Usado em **5 questões** diferentes
- ❌ **6 ocorrências** no total
- 📅 Ano: **2023**
- 📚 Disciplinas: **linguagens, matemática, ciências humanas**

**Questões afetadas:**
1. 2023-1-espanhol
2. 2023-1-ingles
3. 2023-22
4. 2023-136
5. 2023-137

**Ação necessária:** 🔴 **URGENTE** - Corrigir ou substituir esta imagem

---

## 🔍 Padrões de URL

### Estrutura Padrão
```
https://enem.dev/{year}/questions/{question_id}/{uuid}.{ext}
```

**Exemplos:**
```
https://enem.dev/2023/questions/100/92848aa5-da82-4c66-9945-7051120a42c9.jpg
https://enem.dev/2022/questions/15/abc123ef-4567-89ab-cdef-0123456789ab.png
https://enem.dev/2021/questions/42/fedcba98-7654-3210-fedc-ba9876543210.jpg
```

### Estatísticas de Padrões
- **URLs com `/questions/`:** 1.474 (98,8%)
- **URLs com UUID:** 1.491 (99,9%)
- **Outras:** 1 (broken-image.svg)

---

## 📄 Arquivos Gerados

Todos os arquivos estão em `scripts/reports/`:

### 1. Listas de URLs (TXT)

**enem-dev-urls.txt** (112 KB)
- **1.492 URLs** do domínio enem.dev
- Inclui a URL quebrada
- Uma URL por linha

**enem-dev-valid-urls.txt** (112 KB)
- **1.491 URLs válidas**
- Exclui broken-image.svg
- Pronto para uso/download

**enem-dev-broken-urls.txt** (33 bytes)
- **1 URL quebrada**
- Lista de problemas a corrigir

### 2. Dados Estruturados (JSON)

**enem-dev-unique-urls.json** (405 KB)
- URLs únicas com estatísticas detalhadas
- Campos: url, occurrences, questions, fields, years, disciplines

**enem-dev-all-references.json** (758 KB)
- Todas as **2.266 referências**
- Dados completos de cada ocorrência

**enem-dev-by-year.json** (3.1 KB)
- Estatísticas agrupadas por ano
- Resumo executivo

### 3. CSV para Planilhas

**enem-dev-references.csv** (290 KB)
- Formato compatível com Excel/Google Sheets
- Todas as referências em formato tabular

---

## 💡 Como Usar os Arquivos

### Baixar todas as imagens válidas

```bash
# Ler arquivo de URLs
while read url; do
  # Extrair nome do arquivo
  filename=$(echo $url | sed 's|https://enem.dev/||g')
  
  # Criar diretórios necessários
  mkdir -p $(dirname "downloads/$filename")
  
  # Baixar imagem
  curl -o "downloads/$filename" "$url"
done < scripts/reports/enem-dev-valid-urls.txt
```

### Ver estatísticas por ano

```bash
jq '.' scripts/reports/enem-dev-by-year.json
```

**Exemplo de saída:**
```json
[
  {
    "year": 2023,
    "totalRefs": 162,
    "uniqueUrls": 104,
    "questions": 79,
    "disciplines": ["linguagens", "matematica", "ciencias-humanas", "ciencias-natureza"]
  }
]
```

### Filtrar URLs de um ano específico

```bash
# Ano 2023
grep "/2023/" scripts/reports/enem-dev-valid-urls.txt

# Ano 2022
grep "/2022/" scripts/reports/enem-dev-valid-urls.txt
```

### Buscar questão específica

```bash
# Buscar questão 100 de 2023
grep "2023/questions/100/" scripts/reports/enem-dev-urls.txt

# Buscar no CSV
grep "2023-100" scripts/reports/enem-dev-references.csv
```

---

## 📈 Análise de Qualidade

### ✅ Pontos Positivos

1. **Padronização Excelente**
   - 98,8% seguem o padrão `/questions/`
   - 99,9% usam UUID para identificação única
   - Estrutura consistente ao longo dos anos

2. **Formatos Adequados**
   - 81% PNG (ideal para gráficos e diagramas)
   - 18% JPG (adequado para fotos)

3. **Cobertura Completa**
   - 15 anos de provas (2009-2023)
   - 714 questões cobertas

### ⚠️ Pontos de Melhoria

1. **Imagem Quebrada**
   - 1 URL quebrada afetando 5 questões
   - Precisa ser corrigida urgentemente

2. **Formatos Antigos**
   - 10 arquivos BMP (formato menos eficiente)
   - Recomendação: converter para PNG

3. **Otimização**
   - Muitas imagens podem ter tamanhos grandes
   - Considerar compressão sem perda de qualidade

---

## 🔧 Próximas Ações

### Prioridade Alta 🔴

1. **Corrigir broken-image.svg**
   ```bash
   # Identificar questões
   grep "broken-image" scripts/reports/enem-dev-references.csv
   
   # Atualizar arquivos details.json das 5 questões
   # Questões: 2023-1-espanhol, 2023-1-ingles, 2023-22, 2023-136, 2023-137
   ```

### Prioridade Média 🟡

2. **Converter BMP para PNG**
   ```bash
   # Encontrar arquivos BMP
   grep "\.bmp" scripts/reports/enem-dev-urls.txt
   ```

3. **Validar Integridade**
   ```bash
   # Verificar se todas as URLs estão acessíveis
   # (criar script de verificação HTTP)
   ```

### Prioridade Baixa 🟢

4. **Otimizar Tamanho**
   - Comprimir PNGs com ferramentas como optipng
   - Reduzir qualidade de JPGs quando possível
   - Considerar WebP para melhor compressão

---

## 🌐 Domínio enem.dev vs Outros

| Categoria | enem.dev | Outros | Total |
|-----------|----------|--------|-------|
| URLs únicas | 1.492 | 3 | 1.495 |
| Percentual | **99,8%** | 0,2% | 100% |

**Outros domínios (3 URLs):**
1. `images.quebarato.com.br` (1 URL)
2. `www.edmontonculturalcapital.com` (1 URL)
3. `www.filmica.com` (1 URL)

**Conclusão:** O domínio enem.dev é usado de forma consistente e representa praticamente todas as imagens externas.

---

## 📝 Comandos Úteis

### Contar URLs por ano
```bash
for year in {2009..2023}; do
  count=$(grep "/$year/" scripts/reports/enem-dev-urls.txt | wc -l)
  echo "$year: $count URLs"
done
```

### Listar todos os formatos de arquivo
```bash
grep -oE '\.(png|jpg|jpeg|gif|bmp|svg)' scripts/reports/enem-dev-urls.txt | \
  sort | uniq -c | sort -rn
```

### Verificar duplicatas
```bash
sort scripts/reports/enem-dev-urls.txt | uniq -d
```

### Exportar para outro formato
```bash
# Converter para JSON array
jq -R -s 'split("\n")[:-1]' scripts/reports/enem-dev-urls.txt > urls.json
```

---

## 🎯 Resumo para Ação Rápida

**Arquivo principal:** `enem-dev-valid-urls.txt`

**Conteúdo:**
- ✅ 1.491 URLs válidas
- ✅ Sem broken-image.svg
- ✅ Pronto para download/processamento

**Uso:**
```bash
# Ver total
wc -l scripts/reports/enem-dev-valid-urls.txt

# Ver primeiras 10
head -10 scripts/reports/enem-dev-valid-urls.txt

# Buscar ano específico
grep "/2023/" scripts/reports/enem-dev-valid-urls.txt
```

---

**Gerado automaticamente pelo script de filtro de imagens enem.dev**  
**Localização:** `scripts/reports/ENEM-DEV-IMAGES.md`


