# 🧠 Frameworks de IA - Prompts Especializados

Este diretório contém os frameworks estruturados para módulos especializados de IA do HubEdu.ia.

## 📁 Estrutura

```
lib/prompts/
├── README.md                      # Este arquivo
├── social-media-framework.json    # Framework completo para geração de posts
└── ti-framework.json              # Framework completo para suporte técnico
```

## 🎯 Módulos Disponíveis

### 📱 Social Media (`social-media-framework.json`)

**Objetivo:** Gerar posts criativos, coesos e envolventes para redes sociais.

**Quando usar:**
- Quando o usuário mencionar "social media" ou "post" ou "redes sociais"
- Quando pedir para criar conteúdo para Instagram, Facebook, LinkedIn, etc.

**Workflow:**
1. **Confirmação de Parâmetros** - Coletar:
   - Propósito do conteúdo
   - Público-alvo
   - Tom desejado
   - Informações essenciais
   - Extensão (curto/médio/longo)

2. **Geração do Post** - Estrutura padrão:
   ```
   📸✨ [Título atraente] ✨📸
   
   [Parágrafo 1: Introdução envolvente]
   [Parágrafo 2: Desenvolvimento]
   [Parágrafo 3: Fechamento afetivo]
   
   [Encerramento celebrativo]
   ```

**Regras de estilo:**
- Emojis relevantes
- Linguagem natural e fluida
- Frases curtas e legíveis
- Destacar aspecto humano
- Evitar clichês

**Exemplo de uso no chat:**
```
Usuário: "Preciso de um post sobre o Dia do Professor"
IA: [Aplica framework, pergunta parâmetros, gera post estruturado]
```

---

### 💻 Suporte TI (`ti-framework.json`)

**Objetivo:** Diagnosticar e resolver problemas técnicos de forma estruturada e segura.

**Quando usar:**
- Quando o usuário mencionar "TI", "suporte técnico", "problema técnico"
- Quando reportar erros de sistema, rede, aplicativos, hardware

**Workflow de 7 Etapas:**
1. **Triagem** - Resumir problema + impacto
2. **Reproduzir e isolar** - Identificar escopo
3. **Coleta de dados** - Logs, versões, mensagens
4. **Hipóteses e plano** - 3-5 hipóteses ordenadas
5. **Execução de correções** - Incremental e reversível
6. **Validação** - Testes funcionais
7. **Prevenção** - Documentação + KB

**Princípios:**
- ⚠️ **Segurança**: Nunca ações destrutivas sem backup
- 💬 **Comunicação**: Linguagem simples e passos numerados
- 🔧 **Gradual**: Menos invasivo → mais invasivo

**Playbooks inclusos:**
- 🌐 Rede e Conectividade
- 🌍 Navegador Web
- 💾 Aplicativos Desktop
- 📧 Email
- 🖨️ Impressoras

**Exemplo de uso no chat:**
```
Usuário: "A impressora não está imprimindo"
IA: [Aplica framework TI, coleta informações, executa diagnóstico em 7 etapas]
```

---

## 🔄 Integração com o Chat

Esses frameworks estão integrados ao sistema de chat através do `system-message.json`:

```json
{
  "chat_modules": {
    "social_media": {
      "name": "Social Media",
      "framework": "lib/prompts/social-media-framework.json",
      ...
    },
    "ti": {
      "name": "Suporte Técnico",
      "framework": "lib/prompts/ti-framework.json",
      ...
    }
  }
}
```

## 📝 Como Usar

### No Chat Principal

O sistema detecta automaticamente quando aplicar cada framework:

**Social Media:**
```
Usuário: "Crie um post para o Instagram sobre nosso evento de ciências"
→ Ativa framework de Social Media automaticamente
```

**Suporte TI:**
```
Usuário: "O Google Classroom não está abrindo"
→ Ativa framework de TI automaticamente
```

### Detecção Automática

O sistema usa palavras-chave para detectar qual módulo ativar:

- **Social Media**: post, social, instagram, facebook, linkedin, marketing
- **TI**: problema, erro, não funciona, suporte, técnico, TI

## 🎨 Customização

Para adicionar novos frameworks:

1. Crie arquivo JSON em `lib/prompts/[nome]-framework.json`
2. Siga a estrutura dos frameworks existentes
3. Atualize `system-message.json` para referenciar o novo framework
4. Documente neste README

## 📊 Status

| Framework | Status | Última Atualização | Versão |
|-----------|--------|-------------------|--------|
| Social Media | ✅ Ativo | 2025-10-08 | 1.0 |
| Suporte TI | ✅ Ativo | 2025-10-08 | 1.0 |

---

## 🔗 Referências

- [System Message Config](../../system-message.json)
- [Módulos de Comunicação](../../MODULOS_COMUNICACAO_IMPLEMENTADOS.md)
- [Sistema de Prompts](../../SYSTEM_PROMPTS_IMPLEMENTATION_SUMMARY.md)

---

**Desenvolvido para HubEdu.ia** 🎓
Educação inteligente com IA especializada

