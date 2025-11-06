# 🔐 Sistema de Permissões do HighTask

Este documento detalha o sistema completo de controle de acesso baseado em roles (funções) implementado no HighTask.

---

## 👥 Níveis de Acesso

O sistema possui **3 níveis hierárquicos** de permissões:

### 1. 🔵 Usuário Comum (user)

**Permissões:**
- ✅ Criar novos chamados
- ✅ Visualizar **apenas seus próprios** chamados
- ✅ Editar título, descrição, categoria e prioridade dos seus chamados
- ✅ Adicionar comentários nos seus chamados
- ✅ Ver estatísticas dos seus próprios chamados no dashboard

**Restrições:**
- ❌ **NÃO pode** alterar o status (open, in-progress, resolved, closed)
- ❌ **NÃO pode** visualizar chamados de outros usuários
- ❌ **NÃO pode** atribuir chamados a técnicos
- ❌ **NÃO pode** gerenciar usuários
- ❌ **NÃO pode** acessar a página de gerenciamento de usuários

---

### 2. 🟢 Técnico (technician)

**Permissões:**
- ✅ **Todas as permissões de usuário comum** +
- ✅ Visualizar chamados **atribuídos a ele**
- ✅ **Alterar status** dos chamados atribuídos a ele
- ✅ Resolver chamados (mudar status para "resolved")
- ✅ Adicionar comentários nos chamados atribuídos
- ✅ Ver estatísticas dos chamados atribuídos + seus próprios

**Restrições:**
- ❌ **NÃO pode** alterar prioridade dos chamados
- ❌ **NÃO pode** atribuir chamados a outros técnicos
- ❌ **NÃO pode** visualizar chamados não atribuídos a ele (exceto os criados por ele)
- ❌ **NÃO pode** gerenciar usuários
- ❌ **NÃO pode** acessar a página de gerenciamento de usuários

---

### 3. 🔴 Administrador (admin)

**Permissões:**
- ✅ **Todas as permissões de técnicos e usuários** +
- ✅ **Acesso total** a todos os chamados do sistema
- ✅ Alterar **status** de qualquer chamado
- ✅ Alterar **prioridade** de qualquer chamado
- ✅ **Atribuir chamados** a técnicos específicos
- ✅ **Criar usuários** com qualquer função (user, technician, admin)
- ✅ **Visualizar todos os usuários** do sistema
- ✅ **Remover usuários** (com restrições de segurança)
- ✅ Ver estatísticas completas de todos os chamados

**Restrições de Segurança:**
- ⚠️ **NÃO pode** remover a própria conta
- ⚠️ **NÃO pode** remover o usuário padrão ADM@gmail.com
- ⚠️ **NÃO pode** remover usuários que fizeram login nos últimos 30 dias (usuários e técnicos)

---

## 🔑 Usuário Administrador Padrão

O sistema cria automaticamente um administrador padrão na primeira inicialização:

```
Email: ADM@gmail.com
Senha: ADM123
Função: admin
```

**Características:**
- ✅ Criado automaticamente ao iniciar o servidor
- ✅ Possui acesso total ao sistema
- ✅ **Não pode ser removido** (proteção de sistema)
- ✅ Pode criar outros administradores

---

## 📋 Matriz de Permissões

| Funcionalidade | Usuário | Técnico | Admin |
|----------------|---------|---------|-------|
| **Chamados** |
| Criar chamado | ✅ | ✅ | ✅ |
| Ver próprios chamados | ✅ | ✅ | ✅ |
| Ver chamados atribuídos | ❌ | ✅ | ✅ |
| Ver todos os chamados | ❌ | ❌ | ✅ |
| Editar título/descrição | ✅ (próprios) | ✅ (próprios) | ✅ (todos) |
| Alterar status | ❌ | ✅ (atribuídos) | ✅ (todos) |
| Alterar prioridade | ❌ | ❌ | ✅ (todos) |
| Atribuir a técnico | ❌ | ❌ | ✅ |
| Adicionar comentário | ✅ (próprios) | ✅ (atribuídos) | ✅ (todos) |
| **Usuários** |
| Ver lista de usuários | ❌ | ❌ | ✅ |
| Criar usuário | ❌ | ❌ | ✅ |
| Remover usuário | ❌ | ❌ | ✅ * |
| Alterar função de usuário | ❌ | ❌ | ✅ |
| **Dashboard** |
| Ver estatísticas próprias | ✅ | ✅ | ✅ |
| Ver estatísticas completas | ❌ | ❌ | ✅ |

