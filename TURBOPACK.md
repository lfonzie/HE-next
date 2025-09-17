# 🚀 Turbopack Configuration

Este projeto está configurado para usar o **Turbopack**, o bundler de próxima geração do Next.js que oferece builds até **10x mais rápidos** em desenvolvimento.

## 🎯 Como Usar

### Desenvolvimento com Turbopack
```bash
npm run dev:turbo
```

### Desenvolvimento Padrão (Webpack)
```bash
npm run dev
```

## ⚡ Benefícios do Turbopack

- **Builds 10x mais rápidos** em desenvolvimento
- **Hot Reload instantâneo** para mudanças em CSS e componentes
- **Melhor performance** com projetos grandes
- **Compatibilidade total** com Next.js 15+

## 🔧 Configuração

### Package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo"
  }
}
```

### Next.config.js
```javascript
// Nova configuração do Turbopack (substitui experimental.turbo)
turbopack: {
  rules: {
    '*.svg': {
      loaders: ['@svgr/webpack'],
      as: '*.js',
    },
  },
}
```

> **⚠️ Importante**: A configuração `experimental.turbo` foi depreciada. Use `turbopack` diretamente.

## 📊 Comparação de Performance

| Métrica | Webpack | Turbopack | Melhoria |
|---------|---------|-----------|----------|
| Cold Start | ~3-5s | ~300-500ms | **10x** |
| Hot Reload | ~1-2s | ~50-100ms | **20x** |
| Build Time | ~30-60s | ~3-6s | **10x** |

## 🚨 Limitações Atuais

- **Apenas desenvolvimento**: Turbopack ainda não suporta builds de produção
- **Plugins limitados**: Alguns plugins do Webpack podem não funcionar
- **Debugging**: Ferramentas de debug podem ter limitações

## 🛠️ Troubleshooting

### Se encontrar problemas com Turbopack:

1. **Volte para Webpack**:
   ```bash
   npm run dev
   ```

2. **Limpe o cache**:
   ```bash
   rm -rf .next
   npm run dev:turbo
   ```

3. **Verifique dependências**:
   ```bash
   npm install
   ```

### ⚠️ Problemas Comuns Resolvidos

#### Configuração Depreciada
- **Problema**: `experimental.turbo` está depreciado
- **Solução**: Use `turbopack` diretamente no next.config.js

#### ESM Externals
- **Problema**: `experimental.esmExternals` não é suportado
- **Solução**: Remova esta configuração do next.config.js

#### Configuração Atualizada
```javascript
// ❌ Antigo (depreciado)
experimental: {
  turbo: { ... },
  esmExternals: false
}

// ✅ Novo (atualizado)
turbopack: {
  rules: { ... }
}
```

## 📝 Notas Importantes

- Use `dev:turbo` para desenvolvimento rápido
- Use `dev` para debugging ou compatibilidade
- Turbopack é experimental, mas estável para a maioria dos casos
- Builds de produção continuam usando Webpack

## 🔗 Links Úteis

- [Documentação oficial do Turbopack](https://turbo.build/pack)
- [Next.js Turbopack](https://nextjs.org/docs/app/building-your-application/configuring/turbopack)
- [Comparação de performance](https://turbo.build/pack/docs/core-concepts/benchmarks)
