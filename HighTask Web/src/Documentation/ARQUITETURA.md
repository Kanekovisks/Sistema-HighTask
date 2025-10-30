# 🏗️ Arquitetura do Sistema HighTask

Documentação visual da arquitetura e fluxo de dados do sistema.

---

## 🎯 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        HIGHTASK SYSTEM                           │
│                 Sistema de Gerenciamento de Chamados             │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │   WEB    │  │ DESKTOP  │  │  MOBILE  │
            │ (Atual)  │  │ (Futuro) │  │ (Futuro) │
            └──────────┘  └──────────┘  └──────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      SUPABASE BACKEND      │
                    │  (Auth + DB + Functions)   │
                    └────────────────────────────┘
```

---

## 🔄 Arquitetura em Camadas

```
┌───────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                         │
│                         (Frontend)                             │
├───────────────────────────────────────────────────────────────┤
│  React Components                                              │
│  ├─ App.tsx                    → Gerenciador principal        │
│  ├─ AuthPage.tsx               → Login/Signup                 │
│  ├─ Dashboard.tsx              → Estatísticas                 │
│  ├─ TicketList.tsx             → Lista de chamados            │
│  ├─ NewTicket.tsx              → Criar chamado + IA           │
│  ├─ TicketDetail.tsx           → Detalhes + Timeline          │
│  ├─ UserManagement.tsx         → Gerenciar usuários (Admin)   │
│  └─ Sidebar.tsx                → Navegação                    │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │ (Authorization: Bearer token)
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                         │
│                    (API Client + Logic)                        │
├───────────────────────────────────────────────────────────────┤
│  /utils/api.ts                                                 │
│  ├─ signup()                   → Cadastro público             │
│  ├─ getTickets()               → Lista chamados (filtrados)   │
│  ├─ createTicket()             → Novo chamado                 │
│  ├─ updateTicket()             → Atualizar chamado            │
│  ├─ addComment()               → Adicionar comentário         │
│  ├─ getAISuggestions()         → Sugestões de IA              │
│  ├─ getStats()                 → Estatísticas                 │
│  ├─ getUsers()                 → Listar usuários (Admin)      │
│  ├─ createUser()               → Criar usuário (Admin)        │
│  ├─ deleteUser()               → Remover usuário (Admin)      │
│  └─ getTechnicians()           → Lista técnicos               │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │ (Supabase Edge Functions)
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                       BUSINESS LAYER                           │
│                  (Edge Functions - Deno)                       │
├───────────────────────────────────────────────────────────────┤
│  /supabase/functions/server/index.tsx (Hono Framework)        │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Middleware                                              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  • CORS                     → Permitir requisições      │ │
│  │  • Logger                   → Log de todas requisições  │ │
│  │  • Auth Verification        → Validar JWT tokens        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Permission Helpers                                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  • getUserWithRole()        → Extrai role do token      │ │
│  │  • isAdmin()                → Verifica se é admin       │ │
│  │  • isTechnicianOrAdmin()    → Verifica permissões      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Routes                                                  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  POST   /signup             → Cadastro público          │ │
│  │  POST   /admin/users        → Criar usuário (Admin)     │ │
│  │  GET    /users              → Listar usuários (Admin)   │ │
│  │  DELETE /users/:id          → Remover usuário (Admin)   │ │
│  │  GET    /tickets            → Lista (filtrado por role) │ │
│  │  GET    /tickets/:id        → Detalhes do chamado       │ │
│  │  POST   /tickets            → Criar chamado             │ │
│  │  PUT    /tickets/:id        → Atualizar chamado         │ │
│  │  POST   /tickets/:id/comm   → Adicionar comentário      │ │
│  │  GET    /technicians        → Lista técnicos            │ │
│  │  POST   /ai-suggest         → Sugestões de IA           │ │
│  │  GET    /stats              → Estatísticas              │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase SDK
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
│                      (Supabase Backend)                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Supabase Auth                                           │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  • auth.users                → Tabela de usuários       │ │
│  │  • user_metadata             → { name, role }           │ │
│  │  • JWT tokens                → Access & Refresh tokens  │ │
│  │  • Session management        → Auto-renovação          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL Database                                     │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  • kv_store_194bf14c         → Tabela Key-Value        │ │
│  │    ├─ key: "ticket:{uuid}"   → Dados do chamado        │ │
│  │    └─ value: JSON            → Objeto completo         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação

```
┌─────────────┐
│   USUÁRIO   │
└──────┬──────┘
       │ 1. Login (email + senha)
       ▼
┌─────────────────────┐
│   AuthPage.tsx      │  (Frontend)
│  createClient()     │
└──────┬──────────────┘
       │ 2. signInWithPassword()
       ▼
┌─────────────────────┐
│  Supabase Auth      │
│  Valida credenciais │
└──────┬──────────────┘
       │ 3. Retorna session { user, access_token }
       ▼
┌─────────────────────┐
│   App.tsx           │
│  setUser(user)      │
│  localStorage       │
└──────┬──────────────┘
       │ 4. Requisição com token
       │    Authorization: Bearer {access_token}
       ▼
┌─────────────────────┐
│  Edge Function      │
│  getUser(token)     │
│  Extrai role        │
└──────┬──────────────┘
       │ 5. Retorna dados (filtrados por role)
       ▼
┌─────────────────────┐
│   Frontend          │
│  Exibe dados        │
└─────────────────────┘
```

---

## 🎫 Fluxo de Criação de Chamado

```
┌─────────────┐
│   USUÁRIO   │ "Impressora não funciona"
└──────┬──────┘
       │ 1. Preenche formulário
       ▼
┌─────────────────────┐
│  NewTicket.tsx      │
│  Digite descrição   │
└──────┬──────────────┘
       │ 2. Clica "Obter Sugestões IA"
       ▼
┌─────────────────────┐
│  POST /ai-suggest   │
│  { description }    │
└──────┬──────────────┘
       │ 3. Analisa keywords
       ▼
┌─────────────────────┐
│  IA Engine          │
│  - Detecta categoria│
│  - Define prioridade│
│  - Sugere soluções  │
└──────┬──────────────┘
       │ 4. Retorna sugestões
       │    { category, priority, solutions[] }
       ▼
┌─────────────────────┐
│  NewTicket.tsx      │
│  Preenche campos    │
│  automaticamente    │
└──────┬──────────────┘
       │ 5. Usuário confirma
       │    Clica "Criar Chamado"
       ▼
┌─────────────────────┐
│  POST /tickets      │
│  { title, desc,     │
│    category, prio } │
└──────┬──────────────┘
       │ 6. Valida token
       │    Extrai user.id
       ▼
┌─────────────────────┐
│  KV Store           │
│  SET ticket:{uuid}  │
│  {                  │
│    id, title,       │
│    createdBy,       │
│    status: "open",  │
│    timeline: [...]  │
│  }                  │
└──────┬──────────────┘
       │ 7. Retorna chamado criado
       ▼
┌─────────────────────┐
│  Frontend           │
│  Redireciona para   │
│  lista de chamados  │
└─────────────────────┘
```

---

## 👥 Fluxo de Controle de Acesso

```
                    ┌────────────────┐
                    │   REQUISIÇÃO   │
                    │  GET /tickets  │
                    └───────┬────────┘
                            │
                ┌───────────▼───────────┐
                │  Verifica Token JWT   │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  Extrai user.role     │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  role: user  │    │role: tech    │    │ role: admin  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Filter:      │    │ Filter:      │    │ Filter:      │
│ createdBy =  │    │ assignedTo = │    │ (NENHUM)     │
│ user.id      │    │ user.id      │    │ VÊ TUDO      │
│              │    │ OR           │    │              │
│              │    │ createdBy =  │    │              │
│              │    │ user.id      │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                ┌──────────▼──────────┐
                │  Retorna Chamados   │
                │  (Filtrados)        │
                └─────────────────────┘
```

