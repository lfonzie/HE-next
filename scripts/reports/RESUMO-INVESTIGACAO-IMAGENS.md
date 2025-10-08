# 📊 Relatório de Investigação de Imagens - Questões ENEM

**Data da Investigação:** 8 de Outubro de 2025  
**Script:** `investigate-enem-local-images.ts`

---

## 📈 Estatísticas Gerais

| Métrica | Valor |
|---------|-------|
| **Total de Questões** | 2.278 |
| **Questões com Imagens** | 714 (31,3%) |
| **Questões com Arquivos Locais** | 709 |
| **Total de Referências de Imagens** | 3.758 |
| **URLs Únicas** | 2.984 |

---

## 📅 Distribuição por Ano

Dados de **15 anos** de provas do ENEM (2009-2023):

| Ano | Quantidade de Imagens |
|-----|----------------------|
| 2023 | 262 |
| 2022 | 408 |
| 2021 | 353 |
| 2020 | 318 |
| 2019 | 193 |
| 2018 | 463 |
| 2017 | 250 |
| 2016 | 204 |
| 2015 | 156 |
| 2014 | 208 |
| 2013 | 197 |
| 2012 | 249 |
| 2011 | 134 |
| 2010 | 172 |
| 2009 | 191 |

**Anos com mais imagens:**
1. 🥇 2018: 463 imagens
2. 🥈 2022: 408 imagens
3. 🥉 2021: 353 imagens

---

## 📚 Distribuição por Disciplina

| Disciplina | Quantidade de Imagens | Percentual |
|------------|----------------------|------------|
| **Matemática** | 1.840 | 49,0% |
| **Ciências da Natureza** | 1.109 | 29,5% |
| **Linguagens** | 407 | 10,8% |
| **Ciências Humanas** | 402 | 10,7% |

**Observação:** Matemática e Ciências da Natureza juntas representam 78,5% de todas as imagens, o que é esperado devido à natureza visual dessas disciplinas (gráficos, diagramas, fórmulas, etc.).

---

## 📍 Distribuição por Campo/Origem

| Campo | Quantidade | Descrição |
|-------|-----------|-----------|
| **local_file** | 1.489 | Arquivos de imagem armazenados localmente |
| **context** | 780 | Imagens no texto da questão |
| **files_json** | 769 | Referências no campo "files" do JSON |
| **alternative_A_file** | 144 | Imagem na alternativa A |
| **alternative_B_file** | 144 | Imagem na alternativa B |
| **alternative_C_file** | 144 | Imagem na alternativa C |
| **alternative_D_file** | 144 | Imagem na alternativa D |
| **alternative_E_file** | 144 | Imagem na alternativa E |

---

## 🔗 Tipos de URL

| Tipo | Quantidade | Percentual |
|------|-----------|------------|
| **HTTPS** | 2.266 | 60,3% |
| **Caminhos Relativos** | 1.489 | 39,6% |
| **HTTP** | 3 | 0,1% |
| **Outros** | 0 | 0,0% |

---

## 🌐 Domínios Externos

| Domínio | Quantidade | Observação |
|---------|-----------|------------|
| **enem.dev** | 2.266 | Domínio principal (99,9%) |
| **images.quebarato.com.br** | 1 | Imagem externa |
| **www.edmontonculturalcapital.com** | 1 | Imagem externa |
| **www.filmica.com** | 1 | Imagem externa |

**Análise:** 
- A grande maioria das imagens (99,9%) está hospedada no domínio `enem.dev`
- Existem apenas 3 imagens hospedadas em domínios externos (possíveis candidatas a problemas)

---

## 📁 Tipos de Arquivo Local

| Formato | Quantidade | Percentual |
|---------|-----------|------------|
| **.png** | 1.210 | 81,3% |
| **.jpg** | 267 | 17,9% |
| **.bmp** | 10 | 0,7% |
| **.jpeg** | 2 | 0,1% |

**Padrão:** Predominância de arquivos PNG (melhor para gráficos e diagramas).

---

## 🔍 Observações Importantes

### ✅ Pontos Positivos
1. **Cobertura ampla:** 15 anos de provas (2009-2023)
2. **Padronização:** 99,9% das imagens no domínio enem.dev
3. **Arquivos locais:** 709 questões têm backup local das imagens
4. **Organização:** Estrutura consistente de pastas por ano e questão

### ⚠️ Pontos de Atenção
1. **Imagem quebrada:** URL `https://enem.dev/broken-image.svg` encontrada
2. **Domínios externos:** 3 imagens em domínios externos podem apresentar problemas de disponibilidade
3. **URLs HTTP:** 3 URLs ainda usam HTTP ao invés de HTTPS

### 📝 Recomendações
1. **Verificar imagem quebrada:** Investigar e corrigir a questão 2023-1-espanhol
2. **Migrar imagens externas:** Fazer download das 3 imagens de domínios externos
3. **Atualizar URLs HTTP:** Migrar as 3 URLs HTTP para HTTPS
4. **Validar integridade:** Verificar se todos os arquivos locais existem e são válidos

---

## 📄 Arquivos de Relatório Gerados

Os seguintes arquivos foram gerados na pasta `scripts/reports/`:

1. **enem-local-all-image-references.json**  
   Todas as 3.758 referências de imagens com detalhes completos

2. **enem-local-unique-urls.json**  
   Lista das 2.984 URLs únicas com estatísticas de uso

3. **enem-local-questions-with-images.json**  
   Informações das 714 questões que contêm imagens

4. **enem-local-image-references.csv**  
   Formato CSV para análise em planilhas (Excel, Google Sheets, etc.)

---

## 💡 Como Usar os Relatórios

### Análise em Planilha
```bash
# Abrir o CSV no Excel ou Google Sheets
open scripts/reports/enem-local-image-references.csv
```

### Análise Programática
```typescript
// Ler URLs únicas
import urls from './scripts/reports/enem-local-unique-urls.json';
console.log(`Total de URLs únicas: ${urls.length}`);
```

### Verificar URLs Específicas
```bash
# Buscar todas as referências de uma URL específica
grep "enem.dev/broken-image.svg" scripts/reports/enem-local-image-references.csv
```

---

## 🔄 Executar Novamente

Para executar a investigação novamente:

```bash
npm run investigate:enem-local-images
```

---

**Gerado automaticamente pelo script de investigação de imagens do ENEM**


