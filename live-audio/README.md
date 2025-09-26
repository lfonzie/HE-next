# Live Audio App - Áudio em Tempo Real com IA

<div align="center">
<img width="1200" height="475" alt="Live Audio App" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📋 Visão Geral

O **Live Audio App** é uma aplicação moderna de áudio em tempo real que integra inteligência artificial com visualizações 3D interativas. Desenvolvido com tecnologias web modernas, oferece uma experiência imersiva de conversação com IA usando o Gemini API.

### ✨ Características Principais

- 🎤 **Áudio em Tempo Real**: Captura e processamento de áudio PCM em tempo real
- 🤖 **IA Integrada**: Conversação inteligente usando Gemini 2.5 Flash
- 🎨 **Visualizações 3D**: Efeitos visuais interativos que respondem ao áudio
- 📱 **Design Responsivo**: Interface adaptável para desktop e mobile
- ⚡ **Performance Otimizada**: Carregamento rápido e experiência fluida
- 🔧 **Arquitetura Modular**: Código organizado e facilmente extensível

## 🏗️ Arquitetura Centralizada

### Estrutura do Projeto

```
live-audio/
├── live-audio-app.tsx     # Componente principal centralizado
├── styles.ts              # Estilos CSS consolidados
├── utils.ts               # Utilitários de áudio
├── analyser.ts            # Análise de frequência de áudio
├── visual-3d.ts           # Visualizações 3D (legado)
├── backdrop-shader.ts     # Shader de fundo
├── sphere-shader.ts       # Shader da esfera
├── index.html             # Página principal
├── package.json           # Dependências e scripts
├── vite.config.ts         # Configuração do Vite
├── tsconfig.json          # Configuração TypeScript
├── .eslintrc.json         # Configuração ESLint
└── public/
    └── piz_compressed.exr # Textura HDR para iluminação
```

### Componentes Principais

#### 1. **LiveAudioApp** (`live-audio-app.tsx`)
- **Componente principal** que integra todas as funcionalidades
- Gerencia conexões de áudio, sessões IA e renderização 3D
- Interface unificada com controles intuitivos
- Estados centralizados para gravação e visualização

#### 2. **Sistema de Estilos** (`styles.ts`)
- Estilos CSS consolidados e responsivos
- Animações e transições suaves
- Suporte a modo escuro e acessibilidade
- Design mobile-first

#### 3. **Utilitários de Áudio** (`utils.ts`)
- Conversão PCM para diferentes formatos
- Codificação/decodificação de áudio
- Processamento de buffers de áudio

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** >= 18.0.0
- **Chave API do Gemini** ([obter aqui](https://makersuite.google.com/app/apikey))

### Passos de Instalação

1. **Clone o repositório**:
   ```bash
   git clone <repository-url>
   cd live-audio
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure a chave API**:
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   GEMINI_API_KEY=sua_chave_api_aqui
   ```

4. **Execute o projeto**:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🎮 Como Usar

### Controles da Interface

- 🔴 **Botão Vermelho**: Iniciar gravação de áudio
- ⬛ **Botão Preto**: Parar gravação
- 🔄 **Botão Azul**: Reiniciar sessão IA

### Fluxo de Uso

1. **Permissões**: Conceda acesso ao microfone quando solicitado
2. **Gravação**: Clique no botão vermelho para iniciar a conversa
3. **Conversação**: Fale naturalmente - a IA responderá em tempo real
4. **Visualização**: Observe os efeitos 3D reagindo ao áudio
5. **Controle**: Use os botões para controlar a sessão

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento

# Build
npm run build        # Build de produção
npm run preview      # Preview do build

# Qualidade de Código
npm run lint         # Verificar código com ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

```env
# Obrigatório
GEMINI_API_KEY=sua_chave_api

# Opcional
NODE_ENV=development
```

### Personalização de Voz

No arquivo `live-audio-app.tsx`, você pode modificar:

```typescript
speechConfig: {
  voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Orus'}},
  languageCode: 'pt-BR'  // Altere para seu idioma
}
```

### Configuração de Áudio

```typescript
// Taxa de amostragem de entrada (microfone)
inputAudioContext = new AudioContext({sampleRate: 16000});

// Taxa de amostragem de saída (alto-falantes)
outputAudioContext = new AudioContext({sampleRate: 24000});
```

## 🎨 Personalização Visual

### Modificando Estilos

Edite o arquivo `styles.ts` para personalizar:

- Cores e gradientes
- Animações e transições
- Layout responsivo
- Efeitos visuais

### Shaders Personalizados

Modifique os arquivos de shader para criar efeitos únicos:

- `backdrop-shader.ts`: Fundo da cena
- `sphere-shader.ts`: Efeitos da esfera principal

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de API Key**:
   - Verifique se `GEMINI_API_KEY` está definida no `.env.local`
   - Confirme se a chave é válida e tem permissões adequadas

2. **Problemas de Microfone**:
   - Verifique permissões do navegador
   - Teste com diferentes navegadores
   - Confirme se o microfone está funcionando

3. **Performance Lenta**:
   - Reduza a qualidade dos efeitos 3D
   - Feche outras abas do navegador
   - Verifique recursos do sistema

### Logs de Debug

Ative logs detalhados no console do navegador para diagnosticar problemas.

## 📱 Compatibilidade

### Navegadores Suportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Recursos Necessários

- WebGL 2.0
- Web Audio API
- MediaDevices API
- ES2020 Support

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença Apache 2.0 - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Documentação Gemini API](https://ai.google.dev/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [Lit Framework](https://lit.dev/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Desenvolvido com ❤️ pela equipe HE-next**
