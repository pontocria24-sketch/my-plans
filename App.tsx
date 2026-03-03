
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Lightbulb, Target, Calendar, 
  Video, Settings as SettingsIcon, Timer, Rocket, Clock, 
  Lock, User, ArrowRight, ShieldCheck, UserPlus, Moon, Sun
} from 'lucide-react';
import { View, Task, Idea, Goal, Event, ContentScript, WorkLog, UserConfig } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import TaskManager from './components/TaskManager.tsx';
import IdeaBoard from './components/IdeaBoard.tsx';
import GoalTracker from './components/GoalTracker.tsx';
import CalendarView from './components/CalendarView.tsx';
import ContentManager from './components/ContentManager.tsx';
import TimeTracker from './components/TimeTracker.tsx';
import Settings from './components/Settings.tsx';
import { db } from './authService.ts';

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
      <h1 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white lowercase">
        my<span className="text-indigo-600 dark:text-indigo-400">plans</span>
      </h1>
    )}
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('myplans_auth') === 'true');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('myplans_theme') as 'dark' | 'light') || 'dark');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // States do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskColumns, setTaskColumns] = useState<{ id: string; label: string; color: string }[]>(() => safeParse('myplans_task_columns', [
    { id: 'Pending', label: 'A Fazer', color: 'bg-slate-500' },
    { id: 'InProgress', label: 'Em Execução', color: 'bg-indigo-500' },
    { id: 'Completed', label: 'Concluído', color: 'bg-emerald-500' }
  ]));
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [scripts, setScripts] = useState<ContentScript[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig>(() => safeParse('myplans_config_v3', {
    workStart: '09:00',
    workEnd: '18:00',
    dailyTargetHours: 8,
    name: 'Usuário',
    email: '',
    workingDays: [1, 2, 3, 4, 5]
  }));

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('myplans_theme', theme);
  }, [theme]);

  // Efeito para carregar TUDO da VPS quando o usuário logar
  useEffect(() => {
    if (isLoggedIn) {
      const userId = localStorage.getItem('myplans_userid') || "master_user";
      
      // Pull das configurações (Inclui Nome, Email e Avatar)
      db.pullData(userId, 'config', userConfig).then(data => {
        if (data) setUserConfig(data);
      });

      db.pullData(userId, 'tasks', []).then(setTasks);
      db.pullData(userId, 'taskColumns', [
        { id: 'Pending', label: 'A Fazer', color: 'bg-slate-500' },
        { id: 'InProgress', label: 'Em Execução', color: 'bg-indigo-500' },
        { id: 'Completed', label: 'Concluído', color: 'bg-emerald-500' }
      ]).then(setTaskColumns);
      db.pullData(userId, 'ideas', []).then(setIdeas);
      db.pullData(userId, 'goals', []).then(setGoals);
      db.pullData(userId, 'events', []).then(setEvents);
      db.pullData(userId, 'scripts', []).then(setScripts);
      db.pullData(userId, 'workLogs', []).then(setWorkLogs);
    }
  }, [isLoggedIn]);

  // Sincronização automática para a VPS (Debounce de 2s)
  useEffect(() => {
    if (isLoggedIn) {
      const userId = localStorage.getItem('myplans_userid');
      if (!userId) return;

      const timer = setTimeout(() => {
        db.pushData(userId, 'tasks', tasks);
        db.pushData(userId, 'taskColumns', taskColumns);
        db.pushData(userId, 'ideas', ideas);
        db.pushData(userId, 'goals', goals);
        db.pushData(userId, 'events', events);
        db.pushData(userId, 'scripts', scripts);
        db.pushData(userId, 'workLogs', workLogs);
        db.pushData(userId, 'config', userConfig);
        // Salva localmente como backup rápido
        localStorage.setItem('myplans_config_v3', JSON.stringify(userConfig));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, ideas, goals, events, scripts, workLogs, userConfig, isLoggedIn]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (authMode === 'login') {
      const res = await db.login(email, password);
      if (res && res.success) {
        localStorage.setItem('myplans_auth', 'true');
        localStorage.setItem('myplans_userid', res.user.id);
        
        // Atualiza o config com os dados reais do banco imediatamente
        setUserConfig(prev => ({
          ...prev,
          name: res.user.name || prev.name,
          email: res.user.email || prev.email
        }));
        
        setIsLoggedIn(true);
      } else {
        alert(res?.error || "Erro de credenciais ou conexão.");
      }
    } else {
      const res = await db.register(name, email, password);
      if (res && res.success) {
        alert("Conta criada com sucesso! Faça login agora.");
        setAuthMode('login');
      } else {
        alert(res?.error || "Erro ao criar conta.");
      }
    }
    setIsLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <AppLogo isOpen={true} />
            <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium text-center italic">Ecossistema de produtividade em tempo real.</p>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              {authMode === 'login' ? <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> : <UserPlus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />} 
              {authMode === 'login' ? 'Acesso VPS' : 'Criar Conta VPS'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-6">
              {authMode === 'register' && (
                <input 
                  type="text" required placeholder="Nome Completo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition-all"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              )}
              <input 
                type="email" required placeholder="E-mail"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" required placeholder="Senha"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition-all"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="submit" disabled={isLoading}
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isLoading ? 'Conectando...' : (authMode === 'login' ? 'Entrar no Sistema' : 'Cadastrar agora')}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest"
              >
                {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-6 text-center uppercase font-black tracking-widest">Banco de Dados: PostgreSQL</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard': return <Dashboard tasks={tasks} goals={goals} events={events} workLogs={workLogs} userConfig={userConfig} />;
      case 'Tasks': return <TaskManager tasks={tasks} setTasks={setTasks} columns={taskColumns} setColumns={setTaskColumns} />;
      case 'Ideas': return <IdeaBoard ideas={ideas} setIdeas={setIdeas} tasks={tasks} setTasks={setTasks} />;
      case 'Goals': return <GoalTracker goals={goals} setGoals={setGoals} />;
      case 'Calendar': return <CalendarView events={events} setEvents={setEvents} tasks={tasks} />;
      case 'Content': return <ContentManager scripts={scripts} setScripts={setScripts} tasks={tasks} setTasks={setTasks} />;
      case 'TimeTracker': return <TimeTracker workLogs={workLogs} setWorkLogs={setWorkLogs} userConfig={userConfig} />;
      case 'Settings': return <Settings userConfig={userConfig} setUserConfig={setUserConfig} />;
      default: return <Dashboard tasks={tasks} goals={goals} events={events} workLogs={workLogs} userConfig={userConfig} />;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'} transition-all duration-500 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col`}>
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <AppLogo isOpen={sidebarOpen} />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-2 lg:px-4 py-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'Dashboard', icon: LayoutDashboard, label: 'Geral' },
            { id: 'Tasks', icon: CheckSquare, label: 'Tarefas' },
            { id: 'TimeTracker', icon: Timer, label: 'Ponto' },
            { id: 'Ideas', icon: Lightbulb, label: 'Ideias' },
            { id: 'Goals', icon: Target, label: 'Metas' },
            { id: 'Calendar', icon: Calendar, label: 'Agenda' },
            { id: 'Settings', icon: SettingsIcon, label: 'Ajustes' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveView(item.id as View); if (window.innerWidth < 1024) setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-3 rounded-xl lg:rounded-2xl transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || window.innerWidth < 1024) && <span className="font-bold text-[10px] lg:text-xs">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('myplans_auth'); }} className="p-4 lg:p-6 text-slate-500 hover:text-rose-500 flex items-center gap-4 transition-colors">
          <Clock className="w-5 h-5" /> {(sidebarOpen || window.innerWidth < 1024) && <span className="font-black text-[10px] uppercase">Sair</span>}
        </button>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 flex flex-col min-w-0 lg:ml-0 transition-all duration-500">
        <header className="h-16 lg:h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 lg:p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700">
              <Clock className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 lg:p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700"
              title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-[10px] font-black uppercase text-slate-500 tracking-widest">{userConfig.name}</span>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 overflow-hidden shadow-lg">
              {userConfig.avatar ? (
                <img src={userConfig.avatar} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                userConfig.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-slate-50/50 dark:bg-transparent">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
