# Laboratório Virtual - Documentação

## 🧪 Visão Geral

O **Laboratório Virtual** é um módulo educacional interativo desenvolvido para Next.js 15, focado em experimentos de **Química** e **Física** com pegada de videogame. O sistema permite que estudantes realizem experimentos virtuais de forma segura, interativa e educativa, alinhado à BNCC.

## 🎯 Características Principais

### ✨ **Interface Estilo Videogame**
- **Canvas 2D** com renderização em tempo real
- **Drag & Drop** de equipamentos e reagentes
- **HUD** completo com inventário, controles e instrumentos
- **Animações** fluidas com Framer Motion
- **Feedback visual** imediato (cores, partículas, efeitos)

### 🔬 **Experimentos Disponíveis**

#### **Química**
- **Titulação Ácido-Base** (HCl × NaOH)
- **Cinética Química** (efeito da temperatura)
- **Produto de Solubilidade** (Ksp)
- **Equilíbrio e Tampões**
- **Estequiometria** (reagente limitante)

#### **Física**
- **Lei de Ohm** e associações de resistores
- **Circuitos Elétricos** (série/paralelo)
- **Movimento 1D/2D** (MRU, MRUV, projétil)
- **Colisões** (elásticas/inelásticas)
- **Óptica Geométrica** (lentes, espelhos)

### 🧮 **Motor de Simulação Determinístico**
- **RNG** com seed para reprodutibilidade
- **Física realística** com fórmulas científicas
- **Química computacional** (pH, Ksp, Arrhenius)
- **Timestep** ajustável (60Hz render, 30Hz física)
- **Undo/Redo** completo

### 📊 **Sistema de Avaliação**
- **Objetivos** com validação automática
- **Pontuação** baseada em precisão e eficiência
- **Feedback** contextual e educativo
- **Logs** detalhados de experimentos
- **Telemetria** agregada (sem dados pessoais)

## 🏗️ Arquitetura

### **Estrutura de Pastas**
```
app/virtual-lab/
├── components/           # Componentes React
│   ├── BenchCanvas.tsx   # Canvas principal
│   ├── InventoryPanel.tsx # Painel de inventário
│   ├── ControlPanel.tsx  # Controles de simulação
│   └── InstrumentsPanel.tsx # Instrumentos de medição
├── engine/               # Motor de simulação
│   ├── core/            # Core (RNG, unidades, loop)
│   ├── chem/            # Módulos de química
│   └── physics/         # Módulos de física
├── types/               # Definições TypeScript
├── state/               # Store Zustand
├── presets/             # Presets de experimentos
├── utils/               # Utilitários e validadores
└── api/                 # Rotas de API
```

### **Tecnologias Utilizadas**
- **Next.js 15** (App Router, TypeScript)
- **Zustand** (gerenciamento de estado)
- **Framer Motion** (animações)
- **Canvas API** (renderização 2D)
- **Tailwind CSS** (estilização)
- **shadcn/ui** (componentes)

## 🚀 Como Usar

### **1. Acessar o Laboratório**
```bash
# Desenvolvimento
npm run dev
# Acesse: http://localhost:3000/virtual-lab
```

### **2. Selecionar Experimento**
- Escolha um preset na lista suspensa
- O laboratório será configurado automaticamente
- Objetivos e instruções aparecerão no painel

### **3. Realizar Experimento**
- **Arraste** equipamentos do inventário para a bancada
- **Configure** parâmetros usando os controles
- **Execute** a simulação com Play/Pause/Step
- **Meça** resultados com instrumentos virtuais

### **4. Avaliar Resultados**
- Objetivos são validados automaticamente
- Pontuação é calculada em tempo real
- Logs detalhados são mantidos
- Dados podem ser exportados

## 📝 Criando Novos Presets

### **Estrutura de um Preset**
```json
{
  "id": "experiment_unique_id",
  "title": "Nome do Experimento",
  "discipline": "chem" | "physics",
  "objective": "Objetivo pedagógico alinhado à BNCC",
  "seed": 42,
  "bench": {
    "items": [...],      // Equipamentos disponíveis
    "layout": [...],     // Posições iniciais
    "connections": [...] // Conexões entre itens
  },
  "initialState": {...}, // Estado inicial da simulação
  "objectives": [...],   // Objetivos a serem atingidos
  "hints": [...],        // Dicas para o estudante
  "expectedOutcomes": {...} // Resultados esperados
}
```

### **Exemplo: Preset de Química**
```json
{
  "id": "chem_titration_01",
  "title": "Titulação Ácido-Base",
  "discipline": "chem",
  "objective": "Compreender neutralização e identificar ponto de equivalência",
  "bench": {
    "items": [
      {
        "id": "erlenmeyer",
        "kind": "vessel",
        "name": "Erlenmeyer 250 mL",
        "props": { "capacity_mL": 250 }
      },
      {
        "id": "burette",
        "kind": "vessel", 
        "name": "Bureta 50 mL",
        "props": { "capacity_mL": 50, "flow_mLps": [0, 1] }
      }
    ],
    "layout": [
      { "itemId": "erlenmeyer", "x": 420, "y": 520 },
      { "itemId": "burette", "x": 620, "y": 120 }
    ]
  },
  "objectives": [
    {
      "id": "ph_target",
      "description": "Atingir pH ~ 7.0",
      "validator": {
        "type": "pH-in-range",
        "params": { "min": 6.9, "max": 7.1 }
      },
      "points": 50
    }
  ]
}
```

