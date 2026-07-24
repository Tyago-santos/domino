# 🏆 Dashboard para Jogadores de Dominó — Especificação Completa do Projeto

## Objetivo

Desenvolver uma dashboard moderna, responsiva, escalável e intuitiva para jogadores de dominó, permitindo acompanhar estatísticas, desempenho, ranking, torneios, conquistas e evolução ao longo do tempo.

O projeto deve oferecer uma experiência semelhante a plataformas esportivas como **Chess.com**, **Strava** e **EA Sports FC**, utilizando gráficos modernos, indicadores de desempenho, gamificação e excelente experiência do usuário.

A aplicação deve ser desenvolvida pensando em escalabilidade, reutilização de componentes, organização de código e boas práticas de desenvolvimento.

---

# Stack Tecnológica

## Frontend

Utilizar obrigatoriamente:

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- TanStack Query
- React Hook Form
- Zod
- Axios
- Recharts
- Lucide React
- Framer Motion
- Sonner
- clsx
- tailwind-merge

---

# Arquitetura do Projeto

O projeto deve utilizar uma arquitetura **Feature-Based (Feature First)**.

Cada funcionalidade deve possuir sua própria organização, evitando separar apenas por tipo de arquivo.

## Estrutura

```text
src/
│
├── app/
│   ├── providers/
│   ├── router/
│   ├── layouts/
│   └── App.tsx
│
├── components/
│   └── ui/
│
├── features/
│   ├── dashboard/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── ranking/
│   ├── players/
│   ├── tournaments/
│   ├── history/
│   ├── statistics/
│   ├── profile/
│   ├── friends/
│   ├── achievements/
│   └── settings/
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   ├── schemas/
│   ├── types/
│   └── utils/
│
├── assets/
├── styles/
├── main.tsx
└── vite-env.d.ts
```

---

## Organização das Features

Cada feature deve possuir seus próprios:

- API
- Components
- Hooks
- Pages
- Schemas (Zod)
- Services
- Types
- Utils
- Constants

Os componentes compartilhados devem ficar apenas em:

```
shared/components
```

ou

```
components/ui
```

Toda comunicação com APIs deve permanecer dentro da própria feature.

Não utilizar arquitetura baseada apenas em:

- pages
- hooks
- services
- components

exceto para recursos realmente compartilhados.

---

# Boas Práticas

O projeto deve seguir:

- Clean Code
- SOLID
- DRY
- KISS
- Feature First
- Componentização
- Reutilização
- Código desacoplado
- Lazy Loading
- Code Splitting
- Performance otimizada
- Tipagem forte
- Componentes reutilizáveis
- Hooks customizados
- Separação de responsabilidades

---

# Dashboard Inicial

A Home deverá apresentar uma visão geral do jogador.

## Cards

Mostrar:

- Total de partidas
- Vitórias
- Derrotas
- Taxa de vitória
- Ranking atual
- Pontuação
- Sequência atual
- Melhor sequência
- Tempo médio por partida

---

## Gráficos

Exibir:

- Evolução do ranking
- Evolução da pontuação
- Vitórias por período
- Partidas realizadas

Filtros:

- Hoje
- 7 dias
- 30 dias
- 90 dias
- Ano
- Personalizado

---

## Últimas Partidas

Tabela contendo:

- Data
- Hora
- Adversário
- Parceiro
- Resultado
- Pontuação
- Duração
- Campeonato

Possuir:

- Pesquisa
- Ordenação
- Paginação
- Exportação

---

# Ranking

Página dedicada ao ranking.

Mostrar:

- Posição
- Avatar
- Nome
- Cidade
- Clube
- Pontuação
- Aproveitamento
- Vitórias
- Derrotas
- Tendência

Destacar o usuário logado.

---

# Perfil

Mostrar:

- Foto
- Nome
- Apelido
- Cidade
- Estado
- Clube
- Categoria
- Data de cadastro
- Ranking
- Biografia

Também apresentar:

- Estatísticas
- Histórico
- Conquistas

---

# Estatísticas

Criar gráficos para:

- Ranking
- Vitórias por mês
- Partidas por semana
- Aproveitamento
- Média de pontos
- Pontos sofridos
- Tempo médio
- Frequência semanal
- Horários mais ativos

