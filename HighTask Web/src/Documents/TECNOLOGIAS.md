# 📋 Tecnologias Utilizadas no HighTask

Este documento detalha todas as tecnologias utilizadas na aplicação **HighTask** e como elas estão integradas no Supabase.

---

## 🎨 Frontend (Web Application)

### 1. **React 18**
- **O que é**: Biblioteca JavaScript para construção de interfaces de usuário
- **Onde está**: `/App.tsx` e todos os componentes em `/components/`
- **Uso na aplicação**:
  - Gerenciamento de estado com `useState` e `useEffect`
  - Componentes reutilizáveis (Dashboard, TicketList, NewTicket, etc.)
  - Renderização condicional baseada em autenticação

### 2. **TypeScript**
- **O que é**: Superset do JavaScript com tipagem estática
- **Onde está**: Todos os arquivos `.tsx` e `.ts`
- **Uso na aplicação**:
  - Tipagem de interfaces (Ticket, TimelineEntry, Stats)
  - Type safety para props de componentes
  - Autocomplete e validação de código

### 3. **Tailwind CSS v4**
- **O que é**: Framework CSS utilitário para estilização
- **Onde está**: `/styles/globals.css` (configuração) e classes nos componentes
- **Uso na aplicação**:
  - Sistema de design responsivo
  - Classes utilitárias para layout e espaçamento
  - Temas claro/escuro configurados
  - Variáveis CSS customizadas para cores e bordas

### 4. **shadcn/ui**
- **O que é**: Coleção de componentes React acessíveis e customizáveis
- **Onde está**: `/components/ui/`
- **Componentes utilizados**:
  - `button.tsx` - Botões em toda a aplicação
  - `input.tsx` - Campos de formulário
  - `badge.tsx` - Tags de status e prioridade
  - `card.tsx` - Cards de tickets e estatísticas
  - `select.tsx` - Dropdowns de filtro
  - `textarea.tsx` - Descrição de chamados
  - `avatar.tsx` - Avatar de usuários
  - `label.tsx` - Labels de formulário
  - `alert.tsx` - Mensagens de erro/sucesso
  - `sonner.tsx` - Notificações toast

### 5. **Lucide React**
- **O que é**: Biblioteca de ícones para React
- **Onde está**: Importado nos componentes (Sidebar, Dashboard, etc.)
- **Ícones utilizados**:
  - `LayoutDashboard`, `Ticket`, `Plus`, `Users`, `LogOut`
  - `AlertCircle`, `Clock`, `CheckCircle`, `XCircle`
  - `Search`, `Filter`, `Send`, `Sparkles` (IA)

---

## 🔧 Backend (Supabase Integration)

### 6. **Supabase**
Plataforma completa de backend-as-a-service (BaaS) baseada em PostgreSQL.

#### 6.1 **Supabase Auth** (Autenticação)
- **Onde está integrado**:
  - **Frontend**: `/utils/supabase/client.ts` e `/components/AuthPage.tsx`
  - **Backend**: `/supabase/functions/server/index.tsx` (rota `/signup`)
  
- **Como funciona**:
  ```typescript
  // Frontend - Login
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'usuario@email.com',
    password: 'senha123'
  });
  
  // Backend - Cadastro (com auto-confirmação de email)
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'usuario@email.com',
    password: 'senha123',
    user_metadata: { name: 'Nome do Usuário', role: 'user' },
    email_confirm: true // Auto-confirma porque não há servidor de email configurado
  });
  ```

- **Funcionalidades implementadas**:
  - ✅ Cadastro de usuários com metadados (nome, role)
  - ✅ Login com email e senha
  - ✅ Logout
  - ✅ Persistência de sessão com tokens de acesso
  - ✅ Verificação de sessão ativa ao carregar a aplicação

#### 6.2 **Supabase Database** (Banco de Dados KV Store)
- **Onde está integrado**:
  - **Backend**: `/supabase/functions/server/kv_store.tsx` (utilitário)
  - **Backend**: `/supabase/functions/server/index.tsx` (uso em todas as rotas)

- **Estrutura de dados**:
  - Tabela pré-configurada: `kv_store_194bf14c` (key-value store)
  - **Keys utilizadas**:
    - `ticket:{uuid}` - Armazena dados completos do chamado
  
- **Como funciona**:
  ```typescript
  import * as kv from './kv_store.tsx';
  
  // Criar ticket
  await kv.set(`ticket:${ticketId}`, ticketData);
  
  // Buscar ticket específico
  const ticket = await kv.get(`ticket:${ticketId}`);
  
  // Buscar todos os tickets
  const tickets = await kv.getByPrefix('ticket:');
  ```

