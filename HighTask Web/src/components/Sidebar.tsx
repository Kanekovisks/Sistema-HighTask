import { LayoutDashboard, Ticket, Plus, Users, LogOut, Menu, X, BarChart3, UserCircle } from 'lucide-react';
import { useState } from 'react';
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
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets', label: 'Chamados', icon: Ticket },
    { id: 'new-ticket', label: 'Novo Chamado', icon: Plus },
  ];

  // Only admins can manage users and view reports
  if (userRole === 'admin') {
    menuItems.push({ id: 'users', label: 'Usuários', icon: Users });
    menuItems.push({ id: 'reports', label: 'Relatórios', icon: BarChart3 });
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <h1 className="text-2xl mb-8">HighTask</h1>
          
          {userRole && (
            <button
              onClick={() => setShowProfile(true)}
              className="w-full mb-6 px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors text-left"
            >
              <p className="text-xs text-blue-200">Função</p>
              <p className="text-sm">
                {userRole === 'admin' && 'Administrador'}
                {userRole === 'technician' && 'Técnico'}
                {userRole === 'user' && 'Usuário'}
              </p>
            </button>
          )}
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-white text-blue-600'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            <span>Meu Perfil</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      {/* User Profile Dialog */}
      {user && (
        <UserProfile 
          open={showProfile} 
          onOpenChange={setShowProfile} 
          user={user} 
        />
      )}
    </>
  );
}
