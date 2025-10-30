import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to get user role
async function getUserWithRole(accessToken: string) {
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (!user || error) {
    return null;
  }
  return {
    ...user,
    role: user.user_metadata?.role || 'user'
  };
}

// Helper function to check if user is admin
function isAdmin(user: any) {
  return user?.role === 'admin';
}

// Helper function to check if user is technician or admin
function isTechnicianOrAdmin(user: any) {
  return user?.role === 'technician' || user?.role === 'admin';
}

// Initialize default admin user on first run
async function initializeDefaultAdmin() {
  try {
    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(u => u.email === 'ADM@gmail.com');
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'ADM@gmail.com',
        password: 'ADM123',
        user_metadata: { 
          name: 'Administrador',
          role: 'admin'
        },
        email_confirm: true
      });
      
      if (error) {
        console.log(`Error creating default admin: ${error.message}`);
      } else {
        console.log('Default admin user created successfully!');
      }
    }
  } catch (error) {
    console.log(`Error initializing default admin: ${error}`);
  }
}

// Initialize storage bucket for attachments
async function initializeStorageBucket() {
  try {
    const bucketName = 'make-47e73fab-attachments';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('Creating attachments storage bucket...');
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false
      });
      
      if (error) {
        console.log(`Error creating storage bucket: ${error.message}`);
      } else {
        console.log('Attachments storage bucket created successfully!');
      }
    }
  } catch (error) {
    console.log(`Error initializing storage bucket: ${error}`);
  }
}

// Initialize on startup
initializeDefaultAdmin();
initializeStorageBucket();