Todos os gráficos devem ser interativos.

---

# Histórico

Permitir:

- Pesquisa
- Paginação
- Ordenação
- Exportação

Filtros:

- Data
- Campeonato
- Resultado
- Parceiro
- Adversário

---

# Torneios

Listar:

- Nome
- Data
- Horário
- Local
- Organizador
- Status
- Participantes
- Premiação

Também mostrar:

- Chaves
- Classificação
- Regulamento
- Resultados

---

# Amigos

Criar área social contendo:

- Lista de amigos
- Solicitações
- Pesquisa
- Comparação
- Convites para partidas

---

# Comparação entre Jogadores

Permitir comparar:

- Ranking
- Vitórias
- Derrotas
- Aproveitamento
- Pontuação média
- Histórico
- Conquistas
- Evolução

Utilizar gráficos comparativos.

---

# Conquistas

Criar sistema de badges.

Exemplos:

- Primeira vitória
- 10 partidas
- 100 partidas
- 500 partidas
- 1000 partidas
- 10 vitórias consecutivas
- Campeão
- Top 10
- Jogador do mês

Cada badge deve conter:

- Ícone
- Nome
- Descrição
- Data
- Barra de progresso

---

# Calendário

Exibir:

- Torneios
- Eventos
- Partidas
- Competições
- Lembretes

Visualização:

- Mensal
- Semanal

---

# Notificações

Exemplos:

- Novo torneio
- Convite
- Mudança no ranking
- Nova conquista
- Solicitação de amizade
- Resultado da partida

---

# Estatísticas Avançadas

Calcular automaticamente:

- Média de pontos
- Média de pontos sofridos
- Melhor parceiro
- Adversário mais enfrentado
- Adversário mais difícil
- Jogador contra quem mais venceu
- Aproveitamento por dupla
- Aproveitamento em torneios
- Aproveitamento anual
- Tempo médio entre partidas

---

# Inteligência Artificial (Opcional)

Criar um módulo capaz de:

- Analisar desempenho
- Detectar evolução
- Detectar pontos fracos
- Detectar pontos fortes
- Gerar recomendações
- Estimar chance de vitória
- Gerar resumos automáticos
- Criar relatórios inteligentes

---

# Componentes da Interface

Utilizar:

- KPI Cards
- Charts
- Data Tables
- Timeline
- Progress Bars
- Badges
- Tooltips
- Skeleton Loading
- Toasts
- Empty States
- Loading States
- Error States
- Avatares
- Dialogs
- Dropdowns
- Modals
- Pesquisa Global
- Paginação
- Filtros Avançados

---

# UI / UX

A interface deve transmitir:

- Competição
- Evolução
- Organização
- Rapidez
- Modernidade
- Gamificação

---

# Design

Inspirar-se em:

- Chess.com
- Strava
- EA Sports FC
- GitHub Dashboard
- Google Analytics

Características:

- Bordas arredondadas
- Sombras suaves
- Tipografia moderna
- Alto contraste
- Espaçamento consistente
- Ícones minimalistas
- Micro animações
- Transições suaves
- Excelente experiência do usuário

---

# Responsividade

Suportar completamente:

- Desktop
- Tablet
- Mobile

Todos os componentes devem adaptar-se automaticamente ao tamanho da tela.

---

# Performance

Priorizar:

- Code Splitting
- Memoização
- TanStack Query Cache
- Otimização de renderizações
- Componentes reutilizáveis

---

# Acessibilidade

Implementar:

- WCAG
- Navegação por teclado
- Labels corretas
- Alto contraste
- Estados de foco
- Suporte a leitores de tela

---

# Tema

Implementar:

- Dark Theme
- Light Theme

Com troca dinâmica de tema.

---

# Objetivo Final

Construir uma dashboard profissional, moderna, escalável e altamente performática para jogadores de dominó, utilizando React 19, TypeScript, Vite e Tailwind CSS v4, organizada em arquitetura **Feature-Based**, com foco em reutilização de componentes, organização de código, excelente experiência do usuário, responsividade, acessibilidade e facilidade de manutenção.

O código deve seguir padrões profissionais de desenvolvimento, ser limpo, modular, tipado, desacoplado e preparado para crescimento futuro.
