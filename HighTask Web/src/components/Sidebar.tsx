import { Home, Ticket, Plus, Users, LogOut, Menu, X, BarChart3, HelpCircle, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { UserProfile } from './UserProfile';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userRole?: string;
  user?: any;
}

export function Sidebar({ currentPage, onNavigate, onLogout, userRole, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, tooltip: 'Visão geral do sistema' },
    { id: 'tickets', label: 'Chamados', icon: Ticket, tooltip: 'Visualizar todos os chamados' },
    { id: 'new-ticket', label: 'Novo Chamado', icon: Plus, tooltip: 'Criar um novo chamado' },
  ];

  if (userRole === 'admin') {
    menuItems.push(
      { id: 'reports', label: 'Relatórios', icon: BarChart3, tooltip: 'Relatórios e métricas' },
      { id: 'users', label: 'Usuários', icon: Users, tooltip: 'Gerenciar usuários' }
    );
  }

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-blue-600 z-40
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-blue-500">
            <h1 className="text-white">HighTask</h1>
            {userRole && (
              <p className="text-xs text-blue-100 mt-1">
                Perfil: {userRole === 'admin' && 'Administrador'}
                {userRole === 'technician' && 'Técnico'}
                {userRole === 'user' && 'Usuário'}
              </p>
            )}
          </div>

          {/* Navigation */}
          <TooltipProvider>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleNavigate(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                          ${
                            isActive
                              ? 'bg-white text-blue-600'
                              : 'text-white hover:bg-blue-500'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>

          {/* Footer */}
          <div className="p-4 border-t border-blue-500 space-y-2">
            {/* User Profile Button */}
            {user && (
              <button
                onClick={() => setShowProfile(true)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-blue-500 transition-colors"
              >
                <Avatar className="h-10 w-10 border-2 border-blue-400">
                  <AvatarImage src="" alt={user.name || user.email} />
                  <AvatarFallback className="bg-white text-blue-600 text-sm">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                  <p className="text-xs text-blue-200 truncate">Ver perfil</p>
                </div>
              </button>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500 hover:text-white"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do sistema? Todas as alterações não salvas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Profile Dialog */}
      {user && (
        <UserProfile
          open={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
        />
      )}
    </>
  );
}