\* Com restrições de segurança (30 dias de inatividade)

---

## 🛡️ Implementação Técnica

### Backend (Verificação de Permissões)

Todas as rotas da API verificam permissões no backend:

```typescript
// Helper functions
async function getUserWithRole(accessToken: string) {
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  return {
    ...user,
    role: user.user_metadata?.role || 'user'
  };
}

function isAdmin(user: any) {
  return user?.role === 'admin';
}

function isTechnicianOrAdmin(user: any) {
  return user?.role === 'technician' || user?.role === 'admin';
}
```

### Filtros Baseados em Role

**GET /tickets** - Lista de chamados:
```typescript
if (user.role === 'user') {
  // Usuários veem apenas os próprios
  tickets = tickets.filter(t => t.createdBy === user.id);
} else if (user.role === 'technician') {
  // Técnicos veem os atribuídos + próprios
  tickets = tickets.filter(t => 
    t.assignedTo === user.id || t.createdBy === user.id
  );
}
// Admins veem tudo (sem filtro)
```

**PUT /tickets/:id** - Atualização de chamado:
```typescript
// Usuários não podem alterar status
if (user.role === 'user' && updates.status) {
  return c.json({ error: 'Forbidden' }, 403);
}

// Técnicos só podem alterar status dos atribuídos
if (user.role === 'technician' && !isAssignedTechnician) {
  return c.json({ error: 'Forbidden' }, 403);
}
```

---

## 🔄 Fluxo de Trabalho Típico

### Cenário 1: Usuário Comum Abre Chamado

1. **Usuário** cria chamado com título, descrição e categoria
2. IA sugere prioridade e soluções
3. Chamado criado com status "open"
4. **Admin** vê o chamado no dashboard
5. **Admin** atribui chamado a um **Técnico**
6. **Técnico** recebe notificação (futura feature)
7. **Técnico** altera status para "in-progress"
8. **Técnico** resolve o problema
9. **Técnico** altera status para "resolved"
10. **Admin** ou **Técnico** fecha chamado (status "closed")

### Cenário 2: Admin Gerencia Usuários

1. **Admin** acessa página "Usuários"
2. **Admin** visualiza lista completa com filtros
3. **Admin** clica em "Adicionar Usuário"
4. **Admin** preenche dados e seleciona função
5. Novo usuário criado com senha temporária
6. Usuário recebe credenciais (futura feature: email)
7. Usuário faz primeiro login

### Cenário 3: Técnico Resolve Chamado

1. **Técnico** acessa "Chamados"
2. Vê apenas chamados atribuídos a ele
3. Clica em um chamado específico
4. Altera status para "in-progress"
5. Adiciona comentários com atualizações
6. Resolve o problema
7. Altera status para "resolved"
8. Usuário que criou recebe notificação (futura feature)

---

## 🔒 Regras de Segurança

### 1. Proteção de Dados
- Usuários **nunca** veem dados de chamados de outros usuários
- Técnicos veem apenas chamados relevantes para eles
- Service Role Key **nunca** exposta no frontend

### 2. Validação em Múltiplas Camadas
- ✅ Frontend: UI esconde opções não permitidas
- ✅ Backend: Valida permissões em cada requisição
- ✅ Database: Filtra dados antes de retornar

### 3. Prevenção de Escalação de Privilégios
- Usuários não podem se promover a admin
- Signup público sempre cria usuários comuns
- Apenas admins podem criar usuários com funções elevadas

### 4. Auditoria
- Timeline de chamados registra todas as ações
- Incluí: quem fez, o quê, quando
- Imutável (não pode ser editado)

### 5. Regras de Remoção de Usuários

