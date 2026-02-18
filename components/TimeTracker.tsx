
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, Square, Pause, RotateCcw, Timer, Calendar, TrendingUp, 
  AlertCircle, CheckCircle2, Coffee, Utensils, LogOut, ArrowLeftRight, 
  ChevronRight, Clock, Info, X, FileText, History, ArrowRight, Share2,
  Save, MessageSquareText, Check
} from 'lucide-react';
import { WorkLog, UserConfig, BreakType, WorkBreak } from '../types';

interface Props {
  workLogs: WorkLog[];
  setWorkLogs: React.Dispatch<React.SetStateAction<WorkLog[]>>;
  userConfig: UserConfig;
}

const TimeTracker: React.FC<Props> = ({ workLogs, setWorkLogs, userConfig }) => {
  const [elapsed, setElapsed] = useState(0);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showEarlyExitModal, setShowEarlyExitModal] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [earlyExitReason, setEarlyExitReason] = useState('');
  
  const todayDate = new Date().toISOString().split('T')[0];
  
  // Encontra o log ativo de forma estável
  const activeLog = workLogs.find(log => log.isActive);

  // Efeito do Cronômetro
  useEffect(() => {
    let interval: any;
    if (activeLog && !activeLog.isOnBreak) {
      interval = setInterval(() => {
        const start = new Date(activeLog.startTime).getTime();
        const now = new Date().getTime();
        const breakDuration = activeLog.breaks.reduce((acc, b) => {
          const bStart = new Date(b.start).getTime();
          const bEnd = b.end ? new Date(b.end).getTime() : now;
          return acc + (bEnd - bStart);
        }, 0);
        // GARANTIA: Nunca permite valor negativo para o estado elapsed
        setElapsed(Math.max(0, now - start - breakDuration));
      }, 1000);
    } else if (activeLog && activeLog.isOnBreak) {
      const start = new Date(activeLog.startTime).getTime();
      const lastBreak = activeLog.breaks[activeLog.breaks.length - 1];
      const lastBreakStart = new Date(lastBreak.start).getTime();
      const breakDurationUntilNow = activeLog.breaks.slice(0, -1).reduce((acc, b) => {
        const bStart = new Date(b.start).getTime();
        const bEnd = b.end ? new Date(b.end).getTime() : bStart;
        return acc + (bEnd - bStart);
      }, 0);
      // GARANTIA: Nunca permite valor negativo para o estado elapsed
      setElapsed(Math.max(0, lastBreakStart - start - breakDurationUntilNow));
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeLog]);

  const handleStart = () => {
    if (activeLog) return;
    const now = new Date();
    const newLog: WorkLog = {
      id: Date.now().toString(),
      date: todayDate,
      startTime: now.toISOString(),
      breaks: [],
      isActive: true,
      isOnBreak: false
    };
    setWorkLogs(prev => [newLog, ...prev]);
  };

  const handleToggleBreak = (type: BreakType) => {
    if (!activeLog) return;
    const now = new Date().toISOString();
    setWorkLogs(prev => prev.map(log => {
      if (log.id === activeLog.id) {
        if (log.isOnBreak) {
          const updatedBreaks = log.breaks.map((b, i) => 
            i === log.breaks.length - 1 ? { ...b, end: now } : b
          );
          return { ...log, isOnBreak: false, breaks: updatedBreaks };
        } else {
          return { ...log, isOnBreak: true, breaks: [...log.breaks, { start: now, type }] };
        }
      }
      return log;
    }));
  };

  const finalizeWork = useCallback((reason?: string) => {
    if (!activeLog) return;
    const now = new Date().toISOString();
    const currentId = activeLog.id;

    setWorkLogs(prev => prev.map(log => {
      if (log.id === currentId) {
        // Fecha pausas pendentes
        const updatedBreaks = log.breaks.map(b => !b.end ? { ...b, end: now } : b);
        
        return { 
          ...log, 
          isActive: false, 
          isOnBreak: false, 
          endTime: now,
          breaks: updatedBreaks,
          earlyEndReason: reason || log.earlyEndReason 
        };
      }
      return log;
    }));

    setElapsed(0);
    setShowEarlyExitModal(false);
    setShowConfirmEndModal(false);
    setEarlyExitReason('');
  }, [activeLog, setWorkLogs]);

  // FUNÇÃO REFINADA: Garante que nunca retorne strings com sinais negativos no meio
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const sec = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const calculateDailyTotal = (log: WorkLog) => {
    const start = new Date(log.startTime).getTime();
    const end = log.endTime ? new Date(log.endTime).getTime() : (log.isActive ? new Date().getTime() : start);
    const breakDuration = log.breaks.reduce((acc, b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = b.end ? new Date(b.end).getTime() : (log.isActive && log.isOnBreak && b === log.breaks[log.breaks.length-1] ? new Date().getTime() : bStart);
      return acc + (bEnd - bStart);
    }, 0);
    return Math.max(0, end - start - breakDuration);
  };

  const selectedLog = workLogs.find(l => l.id === selectedLogId);
  const dailyTotalMs = activeLog ? calculateDailyTotal(activeLog) : 0;
  const targetMs = (userConfig.dailyTargetHours || 8) * 3600000;
  const performance = targetMs > 0 ? (dailyTotalMs / targetMs) * 100 : 0;
  const currentBreakType = activeLog?.breaks.find(b => !b.end)?.type;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header e Controles de Ação Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-4 tracking-tighter uppercase text-white">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Timer className="text-white w-7 h-7" />
            </div>
            Gestão de Ponto
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Controle seu tempo com precisão estratégica.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {!activeLog ? (
            <button 
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-500/30"
            >
              <Play className="w-5 h-5 fill-current" /> Iniciar Expediente
            </button>
          ) : (
            <>
              {activeLog.isOnBreak ? (
                <button 
                  onClick={() => handleToggleBreak(currentBreakType || 'Generic')}
                  className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-600/20 border border-emerald-500/30"
                >
                  <RotateCcw className="w-5 h-5" /> Retornar do {currentBreakType === 'Lunch' ? 'Almoço' : 'Café'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleBreak('Coffee')}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all border border-slate-800"
                  >
                    <Coffee className="w-5 h-5" /> Pausa Café
                  </button>
                  <button 
                    onClick={() => handleToggleBreak('Lunch')}
                    className="bg-slate-900 hover:bg-slate-800 text-indigo-400 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all border border-slate-800"
                  >
                    <Utensils className="w-5 h-5" /> Pausa Almoço
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowEarlyExitModal(true)}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all border border-rose-500/20"
                >
                  <LogOut className="w-5 h-5" /> Sair Cedo
                </button>
                <button 
                  onClick={() => setShowConfirmEndModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-600/20 border border-rose-500/30"
                >
                  <Square className="w-5 h-5 fill-current" /> Encerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Painel Central de Visualização */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 bg-slate-900 border ${activeLog?.isOnBreak ? 'border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.05)]' : 'border-slate-800 shadow-2xl'} rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden transition-all duration-700`}>
          {activeLog?.isOnBreak && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-5 py-2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-full animate-pulse shadow-lg">
              Status: Pausa {currentBreakType === 'Lunch' ? 'Almoço' : 'Café'}
            </div>
          )}
          
          <div className="relative">
             <div className={`absolute -inset-12 ${activeLog?.isOnBreak ? 'bg-amber-500/10' : 'bg-indigo-500/10'} blur-[80px] rounded-full transition-all duration-1000`}></div>
             <h3 className={`text-9xl font-black tracking-tighter tabular-nums ${activeLog?.isOnBreak ? 'text-amber-400/60' : 'text-white'} drop-shadow-2xl transition-all duration-700 scale-100`}>
                {activeLog ? formatTime(elapsed) : "00:00:00"}
             </h3>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[11px] opacity-80">Tempo de Expediente Ativo</p>
        </div>

        {/* Card de Rendimento */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="space-y-10 relative z-10">
            <h4 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
              <TrendingUp className="text-indigo-400 w-6 h-6" /> Meta Diária
            </h4>
            
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Aproveitamento</span>
                  <span className="text-4xl font-black text-indigo-400 tabular-nums">{Math.round(performance)}%</span>
               </div>
               <div className="h-6 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-1 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full shadow-[0_0_25px_rgba(99,102,241,0.4)] ${performance >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(100, performance)}%` }}
                  ></div>
               </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-[2rem] space-y-4">
               {performance >= 100 ? (
                 <div className="flex items-start gap-4 text-emerald-500">
                    <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">Jornada concluída! Você atingiu sua meta líquida definida.</p>
                 </div>
               ) : (
                 <div className="flex items-start gap-4 text-amber-500">
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">Você está a {targetMs - dailyTotalMs > 0 ? formatTime(targetMs - dailyTotalMs) : '00:00:00'} de completar seu objetivo hoje.</p>
                 </div>
               )}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 relative z-10">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Previsão de Saída</p>
                   <p className="text-3xl font-black text-slate-200 tabular-nums">
                      {activeLog ? (
                         (() => {
                            const remainingMs = Math.max(0, targetMs - dailyTotalMs);
                            const estimate = new Date(Date.now() + remainingMs);
                            return estimate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                         })()
                      ) : "--:--"}
                   </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-[1.5rem] border border-slate-800 shadow-lg">
                   <Clock className="w-6 h-6 text-slate-600" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Histórico e Auditoria */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[550px]">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <h3 className="font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <History className="w-6 h-6 text-indigo-400" /> Registros de Ponto
             </h3>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">{workLogs.length} Registros</span>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 sticky top-0 z-10 border-b border-slate-800/50 backdrop-blur-md">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Data</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Fluxo</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Líquido</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {workLogs.length > 0 ? workLogs.sort((a,b) => b.date.localeCompare(a.date)).map(log => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLogId(log.id)}
                      className={`hover:bg-indigo-500/5 transition-all group cursor-pointer ${selectedLogId === log.id ? 'bg-indigo-500/10' : ''}`}
                    >
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-300">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white tabular-nums">{new Date(log.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <ArrowLeftRight className="w-3 h-3 text-slate-700" />
                            <span className={`text-xs font-bold tabular-nums ${log.isActive ? 'text-indigo-400 animate-pulse' : 'text-white'}`}>
                               {log.endTime ? new Date(log.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (log.isActive ? 'Ativo' : '--:--')}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-2 rounded-full text-[11px] font-black tracking-tighter border shadow-sm ${log.isActive ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                          {formatTime(calculateDailyTotal(log))}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex justify-end items-center gap-3">
                            {log.earlyEndReason && (
                               <div title="Saída Antecipada" className="bg-rose-500/20 p-1.5 rounded-lg border border-rose-500/30">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                               </div>
                            )}
                            <div className={`p-2 rounded-xl transition-all ${selectedLogId === log.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600 group-hover:text-slate-400'}`}>
                               <ChevronRight className="w-4 h-4" />
                            </div>
                         </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-600 italic text-sm font-medium">Nenhum registro no banco de dados.</td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Painel Lateral de Auditoria */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden h-[550px] flex flex-col">
           {selectedLog ? (
             <div className="flex flex-col h-full animate-in slide-in-from-right-6 duration-400">
               <div className="flex justify-between items-center mb-8">
                 <div>
                   <h4 className="text-lg font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                     <FileText className="w-5 h-5 text-indigo-400" /> Relatório Diário
                   </h4>
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{new Date(selectedLog.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                 </div>
                 <button onClick={() => setSelectedLogId(null)} className="p-3 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-500 transition-all">
                    <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-950 p-5 rounded-[2rem] border border-slate-800 shadow-inner">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Total Líquido</p>
                        <p className="text-xl font-black text-indigo-400 tabular-nums">{formatTime(calculateDailyTotal(selectedLog))}</p>
                     </div>
                     <div className="bg-slate-950 p-5 rounded-[2rem] border border-slate-800 shadow-inner">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Status Final</p>
                        <p className={`text-sm font-black uppercase tracking-tighter ${selectedLog.isActive ? 'text-amber-500' : 'text-emerald-500'}`}>
                           {selectedLog.isActive ? 'Em Aberto' : 'Finalizado'}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                        <History className="w-3.5 h-3.5 text-indigo-400" /> Linha do Tempo
                     </h5>
                     <div className="space-y-4 relative pl-4 border-l border-slate-800 ml-2 py-1">
                        <div className="relative">
                           <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900 shadow-sm"></div>
                           <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Início das Atividades</p>
                              <p className="text-xs font-bold text-slate-300">{new Date(selectedLog.startTime).toLocaleTimeString()}</p>
                           </div>
                        </div>

                        {selectedLog.breaks.map((b, i) => (
                           <React.Fragment key={i}>
                              <div className="relative">
                                 <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ring-4 ring-slate-900 shadow-sm ${b.type === 'Lunch' ? 'bg-indigo-500' : 'bg-amber-500'}`}></div>
                                 <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 flex justify-between items-center">
                                    <div>
                                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Saída para {b.type === 'Lunch' ? 'Almoço' : 'Café'}</p>
                                       <p className="text-xs font-bold text-slate-300">{new Date(b.start).toLocaleTimeString()}</p>
                                    </div>
                                    {b.type === 'Lunch' ? <Utensils className="w-3.5 h-3.5 text-indigo-400/50" /> : <Coffee className="w-3.5 h-3.5 text-amber-500/50" />}
                                 </div>
                              </div>
                              {b.end && (
                                <div className="relative">
                                   <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-slate-600 ring-4 ring-slate-900 shadow-sm"></div>
                                   <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Retorno do Intervalo</p>
                                      <p className="text-xs font-bold text-slate-300">{new Date(b.end).toLocaleTimeString()}</p>
                                   </div>
                                </div>
                              )}
                           </React.Fragment>
                        ))}

                        {selectedLog.endTime && (
                           <div className="relative">
                              <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ring-4 ring-slate-900 shadow-sm ${selectedLog.earlyEndReason ? 'bg-rose-500' : 'bg-slate-600'}`}></div>
                              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Encerramento</p>
                                 <p className="text-xs font-bold text-slate-300">{new Date(selectedLog.endTime).toLocaleTimeString()}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {selectedLog.earlyEndReason && (
                    <div className="bg-rose-500/10 p-6 rounded-[2rem] border border-rose-500/20 space-y-3 shadow-lg shadow-rose-900/5 animate-in slide-in-from-bottom-2 duration-300">
                       <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5" /> Justificativa de Saída
                       </h5>
                       <p className="text-xs font-medium text-rose-300/80 italic leading-relaxed bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                          "{selectedLog.earlyEndReason}"
                       </p>
                    </div>
                  )}
               </div>
               
               <div className="pt-4 mt-auto">
                  <button 
                    onClick={() => alert('Relatório exportado para o ecossistema myplans.')}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                     <Share2 className="w-4 h-4" /> Exportar Relatório
                  </button>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-40 group">
                <div className="p-10 bg-slate-950 rounded-full border-4 border-slate-800 border-dashed transition-all group-hover:scale-105 duration-300">
                   <FileText className="w-16 h-16 text-slate-700" />
                </div>
                <div className="space-y-3">
                   <h4 className="text-xl font-black text-slate-500 uppercase tracking-widest">Auditoria Vazia</h4>
                   <p className="text-xs font-medium text-slate-600 max-w-[240px] mx-auto leading-relaxed">Selecione um registro ao lado para detalhar sua jornada diária.</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* MODAL: Confirmação de Encerramento Padrão */}
      {showConfirmEndModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowConfirmEndModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-md rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <Square className="w-8 h-8 text-rose-500 fill-current" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Finalizar Dia?</h3>
                <p className="text-slate-500 text-sm font-medium">Você concluiu sua jornada de trabalho. Deseja realizar o encerramento agora?</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowConfirmEndModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-all border border-slate-800"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => finalizeWork()}
                  className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/20 transition-all active:scale-95 border border-rose-500/30"
                >
                  Encerrar Ponto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Saída Antecipada Obrigatória */}
      {showEarlyExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowEarlyExitModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-600/20">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Saída Antecipada</h3>
              </div>
              <button onClick={() => setShowEarlyExitModal(false)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-all"><X /></button>
            </div>
            
            <div className="p-8 md:p-10 space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <MessageSquareText className="w-4 h-4 text-rose-500" /> Motivo Obrigatório
                  </label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-slate-200 font-medium h-40 resize-none focus:ring-4 ring-rose-500/10 transition-all placeholder:opacity-20 shadow-inner"
                    placeholder="Descreva por que você está encerrando antes do horário previsto..."
                    value={earlyExitReason}
                    onChange={(e) => setEarlyExitReason(e.target.value)}
                  />
                  <div className="flex items-start gap-3 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                     <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-rose-300/60 font-medium italic">Sua justificativa será arquivada no log de auditoria do sistema.</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setShowEarlyExitModal(false)} 
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-all border border-slate-800"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={!earlyExitReason.trim()}
                    onClick={() => finalizeWork(earlyExitReason)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                      earlyExitReason.trim() 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95 border border-rose-500/30' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed border-slate-700'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Finalizar Dia
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
