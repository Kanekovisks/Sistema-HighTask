# 👤📎 Sistema de Perfil de Usuário e Anexos

Documentação completa sobre as funcionalidades de perfil de usuário e sistema de anexos do HighTask.

---

## 👤 Perfil do Usuário

### 📍 Localização

O perfil do usuário está acessível através de um **avatar circular** localizado acima do botão "Sair" na sidebar (menu lateral).

### 🎨 Visual do Avatar

- **Avatar circular** com fundo branco e bordas azuis
- **Iniciais do usuário** em azul (ex: "JS" para João Silva)
- **Nome do usuário** abaixo do avatar
- Texto "Ver perfil" em azul claro
- Hover com efeito de transição

### 📊 Informações Exibidas

Ao clicar no avatar, um modal é aberto mostrando:

| Campo | Descrição | Ícone |
|-------|-----------|-------|
| **Nome Completo** | Nome do usuário | 👤 |
| **Email** | Endereço de email | 📧 |
| **Perfil** | Tipo de usuário (Admin/Técnico/Usuário) | 🛡️ |
| **Departamento** | Setor do usuário | 🏢 |
| **Data de Criação** | Quando a conta foi criada | 📅 |
| **ID** | Identificador único do usuário | # |

### 📝 Solicitação de Alteração de Dados

#### Como Funciona

1. Usuário clica no botão **"Solicitar Alteração de Dados"**
2. Preenche um formulário com:
   - **Motivo da Solicitação**: Por que deseja alterar
   - **Alterações Solicitadas**: Detalhes das mudanças
3. Sistema cria automaticamente um **chamado** do tipo "Alteração de Perfil"
4. Administrador recebe e pode aprovar/negar a solicitação

#### Campos da Solicitação

```
TIPO: Alteração de Perfil de Usuário

USUÁRIO: João Silva (joao@empresa.com)
ID: abc123...

MOTIVO DA SOLICITAÇÃO:
[Texto informado pelo usuário]

ALTERAÇÕES SOLICITADAS:
[Detalhes das mudanças solicitadas]
```

#### Categoria e Prioridade

- **Categoria**: Acesso/Segurança
- **Prioridade**: Média
- **Status Inicial**: Aberto

### 🔐 Segurança e Restrições

- ✅ Apenas **administradores** podem alterar dados de usuários diretamente
- ✅ Todas as solicitações são **registradas** como chamados
- ✅ **Rastreabilidade completa** de quem solicitou e quando
- ✅ **Auditoria** através do sistema de timeline

---

## 📎 Sistema de Anexos

### 🎯 Funcionalidades Principais

- ✅ Upload de imagens ao criar chamados
- ✅ Validação de tipo de arquivo
- ✅ Preview antes do envio
- ✅ Visualização em galeria
- ✅ Viewer de imagem em tela cheia
- ✅ Download individual de anexos

### 📤 Upload de Anexos

#### Tipos de Arquivo Permitidos

- **PNG** (.png)
- **JPEG** (.jpeg, .jpg)
- **GIF** (.gif)
- **WEBP** (.webp)

#### Limitações

- **Tamanho máximo total**: 10MB por chamado
- **Formatos aceitos**: Apenas imagens
- **Validação**: Automática no frontend e backend

#### Como Fazer Upload

1. Ao criar um novo chamado, clique em **"Adicionar Anexos"**
2. Selecione uma ou mais imagens do seu computador
3. Visualize o **preview** das imagens selecionadas
4. Remova imagens indesejadas clicando no X
5. Clique em **"Criar Chamado"** para enviar

### 👁️ Visualização de Anexos

#### Galeria de Anexos

Nos detalhes do chamado, os anexos são exibidos em uma **galeria organizada**:

- **Grid responsivo** (2-4 colunas dependendo do tamanho da tela)
- **Preview em miniatura** de cada imagem
- **Efeito hover** com ícone de olho
- **Nome do arquivo** abaixo de cada imagem
- **Botão de download** para cada anexo

#### Viewer de Imagem

Ao clicar em uma imagem:

- Modal em **tela cheia** com fundo escuro
- Imagem centralizada e redimensionada
- Botão **"Fechar"** para voltar
- Clique fora da imagem também fecha o modal

