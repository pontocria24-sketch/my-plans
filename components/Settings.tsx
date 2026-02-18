
import React, { useState } from 'react';
import { UserConfig } from '../types';
import { 
  Settings as SettingsIcon, Clock, Bell, Shield, User, Save, 
  Database, Server, Lock, Globe, Key, Wifi, LogOut, CheckCircle2, XCircle, Loader2, AlertTriangle
} from 'lucide-react';

interface Props {
  userConfig: UserConfig;
  setUserConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
  onLogout?: () => void;
}

type SettingsTab = 'work' | 'profile' | 'database';

const Settings: React.FC<Props> = ({ userConfig, setUserConfig, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('database');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let finalValue: any = type === 'checkbox' ? checked : value;

    // Limpeza automática se o usuário colar "ssh root@IP"
    if (name === 'dbHost' && typeof finalValue === 'string') {
      const ipMatch = finalValue.match(/(\d{1,3}\.){3}\d{1,3}/);
      if (ipMatch) finalValue = ipMatch[0];
    }

    setUserConfig(prev => ({ 
      ...prev, 
      [name]: finalValue 
    }));
  };

  const testConnection = async () => {
    if (!userConfig.dbHost) return;
    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      // Tenta um ping na API da VPS
      const res = await fetch(`http://${userConfig.dbHost}:${userConfig.dbPort}/api/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) 
      }).catch(() => ({ ok: false }));

      setConnectionStatus(res.ok ? 'success' : 'error');
    } catch (err) {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAll = () => {
    alert('Configurações salvas localmente! Se o Host estiver correto, a sincronização iniciará em instantes.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
            <div className="p-3 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
               <SettingsIcon className="text-indigo-400 w-6 h-6" />
            </div>
            Configurações
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Gerencie sua infraestrutura e jornada de trabalho.</p>
        </div>
        <div className="flex gap-4">
          {onLogout && (
            <button 
              onClick={onLogout}
              className="bg-slate-900 hover:bg-rose-600/20 text-slate-500 hover:text-rose-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all border border-slate-800 hover:border-rose-500/30"
            >
              <LogOut className="w-5 h-5" /> Sair
            </button>
          )}
          <button 
            onClick={handleSaveAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl active:scale-95 transition-all border border-indigo-500/30"
          >
            <Save className="w-5 h-5" /> Salvar Tudo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <nav className="lg:col-span-3 space-y-2">
          {[
            { id: 'database', icon: Database, label: 'Banco de Dados' },
            { id: 'work', icon: Clock, label: 'Jornada' },
            { id: 'profile', icon: User, label: 'Perfil' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                activeTab === item.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'text-slate-500 border-transparent hover:bg-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="lg:col-span-9">
          {activeTab === 'database' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-400">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <Wifi className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Conexão VPS PostgreSQL</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sincronize com seu servidor Coolify</p>
                    </div>
                  </div>
                  
                  <button 
                    disabled={!userConfig.dbHost || testingConnection}
                    onClick={testConnection}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      connectionStatus === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                      connectionStatus === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-400' :
                      'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {testingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     connectionStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                     connectionStatus === 'error' ? <XCircle className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                    {testingConnection ? 'Testando...' : connectionStatus === 'success' ? 'Online' : connectionStatus === 'error' ? 'Falha' : 'Testar Conexão'}
                  </button>
                </div>

                {connectionStatus === 'error' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex gap-4 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-400">API Não Encontrada na VPS</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">O Banco de Dados (PostgreSQL) sozinho não aceita conexões Web. Você precisa de um servidor API (Node.js/Python) rodando na porta {userConfig.dbPort} para fazer a ponte.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Host (Somente o IP)</label>
                    <input type="text" name="dbHost" value={userConfig.dbHost || ''} onChange={handleChange} placeholder="Ex: 145.223.92.165" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Porta da API (Coolify)</label>
                    <input type="text" name="dbPort" value={userConfig.dbPort || '3000'} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuário Postgres</label>
                    <input type="text" name="dbUser" value={userConfig.dbUser || 'postgres'} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Banco</label>
                    <input type="text" name="dbName" value={userConfig.dbName || 'myplans-db'} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha de Acesso</label>
                    <input type="password" name="dbPassword" value={userConfig.dbPassword || ''} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                </div>

                <div className="pt-6 flex items-center gap-4 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
                  <input 
                    type="checkbox" 
                    name="syncEnabled" 
                    checked={userConfig.syncEnabled || false} 
                    onChange={handleChange}
                    className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Ativar Sincronização em Nuvem</p>
                    <p className="text-[10px] text-slate-500 font-medium italic">Seus dados serão enviados automaticamente para a VPS a cada alteração.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="p-10 space-y-6">
               <div className="flex items-center gap-6 bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-xl">
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black">
                    {userConfig.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{userConfig.name || 'Usuário Pro'}</h3>
                     <p className="text-slate-500 font-medium">Ecossistema de produtividade pessoal ativo.</p>
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'work' && (
            <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-xl">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Configuração de Jornada</h3>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Início do Expediente</label>
                     <input type="time" name="workStart" value={userConfig.workStart} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fim do Expediente</label>
                     <input type="time" name="workEnd" value={userConfig.workEnd} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta de Horas Líquidas</label>
                     <input type="number" name="dailyTargetHours" value={userConfig.dailyTargetHours} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold" />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
