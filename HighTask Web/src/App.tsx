import { useEffect, useState } from 'react';
import { createClient } from './utils/supabase/client';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { NewTicket } from './components/NewTicket';
import { TicketDetail } from './components/TicketDetail';
import { UserManagement } from './components/UserManagement';
import { Reports } from './components/Reports';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('user', JSON.stringify(session.user));
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        // Check localStorage as fallback
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (accessToken: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedTicketId(null);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedTicketId(null);
  };

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentPage('ticket-detail');
  };

  const handleTicketCreated = () => {
    setCurrentPage('tickets');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" richColors />
      
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userRole={user?.user_metadata?.role}
        user={{
          id: user?.id,
          email: user?.email,
          name: user?.user_metadata?.name,
          role: user?.user_metadata?.role,
          createdAt: user?.created_at,
        }}
      />

      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          
          {currentPage === 'tickets' && <TicketList onViewTicket={handleViewTicket} />}
          
          {currentPage === 'new-ticket' && <NewTicket onTicketCreated={handleTicketCreated} />}
          
          {currentPage === 'ticket-detail' && selectedTicketId && (
            <TicketDetail
              ticketId={selectedTicketId}
              onBack={() => setCurrentPage('tickets')}
            />
          )}
          
          {currentPage === 'users' && <UserManagement />}
          
          {currentPage === 'reports' && <Reports />}
        </div>
      </main>
    </div>
  );
}