- **Dados armazenados em cada ticket**:
  ```typescript
  {
    id: string,
    title: string,
    description: string,
    category: 'Hardware' | 'Software' | 'Rede/Conexão' | 'Acesso/Segurança',
    priority: 'low' | 'medium' | 'high',
    status: 'open' | 'in-progress' | 'resolved' | 'closed',
    createdBy: string,        // User ID
    createdByEmail: string,
    createdByName: string,
    assignedTo: string | null,
    createdAt: string,        // ISO timestamp
    updatedAt: string,        // ISO timestamp
    timeline: TimelineEntry[] // Histórico de ações
  }
  ```

#### 6.3 **Supabase Edge Functions** (Serverless Backend)
- **Onde está**: `/supabase/functions/server/index.tsx`
- **Runtime**: Deno (JavaScript/TypeScript runtime)
- **Framework web**: Hono (leve e rápido)

- **APIs REST implementadas**:

| Endpoint | Método | Autenticação | Descrição |
|----------|--------|--------------|-----------|
| `/make-server-194bf14c/signup` | POST | ❌ Não | Cadastrar novo usuário |
| `/make-server-194bf14c/tickets` | GET | ✅ Sim | Listar todos os chamados (com filtros) |
| `/make-server-194bf14c/tickets/:id` | GET | ✅ Sim | Buscar chamado específico |
| `/make-server-194bf14c/tickets` | POST | ✅ Sim | Criar novo chamado |
| `/make-server-194bf14c/tickets/:id` | PUT | ✅ Sim | Atualizar chamado |
| `/make-server-194bf14c/tickets/:id/comments` | POST | ✅ Sim | Adicionar comentário |
| `/make-server-194bf14c/ai-suggest` | POST | ✅ Sim | Obter sugestões de IA |
| `/make-server-194bf14c/stats` | POST | ✅ Sim | Obter estatísticas do dashboard |

- **Autenticação nas rotas**:
  ```typescript
  // Verifica token de acesso
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  ```

- **CORS e Logs**:
  ```typescript
  app.use('*', cors());          // Permite requisições do frontend
  app.use('*', logger(console.log)); // Loga todas as requisições
  ```

---

## 🤖 Inteligência Artificial (IA)

### 7. **Sistema de Sugestões de IA** (Mock Implementation)
- **Onde está**: `/supabase/functions/server/index.tsx` (rota `/ai-suggest`)
- **Tecnologia**: Algoritmo baseado em palavras-chave (não usa APIs externas)

- **Como funciona**:
  ```typescript
  // Analisa a descrição do problema e retorna:
  {
    category: 'Hardware' | 'Software' | 'Rede/Conexão' | 'Acesso/Segurança',
    priority: 'low' | 'medium' | 'high',
    possibleSolutions: string[] // Lista de soluções sugeridas
  }
  ```

- **Detecção inteligente**:
  - **Categoria**: Analisa palavras-chave como "internet", "software", "impressora", "login"
  - **Prioridade**: Detecta urgência por palavras como "urgente", "crítico", "parado"
  - **Soluções**: Sugere até 4 soluções específicas para cada categoria

- **Exemplo de uso**:
  - Descrição: "Minha internet está muito lenta"
  - Sugestão: Categoria "Rede/Conexão", Prioridade "medium", Soluções: ["Verificar cabo de rede", "Reiniciar roteador", ...]

---

## 📡 Comunicação Frontend ↔ Backend

