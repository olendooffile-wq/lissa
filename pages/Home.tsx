
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Music, Heart, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-8 bg-[#05010d]">
      {/* Imagem de Fundo com overlay de gradiente */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-2000 ease-out"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1514525253344-9914f2e8d169?q=80&w=1920&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isVisible ? 0.35 : 0,
          filter: 'grayscale(0.3) contrast(1.1) blur(2px)',
        }}
      />
      
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#05010d] via-transparent to-[#05010d]/40 pointer-events-none"></div>

      {/* Ícones Animados */}
      <div className="absolute top-[15%] left-[10%] text-pink-500/30 animate-float z-10"><Star size={44} /></div>
      <div className="absolute bottom-[20%] right-[12%] text-purple-500/30 animate-pulse z-10"><Music size={38} /></div>
      <div className="absolute top-[40%] right-[8%] text-pink-400/20 z-10 animate-float" style={{animationDelay: '1s'}}><Heart size={55} /></div>

      <div className={`relative z-20 flex flex-col items-center transition-all duration-1000 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        <div className="relative group">
           <div className="absolute inset-0 bg-purple-600 blur-[80px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
           <h1 className="text-[5rem] font-black text-white italic relative tracking-tighter text-center leading-[0.85] drop-shadow-2xl">
              <span className="text-pink-500 inline-block hover:scale-110 transition-transform cursor-default">P</span>urple<br/>
              <span className="text-glow-purple bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Dream</span>
           </h1>
        </div>
        <p className="mt-8 text-purple-200 text-center tracking-[0.4em] uppercase text-[10px] font-black bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <Sparkles size={12} className="text-pink-400" />
          The Ultimate Fandom Hub
          <Sparkles size={12} className="text-pink-400" />
        </p>
      </div>

      <div className={`relative z-20 mt-28 w-full max-w-xs space-y-4 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <button 
          onClick={() => navigate('/login')}
          className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:brightness-110 transition-all active:scale-95 neon-purple uppercase tracking-[0.25em] shadow-[0_10px_30px_rgba(124,58,237,0.3)] btn-kpop"
        >
          Entrar
        </button>
        <button 
          onClick={() => navigate('/admin/login')}
          className="w-full py-4 rounded-[1.8rem] bg-zinc-950/40 backdrop-blur-xl border border-white/5 text-zinc-500 font-bold text-[9px] hover:text-purple-400 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.3em]"
        >
          Portal Staff
        </button>
      </div>

      <footer className="absolute bottom-8 z-20 text-zinc-600 text-[8px] tracking-[0.5em] font-black uppercase opacity-40">
        PURPLEDREAM ENTERTAINMENT © 2026
      </footer>
    </div>
  );
};

export default Home;
