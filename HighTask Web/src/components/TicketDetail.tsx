import { useEffect, useState } from 'react';
import { api, Ticket } from '../utils/api';
import { ArrowLeft, Loader2, Clock, User, MessageSquare, UserCheck, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState('');
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<string | null>(null);

  useEffect(() => {
    // Get current user info
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.user_metadata?.role || 'user');
      setCurrentUserId(user.id);
    }

    loadTicket();
    loadTechnicians();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.getTicket(ticketId);
      setTicket(result.ticket);
      setNewStatus(result.ticket.status);
      setNewPriority(result.ticket.priority);
      setSelectedTechnician(result.ticket.assignedTo || '');
    } catch (err: any) {
      console.error('Error loading ticket:', err);
      setError(err.message || 'Erro ao carregar chamado');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const result = await api.getTechnicians();
      setTechnicians(result.technicians || []);
    } catch (err: any) {
      console.error('Error loading technicians:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setCommentLoading(true);
      const result = await api.addComment(ticketId, comment);
      setTicket(result.ticket);
      setComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError('Erro ao adicionar comentário: ' + err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpdateClick = () => {
    if (!ticket) return;

    const updates: any = {};
    
    // Only technicians and admins can change status
    if (canChangeStatus() && newStatus !== ticket.status) {
      updates.status = newStatus;
    }
    
    // Only admins can change priority and assignment
    if (userRole === 'admin') {
      if (newPriority !== ticket.priority) {
        updates.priority = newPriority;
      }
      if (selectedTechnician !== ticket.assignedTo) {
        updates.assignedTo = selectedTechnician || null;
      }
    }

    if (Object.keys(updates).length === 0) {
      setError('Nenhuma alteração para salvar');
      return;
    }

    // Check if status is changing to resolved or closed
    if (updates.status && (updates.status === 'resolved' || updates.status === 'closed')) {
      setStatusChangeConfirm(updates.status);
    } else {
      handleUpdateTicket();
    }
  };

  const handleUpdateTicket = async () => {
    if (!ticket) return;

    const updates: any = {};
    
    // Only technicians and admins can change status
    if (canChangeStatus() && newStatus !== ticket.status) {
      updates.status = newStatus;
    }
    
    // Only admins can change priority and assignment
    if (userRole === 'admin') {
      if (newPriority !== ticket.priority) {
        updates.priority = newPriority;
      }
      if (selectedTechnician !== ticket.assignedTo) {
        updates.assignedTo = selectedTechnician || null;
        const tech = technicians.find(t => t.id === selectedTechnician);
        updates.assignedToName = tech ? tech.name : null;
      }
    }

    if (Object.keys(updates).length === 0) {
      setError('Nenhuma alteração para salvar');
      return;
    }

    try {
      setUpdateLoading(true);
      setError('');
      setStatusChangeConfirm(null);
      const result = await api.updateTicket(ticketId, updates);
      setTicket(result.ticket);
      setError('');
    } catch (err: any) {
      console.error('Error updating ticket:', err);
      setError('Erro ao atualizar chamado: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const canChangeStatus = () => {
    if (userRole === 'admin') return true;
    if (userRole === 'technician' && ticket?.assignedTo === currentUserId) return true;
    return false;
  };

  const canAssignTechnician = () => {
    return userRole === 'admin';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in-progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <p>Chamado não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle>{ticket.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Criado por {ticket.createdByName} em {formatDate(ticket.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3>Descrição</h3>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Categoria</p>
                    <p>{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Atribuído a</p>
                    <p>{ticket.assignedToName || 'Não atribuído'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.timeline.map((entry) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {entry.action === 'comment' ? (
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm">{entry.userName}</p>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Comentário</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddComment} className="space-y-4">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  rows={4}
                />
                <Button type="submit" disabled={commentLoading || !comment.trim()}>
                  {commentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar Comentário
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status/Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Chamado</CardTitle>
              <CardDescription>
                {!canChangeStatus() && userRole === 'user' && 
                  'Apenas técnicos podem alterar o status'}
                {!canChangeStatus() && userRole === 'technician' && 
                  'Disponível apenas para chamados atribuídos a você'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                  disabled={!canChangeStatus()}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority - Admin only */}
              {userRole === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newPriority}
                    onValueChange={setNewPriority}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Assign Technician - Admin only */}
              {canAssignTechnician() && (
                <div className="space-y-2">
                  <Label htmlFor="technician">Atribuir a</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedTechnician || undefined}
                      onValueChange={setSelectedTechnician}
                    >
                      <SelectTrigger id="technician">
                        <SelectValue placeholder="Selecione um técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name} ({tech.role === 'admin' ? 'Admin' : 'Técnico'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTechnician && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedTechnician('')}
                        title="Remover atribuição"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpdateTicket}
                disabled={updateLoading || (!canChangeStatus() && userRole !== 'admin')}
                className="w-full"
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Criado por</p>
                <p>{ticket.createdByName}</p>
                <p className="text-xs text-gray-500">{ticket.createdByEmail}</p>
              </div>
              <div>
                <p className="text-gray-600">Data de criação</p>
                <p>{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Última atualização</p>
                <p>{formatDate(ticket.updatedAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">ID do chamado</p>
                <p className="text-xs font-mono">{ticket.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
