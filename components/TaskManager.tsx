
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Calendar, CheckSquare, Trash2, X, Edit3, 
  Zap, AlertCircle, Sparkles, Filter, LayoutGrid, List, ChevronRight,
  GripVertical
} from 'lucide-react';
import { Task, Priority, Status } from '../types';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

type GroupBy = 'Status' | 'Priority';

const TaskManager: React.FC<Props> = ({ tasks, setTasks }) => {
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('Status');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    category: 'Geral',
    responsible: 'Eu',
    subTasks: [],
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const priorities: { value: Priority; label: string; color: string; bg: string; border: string; icon: any }[] = [
    { value: 'High', label: 'Alta Prioridade', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertCircle },
    { value: 'Medium', label: 'Média Prioridade', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Zap },
    { value: 'Low', label: 'Baixa Prioridade', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Sparkles }
  ];

  const statuses: { id: Status; label: string; color: string }[] = [
    { id: 'Pending', label: 'A Fazer', color: 'bg-slate-500' },
    { id: 'InProgress', label: 'Fazendo', color: 'bg-indigo-500' },
    { id: 'Completed', label: 'Feito', color: 'bg-emerald-500' }
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({ ...task });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        category: 'Geral',
        responsible: 'Eu',
        subTasks: [],
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title) return;
    const taskData = {
      ...formData,
      id: editingTask?.id || Date.now().toString(),
    } as Task;

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      setTasks(prev => [taskData, ...prev]);
    }
    setShowModal(false);
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Minhas Tarefas</h2>
          <p className="text-slate-500 text-sm font-medium">Organização por prioridade Alta, Média ou Baixa.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button 
              onClick={() => setGroupBy('Status')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${groupBy === 'Status' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Status
            </button>
            <button 
              onClick={() => setGroupBy('Priority')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${groupBy === 'Priority' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Prioridade
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-xs w-48 text-white focus:border-indigo-500 outline-none transition-all" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all border border-indigo-500/30">
            <Plus className="w-4 h-4" /> Nova Tarefa
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4">
        <div className="flex gap-6 min-w-max h-full">
          {(groupBy === 'Status' ? statuses : priorities).map((group: any) => (
            <div key={group.id || group.value} className="flex-1 flex flex-col min-w-[320px] bg-slate-900/20 rounded-[2.5rem] border border-slate-800/60 p-6 min-h-[60vh]">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  {group.icon ? <group.icon className={`w-4 h-4 ${group.color}`} /> : <div className={`w-2.5 h-2.5 rounded-full ${group.color}`}></div>}
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-white/90">{group.label}</h3>
                </div>
                <span className="text-[10px] px-3 py-1 rounded-full font-black bg-slate-950 text-slate-500 border border-slate-800">
                  {filteredTasks.filter(t => (groupBy === 'Status' ? t.status === group.id : t.priority === group.value)).length}
                </span>
              </div>

              <div className="space-y-4">
                {filteredTasks
                  .filter(t => (groupBy === 'Status' ? t.status === group.id : t.priority === group.value))
                  .map(task => {
                    const p = priorities.find(pri => pri.value === task.priority)!;
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => openModal(task)}
                        className="group bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.color.replace('text', 'bg')}`}></div>
                        <div className="flex justify-between items-start mb-3">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${p.bg} ${p.color} ${p.border}`}>
                             {p.label.split(' ')[0]}
                           </span>
                           <button onClick={(e) => deleteTask(task.id, e)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-500 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight">{task.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mb-4 italic">"{task.description || 'Sem descrição'}"</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase">{new Date(task.endDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                             {task.responsible.charAt(0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"><X /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">O que precisa ser feito?</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="Título da tarefa..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioridade</label>
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <button 
                      key={p.value} 
                      onClick={() => setFormData({...formData, priority: p.value})}
                      className={`flex-1 py-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.priority === p.value ? `${p.bg} ${p.color} ${p.border}` : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      {p.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold outline-none text-xs"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Status})}
                  >
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prazo</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold outline-none text-xs" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                onClick={handleSave} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4"
              >
                Salvar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
