
import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus, 
  History, 
  Hourglass, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  CalendarDays,
  Tag,
  Edit2,
  Clock,
  ArrowDownRight,
  ChevronLeft,
  ChevronUp
} from 'lucide-react';
import { Goal, GoalType, GoalHistory } from '../types';

interface Props {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const GoalTracker: React.FC<Props> = ({ goals, setGoals }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [showModal, setShowModal] = useState(false);
  const [selectedAuditGoal, setSelectedAuditGoal] = useState<Goal | null>(null);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [tempUpdateValue, setTempUpdateValue] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<Goal>>({
    title: '',
    category: 'Financeiro',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    type: 'Monthly',
    startDate: today,
    targetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    isArchived: false,
    history: []
  });

  const handleAddGoal = () => {
    if (!formData.title || !formData.targetValue) return;
    
    const initialValue = formData.currentValue || 0;
    const newGoal: Goal = {
      ...(formData as Goal),
      id: Date.now().toString(),
      monthReference: formData.type === 'Monthly' ? formData.targetDate?.slice(0, 7) || '' : 'Personalizado',
      history: [{ date: new Date().toISOString(), value: initialValue, change: initialValue }]
    };
    
    setGoals(prev => [newGoal, ...prev]);
    setShowModal(false);
  };

  const handleUpdateValue = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseFloat(tempUpdateValue);
    if (isNaN(newValue)) return;

    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const change = newValue - g.currentValue;
        const newHistory: GoalHistory = {
          date: new Date().toISOString(),
          value: newValue,
          change: change
        };
        const updatedGoal = { 
          ...g, 
          currentValue: newValue,
          history: [newHistory, ...(g.history || [])]
        };
        // Sincroniza se a auditoria estiver aberta
        if (selectedAuditGoal?.id === id) setSelectedAuditGoal(updatedGoal);
        return updatedGoal;
      }
      return g;
    }));
    setUpdatingGoalId(null);
    setTempUpdateValue('');
  };

  const { activeGoals, archivedGoals } = useMemo(() => {
    const active: Goal[] = [];
    const archived: Goal[] = [];

    goals.forEach(goal => {
      // ARQUIVAMENTO 100% AUTOMÁTICO BASEADO EM DATA
      const isExpired = goal.targetDate < today;
      if (isExpired) {
        archived.push(goal);
      } else {
        active.push(goal);
      }
    });

    return { 
      activeGoals: active.sort((a, b) => a.targetDate.localeCompare(b.targetDate)), 
      archivedGoals: archived.sort((a, b) => b.targetDate.localeCompare(a.targetDate)) 
    };
  }, [goals, today]);

  const currentList = activeTab === 'active' ? activeGoals : archivedGoals;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Header Estratégico */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-900/40 border border-slate-800 p-10 rounded-[3.5rem] relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Target className="w-6 h-6 text-indigo-400" />
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Gestão de Resultados</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">Diretrizes & Marcos</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            As metas expiram e são arquivadas automaticamente. <span className="text-indigo-400">Clique em um card</span> para auditar todas as evoluções e registros históricos.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="relative z-10 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all border border-indigo-500/30"
        >
          Nova Meta <Plus className="w-5 h-5" />
        </button>

        <div className="absolute top-[-20%] right-[-5%] opacity-5 pointer-events-none">
           <Target className="w-96 h-96 text-indigo-500" />
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800/60 pb-1">
        <div className="flex gap-10">
          <button 
            onClick={() => setActiveTab('active')}
            className={`text-xs font-black uppercase tracking-[0.2em] pb-5 transition-all relative ${activeTab === 'active' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Metas em Curso ({activeGoals.length})
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('archived')}
            className={`text-xs font-black uppercase tracking-[0.2em] pb-5 transition-all relative ${activeTab === 'archived' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Histórico (Expiradas) ({archivedGoals.length})
            {activeTab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
          </button>
        </div>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {currentList.map(goal => {
          const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
          const isExpired = goal.targetDate < today;
          const isCompleted = progress >= 100;
          const isUpdating = updatingGoalId === goal.id;
          
          return (
            <div 
              key={goal.id} 
              onClick={() => !isUpdating && setSelectedAuditGoal(goal)}
              className={`bg-slate-900/30 border border-slate-800/80 p-8 rounded-[3rem] transition-all flex flex-col group relative overflow-hidden cursor-pointer ${isExpired ? 'opacity-70 grayscale-[0.2] hover:grayscale-0' : 'hover:border-indigo-500/40 hover:bg-slate-900/50 shadow-xl'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${goal.type === 'Yearly' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      {goal.type === 'Monthly' ? 'Mensal' : goal.type === 'Yearly' ? 'Anual' : 'Personalizado'}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {goal.category}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-tighter">{goal.title}</h4>
                </div>
                {isCompleted ? (
                   <CheckCircle2 className="w-8 h-8 text-emerald-500 shadow-lg" />
                ) : isExpired ? (
                   <AlertCircle className="w-8 h-8 text-rose-500 shadow-lg" />
                ) : (
                   <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                   </div>
                )}
              </div>

              <div className="flex-1 space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aproveitamento</p>
                    <p className={`text-4xl font-black tabular-nums ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>{Math.round(progress)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Período</p>
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-tighter bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                      {new Date(goal.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {new Date(goal.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                     <div 
                        className={`h-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.3)] ${isCompleted ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-indigo-600'}`} 
                        style={{ width: `${progress}%` }}
                     ></div>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
                      <span>Atual: {goal.currentValue} {goal.unit}</span>
                      <span>Alvo: {goal.targetValue} {goal.unit}</span>
                   </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-[2rem] border border-slate-800/80 flex items-center justify-between shadow-inner">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                         <Hourglass className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tempo</p>
                         <p className="text-xs font-bold text-slate-300">
                            {isExpired ? 'Período Encerrado' : `${Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} dias restantes`}
                         </p>
                      </div>
                   </div>
                   <span className="text-sm font-black text-white tabular-nums">
                      {goal.currentValue}<span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">{goal.unit}</span>
                   </span>
                </div>
              </div>

              {/* Botão de Atualização Integrado */}
              {!isExpired && (
                <div className="mt-8">
                  {isUpdating ? (
                    <form 
                      onSubmit={(e) => handleUpdateValue(goal.id, e)} 
                      className="flex gap-2 animate-in slide-in-from-bottom-2 duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        autoFocus
                        type="number" 
                        value={tempUpdateValue}
                        onChange={(e) => setTempUpdateValue(e.target.value)}
                        placeholder="Novo Valor..."
                        className="flex-1 bg-slate-950 border border-indigo-500/50 rounded-2xl px-4 py-3 outline-none text-white font-bold text-xs"
                      />
                      <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button type="button" onClick={() => setUpdatingGoalId(null)} className="bg-slate-800 text-slate-400 p-3 rounded-2xl">
                        <X className="w-5 h-5" />
                      </button>
                    </form>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdatingGoalId(goal.id);
                        setTempUpdateValue(goal.currentValue.toString());
                      }}
                      className="w-full bg-slate-950 hover:bg-slate-800 text-indigo-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all border border-slate-800 flex items-center justify-center gap-2 group-hover:border-indigo-500/30 group-hover:bg-slate-900"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Atualizar Valor
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {currentList.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-900/10 border-4 border-dashed border-slate-800/40 rounded-[4rem] animate-pulse">
             <Target className="w-24 h-24 text-slate-800 mx-auto mb-8 opacity-20" />
             <h3 className="text-2xl font-black text-slate-600 uppercase tracking-tighter">Nenhum registro encontrado</h3>
             <p className="text-slate-500 mt-3 font-medium max-w-sm mx-auto">
               {activeTab === 'active' 
                 ? 'Suas metas ativas aparecerão aqui. Quando o prazo chegar, elas serão arquivadas automaticamente.' 
                 : 'Seu histórico de conquistas aparecerá aqui após o encerramento dos prazos.'}
             </p>
          </div>
        )}
      </div>

      {/* MODAL DE AUDITORIA DE HISTÓRICO (Timeline) */}
      {selectedAuditGoal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90" onClick={() => setSelectedAuditGoal(null)}></div>
           <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3.5rem] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                       <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Auditoria de Meta</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Timeline de Evolução & Marcos</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedAuditGoal(null)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-all border border-slate-700 shadow-md"><X /></button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                 <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-slate-800/60 shadow-inner">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{selectedAuditGoal.title}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{selectedAuditGoal.category}</span>
                      <span className="text-xs font-bold text-indigo-400">{Math.round((selectedAuditGoal.currentValue / selectedAuditGoal.targetValue) * 100)}% concluído</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <History className="w-4 h-4 text-indigo-400" /> Histórico de Alterações
                    </h4>
                    <div className="space-y-4 relative pl-8 border-l border-slate-800 ml-4 py-2">
                       {selectedAuditGoal.history && selectedAuditGoal.history.length > 0 ? selectedAuditGoal.history.map((h, i) => (
                         <div key={i} className="relative group">
                            <div className={`absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-8 ring-slate-900 shadow-lg transition-all ${h.change >= 0 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}></div>
                            <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/50 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                               <div>
                                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{new Date(h.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                  <p className="text-lg font-black text-slate-200">{h.value} <span className="text-xs text-slate-500 uppercase font-bold">{selectedAuditGoal.unit}</span></p>
                               </div>
                               <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] ${h.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                  {h.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                  {Math.abs(h.change)} {selectedAuditGoal.unit}
                               </div>
                            </div>
                         </div>
                       )) : (
                         <div className="text-slate-600 italic text-sm">Nenhum registro de alteração ainda.</div>
                       )}
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-800 flex justify-end bg-slate-950/20">
                 <button onClick={() => setSelectedAuditGoal(null)} className="px-10 py-4 bg-slate-800 hover:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl">Fechar Detalhes</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Criação Estratégica */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowModal(false)}></div>
           <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3.5rem] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                       <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Configurar Diretriz</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Defina o alvo e o período de execução</p>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-all border border-slate-700 shadow-md"><X /></button>
              </div>
              
              <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Tag className="w-3.5 h-3.5 text-indigo-400" /> Título da Meta Estratégica
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:ring-4 ring-indigo-500/10 transition-all placeholder:opacity-20 shadow-inner"
                      placeholder="Ex: Faturamento Anual de Vendas Premium"
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria de Foco</label>
                       <select 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold uppercase tracking-widest text-xs shadow-inner"
                         onChange={(e) => setFormData({...formData, category: e.target.value})}
                       >
                         <option value="Financeiro">Financeiro</option>
                         <option value="Marketing">Marketing</option>
                         <option value="Pessoal">Pessoal</option>
                         <option value="Growth">Growth</option>
                         <option value="Educação">Educação</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ciclo Temporal</label>
                       <select 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold uppercase tracking-widest text-xs shadow-inner"
                         onChange={(e) => setFormData({...formData, type: e.target.value as GoalType})}
                       >
                         <option value="Monthly">Mensal</option>
                         <option value="Yearly">Anual</option>
                         <option value="Custom">Período Customizado</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/40 p-8 rounded-[2.5rem] border border-slate-800/60 shadow-inner">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Data de Início</label>
                       <input 
                         type="date" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold shadow-inner"
                         value={formData.startDate}
                         onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Data Final (Prazo)</label>
                       <input 
                         type="date" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold shadow-inner"
                         value={formData.targetDate}
                         onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor Alvo</label>
                       <input 
                         type="number" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-black text-lg shadow-inner"
                         placeholder="0"
                         onChange={(e) => setFormData({...formData, targetValue: parseFloat(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor Atual</label>
                       <input 
                         type="number" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-black text-lg shadow-inner"
                         placeholder="0"
                         onChange={(e) => setFormData({...formData, currentValue: parseFloat(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unidade</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold shadow-inner"
                         placeholder="Ex: R$, un, %"
                         onChange={(e) => setFormData({...formData, unit: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-800 flex justify-end gap-5 bg-slate-950/20">
                 <button onClick={() => setShowModal(false)} className="px-10 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-all">Descartar</button>
                 <button 
                  onClick={handleAddGoal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-500/30 flex items-center gap-3"
                 >
                   Consolidar Meta <ArrowUpRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
