import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Mail, Shield, Building, Calendar, Hash, Edit } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/api';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

export function UserProfile({ open, onClose, user }: UserProfileProps) {
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestEdit = async () => {
    if (!editReason.trim() || !requestedChanges.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create a ticket for profile edit request
      await api.createTicket({
        title: `Solicitação de Alteração de Perfil - ${user.name || user.email}`,
        description: `TIPO: Alteração de Perfil de Usuário\n\nUSUÁRIO: ${user.name || user.email} (${user.email})\nID: ${user.id}\n\nMOTIVO DA SOLICITAÇÃO:\n${editReason}\n\nALTERAÇÕES SOLICITADAS:\n${requestedChanges}\n\n---\nEsta é uma solicitação automática de alteração de dados de perfil. Requer aprovação de administrador.`,
        category: 'Acesso/Segurança',
        priority: 'medium',
      });

      toast.success('Solicitação enviada! Um administrador irá revisar sua requisição.');
      setShowEditRequest(false);
      setEditReason('');
      setRequestedChanges('');
    } catch (err: any) {
      console.error('Error creating edit request:', err);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'technician': return 'Técnico';
      case 'user': return 'Usuário';
      default: return 'Usuário';
    }
  };

  const getDepartment = (role: string) => {
    // This is a placeholder - in a real app, this would come from user data
    switch (role) {
      case 'admin': return 'Administração';
      case 'technician': return 'TI';
      case 'user': return 'Geral';
      default: return 'Não especificado';
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open && !showEditRequest} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
            <DialogDescription>
              Visualize e solicite alterações nas suas informações
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src="" alt={user.name || user.email} />
                <AvatarFallback className="text-2xl bg-white text-blue-600">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-white text-2xl">{user.name || user.email}</h2>
                <p className="text-blue-100">{getRoleName(user.role)}</p>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Nome Completo</p>
                      <p className="font-medium">{user.name || 'Não especificado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium break-all">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Perfil</p>
                      <p className="font-medium">{getRoleName(user.role)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Departamento</p>
                      <p className="font-medium">{getDepartment(user.role)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Data de Criação</p>
                      <p className="font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Não disponível'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Hash className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">ID</p>
                      <p className="font-medium text-xs break-all">{user.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setShowEditRequest(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Solicitar Alteração de Dados
              </Button>
              <Button onClick={onClose} variant="outline">
                Fechar
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Para alterar suas informações, você precisa solicitar a um administrador.
              As alterações serão registradas e revisadas antes de serem aplicadas.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={showEditRequest} onOpenChange={setShowEditRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Alteração de Dados</DialogTitle>
            <DialogDescription>
              Sua solicitação será enviada como um chamado para aprovação do administrador
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo da Solicitação *</Label>
              <Input
                id="reason"
                placeholder="Ex: Atualização de nome após casamento"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="changes">Alterações Solicitadas *</Label>
              <Textarea
                id="changes"
                placeholder="Descreva detalhadamente as alterações que você deseja realizar&#10;Ex: Alterar nome de 'João Silva' para 'João Silva Santos'"
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRequestEdit}
                disabled={submitting || !editReason.trim() || !requestedChanges.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
              <Button
                onClick={() => {
                  setShowEditRequest(false);
                  setEditReason('');
                  setRequestedChanges('');
                }}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
