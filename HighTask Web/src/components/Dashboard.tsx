import { useEffect, useState } from 'react';
import { api, Stats } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Ticket, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getStats();
      setStats(response.stats);
      
      // Show alert for high priority tickets
      if (response.stats.highPriority > 0 && response.stats.open > 0) {
        toast.warning(`Atenção: ${response.stats.highPriority} chamado(s) de alta prioridade`, {
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadStats} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total de Chamados',
      value: stats.total,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Em Aberto',
      value: stats.open,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
    },
    {
      title: 'Resolvidos',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
    },
  ];

  const priorityCards = [
    {
      title: 'Alta Prioridade',
      value: stats.highPriority,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Média Prioridade',
      value: stats.mediumPriority,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Baixa Prioridade',
      value: stats.lowPriority,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema de chamados</p>
        </div>
        <Button onClick={() => onNavigate('new-ticket')} className="bg-blue-600 hover:bg-blue-700">
          Novo Chamado
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`border-l-4 ${card.color.replace('text-', 'border-')}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-3xl mt-2">{card.value}</p>
                  </div>
                  <div className={`${card.iconBg} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority Cards */}
      <div>
        <h2 className="mb-4">Chamados por Prioridade</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityCards.map((card) => (
            <Card key={card.title} className={card.bgColor}>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-700 mb-2">{card.title}</p>
                  <p className={`text-4xl ${card.color}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chamados por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{category}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-white">Ações Rápidas</CardTitle>
          <p className="text-blue-50 text-sm">Gerencie seus chamados de forma eficiente</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => onNavigate('tickets')} className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-transform">
            Ver Todos os Chamados
          </Button>
          <Button onClick={() => onNavigate('new-ticket')} className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-all">
            Criar Novo Chamado
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
