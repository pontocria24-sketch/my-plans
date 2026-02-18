
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  StickyNote,
  ArrowRight,
  Search,
  Check,
  Zap,
  AlertTriangle,
  X
} from 'lucide-react';
import { Idea, Task, Priority } from '../types';

interface Props {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const IdeaBoard: React.FC<Props> = ({ ideas, setIdeas, tasks, setTasks }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fecha o estado de confirmação se mudar de nota
  useEffect(() => {
    setConfirmDeleteId(null);
  }, [selectedId]);

  const selectedIdea = ideas.find(i => i.id === selectedId);

  const priorities: { value: Priority; label: string; color: string; bg: string }[] = [
    { value: 'High', label: 'Alta', color: 'text-rose-500', bg: 'bg-rose-500' },
    { value: 'Medium', label: 'Média', color: 'text-amber-500', bg: 'bg-amber-500' },
    { value: 'Low', label: 'Baixa', color: 'text-emerald-500', bg: 'bg-emerald-500' }
  ];

  const handleAddNewNote = () => {
    const newId = Date.now().toString();
    const newNote: Idea = {
      id: newId,
      title: 'Nova Nota',
      content: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      executed: false,
      priority: 'Medium'
    };
    setIdeas(prev => [newNote, ...prev]);
    setSelectedId(newId);
  };

  const updateNote = (id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  // FUNÇÃO DE EXCLUSÃO REFEITA SEM WINDOW.CONFIRM
  const executeDelete = (id: string) => {
    if (selectedId === id) setSelectedId(null);
    setIdeas(prev => prev.filter(i => i.id !== id));
    setConfirmDeleteId(null);
  };

  const handleToggleExecuted = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, executed: !i.executed } : i));
  };

  const handleConvertToTask = (idea: Idea) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: `[IDEIA] ${idea.title || 'Sem título'}`,
      description: idea.content,
      priority: idea.priority || 'Medium',
      status: 'Pending',
      category: 'Ideias',
      responsible: 'Eu',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      progress: 0,
      subTasks: [],
      isRecurring: false
    };
    
    setTasks(prev => [newTask, ...prev]);
    updateNote(idea.id, { executed: true });
    alert('Convertido em tarefa!');
  };

  const filteredIdeas = ideas.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-120px)] bg-slate-900/30 rounded-2xl lg:rounded-[2.5rem] border border-slate-800/60 overflow-hidden animate-in fade-in duration-500">
      
      {/* SIDEBAR: LISTA DE NOTAS */}
      <aside className="w-64 md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/40 backdrop-blur-md shrink-0">
        <header className="p-4 lg:p-6 space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-3xl font-black text-white tracking-tighter uppercase">Ideias</h2>
            <button 
              onClick={handleAddNewNote}
              className="p-2 lg:p-3 bg-slate-800 hover:bg-amber-500 text-amber-500 hover:text-slate-950 rounded-xl lg:rounded-2xl transition-all shadow-lg border border-slate-700 active:scale-90"
            >
              <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar rascunhos..." 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg lg:rounded-xl py-2 lg:py-3 pl-9 lg:pl-10 pr-3 lg:pr-4 text-[10px] lg:text-xs font-medium text-slate-300 outline-none focus:border-amber-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredIdeas.map(idea => (
            <div 
              key={idea.id}
              onClick={() => setSelectedId(idea.id)}
              className={`p-4 lg:p-6 cursor-pointer border-b border-slate-800/40 transition-all relative group ${selectedId === idea.id ? 'bg-amber-500/10' : 'hover:bg-slate-800/30'}`}
            >
              {selectedId === idea.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
              
              <div className="flex justify-between items-start mb-1.5 lg:mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                   <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorities.find(p => p.value === idea.priority)?.bg || 'bg-slate-500'}`}></div>
                   <h4 className={`font-bold text-xs lg:text-sm truncate pr-2 ${idea.executed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                    {idea.title || 'Nota sem título'}
                  </h4>
                </div>
                
                {/* Botão de Excluir Lateral - Confirm Inline */}
                {confirmDeleteId === idea.id ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); executeDelete(idea.id); }}
                    className="p-1.5 bg-rose-600 text-white rounded-lg animate-pulse"
                    title="Confirmar exclusão"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(idea.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="flex justify-between items-end">
                <p className={`text-[10px] lg:text-[11px] line-clamp-2 leading-relaxed flex-1 mr-4 ${idea.executed ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
                  {idea.content || 'Sem descrição...'}
                </p>
                <span className="text-[8px] lg:text-[9px] font-black text-slate-600 shrink-0">
                  {new Date(idea.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
          {filteredIdeas.length === 0 && (
            <div className="p-10 lg:p-20 text-center opacity-10">
              <StickyNote className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4" />
              <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest">Lista vazia</p>
            </div>
          )}
        </div>
      </aside>

      {/* EDITOR CENTRAL */}
      <main className="flex-1 flex flex-col bg-slate-900/20 min-w-0">
        {selectedIdea ? (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Toolbar do Editor */}
            <header className="px-4 lg:px-8 py-3 lg:py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 lg:gap-4">
                <button 
                  onClick={(e) => handleToggleExecuted(selectedIdea.id, e)}
                  className={`p-2 lg:p-2.5 rounded-lg lg:rounded-xl border transition-all ${selectedIdea.executed ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-amber-500 border-slate-700'}`}
                  title="Concluir Ideia"
                >
                  {selectedIdea.executed ? <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" /> : <Circle className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
                
                {/* Botão de Excluir no Cabeçalho - Confirm Inline */}
                <div className="flex items-center">
                  {confirmDeleteId === selectedIdea.id ? (
                    <div className="flex items-center gap-1.5 bg-rose-600/20 p-1 rounded-lg lg:rounded-xl border border-rose-500/30">
                      <button 
                        onClick={() => executeDelete(selectedIdea.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-black text-[8px] lg:text-[10px] uppercase tracking-widest flex items-center gap-1.5 lg:gap-2 transition-all shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Confirmar?
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(selectedIdea.id)}
                      className="p-2 lg:p-2.5 bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 border border-slate-700 rounded-lg lg:rounded-xl transition-all shadow-sm"
                      title="Excluir Idea"
                    >
                      <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  )}
                </div>

                <div className="hidden sm:block h-6 lg:h-8 w-px bg-slate-800 mx-1 lg:mx-2"></div>

                {/* Seletor de Prioridade */}
                <div className="hidden sm:flex bg-slate-950/50 p-1 rounded-lg lg:rounded-xl border border-slate-800">
                  {priorities.map(p => (
                    <button
                      key={p.value}
                      onClick={() => updateNote(selectedIdea.id, { priority: p.value })}
                      className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all ${selectedIdea.priority === p.value ? `${p.bg} text-white shadow-lg` : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleConvertToTask(selectedIdea)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 lg:gap-3 shadow-xl border border-indigo-500/30 active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Converter em Tarefa</span>
              </button>
            </header>

            {/* Corpo do Editor */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-20 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6 lg:space-y-10">
                <div className="space-y-3 lg:space-y-4">
                  <input 
                    type="text"
                    placeholder="Título da Ideia"
                    className={`w-full bg-transparent text-3xl lg:text-6xl font-black text-white outline-none tracking-tighter placeholder:opacity-5 ${selectedIdea.executed ? 'line-through text-slate-600' : ''}`}
                    value={selectedIdea.title}
                    onChange={(e) => updateNote(selectedIdea.id, { title: e.target.value })}
                  />
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[8px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-slate-800/50 pb-4 lg:pb-6">
                    <span>CRIADO EM {new Date(selectedIdea.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center gap-2">
                      <Zap className={`w-3 h-3 lg:w-3.5 lg:h-3.5 ${priorities.find(p => p.value === selectedIdea.priority)?.color}`} />
                      PRIORIDADE {priorities.find(p => p.value === selectedIdea.priority)?.label}
                    </span>
                  </div>
                </div>

                <textarea 
                  placeholder="Escreva sua ideia aqui... mudanças são salvas automaticamente."
                  className={`w-full bg-transparent text-lg lg:text-2xl text-slate-300 font-medium outline-none min-h-[400px] lg:min-h-[600px] resize-none leading-relaxed placeholder:opacity-5 ${selectedIdea.executed ? 'text-slate-600' : ''}`}
                  value={selectedIdea.content}
                  onChange={(e) => updateNote(selectedIdea.id, { content: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Estado Inicial */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 lg:p-20 space-y-6 lg:space-y-8 animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-slate-900 rounded-3xl lg:rounded-[3rem] border border-slate-800 flex items-center justify-center shadow-inner">
               <StickyNote className="w-10 h-10 lg:w-12 lg:h-12 text-slate-800" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-slate-500 uppercase tracking-tighter">Selecione uma ideia</h3>
              <p className="text-xs lg:text-slate-600 mt-2 lg:mt-3 font-medium max-w-[320px] mx-auto leading-relaxed">Escolha uma ideia na lista ao lado ou crie uma nova para começar a detalhar seu planejamento.</p>
            </div>
            <button 
              onClick={handleAddNewNote}
              className="px-8 lg:px-10 py-3 lg:py-4 bg-slate-800 hover:bg-amber-500 text-amber-500 hover:text-slate-950 font-black text-[8px] lg:text-[10px] uppercase tracking-[0.2em] rounded-xl lg:rounded-[1.5rem] transition-all shadow-lg border border-slate-700"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" /> Criar nova agora
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default IdeaBoard;
