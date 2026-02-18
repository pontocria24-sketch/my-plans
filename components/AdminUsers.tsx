
import React, { useState } from 'react';
import { db } from '../authService';
import { UserAccount } from '../types';
import { ShieldCheck, UserCheck, UserX, Clock, Search, ShieldAlert } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(() => db.getUsers());
  const [search, setSearch] = useState('');

  const handleUpdate = (id: string, status: any) => {
    db.updateUserStatus(id, status);
    setUsers(db.getUsers());
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              Controle de Acessos
            </h2>
            <p className="text-slate-500 mt-2 font-medium italic">Gerencie permissões e aprove novos membros do ecossistema.</p>
         </div>
         <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar membros..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
            />
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total de Membros</p>
             <h3 className="text-4xl font-black text-white">{users.length}</h3>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2.5rem] shadow-xl">
             <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Pendentes de Aprovação</p>
             <h3 className="text-4xl font-black text-amber-500">{users.filter(u => u.status === 'Pending').length}</h3>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-xl">
             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Usuários Ativos</p>
             <h3 className="text-4xl font-black text-emerald-500">{users.filter(u => u.status === 'Active').length}</h3>
          </div>
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800">
                     <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Perfil</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Permissão</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Desde</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/40">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-all group">
                      <td className="px-10 py-7">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-indigo-400 group-hover:scale-110 transition-transform">
                               {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-black text-lg text-white group-hover:text-indigo-400 transition-colors leading-none mb-1">{user.name}</span>
                               <span className="text-xs text-slate-600 font-medium">{user.email}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'text-indigo-400' : 'text-slate-500'}`}>
                           {user.role}
                        </span>
                      </td>
                      <td className="px-10 py-7">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                           {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-10 py-7">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                           user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                           user.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                           'bg-rose-500/10 text-rose-500 border-rose-500/20'
                         }`}>
                            {user.status === 'Active' ? <UserCheck className="w-3 h-3" /> : user.status === 'Pending' ? <Clock className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {user.status === 'Active' ? 'Aprovado' : user.status === 'Pending' ? 'Pendente' : 'Bloqueado'}
                         </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                         <div className="flex justify-end gap-3">
                            {user.status === 'Pending' && (
                              <button 
                                onClick={() => handleUpdate(user.id, 'Active')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 border border-indigo-500/30"
                              >
                                Aprovar Acesso
                              </button>
                            )}
                            {user.status === 'Active' && user.role !== 'Admin' && (
                              <button 
                                onClick={() => handleUpdate(user.id, 'Blocked')}
                                className="text-rose-500 hover:bg-rose-500/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/10"
                              >
                                Bloquear
                              </button>
                            )}
                            {user.status === 'Blocked' && (
                              <button 
                                onClick={() => handleUpdate(user.id, 'Active')}
                                className="text-emerald-500 hover:bg-emerald-500/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/10"
                              >
                                Reativar
                              </button>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
       </div>

       <div className="bg-slate-900/20 border border-dashed border-slate-800 p-8 rounded-[3rem] flex items-center gap-6">
          <div className="p-4 bg-indigo-500/10 rounded-2xl">
             <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
             <h4 className="text-lg font-black text-white uppercase tracking-tighter">Estrutura Pronta para VPS</h4>
             <p className="text-sm text-slate-500 font-medium">Este módulo de administração gerencia o banco de dados interno de usuários. Em um deploy via Coolify com API Node.js, esses métodos seriam substituídos por chamadas REST ao banco PostgreSQL.</p>
          </div>
       </div>
    </div>
  );
};

export default AdminUsers;
