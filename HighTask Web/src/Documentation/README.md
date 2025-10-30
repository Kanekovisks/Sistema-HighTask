# 🎯 HighTask - Sistema de Gerenciamento de Chamados com IA

Sistema completo para gerenciamento de chamados de TI com sugestões inteligentes de IA, controle de acesso baseado em roles e integração multi-plataforma.

---

## 🚀 Início Rápido

### Credenciais Padrão de Administrador

```
📧 Email: ADM@gmail.com
🔒 Senha: ADM123
```

Faça login e comece a usar imediatamente!

---

## 📚 Documentação

### Guias Principais

| Documento | Descrição |
|-----------|-----------|
| **[GUIA_RAPIDO.md](./GUIA_RAPIDO.md)** | ⚡ Comece em 5 minutos! Tutorial passo a passo |
| **[CREDENCIAIS_PADRAO.md](./CREDENCIAIS_PADRAO.md)** | 🔑 Credenciais do administrador padrão |
| **[SISTEMA_PERMISSOES.md](./SISTEMA_PERMISSOES.md)** | 🔐 Sistema completo de permissões e roles |
| **[TECNOLOGIAS.md](./TECNOLOGIAS.md)** | 💻 Tecnologias e arquitetura do sistema |
| **[GUIA_USUARIOS_SUPABASE.md](./GUIA_USUARIOS_SUPABASE.md)** | 👥 Como gerenciar usuários no Supabase |

### Leia Primeiro: [GUIA_RAPIDO.md](./GUIA_RAPIDO.md)

---

## ✨ Funcionalidades Principais

### 🎫 Gerenciamento de Chamados
- ✅ Criar, visualizar e gerenciar chamados
- ✅ Sistema de prioridades (Alta, Média, Baixa)
- ✅ Status customizáveis (Aberto, Em Andamento, Resolvido, Fechado)
- ✅ Categorização por tipo (Hardware, Software, Rede, Acesso)
- ✅ Timeline completa de ações
- ✅ Sistema de comentários
- ✅ **Upload de anexos** (imagens PNG, JPEG, JPG, GIF, WEBP)
- ✅ **Visualização e download** de anexos em chamados
- ✅ **Preview de imagens** em tela cheia

### 🤖 Inteligência Artificial
- ✅ **Sugestões automáticas** de categoria baseado na descrição
- ✅ **Detecção de prioridade** por palavras-chave
- ✅ **Soluções rápidas** recomendadas por categoria
- ✅ Análise em tempo real ao criar chamados

### 👥 Controle de Acesso (3 Níveis)

#### 🔵 Usuário Comum
- Criar e editar próprios chamados
- Visualizar apenas seus chamados
- Adicionar comentários e anexos
- **Visualizar perfil** e solicitar alterações de dados
- **Solicitar mudanças** de informações pessoais via chamados

#### 🟢 Técnico
- Todas as permissões de usuário +
- Visualizar chamados atribuídos
- Alterar status dos chamados atribuídos
- Resolver chamados

#### 🔴 Administrador
- Acesso total ao sistema
- Gerenciar todos os chamados
- Criar e remover usuários
- Atribuir chamados a técnicos
- Alterar prioridades
- **Aprovar solicitações** de alteração de dados de usuários
- **Exportar relatórios** em PDF e Excel
- **Visualizar métricas** detalhadas do sistema

### 📊 Dashboard e Relatórios
- Estatísticas em tempo real
- Gráficos de pizza por categoria com legendas
- Métricas de status e prioridade
- Filtros avançados
- **Exportação** de relatórios em PDF e Excel (Admin)
- **Feedback visual** com animações e tooltips
- **Confirmações** para ações destrutivas

---

## 🏗️ Arquitetura

### Frontend
- **React 18** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização moderna
- **shadcn/ui** - Componentes acessíveis
- **Lucide React** - Ícones

### Backend
- **Supabase Auth** - Autenticação de usuários
- **Supabase Database** - PostgreSQL com KV Store
- **Supabase Edge Functions** - API REST serverless (Deno + Hono)

### Integrações
- **Multi-plataforma** - Web, Desktop e Mobile compartilham o mesmo banco
- **Tempo real** - Sincronização automática entre dispositivos

---

## 🔐 Sistema de Permissões

### Matriz de Permissões

| Funcionalidade | Usuário | Técnico | Admin |
|----------------|---------|---------|-------|
| Criar chamado | ✅ | ✅ | ✅ |
| Ver próprios chamados | ✅ | ✅ | ✅ |
| Ver todos os chamados | ❌ | ❌ | ✅ |
| Alterar status | ❌ | ✅ (atribuídos) | ✅ |
| Atribuir técnico | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |

