
import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { User, Coupon, Wristband, NewsItem, MenuItem } from '../types';
import { supabase } from '../supabase';
import { GoogleGenAI } from "@google/genai";
import { 
  Ticket, Newspaper, QrCode, MessageCircle, 
  X, Zap, Coffee, Instagram, Star, ArrowRight, Sparkles, ExternalLink, Code2, Heart, Clock, Calendar, ArrowLeft, Send, Bot, Info
} from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wristbands, setWristbands] = useState<Wristband[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [activationError, setActivationError] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activatedCoupon, setActivatedCoupon] = useState<Coupon | null>(null);
  const [activationTime, setActivationTime] = useState<{date: string, time: string} | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef<number | null>(null);

  // AI Assistant State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    {role: 'bot', text: 'Annyeonghaseyo, fã número 1! 💜 Eu sou a Purple AI. Como posso tornar seu dia mais mágico hoje?'}
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      fetchInitialData(u.id);
      setupRealtime(u.id);
    }
  }, []);

  const fetchInitialData = async (userId: string) => {
    const [cRes, wRes, nRes, mRes] = await Promise.all([
      supabase.from('coupons').select('*').eq('client_id', userId),
      supabase.from('wristbands').select('*').eq('client_id', userId),
      supabase.from('news').select('*').order('created_at', { ascending: false }),
      supabase.from('menu').select('*').order('created_at', { ascending: false })
    ]);

    if (cRes.data) setCoupons(cRes.data);
    if (wRes.data) setWristbands(wRes.data);
    if (nRes.data) setNews(nRes.data);
    if (mRes.data) setMenu(mRes.data);
  };

  const setupRealtime = (userId: string) => {
    const channel = supabase
      .channel('client-dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons', filter: `client_id=eq.${userId}` }, 
        payload => {
          if (payload.eventType === 'INSERT') setCoupons(prev => [payload.new as Coupon, ...prev]);
          if (payload.eventType === 'UPDATE') setCoupons(prev => prev.map(c => c.id === payload.new.id ? payload.new as Coupon : c));
          if (payload.eventType === 'DELETE') setCoupons(prev => prev.filter(c => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const handleAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      // Fix: Follow GoogleGenAI guidelines: use process.env.API_KEY directly without fallbacks
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: { 
          systemInstruction: "Você é a Purple AI, a assistente ultra-fofa e eficiente do fã-clube PurpleDream. Use muitos emojis, termos coreanos ocasionais (Daebak, Kamsahamnida, Saranghae) e ajude os fãs com informações sobre o app. Seja amigável e entusiasmada!" 
        }
      });
      
      const text = response.text; // Acessa como propriedade, não método
      setAiMessages(prev => [...prev, {role: 'bot', text: text || "Minha conexão com a galáxia falhou! Tente novamente, hwaiting!"}]);
    } catch (err) {
      console.error("Erro na Purple AI:", err);
      setAiMessages(prev => [...prev, {role: 'bot', text: "O sinal está instável no momento, mas saiba que seu apoio é o que nos move!"}]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (showReceipt && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowReceipt(false);
          return 0;
        }
        return prev - 1;
      }), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showReceipt]);

  const handleActivateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isActivating || !user || !couponCodeInput) return;
    setIsActivating(true);
    setActivationError('');
    const cleanCode = couponCodeInput.trim().toUpperCase();
    const targetCoupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!targetCoupon) {
      setActivationError('CÓDIGO INVÁLIDO.');
      setIsActivating(false);
      return;
    }
    if (targetCoupon.status !== 'active') {
      setActivationError('ESTE MIMO JÁ FOI UTILIZADO.');
      setIsActivating(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.from('coupons').update({ status: 'expired' }).eq('id', targetCoupon.id);
      if (updateError) throw updateError;

      const now = new Date();
      setActivationTime({
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
      setActivatedCoupon(targetCoupon);
      setTimeLeft(600);
      setIsActivateModalOpen(false);
      setShowReceipt(true);
      setCouponCodeInput('');
    } catch (err: any) {
      setActivationError('ERRO AO PROCESSAR.');
    } finally {
      setIsActivating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <Layout title="Premium Experience">
      {/* Welcome Header */}
      <section id="home-section" className="mb-10 px-1">
        <div className="relative p-8 rounded-[3.5rem] bg-gradient-to-br from-[#1e0b4a] to-black border border-white/10 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative group">
              <img src={user.photo} className="w-24 h-24 rounded-[2.2rem] border-2 border-white/20 object-cover relative shadow-lg" />
              <div className="absolute -top-3 -right-3 bg-gradient-to-tr from-pink-500 to-purple-500 p-2.5 rounded-2xl">
                <Star size={16} fill="white" className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.5em] italic flex items-center gap-2">
                <Sparkles size={10} /> VIP FANDOM
              </span>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mt-1">{user.name.split(' ')[0]}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Action */}
      <section className="mb-16 px-1">
        <button 
          onClick={() => setIsActivateModalOpen(true)} 
          className="w-full py-8 bg-white text-black rounded-[2.5rem] flex items-center justify-center gap-5 font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl active:scale-95 transition-all btn-kpop"
        >
          <Ticket size={24} className="animate-bounce" /> Resgatar no Balcão
        </button>
      </section>

      {/* Dynamic Content Grid */}
      <div className="space-y-20 pb-12">
        {/* Cupons */}
        <section id="coupons-section" className="px-1">
          <div className="flex justify-between items-end mb-10">
            <h3 className="font-black text-[12px] uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
              <div className="w-10 h-[2px] bg-pink-500 rounded-full"></div> Meus Cupons
            </h3>
            <span className="text-[10px] font-black text-pink-500 uppercase">
              {coupons.filter(c => c.status === 'active').length} Ativos
            </span>
          </div>
          <div className="space-y-6">
            {coupons.length > 0 ? coupons.map(c => (
              <div key={c.id} className={`p-10 rounded-[4rem] border transition-all duration-500 glass-card group ${c.status === 'active' ? 'border-purple-500/30' : 'opacity-25 grayscale'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-4xl font-black italic text-pink-500 uppercase leading-none mb-3">{c.discount}</h4>
                    <p className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-widest">{c.code}</p>
                  </div>
                  <div className={`px-6 py-3 rounded-3xl text-[9px] font-black uppercase tracking-widest ${c.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-600'}`}>
                    {c.status === 'active' ? 'ATIVO' : 'USADO'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center border-2 border-dashed border-zinc-900 rounded-[4rem]">
                <p className="text-[10px] font-black uppercase text-zinc-700 italic">Mimos em breve...</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Controls */}
      <div className="fixed bottom-28 right-6 flex flex-col gap-5 z-[80]">
        <button onClick={() => setIsAiOpen(true)} className="bg-purple-600 p-6 rounded-[2.2rem] shadow-xl text-white active:scale-90 transition-all border-4 border-black">
          <Bot size={28} />
        </button>
      </div>

      {/* AI Assistant */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0515] w-full max-w-sm rounded-[3.5rem] border border-white/10 flex flex-col h-[75vh] shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-600 rounded-[1.8rem] flex items-center justify-center">
                   <Bot size={28} className="text-white" />
                </div>
                <h4 className="text-[14px] font-black text-white uppercase italic">Purple AI</h4>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-zinc-600 p-3"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {aiMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-[13px] ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-zinc-900 text-zinc-200 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiLoading && <div className="text-zinc-600 text-[10px] animate-pulse">Purple AI está pensando...</div>}
            </div>
            <div className="p-8 border-t border-white/5">
              <div className="flex gap-3">
                <input 
                  value={aiInput} onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiMessage()}
                  placeholder="Diga annyeong..." 
                  className="flex-1 bg-zinc-900 rounded-3xl px-6 py-4 text-white focus:outline-none"
                />
                <button onClick={handleAiMessage} className="bg-purple-600 p-5 rounded-3xl text-white"><Send size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && activatedCoupon && activationTime && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
          <div className="bg-white text-black w-full max-w-sm rounded-[4rem] overflow-hidden flex flex-col">
            <div className="bg-purple-600 p-12 text-white text-center border-b-[10px] border-dashed border-white">
               <h2 className="text-4xl font-black italic uppercase">PurpleDream</h2>
               <p className="text-[11px] font-black mt-4 opacity-70 tracking-widest">RESGATE CONFIRMADO</p>
            </div>
            <div className="p-12 space-y-10 text-center">
              <div className="bg-zinc-50 py-8 rounded-[2.5rem]">
                <p className="text-[12px] font-black text-zinc-400 uppercase mb-3">Expira em</p>
                <span className="text-6xl font-black font-mono text-purple-600">{formatTime(timeLeft)}</span>
              </div>
              <div className="space-y-4">
                 <p className="text-4xl font-black text-zinc-950 uppercase italic leading-none">{activatedCoupon.discount}</p>
                 <p className="text-[12px] text-zinc-400 font-bold uppercase">{activationTime.date} • {activationTime.time}</p>
              </div>
            </div>
            <div className="p-8 pt-0">
               <button onClick={() => setShowReceipt(false)} className="w-full py-7 bg-zinc-950 text-white rounded-[2.2rem] font-black uppercase text-[11px]">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {isActivateModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0a0515] w-full max-w-sm rounded-[4rem] border border-white/10 p-12">
            <h3 className="text-2xl font-black uppercase italic text-white text-center mb-10">Validar Cupom</h3>
            <input 
              type="text" value={couponCodeInput} 
              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
              className="w-full bg-black border-2 border-zinc-800 rounded-[2.5rem] py-8 text-center text-4xl font-black text-pink-500 focus:border-pink-500 outline-none mb-8"
              placeholder="XXXX"
              maxLength={8}
            />
            {activationError && <p className="text-red-500 text-[9px] font-black text-center mb-8 uppercase tracking-widest">{activationError}</p>}
            <button 
              onClick={handleActivateCoupon} 
              disabled={isActivating || !couponCodeInput} 
              className="w-full py-8 rounded-[2.5rem] bg-pink-600 text-white font-black uppercase text-[12px] neon-pink active:scale-95 transition-all"
            >
              {isActivating ? 'Validando...' : 'Confirmar'}
            </button>
            <button onClick={() => setIsActivateModalOpen(false)} className="w-full mt-6 text-[10px] font-black uppercase text-zinc-600">Voltar</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClientDashboard;
