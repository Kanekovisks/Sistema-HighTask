# 🚀 Guia Rápido - HighTask

Bem-vindo ao **HighTask**! Este guia vai te ajudar a começar em 5 minutos.

---

## ⚡ Início Rápido

### 1️⃣ Faça Login como Administrador

Use as credenciais padrão criadas automaticamente:

```
📧 Email: ADM@gmail.com
🔒 Senha: ADM123
```

### 2️⃣ Explore o Dashboard

Após o login, você verá:
- 📊 Estatísticas de chamados
- 📈 Gráficos por categoria
- 🎯 Status dos chamados

### 3️⃣ Crie Seu Primeiro Chamado

1. Clique em **"Novo Chamado"** no menu lateral
2. Preencha:
   - Título: `Problema com impressora`
   - Descrição: `A impressora não está funcionando`
3. **Veja a mágica da IA!** 🤖
   - Categoria sugerida automaticamente
   - Prioridade detectada
   - Soluções rápidas recomendadas
4. Clique em **"Criar Chamado"**

### 4️⃣ Crie Usuários da Sua Equipe

1. Acesse **"Usuários"** no menu
2. Clique em **"Adicionar Usuário"**
3. Crie um **Técnico**:
   - Nome: `João Silva`
   - Email: `joao@empresa.com`
   - Senha: `senha123`
   - Função: **Técnico**
4. Crie um **Usuário**:
   - Nome: `Maria Santos`
   - Email: `maria@empresa.com`
   - Senha: `senha123`
   - Função: **Usuário**

### 5️⃣ Atribua um Chamado ao Técnico

1. Acesse **"Chamados"**
2. Clique no chamado que você criou
3. Na barra lateral direita:
   - **Atribuir a**: Selecione `João Silva`
4. Clique em **"Salvar Alterações"**

---

## 🎯 Testando os Níveis de Acesso

### Como Usuário Comum (Maria)

1. **Faça Logout** (canto inferior do menu)
2. **Login** com:
   - Email: `maria@empresa.com`
   - Senha: `senha123`
3. **O que você pode fazer:**
   - ✅ Criar novos chamados
   - ✅ Ver apenas seus próprios chamados
   - ✅ Editar seus chamados
   - ❌ Não pode alterar status
   - ❌ Não vê chamados de outros
   - ❌ Não acessa "Usuários"

### Como Técnico (João)

1. **Faça Logout**
2. **Login** com:
   - Email: `joao@empresa.com`
   - Senha: `senha123`
3. **O que você pode fazer:**
   - ✅ Ver chamados atribuídos a ele
   - ✅ Alterar status dos atribuídos
   - ✅ Criar seus próprios chamados
   - ❌ Não pode atribuir chamados
   - ❌ Não acessa "Usuários"

### Como Administrador (Você)

1. **Login** com `ADM@gmail.com`
2. **O que você pode fazer:**
   - ✅ **TUDO!** Acesso completo ao sistema

---

## 📱 Interface Principal

### Menu Lateral (Sidebar)

```
📊 Dashboard      → Estatísticas e visão geral
🎫 Chamados       → Lista de todos os chamados
➕ Novo Chamado   → Criar chamado com IA
👥 Usuários       → Gerenciar equipe (só admin)
🚪 Sair           → Logout
```

### Cores de Status

- 🔵 **Aberto** (open) - Aguardando atribuição
- 🟡 **Em Andamento** (in-progress) - Sendo resolvido
- 🟢 **Resolvido** (resolved) - Problema solucionado
- ⚪ **Fechado** (closed) - Finalizado

### Cores de Prioridade

- 🔴 **Alta** (high) - Urgente
- 🟠 **Média** (medium) - Normal
- 🟢 **Baixa** (low) - Pode aguardar

---

## 🤖 Usando a IA

A IA do HighTask ajuda a classificar chamados automaticamente!

### Como funciona:

1. **Digite a descrição** do problema
2. Clique em **"Obter Sugestões da IA"**
3. A IA analisa e sugere:
   - ✅ Categoria mais apropriada
   - ✅ Nível de prioridade
   - ✅ Até 4 soluções rápidas

### Exemplos de Descrições:

**Para detectar "Rede/Conexão":**
```
Minha internet está muito lenta
O WiFi não conecta
Sem acesso à rede
```

**Para detectar "Hardware":**
```
A impressora não está funcionando
Monitor não liga
Teclado com teclas travadas
```

**Para detectar "Software":**
```
O sistema está travando
Programa não abre
Erro ao iniciar aplicativo
```

**Para detectar urgência (Prioridade Alta):**
```
URGENTE: Sistema parado
Problema crítico na rede
Não consigo trabalhar, trava sempre
```

---

## 🔄 Fluxo Completo de Trabalho

### Cenário Real: Problema com Impressora

1. **Maria (Usuário)** cria chamado:
   - Título: "Impressora não imprime"
   - Descrição: "Tentei imprimir mas nada acontece"
   - IA sugere: Hardware, Prioridade Média

2. **ADM (Admin)** vê o chamado:
   - Acessa Dashboard
   - Vê novo chamado "Aberto"
   - Atribui para **João (Técnico)**

