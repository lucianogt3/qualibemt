import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ConfiguracaoItens = () => {
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState({ nome: '', categoria: 'Assistencial' });

  useEffect(() => {
    carregarItens();
  }, []);

  const carregarItens = async () => {
    const res = await api.get('/api/config/itens');
    setItens(res.data);
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    await api.post('/api/config/itens', novoItem);
    setNovoItem({ ...novoItem, nome: '' });
    carregarItens();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-sky-900">Configurar Itens do Formulário</h2>
      
      {/* Cadastro */}
      <form onSubmit={handlesubmit} className="flex gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
        <input 
          className="flex-1 border p-2 rounded"
          placeholder="Nome do Item (Ex: Queda, TI...)"
          value={novoItem.nome}
          onChange={e => setNovoItem({...novoItem, nome: e.target.value})}
        />
        <select 
          className="border p-2 rounded"
          onChange={e => setNovoItem({...novoItem, categoria: e.target.value})}
        >
          <option value="Assistencial">Assistencial (Paciente)</option>
          <option value="Apoio">Apoio (Infra/ADM)</option>
        </select>
        <button className="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold">ADICIONAR</button>
      </form>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.nome}</td>
                <td className="p-4">{item.categoria}</td>
                <td className="p-4">
                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Ativo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfiguracaoItens;
