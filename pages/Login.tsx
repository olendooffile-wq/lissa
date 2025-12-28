
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User as UserIcon, Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { ADMIN_USER } from '../constants';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname.includes('admin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdminLogin) {
        if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
          localStorage.setItem('currentUser', JSON.stringify(ADMIN_USER));
          navigate('/admin/dashboard');
        } else {
          setError('Credenciais administrativas inválidas.');
        }
      } else {
        const { data: user, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (dbError) {
          if (dbError.message.includes('API key') || dbError.code === 'PGRST301') {
            setError('Erro de Configuração: Chave de API inválida no servidor.');
          } else {
            setError('Login falhou. Verifique se o admin já criou sua conta.');
          }
        } else if (!user) {
          setError('Usuário não encontrado ou senha incorreta.');
        } else {
          localStorage.setItem('currentUser', JSON.stringify(user));
          navigate('/client/dashboard');
        }
      }
    } catch (err: any) {
      setError('Falha na conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"></div>
      
      <button onClick={() => navigate('/')} className="absolute top-10 left-8 text-zinc-500 hover:text-white flex items-center gap-2">
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-white italic">
            <span className="text-pink-500">P</span>urpleDream
          </h2>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-bold">
            {isAdminLogin ? 'Acesso Administrativo' : 'Portal do Fã'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="password" 
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-red-500 text-[9px] uppercase font-black tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2 neon-purple disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
          </button>
        </form>

        {!isAdminLogin && (
            <p className="mt-8 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest italic">
              Seu acesso deve ser solicitado ao administrador
            </p>
        )}
      </div>
    </div>
  );
};

export default Login;
