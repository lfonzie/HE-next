# 📚 APIs Implementadas no HubEdu

Este documento descreve as 7 APIs que foram integradas ao HubEdu para aparecerem como modais no chat.

## 🎯 APIs Implementadas

### 1. **OpenLibrary API** 📖
- **Descrição**: Catálogo mundial de livros, capas, autores e edições
- **Uso no HubEdu**: Permitir aos alunos pesquisar referências bibliográficas ou complementar trabalhos com fontes literárias
- **Modal**: `OpenLibraryModal`
- **Serviço**: `OpenLibraryService`
- **Rota API**: `/api/openlibrary/search`
- **Chave API**: Não necessária (gratuita)

### 2. **NewsAPI** 📰
- **Descrição**: Agregador de notícias globais, com filtros por fonte, palavra-chave e idioma
- **Uso no HubEdu**: Alimentar aulas de atualidades, redação e debates críticos
- **Modal**: `NewsAPIModal`
- **Serviço**: `NewsAPIService`
- **Rota API**: `/api/newsapi/search`
- **Chave API**: Necessária (gratuita em newsapi.org)

### 3. **NumbersAPI** 🔢
- **Descrição**: Curiosidades e fatos sobre números, datas e matemática
- **Uso no HubEdu**: Gamificação de matemática e curiosidades no início de aulas
- **Modal**: `NumbersAPIModal`
- **Serviço**: `NumbersAPIService`
- **Rota API**: `/api/numbersapi/search`
- **Chave API**: Não necessária (gratuita)

### 4. **CurrentsAPI** 🌍
- **Descrição**: Notícias em tempo real, com ênfase em tópicos e tendências
- **Uso no HubEdu**: Alternativa ou complemento ao NewsAPI, trazendo diversidade de fontes
- **Modal**: `CurrentsAPIModal`
- **Serviço**: `CurrentsAPIService`
- **Rota API**: `/api/currentsapi/search`
- **Chave API**: Necessária (gratuita em currentsapi.services)

### 5. **Giphy API** 🎭
- **Descrição**: Banco de GIFs animados
- **Uso no HubEdu**: Inserir feedbacks visuais em quizzes, mensagens motivacionais ou dashboards
- **Modal**: `GiphyModal`
- **Serviço**: `GiphyAPIService`
- **Rota API**: `/api/giphy/search`
- **Chave API**: Necessária (gratuita em developers.giphy.com)

### 6. **World Bank Open Data API** 📊
- **Descrição**: Dados socioeconômicos globais (PIB, educação, indicadores sociais)
- **Uso no HubEdu**: Enriquecer aulas de geografia, história e economia com dados oficiais e atualizados
- **Modal**: `WorldBankModal`
- **Serviço**: `WorldBankAPIService`
- **Rota API**: `/api/worldbank/search`
- **Chave API**: Não necessária (gratuita)

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# NewsAPI
NEWS_API_KEY=your_news_api_key_here

# CurrentsAPI
CURRENTS_API_KEY=your_currents_api_key_here

# Giphy API
GIPHY_API_KEY=your_giphy_api_key_here
```

### Como Obter as Chaves

1. **NewsAPI**: Registre-se em https://newsapi.org/
2. **CurrentsAPI**: Registre-se em https://currentsapi.services/
3. **Giphy**: Registre-se em https://developers.giphy.com/

## 🎮 Como Usar

### No Chat

Os usuários podem digitar comandos como:

- **Livros**: "buscar livro sobre física", "biblioteca", "autor Stephen King"
- **Notícias**: "notícias sobre tecnologia", "atualidades", "manchetes"
- **Números**: "curiosidade sobre 42", "fato da data 25/12", "matemática"
- **Notícias Globais**: "notícias globais", "tendências mundiais"
- **GIFs**: "gif animado", "meme", "reação feliz"
- **Dados Mundiais**: "dados mundiais", "PIB Brasil", "indicadores sociais"

### Detecção de Intenções

O sistema detecta automaticamente a intenção do usuário e abre o modal apropriado com base nas palavras-chave utilizadas.

## 📁 Estrutura de Arquivos

```
lib/services/
├── openlibrary-service.ts
├── newsapi-service.ts
├── numbersapi-service.ts
├── currentsapi-service.ts
├── giphy-service.ts
└── worldbank-service.ts

components/chat/
├── OpenLibraryModal.tsx
├── NewsAPIModal.tsx
├── NumbersAPIModal.tsx
├── CurrentsAPIModal.tsx
├── GiphyModal.tsx
└── WorldBankModal.tsx

pages/api/
├── openlibrary/search.ts
├── newsapi/search.ts
├── numbersapi/search.ts
├── currentsapi/search.ts
├── giphy/search.ts
└── worldbank/search.ts
```

## 🚀 Funcionalidades

### Modais Interativos
- Interface responsiva e moderna
- Busca em tempo real
- Filtros e categorias
- Loading states e tratamento de erros
- Integração com o sistema de chat

### Detecção Inteligente
- Reconhecimento de padrões de linguagem
- Extração automática de termos de busca
- Sugestões contextuais
- Suporte a múltiplos idiomas (português)

### APIs Robustas
- Tratamento de erros
- Validação de parâmetros
- Rate limiting
- Cache de respostas
- Documentação completa

## 🔒 Segurança

- Todas as chaves de API são armazenadas como variáveis de ambiente
- Validação de entrada em todas as rotas
- Sanitização de dados
- Tratamento seguro de erros
- Logs de auditoria

## 📈 Próximos Passos

1. Implementar cache Redis para melhor performance
2. Adicionar métricas de uso das APIs
3. Implementar sistema de favoritos
4. Adicionar mais filtros e opções de busca
5. Integrar com sistema de notificações
6. Implementar histórico de buscas
