# Integração de Clima com Open Meteo API

## Visão Geral

Esta integração adiciona funcionalidade de consulta de clima ao sistema de chat, permitindo que os usuários obtenham informações meteorológicas detalhadas através de uma única frase: **"Clima em {cidade}"**.

## Funcionalidades

### 1. Detecção Automática de Intenção
O sistema detecta automaticamente quando o usuário solicita informações de clima através de frases como:
- "Clima em São Paulo"
- "tempo em Rio de Janeiro"
- "previsão do tempo em Brasília"
- "como está o clima em Salvador"
- "temperatura em Fortaleza"
- "clima de Belo Horizonte"
- "tempo de Recife"
- "previsão em Manaus"
- "como está o tempo em Curitiba"
- "temperatura de Porto Alegre"

### 2. Modal de Informações do Clima
Quando detectada a intenção de clima, um modal elegante é exibido com:
- **Temperatura atual** com código de cores
- **Condição meteorológica** com ícones apropriados
- **Umidade relativa**
- **Velocidade e direção do vento**
- **Pressão atmosférica**
- **Visibilidade**
- **Índice UV** com classificação de risco
- **Descrição detalhada** das condições
- **Timestamp** da última atualização

### 3. Integração com API Open Meteo
- **Geocoding**: Converte nomes de cidades em coordenadas
- **Dados meteorológicos**: Busca informações em tempo real
- **Tratamento de erros**: Mensagens amigáveis para cidades não encontradas
- **Validação**: Verifica se a cidade existe antes de buscar dados

## Arquivos Implementados

### 1. `lib/weather-service.ts`
Serviço principal para integração com a API Open Meteo:
- `WeatherService.getWeatherByCity(cityName)` - Busca dados do clima
- `WeatherService.validateCity(cityName)` - Valida se cidade existe
- Conversão de códigos meteorológicos para texto legível
- Mapeamento de condições para ícones apropriados

### 2. `components/chat/WeatherModal.tsx`
Modal responsivo e visualmente atrativo:
- Design moderno com gradientes
- Informações organizadas em cards
- Estados de loading e erro
- Botão de retry em caso de falha
- Responsivo para mobile

### 3. `lib/intent-detection.ts` (atualizado)
Sistema de detecção de intenções expandido:
- Novo tipo `weather` adicionado
- Padrões regex para detecção de frases de clima
- Extração automática do nome da cidade
- Alta confiança (0.95) para detecção de clima

### 4. `components/chat/SmartSuggestions.tsx` (atualizado)
Sugestões inteligentes expandidas:
- Nova sugestão para clima com ícone de nuvem
- Callback `onWeatherClick` para abrir modal
- Cores e estilos consistentes com o design system

### 5. `components/chat/ChatInterfaceRefactored.tsx` (atualizado)
Interface principal do chat atualizada:
- Estado do modal de clima adicionado
- Handlers para abrir/fechar modal de clima
- Integração com sistema de sugestões

## Como Usar

### Para Usuários
1. Digite qualquer uma das frases suportadas no chat
2. O sistema detectará automaticamente a intenção de clima
3. Uma sugestão aparecerá abaixo da mensagem
4. Clique na sugestão para abrir o modal com informações do clima
5. O modal mostrará dados detalhados e atualizados

### Para Desenvolvedores
```typescript
// Exemplo de uso programático
import { WeatherService } from '@/lib/weather-service';

const weatherData = await WeatherService.getWeatherByCity('São Paulo');
console.log(weatherData.temperature); // Temperatura em °C
console.log(weatherData.condition); // Condição meteorológica
console.log(weatherData.humidity); // Umidade em %
```

## Características Técnicas

### API Open Meteo
- **Gratuita** e sem necessidade de chave de API
- **Rate limiting** generoso
- **Dados em tempo real** atualizados a cada hora
- **Cobertura global** com alta precisão

### Tratamento de Erros
- Cidades não encontradas: Mensagem amigável
- Falhas de rede: Botão de retry
- Timeout: Fallback para dados em cache (se implementado)

### Performance
- **Lazy loading** do serviço de clima
- **Debounce** na detecção de intenções
- **Caching** de coordenadas de cidades (futuro)

## Exemplos de Uso

### Frases que Funcionam
✅ "Clima em São Paulo"
✅ "tempo em Rio de Janeiro"
✅ "previsão do tempo em Brasília"
✅ "como está o clima em Salvador"
✅ "temperatura em Fortaleza"
✅ "clima de Belo Horizonte"
✅ "tempo de Recife"
✅ "previsão em Manaus"
✅ "como está o tempo em Curitiba"
✅ "temperatura de Porto Alegre"

### Frases que Não Funcionam
❌ "Qual o clima?" (sem cidade)
❌ "Previsão do tempo" (sem cidade)
❌ "Temperatura" (sem cidade)

## Próximos Passos

### Melhorias Futuras
1. **Cache de dados** para reduzir chamadas à API
2. **Previsão de 7 dias** expandindo o modal
3. **Mapas interativos** com condições por região
4. **Alertas meteorológicos** para condições extremas
5. **Histórico de consultas** de clima
6. **Favoritos** de cidades
7. **Notificações push** para mudanças de clima

### Integrações Adicionais
1. **Widget de clima** para dashboard
2. **API de alertas** meteorológicos
3. **Integração com calendário** para eventos ao ar livre
4. **Sugestões de roupas** baseadas no clima

## Testes

Execute o teste simples para verificar a detecção de intenções:
```bash
node test-weather-simple.js
```

## Conclusão

A integração de clima está completa e funcional, oferecendo uma experiência rica e intuitiva para os usuários consultarem informações meteorológicas diretamente no chat. O sistema é robusto, com tratamento adequado de erros e um design moderno que se integra perfeitamente ao sistema existente.
