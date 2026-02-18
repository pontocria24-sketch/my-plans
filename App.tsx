
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Lightbulb, Target, Calendar, 
  Video, Settings as SettingsIcon, Timer, Rocket, Clock, 
  Lock, User, ArrowRight, ShieldCheck
} from 'lucide-react';
import { View, Task, Idea, Goal, Event, ContentScript, WorkLog, UserConfig } from './types';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import IdeaBoard from './components/IdeaBoard';
import GoalTracker from './components/GoalTracker';
import CalendarView from './components/CalendarView';
import ContentManager from './components/ContentManager';
import TimeTracker from './components/TimeTracker';
import Settings from './components/Settings';

// Utilitário de parsing seguro fora do componente para evitar redeclarações
const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Erro no parse de ${key}, usando fallback.`);
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('myplans_auth') === 'true');
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados com Inicialização Segura
  const [tasks, setTasks] = useState<Task[]>(() => safeParse('myplans_tasks_v3', []));
  const [ideas, setIdeas] = useState<Idea[]>(() => safeParse('myplans_ideas_v3', []));
  const [goals, setGoals] = useState<Goal[]>(() => safeParse('myplans_goals_v3', []));
  const [events, setEvents] = useState<Event[]>(() => safeParse('myplans_events_v3', []));
  const [scripts, setScripts] = useState<ContentScript[]>(() => safeParse('myplans_scripts_v3', []));
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() => safeParse('myplans_worklogs_v3', []));
  const [userConfig, setUserConfig] = useState<UserConfig>(() => safeParse('myplans_config_v3', {
    workStart: '09:00',
    workEnd: '18:00',
    dailyTargetHours: 8,
    name: 'Usuário Pro',
    email: 'contato@myplans.ai',
    workingDays: [1, 2, 3, 4, 5]
  }));

  // Sincronização persistente
  useEffect(() => {
    localStorage.setItem('myplans_tasks_v3', JSON.stringify(tasks));
    localStorage.setItem('myplans_ideas_v3', JSON.stringify(ideas));
    localStorage.setItem('myplans_goals_v3', JSON.stringify(goals));
    localStorage.setItem('myplans_events_v3', JSON.stringify(events));
    localStorage.setItem('myplans_scripts_v3', JSON.stringify(scripts));
    localStorage.setItem('myplans_worklogs_v3', JSON.stringify(workLogs));
    localStorage.setItem('myplans_config_v3', JSON.stringify(userConfig));
    localStorage.setItem('myplans_auth', isLoggedIn.toString());
  }, [tasks, ideas, goals, events, scripts, workLogs, userConfig, isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10">
            <AppLogo isOpen={true} />
            <p className="text-slate-500 mt-4 font-medium text-center">Sua central estratégica de planejamento.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-400" /> Acesso
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="email" required
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                    placeholder="exemplo@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="password" required
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-indigo-500/30"
              >
                Entrar <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-indigo-500/40" /> myplans ecosystem
            </div>
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
      case 'Settings': return <Settings userConfig={userConfig} setUserConfig={setUserConfig} />;
      default: return <Dashboard tasks={tasks} goals={goals} events={events} workLogs={workLogs} userConfig={userConfig} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-24'} transition-all duration-500 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-50`}>
        <div className="p-6">
          <AppLogo isOpen={sidebarOpen} />
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            { id: 'Dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
            { id: 'Tasks', icon: CheckSquare, label: 'Tarefas' },
            { id: 'TimeTracker', icon: Timer, label: 'Gestão de Ponto' },
            { id: 'Content', icon: Video, label: 'Produção' },
            { id: 'Ideas', icon: Lightbulb, label: 'Ideias' },
            { id: 'Goals', icon: Target, label: 'Metas' },
            { id: 'Calendar', icon: Calendar, label: 'Agenda' },
            { id: 'Settings', icon: SettingsIcon, label: 'Ajustes' },
          ].map((item) => (
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
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
           >
             <Clock className="w-5 h-5 flex-shrink-0" />
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
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-indigo-400">
               {userConfig.name?.charAt(0)}
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
