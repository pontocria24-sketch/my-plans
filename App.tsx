
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Lightbulb, Target, Calendar, 
  Video, Settings as SettingsIcon, Timer, Rocket, Clock, 
  Lock, User, ArrowRight, ShieldCheck, Mail, Info, Users, UserPlus, LogOut, Database,
  Wifi, WifiOff
} from 'lucide-react';
import { View, Task, Idea, Goal, Event, ContentScript, WorkLog, UserConfig, UserAccount } from './types';
import { db, isUsingAPI } from './authService';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import IdeaBoard from './components/IdeaBoard';
import GoalTracker from './components/GoalTracker';
import CalendarView from './components/CalendarView';
import ContentManager from './components/ContentManager';
import TimeTracker from './components/TimeTracker';
import Settings from './components/Settings';
import AdminUsers from './components/AdminUsers';

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
};

const AppLogo: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <div className="flex items-center gap-3 group">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-600 rounded-xl rotate-6 group-hover:rotate-0 transition-transform duration-300 shadow-lg shadow-indigo-600/20"></div>
      <div className="relative z-10 flex items-center justify-center">
        <Rocket className="w-5 h-5 text-white -rotate-12 transform group-hover:rotate-0 transition-transform" />
      </div>
    </div>
    {isOpen && (
      <h1 className="font-black text-2xl tracking-tighter text-white lowercase">
        my<span className="text-indigo-400">plans</span>
      </h1>
    )}
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => safeParse('myplans_current_user', null));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('myplans_current_user'));
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'pending'>('login');
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Estados com Inicialização Segura (Escopados ao usuário logado)
  const [tasks, setTasks] = useState<Task[]>(() => safeParse(`tasks_${currentUser?.id}`, []));
  const [ideas, setIdeas] = useState<Idea[]>(() => safeParse(`ideas_${currentUser?.id}`, []));
  const [goals, setGoals] = useState<Goal[]>(() => safeParse(`goals_${currentUser?.id}`, []));
  const [events, setEvents] = useState<Event[]>(() => safeParse(`events_${currentUser?.id}`, []));
  const [scripts, setScripts] = useState<ContentScript[]>(() => safeParse(`scripts_${currentUser?.id}`, []));
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() => safeParse(`worklogs_${currentUser?.id}`, []));
  const [userConfig, setUserConfig] = useState<UserConfig>(() => safeParse(`config_${currentUser?.id}`, {
    workStart: '09:00',
    workEnd: '18:00',
    dailyTargetHours: 8,
    name: currentUser?.name || 'Usuário Pro',
    email: currentUser?.email || '',
    workingDays: [1, 2, 3, 4, 5]
  }));

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
      localStorage.setItem(`ideas_${currentUser.id}`, JSON.stringify(ideas));
      localStorage.setItem(`goals_${currentUser.id}`, JSON.stringify(goals));
      localStorage.setItem(`events_${currentUser.id}`, JSON.stringify(events));
      localStorage.setItem(`scripts_${currentUser.id}`, JSON.stringify(scripts));
      localStorage.setItem(`worklogs_${currentUser.id}`, JSON.stringify(workLogs));
      localStorage.setItem(`config_${currentUser.id}`, JSON.stringify(userConfig));
      localStorage.setItem('myplans_current_user', JSON.stringify(currentUser));
    }
  }, [tasks, ideas, goals, events, scripts, workLogs, userConfig, currentUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const result = await db.login(email, password);
        if (result.success && result.user) {
          setCurrentUser(result.user);
          setIsLoggedIn(true);
        } else {
          if (result.status === 'Pending') setAuthMode('pending');
          setError(result.message || 'Erro ao entrar.');
        }
      } else {
        const result = await db.register(name, email, password);
        if (result.success) {
          setAuthMode('pending');
          setError('');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('myplans_current_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthMode('login');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10">
            <AppLogo isOpen={true} />
            <p className="text-slate-500 mt-4 font-medium text-center">Central inteligente de produtividade.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            {authMode === 'pending' ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg">
                  <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Aguardando Aprovação</h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                    "Sua conta foi criada, mas precisa ser ativada por um administrador para garantir a segurança dos dados."
                  </p>
                </div>
                <button 
                  onClick={() => setAuthMode('login')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                  {authMode === 'login' ? <Lock className="w-5 h-5 text-indigo-400" /> : <UserPlus className="w-5 h-5 text-indigo-400" />}
                  {authMode === 'login' ? 'Acesso' : 'Cadastro'}
                </h2>

                <form onSubmit={handleAuth} className="space-y-6">
                  {authMode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                          type="text" required
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                          placeholder="Como quer ser chamado?"
                          value={name}
                          disabled={isLoading}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="email" required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                        placeholder="exemplo@email.com"
                        value={email}
                        disabled={isLoading}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="password" required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                        placeholder="••••••••"
                        value={password}
                        disabled={isLoading}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in shake-in">
                      <Info className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-indigo-500/30 disabled:bg-slate-800 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Conectando...' : (authMode === 'login' ? 'Entrar' : 'Registrar Agora')} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/60 flex items-start gap-3">
                  <Database className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">
                    Nota: O app detectará automaticamente o backend na sua VPS assim que estiver configurado no Coolify.
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col gap-4 items-center">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                  >
                    {authMode === 'login' ? 'Não tem conta? Criar Cadastro' : 'Já possui conta? Faça Login'}
                  </button>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-indigo-500/40" /> myplans ecosystem
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard': return <Dashboard tasks={tasks} goals={goals} events={events} workLogs={workLogs} userConfig={userConfig} />;
      case 'Tasks': return <TaskManager tasks={tasks} setTasks={setTasks} />;
      case 'Ideas': return <IdeaBoard ideas={ideas} setIdeas={setIdeas} tasks={tasks} setTasks={setTasks} />;
      case 'Goals': return <GoalTracker goals={goals} setGoals={setGoals} />;
      case 'Calendar': return <CalendarView events={events} setEvents={setEvents} tasks={tasks} />;
      case 'Content': return <ContentManager scripts={scripts} setScripts={setScripts} tasks={tasks} setTasks={setTasks} />;
      case 'TimeTracker': return <TimeTracker workLogs={workLogs} setWorkLogs={setWorkLogs} userConfig={userConfig} />;
      case 'Settings': return <Settings userConfig={userConfig} setUserConfig={setUserConfig} currentUser={currentUser} />;
      case 'AdminUsers': return <AdminUsers />;
      default: return <Dashboard tasks={tasks} goals={goals} events={events} workLogs={workLogs} userConfig={userConfig} />;
    }
  };

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { id: 'Tasks', icon: CheckSquare, label: 'Tarefas' },
    { id: 'TimeTracker', icon: Timer, label: 'Gestão de Ponto' },
    { id: 'Content', icon: Video, label: 'Produção' },
    { id: 'Ideas', icon: Lightbulb, label: 'Ideias' },
    { id: 'Goals', icon: Target, label: 'Metas' },
    { id: 'Calendar', icon: Calendar, label: 'Agenda' },
    { id: 'Settings', icon: SettingsIcon, label: 'Ajustes' },
  ];

  if (currentUser?.role === 'Admin') {
    menuItems.push({ id: 'AdminUsers', icon: Users, label: 'Gerenciar Acessos' });
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-24'} transition-all duration-500 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-50`}>
        <div className="p-6">
          <AppLogo isOpen={sidebarOpen} />
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveView(item.id as View)} 
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-bold text-xs tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
           >
             <LogOut className="w-5 h-5 flex-shrink-0" />
             {sidebarOpen && <span className="font-bold text-xs tracking-tight uppercase tracking-widest">Sair</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <header className="h-20 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
              <Clock className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">{activeView}</h2>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Indicador de Status do Banco de Dados VPS */}
             <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${isUsingAPI() ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                {isUsingAPI() ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isUsingAPI() ? 'Nuvem VPS Ativa' : 'Modo Local (Offline)'}
             </div>

             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentUser?.name}</span>
                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{currentUser?.role === 'Admin' ? 'Administrador' : 'Membro'}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-indigo-400">
                  {currentUser?.name?.charAt(0)}
                </div>
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
