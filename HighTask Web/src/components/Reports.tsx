import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileSpreadsheet, FileText, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('30');
  const [filterCategory, setFilterCategory] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [filterPeriod, filterCategory]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ticketsResponse] = await Promise.all([
        api.getStats(),
        api.getTickets({ 
          category: filterCategory !== 'all' ? filterCategory : undefined 
        })
      ]);
      
      setStats(statsResponse.stats);
      setTickets(ticketsResponse.tickets || []);
    } catch (err: any) {
      console.error('Error loading report data:', err);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      toast.info('Gerando relatório em PDF...');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Relatório HighTask', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // KPIs
      doc.setFontSize(14);
      doc.text('Métricas Gerais', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Total de Chamados: ${stats.total}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Taxa de Resolução: ${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`, 15, yPosition);
      yPosition += 7;
      doc.text(`Chamados Abertos: ${stats.open}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Alta Prioridade: ${stats.highPriority}`, 15, yPosition);
      yPosition += 15;

      // Status Distribution
      doc.setFontSize(14);
      doc.text('Distribuição por Status', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const statusData = [
        { name: 'Abertos', value: stats.open },
        { name: 'Em Andamento', value: stats.inProgress },
        { name: 'Resolvidos', value: stats.resolved },
        { name: 'Fechados', value: stats.closed },
      ];

      statusData.forEach(item => {
        const percent = stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : '0';
        doc.text(`${item.name}: ${item.value} (${percent}%)`, 15, yPosition);
        yPosition += 7;
      });
      yPosition += 8;

      // Priority Distribution
      doc.setFontSize(14);
      doc.text('Distribuição por Prioridade', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const priorityData = [
        { name: 'Alta', value: stats.highPriority },
        { name: 'Média', value: stats.mediumPriority },
        { name: 'Baixa', value: stats.lowPriority },
      ];

      const priorityTotal = priorityData.reduce((sum, item) => sum + item.value, 0);
      priorityData.forEach(item => {
        const percent = priorityTotal > 0 ? ((item.value / priorityTotal) * 100).toFixed(1) : '0';
        doc.text(`${item.name}: ${item.value} (${percent}%)`, 15, yPosition);
        yPosition += 7;
      });
      yPosition += 8;

      // Category Distribution
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Distribuição por Categoria', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      Object.entries(stats.byCategory).forEach(([name, value]: [string, any]) => {
        doc.text(`${name}: ${value}`, 15, yPosition);
        yPosition += 7;
      });

      // Save PDF
      doc.save(`relatorio-hightask-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      toast.info('Gerando relatório em Excel...');

      // Create workbook
      const wb = XLSX.utils.book_new();

      // KPIs Sheet
      const kpiData = [
        ['Métrica', 'Valor'],
        ['Total de Chamados', stats.total],
        ['Taxa de Resolução', `${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`],
        ['Chamados Abertos', stats.open],
        ['Em Andamento', stats.inProgress],
        ['Resolvidos', stats.resolved],
        ['Fechados', stats.closed],
        ['Alta Prioridade', stats.highPriority],
        ['Média Prioridade', stats.mediumPriority],
        ['Baixa Prioridade', stats.lowPriority],
      ];
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(wb, kpiSheet, 'Métricas');

      // Status Distribution Sheet
      const statusData = [
        ['Status', 'Quantidade', 'Porcentagem'],
        ['Abertos', stats.open, `${stats.total > 0 ? ((stats.open / stats.total) * 100).toFixed(1) : '0'}%`],
        ['Em Andamento', stats.inProgress, `${stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(1) : '0'}%`],
        ['Resolvidos', stats.resolved, `${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : '0'}%`],
        ['Fechados', stats.closed, `${stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(1) : '0'}%`],
      ];
      const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, statusSheet, 'Status');

      // Category Distribution Sheet
      const categoryData = [
        ['Categoria', 'Quantidade'],
        ...Object.entries(stats.byCategory).map(([name, value]) => [name, value])
      ];
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, categorySheet, 'Categorias');

      // Recent Tickets Sheet
      const ticketsData = [
        ['Título', 'Categoria', 'Prioridade', 'Status', 'Data'],
        ...tickets.slice(0, 50).map(ticket => [
          ticket.title,
          ticket.category,
          ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Média' : 'Baixa',
          ticket.status === 'open' ? 'Aberto' : ticket.status === 'in-progress' ? 'Em Andamento' : ticket.status === 'resolved' ? 'Resolvido' : 'Fechado',
          new Date(ticket.createdAt).toLocaleDateString('pt-BR')
        ])
      ];
      const ticketsSheet = XLSX.utils.aoa_to_sheet(ticketsData);
      XLSX.utils.book_append_sheet(wb, ticketsSheet, 'Chamados Recentes');

      // Save Excel
      XLSX.writeFile(wb, `relatorio-hightask-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Relatório Excel gerado com sucesso!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Erro ao gerar relatório Excel');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Status data for charts
  const statusData = [
    { name: 'Abertos', value: stats.open, color: '#f59e0b' },
    { name: 'Em Andamento', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Resolvidos', value: stats.resolved, color: '#10b981' },
    { name: 'Fechados', value: stats.closed, color: '#6b7280' },
  ];

  // Priority data
  const priorityData = [
    { name: 'Alta', value: stats.highPriority, color: '#ef4444' },
    { name: 'Média', value: stats.mediumPriority, color: '#f59e0b' },
    { name: 'Baixa', value: stats.lowPriority, color: '#10b981' },
  ];

  // Category data
  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1>Relatórios e Métricas</h1>
          <p className="text-gray-600 mt-1">Análise detalhada do desempenho do sistema</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={exportToPDF} variant="outline" className="border-gray-300" disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Exportar PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="border-gray-300" disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600 block mb-2">Período</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-gray-600 block mb-2">Categoria</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Rede/Conexão">Rede/Conexão</SelectItem>
                  <SelectItem value="Acesso/Segurança">Acesso/Segurança</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Impressora">Impressora</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Chamados</p>
                <p className="text-3xl mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Resolução</p>
                <p className="text-3xl mt-2">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chamados Abertos</p>
                <p className="text-3xl mt-2">{stats.open}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-3xl mt-2">{stats.highPriority}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} chamados`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {statusData.map((entry, index) => {
                  const total = statusData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={`legend-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg min-w-[180px]">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-gray-700">{entry.name}</div>
                        <div className="text-xs text-gray-500">{entry.value} chamados</div>
                      </div>
                      <div className="text-sm font-medium">{percent}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} chamados`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {priorityData.map((entry, index) => {
                  const total = priorityData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={`legend-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg min-w-[180px]">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-gray-700">{entry.name}</div>
                        <div className="text-xs text-gray-500">{entry.value} chamados</div>
                      </div>
                      <div className="text-sm font-medium">{percent}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Bar Chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chamados por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chamados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Prioridade</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 10).map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{ticket.title}</td>
                    <td className="p-3">{ticket.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.priority === 'high' ? 'Alta' : 
                         ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                        ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status === 'open' ? 'Aberto' :
                         ticket.status === 'in-progress' ? 'Em Andamento' :
                         ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
