# 🚀 Guia Rápido - Investigação de Imagens ENEM

## ✅ O que foi criado

### 📜 Scripts TypeScript (4)

1. **`investigate-enem-images.ts`** - Investiga banco de dados Prisma
2. **`investigate-enem-local-images.ts`** - Investiga arquivos JSON locais ⭐
3. **`validate-enem-images.ts`** - Valida URLs encontradas
4. **`list-enem-image-urls.ts`** - Lista URLs em formato texto

### 📊 Relatórios Gerados (11 arquivos)

#### JSON Detalhados (799 KB - 1.2 MB cada)
- `enem-local-all-image-references.json` - 3.758 referências
- `enem-local-unique-urls.json` - 2.984 URLs únicas
- `enem-local-questions-with-images.json` - 714 questões
- `enem-validation-results.json` - Resultados da validação
- `urls-by-domain.json` - URLs agrupadas por domínio

#### Arquivos de Texto (para uso direto)
- `all-image-urls.txt` - 2.984 URLs (uma por linha)
- `http-image-urls.txt` - 1.495 URLs HTTP/HTTPS
- `local-image-paths.txt` - 1.489 caminhos locais
- `unique-domains.txt` - 4 domínios únicos

#### CSV (para planilhas)
- `enem-local-image-references.csv` - 786 KB

#### Documentação
- `RESUMO-INVESTIGACAO-IMAGENS.md` - Análise completa
- `README-INVESTIGACAO-IMAGENS.md` - Documentação técnica

---

## 🎯 Comandos Disponíveis

```bash
# Investigar todas as questões (executar primeiro)
npm run investigate:enem-local-images

# Validar as URLs encontradas
npm run validate:enem-images

# Listar URLs em formato texto
npm run list:enem-image-urls

# Investigar banco de dados (atualmente vazio)
npm run investigate:enem-images
```

---

## 📈 Principais Descobertas

### Números
- **2.278** questões analisadas (2009-2023)
- **714** questões com imagens (31,3%)
- **3.758** referências de imagens
- **2.984** URLs únicas
- **1.489** arquivos locais (50%)

### Problemas Encontrados
1. ⚠️ **1 URL quebrada:** `https://enem.dev/broken-image.svg`
2. 🌐 **3 URLs externas** (fora do enem.dev)
3. ✅ **0 arquivos locais ausentes** (todos existem!)

### Distribuição
- **49%** das imagens são de Matemática
- **81%** dos arquivos são PNG
- **99%** das URLs são do domínio enem.dev

---

## 📁 Onde Encontrar os Arquivos

Todos os relatórios estão em:
```
scripts/reports/
```

### Uso Rápido

**Ver todas as URLs (uma por linha):**
```bash
cat scripts/reports/all-image-urls.txt
```

**Ver apenas URLs HTTP:**
```bash
cat scripts/reports/http-image-urls.txt
```

**Abrir CSV no Excel:**
```bash
open scripts/reports/enem-local-image-references.csv
```

**Ler JSON com jq:**
```bash
jq '.[0:10]' scripts/reports/enem-local-unique-urls.json
```

---

## 🔍 Buscar Informações Específicas

### URLs de um ano específico
```bash
grep "2023" scripts/reports/enem-local-image-references.csv
```

### Questões com broken-image.svg
```bash
grep "broken-image" scripts/reports/http-image-urls.txt
```

### Contar imagens por disciplina
```bash
jq 'group_by(.discipline) | map({discipline: .[0].discipline, count: length})' \
   scripts/reports/enem-local-all-image-references.json
```

---

## ⚡ Ações Prioritárias

### 🔴 Urgente
1. Corrigir `broken-image.svg` (5 questões afetadas)
2. Migrar 3 URLs externas para enem.dev

### 🟢 Opcional
1. Otimizar tamanho das imagens
2. Adicionar alt text para acessibilidade
3. Converter BMP para PNG (10 arquivos)

---

## 📊 Domínios Encontrados

| Domínio | URLs | % |
|---------|------|---|
| enem.dev | 1.492 | 99,8% |
| images.quebarato.com.br | 1 | 0,07% |
| www.edmontonculturalcapital.com | 1 | 0,07% |
| www.filmica.com | 1 | 0,07% |

---

## 💡 Dicas

### Ver estatísticas
```bash
# Total de URLs
wc -l scripts/reports/all-image-urls.txt

# URLs únicas por tipo
wc -l scripts/reports/*.txt
```

### Verificar arquivo existe
```bash
# Exemplo: verificar imagem local
ls QUESTOES_ENEM/public/2023/questions/100/92848aa5-da82-4c66-9945-7051120a42c9.jpg
```

### Filtrar por disciplina
```bash
grep "matematica" scripts/reports/enem-local-image-references.csv | wc -l
```

---

## 🐛 Troubleshooting

**Script não encontra arquivos:**
```bash
# Verificar estrutura
ls -la QUESTOES_ENEM/public/

# Re-executar investigação
npm run investigate:enem-local-images
```

**JSON muito grande:**
```bash
# Usar jq para ver partes
jq '.[:10]' scripts/reports/enem-local-unique-urls.json
```

---

## 📝 Próximos Passos

1. ✅ Investigação completa - **CONCLUÍDO**
2. ✅ Validação de URLs - **CONCLUÍDO**
3. ✅ Listagem de URLs - **CONCLUÍDO**
4. ⏳ Corrigir broken-image.svg - **PENDENTE**
5. ⏳ Migrar URLs externas - **PENDENTE**

---

**Criado em:** 8 de Outubro de 2025  
**Localização:** `/Users/lf/Documents/GitHub/HE-next/scripts/`


