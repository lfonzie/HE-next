# Sistema de Nomenclatura de Versões - HubEdu.ai

## Status Atual
- **Versão Atual**: v0.0.20 (Pré-Produção)
- **Último Commit**: `2d7f688` - fix: implementar correções cirúrgicas na classificação de módulos
- **Próxima Versão**: v0.0.21

## Padrão de Nomenclatura

### Versões Patch (0.0.x) - Pré-Produção
- **v0.0.21** - Próxima versão patch
- **v0.0.22** - Seguinte versão patch
- **v0.0.x** - Continuação até v0.0.99

### Versões Minor (0.x.0) - Beta/RC
- **v0.1.0** - Primeira versão beta (Release Candidate)
- **v0.2.0** - Segunda versão beta
- **v0.x.0** - Versões beta até v0.9.0

### Versões Major (x.0.0) - Produção
- **v1.0.0** - Primeira versão de produção estável
- **v1.1.0** - Primeira versão minor de produção
- **v2.0.0** - Segunda versão major

## Critérios para Mudança de Versão

### Patch (0.0.x → 0.0.x+1)
- Correções de bugs
- Melhorias menores
- Ajustes de configuração
- Correções de deploy

### Minor (0.0.x → 0.1.0)
- Novas funcionalidades significativas
- Melhorias importantes de UX/UI
- Integração de novas APIs
- Sistema estável para testes beta

### Major (0.x.0 → 1.0.0)
- Sistema pronto para produção
- Todas as funcionalidades principais implementadas
- Testes completos realizados
- Deploy em ambiente de produção

## Template para Próximos Commits

```
## Versão 0.0.21 - [Título da Versão]
**Data:** [Data do commit]
**Commits:** [Número do commit]

### Commits:
- `[hash]` - [Descrição do commit]

### Funcionalidades:
- [Lista de funcionalidades implementadas]

### Correções:
- [Lista de bugs corrigidos]

### Melhorias:
- [Lista de melhorias implementadas]
```

## Histórico de Versões Atualizado

### Versão Atual: v0.0.20
- **Commits**: 106-108
- **Status**: Pré-Produção
- **Última atualização**: Correções cirúrgicas na classificação de módulos

### Próxima Versão: v0.0.21
- **Status**: Aguardando próximo commit
- **Tipo**: Patch (correção/melhoria menor)

## Comandos para Versionamento

```bash
# Atualizar versão no package.json
npm version patch

# Criar tag da versão
git tag v0.0.21

# Push da tag
git push origin v0.0.21
```

## Notas Importantes

1. **Cada commit** representa uma nova versão patch durante a pré-produção
2. **Versões minor** serão criadas quando houver funcionalidades significativas
3. **Versão major** será criada quando o sistema estiver pronto para produção
4. **Documentação** deve ser atualizada a cada nova versão
5. **Tags** devem ser criadas para cada versão importante

## Próximas Ações

- [ ] Aguardar próximo commit
- [ ] Nomear como v0.0.21
- [ ] Atualizar package.json
- [ ] Criar tag git
- [ ] Atualizar documentação
