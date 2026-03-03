
import React, { useState, useMemo } from 'react';
import { 
  Video, Plus, Youtube, Instagram, Edit3, Trash2, 
  ChevronDown, ChevronUp, Clock, Sparkles, Calendar, 
  X, MessageSquare, ListTodo, Zap, FileText, CheckCircle2,
  Clapperboard, Smartphone, PlaySquare, History, Maximize2,
  Eye, Save, ArrowRight, Share2, BarChart3, Layout, Layers, Type,
  Printer, Download, FileCheck, AlertCircle
} from 'lucide-react';
import { ContentScript, Platform, Task } from '../types.ts';

interface Props {
  scripts: ContentScript[];
  setScripts: React.Dispatch<React.SetStateAction<ContentScript[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const CONTENT_FORMATS = [
  'Reels',
  'Carrossel',
  'Post Estático',
  'Shorts',
  'Vídeo Longo',
  'Stories'
];

const ContentManager: React.FC<Props> = ({ scripts, setScripts, tasks, setTasks }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readingScript, setReadingScript] = useState<ContentScript | null>(null);
  
  const [formData, setFormData] = useState<Partial<ContentScript>>({
    platform: 'Instagram',
    format: 'Reels',
    hook: '',
    body: '',
    cta: '',
    startDate: new Date().toISOString().split('T')[0],
    recordingDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSave = () => {
    if (!formData.title?.trim()) {
      alert("Por favor, preencha o nome do projeto.");
      return;
    }
    
    const scriptId = Date.now().toString();
    const newScript: ContentScript = {
      id: scriptId,
      title: formData.title || '',
      platform: formData.platform || 'Instagram',
      format: formData.format || 'Reels',
      hook: formData.hook || '',
      sceneDirection: '',
      body: formData.body || '',
      cta: formData.cta || '',
      references: [],
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
      startDate: formData.startDate,
      recordingDate: formData.recordingDate,
      endDate: formData.endDate
    };

    const newTask: Task = {
      id: `task-${scriptId}`,
      title: `[PROD] ${newScript.title} (${newScript.platform})`,
      description: `Formato: ${newScript.format}\nGancho: ${newScript.hook}\nCTA: ${newScript.cta}`,
      priority: 'High',
      status: 'Pending',
      category: 'Produção',
      responsible: 'Eu',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date().toISOString().split('T')[0],
      progress: 0,
      subTasks: [
        { id: `st1-${scriptId}`, title: 'Gravar Conteúdo', completed: false },
        { id: `st2-${scriptId}`, title: 'Editar Vídeo', completed: false },
        { id: `st3-${scriptId}`, title: 'Postar/Agendar', completed: false }
      ],
      isRecurring: false,
      linkedContentId: scriptId
    };

    setScripts([newScript, ...scripts]);
    setTasks([newTask, ...tasks]);
    setIsAdding(false);
    setFormData({ platform: 'Instagram', format: 'Reels', hook: '', body: '', cta: '' });
  };

  const deleteScript = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja excluir este roteiro e sua tarefa vinculada?')) {
      setScripts(prev => prev.filter(s => s.id !== id));
      setTasks(prev => prev.filter(t => t.linkedContentId !== id));
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'YouTube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'TikTok': return <Smartphone className="w-5 h-5 text-emerald-400" />;
      default: return <Video className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Sincronização robusta com o TaskManager
  const getScriptStatus = (scriptId: string) => {
    const task = tasks.find(t => t.linkedContentId === scriptId);
    if (!task) return { label: 'Sem Tarefa', color: 'bg-slate-800 text-slate-500 border-transparent' };
    
    switch (task.status) {
      case 'Completed': 
        return { label: 'Publicado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'InProgress': 
        return { label: 'Executando', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'Paused': 
        return { label: 'Pausado', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'AwaitingPost': 
        return { label: 'Aguard. Post', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
      case 'Pending':
      default:
        return { label: 'Na Fila', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const platformOrder: Platform[] = ['Instagram', 'TikTok', 'YouTube'];

  const { activeItems, historyItems, completedCounts } = useMemo(() => {
    const active: Record<Platform, ContentScript[]> = { Instagram: [], TikTok: [], YouTube: [] };
    const history: ContentScript[] = [];
    const counts: Record<string, number> = {};

    CONTENT_FORMATS.forEach(f => counts[f] = 0);

    scripts.forEach(s => {
      const task = tasks.find(t => t.linkedContentId === s.id);
      
      // Contabiliza apenas os que estão como "Completed" nas tarefas
      if (task?.status === 'Completed') {
        if (counts[s.format] !== undefined) counts[s.format]++;
        history.push(s);
      } else {
        active[s.platform].push(s);
      }
    });

    return { activeItems: active, historyItems: history, completedCounts: counts };
  }, [scripts, tasks]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10 pb-24 animate-in fade-in duration-500 px-4 sm:px-6 lg:px-8">
      
      {/* Header Central de Comando */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 lg:gap-6">
        <div>
          <h2 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 lg:gap-4 tracking-tighter uppercase">
            <div className="p-2 lg:p-3 bg-indigo-600 rounded-xl lg:rounded-2xl shadow-2xl shadow-indigo-600/30">
              <Clapperboard className="text-white w-6 h-6 lg:w-8 lg:h-8" />
            </div>
            Produção & Roteiros
          </h2>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1.5 lg:mt-2 font-medium">Gerencie seus roteiros e acompanhe o status real das postagens.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest flex items-center justify-center gap-2 lg:gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-500/30"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" /> Novo Roteiro
        </button>
      </div>

      {/* Dashboard de Publicados (Contagem Real) */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-2xl lg:rounded-[3rem] space-y-4 lg:space-y-6 shadow-xl dark:shadow-none">
        <div className="flex items-center gap-3 mb-1.5 lg:mb-2">
           <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 dark:text-indigo-400" />
           <h3 className="text-[10px] lg:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Postagens Concluídas (Total)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {CONTENT_FORMATS.map(format => (
            <div key={format} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl flex flex-col items-center justify-center text-center shadow-lg group hover:border-emerald-500/30 transition-all">
              <span className="text-[8px] lg:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{format}</span>
              <span className={`text-xl lg:text-2xl font-black ${completedCounts[format] > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-700'}`}>
                {completedCounts[format] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Listagem por Plataforma */}
      <div className="space-y-16">
        {platformOrder.map(platform => {
          const platformScripts = activeItems[platform];
          if (platformScripts.length === 0) return null;

          return (
            <section key={platform} className="space-y-6">
              <div className="flex items-center gap-4 px-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
                  {getPlatformIcon(platform)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{platform}</h3>
                <span className="ml-auto text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                  {platformScripts.length} Em Produção
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {platformScripts.map(script => {
                  const status = getScriptStatus(script.id);
                  const isExpanded = expandedId === script.id;

                  return (
                    <div key={script.id} className={`group bg-white dark:bg-slate-900/40 border rounded-2xl lg:rounded-[2.5rem] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${isExpanded ? 'border-indigo-500/50 bg-slate-50 dark:bg-slate-900/60 shadow-xl dark:shadow-2xl' : 'border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <div 
                        className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" 
                        onClick={() => setExpandedId(isExpanded ? null : script.id)}
                      >
                        <div className="flex items-center gap-4 lg:gap-6">
                           <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                              <PlaySquare className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-400 opacity-60" />
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <h4 className="font-black text-lg lg:text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{script.title}</h4>
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">{script.format}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500"><Calendar className="w-3.5 h-3.5" /> Gravação: {new Date(script.recordingDate!).toLocaleDateString('pt-BR')}</span>
                                <span className={`px-3 py-1 rounded-full border ${status.color}`}>{status.label}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setReadingScript(script); }} 
                             className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500 group/btn"
                             title="Visualizar Documento"
                           >
                             <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                             <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Ver Roteiro</span>
                           </button>
                           {isExpanded ? <ChevronUp className="text-indigo-600 dark:text-indigo-500" /> : <ChevronDown className="text-slate-300 dark:text-slate-600" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 lg:px-8 pb-8 lg:pb-10 pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-6 lg:space-y-8 animate-in slide-in-from-top-2 duration-400 bg-slate-50/50 dark:bg-slate-950/20">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <div className="bg-white dark:bg-slate-950/80 p-6 rounded-2xl lg:rounded-[2rem] border border-slate-200 dark:border-slate-800/50 shadow-inner">
                                <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                   <Zap className="w-3.5 h-3.5" /> Gancho / Hook (Impacto)
                                </h5>
                                <p className="text-lg text-slate-900 dark:text-white font-black italic tracking-tight leading-relaxed">"{script.hook || 'Nenhum gancho definido.'}"</p>
                             </div>
                             <div className="bg-white dark:bg-slate-950/80 p-6 rounded-2xl lg:rounded-[2rem] border border-slate-200 dark:border-slate-800/50 shadow-inner">
                                <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                   <MessageSquare className="w-3.5 h-3.5" /> Chamada para Ação (CTA)
                                </h5>
                                <p className="text-lg text-slate-700 dark:text-slate-200 font-bold italic">"{script.cta || 'Nenhuma CTA definida.'}"</p>
                             </div>
                          </div>

                          <div className="bg-white dark:bg-slate-950/80 p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 relative group/script">
                             <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/script:opacity-100 transition-opacity">
                                <button className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-800"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={(e) => deleteScript(script.id, e)} className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-800"><Trash2 className="w-4 h-4" /></button>
                             </div>
                             <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2 px-1">
                                <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Desenvolvimento do Conteúdo
                             </h5>
                             <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                                {script.body || "Aguardando escrita do conteúdo principal..."}
                             </p>
                          </div>
                          
                          <div className="flex justify-end gap-3">
                             <button 
                               onClick={() => setReadingScript(script)}
                               className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                             >
                                <FileCheck className="w-4 h-4" /> Abrir para Gravação
                             </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Histórico de Concluídos */}
      {historyItems.length > 0 && (
        <section className="pt-20 border-t border-slate-200 dark:border-slate-800/50 space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <History className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Histórico de Publicações</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyItems.map(script => (
                <div key={script.id} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 p-8 rounded-2xl lg:rounded-[2.5rem] flex flex-col justify-between group opacity-60 hover:opacity-100 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 shadow-sm hover:shadow-md">
                   <div className="space-y-4">
                      <div className="flex justify-between items-start">
                         {getPlatformIcon(script.platform)}
                         <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <h4 className="font-black text-lg text-slate-700 dark:text-slate-300 leading-tight">{script.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{script.format}</p>
                   </div>
                   <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/30 flex justify-between items-center">
                      <button onClick={() => setReadingScript(script)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors">
                         <Eye className="w-4 h-4" /> Revisar Roteiro
                      </button>
                      <button onClick={(e) => deleteScript(script.id, e)} className="text-slate-300 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Modal de Criação (Mantido conforme solicitado) */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-2xl lg:rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
            <div className="p-6 lg:p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl lg:rounded-2xl shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Novo Plano de Conteúdo</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Define seu projeto e gere uma demanda automática</p>
                </div>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-all shadow-md"><X /></button>
            </div>
            
            <div className="p-6 lg:p-10 overflow-y-auto custom-scrollbar space-y-8 lg:space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">Nome do Projeto</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-6 py-4 outline-none text-slate-900 dark:text-white font-bold focus:ring-4 ring-indigo-500/10 transition-all" placeholder="Ex: Campanha Black Friday" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Plataforma</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-6 py-4 outline-none text-slate-900 dark:text-white font-black uppercase tracking-widest text-[11px]" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value as Platform})}>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Formato de Conteúdo</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-6 py-4 outline-none text-slate-900 dark:text-white font-black uppercase tracking-widest text-[11px] focus:ring-4 ring-indigo-500/10 transition-all" value={formData.format} onChange={(e) => setFormData({...formData, format: e.target.value})}>
                      {CONTENT_FORMATS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="space-y-6 lg:space-y-8 bg-slate-50 dark:bg-slate-950/40 p-6 lg:p-8 rounded-2xl lg:rounded-[3rem] border border-slate-200 dark:border-slate-800/60">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Gancho de Impacto (Hook)</label>
                      <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-4 outline-none text-slate-900 dark:text-white font-bold text-sm focus:border-amber-500/50 transition-all shadow-inner" placeholder="O que vai prender o público nos primeiros segundos?" value={formData.hook} onChange={(e) => setFormData({...formData, hook: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /> Chamada para Ação (CTA)</label>
                      <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-4 outline-none text-slate-900 dark:text-white font-bold text-sm focus:border-indigo-500/50 transition-all shadow-inner" placeholder="O que o público deve fazer ao final?" value={formData.cta} onChange={(e) => setFormData({...formData, cta: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Corpo do Roteiro / Desenvolvimento</label>
                    <textarea className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-[2.5rem] px-6 lg:px-8 py-6 lg:py-8 outline-none text-slate-700 dark:text-slate-300 font-medium h-64 resize-none focus:ring-4 ring-indigo-500/10 transition-all shadow-inner" placeholder="Escreva aqui o seu roteiro completo..." value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Data de Gravação</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-6 py-4 outline-none text-slate-900 dark:text-white font-bold" value={formData.recordingDate} onChange={(e) => setFormData({...formData, recordingDate: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Prazo de Entrega</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl px-6 py-4 outline-none text-slate-900 dark:text-white font-bold" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="p-6 lg:p-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-4 bg-slate-50 dark:bg-slate-950/20">
              <button onClick={() => setIsAdding(false)} className="w-full sm:w-auto px-10 py-4 rounded-xl lg:rounded-2xl font-bold text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Descartar</button>
              <button onClick={handleSave} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-xl lg:rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 border border-indigo-500/30 flex items-center justify-center gap-2">
                Salvar e Gerar Demanda <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização Documento PDF (Layout Limpo) */}
      {readingScript && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 flex items-center justify-center p-0 sm:p-4 md:p-10 animate-in fade-in duration-500 backdrop-blur-md">
           <div className="absolute inset-0" onClick={() => setReadingScript(null)}></div>
           
           <div className="bg-white dark:bg-slate-900 w-full h-full sm:h-auto sm:max-w-[850px] sm:min-h-[90vh] sm:max-h-[95vh] sm:rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative z-10 overflow-hidden text-slate-900 dark:text-white border-0 sm:border border-slate-200 dark:border-slate-800">
              
              {/* Barra de Ferramentas Documento */}
              <header className="px-6 lg:px-8 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[10px] lg:text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Visualizador de Roteiro</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-900 rounded-lg transition-all hidden sm:inline-block" title="Imprimir"><Printer className="w-4 h-4" /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-900 rounded-lg transition-all hidden sm:inline-block" title="Baixar PDF"><Download className="w-4 h-4" /></button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:inline-block"></div>
                  <button 
                    onClick={() => setReadingScript(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                  >
                    Fechar <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </header>

              {/* Corpo do Documento (Estilo Folha A4) */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-12 md:p-20 custom-scrollbar bg-slate-100 dark:bg-slate-950 flex justify-center">
                 <div className="bg-white dark:bg-slate-900 w-full max-w-[700px] min-h-full p-8 sm:p-16 shadow-sm border border-slate-200 dark:border-slate-800 rounded-sm space-y-12">
                    
                    {/* Header do Roteiro */}
                    <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                       <div>
                          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">{readingScript.title}</h1>
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                             <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(readingScript.recordingDate!).toLocaleDateString('pt-BR')}</span>
                             <span className="flex items-center gap-1.5"><Layout className="w-3 h-3" /> {readingScript.platform}</span>
                             <span className="flex items-center gap-1.5"><Type className="w-3 h-3" /> {readingScript.format}</span>
                          </div>
                       </div>
                       <div className="text-left sm:text-right">
                          <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status Produção</div>
                          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getScriptStatus(readingScript.id).color}`}>
                            {getScriptStatus(readingScript.id).label}
                          </div>
                       </div>
                    </div>

                    {/* Gancho / Hook */}
                    <section className="space-y-4">
                       <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <Zap className="w-4 h-4" /> 01. Hook / Gancho de Impacto (0-3s)
                       </h3>
                       <div className="bg-slate-50 dark:bg-slate-950 border-l-4 border-slate-900 dark:border-slate-700 p-6 lg:p-8">
                          <p className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                             "{readingScript.hook}"
                          </p>
                       </div>
                    </section>

                    {/* Conteúdo Principal */}
                    <section className="space-y-4">
                       <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <AlignLeft className="w-4 h-4" /> 02. Desenvolvimento do Conteúdo
                       </h3>
                       <div className="text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap font-medium">
                          {readingScript.body}
                       </div>
                    </section>

                    {/* CTA */}
                    <section className="space-y-4">
                       <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <Share2 className="w-4 h-4" /> 03. Call to Action (CTA Final)
                       </h3>
                       <div className="bg-slate-50 dark:bg-slate-950 border-l-4 border-slate-900 dark:border-slate-700 p-6 lg:p-8">
                          <p className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                             "{readingScript.cta}"
                          </p>
                       </div>
                    </section>

                    <div className="pt-20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40">
                       <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-center sm:text-left">© Ecossistema myplans • Documento Gerado em {new Date().toLocaleDateString()}</p>
                       <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Página 1 de 1</p>
                    </div>
                 </div>
              </main>

              {/* Rodapé Informativo */}
              <footer className="px-6 lg:px-8 py-4 lg:py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-10">
                 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Tempo Estimado: ~{Math.round(readingScript.body.split(' ').length / 1.5)}s</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Ideal para Dispositivos Móveis</span>
                 </div>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

// Ícone Local para alinhar
const AlignLeft = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
);

export default ContentManager;