---

## 📊 Modelo de Dados

### Ticket (Chamado)

```typescript
{
  id: "uuid-v4",
  title: "Impressora não funciona",
  description: "A impressora HP não imprime nada...",
  category: "Hardware",
  priority: "medium",
  status: "open",
  
  // Criador
  createdBy: "user-uuid",
  createdByEmail: "maria@empresa.com",
  createdByName: "Maria Santos",
  
  // Atribuição
  assignedTo: "tech-uuid" | null,
  assignedToName: "João Silva" | null,
  
  // Timestamps
  createdAt: "2025-10-09T10:30:00Z",
  updatedAt: "2025-10-09T14:45:00Z",
  
  // Histórico
  timeline: [
    {
      id: "timeline-uuid-1",
      action: "created",
      description: "Chamado criado",
      userId: "user-uuid",
      userName: "Maria Santos",
      timestamp: "2025-10-09T10:30:00Z"
    },
    {
      id: "timeline-uuid-2",
      action: "updated",
      description: "Atribuído para João Silva",
      userId: "admin-uuid",
      userName: "Administrador",
      timestamp: "2025-10-09T11:00:00Z"
    },
    {
      id: "timeline-uuid-3",
      action: "comment",
      description: "Verificando cabo de alimentação",
      userId: "tech-uuid",
      userName: "João Silva",
      timestamp: "2025-10-09T14:00:00Z"
    },
    {
      id: "timeline-uuid-4",
      action: "updated",
      description: "Status alterado de 'open' para 'resolved'",
      userId: "tech-uuid",
      userName: "João Silva",
      timestamp: "2025-10-09T14:45:00Z"
    }
  ]
}
```

### User (Usuário)

```typescript
// Supabase Auth
{
  id: "uuid-v4",
  email: "joao@empresa.com",
  encrypted_password: "***",
  email_confirmed_at: "2025-10-09T09:00:00Z",
  created_at: "2025-10-09T09:00:00Z",
  last_sign_in_at: "2025-10-09T15:30:00Z",
  
  // Metadados customizados
  user_metadata: {
    name: "João Silva",
    role: "technician"  // "user" | "technician" | "admin"
  }
}
```

---

## 🔄 Ciclo de Vida de um Chamado

```
┌─────────┐
│  OPEN   │  Criado pelo usuário
└────┬────┘
     │ Admin atribui ao técnico
     ▼
┌──────────────┐
│ IN-PROGRESS  │  Técnico trabalhando
└──────┬───────┘
       │ Técnico resolve o problema
       ▼
┌─────────────┐
│  RESOLVED   │  Problema solucionado
└──────┬──────┘
       │ Admin ou Técnico fecha
       ▼
┌─────────┐
│ CLOSED  │  Finalizado
└─────────┘
```

---

## 🛡️ Camadas de Segurança

```
┌────────────────────────────────────────────────────────┐
│                    LAYER 1: UI                         │
│  Frontend esconde opções não permitidas                │
│  - Usuário não vê botão "Alterar Status"              │
│  - Técnico não vê menu "Usuários"                     │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│                  LAYER 2: API CLIENT                   │
│  Token JWT enviado em todas as requisições             │
│  Authorization: Bearer {access_token}                  │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              LAYER 3: EDGE FUNCTIONS                   │
│  Validação de token                                    │
│  Extração de role                                      │
│  Verificação de permissões                             │
│  - isAdmin()                                           │
│  - isTechnicianOrAdmin()                               │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│                 LAYER 4: DATABASE                      │
│  Filtros baseados em role                              │
│  Apenas dados permitidos retornados                    │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Deploy e Hosting

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Web)                       │
│  Figma Make / Vercel / Netlify                         │
│  - React Build                                         │
│  - Static Assets                                       │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 SUPABASE (Backend)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Edge Functions (Deno Deploy)                     │ │
│  │ - Serverless                                     │ │
│  │ - Auto-scaling                                   │ │
│  │ - Global CDN                                     │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ PostgreSQL Database                              │ │
│  │ - KV Store                                       │ │
│  │ - Backups automáticos                            │ │
│  │ - Replicação                                     │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Auth (GoTrue)                                    │ │
│  │ - JWT tokens                                     │ │
│  │ - Session management                             │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Multi-plataforma

```
                    ┌─────────────────┐
                    │  SUPABASE DB    │
                    │  (PostgreSQL)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     WEB      │     │   DESKTOP    │     │    MOBILE    │