📖 Detalhes completos: [SISTEMA_PERMISSOES.md](./SISTEMA_PERMISSOES.md)

---

## 📱 Páginas da Aplicação

### 🏠 Dashboard
- Visão geral do sistema
- Estatísticas por status
- Gráficos de pizza com legendas
- Acesso rápido a chamados
- Botões com feedback hover aprimorado

### 🎫 Lista de Chamados
- Todos os chamados (filtrado por permissão)
- Filtros por status, prioridade e categoria
- Busca em tempo real
- Cards informativos

### ➕ Novo Chamado
- Formulário intuitivo
- **Sugestões de IA** em tempo real
- Categorização automática
- Soluções rápidas sugeridas
- **Upload de anexos** (validação de tipo imagem)
- Preview de imagens antes do envio
- Proteção contra perda de dados

### 📋 Detalhes do Chamado
- Informações completas
- Timeline de atividades
- Sistema de comentários
- Atribuição de técnicos
- Alteração de status/prioridade
- **Visualização de anexos** em galeria
- **Download de anexos** individual
- **Viewer de imagens** em tela cheia
- Sistema de avaliação de atendimento

### 👥 Gerenciamento de Usuários (Admin)
- Lista completa de usuários
- Criar com roles específicos
- Remover com validações de segurança
- Estatísticas por função
- Visualizar solicitações de alteração de dados

### 👤 Perfil do Usuário
- **Avatar circular** com iniciais no sidebar
- Visualizar informações pessoais (Nome, Email, Perfil, Departamento, Data de criação, ID)
- **Solicitar alterações** de dados via sistema de chamados
- Registro de requisições para aprovação de administrador

---

## 🛠️ Tecnologias Utilizadas

### Principais

- **React** - UI Framework
- **TypeScript** - Linguagem
- **Supabase** - Backend completo (Auth + Database + Edge Functions)
- **Tailwind CSS** - Estilização
- **Deno** - Runtime para Edge Functions
- **Hono** - Framework web para API

### Bibliotecas

- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Supabase JS Client** - Integração com Supabase

📖 Lista completa: [TECNOLOGIAS.md](./TECNOLOGIAS.md)

---

## 🎯 Casos de Uso

### Fluxo Típico de Trabalho

1. **Usuário** abre chamado: "Impressora não funciona"
2. **IA** sugere: Categoria "Hardware", Prioridade "Média"
3. **Admin** vê no dashboard e atribui ao **Técnico João**
4. **Técnico João** recebe chamado, muda status para "Em Andamento"
5. **Técnico** resolve e adiciona comentário: "Cabo desconectado, problema resolvido"
6. **Técnico** muda status para "Resolvido"
7. **Usuário** vê atualização e confirma
8. Chamado marcado como "Fechado"

---

## 🔒 Segurança

### Proteções Implementadas

- ✅ **Autenticação JWT** com Supabase Auth
- ✅ **Validação de permissões** em cada requisição no backend
- ✅ **Filtros baseados em role** - Usuários só veem dados permitidos
- ✅ **Service Role Key** nunca exposta no frontend
- ✅ **Proteção contra deleção** - Admin padrão não pode ser removido
- ✅ **Regra de 30 dias** - Usuários inativos para remoção
- ✅ **Timeline imutável** - Auditoria completa de ações

---

## 🚀 Funcionalidades Concluídas Recentemente

### ✅ Implementado na Versão Atual

- ✅ **Upload de anexos** (imagens PNG, JPEG, JPG, GIF, WEBP)
- ✅ **Visualização de anexos** em galeria com preview
- ✅ **Download de anexos** individuais
- ✅ **Relatórios exportáveis** (PDF, Excel)
- ✅ **Perfil do usuário** com avatar circular
- ✅ **Sistema de solicitação** de alteração de dados
- ✅ **Confirmações de ação** para operações destrutivas
- ✅ **Proteção contra perda** de dados não salvos
- ✅ **Sistema de avaliação** de atendimento
- ✅ **Feedback visual aprimorado** em toda interface

### 🔄 Próximas Funcionalidades (Roadmap)

- [ ] Notificações em tempo real
- [ ] Sistema de SLA (tempo de resposta)
- [ ] Integração com email
- [ ] Autenticação de dois fatores (2FA)
- [ ] Upload de documentos PDF
- [ ] Chat em tempo real entre usuário e técnico

### Planejado