### 💾 Armazenamento

#### Supabase Storage

Os anexos são armazenados no **Supabase Storage**:

- **Bucket**: `make-47e73fab-attachments`
- **Privado**: Apenas usuários autenticados
- **Organização**: `/userId/fileName`
- **URLs Assinadas**: Temporárias (1 hora)

#### Estrutura de Armazenamento

```
make-47e73fab-attachments/
├── user-id-1/
│   ├── uuid-1.png
│   ├── uuid-2.jpg
│   └── uuid-3.jpeg
├── user-id-2/
│   └── uuid-4.png
└── ...
```

### 📥 Download de Anexos

#### Como Funciona

1. Clique no botão **"Baixar"** abaixo da imagem
2. Sistema gera uma **URL assinada temporária**
3. Download inicia automaticamente
4. URL expira após 1 minuto (segurança)

#### Permissões

- ✅ **Criador** do chamado pode baixar
- ✅ **Técnico atribuído** pode baixar
- ✅ **Administradores** podem baixar
- ❌ Outros usuários **não** têm acesso

### 🔄 Fluxo Completo de Anexos

```
┌─────────────────┐
│ Usuário seleciona│
│    imagens      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validação de    │
│  tipo e tamanho │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Preview local   │
│ (FileReader)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload para     │
│ Supabase Storage│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Metadata salvo  │
│ no chamado      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Visualização e  │
│    Download     │
└─────────────────┘
```

### 🛡️ Segurança de Anexos

#### Validações

- ✅ **Tipo MIME** validado no backend
- ✅ **Extensão do arquivo** verificada
- ✅ **Tamanho** limitado a 10MB
- ✅ **Autenticação** obrigatória
- ✅ **Permissões** por role e ownership

#### Proteções

- ✅ URLs assinadas com **expiração**
- ✅ Bucket **privado** (não acessível publicamente)
- ✅ **Service Role Key** nunca exposta no frontend
- ✅ Validação de **permissões** antes de gerar URL

### 📋 Mensagens do Sistema

#### Sem Anexos

Quando um chamado não possui anexos:

```
┌─────────────────────────────┐
│         📤                  │
│                             │
│      Sem anexos             │
│                             │
│ Este chamado não possui     │
│ arquivos anexados           │
└─────────────────────────────┘
```

#### Com Anexos

Galeria organizada com:
- Miniaturas das imagens
- Nome do arquivo
- Botão de download
- Efeito hover interativo

### 🚨 Tratamento de Erros

#### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Apenas arquivos de imagem..." | Tipo inválido | Selecione apenas PNG, JPEG, JPG, GIF, WEBP |
| "Tamanho total não pode exceder 10MB" | Muito grande | Reduza o tamanho ou quantidade de imagens |
| "Erro ao carregar anexos" | Problema no servidor | Tente novamente ou contate o administrador |
| "Erro ao baixar anexo" | Permissão ou URL expirada | Recarregue a página e tente novamente |

---

## 🎓 Casos de Uso

### Caso 1: Usuário Solicita Alteração de Nome

```
1. Usuário "Maria Santos" casa e quer mudar sobrenome
2. Clica no avatar → "Solicitar Alteração de Dados"
3. Preenche:
   - Motivo: "Atualização de nome após casamento"
   - Alterações: "Alterar nome de 'Maria Santos' para 'Maria Silva'"
4. Sistema cria chamado automático
5. Administrador recebe, valida e aprova
6. Admin atualiza manualmente no Supabase
```

### Caso 2: Técnico Anexa Print de Erro

```
1. Técnico recebe chamado: "Sistema não abre"
2. Pede ao usuário para enviar print do erro
3. Usuário cria comentário e anexa screenshot.png
4. Técnico visualiza a imagem em tela cheia
5. Identifica o problema
6. Baixa a imagem para documentação
7. Resolve o chamado
```

### Caso 3: Chamado com Múltiplas Evidências

```
1. Usuário reporta: "Tela do computador com manchas"
2. Anexa 3 fotos diferentes mostrando o problema
3. Todas as imagens aparecem na galeria
4. Técnico visualiza uma por uma
5. Confirma necessidade de troca de tela
6. Baixa todas as imagens para laudo técnico
```

