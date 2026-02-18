
import React, { useState, useMemo } from 'react';
import { Task, Goal, Event, WorkLog, UserConfig } from '../types';
import { 
  Clock, TrendingUp, AlertCircle, Timer, Target, ArrowUpRight, 
  ArrowDownRight, CalendarDays, History, Hourglass, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, MapPin, BellRing, LayoutGrid, List, Sparkles,
  X, AlignLeft, Info, Video
} from 'lucide-react';

interface Props {
  tasks: Task[];
  goals: Goal[];
  events: Event[];
  workLogs: WorkLog[];
  userConfig: UserConfig;
}

type CalendarMode = 'Week' | 'Month' | 'Day';

const Dashboard: React.FC<Props> = ({ tasks, goals, events, workLogs, userConfig }) => {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('Week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];

  const calculateTotalTime = (log: WorkLog) => {
    const start = new Date(log.startTime).getTime();
    const end = log.endTime ? new Date(log.endTime).getTime() : (log.isActive ? new Date().getTime() : start);
    const breakDuration = log.breaks.reduce((acc, b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = b.end ? new Date(b.end).getTime() : (log.isActive && log.isOnBreak ? new Date().getTime() : bStart);
      return acc + (bEnd - bStart);
    }, 0);
    return Math.max(0, end - start - breakDuration);
  };

  const todayLog = workLogs.find(l => l.date === todayStr);
  const todayMs = todayLog ? calculateTotalTime(todayLog) : 0;
  
  // CÁLCULO DE PROGRESSO SEMANAL
  const weekStats = useMemo(() => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const totalWeekMs = workLogs.reduce((acc, log) => {
      const logDate = new Date(log.date + 'T00:00:00');
      if (logDate >= startOfWeek && logDate <= endOfWeek) {
        return acc + calculateTotalTime(log);
      }
      return acc;
    }, 0);

    const weeklyTargetMs = userConfig.dailyTargetHours * 3600000 * (userConfig.workingDays?.length || 5);
    const performance = Math.min(100, (totalWeekMs / weeklyTargetMs) * 100);
    const remainingMs = Math.max(0, weeklyTargetMs - totalWeekMs);

    return { totalWeekMs, weeklyTargetMs, performance, remainingMs };
  }, [workLogs, userConfig]);

  const targetMs = userConfig.dailyTargetHours * 3600000;
  const performance = Math.min(100, (todayMs / targetMs) * 100);

  // Filtragem solicitada: 3 mensais válidas e 3 anuais
  const displayGoals = useMemo(() => {
    const monthly = goals
      .filter(g => g.type === 'Monthly' && g.targetDate >= todayStr && !g.isArchived)
      .slice(0, 3);
    const yearly = goals
      .filter(g => g.type === 'Yearly' && !g.isArchived)
      .slice(0, 3);
    return [...monthly, ...yearly];
  }, [goals, todayStr]);

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const stats = [
    { label: 'Tarefas Ativas', value: tasks.filter(t => t.status !== 'Completed').length, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Tempo Hoje', value: `${(todayMs / 3600000).toFixed(1)}h`, icon: Timer, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Urgências', value: tasks.filter(t => t.priority === 'Urgent').length, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Aproveitamento', value: `${Math.round(performance)}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const getEventStyles = (type: string) => {
    switch(type) {
      case 'Work': return 'bg-indigo-600 text-white border-indigo-400/30 shadow-indigo-500/20';
      case 'Personal': return 'bg-emerald-600 text-white border-emerald-400/30 shadow-emerald-600/10';
      case 'Meeting': return 'bg-amber-500 text-slate-950 border-amber-400/30 shadow-amber-500/10';
      default: return 'bg-slate-700 text-white border-slate-600';
    }
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'Work': return <Clock className="w-2.5 h-2.5" />;
      case 'Meeting': return <Video className="w-2.5 h-2.5" />;
      case 'Personal': return <CalendarIcon className="w-2.5 h-2.5" />;
      default: return <Sparkles className="w-2.5 h-2.5" />;
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700 pb-20 text-white">
      
      {/* Seção 1: Metas Estratégicas (Filtro 3 Mensais / 3 Anuais) */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 lg:gap-3">
             <Target className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400" />
             <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tighter">Foco do Mês Atual</h3>
          </div>
          <span className="text-[8px] lg:text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full border border-indigo-500/20">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {displayGoals.length > 0 ? displayGoals.map(goal => {
            const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            return (
              <div key={goal.id} className="bg-slate-900/40 border border-slate-800/60 p-5 lg:p-6 rounded-2xl lg:rounded-[2.5rem] hover:bg-slate-900/60 transition-all group relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-white text-base lg:text-lg tracking-tight group-hover:text-indigo-400 transition-colors">{goal.title}</h4>
                    <p className="text-[8px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      {goal.type === 'Yearly' ? <span className="text-amber-500/80">Meta Anual</span> : <span className="text-indigo-400/80">Meta Mensal</span>}
                      <span className="opacity-40">•</span>
                      {goal.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base lg:text-lg font-black text-indigo-400">{Math.round(progress)}%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-4 lg:mt-5 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[8px] lg:text-[10px] font-black text-slate-500 uppercase">
                    <Hourglass className="w-3 h-3 text-amber-500" />
                    <span>{daysLeft > 0 ? `Restam ${daysLeft} dias` : (goal.type === 'Yearly' ? 'Até o fim do ano' : 'Vencido')}</span>
                  </div>
                  <span className="text-[8px] lg:text-[10px] font-bold text-slate-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-10 lg:py-12 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-2xl lg:rounded-[2.5rem]">
              <Target className="w-10 h-10 lg:w-12 lg:h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhuma meta ativa para exibição.</p>
            </div>
          )}
        </div>
      </section>

      {/* Seção 2: Grid de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900/20 border border-slate-800/40 p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] hover:border-indigo-500/30 transition-all group shadow-xl">
            <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${stat.bg} w-fit mb-3 lg:mb-5 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
            </div>
            <p className="text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl lg:text-4xl font-black mt-1 lg:mt-2 text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Seção 3: Painel Central de Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Central de Compromissos */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800/40 p-6 lg:p-10 rounded-2xl lg:rounded-[3rem] shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-12 gap-4 lg:gap-6 relative z-10">
            <div>
              <h3 className="text-lg lg:text-2xl font-black text-white flex items-center gap-2 lg:gap-3 tracking-tight">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                Fluxo de Compromissos
              </h3>
              <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium italic">Seus compromissos organizados com precisão.</p>
            </div>
            
            <div className="flex bg-slate-950 p-1 rounded-xl lg:rounded-2xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
              {[
                { id: 'Day', label: 'Hoje', icon: List },
                { id: 'Week', label: 'Semana', icon: LayoutGrid },
                { id: 'Month', label: 'Mês', icon: CalendarIcon }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setCalendarMode(mode.id as CalendarMode)}
                  className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                    calendarMode === mode.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <mode.icon className="w-3 h-3" /> {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-in slide-in-from-bottom-4 duration-500 min-h-[300px] lg:min-h-[420px]">
            {calendarMode === 'Week' && (
              <div className="grid grid-cols-7 gap-2 lg:gap-3">
                {weekDays.map((day, idx) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const isToday = dateStr === todayStr;
                  const dayEvents = events.filter(e => e.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
                  
                  return (
                    <div key={idx} className={`flex flex-col rounded-xl lg:rounded-[2.5rem] p-2 lg:p-3 transition-all border group ${
                      isToday ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20' : 'bg-slate-900/40 border-slate-800/60'
                    }`}>
                      <div className="text-center mb-3 lg:mb-6">
                        <p className={`text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-indigo-400' : 'text-slate-600'}`}>
                          {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </p>
                        <p className={`text-lg lg:text-2xl font-black mt-0.5 ${isToday ? 'text-white' : 'text-slate-500'}`}>
                          {day.getDate()}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 lg:space-y-2 flex-1">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id} 
                            onClick={() => setSelectedEvent(event)}
                            className={`p-1.5 lg:p-2.5 rounded-lg lg:rounded-2xl border cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm ${getEventStyles(event.type)}`}
                          >
                             <div className="flex items-center gap-1 mb-1 opacity-90">
                                {getEventIcon(event.type)}
                                <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest">{event.time}</span>
                             </div>
                             <p className="text-[8px] lg:text-[9px] font-black leading-tight line-clamp-2 uppercase tracking-tighter">
                               {event.title}
                             </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {calendarMode === 'Day' && (
               <div className="space-y-3 lg:space-y-4 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {events.filter(e => e.date === todayStr).length > 0 ? events.filter(e => e.date === todayStr).sort((a,b) => a.time.localeCompare(b.time)).map(event => (
                    <div 
                      key={event.id} 
                      onClick={() => setSelectedEvent(event)}
                      className="bg-slate-950/60 border border-slate-800 p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-xl cursor-pointer"
                    >
                       <div className="flex items-center gap-4 lg:gap-6">
                          <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex flex-col items-center justify-center border shadow-inner transition-all group-hover:scale-105 ${getEventStyles(event.type)}`}>
                             {getEventIcon(event.type)}
                             <span className="text-[10px] lg:text-xs font-black mt-1">{event.time}</span>
                          </div>
                          <div>
                             <h4 className="text-base lg:text-lg font-black text-white group-hover:text-indigo-400 transition-all tracking-tight">{event.title}</h4>
                             <div className="flex items-center gap-3 lg:gap-4 mt-1.5 lg:mt-2">
                                <span className={`flex items-center gap-1 text-[8px] lg:text-[9px] font-black uppercase tracking-widest border px-2 lg:px-3 py-0.5 lg:py-1 rounded-full ${getEventStyles(event.type)}`}>
                                   {event.type}
                                </span>
                             </div>
                          </div>
                       </div>
                       <button className="hidden sm:block px-6 lg:px-8 py-2 lg:py-3 bg-slate-800 group-hover:bg-indigo-600 text-white rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                          Ver Detalhes
                       </button>
                    </div>
                  )) : (
                    <div className="py-16 lg:py-24 text-center border-2 border-dashed border-slate-800 rounded-2xl lg:rounded-[3rem] bg-slate-900/10">
                       <BellRing className="w-12 h-12 lg:w-16 lg:h-16 text-slate-800 mx-auto mb-4 lg:mb-6 opacity-40" />
                       <h4 className="text-lg lg:text-xl font-black text-slate-600">Dia Livre</h4>
                       <p className="text-slate-500 font-bold uppercase text-[8px] lg:text-[10px] tracking-widest mt-2">Foco total nas suas tarefas hoje.</p>
                    </div>
                  )}
               </div>
            )}

            {calendarMode === 'Month' && (
              <div className="bg-slate-950/50 rounded-2xl lg:rounded-[3rem] border border-slate-800 p-8 lg:p-12 text-center py-20 lg:py-28 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                <LayoutGrid className="w-16 h-16 lg:w-20 lg:h-20 text-indigo-500/20 mx-auto mb-6 lg:mb-8 relative z-10" />
                <h4 className="text-xl lg:text-2xl font-black text-slate-400 relative z-10 uppercase tracking-widest">Calendário Mensal</h4>
                <p className="text-slate-600 text-xs lg:text-sm mt-3 max-w-sm mx-auto relative z-10 leading-relaxed font-medium">
                   Para gerenciar grandes projetos e visualizar o planejamento de longo prazo, utilize a aba dedicada à <strong>Agenda</strong> na barra lateral.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gestão de Jornada (MODIFICADO PARA PROGRESSO SEMANAL) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 lg:p-8 rounded-2xl lg:rounded-[3.5rem] shadow-2xl flex-1 relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000">
                <CalendarDays className="w-48 h-48 lg:w-64 lg:h-64 text-indigo-500" />
             </div>
             
             <h3 className="text-lg lg:text-xl font-black text-white mb-6 lg:mb-8 tracking-tight flex items-center gap-3">
                <CalendarDays className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400" /> Progresso da Semana
             </h3>

             <div className="space-y-6 lg:space-y-8 relative z-10">
                <div className="text-center py-6 lg:py-10 bg-slate-950/50 rounded-2xl lg:rounded-[3rem] border border-slate-800 shadow-inner group-hover:border-indigo-500/20 transition-all">
                   <p className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Acumulado na Semana</p>
                   <div className="flex items-center justify-center gap-3 lg:gap-4">
                      <div className={`p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-indigo-500/10`}>
                        <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400" />
                      </div>
                      <span className={`text-4xl lg:text-6xl font-black tracking-tighter tabular-nums text-white`}>
                         {(weekStats.totalWeekMs / 3600000).toFixed(1)}<span className="text-2xl lg:text-3xl ml-1 text-slate-600">h</span>
                      </span>
                   </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">Aproveitamento</span>
                    <span className="text-2xl lg:text-3xl font-black text-indigo-400 tabular-nums">{Math.round(weekStats.performance)}%</span>
                  </div>
                  <div className="h-4 lg:h-5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 p-1 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${weekStats.performance >= 100 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]'}`}
                      style={{ width: `${weekStats.performance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-slate-950/40 p-4 lg:p-5 rounded-xl lg:rounded-[1.5rem] border border-slate-800 text-center group-hover:border-slate-700 transition-all shadow-sm">
                    <p className="text-[8px] lg:text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">Meta Semanal</p>
                    <p className="text-lg lg:text-xl font-black text-white">{(weekStats.weeklyTargetMs / 3600000).toFixed(0)}h</p>
                  </div>
                  <div className="bg-slate-950/40 p-4 lg:p-5 rounded-xl lg:rounded-[1.5rem] border border-slate-800 text-center group-hover:border-slate-700 transition-all shadow-sm">
                    <p className="text-[8px] lg:text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">Saldo Pendente</p>
                    <p className="text-lg lg:text-xl font-black text-indigo-400">
                       {(weekStats.remainingMs / 3600000).toFixed(1)}h
                    </p>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="bg-indigo-600 p-6 lg:p-8 rounded-2xl lg:rounded-[3.5rem] shadow-2xl shadow-indigo-600/30 text-white flex items-center justify-between group cursor-pointer overflow-hidden relative active:scale-95 transition-all">
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                <div className="p-3 lg:p-4 bg-white/10 rounded-xl lg:rounded-2xl backdrop-blur-md">
                   <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                   <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-indigo-200">Acesso Premium</p>
                   <h4 className="text-xl lg:text-2xl font-black tracking-tighter">Central de Ponto</h4>
                </div>
             </div>
             <CalendarDays className="w-10 h-10 lg:w-12 lg:h-12 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/80" onClick={() => setSelectedEvent(null)}></div>
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
              <div className={`h-3 w-full ${getEventStyles(selectedEvent.type)}`}></div>
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${getEventStyles(selectedEvent.type)} shadow-lg`}>
                       {getEventIcon(selectedEvent.type)}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Detalhes da Agenda</h3>
                 </div>
                 <button onClick={() => setSelectedEvent(null)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-2 uppercase tracking-tighter">{selectedEvent.title}</h2>
                    <p className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                       <Sparkles className="w-4 h-4" /> Compromisso Estratégico do Dia
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex items-center gap-4">
                       <Clock className="w-6 h-6 text-slate-500" />
                       <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Horário</p>
                          <p className="text-lg font-black text-white">{selectedEvent.time}</p>
                       </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex items-center gap-4">
                       <CalendarIcon className="w-6 h-6 text-slate-500" />
                       <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Data</p>
                          <p className="text-lg font-black text-white">{new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 bg-slate-950/40 rounded-3xl border border-slate-800">
                       <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Localização/Link</p>
                          <p className="text-sm font-bold text-slate-300">Sala de Reuniões Virtual #04 / Dashboard Remoto</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 bg-slate-950/40 rounded-3xl border border-slate-800">
                       <AlignLeft className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Observações</p>
                          <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"Compromisso sincronizado com o ecossistema myplans. Foco total nos resultados planejados."</p>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={() => setSelectedEvent(null)}
                  className="w-full bg-slate-800 hover:bg-indigo-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-950/20 active:scale-95"
                 >
                   Fechar Visualização
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
