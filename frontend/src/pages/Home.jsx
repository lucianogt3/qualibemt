import React, { useState } from 'react';
import api from '../services/api';

const Home = () => {
  const [protocolo, setProtocolo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    if (!protocolo) return alert("Por favor, digite um protocolo.");
    
    setLoading(true);
    try {
      const response = await api.get(`/notificacoes/consultar/${protocolo}`);
      setResultado(response.data);
    } catch (error) {
      alert("Protocolo não encontrado ou erro na conexão.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-100">
        <div className="mb-6">
          <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="box-search" />
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Rastrear Notificação</h1>
          <p className="text-gray-500 text-sm">Acompanhe o andamento da sua manifestação</p>
        </div>

        <input 
          type="text" 
          placeholder="Ex: NOT0012026"
          className="w-full border-2 border-gray-200 p-4 rounded-xl mb-4 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all uppercase"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && consultar()}
        />
        
        <button 
          onClick={consultar}
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'} text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-200`}
        >
          {loading ? 'BUSCANDO...' : 'VERIFICAR STATUS'}
        </button>

        {resultado && (
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-left border border-gray-200 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Resultado</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                resultado.status === 'Pendente' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
              }`}>
                {resultado.status}
              </span>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p><strong>📅 Data:</strong> {resultado.data}</p>
              <p><strong>🏷️ Tipo:</strong> {resultado.origem}</p>
              {resultado.descricao && (
                <p className="border-t pt-2 mt-2 italic text-gray-500">
                  "{resultado.descricao.substring(0, 100)}..."
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;