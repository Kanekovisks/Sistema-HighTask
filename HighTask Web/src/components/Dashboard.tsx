import { useEffect, useState } from 'react';
import { api, Stats } from '../utils/api';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Ticket } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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
      const result = await api.getStats();
      setStats(result.stats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Erro ao carregar estatísticas: {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total de Chamados',
      value: stats.total,
      icon: Ticket,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Em Aberto',
      value: stats.open,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Resolvidos',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Dashboard</h2>
        <button
          onClick={() => onNavigate('new-ticket')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Novo Chamado
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{card.title}</p>
              <p className="text-3xl">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Priority Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg mb-4">Chamados por Prioridade</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Alta Prioridade</p>
            <p className="text-2xl text-red-600">{stats.highPriority}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Média Prioridade</p>
            <p className="text-2xl text-yellow-600">{stats.mediumPriority}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Baixa Prioridade</p>
            <p className="text-2xl text-green-600">{stats.lowPriority}</p>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg mb-4">Chamados por Categoria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <span className="text-gray-700">{category}</span>
                <span className="text-xl">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <h3 className="text-lg mb-2">Ações Rápidas</h3>
        <p className="text-blue-100 mb-4">Gerencie seus chamados de forma eficiente</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('tickets')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Ver Todos os Chamados
          </button>
          <button
            onClick={() => onNavigate('new-ticket')}
            className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            Criar Novo Chamado
          </button>
        </div>
      </div>
    </div>
  );
}
