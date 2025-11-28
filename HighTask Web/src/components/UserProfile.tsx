import { User, Mail, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UserProfile({ open, onOpenChange, user }: UserProfileProps) {
  const userRole = user?.user_metadata?.role || 'user';
  const userName = user?.user_metadata?.name || 'Usuário';
  const userEmail = user?.email || '';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'technician':
        return 'Técnico';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'technician':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'user':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>
            Informações da sua conta no HighTask
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar e Nome */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg">{userName}</h3>
              <Badge className={getRoleBadgeColor(userRole)}>
                {getRoleLabel(userRole)}
              </Badge>
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Nome completo</p>
                <p className="text-gray-900">{userName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 break-all">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-gray-100 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Função no sistema</p>
                <p className="text-gray-900">{getRoleLabel(userRole)}</p>
              </div>
            </div>
          </div>

          {/* Permissões baseadas na função */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Permissões</p>
            <ul className="space-y-1 text-sm text-gray-700">
              {userRole === 'admin' && (
                <>
                  <li>• Acesso total ao sistema</li>
                  <li>• Gerenciar usuários</li>
                  <li>• Visualizar relatórios</li>
                  <li>• Atribuir chamados</li>
                  <li>• Criar e editar todos os chamados</li>
                </>
              )}
              {userRole === 'technician' && (
                <>
                  <li>• Criar e editar próprios chamados</li>
                  <li>• Visualizar chamados atribuídos</li>
                  <li>• Alterar status de chamados</li>
                </>
              )}
              {userRole === 'user' && (
                <>
                  <li>• Criar novos chamados</li>
                  <li>• Editar próprios chamados</li>
                  <li>• Visualizar próprios chamados</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
