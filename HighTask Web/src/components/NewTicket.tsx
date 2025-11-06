import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Loader2, AlertCircle, Lightbulb, Upload, X, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageViewer } from './ImageViewer';

interface NewTicketProps {
  onTicketCreated: () => void;
}

export function NewTicket({ onTicketCreated }: NewTicketProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const categories = [
    'Hardware',
    'Software',
    'Rede/Conexão',
    'Acesso/Segurança',
    'Email',
    'Impressora',
    'Outros',
  ];

  const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
  ];

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = title.trim() !== '' || description.trim() !== '' || attachments.length > 0;
    setHasUnsavedChanges(hasChanges);
  }, [title, description, attachments]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleGetSuggestions = async () => {
    if (!description.trim()) {
      toast.error('Digite uma descrição primeiro');
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await api.getAISuggestions(description);
      setAiSuggestions(response.suggestions);
      
      // Auto-fill if not already set
      if (!category && response.suggestions.category) {
        setCategory(response.suggestions.category);
        toast.success('Categoria sugerida automaticamente');
      }
      if (!priority && response.suggestions.priority) {
        setPriority(response.suggestions.priority);
        toast.success('Prioridade sugerida automaticamente');
      }
    } catch (err: any) {
      console.error('Error getting AI suggestions:', err);
      toast.error('Não foi possível obter sugestões da IA');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types (only images)
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      const invalidFiles = files.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast.error('Apenas arquivos de imagem (PNG, JPEG, JPG, GIF, WEBP) são permitidos');
        return;
      }
      
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      if (totalSize > 10 * 1024 * 1024) { // 10MB limit
        toast.error('O tamanho total dos arquivos não pode exceder 10MB');
        return;
      }
      
      const newAttachments = [...attachments, ...files];
      setAttachments(newAttachments);
      
      // Generate preview URLs for images
      const newPreviewUrls: string[] = [];
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          newPreviewUrls.push(url);
        }
      });
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
      
      toast.success(`${files.length} arquivo(s) adicionado(s)`);
    }
  };

  const removeAttachment = (index: number) => {
    const file = attachments[index];
    
    // Revoke preview URL if it's an image
    if (file.type.startsWith('image/')) {
      const imageIndex = attachments.slice(0, index).filter(f => f.type.startsWith('image/')).length;
      if (imagePreviewUrls[imageIndex]) {
        URL.revokeObjectURL(imagePreviewUrls[imageIndex]);
        setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== imageIndex));
      }
    }
    
    setAttachments(attachments.filter((_, i) => i !== index));
    toast.info('Arquivo removido');
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !category || !priority) {
      setError('Por favor, preencha todos os campos obrigatórios');
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = async () => {
    setShowConfirmDialog(false);
    
    try {
      setLoading(true);
      
      // Upload attachments first
      const uploadedAttachments = [];
      if (attachments.length > 0) {
        toast.info('Fazendo upload dos anexos...');
        for (const file of attachments) {
          try {
            const reader = new FileReader();
            const fileData = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });

            const response = await api.uploadAttachment(file.name, fileData, file.type);
            uploadedAttachments.push(response.attachment);
          } catch (uploadErr: any) {
            console.error(`Error uploading ${file.name}:`, uploadErr);
            toast.error(`Erro ao enviar ${file.name}: ${uploadErr.message}`);
          }
        }
      }

      // Create ticket with attachment metadata
      await api.createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        attachments: uploadedAttachments,
      });

      // Cleanup preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('');
      setAiSuggestions(null);
      setAttachments([]);
      setImagePreviewUrls([]);
      setHasUnsavedChanges(false);

      toast.success('Chamado criado com sucesso! Você receberá atualizações por e-mail.');
      onTicketCreated();
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Erro ao criar chamado. Tente novamente.');
      toast.error(err.message || 'Erro ao criar chamado');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      onTicketCreated();
    }
  };

  const handleConfirmCancel = () => {
    // Cleanup preview URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('');
    setAiSuggestions(null);
    setAttachments([]);
    setImagePreviewUrls([]);
    setHasUnsavedChanges(false);
    setShowCancelDialog(false);
    
    onTicketCreated();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1>Novo Chamado</h1>
        <p className="text-gray-600 mt-1">Preencha os dados para abrir um novo chamado</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Chamado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Descreva brevemente o problema"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema em detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                required
                rows={5}
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetSuggestions}
                disabled={!description.trim() || loadingSuggestions}
              >
                {loadingSuggestions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Obter Sugestões IA
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory} disabled={loading}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade *</Label>
                <Select value={priority} onValueChange={setPriority} disabled={loading}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Anexos (opcional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
                <label htmlFor="attachments" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para adicionar arquivos
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Máximo 10MB total
                  </p>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {file.name} ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4">
                  <Label>Pré-visualização das Imagens</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {aiSuggestions?.possibleSolutions && aiSuggestions.possibleSolutions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Lightbulb className="h-5 w-5" />
                Sugestões da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 mb-3">
                Possíveis soluções para o problema:
              </p>
              <ul className="space-y-2">
                {aiSuggestions.possibleSolutions.map((solution: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Chamado'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Criação de Chamado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja criar este chamado? Verifique se todas as informações estão corretas antes de prosseguir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3 space-y-2 text-sm">
            <p><strong>Título:</strong> {title}</p>
            <p><strong>Categoria:</strong> {category}</p>
            <p><strong>Prioridade:</strong> {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}</p>
            {attachments.length > 0 && (
              <p><strong>Anexos:</strong> {attachments.length} arquivo(s)</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreate} disabled={loading}>
              {loading ? 'Criando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Criação de Chamado</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja cancelar? Todas as informações digitadas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer */}
      {selectedImageIndex !== null && imagePreviewUrls[selectedImageIndex] && (
        <ImageViewer
          src={imagePreviewUrls[selectedImageIndex]}
          alt={`Imagem ${selectedImageIndex + 1}`}
          open={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
}
