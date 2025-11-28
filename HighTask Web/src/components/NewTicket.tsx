import { useState, useEffect } from 'react';
import { api, AISuggestion } from '../utils/api';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
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

interface NewTicketProps {
  onTicketCreated: () => void;
  onNavigateAway?: () => void;
}

export function NewTicket({ onTicketCreated, onNavigateAway }: NewTicketProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(title.trim() !== '' || description.trim() !== '');
  }, [title, description]);

  const categories = [
    'Hardware',
    'Software',
    'Rede/Conexão',
    'Acesso/Segurança',
    'Impressoras',
    'Email',
    'Outros',
  ];

  const handleGetAISuggestions = async () => {
    if (!description.trim()) {
      return;
    }

    try {
      setAiLoading(true);
      const result = await api.getAISuggestions(description);
      setAiSuggestions(result.suggestions);
      
      // Auto-apply suggestions
      if (result.suggestions.category) {
        setCategory(result.suggestions.category);
      }
      if (result.suggestions.priority) {
        setPriority(result.suggestions.priority);
      }
    } catch (err: any) {
      console.error('Error getting AI suggestions:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setShowSubmitConfirm(false);

    try {
      await api.createTicket({
        title,
        description,
        category,
        priority,
      });

      setSuccess(true);
      setHasUnsavedChanges(false);
      setTitle('');
      setDescription('');
      setCategory('Hardware');
      setPriority('medium');
      setAiSuggestions(null);

      setTimeout(() => {
        onTicketCreated();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl mb-6">Novo Chamado</h2>

      <form onSubmit={handleSubmitClick} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm mb-2 text-gray-700">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva brevemente o problema"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-gray-700">Descrição</label>
            <button
              type="button"
              onClick={handleGetAISuggestions}
              disabled={aiLoading || !description.trim()}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Obter Sugestões IA
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
            placeholder="Descreva o problema em detalhes..."
            required
          />
        </div>

        {aiSuggestions && aiSuggestions.possibleSolutions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm text-blue-900">Possíveis Soluções Sugeridas pela IA</h3>
            </div>
            <ul className="space-y-2">
              {aiSuggestions.possibleSolutions.map((solution, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
            Chamado criado com sucesso! Redirecionando...
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Criar Chamado
          </button>
        </div>
      </form>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar criação do chamado</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja finalizar a criação deste chamado? Verifique se todas as informações estão corretas antes de confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Sim, criar chamado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
