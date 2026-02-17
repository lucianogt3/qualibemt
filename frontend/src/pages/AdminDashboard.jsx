import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ tipos: {}, status: {}, top_setores: [], graves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/stats/geral');
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-900"></div>
      <span className="ml-3 text-sky-900 font-bold">Carregando Indicadores...</span>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      
      {/* CABEÇALHO E GESTÃO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-sky-900">Painel de Gestão Qualidade</h1>
          <p className="text-gray-500 font-medium">Hospital do Coração - Visão Estratégica</p>
        </div>
        
        {/* BOTÕES QUE LEVAM PARA O RESET E CADASTROS */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/admin/config-ocorrencias" className="bg-white border-2 border-sky-600 text-sky-700 px-5 py-2.5 rounded-xl font-bold hover:bg-sky-50 transition shadow-sm flex items-center gap-2">
            <span>⚙️</span> Configurar Itens
          </Link>
          <Link to="/admin/usuarios" className="bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-800 transition shadow-md flex items-center gap-2">
            <span>👥</span> Gestão de Usuários
          </Link>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-500">
          <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Notificações</p>
          <p className="text-4xl font-black text-gray-800">{stats.tipos?.NOT || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-500">
          <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Elogios</p>
          <p className="text-4xl font-black text-gray-800">{stats.tipos?.ELO || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-orange-500">
          <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Reclamações</p>
          <p className="text-4xl font-black text-gray-800">{stats.tipos?.REC || 0}</p>
        </div>
        
        {/* EVENTO SENTINELA - DESTAQUE PARA QUALIDADE */}
        <div className={`${(stats.graves > 0) ? 'bg-red-600 animate-pulse' : 'bg-gray-800'} p-6 rounded-2xl shadow-lg text-white transition-colors duration-500`}>
          <p className="text-xs uppercase font-black opacity-80 tracking-wider">Eventos Sentinela</p>
          <p className="text-4xl font-black">{stats.graves || 0}</p>
          <p className="text-[10px] mt-1 font-bold italic uppercase">{stats.graves > 0 ? 'Ação Crítica Necessária' : 'Nenhuma Crise Detectada'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: RANKING DE SETORES */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black mb-8 text-gray-800 flex items-center gap-2 italic">
            <span className="bg-sky-100 p-2 rounded-lg">🚨</span> Top 5 Unidades Críticas
          </h2>
          <div className="space-y-7">
            {stats.top_setores?.length > 0 ? stats.top_setores.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-sm font-black text-gray-600 uppercase">{item.setor}</span>
                  <span className="text-lg font-black text-sky-700">{item.total} <small className="text-[10px] text-gray-400 uppercase">Ocorr.</small></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-sky-600 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(item.total / (stats.top_setores[0]?.total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : <div className="text-center py-10 text-gray-400 italic font-medium">Aguardando dados das unidades...</div>}
          </div>
        </div>

        {/* COLUNA 2: STATUS E TRIAGEM */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex-1">
            <h2 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2 italic">
              <span className="bg-sky-100 p-2 rounded-lg">📊</span> Tratativas em Andamento
            </h2>
            <div className="grid grid-cols-1 gap-3">
               {Object.entries(stats.status || {}).length > 0 ? Object.entries(stats.status).map(([label, qtd]) => (
                 <div key={label} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-sky-50 transition border border-transparent hover:border-sky-100">
                   <span className="font-bold text-gray-600 uppercase text-xs">{label}</span>
                   <span className="bg-sky-700 text-white px-5 py-1.5 rounded-xl font-black text-sm shadow-sm">{qtd}</span>
                 </div>
               )) : <div className="text-center py-6 text-gray-400">Nenhum processo iniciado.</div>}
            </div>
          </div>

          {/* BOTÃO DE ACESSO RÁPIDO À QUALIDADE */}
          <Link to="/triagem" className="group bg-gray-900 p-8 rounded-3xl shadow-xl text-white flex justify-between items-center hover:bg-black transition-all transform hover:-translate-y-1">
             <div>
                <h3 className="font-black text-2xl italic tracking-tight">CENTRO DE TRIAGEM</h3>
                <p className="text-sky-400 font-bold text-sm uppercase">Análise técnica de casos →</p>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-sky-600 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;