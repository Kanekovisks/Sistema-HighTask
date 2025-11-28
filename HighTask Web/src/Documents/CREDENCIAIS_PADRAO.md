# 🔑 Credenciais de Acesso Padrão - HighTask

Este documento contém as credenciais do usuário administrador padrão criado automaticamente pelo sistema.

---

## 👨‍💼 Administrador Padrão

O sistema cria automaticamente um usuário administrador na primeira inicialização do servidor.

### Credenciais:

```
📧 Email: ADM@gmail.com
🔒 Senha: ADM123
👤 Função: Administrador (admin)
📛 Nome: Administrador
```

---

## ✅ Permissões do Administrador

O usuário **ADM@gmail.com** possui **acesso total** ao sistema:

- ✅ Visualizar todos os chamados
- ✅ Criar, editar e resolver chamados
- ✅ Alterar status e prioridade de qualquer chamado
- ✅ Atribuir chamados a técnicos
- ✅ Criar novos usuários (usuários, técnicos e administradores)
- ✅ Visualizar lista completa de usuários
- ✅ Remover usuários (com restrições de segurança)
- ✅ Acessar todas as estatísticas do sistema

---

## 🛡️ Proteções de Segurança

### Conta Protegida

A conta **ADM@gmail.com** possui proteções especiais:

1. **Não pode ser removida** - É a conta raiz do sistema
2. **Criada automaticamente** - Garante sempre ter um admin
3. **Única verificação** - Se já existe, não recria

### Código de Proteção

```typescript
// Prevenir deleção do admin padrão
if (userToDelete.user.email === 'ADM@gmail.com') {
  return c.json({ error: 'Cannot delete default administrator account' }, 400);
}
```

---

## 🔄 Primeiro Acesso

### Passo a Passo:

1. **Acesse a aplicação web** do HighTask
2. Na tela de login, clique em **"Entrar"**
3. Digite as credenciais:
   - Email: `ADM@gmail.com`
   - Senha: `ADM123`
4. Clique em **"Entrar"**
5. Você será redirecionado para o Dashboard com acesso completo

### Após o primeiro login:

⚠️ **IMPORTANTE:** Por segurança, recomenda-se:

1. **Alterar a senha padrão** (funcionalidade futura)
2. **Criar outro administrador** com suas credenciais pessoais
3. **Manter o ADM@gmail.com** apenas como backup

---

## 👥 Criar Outros Usuários

Como administrador, você pode criar:

### 1. Usuários Comuns
```
Função: user
Permissões: Criar e visualizar próprios chamados
Ideal para: Funcionários que abrem chamados
```

### 2. Técnicos
```
Função: technician
Permissões: Resolver chamados atribuídos
Ideal para: Equipe de TI, suporte técnico
```

### 3. Administradores
```
Função: admin
Permissões: Acesso total ao sistema
Ideal para: Gestores de TI, supervisores
```

### Como criar:

1. Faça login como **ADM@gmail.com**
2. Acesse o menu **"Usuários"** na sidebar
3. Clique em **"Adicionar Usuário"**
4. Preencha os dados:
   - Nome completo
   - Email
   - Senha
   - Função (selecione na lista)
5. Clique em **"Criar Usuário"**

---

## 🔐 Segurança Recomendada

### Boas Práticas:

1. **Não compartilhe** as credenciais padrão
2. **Crie contas individuais** para cada administrador
3. **Use senhas fortes** para novas contas
4. **Mantenha o ADM@gmail.com** apenas como emergência
5. **Revise periodicamente** a lista de usuários
6. **Remova usuários inativos** após 30 dias

### Senha Forte:

Uma senha segura deve ter:
- ✅ Pelo menos 8 caracteres
- ✅ Letras maiúsculas e minúsculas
- ✅ Números
- ✅ Caracteres especiais (@, #, $, etc.)

**Exemplo:** `Ht2025@Secure!`

---

## 🚨 Recuperação de Acesso

### Esqueci a senha do ADM@gmail.com

Como a conta é criada automaticamente, você tem algumas opções:

**Opção 1: Via Supabase Dashboard**
1. Acesse https://supabase.com/dashboard
2. Vá em **Authentication → Users**
3. Encontre o usuário **ADM@gmail.com**
4. Clique em "Send Password Recovery"
5. Ou altere a senha diretamente

**Opção 2: Criar novo admin via código**
```typescript
// No backend, temporariamente adicione:
await supabase.auth.admin.createUser({
  email: 'seu-email@empresa.com',
  password: 'senha-temporaria',
  user_metadata: { name: 'Seu Nome', role: 'admin' },
  email_confirm: true
});
```

**Opção 3: Resetar banco de dados**
- ⚠️ ATENÇÃO: Remove todos os dados!
- Só use como último recurso

---

## 📊 Status da Conta Padrão

Você pode verificar se a conta foi criada:

### Via Logs do Servidor:
```
Creating default admin user...
Default admin user created successfully!
```

### Via Supabase Dashboard:
1. Authentication → Users
2. Busque por: **ADM@gmail.com**
3. Verifique metadados:
   - name: "Administrador"
   - role: "admin"

---

## 🔄 Multi-plataforma

A mesma conta **ADM@gmail.com** funcionará em:

- ✅ **Web** (navegador)
- ✅ **Desktop** (quando implementado)
- ✅ **Mobile** (quando implementado)

Todas compartilham o mesmo banco de dados Supabase!

---

## 📝 Notas Técnicas

### Criação Automática

O usuário é criado na inicialização do servidor:

```typescript
// /supabase/functions/server/index.tsx
async function initializeDefaultAdmin() {
  const adminExists = existingUsers?.users?.some(
    u => u.email === 'ADM@gmail.com'
  );
  
  if (!adminExists) {
    await supabase.auth.admin.createUser({
      email: 'ADM@gmail.com',
      password: 'ADM123',
      user_metadata: { name: 'Administrador', role: 'admin' },
      email_confirm: true
    });
  }
}

initializeDefaultAdmin(); // Executa no startup
```

### Por que email_confirm: true?

- O sistema não tem servidor de email configurado
- Auto-confirmação permite login imediato
- Em produção, configure SMTP para validação real

---

## 🎯 Próximos Passos

Depois de fazer login como administrador:

1. ✅ **Explore o Dashboard** - Veja estatísticas vazias (ainda sem dados)
2. ✅ **Crie um chamado teste** - Para testar o fluxo completo
3. ✅ **Crie um técnico** - Para testar atribuição
4. ✅ **Crie um usuário comum** - Para testar permissões
5. ✅ **Teste a IA** - Crie chamado e veja sugestões automáticas

---

## 📞 Suporte

Para dúvidas sobre credenciais e acesso:

- 📖 Veja: `/SISTEMA_PERMISSOES.md` - Documentação completa de permissões
- 📖 Veja: `/GUIA_USUARIOS_SUPABASE.md` - Como gerenciar usuários
- 📖 Veja: `/TECNOLOGIAS.md` - Arquitetura do sistema

---

**Última atualização**: 9 de outubro de 2025  
**Sistema**: HighTask - Sistema de Gerenciamento de Chamados  
**Segurança**: Nível Administrador
