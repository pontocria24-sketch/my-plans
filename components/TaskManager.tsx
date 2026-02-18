
import React, { useState } from 'react';
import { 
  Plus, Search, Calendar, User, CheckSquare, Trash2, X, Edit3, ListTodo, 
  Pause, AlertCircle, RefreshCw, Video, Tag, ChevronRight, LayoutList, 
  Check, Share2, GripVertical, Info, LayoutGrid, List, MoreVertical, AlignLeft,
  Zap, Square
} from 'lucide-react';
import { Task, Priority, Status, SubTask } from '../types';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

type ViewType = 'Kanban' | 'List';

const TaskManager: React.FC<Props> = ({ tasks, setTasks }) => {
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState<ViewType>('Kanban');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    responsible: 'Eu',
    status: 'Pending',
    category: 'Geral',
    subTasks: [],
    isRecurring: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    progress: 0
  });

  const statuses: { id: Status; label: string; color: string }[] = [
    { id: 'Pending', label: 'A Fazer', color: 'bg-slate-500' },
    { id: 'InProgress', label: 'Executando', color: 'bg-indigo-500' },
    { id: 'Paused', label: 'Pausado', color: 'bg-amber-500' },
    { id: 'AwaitingPost', label: 'Aguardando Postagem', color: 'bg-violet-500' },
    { id: 'Completed', label: 'Concluído', color: 'bg-emerald-500' }
  ];

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'High', label: 'Alta', color: 'text-rose-500' },
    { value: 'Medium', label: 'Média', color: 'text-amber-500' },
    { value: 'Low', label: 'Baixa', color: 'text-emerald-500' }
  ];

  const calculateProgress = (subTasks: SubTask[]) => {
    if (!subTasks || subTasks.length === 0) return 0;
    const completed = subTasks.filter(st => st.completed).length;
    return Math.round((completed / subTasks.length) * 100);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Crítico: Permite que o drop aconteça
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget as HTMLElement;
    target.classList.add('bg-indigo-500/5', 'border-indigo-500/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('bg-indigo-500/5', 'border-indigo-500/20');
  };

  const updateTaskStatus = (taskId: string, newStatus: Status) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        let pausedReason = t.pausedReason;
        if (newStatus === 'Paused') {
          const reason = prompt('Qual o motivo da pausa?', t.pausedReason || '');
          if (reason !== null) pausedReason = reason;
        }

        let updatedSubTasks = [...(t.subTasks || [])];
        if (newStatus === 'Completed') {
          updatedSubTasks = updatedSubTasks.map(st => ({ ...st, completed: true }));
        }

        return { 
          ...t, 
          status: newStatus, 
          subTasks: updatedSubTasks, 
          progress: newStatus === 'Completed' ? 100 : calculateProgress(updatedSubTasks),
          pausedReason: newStatus === 'Paused' ? pausedReason : undefined 
        };
      }
      return t;
    }));
  };

  const handleDrop = (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('bg-indigo-500/5', 'border-indigo-500/20');
    
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, newStatus);
    }
  };

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
        responsible: 'Eu',
        status: 'Pending',
        category: 'Geral',
        subTasks: [],
        isRecurring: false,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        progress: 0
      });
    }
    setNewSubTaskTitle('');
    setShowModal(true);
  };

  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    const newSub: SubTask = {
      id: Date.now().toString(),
      title: newSubTaskTitle.trim(),
      completed: false
    };
    const updatedSubTasks = [...(formData.subTasks || []), newSub];
    setFormData({ 
      ...formData, 
      subTasks: updatedSubTasks,
      progress: calculateProgress(updatedSubTasks)
    });
    setNewSubTaskTitle('');
  };

  const toggleSubTask = (id: string) => {
    const updatedSubTasks = (formData.subTasks || []).map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setFormData({ 
      ...formData, 
      subTasks: updatedSubTasks,
      progress: calculateProgress(updatedSubTasks)
    });
  };

  const removeSubTask = (id: string) => {
    const updatedSubTasks = (formData.subTasks || []).filter(st => st.id !== id);
    setFormData({ 
      ...formData, 
      subTasks: updatedSubTasks,
      progress: calculateProgress(updatedSubTasks)
    });
  };

  const handleSaveTask = () => {
    if (!formData.title?.trim()) return;
    const taskToSave: Task = {
      ...(formData as Task),
      id: editingTask?.id || Date.now().toString(),
    };

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? taskToSave : t));
    } else {
      setTasks(prev => [taskToSave, ...prev]);
    }
    setShowModal(false);
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Deseja excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.responsible.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Tarefas</h2>
          <p className="text-slate-500 text-sm font-medium">Ecossistema de produtividade pessoal</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button onClick={() => setViewType('List')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'List' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}><List className="w-3.5 h-3.5" /> Lista</button>
            <button onClick={() => setViewType('Kanban')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'Kanban' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid className="w-3.5 h-3.5" /> Kanban</button>
          </div>

          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input type="text" placeholder="Filtrar..." className="bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 outline-none focus:ring-4 ring-indigo-500/10 text-xs w-full sm:w-64 transition-all font-medium text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 md:py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 border border-indigo-500/30"><Plus className="w-4 h-4" /> Nova Tarefa</button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewType === 'Kanban' ? (
        <div className="flex-1 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4">
          <div className="flex gap-6 min-w-max h-full items-start">
            {statuses.map(column => (
              <div 
                key={column.id} 
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onDrop={(e) => handleDrop(e, column.id)} 
                className={`flex-1 flex flex-col min-w-[280px] md:min-w-[320px] max-w-[380px] rounded-[2.5rem] border p-5 transition-all min-h-[65vh] ${column.id === 'InProgress' ? 'bg-indigo-500/[0.03] border-indigo-500/20 shadow-lg' : 'bg-slate-900/20 border-slate-800/60'}`}
              >
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-lg shadow-black/50`}></div>
                    <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-white/90">{column.label}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-slate-950 text-slate-500 border border-slate-800/50">{filteredTasks.filter(t => t.status === column.id).length}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {filteredTasks.filter(t => t.status === column.id).map(task => {
                    const priorityObj = priorities.find(p => p.value === task.priority) || priorities[1];
                    const subTasksCount = task.subTasks?.length || 0;
                    const completedSubTasks = task.subTasks?.filter(st => st.completed).length || 0;

                    return (
                      <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, task.id)} 
                        onDragEnd={handleDragEnd} 
                        onClick={() => openModal(task)} 
                        className="group bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${priorityObj.value === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : priorityObj.value === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            {priorityObj.label}
                          </span>
                          <GripVertical className="w-3 h-3 text-slate-700 group-hover:text-slate-500" />
                        </div>
                        
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mb-4 font-medium italic">"{task.description || 'Nenhuma descrição'}"</p>
                        
                        {subTasksCount > 0 && (
                          <div className="bg-slate-950/40 p-3 rounded-2xl mb-4 border border-slate-800/40">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sub-tarefas</span>
                                <span className="text-[9px] font-black text-indigo-400">{completedSubTasks}/{subTasksCount}</span>
                             </div>
                             <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${task.progress}%` }}></div>
                             </div>
                          </div>
                        )}

                        {task.status === 'Paused' && task.pausedReason && (
                           <div className="bg-amber-500/5 p-3 rounded-xl mb-4 border border-amber-500/10 text-[9px] text-amber-500/80 font-bold italic flex items-center gap-2">
                             <Info className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{task.pausedReason}</span>
                           </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/40">
                          <div className="flex items-center gap-1.5 text-slate-500"><Calendar className="w-3 h-3 text-indigo-400" /><span className="text-[9px] font-black uppercase">{new Date(task.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></div>
                          <div className="flex items-center gap-1.5"><span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{task.responsible}</span><div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-[9px] font-black text-indigo-400">{task.responsible.charAt(0)}</div></div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredTasks.filter(t => t.status === column.id).length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-800/30 rounded-[2rem] opacity-20">
                      <ListTodo className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Tarefa</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Prioridade</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Responsável</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ações</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTasks.map(task => (
                    <tr key={task.id} onClick={() => openModal(task)} className="hover:bg-slate-800/30 transition-all cursor-pointer group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-all">{task.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-xs">{task.description}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <select onClick={(e) => e.stopPropagation()} onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)} value={task.status} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-700 bg-slate-950 text-slate-300 cursor-pointer outline-none focus:ring-2 ring-indigo-500/30 transition-all">
                          {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {(priorities.find(p => p.value === task.priority) || priorities[1]).label}
                        </span>
                      </td>
                      <td className="px-8 py-5"><span className="text-xs font-bold text-slate-400">{task.responsible}</span></td>
                      <td className="px-8 py-5 text-right"><button onClick={(e) => deleteTask(e, task.id)} className="p-2.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all rounded-xl"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Tarefa */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
            <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-all"><X /></button>
            </div>
            
            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CheckSquare className="w-3 h-3 text-indigo-400" /> Nome da Tarefa</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:ring-4 ring-indigo-500/10 transition-all placeholder:opacity-20" value={formData.title} placeholder="Título da demanda..." onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><AlignLeft className="w-3 h-3 text-indigo-400" /> Descrição Detalhada</label>
                      <textarea className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-slate-300 font-medium h-48 resize-none focus:ring-4 ring-indigo-500/10 transition-all placeholder:opacity-20" value={formData.description} placeholder="Notas adicionais, links..." onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>

                  {/* Sub-tarefas no Modal */}
                  <div className="space-y-6 bg-slate-950/40 p-6 md:p-8 rounded-[2.5rem] border border-slate-800/60">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ListTodo className="w-4 h-4 text-indigo-400" /> Checklist de Execução</label>
                       <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{formData.progress}%</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Adicionar sub-tarefa..." 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500 transition-all text-white font-medium"
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                      />
                      <button onClick={handleAddSubTask} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"><Plus className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                       {formData.subTasks?.map((st) => (
                         <div key={st.id} className="group flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all shadow-sm">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleSubTask(st.id)}>
                               <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${st.completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-700 bg-slate-950'}`}>
                                  {st.completed && <Check className="w-4 h-4 text-white" />}
                               </div>
                               <span className={`text-sm font-bold transition-all ${st.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{st.title}</span>
                            </div>
                            <button onClick={() => removeSubTask(st.id)} className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       ))}
                       {(!formData.subTasks || formData.subTasks.length === 0) && (
                         <div className="text-center py-10 opacity-10">
                            <ListTodo className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma sub-tarefa</p>
                         </div>
                       )}
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3 text-indigo-400" /> Início</label>
                    <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold transition-all focus:ring-4 ring-indigo-500/10" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3 text-indigo-400" /> Término</label>
                    <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold transition-all focus:ring-4 ring-indigo-500/10" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3 text-indigo-400" /> Responsável</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-white font-bold transition-all focus:ring-4 ring-indigo-500/10" value={formData.responsible} onChange={(e) => setFormData({...formData, responsible: e.target.value})} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-indigo-400" /> Nível de Urgência</label>
                    <div className="flex gap-4">
                       {priorities.map(p => (
                         <button 
                          key={p.value} 
                          onClick={() => setFormData({...formData, priority: p.value})}
                          className={`flex-1 py-4 md:py-5 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.priority === p.value ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                         >
                           {p.label}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">Status do Fluxo</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 md:py-5 outline-none text-white font-black uppercase tracking-widest text-[11px] transition-all focus:ring-4 ring-indigo-500/10" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as Status})}>
                       {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-800 flex justify-end gap-4 bg-slate-950/20">
              <button onClick={() => setShowModal(false)} className="px-8 md:px-10 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-all">Cancelar</button>
              <button onClick={handleSaveTask} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 md:px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 border border-indigo-500/30">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