│              │     │              │     │              │
│  React +     │     │  Electron +  │     │ React Native │
│  Tailwind    │     │  React       │     │              │
└──────────────┘     └──────────────┘     └──────────────┘

       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                   Mesma API REST
                   Mesmo Auth
                   Mesmos Dados
```

---

## 🔧 Estrutura de Arquivos

```
/
├── 📄 App.tsx                      → Componente raiz
├── 📄 README.md                    → Documentação principal
├── 📄 GUIA_RAPIDO.md               → Tutorial rápido
├── 📄 SISTEMA_PERMISSOES.md        → Documentação de roles
├── 📄 TECNOLOGIAS.md               → Stack técnico
├── 📄 ARQUITETURA.md               → Este arquivo
│
├── 📁 components/
│   ├── AuthPage.tsx                → Login/Signup
│   ├── Dashboard.tsx               → Dashboard principal
│   ├── TicketList.tsx              → Lista de chamados
│   ├── NewTicket.tsx               → Criar + IA
│   ├── TicketDetail.tsx            → Detalhes + Timeline
│   ├── UserManagement.tsx          → Gerenciar usuários
│   ├── Sidebar.tsx                 → Menu lateral
│   └── ui/                         → shadcn components
│
├── 📁 utils/
│   ├── api.ts                      → Cliente HTTP
│   └── supabase/
│       ├── client.ts               → Supabase client
│       └── info.tsx                → Credenciais
│
├── 📁 supabase/functions/server/
│   ├── index.tsx                   → API REST (Hono)
│   └── kv_store.tsx                → Database utils
│
└── 📁 styles/
    └── globals.css                 → Tailwind v4 config
```

---

## 📊 Performance e Escalabilidade

### Métricas Esperadas

```
┌────────────────────────────────────────────────┐
│ Concurrent Users        │  100-500            │
│ Requests per Second     │  50-200             │
│ Average Response Time   │  < 500ms            │
│ Database Queries        │  < 100ms            │
│ Edge Function Cold Start│  < 200ms            │
│ Edge Function Warm      │  < 50ms             │
└────────────────────────────────────────────────┘
```

### Otimizações Implementadas

- ✅ **React memoization** - useCallback, useMemo
- ✅ **Lazy loading** - Componentes sob demanda
- ✅ **Filtros no backend** - Menos dados trafegados
- ✅ **Singleton Supabase client** - Reutilização de conexões
- ✅ **KV Store** - Acesso rápido key-value
- ✅ **Edge Functions** - Próximo do usuário (CDN)

---

## 🔮 Roadmap Arquitetural

### Fase 1: Web ✅ (Atual)
- React + Supabase
- Sistema de permissões
- IA básica (keywords)

### Fase 2: Desktop 🔄 (Próximo)
- Electron framework
- Sincronização offline
- Notificações nativas

### Fase 3: Mobile 🔄 (Planejado)
- React Native
- Push notifications
- Camera para anexos

### Fase 4: Melhorias 🔄 (Futuro)
- IA com LLM (OpenAI/Google)
- WebSockets para real-time
- Microservices architecture

---

**Última atualização**: 9 de outubro de 2025  
**Arquitetura**: Three-tier (Presentation → Business → Data)  
**Padrões**: REST API, JWT Auth, Role-based Access Control