**Proteções:**
- ❌ Admin não pode remover própria conta
- ❌ Não pode remover ADM@gmail.com (conta padrão)
- ⚠️ Usuários/técnicos devem estar inativos por **30 dias**
- ✅ Admins podem ser removidos imediatamente (se não forem o padrão)

**Exemplo de validação:**
```typescript
// Verificar inatividade
const daysSinceLogin = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24);

if (userRole !== 'admin' && daysSinceLogin < 30) {
  return c.json({ 
    error: `Usuário deve estar inativo por 30 dias. Atual: ${Math.floor(daysSinceLogin)} dias` 
  }, 400);
}
```

---

## 📱 Interface do Usuário por Role

### Usuário Comum
```
Menu Lateral:
- Dashboard (estatísticas próprias)
- Chamados (apenas próprios)
- Novo Chamado

Detalhes do Chamado:
- Visualizar informações
- Adicionar comentários
- Editar título/descrição
- [Status é somente leitura]
```

### Técnico
```
Menu Lateral:
- Dashboard (próprios + atribuídos)
- Chamados (próprios + atribuídos)
- Novo Chamado

Detalhes do Chamado:
- Todas as opções de usuário +
- Alterar status (se atribuído)
- Ver técnico responsável
```

### Administrador
```
Menu Lateral:
- Dashboard (todos os chamados)
- Chamados (todos)
- Novo Chamado
- Usuários (gerenciamento completo)

Detalhes do Chamado:
- Controle total
- Alterar status
- Alterar prioridade
- Atribuir a técnico
- Ver histórico completo

Gerenciamento de Usuários:
- Lista completa
- Criar com qualquer função
- Remover (com restrições)
- Ver estatísticas
```

---

## 🎯 Casos de Uso Especiais

### Técnico que é também criador do chamado
- Pode ver o chamado (é criador)
- Pode alterar status apenas se for atribuído a ele
- Se não atribuído, não pode alterar status

### Admin atribui chamado
- Seleciona técnico da lista
- Técnico passa a ver o chamado
- Técnico recebe permissão para alterar status
- Timeline registra a atribuição

### Usuário tenta acessar chamado de outro
- Backend retorna 403 Forbidden
- Frontend não mostra o chamado na lista
- Mesmo com ID direto, acesso negado

---

## 🚀 Próximas Melhorias Sugeridas

### Permissões Granulares
- [ ] Criar sub-roles (ex: "senior_technician")
- [ ] Permissões customizadas por usuário
- [ ] Grupos de técnicos por departamento

### Auditoria Avançada
- [ ] Log completo de todas as ações
- [ ] Relatório de atividades por usuário
- [ ] Exportação de logs para análise

### Notificações
- [ ] Email quando chamado é atribuído
- [ ] Push notification para updates
- [ ] Alertas de SLA (tempo de resposta)

### Segurança Adicional
- [ ] Autenticação de dois fatores (2FA)
- [ ] Sessões com timeout automático
- [ ] Histórico de logins
- [ ] Bloqueio após tentativas falhas

---

## 📚 Referências Técnicas

### Arquivos Relacionados

**Backend:**
- `/supabase/functions/server/index.tsx` - Lógica de permissões
- Funções: `getUserWithRole()`, `isAdmin()`, `isTechnicianOrAdmin()`

**Frontend:**
- `/App.tsx` - Gerenciamento de sessão e role
- `/components/TicketDetail.tsx` - UI baseada em permissões
- `/components/Sidebar.tsx` - Menu dinâmico
- `/components/UserManagement.tsx` - Apenas admins

**API:**
- `/utils/api.ts` - Cliente HTTP com autenticação

### Fluxo de Autenticação
```
1. Login → Supabase Auth
2. Retorna: { user, access_token }
3. user_metadata.role → Armazena função
4. Cada requisição: Authorization: Bearer {access_token}
5. Backend: getUser(token) → Valida e extrai role
6. Aplica filtros e permissões
7. Retorna dados filtrados
```

---

**Última atualização**: 9 de outubro de 2025  
**Sistema**: HighTask v1.0  
**Autor**: Sistema de Gerenciamento de Chamados com IA
