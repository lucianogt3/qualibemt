import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 1. Mudamos para armazenar uma ARRAY de IDs 📂
  const [novoUser, setNovoUser] = useState({ 
    nome: '', 
    email: '', 
    senha: '123456', 
    perfil: 'Gestor', 
    setores_ids: [] 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resUser, resSetores] = await Promise.all([
        api.get('/api/auth/usuarios'), 
        api.get('/api/admin/setores')
      ]);
      setUsuarios(resUser.data || []);
      setSetores(resSetores.data || []);
    } catch (err) { 
      console.error("Erro ao buscar dados:", err); 
    } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Lógica para marcar/desmarcar setores ✅
  const handleSetorToggle = (id) => {
    const atualizados = novoUser.setores_ids.includes(id)
      ? novoUser.setores_ids.filter(sid => sid !== id) // Remove se já existe
      : [...novoUser.setores_ids, id]; // Adiciona se não existe
    
    setNovoUser({ ...novoUser, setores_ids: atualizados });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (novoUser.setores_ids.length === 0) return alert("Selecione pelo menos um setor!");

    try {
      await api.post('/api/auth/usuarios', novoUser);
      alert("Usuário criado com sucesso!");
      setShowModal(false);
      setNovoUser({ nome: '', email: '', senha: '123456', perfil: 'Gestor', setores_ids: [] });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao criar usuário.";
      alert(msg);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/api/auth/usuarios/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-sky-900 animate-pulse uppercase tracking-widest">Carregando Operadores...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-sky-900 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Controle de Operadores</h2>
          <button 
            onClick={() => {
                setNovoUser({ nome: '', email: '', senha: '123456', perfil: 'Gestor', setores_ids: [] });
                setShowModal(true);
            }}
            className="bg-green-500 hover:bg-green-400 px-6 py-2 rounded-xl font-bold transition shadow-lg active:scale-95"
          >
            + Adicionar Usuário
          </button>
        </div>

        <div className="p-6">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="text-gray-400 text-xs uppercase border-b">
                 <tr>
                   <th className="p-3">Nome / E-mail</th>
                   <th className="p-3">Perfil</th>
                   <th className="p-3">Setores Responsáveis</th> {/* Coluna nova! */}
                   <th className="p-3 text-center">Status</th>
                   <th className="p-3 text-center">Ações</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {usuarios.map(u => (
                    <tr key={u.id} className={`hover:bg-gray-50 transition ${!u.ativo && 'opacity-50'}`}>
                      <td className="p-3">
                        <b className="text-sky-900 uppercase text-sm">{u.nome}</b><br/>
                        <span className="text-xs text-gray-500 font-medium">{u.email}</span>
                      </td>
                      <td className="p-3 text-xs font-black uppercase text-sky-600">
                         {u.perfil}
                      </td>
                      <td className="p-3 text-[10px] font-bold text-gray-400 italic">
                         {/* Exibe os setores como uma lista separada por vírgula */}
                         {u.setores?.join(", ") || "Nenhum setor"}
                      </td>
                      <td className="p-3 text-center">{u.ativo ? '🟢' : '⚪'}</td>
                      <td className="p-3 text-center">
                        <button 
                         onClick={() => toggleStatus(u.id)} 
                         className="p-2 hover:bg-gray-100 rounded-lg transition text-xs font-bold"
                        >
                          {u.ativo ? '🚫 Inativar' : '✅ Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-sky-900 mb-6 italic uppercase">Novo Operador</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input 
                type="text" placeholder="Nome Completo" required
                className="w-full p-3 border-2 border-gray-50 rounded-xl outline-none font-medium"
                value={novoUser.nome}
                onChange={e => setNovoUser({...novoUser, nome: e.target.value})}
              />
              <input 
                type="email" placeholder="E-mail" required
                className="w-full p-3 border-2 border-gray-50 rounded-xl outline-none font-medium"
                value={novoUser.email}
                onChange={e => setNovoUser({...novoUser, email: e.target.value})}
              />
              
              <select 
                className="w-full p-3 border-2 border-gray-50 rounded-xl bg-white font-bold text-sky-800"
                value={novoUser.perfil}
                onChange={e => setNovoUser({...novoUser, perfil: e.target.value})}
              >
                <option value="Gestor">Gestor</option>
                <option value="Qualidade">Qualidade</option>
                <option value="ADM">Administrador</option>
              </select>

              {/* 3. Área de Seleção Múltipla de Setores 🏢 */}
              <div className="border-2 border-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Setores sob responsabilidade:</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {setores.map(s => (
                    <label key={s.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                        checked={novoUser.setores_ids.includes(s.id)}
                        onChange={() => handleSetorToggle(s.id)}
                      />
                      <span className="text-xs font-bold text-sky-900 uppercase">{s.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-sky-700 text-white rounded-xl font-bold uppercase text-xs shadow-lg shadow-sky-200">Salvar Operador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarUsuarios;