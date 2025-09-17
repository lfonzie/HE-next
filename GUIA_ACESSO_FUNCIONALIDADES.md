# 🚀 Guia de Acesso às Novas Funcionalidades

## 📍 Como Acessar as Novas Funcionalidades

### 1. **Página de Demonstração Principal**
```
http://localhost:3000/demo
```
Esta página contém todas as novas funcionalidades em uma interface organizada com abas.

### 2. **Acesso Direto por Funcionalidade**

#### 🔧 **Troubleshooting Interativo**
```
http://localhost:3000/demo?tab=ti
```
- Resolução passo-a-passo de problemas de TI
- Dicas em tempo real com IA
- Suporte para problemas de PC e Wi-Fi

#### 🏆 **Sistema de Conquistas**
```
http://localhost:3000/demo?tab=achievements
```
- Gamificação com badges e conquistas
- Progresso visual de objetivos
- Categorias: Engajamento, Exploração, Consistência, Desafios

#### 📊 **Dashboard de Analytics**
```
http://localhost:3000/demo?tab=analytics
```
- Métricas de uso e performance
- Gráficos interativos
- Estatísticas de tempo de estudo

## 🔌 **APIs Disponíveis**

### Troubleshooting Hints
```bash
POST /api/ti/hint
Content-Type: application/json

{
  "question": "Meu computador está lento",
  "playbookId": "pc-lento",
  "stepId": "s1",
  "stepLabel": "Check running programs",
  "context": {},
  "previousStates": {}
}
```

### Achievements
```bash
# Obter conquistas do usuário
GET /api/achievements?userId=user-123

# Desbloquear conquista
POST /api/achievements
Content-Type: application/json

{
  "userId": "user-123",
  "achievementId": "ti_expert",
  "metadata": {"type": "ti_session"}
}
```

### Analytics
```bash
# Obter métricas do usuário
GET /api/analytics?userId=user-123&timeRange=30d
```

## 🎯 **Funcionalidades por Categoria**

### **Troubleshooting Interativo**
- ✅ Resolução guiada de problemas
- ✅ Dicas contextuais com IA
- ✅ Progresso visual
- ✅ Múltiplos playbooks (PC, Wi-Fi)
- ✅ Feedback em tempo real

### **Sistema de Gamificação**
- ✅ Conquistas por categoria
- ✅ Progresso visual
- ✅ Badges desbloqueáveis
- ✅ Sistema de pontos
- ✅ Metas personalizáveis

### **Analytics Avançado**
- ✅ Métricas de uso
- ✅ Gráficos interativos
- ✅ Tempo de estudo
- ✅ Performance por módulo
- ✅ Estatísticas de conquistas

## 🛠️ **Integração com Componentes Existentes**

### **Como Usar no Chat**
```tsx
import { TIInteractive } from '@/components/ti-interactive/TIInteractive';

// No componente de chat
<TIInteractive initialQuestion={userMessage} />
```

### **Como Usar Conquistas**
```tsx
import { AchievementSystem } from '@/components/gamification/AchievementSystem';

// No perfil do usuário
<AchievementSystem userId={user.id} />
```

### **Como Usar Analytics**
```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

// No dashboard do usuário
<AnalyticsDashboard userId={user.id} timeRange="30d" />
```

## 📱 **Navegação Rápida**

### **Links Diretos**
- [Troubleshooting](http://localhost:3000/demo?tab=ti)
- [Conquistas](http://localhost:3000/demo?tab=achievements)
- [Analytics](http://localhost:3000/demo?tab=analytics)

### **Menu de Navegação**
As novas funcionalidades aparecem no menu principal com badges "NOVO":
- 🔧 Troubleshooting
- 🏆 Conquistas  
- 📊 Analytics

## 🎮 **Exemplos de Uso**

### **1. Resolver Problema de PC Lento**
1. Acesse `/demo?tab=ti`
2. Digite: "Meu computador está muito lento"
3. Siga os passos guiados
4. Receba dicas em tempo real

### **2. Verificar Conquistas**
1. Acesse `/demo?tab=achievements`
2. Veja conquistas desbloqueadas
3. Acompanhe progresso de objetivos
4. Visualize badges por categoria

### **3. Analisar Métricas**
1. Acesse `/demo?tab=analytics`
2. Veja gráficos de uso
3. Analise tempo de estudo
4. Monitore performance

## 🔧 **Configuração Técnica**

### **Variáveis de Ambiente Necessárias**
```env
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### **Dependências Instaladas**
- `recharts` - Para gráficos
- `@tanstack/react-query` - Para cache de dados
- `class-variance-authority` - Para estilos
- `clsx` - Para classes condicionais
- `tailwind-merge` - Para merge de classes

## 🚀 **Próximos Passos**

1. **Teste as funcionalidades** na página de demo
2. **Integre nos componentes existentes** conforme necessário
3. **Customize** os playbooks de troubleshooting
4. **Configure** conquistas específicas para seu domínio
5. **Analise** as métricas coletadas

## 📞 **Suporte**

Para dúvidas ou problemas:
- Verifique os logs do console
- Teste os endpoints da API
- Consulte a documentação dos componentes
- Verifique as variáveis de ambiente

---

**🎉 As novas funcionalidades estão prontas para uso!**

