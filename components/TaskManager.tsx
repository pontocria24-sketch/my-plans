
import React, { useState } from 'react';
import { 
  Plus, Search, Calendar, Trash2, X, CheckSquare, Zap, GripVertical
} from 'lucide-react';
import { Task, Priority, Status } from '../types.ts';
import {
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  columns: { id: string; label: string; color: string }[];
  setColumns: React.Dispatch<React.SetStateAction<{ id: string; label: string; color: string }[]>>;
}

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  label: string;
  color: string;
  count: number;
  onDelete?: () => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children, label, color, count, onDelete }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="w-[300px] lg:w-[380px] bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[3rem] p-4 lg:p-6 min-h-[60vh] flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-6 lg:mb-8 px-2 lg:px-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${color} shadow-lg shadow-black/40`}></div>
          <h3 className="font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] lg:text-[10px] font-black bg-white dark:bg-slate-950 px-2.5 py-0.5 lg:py-1 rounded-full text-slate-600 border border-slate-200 dark:border-slate-800">{count}</span>
          {onDelete && count === 0 && (
            <button onClick={onDelete} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

interface SortableTaskProps {
  task: Task;
  priorities: { value: Priority; label: string; color: string; bg: string }[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const SortableTask: React.FC<SortableTaskProps> = ({ task, priorities, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const prio = priorities.find(p => p.value === task.priority) || priorities[1];

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
      onClick={() => onEdit(task)}
    >
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-600 hover:text-indigo-400">
            <GripVertical className="w-4 h-4" />
          </div>
          <span className={`text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl border flex items-center gap-1.5 lg:gap-2 ${prio.color} ${prio.bg}/10 border-${prio.value === 'High' ? 'rose' : prio.value === 'Medium' ? 'amber' : 'emerald'}-500/20`}>
             <Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> {prio.label}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
          className="opacity-0 group-hover:opacity-100 p-1.5 lg:p-2 text-slate-400 dark:text-slate-600 hover:text-rose-500 transition-all bg-slate-50 dark:bg-slate-950 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </button>
      </div>
      <h4 className="text-base lg:text-lg font-black text-slate-900 dark:text-white mb-1.5 lg:mb-2 tracking-tight leading-tight uppercase">{task.title}</h4>
      <p className="text-[10px] lg:text-xs text-slate-500 line-clamp-2 italic mb-4 lg:mb-6">"{task.description || 'Nenhuma descrição detalhada...'}"</p>
      
      <div className="flex justify-between items-center pt-4 lg:pt-5 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> 
          {new Date(task.endDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})}
        </div>
        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-slate-50 dark:bg-slate-950 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[9px] lg:text-[10px] font-black text-indigo-400 shadow-inner">
          {task.responsible.charAt(0)}
        </div>
      </div>
    </div>
  );
};

const TaskManager: React.FC<Props> = ({ tasks, setTasks, columns, setColumns }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newColumnLabel, setNewColumnLabel] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
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
    { id: 'InProgress', label: 'Em Execução', color: 'bg-indigo-500' },
    { id: 'Completed', label: 'Concluído', color: 'bg-emerald-500' }
  ];

  const priorities: { value: Priority; label: string; color: string; bg: string }[] = [
    { value: 'High', label: 'Alta Prioridade', color: 'text-rose-500', bg: 'bg-rose-500' },
    { value: 'Medium', label: 'Prioridade Média', color: 'text-amber-500', bg: 'bg-amber-500' },
    { value: 'Low', label: 'Prioridade Baixa', color: 'text-emerald-500', bg: 'bg-emerald-500' }
  ];

  const handleSave = () => {
    if (!formData.title?.trim()) return;
    const task: Task = {
      ...(formData as Task),
      id: editingTask?.id || Date.now().toString(),
    };
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? task : t));
    } else {
      setTasks(prev => [task, ...prev]);
    }
    setShowModal(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleAddColumn = () => {
    if (!newColumnLabel.trim()) return;
    const newCol = {
      id: newColumnLabel.toLowerCase().replace(/\s+/g, '-'),
      label: newColumnLabel,
      color: 'bg-indigo-500'
    };
    setColumns(prev => [...prev, newCol]);
    setNewColumnLabel('');
    setShowColumnModal(false);
  };

  const handleDeleteColumn = (colId: string) => {
    setColumns(prev => prev.filter(c => c.id !== colId));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if dragging over a column or a task
    const overTask = tasks.find(t => t.id === overId);
    const isOverAColumn = columns.some(s => s.id === overId);

    if (overTask && activeTask.status !== overTask.status) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const overIndex = prev.findIndex(t => t.id === overId);
        
        const updatedTasks = [...prev];
        updatedTasks[activeIndex] = { ...activeTask, status: overTask.status };
        return arrayMove(updatedTasks, activeIndex, overIndex);
      });
    } else if (isOverAColumn && activeTask.status !== overId) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const updatedTasks = [...prev];
        updatedTasks[activeIndex] = { ...activeTask, status: overId as Status };
        return arrayMove(updatedTasks, activeIndex, updatedTasks.length - 1);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (activeTask && overTask && activeTask.status === overTask.status) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        const overIndex = prev.findIndex(t => t.id === overId);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6 px-2">
        <div>
          <h2 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-2 lg:gap-3">
             <CheckSquare className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-500" /> Fluxo de Trabalho
          </h2>
          <p className="text-slate-500 text-[10px] lg:text-sm font-medium">Sincronizado automaticamente com sua VPS.</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl py-2 lg:py-3 pl-10 lg:pl-12 pr-4 lg:pr-6 text-[10px] lg:text-xs w-full md:w-48 lg:w-64 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => setShowColumnModal(true)} 
            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Novo Quadro
          </button>
          <button 
            onClick={() => { setEditingTask(null); setShowModal(true); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 border border-indigo-500/30 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Nova Tarefa
          </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-10 custom-scrollbar">
          <div className="flex gap-4 lg:gap-6 min-w-max h-full items-start">
            {columns.map(col => {
              const columnTasks = filteredTasks.filter(t => t.status === col.id);
              return (
                <DroppableColumn 
                  key={col.id} 
                  id={col.id} 
                  label={col.label} 
                  color={col.color} 
                  count={columnTasks.length}
                  onDelete={() => handleDeleteColumn(col.id)}
                >
                  <SortableContext 
                    id={col.id}
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 lg:space-y-4 flex-1 min-h-[150px]">
                      {columnTasks.map(task => (
                        <SortableTask 
                          key={task.id} 
                          task={task} 
                          priorities={priorities}
                          onEdit={(t) => { setEditingTask(t); setFormData(t); setShowModal(true); }}
                          onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeTask ? (
            <div className="bg-white dark:bg-slate-900 border border-indigo-500/50 p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden w-[300px] lg:w-[380px]">
              <div className="flex justify-between items-start mb-3 lg:mb-4">
                <span className={`text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl border flex items-center gap-1.5 lg:gap-2 text-indigo-400 bg-indigo-500/10 border-indigo-500/20`}>
                   <Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> {activeTask.priority}
                </span>
              </div>
              <h4 className="text-base lg:text-lg font-black text-slate-900 dark:text-white mb-1.5 lg:mb-2 tracking-tight leading-tight uppercase">{activeTask.title}</h4>
              <p className="text-[10px] lg:text-xs text-slate-500 line-clamp-2 italic mb-4 lg:mb-6">"{activeTask.description || 'Nenhuma descrição detalhada...'}"</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showColumnModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowColumnModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Novo Quadro</h3>
              <button onClick={() => setShowColumnModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Quadro</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white font-black tracking-tight outline-none focus:border-indigo-500 transition-all" 
                  value={newColumnLabel} 
                  onChange={e => setNewColumnLabel(e.target.value)}
                  placeholder="Ex: Revisão, Bloqueado..."
                />
              </div>
              <button onClick={handleAddColumn} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all border border-indigo-500/30">Criar Quadro</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setShowModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[3.5rem] overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingTask ? 'Editar Missão' : 'Nova Missão'}</h3>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><X /></button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título da Tarefa</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white font-black tracking-tight outline-none focus:border-indigo-500 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioridade Estratégica</label>
                <div className="grid grid-cols-3 gap-3">
                  {priorities.map(p => (
                    <button key={p.value} onClick={() => setFormData({...formData, priority: p.value})} className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p.value ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700'}`}>{p.label.split(' ')[1] || p.label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Inicial</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white text-xs font-black uppercase outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Status})}>
                    {columns.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prazo Final</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white text-xs outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-3xl text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all border border-indigo-500/30 mt-4">Confirmar e Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
