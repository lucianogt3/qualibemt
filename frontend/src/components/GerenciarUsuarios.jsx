import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [novoUser, setNovoUser] = useState({ 
    nome: '', 
    email: '', 
    senha: '123456', 
    perfil: 'Gestor', 
    setor_id: '' 
  });

  // 1. BUSCAR DADOS DO SERVIDOR
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resUser, resSetores] = await Promise.all([
        api.get('/api/auth/usuarios'), // Rota corrigida sem duplicação
        api.get('/api/admin/setores')  // Rota administrativa de setores
      ]);
      setUsuarios(resUser.data || []);
      setSetores(resSetores.data || []);
    } catch (err) { 
      console.error("Erro ao carregar usuários/setores:", err); 
    } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. CRIAR NOVO USUÁRIO
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // POST para a rota unificada /api/auth/usuarios
      await api.post('/api/auth/usuarios', novoUser);
      alert("Operador cadastrado com sucesso!");
      setShowModal(false);
      setNovoUser({ nome: '', email: '', senha: '123456', perfil: 'Gestor', setor_id: '' });
      fetchData(); // Recarrega a tabela
    } catch (err) {
      console.error(err);
      alert("Erro ao criar usuário. Verifique se o e-mail já existe.");
    }
  };

  // 3. ALTERNAR STATUS (ATIVO/INATIVO)
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/api/auth/usuarios/${id}/toggle`);
      fetchData(); // Recarrega para mostrar o novo status
    } catch (err) {
      console.error("Erro ao mudar status:", err);
      alert("Não foi possível alterar o status do usuário.");
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-sky-900 animate-pulse">CARREGANDO OPERADORES...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-sky-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">CONTROLE DE OPERADORES</h2>
            <p className="text-sky-300 text-xs font-bold uppercase tracking-widest">Gestão de acessos e setores</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-400 px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg active:scale-95 uppercase"
          >
            + Novo Usuário
          </button>
        </div>

        <div className="p-6">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="text-gray-400 text-[10px] font-black uppercase border-b tracking-widest">
                 <tr>
                   <th className="p-4">Dados do Operador</th>
                   <th className="p-4">Perfil de Acesso</th>
                   <th className="p-4 text-center">Status</th>
                   <th className="p-4 text-center">Ações</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {usuarios.length > 0 ? (
                   usuarios.map(u => (
                    <tr key={u.id} className={`hover:bg-sky-50/30 transition ${!u.ativo && 'bg-gray-50 opacity-60'}`}>
                      <td className="p-4">
                        <span className={`block font-bold ${!u.ativo ? 'text-gray-400 line-through' : 'text-sky-900'}`}>{u.nome}</span>
                        <span className="text-xs text-gray-400 font-medium">{u.email}</span>
                      </td>
                      <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                           u.perfil === 'ADM' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                         }`}>
                           {u.perfil}
                         </span>
                      </td>
                      <td className="p-4 text-center text-xl">
                        {u.ativo ? '🟢' : '⚪'}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                         onClick={() => toggleStatus(u.id)} 
                         className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-gray-100"
                         title="Ativar/Desativar Usuário"
                        >
                          {u.ativo ? '🚫 Inativar' : '✅ Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))
                 ) : (
                   <tr>
                     <td colSpan="4" className="p-10 text-center text-gray-400 font-bold italic">Nenhum usuário cadastrado no banco de dados.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* MODAL DE CADASTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-white">
            <h3 className="text-2xl font-black text-sky-900 mb-2 italic">NOVO OPERADOR</h3>
            <p className="text-gray-400 text-xs mb-8 font-bold uppercase tracking-widest">Preencha os dados de acesso</p>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-sky-800 ml-1 tracking-widest uppercase">Nome Completo</label>
                <input 
                  type="text" placeholder="Nome do funcionário" required
                  className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-sky-500 outline-none transition-all font-medium"
                  onChange={e => setNovoUser({...novoUser, nome: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-sky-800 ml-1 tracking-widest uppercase">E-mail</label>
                <input 
                  type="email" placeholder="usuario@hospital.com" required
                  className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-sky-500 outline-none transition-all font-medium"
                  onChange={e => setNovoUser({...novoUser, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-sky-800 ml-1 tracking-widest uppercase">Perfil</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-sky-500 font-bold text-sky-700"
                    onChange={e => setNovoUser({...novoUser, perfil: e.target.value})}
                  >
                    <option value="Gestor">Gestor</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="ADM">Administrador</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-sky-800 ml-1 tracking-widest uppercase">Setor</label>
                  <select 
                    required
                    className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-sky-500 font-bold text-sky-700"
                    onChange={e => setNovoUser({...novoUser, setor_id: e.target.value})}
                    value={novoUser.setor_id}
                  >
                    <option value="">Escolha...</option>
                    {setores.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-sky-700 shadow-lg shadow-sky-200 transition">Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarUsuarios;
