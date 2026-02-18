
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Lightbulb, Target, Calendar, Video, 
  Settings as SettingsIcon, Timer, Rocket, Clock, Clapperboard
} from 'lucide-react';
import { View, Task, Idea, Goal, Event, ContentScript, WorkLog, UserConfig, User } from './types';
import { syncToPostgres } from './dbService';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import IdeaBoard from './components/IdeaBoard';
import GoalTracker from './components/GoalTracker';
import CalendarView from './components/CalendarView';
import ContentManager from './components/ContentManager';
import TimeTracker from './components/TimeTracker';
import Settings from './components/Settings';
import Login from './components/Login';

const AppLogo: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-600 rounded-xl rotate-6 group-hover:rotate-0 transition-transform duration-300"></div>
      <div className="relative z-10 flex items-center justify-center">
        <Rocket className="w-5 h-5 text-white -rotate-12" />
      </div>
    </div>
    {isOpen && <h1 className="font-black text-2xl tracking-tighter text-white lowercase">my<span className="text-indigo-400">plans</span></h1>}
  </div>
);

const getRelativeDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const demoTasks: Task[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `t${i}`,
  title: `Tarefa ${i + 1} de Produção`,
  description: 'Organização estratégica no banco de dados myplans.',
  priority: i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low',
  status: i % 5 === 0 ? 'Completed' : 'Pending',
  category: 'Geral',
  responsible: 'Eu',
  startDate: getRelativeDate(-i),
  endDate: getRelativeDate(i),
  subTasks: [],
  isRecurring: false,
  progress: 0
}));

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('myplans_user_v4');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('myplans_tasks_v4') || JSON.stringify(demoTasks)));
  const [ideas, setIdeas] = useState<Idea[]>(() => JSON.parse(localStorage.getItem('myplans_ideas_v4') || '[]'));
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem('myplans_goals_v4') || '[]'));
  const [events, setEvents] = useState<Event[]>(() => JSON.parse(localStorage.getItem('myplans_events_v4') || '[]'));
  const [scripts, setScripts] = useState<ContentScript[]>(() => JSON.parse(localStorage.getItem('myplans_scripts_v4') || '[]'));
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() => JSON.parse(localStorage.getItem('myplans_worklogs_v4') || '[]'));
  const [userConfig, setUserConfig] = useState<UserConfig>(() => JSON.parse(localStorage.getItem('myplans_config_v4') || JSON.stringify({
    workStart: '09:00', workEnd: '18:00', dailyTargetHours: 8, name: 'Usuário Pro', workingDays: [1, 2, 3, 4, 5],
    syncEnabled: false, dbHost: '', dbPort: '3000'
  })));

  useEffect(() => { localStorage.setItem('myplans_tasks_v4', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('myplans_ideas_v4', JSON.stringify(ideas)); }, [ideas]);
  useEffect(() => { localStorage.setItem('myplans_goals_v4', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('myplans_events_v4', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('myplans_scripts_v4', JSON.stringify(scripts)); }, [scripts]);
  useEffect(() => { localStorage.setItem('myplans_worklogs_v4', JSON.stringify(workLogs)); }, [workLogs]);
  useEffect(() => { localStorage.setItem('myplans_config_v4', JSON.stringify(userConfig)); }, [userConfig]);
  
  useEffect(() => { 
    if (currentUser) localStorage.setItem('myplans_user_v4', JSON.stringify(currentUser));
    else localStorage.removeItem('myplans_user_v4');
  }, [currentUser]);

  useEffect(() => {
    if (userConfig.syncEnabled && currentUser) {
      const timer = setTimeout(() => {
        syncToPostgres(tasks, userConfig);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, userConfig.syncEnabled, currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('Dashboard');
  };

  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} userConfig={userConfig} />;
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
      case 'Settings': return <Settings userConfig={userConfig} setUserConfig={setUserConfig} onLogout={handleLogout} />;
      default: return <Dashboard tasks={tasks} goals={goals} events={events} workLogs={workLogs} userConfig={userConfig} />;
    }
  };

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'Tasks', icon: CheckSquare, label: 'Tarefas' },
    { id: 'Ideas', icon: Lightbulb, label: 'Ideias' },
    { id: 'Goals', icon: Target, label: 'Metas' },
    { id: 'Calendar', icon: Calendar, label: 'Agenda' },
    { id: 'Content', icon: Clapperboard, label: 'Produção' },
    { id: 'TimeTracker', icon: Timer, label: 'Ponto' },
    { id: 'Settings', icon: SettingsIcon, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-24'} transition-all duration-500 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-50`}>
        <div className="p-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full text-left">
            <AppLogo isOpen={sidebarOpen} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveView(item.id as View)} 
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {sidebarOpen && <span className="font-bold text-[10px] tracking-tight uppercase">{item.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/20">
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black uppercase shadow-lg">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-white truncate">{currentUser.name}</p>
                <p className="text-[8px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">{renderContent()}</main>
    </div>
  );
};

export default App;