## 🔧 Tipos de Validadores

### **Química**
- `pH-in-range`: Valida faixa de pH
- `concentration-in-range`: Valida concentração molar
- `indicator-color-change`: Valida mudança de cor
- `log-has-key`: Valida presença de dados no log

### **Física**
- `current-in-range`: Valida corrente elétrica
- `voltage-measurements`: Valida medições de tensão
- `ohm-law-verification`: Verifica Lei de Ohm
- `compare-series-parallel`: Compara configurações

### **Geral**
- `time-limit`: Valida limite de tempo
- `table-has-rows`: Valida número de medições
- `temperature-in-range`: Valida temperatura
- `mass-in-range`: Valida massa

## 🎮 Controles e Atalhos

### **Mouse**
- **Clique**: Selecionar item
- **Arrastar**: Mover item na bancada
- **Clique direito**: Menu de contexto
- **Scroll**: Zoom in/out

### **Teclado**
- **R**: Executar/Pausar simulação
- **Backspace**: Desfazer ação
- **Shift + Backspace**: Refazer ação
- **G**: Alternar grid
- **S**: Salvar estado
- **L**: Carregar estado

### **Controles de Simulação**
- **Play**: Iniciar simulação
- **Pause**: Pausar simulação
- **Stop**: Parar e resetar
- **Step**: Executar um passo
- **Reset**: Voltar ao estado inicial

## 📊 Sistema de Telemetria

### **Dados Coletados (Anônimos)**
- Eventos de interação (cliques, arrastar, medir)
- Tempo gasto em cada experimento
- Número de tentativas por objetivo
- Instrumentos utilizados
- Precisão das medições

### **Privacidade**
- **Sem dados pessoais** (PII)
- **IDs aleatórios** por sessão
- **Opt-out** disponível
- **Agregação** de dados apenas

### **Analytics Disponíveis**
- Taxa de conclusão por experimento
- Tempo médio de sessão
- Eventos mais comuns
- Taxa de erro
- Engajamento do usuário

## 🔒 Segurança e Restrições

### **Limites Didáticos**
- Volumes máximos seguros
- Temperaturas máximas permitidas
- Tensões máximas em circuitos
- Combinações químicas realistas

### **Validações**
- Verificação de parâmetros de entrada
- Sanitização de dados
- Prevenção de valores absurdos
- Mensagens de segurança

## 🧪 Extensibilidade

### **Adicionando Novos Experimentos**
1. Criar preset JSON na pasta `presets/`
2. Implementar validador em `utils/validators.ts`
3. Adicionar itens ao inventário em `page.tsx`
4. Testar e validar funcionamento

### **Adicionando Novos Instrumentos**
1. Definir tipo em `types/lab.ts`
2. Implementar renderização em `BenchCanvas.tsx`
3. Adicionar ao painel de instrumentos
4. Integrar com sistema de medição

### **Adicionando Novos Módulos**
1. Criar engine específico em `engine/`
2. Integrar com `SimulationEngine`
3. Adicionar tipos TypeScript
4. Implementar validações

## 🐛 Solução de Problemas

### **Problemas Comuns**

#### **Canvas não renderiza**
- Verificar se `canvasRef` está definido
- Confirmar dimensões do canvas
- Verificar se `renderCanvas()` está sendo chamado

#### **Simulação não inicia**
- Verificar se `SimulationEngine` está inicializado
- Confirmar configurações de timestep
- Verificar callbacks de atualização

#### **Validação falha**
- Verificar parâmetros do validador
- Confirmar tipos de dados esperados
- Verificar implementação do validador

#### **Performance lenta**
- Reduzir timestep da simulação
- Limitar número de itens na bancada
- Otimizar renderização do canvas

### **Debug**
```typescript
// Habilitar logs detalhados
console.log('🔬 [VIRTUAL-LAB] Debug mode enabled');

// Verificar estado da simulação
console.log('Simulation state:', simulationState);

// Verificar logs de experimento
console.log('Trial log:', trialLog);
```

## 📈 Roadmap Futuro

### **Fase 4: Colaboração**
- [ ] Experimentos colaborativos em tempo real
- [ ] Compartilhamento de cenários
- [ ] Chat integrado para discussões
- [ ] Sistema de avaliação por pares

### **Fase 5: IA Avançada**
- [ ] Assistente IA para dúvidas
- [ ] Análise preditiva de resultados
- [ ] Sugestões personalizadas de experimentos
- [ ] Detecção automática de erros

### **Fase 6: Realidade Virtual**
- [ ] Suporte a VR/AR
- [ ] Interação gestual
- [ ] Ambientes 3D imersivos
- [ ] Haptics para feedback tátil

## 🤝 Contribuição

### **Como Contribuir**
1. Fork do repositório
2. Criar branch para feature
3. Implementar com testes
4. Submeter pull request

### **Padrões de Código**
- **TypeScript** estrito
- **ESLint** + **Prettier**
- **Testes** unitários obrigatórios
- **Documentação** atualizada

### **Áreas de Contribuição**
- Novos experimentos e presets
- Melhorias na física/química
- Otimizações de performance
- Novos instrumentos virtuais
- Melhorias na UI/UX

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: suporte@exemplo.com

---

**Desenvolvido com ❤️ para a educação científica brasileira**
