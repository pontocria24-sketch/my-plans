
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Video, 
  Bell, 
  X,
  Maximize2,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Link as LinkIcon,
  Circle
} from 'lucide-react';
import { Event, Task } from '../types';

interface Props {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  tasks: Task[];
}

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

const CalendarView: React.FC<Props> = ({ events, setEvents, tasks }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // REMOVIDA A INTEGRAÇÃO DE TAREFAS NA AGENDA CONFORME SOLICITADO
  // Agora utilizamos estritamente apenas os compromissos (events)
  const allDisplayItems = useMemo(() => {
    return events;
  }, [events]);

  const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrev = () => {
    if (viewMode === 'Day') {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() - 1);
      setSelectedDay(d);
      setCurrentDate(d);
    } else if (viewMode === 'Week') {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() - 7);
      setSelectedDay(d);
      setCurrentDate(d);
    } else if (viewMode === 'Year') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'Day') {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() + 1);
      setSelectedDay(d);
      setCurrentDate(d);
    } else if (viewMode === 'Week') {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() + 7);
      setSelectedDay(d);
      setCurrentDate(d);
    } else if (viewMode === 'Year') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    const d = new Date();
    setCurrentDate(d);
    setSelectedDay(d);
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const getEventColor = (event: Event) => {
    const isExpired = event.date < todayStr && !event.isCompleted;
    if (isExpired) return 'bg-slate-800/80 border-slate-700 text-slate-500 shadow-none grayscale';
    if (event.isCompleted) return 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400';
    
    switch(event.type) {
      case 'Work': return 'bg-indigo-600 text-white border-indigo-500/30 shadow-indigo-600/10';
      case 'Personal': return 'bg-emerald-600 text-white border-emerald-500/30 shadow-emerald-600/10';
      case 'Meeting': return 'bg-amber-500 text-slate-950 border-amber-400/30 shadow-amber-500/10';
      default: return 'bg-slate-500 text-white border-slate-400/30 shadow-slate-500/10';
    }
  };

  const [formEvent, setFormEvent] = useState<Partial<Event>>({
    title: '',
    time: '12:00',
    type: 'Work',
    date: todayStr,
    link: ''
  });

  const handleSaveEvent = () => {
    if (!formEvent.title) return;
    if (isEditing && formEvent.id) {
      setEvents(prev => prev.map(e => e.id === formEvent.id ? (formEvent as Event) : e));
    } else {
      const e: Event = { ...formEvent as Event, id: Date.now().toString() };
      setEvents(prev => [...prev, e]);
    }
    setShowAddModal(false);
    setIsEditing(false);
    setFormEvent({ title: '', time: '12:00', type: 'Work', date: todayStr, link: '' });
  };

  const filteredItems = useMemo(() => {
    return allDisplayItems.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allDisplayItems, searchTerm]);

  const filteredForSelectedDay = useMemo(() => {
    const dateStr = selectedDay.toISOString().split('T')[0];
    return filteredItems.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredItems, selectedDay]);

  const weekEvents = useMemo(() => {
    const startOfWeek = new Date(selectedDay);
    startOfWeek.setDate(selectedDay.getDate() - selectedDay.getDay());
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      week.push({ date: d, items: filteredItems.filter(e => e.date === dateStr) });
    }
    return week;
  }, [filteredItems, selectedDay]);

  const renderYearMonth = (year: number, monthIndex: number) => {
    const monthDate = new Date(year, monthIndex, 1);
    const totalDays = daysInMonth(monthDate);
    const startDay = firstDayOfMonth(monthDate);
    const monthName = monthNames[monthIndex];

    return (
      <div key={monthIndex} className="p-4 bg-slate-900/40 border border-slate-800 rounded-[2rem] hover:bg-slate-800/40 transition-all cursor-pointer group" onClick={() => { setCurrentDate(monthDate); setViewMode('Month'); }}>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 group-hover:text-indigo-400 transition-colors">{monthName}</h4>
        <div className="grid grid-cols-7 gap-1 text-[8px] font-black text-center">
          {weekDays.map(d => <div key={d} className="text-slate-800 pb-1">{d.charAt(0)}</div>)}
          {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const hasItems = filteredItems.some(e => e.date === dateStr);
            return (
              <div key={dayNum} className={`aspect-square flex items-center justify-center rounded-md relative ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>
                {dayNum}
                {hasItems && !isToday && <div className="absolute bottom-0 w-1 h-1 bg-indigo-500 rounded-full"></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
      
      {/* HEADER PRINCIPAL */}
      <header className="px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-10 gap-4 lg:gap-0">
        <div className="flex items-center gap-4 lg:gap-10 w-full lg:w-auto">
          <div className="flex items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 p-1 shadow-inner overflow-hidden">
            <button onClick={handlePrev} className="p-2 lg:p-3.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95"><ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" /></button>
            <div className="w-px h-6 lg:h-8 bg-slate-200 dark:bg-slate-800/50"></div>
            <button onClick={handleToday} className="px-4 lg:px-10 py-1.5 lg:py-2 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95">HOJE</button>
            <div className="w-px h-6 lg:h-8 bg-slate-200 dark:bg-slate-800/50"></div>
            <button onClick={handleNext} className="p-2 lg:p-3.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95"><ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" /></button>
          </div>
          
          <div className="flex items-baseline gap-2 lg:gap-4">
             <h2 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                {viewMode === 'Year' ? 'CALENDÁRIO' : monthNames[currentDate.getMonth()]}
             </h2>
             <span className="text-lg lg:text-3xl font-black text-slate-300 dark:text-slate-700 leading-none">{currentDate.getFullYear()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6 w-full lg:w-auto overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner shrink-0">
            {(['Day', 'Week', 'Month', 'Year'] as ViewMode[]).map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 lg:px-6 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'}`}
              >
                {mode === 'Day' ? 'DIA' : mode === 'Week' ? 'SEMANA' : mode === 'Month' ? 'MÊS' : 'ANO'}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl py-2 lg:py-3 pl-9 lg:pl-12 pr-4 lg:pr-6 text-[10px] lg:text-xs font-bold text-slate-700 dark:text-slate-300 outline-none w-32 lg:w-56 focus:border-indigo-500/50 transition-all" 
            />
          </div>

          <button 
            onClick={() => { setIsEditing(false); setFormEvent({ title: '', date: todayStr, time: '12:00', type: 'Work', link: '' }); setShowAddModal(true); }} 
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl lg:rounded-2xl shadow-xl active:scale-90 transition-all border border-indigo-500/30 shrink-0"
          >
            <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 lg:p-8">
             <div className="grid grid-cols-7 gap-1 text-center mb-4 lg:mb-6">
                {weekDays.map(d => <div key={d} className="text-[8px] lg:text-[9px] font-black text-slate-300 dark:text-slate-700">{d.charAt(0)}</div>)}
                {Array.from({ length: firstDayOfMonth(currentDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth(currentDate) }).map((_, i) => {
                  const day = i + 1;
                  const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = isSameDay(thisDate, new Date());
                  const isSelected = isSameDay(thisDate, selectedDay);
                  const hasItems = filteredItems.some(e => e.date === thisDate.toISOString().split('T')[0]);
                  
                  return (
                    <button 
                      key={day}
                      onClick={() => { setSelectedDay(thisDate); setViewMode('Day'); }}
                      className={`aspect-square text-[9px] lg:text-[10px] font-black rounded-lg transition-all flex flex-col items-center justify-center relative ${
                        isSelected ? 'bg-indigo-600 text-white shadow-lg' : 
                        isToday ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 
                        'text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-sm'
                      }`}
                    >
                      {day}
                      {hasItems && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></div>}
                    </button>
                  );
                })}
             </div>

             <div className="pt-4 lg:pt-8 space-y-4 lg:space-y-6">
                <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3 lg:pb-5">
                   <div>
                      <h3 className="text-[8px] lg:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1">PROGRAMAÇÃO</h3>
                      <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                         {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long' })}
                      </p>
                   </div>
                   <span className="text-2xl lg:text-4xl font-black text-slate-200 dark:text-slate-800 leading-none">{selectedDay.getDate()}</span>
                </div>

                <div className="space-y-3 lg:space-y-4">
                   {filteredForSelectedDay.map(item => (
                     <div 
                        key={item.id}
                        onClick={() => setSelectedEvent(item)}
                        className={`p-3 lg:p-5 border rounded-2xl lg:rounded-3xl hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden group ${getEventColor(item)} bg-opacity-10 shadow-sm`}
                     >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getEventColor(item).split(' ')[0]} opacity-100`}></div>
                        <div className="flex justify-between items-start mb-1.5 lg:mb-2">
                           <span className="text-[8px] lg:text-[9px] font-black opacity-60 uppercase tracking-widest">{item.time}</span>
                           {item.isCompleted ? <CheckCircle2 className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-emerald-600 dark:text-emerald-500" /> : <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${getEventColor(item).split(' ')[0]}`}></div>}
                        </div>
                        <h4 className="font-bold text-xs lg:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">{item.title}</h4>
                     </div>
                   ))}
                   {filteredForSelectedDay.length === 0 && (
                     <div className="py-10 lg:py-16 text-center opacity-20 flex flex-col items-center">
                        <CalendarIcon className="w-6 h-6 lg:w-8 lg:h-8 mb-3 lg:mb-4 text-slate-900 dark:text-white" />
                        <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Agenda Livre</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </aside>

        {/* MAIN GRID */}
        <main className="flex-1 bg-slate-50/20 dark:bg-slate-950/20 overflow-y-auto custom-scrollbar">
           {viewMode === 'Month' && (
             <div className="grid grid-cols-7 h-full border-l border-slate-200 dark:border-slate-800">
                {weekDays.map(d => (
                  <div key={d} className="bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">{d}</span>
                  </div>
                ))}
                {Array.from({ length: firstDayOfMonth(currentDate) }).map((_, i) => <div key={`empty-main-${i}`} className="border-b border-r border-slate-200/20 dark:border-slate-800/20 bg-slate-100/10 dark:bg-slate-950/10" />)}
                {Array.from({ length: daysInMonth(currentDate) }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayItems = filteredItems.filter(e => e.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
                  const isToday = dateStr === todayStr;
                  
                  return (
                    <div key={day} className={`min-h-[160px] border-b border-r border-slate-200 dark:border-slate-800/40 p-4 transition-all group hover:bg-white dark:hover:bg-slate-900/40 ${isToday ? 'bg-indigo-600/5' : ''}`}>
                      <div className="flex justify-between items-center mb-4">
                         <span className={`text-sm font-black ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-200 dark:text-slate-700'}`}>{day}</span>
                      </div>
                      <div className="space-y-1.5">
                         {dayItems.map(item => (
                           <div 
                             key={item.id}
                             onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(item); }}
                             className={`px-3 py-1.5 rounded-xl text-[9px] font-black truncate cursor-pointer shadow-lg hover:scale-105 transition-transform ${getEventColor(item)}`}
                           >
                             {item.time} {item.title}
                           </div>
                         ))}
                      </div>
                    </div>
                  );
                })}
             </div>
           )}

           {viewMode === 'Week' && (
              <div className="grid grid-cols-7 h-full divide-x divide-slate-200 dark:divide-slate-800 border-l border-slate-200 dark:border-slate-800">
                 {weekEvents.map((dayData, i) => {
                    const dateStr = dayData.date.toISOString().split('T')[0];
                    const isToday = dateStr === todayStr;
                    return (
                       <div key={i} className={`flex flex-col min-h-full ${isToday ? 'bg-indigo-600/5' : ''}`}>
                          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{weekDays[dayData.date.getDay()]}</p>
                             <p className={`text-3xl font-black ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-200 dark:text-slate-700'}`}>{dayData.date.getDate()}</p>
                          </div>
                          <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                             {dayData.items.map(item => (
                                <div key={item.id} onClick={() => setSelectedEvent(item)} className={`p-4 rounded-3xl border cursor-pointer hover:border-indigo-500/30 transition-all shadow-sm ${getEventColor(item)}`}>
                                   <p className="text-[8px] font-black opacity-50 uppercase mb-1">{item.time}</p>
                                   <p className="text-[11px] font-black uppercase tracking-tighter leading-tight">{item.title}</p>
                                </div>
                             ))}
                          </div>
                       </div>
                    );
                 })}
              </div>
           )}

           {viewMode === 'Day' && (
              <div className="p-6 lg:p-12 space-y-8 animate-in slide-in-from-right-4 max-w-4xl mx-auto">
                 <div className="mb-8 lg:mb-12">
                    <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-2">CRONOGRAMA DO DIA</h3>
                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</h2>
                 </div>

                 <div className="space-y-6 relative pl-8 lg:pl-12 border-l border-slate-200 dark:border-slate-800 ml-4 lg:ml-6">
                    {Array.from({ length: 24 }).map((_, hour) => {
                       const hourStr = String(hour).padStart(2, '0');
                       const hourItems = filteredForSelectedDay.filter(e => e.time.startsWith(hourStr));
                       
                       return (
                          <div key={hour} className="relative py-2 min-h-[80px]">
                             <div className="absolute -left-[58px] top-4 text-[10px] font-black text-slate-400 dark:text-slate-700 tracking-widest tabular-nums w-10 text-right">{hourStr}:00</div>
                             <div className="absolute -left-[14px] top-5 w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl"></div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hourItems.map(item => (
                                   <div key={item.id} onClick={() => setSelectedEvent(item)} className={`p-6 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800/40 hover:scale-[1.02] transition-all cursor-pointer ${getEventColor(item)}`}>
                                      <div className="flex justify-between items-start mb-3">
                                         <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">{item.time}</span>
                                         {item.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-white/20"></div>}
                                      </div>
                                      <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">{item.title}</h4>
                                   </div>
                                ))}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           )}

           {viewMode === 'Year' && (
              <div className="p-6 lg:p-12 animate-in fade-in duration-700">
                 <div className="mb-8 lg:mb-12">
                    <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-2">VISUALIZAÇÃO ANUAL</h3>
                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{currentDate.getFullYear()}</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {Array.from({ length: 12 }).map((_, i) => renderYearMonth(currentDate.getFullYear(), i))}
                 </div>
              </div>
           )}
        </main>
      </div>

      {/* MODAL DETALHES DO COMPROMISSO */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90" onClick={() => setSelectedEvent(null)}></div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[3.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
              <div className={`h-2.5 w-full ${getEventColor(selectedEvent)}`}></div>
              <div className="p-8 lg:p-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                 <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedEvent.title}</h3>
                 <button onClick={() => setSelectedEvent(null)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 lg:p-10 space-y-6 lg:space-y-8">
                 <div className="flex items-center gap-5">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"><Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">HORÁRIO</p>
                       <p className="text-sm lg:text-base font-black text-slate-900 dark:text-white uppercase">{new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} • {selectedEvent.time}</p>
                    </div>
                 </div>

                 {selectedEvent.link && (
                   <div className="flex items-center gap-5">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><LinkIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
                      <div className="flex-1 overflow-hidden">
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">LINK DE ACESSO</p>
                         <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer" className="text-xs lg:text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-2 truncate">
                            {selectedEvent.link} <ExternalLink className="w-3.5 h-3.5" />
                         </a>
                      </div>
                   </div>
                 )}

                 <div className="flex items-center gap-5">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"><MapPin className="w-6 h-6 text-slate-400 dark:text-slate-500" /></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">LOCAL</p>
                       <p className="text-sm lg:text-base font-black text-slate-900 dark:text-white uppercase">AMBIENTE DIGITAL / MEET</p>
                    </div>
                 </div>

                 <div className="pt-6 lg:pt-8 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                    <button 
                      onClick={() => { setIsEditing(true); setFormEvent(selectedEvent); setShowAddModal(true); setSelectedEvent(null); }} 
                      className="flex-1 py-4 lg:py-5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 text-slate-900 dark:text-white hover:text-white rounded-3xl font-black text-[10px] lg:text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10"
                    >
                      EDITAR
                    </button>
                    <button 
                      onClick={() => { setEvents(prev => prev.filter(e => e.id !== selectedEvent.id)); setSelectedEvent(null); }} 
                      className="px-5 lg:px-6 py-4 lg:py-5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-500 hover:text-white rounded-3xl font-black transition-all border border-rose-500/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90" onClick={() => setShowAddModal(false)}></div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[3.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
              <div className="p-8 lg:p-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                      {isEditing ? <Edit2 className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{isEditing ? 'EDITAR COMPROMISSO' : 'NOVO COMPROMISSO'}</h3>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-all"><X /></button>
              </div>
              <div className="p-8 lg:p-10 overflow-y-auto custom-scrollbar space-y-6 lg:space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">TÍTULO DO EVENTO</label>
                    <input type="text" value={formEvent.title} onChange={e => setFormEvent({...formEvent, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 lg:py-5 outline-none text-slate-900 dark:text-white font-black text-lg lg:text-xl placeholder:opacity-20 focus:border-indigo-500/40 transition-all" placeholder="Ex: Call Estratégica" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">DATA</label>
                       <input type="date" value={formEvent.date} onChange={e => setFormEvent({...formEvent, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold focus:border-indigo-500/40" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">HORÁRIO</label>
                       <input type="time" value={formEvent.time} onChange={e => setFormEvent({...formEvent, time: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold focus:border-indigo-500/40" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> LINK DE ACESSO (GOOGLE MEET / ZOOM)</label>
                    <input type="url" value={formEvent.link} onChange={e => setFormEvent({...formEvent, link: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 outline-none text-slate-900 dark:text-white font-bold text-sm focus:border-indigo-500/40" placeholder="https://meet.google.com/..." />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">CATEGORIA</label>
                    <div className="flex gap-3">
                       {['Work', 'Personal', 'Meeting'].map(type => (
                          <button 
                            key={type} 
                            onClick={() => setFormEvent({...formEvent, type: type as any})} 
                            className={`flex-1 py-3 lg:py-4 rounded-2xl border font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all ${formEvent.type === type ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700'}`}
                          >
                            {type === 'Work' ? 'TRABALHO' : type === 'Personal' ? 'PESSOAL' : 'REUNIÃO'}
                          </button>
                       ))}
                    </div>
                 </div>
                 <button onClick={handleSaveEvent} className="w-full py-5 lg:py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all border border-indigo-500/30">CONSOLIDAR NA AGENDA</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
