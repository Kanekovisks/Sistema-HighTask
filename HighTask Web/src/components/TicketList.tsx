import { useEffect, useState } from 'react';
import { api, Ticket } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TicketListProps {
  onViewTicket: (ticketId: string) => void;
}

export function TicketList({ onViewTicket }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      
      const response = await api.getTickets(filters);
      setTickets(response.tickets || []);
      
      // Check for critical tickets
      const criticalTickets = (response.tickets || []).filter(
        (t: Ticket) => t.priority === 'high' && t.status === 'open'
      );
      
      if (criticalTickets.length > 0) {
        toast.warning(`${criticalTickets.length} chamado(s) crítico(s) aguardando atendimento`, {
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError(err.message || 'Erro ao carregar chamados');
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: 'secondary', label: 'Aberto' },
      'in-progress': { variant: 'default', label: 'Em Andamento' },
      resolved: { variant: 'outline', label: 'Resolvido' },
      closed: { variant: 'outline', label: 'Fechado' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
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

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div>
        <h1>Chamados</h1>
        <p className="text-gray-600 mt-1">Gerencie todos os chamados do sistema</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
          <Button onClick={loadTickets} variant="outline" className="ml-4">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhum chamado encontrado</p>
              <p className="text-sm text-gray-400">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie seu primeiro chamado para começar'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="truncate">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Categoria: {ticket.category}</span>
                      <span>Criado por: {ticket.createdByName}</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {ticket.assignedToName && (
                        <span>Atribuído: {ticket.assignedToName}</span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onViewTicket(ticket.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
