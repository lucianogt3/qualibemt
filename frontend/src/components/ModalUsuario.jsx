import React, { useState } from 'react';
import api from '../services/api';

const ModalUsuario = ({ aoFechar, aoSalvar }) => {
  const [dados, setDados] = useState({ nome: '', email: '', senha: '', perfil: 'Gestor' });

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/registrar', dados);
      alert("Usuário cadastrado!");
      aoSalvar(); // Atualiza a lista na tela principal
      aoFechar(); // Fecha o modal
    } catch (error) {
      alert("Erro ao cadastrar usuário: " + error.response.data.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>
        <form onSubmit={salvar} className="space-y-4">
          <input type="text" placeholder="Nome Completo" required className="w-full border p-2 rounded"
            onChange={e => setDados({...dados, nome: e.target.value})} />
          
          <input type="email" placeholder="E-mail" required className="w-full border p-2 rounded"
            onChange={e => setDados({...dados, email: e.target.value})} />
          
          <input type="password" placeholder="Senha" required className="w-full border p-2 rounded"
            onChange={e => setDados({...dados, senha: e.target.value})} />
          
          <select className="w-full border p-2 rounded" value={dados.perfil}
            onChange={e => setDados({...dados, perfil: e.target.value})}>
            <option value="Gestor">Gestor da Qualidade</option>
            <option value="ADM">Administrador</option>
          </select>
          
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={aoFechar} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;