// Public signup route (creates regular users)
app.post('/make-server-194bf14c/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Force new signups to be regular users
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'user' },
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup exception: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Admin: Create user with specific role
app.post('/make-server-194bf14c/admin/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user || !isAdmin(user)) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { email, password, name, role = 'user' } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });

    if (error) {
      console.log(`Admin create user error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Admin create user exception: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin: Get all users
app.get('/make-server-194bf14c/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user || !isAdmin(user)) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`Error fetching users: ${error.message}`);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }

    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.email,
      role: u.user_metadata?.role || 'user',
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
    }));

    return c.json({ users: formattedUsers });
  } catch (error) {
    console.log(`Error listing users: ${error}`);
    return c.json({ error: 'Failed to list users' }, 500);
  }
});

// Admin: Delete user (with restrictions)
app.delete('/make-server-194bf14c/users/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const currentUser = await getUserWithRole(accessToken);
    if (!currentUser || !isAdmin(currentUser)) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userIdToDelete = c.req.param('id');

    // Prevent self-deletion
    if (currentUser.id === userIdToDelete) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }

    // Get user to delete
    const { data: userToDelete, error: fetchError } = await supabase.auth.admin.getUserById(userIdToDelete);
    
    if (fetchError || !userToDelete) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check last login - require 30 days of inactivity for non-admin deletion
    const userRole = userToDelete.user.user_metadata?.role || 'user';
    const lastSignIn = userToDelete.user.last_sign_in_at;
    
    if (lastSignIn) {
      const daysSinceLogin = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24);
      
      // Require 30 days of inactivity for users and technicians
      if (userRole !== 'admin' && daysSinceLogin < 30) {
        return c.json({ 
          error: `User must be inactive for at least 30 days. Current: ${Math.floor(daysSinceLogin)} days` 
        }, 400);
      }
    }

    // Prevent deletion of the default admin
    if (userToDelete.user.email === 'ADM@gmail.com') {
      return c.json({ error: 'Cannot delete default administrator account' }, 400);
    }

    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userIdToDelete);

    if (deleteError) {
      console.log(`Error deleting user: ${deleteError.message}`);
      return c.json({ error: 'Failed to delete user' }, 500);
    }

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(`Error in delete user: ${error}`);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Get all tickets (filtered by role)
app.get('/make-server-194bf14c/tickets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const status = c.req.query('status');
    const priority = c.req.query('priority');
    const category = c.req.query('category');

    let tickets = await kv.getByPrefix('ticket:');

    // Filter based on user role
    if (user.role === 'user') {
      // Regular users only see their own tickets
      tickets = tickets.filter(t => t.createdBy === user.id);
    } else if (user.role === 'technician') {
      // Technicians see tickets assigned to them + their own tickets
      tickets = tickets.filter(t => t.assignedTo === user.id || t.createdBy === user.id);
    }
    // Admins see all tickets (no filter)

    // Apply additional filters
    if (status || priority || category) {
      tickets = tickets.filter(ticket => {
        let matches = true;
        if (status && ticket.status !== status) matches = false;
        if (priority && ticket.priority !== priority) matches = false;
        if (category && ticket.category !== category) matches = false;
        return matches;
      });
    }

    // Sort by creation date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ tickets });
  } catch (error) {
    console.log(`Error fetching tickets: ${error}`);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Get single ticket (with permission check)
app.get('/make-server-194bf14c/tickets/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const ticketId = c.req.param('id');
    const ticket = await kv.get(`ticket:${ticketId}`);

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Check permissions
    if (user.role === 'user' && ticket.createdBy !== user.id) {
      return c.json({ error: 'Forbidden - You can only view your own tickets' }, 403);
    }
    
    if (user.role === 'technician' && ticket.assignedTo !== user.id && ticket.createdBy !== user.id) {
      return c.json({ error: 'Forbidden - You can only view tickets assigned to you or created by you' }, 403);
    }

    return c.json({ ticket });
  } catch (error) {
    console.log(`Error fetching ticket: ${error}`);
    return c.json({ error: 'Failed to fetch ticket' }, 500);
  }
});

// Create ticket
app.post('/make-server-194bf14c/tickets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const { title, description, category, priority, attachments } = await c.req.json();

    const ticketId = crypto.randomUUID();
    const ticket = {
      id: ticketId,
      title,
      description,
      category,
      priority,
      status: 'open',
      createdBy: user.id,
      createdByEmail: user.email,
      createdByName: user.user_metadata?.name || user.email,
      assignedTo: null,
      assignedToName: null,
      attachments: attachments || [], // Store attachment metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: crypto.randomUUID(),
          action: 'created',
          description: 'Chamado criado',
          userId: user.id,
          userName: user.user_metadata?.name || user.email,
          timestamp: new Date().toISOString()
        }
      ]
    };

    await kv.set(`ticket:${ticketId}`, ticket);

    return c.json({ ticket });
  } catch (error) {
    console.log(`Error creating ticket: ${error}`);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

// Update ticket
app.put('/make-server-194bf14c/tickets/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const ticketId = c.req.param('id');
    const updates = await c.req.json();

    const ticket = await kv.get(`ticket:${ticketId}`);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Permission checks
    const isOwner = ticket.createdBy === user.id;
    const isAssignedTechnician = ticket.assignedTo === user.id && user.role === 'technician';
    const userIsAdmin = isAdmin(user);

    // Users can only edit their own tickets (title, description, category, priority)
    if (user.role === 'user' && !isOwner) {
      return c.json({ error: 'Forbidden - You can only edit your own tickets' }, 403);
    }

    // Regular users cannot change status
    if (user.role === 'user' && updates.status && updates.status !== ticket.status) {
      return c.json({ error: 'Forbidden - Only technicians and admins can change ticket status' }, 403);
    }

    // Technicians can only change status on assigned tickets
    if (user.role === 'technician' && !isAssignedTechnician && !isOwner && !userIsAdmin) {
      return c.json({ error: 'Forbidden - You can only modify tickets assigned to you' }, 403);
    }

    // Track changes for timeline
    const timelineEntry = {
      id: crypto.randomUUID(),
      action: 'updated',
      description: '',
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      timestamp: new Date().toISOString()
    };

    const changes = [];
    if (updates.status && updates.status !== ticket.status) {
      changes.push(`Status alterado de "${ticket.status}" para "${updates.status}"`);
    }
    if (updates.priority && updates.priority !== ticket.priority) {
      changes.push(`Prioridade alterada de "${ticket.priority}" para "${updates.priority}"`);
    }
    if (updates.assignedTo !== undefined && updates.assignedTo !== ticket.assignedTo) {
      changes.push(`Atribuído para ${updates.assignedToName || 'técnico'}`);
    }
    if (updates.title && updates.title !== ticket.title) {
      changes.push('Título atualizado');
    }
    if (updates.description && updates.description !== ticket.description) {
      changes.push('Descrição atualizada');
    }

    timelineEntry.description = changes.join(', ') || 'Chamado atualizado';

    const updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date().toISOString(),
      timeline: [...ticket.timeline, timelineEntry]
    };

    await kv.set(`ticket:${ticketId}`, updatedTicket);

    return c.json({ ticket: updatedTicket });
  } catch (error) {
    console.log(`Error updating ticket: ${error}`);
    return c.json({ error: 'Failed to update ticket' }, 500);
  }
});

// Add comment to ticket
app.post('/make-server-194bf14c/tickets/:id/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const ticketId = c.req.param('id');
    const { comment } = await c.req.json();

    const ticket = await kv.get(`ticket:${ticketId}`);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Check if user has permission to view/comment on this ticket
    const canAccess = user.role === 'admin' || 
                      ticket.createdBy === user.id || 
                      ticket.assignedTo === user.id;

    if (!canAccess) {
      return c.json({ error: 'Forbidden - You cannot comment on this ticket' }, 403);
    }

    const timelineEntry = {
      id: crypto.randomUUID(),
      action: 'comment',
      description: comment,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      timestamp: new Date().toISOString()
    };

    const updatedTicket = {
      ...ticket,
      updatedAt: new Date().toISOString(),
      timeline: [...ticket.timeline, timelineEntry]
    };

    await kv.set(`ticket:${ticketId}`, updatedTicket);

    return c.json({ ticket: updatedTicket });
  } catch (error) {
    console.log(`Error adding comment: ${error}`);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Get list of technicians (for assignment)
app.get('/make-server-194bf14c/technicians', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user || !isTechnicianOrAdmin(user)) {
      return c.json({ error: 'Forbidden - Technician or Admin access required' }, 403);
    }

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`Error fetching technicians: ${error.message}`);
      return c.json({ error: 'Failed to fetch technicians' }, 500);
    }

    // Filter technicians and admins
    const technicians = users
      .filter(u => u.user_metadata?.role === 'technician' || u.user_metadata?.role === 'admin')
      .map(u => ({
        id: u.id,
        name: u.user_metadata?.name || u.email,
        email: u.email,
        role: u.user_metadata?.role
      }));

    return c.json({ technicians });
  } catch (error) {
    console.log(`Error listing technicians: ${error}`);
    return c.json({ error: 'Failed to list technicians' }, 500);
  }
});

// AI Suggestion endpoint
app.post('/make-server-194bf14c/ai-suggest', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const { description } = await c.req.json();

    const suggestions = {
      category: 'Hardware',
      priority: 'medium',
      possibleSolutions: []
    };

    const lowerDesc = description.toLowerCase();

    // Category detection
    if (lowerDesc.includes('internet') || lowerDesc.includes('wifi') || lowerDesc.includes('rede') || lowerDesc.includes('conexão')) {
      suggestions.category = 'Rede/Conexão';
      suggestions.possibleSolutions = [
        'Verificar cabo de rede',
        'Reiniciar roteador',
        'Verificar configurações de IP',
        'Testar com outro dispositivo'
      ];
    } else if (lowerDesc.includes('software') || lowerDesc.includes('programa') || lowerDesc.includes('aplicativo') || lowerDesc.includes('sistema')) {
      suggestions.category = 'Software';
      suggestions.possibleSolutions = [
        'Reinstalar o software',
        'Verificar atualizações',
        'Limpar cache e arquivos temporários',
        'Verificar compatibilidade'
      ];
    } else if (lowerDesc.includes('impressora') || lowerDesc.includes('mouse') || lowerDesc.includes('teclado') || lowerDesc.includes('monitor')) {
      suggestions.category = 'Hardware';
      suggestions.possibleSolutions = [
        'Verificar conexões físicas',
        'Atualizar drivers',
        'Testar em outra máquina',
        'Verificar fonte de alimentação'
      ];
    } else if (lowerDesc.includes('email') || lowerDesc.includes('senha') || lowerDesc.includes('login') || lowerDesc.includes('acesso')) {
      suggestions.category = 'Acesso/Segurança';
      suggestions.possibleSolutions = [
        'Resetar senha',
        'Verificar permissões de acesso',
        'Limpar cookies do navegador',
        'Verificar autenticação de dois fatores'
      ];
    }

    // Priority detection
    if (lowerDesc.includes('urgente') || lowerDesc.includes('crítico') || lowerDesc.includes('parado') || lowerDesc.includes('não funciona')) {
      suggestions.priority = 'high';
    } else if (lowerDesc.includes('lento') || lowerDesc.includes('às vezes') || lowerDesc.includes('dúvida')) {
      suggestions.priority = 'low';
    }

    return c.json({ suggestions });
  } catch (error) {
    console.log(`Error generating AI suggestions: ${error}`);
    return c.json({ error: 'Failed to generate suggestions' }, 500);
  }
});

// Upload attachment for ticket
app.post('/make-server-194bf14c/attachments/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const { fileName, fileData, fileType } = await c.req.json();

    // Validate file type (only images)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return c.json({ error: 'Invalid file type. Only images (PNG, JPEG, JPG, GIF, WEBP) are allowed.' }, 400);
    }

    // Generate unique file name
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${uniqueFileName}`;

    // Convert base64 to binary
    const base64Data = fileData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('make-47e73fab-attachments')
      .upload(filePath, binaryData, {
        contentType: fileType,
        upsert: false
      });

    if (error) {
      console.log(`Error uploading file: ${error.message}`);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    return c.json({ 
      attachment: {
        id: uniqueFileName,
        fileName: fileName,
        filePath: filePath,
        fileType: fileType,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.log(`Error in upload attachment: ${error}`);
    return c.json({ error: 'Failed to upload attachment' }, 500);
  }
});

// Get signed URLs for ticket attachments
app.get('/make-server-194bf14c/tickets/:id/attachments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const ticketId = c.req.param('id');
    const ticket = await kv.get(`ticket:${ticketId}`);

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Check permissions
    const canAccess = user.role === 'admin' || 
                      ticket.createdBy === user.id || 
                      ticket.assignedTo === user.id;

    if (!canAccess) {
      return c.json({ error: 'Forbidden - You cannot access this ticket' }, 403);
    }

    // Generate signed URLs for all attachments
    const attachmentsWithUrls = await Promise.all(
      (ticket.attachments || []).map(async (attachment: any) => {
        const { data, error } = await supabase.storage
          .from('make-47e73fab-attachments')
          .createSignedUrl(attachment.filePath, 3600); // 1 hour expiry

        if (error) {
          console.log(`Error creating signed URL for ${attachment.fileName}: ${error.message}`);
          return { ...attachment, url: null, error: true };
        }

        return { ...attachment, url: data.signedUrl };
      })
    );

    return c.json({ attachments: attachmentsWithUrls });
  } catch (error) {
    console.log(`Error getting attachments: ${error}`);
    return c.json({ error: 'Failed to get attachments' }, 500);
  }
});

// Download attachment
app.get('/make-server-194bf14c/attachments/:userId/:fileName/download', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const userId = c.req.param('userId');
    const fileName = c.req.param('fileName');
    const filePath = `${userId}/${fileName}`;

    // Generate download URL
    const { data, error } = await supabase.storage
      .from('make-47e73fab-attachments')
      .createSignedUrl(filePath, 60, {
        download: true
      });

    if (error) {
      console.log(`Error creating download URL: ${error.message}`);
      return c.json({ error: 'Failed to generate download URL' }, 500);
    }

    return c.json({ downloadUrl: data.signedUrl });
  } catch (error) {
    console.log(`Error in download attachment: ${error}`);
    return c.json({ error: 'Failed to download attachment' }, 500);
  }
});

// Get dashboard statistics
app.get('/make-server-194bf14c/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized - Please login' }, 401);
    }

    const user = await getUserWithRole(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    let tickets = await kv.getByPrefix('ticket:');

    // Filter based on user role (same as tickets endpoint)
    if (user.role === 'user') {
      tickets = tickets.filter(t => t.createdBy === user.id);
    } else if (user.role === 'technician') {
      tickets = tickets.filter(t => t.assignedTo === user.id || t.createdBy === user.id);
    }

    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      highPriority: tickets.filter(t => t.priority === 'high').length,
      mediumPriority: tickets.filter(t => t.priority === 'medium').length,
      lowPriority: tickets.filter(t => t.priority === 'low').length,
      byCategory: {}
    };

    // Count by category
    tickets.forEach(ticket => {
      if (!stats.byCategory[ticket.category]) {
        stats.byCategory[ticket.category] = 0;
      }
      stats.byCategory[ticket.category]++;
    });

    return c.json({ stats });
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

Deno.serve(app.fetch);