---

## 📊 Estatísticas e Limites

### Limites Técnicos

```
📎 Anexos por chamado: Ilimitado (respeitando 10MB total)
📏 Tamanho máximo total: 10MB
🖼️ Formatos suportados: 5 (PNG, JPEG, JPG, GIF, WEBP)
⏱️ Tempo de expiração URL: 1 hora (visualização) / 1 minuto (download)
💾 Armazenamento: Supabase Storage (ilimitado no plano)
```

### Performance

```
⚡ Upload: ~2-5 segundos por imagem (depende da conexão)
👁️ Carregamento galeria: Instantâneo (URLs pré-geradas)
🔍 Preview: Instantâneo (base64 local)
💾 Download: Direto do Supabase (CDN otimizado)
```

---

## 🔧 Configuração Técnica

### Backend (Supabase Edge Function)

#### Endpoints de Anexos

```typescript
POST /attachments/upload
GET  /tickets/:id/attachments
GET  /attachments/:userId/:fileName/download
```

#### Inicialização do Bucket

```typescript
async function initializeStorageBucket() {
  const bucketName = 'make-47e73fab-attachments';
  await supabase.storage.createBucket(bucketName, {
    public: false
  });
}
```

### Frontend

#### Upload Flow

```typescript
1. FileReader converte imagem para base64
2. Validação de tipo e tamanho
3. POST /attachments/upload com base64
4. Recebe metadata do anexo
5. Inclui metadata no chamado
```

#### Visualização Flow

```typescript
1. GET /tickets/:id/attachments
2. Backend gera URLs assinadas
3. Frontend exibe galeria
4. Clique abre ImageViewer
```

---

## ✅ Checklist de Implementação

### Sistema de Perfil

- [x] Avatar circular no sidebar
- [x] Modal de visualização de perfil
- [x] Exibição de todas as informações
- [x] Formulário de solicitação de alteração
- [x] Criação automática de chamado
- [x] Categoria e prioridade corretas
- [x] Integração com sistema de permissões

### Sistema de Anexos

- [x] Upload de imagens no NewTicket
- [x] Validação de tipos de arquivo
- [x] Preview local antes do envio
- [x] Upload para Supabase Storage
- [x] Metadata salvo no chamado
- [x] Visualização em galeria
- [x] ImageViewer em tela cheia
- [x] Download individual
- [x] Mensagem "Sem anexos"
- [x] Tratamento de erros

---

## 🎯 Boas Práticas

### Para Usuários

✅ **DO**
- Anexe apenas imagens relevantes ao problema
- Use nomes descritivos para arquivos
- Comprima imagens grandes antes do upload
- Verifique o preview antes de enviar

❌ **DON'T**
- Não anexe arquivos sensíveis sem necessidade
- Não exceda o limite de 10MB
- Não tente enviar tipos de arquivo não suportados

### Para Administradores

✅ **DO**
- Revise solicitações de alteração de perfil
- Valide a identidade antes de aprovar mudanças
- Mantenha registro das alterações aprovadas
- Oriente usuários sobre tipos de arquivo

❌ **DON'T**
- Não altere dados sem solicitação formal
- Não ignore solicitações de alteração
- Não aprove mudanças suspeitas

---

## 🆘 Troubleshooting

### Problema: Avatar não aparece

**Solução**: Recarregue a página ou faça logout/login novamente

### Problema: Upload falha

**Possíveis causas**:
1. Arquivo muito grande → Reduza o tamanho
2. Tipo inválido → Use apenas imagens
3. Sem conexão → Verifique internet

### Problema: Anexos não aparecem

**Solução**: 
1. Verifique se o chamado realmente tem anexos
2. Recarregue a página
3. Verifique permissões (você tem acesso ao chamado?)

### Problema: Download não inicia

**Solução**:
1. Verifique bloqueador de pop-ups
2. Tente novamente (URL pode ter expirado)
3. Recarregue a página

---

**Última Atualização**: 30 de outubro de 2025  
**Versão**: 2.0  
**Status**: ✅ Implementado e Testado
