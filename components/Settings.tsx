
import React, { useState, useRef } from 'react';
import { UserConfig } from '../types';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Bell, 
  Shield, 
  User, 
  Save, 
  Calendar, 
  Coffee, 
  Utensils, 
  Check, 
  Camera, 
  Key, 
  Mail, 
  Lock, 
  Globe,
  ArrowRight
} from 'lucide-react';

interface Props {
  userConfig: UserConfig;
  setUserConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
}

type SettingsTab = 'work' | 'profile' | 'notify' | 'integrations' | 'security';

const Settings: React.FC<Props> = ({ userConfig, setUserConfig }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('work');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados temporários para senha (não salvos no userConfig global por segurança)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const days = [
    { id: 1, label: 'Seg' },
    { id: 2, label: 'Ter' },
    { id: 3, label: 'Qua' },
    { id: 4, label: 'Qui' },
    { id: 5, label: 'Sex' },
    { id: 6, label: 'Sáb' },
    { id: 0, label: 'Dom' },
  ];

  const toggleDay = (dayId: number) => {
    const currentDays = userConfig.workingDays || [1, 2, 3, 4, 5];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId];
    setUserConfig(prev => ({ ...prev, workingDays: newDays }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserConfig(prev => ({ 
      ...prev, 
      [name]: (name === 'dailyTargetHours' || name === 'lunchDuration' || name === 'coffeeDuration') 
        ? parseFloat(value) 
        : value 
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserConfig(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    // Aqui você faria a chamada para sua VPS
    console.log('Dados salvos no LocalStorage e prontos para VPS:', userConfig);
    if (passwords.new && passwords.new === passwords.confirm) {
      console.log('Senha alterada com sucesso!');
      setPasswords({ current: '', new: '', confirm: '' });
    }
    alert('Configurações salvas com sucesso no ecossistema!');
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
          <p className="text-slate-500 mt-2 font-medium">Personalize seu ambiente de alta performance.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 border border-indigo-500/30"
        >
          <Save className="w-5 h-5" /> Salvar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar de Navegação */}
        <nav className="lg:col-span-3 space-y-2">
          {[
            { id: 'work', icon: Clock, label: 'Jornada' },
            { id: 'profile', icon: User, label: 'Perfil' },
            { id: 'security', icon: Lock, label: 'Segurança' },
            { id: 'notify', icon: Bell, label: 'Alertas' },
            { id: 'integrations', icon: Globe, label: 'Conexões' },
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

        {/* Conteúdo Principal */}
        <div className="lg:col-span-9">
          
          {/* ABA: JORNADA (TRABALHO) */}
          {activeTab === 'work' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-400">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xl font-black text-white mb-2 tracking-tight">Escala Semanal</h4>
                  <p className="text-sm text-slate-500 font-medium">Dias de jornada oficial.</p>
                </div>
                <div className="flex flex-wrap gap-3 relative z-10">
                  {days.map(day => {
                    const isActive = (userConfig.workingDays || [1, 2, 3, 4, 5]).includes(day.id);
                    return (
                      <button
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={`flex-1 min-w-[80px] py-6 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-3 ${
                          isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-900'}`}>
                          {isActive ? <Check className="w-3 h-3" /> : <div className="w-3 h-3" />}
                        </div>
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3 text-indigo-400" /> Início
                    </label>
                    <input type="time" name="workStart" value={userConfig.workStart} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-lg font-black text-white focus:ring-4 ring-indigo-500/10 transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3 text-rose-400" /> Fim
                    </label>
                    <input type="time" name="workEnd" value={userConfig.workEnd} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-lg font-black text-white focus:ring-4 ring-rose-500/10 transition-all" />
                  </div>
                </div>
                <div className="space-y-5">
                   <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Líquida Diária</label>
                      <span className="bg-indigo-500/10 text-indigo-400 font-black px-5 py-2 rounded-xl border border-indigo-500/20 text-lg">{userConfig.dailyTargetHours}h</span>
                   </div>
                   <input type="range" min="1" max="16" step="0.5" name="dailyTargetHours" value={userConfig.dailyTargetHours} onChange={handleChange} className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {/* ABA: PERFIL (EDIÇÃO DE PERFIL) */}
          {(activeTab === 'profile' || activeTab === 'security') && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-400">
               {/* Upload de Foto e Informações Básicas */}
               <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl space-y-10 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                     <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center relative shadow-2xl group-hover:border-indigo-500 transition-all">
                           {userConfig.avatar ? (
                             <img src={userConfig.avatar} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-12 h-12 text-slate-700" />
                           )}
                           <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white" />
                           </div>
                        </div>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           accept="image/*" 
                           onChange={handleFileChange} 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-full border-4 border-slate-900 shadow-xl group-hover:scale-110 transition-transform">
                           <Camera className="w-4 h-4 text-white" />
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-indigo-400" /> Nome Completo
                           </label>
                           <input 
                              type="text" 
                              name="name"
                              value={userConfig.name || ''} 
                              onChange={handleChange}
                              placeholder="Seu nome de usuário"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:ring-4 ring-indigo-500/10 transition-all" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-indigo-400" /> E-mail de Acesso
                           </label>
                           <input 
                              type="email" 
                              name="email"
                              value={userConfig.email || ''} 
                              onChange={handleChange}
                              placeholder="exemplo@email.com"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:ring-4 ring-indigo-500/10 transition-all" 
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Alteração de Senha */}
               <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <Key className="w-5 h-5 text-amber-500" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase">Segurança de Acesso</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Mantenha sua conta protegida na VPS</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha Atual</label>
                        <input 
                           type="password" 
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold" 
                           placeholder="••••••••"
                           value={passwords.current}
                           onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-indigo-400">Nova Senha</label>
                        <input 
                           type="password" 
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold" 
                           placeholder="Mín. 8 caracteres"
                           value={passwords.new}
                           onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-indigo-400">Confirmar</label>
                        <input 
                           type="password" 
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold" 
                           placeholder="Repita a senha"
                           value={passwords.confirm}
                           onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        />
                     </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                     <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-slate-500 font-bold italic">Estrutura preparada para autenticação segura via JWT/bcrypt em servidor VPS Linux.</p>
                  </div>
               </div>
            </div>
          )}

          {/* Outras abas (Placeholder) */}
          {(activeTab === 'notify' || activeTab === 'integrations') && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-700 animate-pulse">
               <Globe className="w-20 h-20 opacity-10 mb-6" />
               <h3 className="text-xl font-black uppercase tracking-[0.4em] opacity-20">Aba em Desenvolvimento</h3>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
