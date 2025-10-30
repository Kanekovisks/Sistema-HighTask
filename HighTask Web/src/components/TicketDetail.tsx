import { useEffect, useState } from 'react';
import { api, Ticket, TimelineEntry } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ArrowLeft, MessageSquare, Clock, User, Star, CheckCircle, AlertCircle, Upload, Eye, FileImage, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Breadcrumbs } from './Breadcrumbs';
import { ImageViewer } from './ImageViewer';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  useEffect(() => {
    loadTicketAndTechnicians();
    
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [ticketId]);

  const loadTicketAndTechnicians = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ticketResponse, techResponse] = await Promise.all([
        api.getTicket(ticketId),
        api.getTechnicians().catch(() => ({ users: [] }))
      ]);
      
      setTicket(ticketResponse.ticket);
      setTechnicians(techResponse.users || []);
      
      // Load attachments if ticket has any
      if (ticketResponse.ticket.attachments && ticketResponse.ticket.attachments.length > 0) {
        loadAttachments();
      }
    } catch (err: any) {
      console.error('Error loading ticket:', err);
      setError(err.message || 'Erro ao carregar chamado');
    } finally {
      setLoading(false);
    }
  };

  const loadAttachments = async () => {
    try {
      setLoadingAttachments(true);
      const response = await api.getTicketAttachments(ticketId);
      setAttachments(response.attachments || []);
    } catch (err: any) {
      console.error('Error loading attachments:', err);
      toast.error('Erro ao carregar anexos');
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    try {
      setSubmitting(true);
      await api.addComment(ticketId, comment);
      setComment('');
      await loadTicketAndTechnicians();
      toast.success('Comentário adicionado com sucesso');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      toast.error(err.message || 'Erro ao adicionar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;

    // Prevent closing without validation if admin/technician
    if (newStatus === 'closed' && (isAdmin || isTechnician)) {
      setShowCloseDialog(true);
      return;
    }

    try {
      await api.updateTicket(ticketId, { status: newStatus as any });
      await loadTicketAndTechnicians();
      toast.success('Status atualizado com sucesso');
      
      // Show rating dialog if user is closing their own ticket
      if (newStatus === 'closed' && !isAdmin && !isTechnician) {
        setShowRatingDialog(true);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Erro ao atualizar status');
    }
  };

  const handleConfirmClose = async () => {
    if (!ticket) return;

    try {
      await api.updateTicket(ticketId, { status: 'closed' as any });
      setShowCloseDialog(false);
      await loadTicketAndTechnicians();
      toast.success('Chamado fechado com sucesso');
    } catch (err: any) {
      console.error('Error closing ticket:', err);
      toast.error(err.message || 'Erro ao fechar chamado');
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Selecione uma avaliação');
      return;
    }

    try {
      // Implementação seria feita no backend
      toast.success('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
      setShowRatingDialog(false);
      setRating(0);
      setRatingComment('');
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      toast.error(err.message || 'Erro ao enviar avaliação');
    }
  };

  const handleAssignChange = async (userId: string) => {
    if (!ticket) return;

    try {
      await api.updateTicket(ticketId, { assignedTo: userId === 'unassigned' ? null : userId });
      await loadTicketAndTechnicians();
      toast.success('Chamado atribuído com sucesso');
    } catch (err: any) {
      console.error('Error assigning ticket:', err);
      toast.error(err.message || 'Erro ao atribuir chamado');
    }
  };

  const handleRequestInfo = () => {
    setComment('Preciso de informações adicionais: ');
    toast.info('Adicione sua solicitação no campo de comentários');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: 'secondary', label: 'Aberto' },
      'in-progress': { variant: 'default', label: 'Em Andamento' },
      resolved: { variant: 'outline', label: 'Resolvido' },
      closed: { variant: 'outline', label: 'Fechado' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { className: string; label: string }> = {
      high: { className: 'bg-red-100 text-red-700', label: 'Alta' },
      medium: { className: 'bg-yellow-100 text-yellow-700', label: 'Média' },
      low: { className: 'bg-green-100 text-green-700', label: 'Baixa' },
    };
    const { className, label } = config[priority] || { className: '', label: priority };
    return <Badge className={className}>{label}</Badge>;
  };

  const isAdmin = user?.user_metadata?.role === 'admin';
  const isTechnician = user?.user_metadata?.role === 'technician';
  const canEdit = isAdmin || isTechnician;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Chamado não encontrado'}</p>
        <Button onClick={onBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Chamados', onClick: onBack },
          { label: ticket.title }
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle>{ticket.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="mb-2">Descrição</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments / Images */}
          <div>
            <h3 className="mb-3 flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Anexos
            </h3>
            
            {loadingAttachments ? (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Carregando anexos...</p>
              </div>
            ) : attachments.length === 0 ? (
              // No attachments - Show message
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Sem anexos</p>
                <p className="text-sm text-gray-500 mt-1">Este chamado não possui arquivos anexados</p>
              </div>
            ) : (
              // Has attachments - Show gallery
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {attachments.map((attachment, index) => (
                  <div key={attachment.id} className="space-y-2">
                    <div 
                      className="relative group cursor-pointer" 
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-colors">
                        {attachment.url ? (
                          <img
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 text-center truncate" title={attachment.fileName}>
                      {attachment.fileName}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={async () => {
                        try {
                          const userIdMatch = attachment.filePath.match(/^([^/]+)\//);
                          const userId = userIdMatch ? userIdMatch[1] : '';
                          const response = await api.downloadAttachment(userId, attachment.id);
                          window.open(response.downloadUrl, '_blank');
                          toast.success('Download iniciado');
                        } catch (err: any) {
                          console.error('Error downloading attachment:', err);
                          toast.error('Erro ao baixar anexo');
                        }
                      }}
                    >
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Criado por</p>
              <p>{ticket.createdByName || ticket.createdByEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data de Criação</p>
              <p>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Atribuído a</p>
              <p>{ticket.assignedToName || 'Não atribuído'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Atualização</p>
              <p>{new Date(ticket.updatedAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Actions (Admin/Technician only) */}
          {canEdit && (
            <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-gray-600 block mb-2">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
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

              {isAdmin && (
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-gray-600 block mb-2">Atribuir a</label>
                  <Select 
                    value={ticket.assignedTo || 'unassigned'} 
                    onValueChange={handleAssignChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Não atribuído</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name || tech.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {ticket.timeline && ticket.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.timeline.map((entry: TimelineEntry) => (
                <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {entry.action === 'comment' ? (
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{entry.userName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-600">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Adicionar Comentário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Digite seu comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Button onClick={handleAddComment} disabled={submitting || !comment.trim()}>
              {submitting ? 'Enviando...' : 'Adicionar Comentário'}
            </Button>
            {canEdit && (
              <Button onClick={handleRequestInfo} variant="outline">
                Solicitar Informações
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Close Ticket Confirmation Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Fechamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja fechar este chamado? Certifique-se de que o problema foi resolvido e validado pelo usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Confirmar Fechamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog */}
      <AlertDialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Avalie o Atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Como você avalia a resolução do seu chamado?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Deixe um comentário sobre o atendimento (opcional)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRating(0);
              setRatingComment('');
            }}>
              Pular
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitRating}>
              Enviar Avaliação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer */}
      {selectedImageIndex !== null && attachments[selectedImageIndex]?.url && (
        <ImageViewer
          src={attachments[selectedImageIndex].url}
          alt={attachments[selectedImageIndex].fileName}
          open={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
}
