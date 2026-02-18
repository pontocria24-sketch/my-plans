
import React, { useState } from 'react';
import { Rocket, Mail, Lock, ArrowRight, ShieldCheck, Loader2, Server } from 'lucide-react';
import { User, UserConfig } from '../types';
import { loginUser } from '../authService';

interface Props {
  onLoginSuccess: (user: User) => void;
  userConfig: UserConfig;
}

const Login: React.FC<Props> = ({ onLoginSuccess, userConfig }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginUser(email, password, userConfig);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Credenciais inválidas ou servidor offline.');
      }
    } catch (err) {
      setError('Erro de conexão com a VPS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/20 mb-4">
            <Rocket className="w-10 h-10 text-white -rotate-12" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
            my<span className="text-indigo-400">plans</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">Acesse sua central estratégica de produtividade.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3 text-indigo-400" /> E-mail Institucional
              </label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all placeholder:opacity-20"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3 text-indigo-400" /> Senha de Acesso
              </label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all placeholder:opacity-20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-black text-rose-500 uppercase">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-500/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <> {isLogin ? 'Conectar' : 'Registrar'} <ArrowRight className="w-5 h-5" /> </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-center gap-4 text-slate-600">
             <Server className="w-4 h-4" />
             <span className="text-[9px] font-black uppercase tracking-widest">Servidor: {userConfig.dbHost || 'Local/VPS'}</span>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          Sua conexão é criptografada de ponta a ponta.
        </p>
      </div>
    </div>
  );
};

export default Login;
