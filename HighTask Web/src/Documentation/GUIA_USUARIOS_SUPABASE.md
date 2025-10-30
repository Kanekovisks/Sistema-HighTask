# 👥 Guia: Como Ver e Gerenciar Usuários no Supabase

Este guia mostra todas as formas de visualizar e gerenciar os usuários cadastrados no HighTask.

---

## 🌐 Opção 1: Dashboard Web do Supabase (Mais Fácil)

### Passo a passo:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione seu Projeto**
   - Clique no projeto do HighTask

3. **Navegue até Authentication**
   - No menu lateral esquerdo, clique em **"Authentication"** 🔐
   - Em seguida, clique em **"Users"**

4. **Visualize os Usuários**
   Você verá uma tabela com:
   - ✅ **Email** do usuário
   - ✅ **ID único** (UUID)
   - ✅ **Data de criação**
   - ✅ **Último login**
   - ✅ **Status de confirmação de email**
   - ✅ **Metadados** (nome, role)

### 🔍 Ações Disponíveis:
- **Ver detalhes**: Clique em qualquer usuário para ver informações completas
- **Editar**: Alterar email, senha ou metadados
- **Deletar**: Remover usuário do sistema
- **Enviar email de recuperação**: Resetar senha

---

## 💻 Opção 2: Dentro da Aplicação Web HighTask

### Acesse a página de Usuários:

1. **Faça login no HighTask**
   - Acesse a aplicação web

2. **Navegue até "Usuários"**
   - Clique no menu lateral em **"Usuários"** (ícone de pessoas)

3. **Funcionalidades disponíveis:**
   - ✅ **Visualizar lista** de todos os usuários
   - ✅ **Adicionar novos usuários** (botão "Adicionar Usuário")
   - ✅ **Buscar** por nome ou email
   - ✅ **Ver estatísticas**: Total, Admins, Técnicos
   - ✅ **Ver informações**: Email, função, data de criação, último acesso

### 📋 Como adicionar um novo usuário:

1. Clique em **"Adicionar Usuário"**
2. Preencha:
   - **Nome Completo**
   - **Email**
   - **Senha**
   - **Função** (Usuário, Técnico ou Administrador)
3. Clique em **"Criar Usuário"**

---

## 🗄️ Opção 3: Via SQL Query no Supabase

### Consultar usuários com SQL:

1. **Acesse o SQL Editor**
   - No dashboard do Supabase
   - Clique em **"SQL Editor"** no menu lateral

2. **Execute esta query**:

```sql
-- Query básica para listar usuários
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  created_at,
  last_sign_in_at,
  email_confirmed_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

3. **Queries úteis adicionais**:

```sql
-- Contar usuários por função
SELECT 
  raw_user_meta_data->>'role' as role,
  COUNT(*) as total
FROM auth.users
GROUP BY raw_user_meta_data->>'role';

-- Buscar usuário específico por email
SELECT *
FROM auth.users
WHERE email = 'usuario@exemplo.com';

-- Ver usuários criados nos últimos 7 dias
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Ver usuários que nunca fizeram login
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE last_sign_in_at IS NULL;
```

---

## 📊 Opção 4: Via API REST (Para Desenvolvedores)

### Endpoint para listar usuários:

```typescript
// JavaScript/TypeScript
const response = await fetch(
  'https://{projectId}.supabase.co/functions/v1/make-server-194bf14c/users',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }
);

