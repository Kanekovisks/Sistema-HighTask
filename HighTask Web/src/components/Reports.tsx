import { useState, useEffect } from 'react';
import { Calendar, Download, FileText, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReportsData {
  total: number;
  byStatus: {
    open: number;
    'in-progress': number;
    resolved: number;
    closed: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<string, number>;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

const STATUS_COLORS = {
  open: '#3b82f6',
  'in-progress': '#f59e0b',
  resolved: '#10b981',
  closed: '#6b7280',
};

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

const STATUS_LABELS = {
  open: 'Aberto',
  'in-progress': 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export function Reports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      let url = `https://${projectId}.supabase.co/functions/v1/make-server-194bf14c/reports`;
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareStatusData = () => {
    if (!data) return [];
    return Object.entries(data.byStatus).map(([key, value]) => ({
      name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
      value,
      color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
    }));
  };

  const preparePriorityData = () => {
    if (!data) return [];
    return Object.entries(data.byPriority).map(([key, value]) => ({
      name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
      value,
      color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS],
    }));
  };

  const prepareCategoryData = () => {
    if (!data) return [];
    return Object.entries(data.byCategory).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const downloadPDF = async () => {
    try {
      // Dynamic import for jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('Relatório de Chamados - HighTask', 20, 20);

      // Date range
      doc.setFontSize(12);
      if (startDate || endDate) {
        const dateText = `Período: ${startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Início'} até ${endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Hoje'}`;
        doc.text(dateText, 20, 30);
      }

      // Total
      doc.setFontSize(14);
      doc.text(`Total de Chamados: ${data?.total || 0}`, 20, 45);

      // Status
      doc.setFontSize(12);
      doc.text('Por Status:', 20, 60);
      let yPos = 70;
      prepareStatusData().forEach(item => {
        doc.text(`  ${item.name}: ${item.value}`, 25, yPos);
        yPos += 7;
      });

      // Priority
      yPos += 5;
      doc.text('Por Prioridade:', 20, yPos);
      yPos += 10;
      preparePriorityData().forEach(item => {
        doc.text(`  ${item.name}: ${item.value}`, 25, yPos);
        yPos += 7;
      });

      // Category
      yPos += 5;
      doc.text('Por Categoria:', 20, yPos);
      yPos += 10;
      prepareCategoryData().forEach(item => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`  ${item.name}: ${item.value}`, 25, yPos);
        yPos += 7;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
          20,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save(`relatorio-chamados-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const downloadExcel = async () => {
    try {
      // Dynamic import for xlsx
      const XLSX = await import('xlsx');

      // Prepare data for Excel
      const statusData = prepareStatusData().map(item => ({
        'Status': item.name,
        'Quantidade': item.value,
      }));

      const priorityData = preparePriorityData().map(item => ({
        'Prioridade': item.name,
        'Quantidade': item.value,
      }));

      const categoryData = prepareCategoryData().map(item => ({
        'Categoria': item.name,
        'Quantidade': item.value,
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['Relatório de Chamados - HighTask'],
        [''],
        ['Período', startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Início', 'até', endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Hoje'],
        ['Total de Chamados', data?.total || 0],
        [''],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

      // Status sheet
      const wsStatus = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, wsStatus, 'Por Status');

      // Priority sheet
      const wsPriority = XLSX.utils.json_to_sheet(priorityData);
      XLSX.utils.book_append_sheet(wb, wsPriority, 'Por Prioridade');

      // Category sheet
      const wsCategory = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, wsCategory, 'Por Categoria');

      // Save file
      XLSX.writeFile(wb, `relatorio-chamados-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Erro ao gerar Excel. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl mb-2">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada dos chamados técnicos</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={downloadExcel} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filtrar por Período
          </CardTitle>
          <CardDescription>
            Selecione o período para análise dos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm mb-2 block">Data Inicial</label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm mb-2 block">Data Final</label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl mb-2">{data?.total || 0}</div>
          <p className="text-gray-600">Total de chamados no período</p>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Chamados por Status</CardTitle>
            <CardDescription>Distribuição por situação atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepareStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Chamados por Prioridade</CardTitle>
            <CardDescription>Distribuição por nível de urgência</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={preparePriorityData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {preparePriorityData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Chart - Full Width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chamados por Categoria</CardTitle>
            <CardDescription>Distribuição por tipo de problema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareCategoryData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Table */}
        <Card>
          <CardHeader>
            <CardTitle>Por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prepareStatusData().map((item) => (
                <div key={item.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Table */}
        <Card>
          <CardHeader>
            <CardTitle>Por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {preparePriorityData().map((item) => (
                <div key={item.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Table */}
        <Card>
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {prepareCategoryData().map((item) => (
                <div key={item.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
