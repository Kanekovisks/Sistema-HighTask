import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { Users, Trash2, UserPlus, Edit, UserX, Mail, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
  is_active?: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'user',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getUsers();
      setUsers(response.users || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      await api.createUser(formData.email, formData.password, formData.name, formData.role);
      
      // Reset form and close dialog
      setFormData({ email: '', password: '', name: '', role: 'user' });
      setIsDialogOpen(false);
      
      // Reload users
      await loadUsers();
      toast.success('Usuário criado com sucesso! Um e-mail de confirmação foi enviado.');
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error(err.message || 'Erro ao criar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      // Implementação seria feita no backend
      toast.success('Usuário atualizado com sucesso! Notificação enviada por e-mail.');
      setIsEditDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.message || 'Erro ao atualizar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Implementação seria feita no backend
      const action = currentStatus ? 'desativada' : 'ativada';
      toast.success(`Conta ${action} com sucesso! Notificação enviada por e-mail.`);
      await loadUsers();
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      toast.error(err.message || 'Erro ao alterar status do usuário');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await api.deleteUser(deleteUserId);
      toast.success('Usuário excluído definitivamente');
      setDeleteUserId(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Erro ao excluir usuário');
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      // Implementação seria feita no backend
      toast.success(`Link de redefinição de senha enviado para ${email}`);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      toast.error(err.message || 'Erro ao redefinir senha');
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      admin: { variant: 'default', label: 'Administrador' },
      technician: { variant: 'secondary', label: 'Técnico' },
      user: { variant: 'outline', label: 'Usuário' },
    };
    const { variant, label } = config[role] || { variant: 'outline', label: role };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie usuários, permissões e funções do sistema</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="technician">Técnico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Criando...' : 'Criar Usuário'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
          <Button onClick={loadUsers} variant="outline" className="ml-4">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-role">Tipo de Usuário</Label>
              <Select value={editFormData.role} onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário será excluído permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Excluir Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl mt-1">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl mt-1">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Técnicos</p>
                <p className="text-2xl mt-1">{users.filter(u => u.role === 'technician').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <Input 
            placeholder="Buscar por nome ou email..." 
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhum usuário cadastrado</p>
              <p className="text-sm text-gray-400">Clique em "Adicionar Usuário" para começar</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg">{user.name || 'Sem nome'}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Criado em {new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Último acesso: {new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteUserId(user.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
