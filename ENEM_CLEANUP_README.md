# Script de Limpeza do Banco de Dados ENEM

Este conjunto de scripts foi criado para identificar e remover questões problemáticas do banco de dados do ENEM.

## Problemas Identificados

O script identifica os seguintes tipos de problemas:

1. **IMAGE_ONLY**: Questões que contêm apenas imagem sem texto contextual
2. **EMPTY_CONTEXT**: Questões com contexto vazio ou muito curto (< 10 caracteres)
3. **QUESTION_AS_ANSWER**: Questões onde a pergunta está sendo usada como resposta
4. **MISSING_ALTERNATIVES**: Questões sem as 5 alternativas obrigatórias
5. **BROKEN_IMAGE**: Questões com URLs de imagem quebradas ou inacessíveis

## Arquivos

- `cleanup-enem-questions.js`: Script principal de limpeza
- `test-enem-validation.js`: Script de teste e validação
- `ENEM_CLEANUP_README.md`: Esta documentação

## Como Usar

### 1. Teste Inicial

Antes de executar a limpeza, teste o script para ver quantas questões problemáticas existem:

```bash
# Testar questões específicas
node test-enem-validation.js

# Testar um ano específico (primeiras 10 questões)
node test-enem-validation.js year 2023
```

### 2. Executar Limpeza Completa

Para executar a limpeza completa de todos os anos:

```bash
node cleanup-enem-questions.js
```

**⚠️ IMPORTANTE**: O script criará automaticamente um backup antes de remover qualquer questão.

## Funcionamento do Script Principal

### Backup Automático
- Cria uma cópia completa em `QUESTOES_ENEM_BACKUP/`
- Preserva toda a estrutura de diretórios
- Permite recuperação completa se necessário

### Processo de Validação
1. **Análise de Contexto**: Verifica se há texto suficiente além de imagens
2. **Verificação de URLs**: Testa se as imagens estão acessíveis
3. **Validação de Estrutura**: Confirma se tem 5 alternativas
4. **Detecção de Problemas**: Identifica questões malformadas

### Remoção Segura
- Remove apenas questões com problemas identificados
- Atualiza automaticamente os arquivos `details.json`
- Mantém a integridade da estrutura de dados

## Exemplo de Saída

```
=== INICIANDO LIMPEZA DO BANCO DE DADOS ENEM ===
Criando backup...
Backup criado com sucesso!

Processando ano 2023...
Ano 2023 processado: 45 questões problemáticas encontradas

=== ESTATÍSTICAS ===
Total de questões processadas: 1840
Questões problemáticas encontradas: 127
- Apenas imagem: 23
- Imagens quebradas: 15
- Pergunta sendo resposta: 8
- Contexto vazio: 67
- Alternativas faltando: 14
Anos processados: 15
Arquivos processados: 1840

Deseja remover 127 questões problemáticas? (s/N):
```

## Estrutura de Dados

O script trabalha com a seguinte estrutura:

```
QUESTOES_ENEM/
└── public/
    ├── 2009/
    │   ├── details.json
    │   └── questions/
    │       ├── 1/
    │       │   └── details.json
    │       └── 2/
    │           └── details.json
    └── 2023/
        ├── details.json
        └── questions/
            ├── 1-ingles/
            │   └── details.json
            └── 25/
                └── details.json
```

## Logs

Todos os logs são salvos em `enem-cleanup-log.txt` com timestamp para auditoria.

## Recuperação

Se algo der errado, você pode restaurar o backup:

```bash
# Remover dados corrompidos
rm -rf QUESTOES_ENEM/public

# Restaurar backup
cp -r QUESTOES_ENEM_BACKUP/* QUESTOES_ENEM/public/
```

## Tipos de Problemas Detectados

### IMAGE_ONLY
Questões que dependem apenas de imagem sem contexto textual suficiente.

**Exemplo problemático:**
```json
{
  "context": "![](https://example.com/image.png)",
  "alternativesIntroduction": "Analise a imagem e responda:"
}
```

### EMPTY_CONTEXT
Questões sem contexto ou com contexto muito curto.

**Exemplo problemático:**
```json
{
  "context": "",
  "alternativesIntroduction": "Qual é a resposta?"
}
```

### BROKEN_IMAGE
Questões com URLs de imagem que retornam erro 404 ou timeout.

### QUESTION_AS_ANSWER
Questões onde a resposta está no contexto da pergunta.

**Exemplo problemático:**
```json
{
  "context": "A resposta é alternativa B",
  "alternativesIntroduction": "Qual é a resposta correta?",
  "alternatives": [
    {"text": "Alternativa A", "isCorrect": false},
    {"text": "Alternativa B", "isCorrect": true}
  ]
}
```

## Segurança

- ✅ Backup automático antes de qualquer modificação
- ✅ Validação completa antes da remoção
- ✅ Logs detalhados de todas as operações
- ✅ Confirmação do usuário antes da remoção
- ✅ Preservação da estrutura de dados

## Suporte

Para problemas ou dúvidas, verifique:
1. O arquivo de log `enem-cleanup-log.txt`
2. O backup em `QUESTOES_ENEM_BACKUP/`
3. Execute o script de teste primeiro para diagnóstico
