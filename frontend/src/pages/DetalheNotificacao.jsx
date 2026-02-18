import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DetalheNotificacao = () => {
  const { protocolo } = useParams();
  const [notificacao, setNotificacao] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/notificacoes/consultar/${protocolo}`).then(res => setNotificacao(res.data));
  }, [protocolo]);

  const atualizarStatus = async (novoStatus) => {
    await api.put(`/notificacoes/status/${protocolo}`, { status: novoStatus });
    alert("Status atualizado!");
    navigate('/dashboard');
  };

  if (!notificacao) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold text-sky-900 mb-4">Protocolo: {notificacao.protocolo}</h2>
      <div className="space-y-4 border-t pt-4 text-gray-700">
        <p><strong>Origem:</strong> {notificacao.origem}</p>
        <p><strong>Setor Notificado:</strong> {notificacao.unidade_notificada}</p>
        <p><strong>Descrição:</strong> {notificacao.descricao}</p>
        <p><strong>Status Atual:</strong> <span className="text-orange-600 font-bold">{notificacao.status}</span></p>
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={() => atualizarStatus('Em Análise')} className="bg-blue-500 text-white px-4 py-2 rounded">Em Análise</button>
        <button onClick={() => atualizarStatus('Concluído')} className="bg-green-600 text-white px-4 py-2 rounded">Concluir</button>
      </div>
    </div>
  );
};

export default DetalheNotificacao;