- [ ] App Desktop (Electron)
- [ ] App Mobile (React Native)
- [ ] IA com LLM real (OpenAI/Google)
- [ ] Chat em tempo real
- [ ] Grupos de técnicos por departamento
- [ ] Múltiplos idiomas

---

## 📞 Suporte e Documentação

### Precisa de Ajuda?

1. **Começando:** Leia [GUIA_RAPIDO.md](./GUIA_RAPIDO.md)
2. **Permissões:** Consulte [SISTEMA_PERMISSOES.md](./SISTEMA_PERMISSOES.md)
3. **Usuários:** Veja [GUIA_USUARIOS_SUPABASE.md](./GUIA_USUARIOS_SUPABASE.md)
4. **Técnico:** Consulte [TECNOLOGIAS.md](./TECNOLOGIAS.md)

### Problemas Comuns

**"Não consigo fazer login"**
- Verifique credenciais: ADM@gmail.com / ADM123
- Aguarde alguns segundos após criar conta

**"Não vejo meus chamados"**
- Usuários veem apenas os próprios
- Técnicos veem apenas atribuídos
- Admins veem todos

**"Erro ao criar usuário"**
- Email já pode estar cadastrado
- Senha deve ter mínimo 6 caracteres
- Apenas admins podem criar usuários

---

## 📊 Estatísticas do Projeto

```
📁 Componentes: 10 principais + 40+ UI components (shadcn)
📝 Linhas de código: ~5.000+
🔐 Níveis de acesso: 3 (User, Technician, Admin)
🎯 Rotas de API: 15 endpoints REST
🤖 Categorias de IA: 4 (Hardware, Software, Rede, Acesso)
📋 Status de chamados: 4 (Open, In-Progress, Resolved, Closed)
⚡ Prioridades: 3 (Low, Medium, High)
📎 Anexos: Suporte a 5 formatos de imagem
💾 Storage: Supabase Storage para anexos (10MB limite)
📊 Exportação: PDF e Excel para relatórios
```

---

## 🎨 Interface

### Tema
- **Design moderno** com gradientes azuis
- **Responsivo** - Funciona em desktop, tablet e mobile
- **Modo claro** (modo escuro em desenvolvimento)
- **Ícones** intuitivos em todas as ações

### Cores de Status
- 🔵 Aberto - Azul
- 🟡 Em Andamento - Amarelo
- 🟢 Resolvido - Verde
- ⚪ Fechado - Cinza

### Cores de Prioridade
- 🔴 Alta - Vermelho
- 🟠 Média - Laranja
- 🟢 Baixa - Verde

---

## 🌐 Multi-plataforma

### Plataformas Suportadas

✅ **Web** (Atual)
- Navegadores modernos
- Responsivo para mobile
- PWA ready

🔄 **Desktop** (Planejado)
- Electron
- Windows, macOS, Linux
- Mesma interface

🔄 **Mobile** (Planejado)
- React Native
- iOS e Android
- Notificações push

**Banco de dados compartilhado** - Todos sincronizam em tempo real!

---

## 📝 Licença e Uso

Este projeto foi desenvolvido para centralizar o gerenciamento de chamados de TI com foco em:

- ✅ Eficiência operacional
- ✅ Controle de acesso
- ✅ Rastreabilidade completa
- ✅ Sugestões inteligentes
- ✅ Multi-plataforma

---

## 🎓 Projeto Acadêmico

**Contexto:**
- Projeto de Sistemas
- Orientado a Objetos
- Integração multi-plataforma (Web, Desktop, Mobile)
- Banco de dados compartilhado (Supabase)

**Repositório:**
- GitHub: https://github.com/Kanekovisks/Projeto-de-Sistemas
- Documentação: https://github.com/Kanekovisks/Projeto-de-Sistemas/blob/main/Documenta%C3%A7%C3%A3o/BACKLOG.md

---

## 🎉 Comece Agora!

1. **Acesse a aplicação**
2. **Login:** ADM@gmail.com / ADM123
3. **Leia:** [GUIA_RAPIDO.md](./GUIA_RAPIDO.md)
4. **Crie** seu primeiro chamado
5. **Configure** sua equipe
6. **Aproveite** o HighTask! 🚀

---

**Desenvolvido em:** 9 de outubro de 2025  
**Última Atualização:** 30 de outubro de 2025  
**Versão:** 2.0  
**Status:** ✅ Produção (Web) com Sistema de Anexos e Perfil de Usuário  
**Próximo:** Desktop e Mobile

---

**HighTask** - Centralizando a gestão de chamados com inteligência e eficiência! 💼✨
