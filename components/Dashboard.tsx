
import React, { useMemo } from 'react';
import { Task, Goal, Event, WorkLog, UserConfig } from '../types';
import { 
  AlertCircle, Timer, Target, Zap, LayoutGrid, Sparkles, Calendar as CalendarIcon, CheckCircle2
} from 'lucide-react';

interface Props {
  tasks: Task[];
  goals: Goal[];
  events: Event[];
  workLogs: WorkLog[];
  userConfig: UserConfig;
}

const Dashboard: React.FC<Props> = ({ tasks, goals, events, workLogs, userConfig }) => {
  const priorityStats = useMemo(() => {
    const high = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;
    const medium = tasks.filter(t => t.priority === 'Medium' && t.status !== 'Completed').length;
    const low = tasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length;
    return { high, medium, low };
  }, [tasks]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-white">
      {/* Resumo de Prioridades */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-4">
             <AlertCircle className="w-5 h-5 text-rose-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Alta Prioridade</span>
          </div>
          <h3 className="text-5xl font-black text-white">{priorityStats.high}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Tarefas Pendentes</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-4">
             <Zap className="w-5 h-5 text-amber-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Média Prioridade</span>
          </div>
          <h3 className="text-5xl font-black text-white">{priorityStats.medium}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Tarefas Pendentes</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-4">
             <Sparkles className="w-5 h-5 text-emerald-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Baixa Prioridade</span>
          </div>
          <h3 className="text-5xl font-black text-white">{priorityStats.low}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Tarefas Pendentes</p>
        </div>
      </section>

      {/* Grid de Métricas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Tarefas', value: tasks.length, icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Concluídas', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Metas Ativas', value: goals.filter(g => !g.isArchived).length, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Eventos Hoje', value: events.filter(e => e.date === new Date().toISOString().split('T')[0]).length, icon: CalendarIcon, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/20 border border-slate-800/40 p-8 rounded-[2.5rem] shadow-xl hover:border-indigo-500/30 transition-all">
            <div className={`p-4 rounded-2xl ${stat.bg} w-fit mb-5`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-4xl font-black mt-2 text-white">{stat.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
