# Status do modelo `gpt-4o-mini` após a migração para Grok 4 Fast

Com a troca do provedor padrão para **Grok 4 Fast Reasoning**, o modelo `gpt-4o-mini` passou a ocupar um papel de **fallback** dentro do ecossistema HubEdu. Este documento destaca onde o modelo da OpenAI continua ativo e quais pontos foram atualizados para priorizar o Grok.

## 1. Onde o Grok 4 Fast virou padrão
- **Registro de provedores** – `lib/ai-router/config/providers.yml` agora descreve `xai-grok-4-fast` como primeiro provedor habilitado, empurrando o cadastro da OpenAI para posição secundária.【F:lib/ai-router/config/providers.yml†L1-L45】
- **Fallback automático do roteador** – `lib/ai-router/ai-router.ts` usa o Grok para gerar respostas de contingência sempre que o roteador está desabilitado ou ocorre erro na execução.【F:lib/ai-router/ai-router.ts†L188-L248】【F:lib/ai-router/ai-router.ts†L300-L338】
- **Política de modos shadow/canary** – `lib/ai-router/model-router.ts` agora força o retorno para `xai-grok-4-fast` quando o modo shadow/canary precisa garantir estabilidade, substituindo o comportamento anterior que apontava para OpenAI.【F:lib/ai-router/model-router.ts†L312-L346】
- **Camada de segurança** – a verificação `isProviderSuitableForSensitiveData` considera o Grok como provedor seguro por padrão, mantendo o OpenAI apenas como opção adicional.【F:lib/ai-router/safety-layer.ts†L382-L404】

## 2. Onde o `gpt-4o-mini` permanece ativo
- **Catálogo de provedores** – apesar da troca de prioridade, o provider `openai-gpt-4o-mini` continua registrado em `lib/ai-router/config/providers.yml` e no `ProviderRegistry`, permitindo fallback rápido para fluxos que dependam da OpenAI.【F:lib/ai-router/config/providers.yml†L47-L104】【F:lib/ai-router/provider-registry.ts†L62-L125】
- **Chamadas específicas OpenAI** – serviços que utilizam SDKs da OpenAI (ex.: geração de questões ENEM) seguem referenciando `gpt-4o-mini` até que a migração dessas rotinas seja concluída.【F:lib/enem-api.ts†L599-L651】

## 3. Atualizações de documentação e monitoramento
- **README do roteador** – `lib/ai-router/README.md` foi atualizado para descrever Grok 4 Fast como fallback de segurança e para ajustar exemplos de configuração e métricas.【F:lib/ai-router/README.md†L19-L61】【F:lib/ai-router/README.md†L120-L167】【F:lib/ai-router/README.md†L270-L294】
- **Este documento** – serve como guia rápido para localizar o legado do `gpt-4o-mini` e acompanhar o progresso da adoção do Grok.

> **Próximos passos sugeridos:** migrar gradualmente os fluxos ainda dependentes de `gpt-4o-mini` para o SDK do Grok ou manter planos de contingência claros caso o novo provedor esteja indisponível.