### 8. **API Client** (`/utils/api.ts`)
- **Função**: Centraliza todas as chamadas HTTP para o backend
- **Configuração**:
  ```typescript
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-194bf14c`;
  ```

- **Headers automáticos**:
  ```typescript
  {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
  ```

- **Tratamento de erros**:
  - Classe `ApiError` customizada
  - Logs detalhados de erros no console
  - Mensagens amigáveis para o usuário

---

## 🗂️ Estrutura de Arquivos e Responsabilidades

```
📁 /
├── 📄 App.tsx                    → Componente principal, gerencia rotas e autenticação
├── 📁 components/
│   ├── 📄 AuthPage.tsx           → Tela de login/cadastro
│   ├── 📄 Dashboard.tsx          → Dashboard com estatísticas
│   ├── 📄 TicketList.tsx         → Lista de chamados com filtros
│   ├── 📄 NewTicket.tsx          → Formulário de criação com IA
│   ├── 📄 TicketDetail.tsx       → Detalhes e timeline do chamado
│   ├── 📄 Sidebar.tsx            → Menu de navegação lateral
│   └── 📁 ui/                    → Componentes shadcn/ui
├── 📁 styles/
│   └── 📄 globals.css            → Configuração Tailwind v4 e temas
├── 📁 utils/
│   ├── 📄 api.ts                 → Cliente HTTP para backend
│   └── 📁 supabase/
│       ├── 📄 client.ts          → Cliente Supabase singleton
│       └── 📄 info.tsx           → Credenciais do projeto
└── 📁 supabase/functions/server/
    ├── 📄 index.tsx              → API REST com Hono
    └── 📄 kv_store.tsx           → Utilitários de banco de dados
```

---

## 🔐 Segurança

### Tokens e Chaves
1. **Public Anon Key** (`publicAnonKey`):
   - Usado para requisições públicas (signup, login)
   - Seguro para expor no frontend
   - Localização: `/utils/supabase/info.tsx`

2. **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`):
   - **NUNCA exposto no frontend**
   - Usado apenas no backend para operações administrativas
   - Armazenado como variável de ambiente no Supabase Edge Functions

3. **Access Token** (JWT):
   - Gerado no login via Supabase Auth
   - Armazenado em `localStorage` no frontend
   - Enviado em todas as requisições autenticadas
   - Verificado no backend para autorização

### Fluxo de Autenticação
```
1. Usuário faz login → Supabase Auth gera access_token
2. Token salvo em localStorage
3. Todas as requisições incluem: Authorization: Bearer {access_token}
4. Backend valida token com supabase.auth.getUser(access_token)
5. Se válido, permite acesso aos dados
```

---

## 🌐 Preparação para Multi-plataforma

A arquitetura atual já está **pronta para integração** com Desktop e Mobile:

### ✅ **Banco de Dados Compartilhado**
- Todas as plataformas acessam a mesma KV Store no Supabase
- Sincronização automática de dados

### ✅ **API REST Unificada**
- Desktop (Electron, Tauri) e Mobile (React Native, Flutter) podem usar as mesmas rotas
- Autenticação consistente em todas as plataformas

### ✅ **Sugestões para Próximas Plataformas**

#### **Desktop (Electron + React)**
```javascript
// Usa o mesmo código React e API
import { api } from './utils/api';
const tickets = await api.getTickets();
```

#### **Mobile (React Native)**
```javascript
// Compatível com Supabase React Native SDK
import { createClient } from '@supabase/supabase-js';
// Mesmas rotas de API
```

#### **Mobile (Flutter - Dart)**
```dart
// Supabase Flutter SDK
final supabase = Supabase.instance.client;
final response = await supabase.auth.signIn(email: email, password: password);
```

---

## 📊 Resumo de Tecnologias

| Categoria | Tecnologia | Versão/Tipo | Propósito |
|-----------|------------|-------------|-----------|
| **Frontend** | React | 18+ | UI Framework |
| | TypeScript | Latest | Tipagem estática |
| | Tailwind CSS | v4 | Estilização |
| | shadcn/ui | Latest | Componentes UI |
| | Lucide React | Latest | Ícones |
| **Backend** | Supabase Auth | Cloud | Autenticação |
| | Supabase Database | PostgreSQL | Armazenamento (KV) |
| | Supabase Edge Functions | Deno runtime | Serverless API |
| | Hono | Latest | Web framework |
| **IA** | Sistema de Keywords | Custom | Sugestões inteligentes |
| **HTTP** | Fetch API | Native | Requisições HTTP |
| **Storage** | localStorage | Native | Persistência de sessão |

---

## 🚀 Próximos Passos Sugeridos

1. **Migrar para PostgreSQL Tables** (quando necessário):
   - Criar tabelas `tickets`, `users`, `comments` com SQL
   - Substituir KV Store por queries SQL
   - Habilitar Row Level Security (RLS)

2. **Adicionar Supabase Realtime**:
   - Sincronização em tempo real de tickets
   - Notificações quando chamados são atualizados

3. **Implementar Supabase Storage**:
   - Upload de anexos (prints, logs, documentos)
   - Armazenamento seguro de arquivos

4. **Integrar IA Real** (OpenAI, Google AI):
   - Substituir sistema de keywords por LLM
   - Sugestões mais precisas e contextuais

---

**Última atualização**: 9 de outubro de 2025
**Desenvolvido para**: HighTask - Sistema de Gerenciamento de Chamados