const { users } = await response.json();
console.log(users);
```

### Resposta esperada:

```json
{
  "users": [
    {
      "id": "uuid-do-usuario",
      "email": "joao@empresa.com",
      "name": "João Silva",
      "role": "admin",
      "createdAt": "2025-10-09T12:00:00Z",
      "lastSignIn": "2025-10-09T15:30:00Z"
    },
    {
      "id": "uuid-do-usuario-2",
      "email": "maria@empresa.com",
      "name": "Maria Santos",
      "role": "technician",
      "createdAt": "2025-10-08T10:00:00Z",
      "lastSignIn": "2025-10-09T14:00:00Z"
    }
  ]
}
```

---

## 🔐 Estrutura de Dados do Usuário

### Campos armazenados no Supabase Auth:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do usuário |
| `email` | String | Email de login |
| `encrypted_password` | String | Senha criptografada (não acessível) |
| `email_confirmed_at` | Timestamp | Quando o email foi confirmado |
| `created_at` | Timestamp | Data de criação da conta |
| `updated_at` | Timestamp | Última atualização |
| `last_sign_in_at` | Timestamp | Último login |
| `raw_user_meta_data` | JSONB | Metadados customizados |

### Metadados Customizados (`user_metadata`):

```json
{
  "name": "João Silva",
  "role": "admin"
}
```

**Funções disponíveis:**
- `user` - Usuário comum (pode criar chamados)
- `technician` - Técnico (pode atribuir e resolver chamados)
- `admin` - Administrador (acesso total ao sistema)

---

## 🛠️ Gerenciamento Avançado

### Como resetar senha de um usuário:

**Via Dashboard:**
1. Vá em Authentication > Users
2. Clique no usuário
3. Clique em "Send Password Recovery"
4. O usuário receberá um email (se configurado)

**Via SQL:**
```sql
-- Atualizar senha diretamente (use com cuidado!)
-- Nota: Requer acesso ao Service Role Key
```

### Como alterar metadados (nome ou role):

**Via Dashboard:**
1. Authentication > Users > Clique no usuário
2. Edite o campo "User Metadata"
3. Salve as alterações

**Via API (Backend):**
```typescript
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: { 
    name: 'Novo Nome',
    role: 'technician'
  }
});
```

### Como deletar um usuário:

**Via Dashboard:**
1. Authentication > Users
2. Clique no usuário
3. "Delete User"
4. Confirme a exclusão

**⚠️ ATENÇÃO**: Ao deletar um usuário, todos os chamados criados por ele permanecerão no sistema, mas não será possível identificá-lo.

---

## 📈 Estatísticas e Relatórios

### Ver estatísticas de usuários:

```sql
-- Total de usuários
SELECT COUNT(*) as total_users FROM auth.users;

-- Usuários ativos (que já fizeram login)
SELECT COUNT(*) as active_users 
FROM auth.users 
WHERE last_sign_in_at IS NOT NULL;

-- Taxa de conversão (usuários que confirmaram email)
SELECT 
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) * 100.0 / COUNT(*) as confirmation_rate
FROM auth.users;

-- Usuários criados por dia (últimos 30 dias)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users
FROM auth.users
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔒 Segurança e Permissões

### Boas práticas:

1. **Service Role Key**: NUNCA exponha no frontend
   - Está segura no backend (`/supabase/functions/server/index.tsx`)
   - Apenas o backend pode criar/listar/deletar usuários

2. **Access Tokens**: Gerados no login
   - Armazenados no `localStorage` do navegador
   - Expiram automaticamente
   - Validados a cada requisição no backend

3. **Roles**: Implemente controle de acesso baseado em funções
   - Admin: Pode gerenciar usuários e todas as configurações
   - Technician: Pode gerenciar chamados atribuídos
   - User: Pode apenas criar e visualizar seus próprios chamados

---

## 🚀 Integração Multi-plataforma

### Como os usuários funcionam em Desktop e Mobile:

**✅ Mesma base de dados**: Desktop, Web e Mobile compartilham os mesmos usuários

**✅ Login sincronizado**: Usuário pode fazer login em qualquer plataforma

**✅ API unificada**: Todas as plataformas usam a mesma API REST

### Exemplo de Login em React Native:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Login
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'senha123'
});

// Acesso ao token
const accessToken = session.access_token;
```

---

## 📞 Troubleshooting

### Problema: Não consigo ver os usuários

**Solução:**
- Verifique se você está logado com uma conta válida
- Confirme que o token de acesso está sendo enviado nas requisições
- Verifique os logs do servidor no Supabase (Functions > Logs)

### Problema: Erro ao criar usuário

**Possíveis causas:**
- Email já cadastrado
- Senha muito fraca (mínimo 6 caracteres)
- Formato de email inválido

### Problema: "Unauthorized" ao listar usuários

**Solução:**
- Faça logout e login novamente para atualizar o token
- Verifique se o token está sendo salvo corretamente no localStorage

---

## 📚 Recursos Úteis

- **Documentação Supabase Auth**: https://supabase.com/docs/guides/auth
- **Admin API**: https://supabase.com/docs/reference/javascript/auth-admin-api
- **User Management**: https://supabase.com/docs/guides/auth/managing-user-data

---

**Última atualização**: 9 de outubro de 2025  
**Desenvolvido para**: HighTask - Sistema de Gerenciamento de Chamados
