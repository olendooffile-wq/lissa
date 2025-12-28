
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, User, Bell, Menu as MenuIcon, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  role?: 'admin' | 'client';
}

const Layout: React.FC<LayoutProps> = ({ children, title, role = 'client' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/client/dashboard') {
      navigate('/client/dashboard');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-24">
      <header className="p-6 flex justify-between items-center bg-zinc-950 border-b border-purple-500/10 sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black text-glow-purple flex items-center gap-2">
            <span className="text-pink-500 italic">P</span>urpleDream
            <span className="text-[9px] bg-pink-600/20 text-pink-400 px-2 py-0.5 rounded-md border border-pink-500/30 font-bold ml-1">V2</span>
            {role === 'admin' && <span className="text-[10px] bg-purple-600 px-3 py-1 rounded-full uppercase ml-1 font-black">Admin</span>}
          </h1>
          {title && <p className="text-[9px] text-zinc-500 mt-0.5 font-bold uppercase tracking-widest">{title}</p>}
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-pink-400 transition-all active:scale-90"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {children}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-2xl border-t border-purple-500/10 px-6 py-4 flex justify-around items-center z-50">
        {role === 'client' ? (
          <>
            <button onClick={() => scrollToSection('home-section')} className="flex flex-col items-center gap-1 text-purple-400 group">
              <div className="p-2 rounded-xl group-active:bg-purple-500/10 transition-all"><Home size={22} /></div>
              <span className="text-[8px] uppercase font-black tracking-tighter">Home</span>
            </button>
            <button onClick={() => scrollToSection('news-section')} className="flex flex-col items-center gap-1 text-zinc-500 group">
              <div className="p-2 rounded-xl group-active:bg-pink-500/10 transition-all"><Bell size={22} /></div>
              <span className="text-[8px] uppercase font-black tracking-tighter">News</span>
            </button>
            <button onClick={() => scrollToSection('menu-section')} className="flex flex-col items-center gap-1 text-zinc-500 group">
              <div className="p-2 rounded-xl group-active:bg-pink-500/10 transition-all"><MenuIcon size={22} /></div>
              <span className="text-[8px] uppercase font-black tracking-tighter">Menu</span>
            </button>
            <button onClick={() => scrollToSection('coupons-section')} className="flex flex-col items-center gap-1 text-zinc-500 group">
              <div className="p-2 rounded-xl group-active:bg-pink-500/10 transition-all"><Shield size={22} /></div>
              <span className="text-[8px] uppercase font-black tracking-tighter">Pass</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1 text-purple-400">
              <Shield size={24} />
              <span className="text-[10px] uppercase font-black tracking-tighter">Painel</span>
            </button>
            <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center gap-1 text-zinc-500">
              <User size={24} />
              <span className="text-[10px] uppercase font-black tracking-tighter">Gerenciar</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Layout;
