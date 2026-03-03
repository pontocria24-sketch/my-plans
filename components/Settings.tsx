
import React, { useState, useRef } from 'react';
import { UserConfig } from '../types.ts';
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

  // Estados temporários para senha
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
        // Salva o avatar como Base64 diretamente no config global
        setUserConfig(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    // A sincronização real é feita pelo useEffect no App.tsx que observa o userConfig
    alert('As alterações de perfil e jornada foram salvas e sincronizadas com sua VPS!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 lg:gap-4 tracking-tighter uppercase">
            <div className="p-2 lg:p-3 bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
               <SettingsIcon className="text-indigo-600 dark:text-indigo-400 w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            Configurações
          </h2>
          <p className="text-xs lg:text-sm text-slate-500 mt-1.5 lg:mt-2 font-medium">Personalize seu ambiente de alta performance.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 lg:px-10 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest flex items-center gap-2 lg:gap-3 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 border border-indigo-500/30"
        >
          <Save className="w-4 h-4 lg:w-5 lg:h-5" /> Salvar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <nav className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
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
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border shrink-0 ${
                activeTab === item.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" /> <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="lg:col-span-9">
          {activeTab === 'work' && (
            <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-400">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[3rem] p-6 lg:p-10 space-y-6 lg:space-y-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white mb-1.5 lg:mb-2 tracking-tight">Escala Semanal</h4>
                  <p className="text-xs lg:text-sm text-slate-500 font-medium">Dias de jornada oficial.</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-3 relative z-10">
                  {days.map(day => {
                    const isActive = (userConfig.workingDays || [1, 2, 3, 4, 5]).includes(day.id);
                    return (
                      <button
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={`flex-1 min-w-[60px] lg:min-w-[80px] py-4 lg:py-6 rounded-xl lg:rounded-2xl border font-black text-[8px] lg:text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-2 lg:gap-3 ${
                          isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-1 lg:p-1.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-900'}`}>
                          {isActive ? <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> : <div className="w-2.5 h-2.5 lg:w-3 lg:h-3" />}
                        </div>
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[3rem] p-6 lg:p-10 space-y-8 lg:space-y-10 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                  <div className="space-y-3 lg:space-y-4">
                    <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Início
                    </label>
                    <input type="time" name="workStart" value={userConfig.workStart} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-base lg:text-lg font-black text-slate-900 dark:text-white focus:ring-4 ring-indigo-500/10 transition-all" />
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Fim
                    </label>
                    <input type="time" name="workEnd" value={userConfig.workEnd} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-base lg:text-lg font-black text-slate-900 dark:text-white focus:ring-4 ring-rose-500/10 transition-all" />
                  </div>
                </div>
                <div className="space-y-4 lg:space-y-5">
                   <div className="flex justify-between items-end">
                      <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Meta Líquida Diária</label>
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black px-4 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl border border-indigo-500/20 text-base lg:text-lg">{userConfig.dailyTargetHours}h</span>
                   </div>
                   <input type="range" min="1" max="16" step="0.5" name="dailyTargetHours" value={userConfig.dailyTargetHours} onChange={handleChange} className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200 dark:border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'profile' || activeTab === 'security') && (
            <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-400">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl space-y-8 lg:space-y-10 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">
                     <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative shadow-2xl group-hover:border-indigo-500 transition-all">
                           {userConfig.avatar ? (
                             <img src={userConfig.avatar} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-10 h-10 lg:w-12 lg:h-12 text-slate-300 dark:text-slate-700" />
                           )}
                           <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                           </div>
                        </div>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           accept="image/*" 
                           onChange={handleFileChange} 
                        />
                        <div className="absolute -bottom-1 lg:-bottom-2 -right-1 lg:-right-2 bg-indigo-600 p-1.5 lg:p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-xl group-hover:scale-110 transition-transform">
                           <Camera className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-4 lg:space-y-6 w-full">
                        <div className="space-y-2 lg:space-y-3">
                           <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <User className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-600 dark:text-indigo-400" /> Nome Completo (Identidade VPS)
                           </label>
                           <input 
                              type="text" 
                              name="name"
                              value={userConfig.name || ''} 
                              onChange={handleChange}
                              placeholder="Seu nome"
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold focus:ring-4 ring-indigo-500/10 transition-all" 
                           />
                        </div>
                        <div className="space-y-2 lg:space-y-3">
                           <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Mail className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-600 dark:text-indigo-400" /> E-mail de Registro
                           </label>
                           <input 
                              type="email" 
                              name="email"
                              value={userConfig.email || ''} 
                              onChange={handleChange}
                              placeholder="exemplo@email.com"
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold opacity-70 cursor-not-allowed" 
                              readOnly
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl space-y-6 lg:space-y-8">
                  <div className="flex items-center gap-3 lg:gap-4">
                     <div className="p-2 lg:p-3 bg-amber-500/10 rounded-xl lg:rounded-2xl border border-amber-500/20">
                        <Key className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-500" />
                     </div>
                     <div>
                        <h4 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Segurança de Acesso</h4>
                        <p className="text-[9px] lg:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Mantenha sua conta protegida na VPS</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                     <div className="space-y-2 lg:space-y-3">
                        <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Senha Atual</label>
                        <input 
                           type="password" 
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold" 
                           placeholder="••••••••"
                           value={passwords.current}
                           onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2 lg:space-y-3">
                        <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Nova Senha</label>
                        <input 
                           type="password" 
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold" 
                           placeholder="Mín. 8 caracteres"
                           value={passwords.new}
                           onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2 lg:space-y-3">
                        <label className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Confirmar</label>
                        <input 
                           type="password" 
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold" 
                           placeholder="Repita a senha"
                           value={passwords.confirm}
                           onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        />
                     </div>
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