3. **João (Técnico)** resolve:
   - Vê chamado na lista (atribuído a ele)
   - Muda status: "Em Andamento"
   - Adiciona comentário: "Verificando cabo de rede"
   - Resolve o problema
   - Muda status: "Resolvido"
   - Adiciona comentário: "Cabo estava desconectado. Problema resolvido!"

4. **Maria** vê atualização:
   - Abre o chamado
   - Lê comentários do técnico
   - Confirma que está funcionando

5. **João** finaliza:
   - Muda status: "Fechado"

---

## 📊 Entendendo o Dashboard

### Cards de Estatísticas

- **Total** - Todos os chamados do sistema
- **Abertos** - Aguardando atendimento
- **Em Andamento** - Sendo resolvidos agora
- **Resolvidos** - Problemas solucionados
- **Prioridade Alta** - Chamados urgentes

### Gráfico por Categoria

Mostra distribuição de chamados por tipo:
- Hardware
- Software
- Rede/Conexão
- Acesso/Segurança

---

## 🔐 Gerenciamento de Usuários (Admin)

### Criar Usuário

1. Acesse **"Usuários"**
2. **"Adicionar Usuário"**
3. Preencha os dados
4. Selecione a função:
   - **Usuário** - Para quem abre chamados
   - **Técnico** - Para quem resolve chamados
   - **Administrador** - Para gestores

### Remover Usuário

⚠️ **Regras de Segurança:**

- Usuários devem estar **inativos por 30 dias**
- Você **não pode** remover:
  - Sua própria conta
  - A conta ADM@gmail.com
- O sistema avisa quantos dias faltam

### Ver Informações

Cada usuário mostra:
- 📧 Email
- 👤 Nome
- 🏷️ Função (badge colorido)
- 📅 Data de criação
- 🕐 Último acesso

---

## 🎫 Gerenciamento de Chamados

### Filtros Disponíveis

Na página "Chamados", você pode filtrar por:
- **Status** - Aberto, Em andamento, Resolvido, Fechado
- **Prioridade** - Alta, Média, Baixa
- **Categoria** - Hardware, Software, etc.
- **Busca** - Por título ou descrição

### Detalhes do Chamado

Ao clicar em um chamado, você vê:

**Informações Principais:**
- Título e descrição
- Status e prioridade
- Criador e atribuído
- Categoria

**Timeline (Histórico):**
- Todas as ações realizadas
- Comentários adicionados
- Quem fez e quando

**Ações (lateral direita):**
- Alterar status
- Alterar prioridade (admin)
- Atribuir técnico (admin)
- Adicionar comentários

---

## 💡 Dicas e Truques

### Para Administradores

1. **Monitore o Dashboard** - Veja chamados urgentes
2. **Distribua bem** - Atribua chamados aos técnicos certos
3. **Revise periodicamente** - Feche chamados antigos
4. **Crie categorias** - Organize por departamento

### Para Técnicos

1. **Atualize sempre** - Mantenha status correto
2. **Comente bastante** - Documente o que fez
3. **Priorize bem** - Resolva urgentes primeiro
4. **Feche quando resolver** - Mantenha lista limpa

### Para Usuários

1. **Seja específico** - Descreva bem o problema
2. **Use a IA** - Aproveite as sugestões
3. **Acompanhe** - Veja comentários do técnico
4. **Confirme** - Avise quando estiver resolvido

---

## 🆘 Problemas Comuns

### "Unauthorized" ao acessar página

**Solução:** Faça logout e login novamente

### Não vejo meus chamados

**Solução:** 
- Usuários veem apenas os próprios
- Técnicos veem apenas atribuídos
- Verifique sua função no menu lateral

### Não consigo alterar status

**Solução:**
- Usuários comuns **não podem** alterar status
- Técnicos só alteram nos atribuídos
- Apenas admins alteram todos

### Não consigo remover usuário

**Solução:**
- Aguarde 30 dias de inatividade
- Ou é a conta ADM@gmail.com (protegida)
- Ou está tentando remover a si mesmo

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- 📖 **SISTEMA_PERMISSOES.md** - Sistema completo de permissões
- 📖 **CREDENCIAIS_PADRAO.md** - Dados do administrador padrão
- 📖 **GUIA_USUARIOS_SUPABASE.md** - Gerenciar usuários no Supabase
- 📖 **TECNOLOGIAS.md** - Tecnologias e arquitetura

---

## 🎉 Pronto para Começar!

Agora você já sabe:
- ✅ Como fazer login
- ✅ Como criar chamados
- ✅ Como usar a IA
- ✅ Como gerenciar usuários
- ✅ Como atribuir e resolver chamados

**Comece agora:**
1. Faça login com **ADM@gmail.com**
2. Crie seu primeiro chamado
3. Configure sua equipe
4. Aproveite o HighTask! 🚀

---

**Sistema**: HighTask v1.0  
**Desenvolvido**: 9 de outubro de 2025  
**Objetivo**: Centralizar e otimizar o gerenciamento de chamados de TI
