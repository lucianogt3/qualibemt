import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ tipos: {}, status: {}, top_setores: [], graves: 0 });
  const [notificacoes, setNotificacoes] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('triagem');
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    setor: 'TODOS'
  });
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState(null);
  const [showPopup, setShowPopup] = useState(true); // Controla a exibição do popup

  // Calcula idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  // Formata data corretamente
  const formatarData = (dataString) => {
    if (!dataString) return '—';
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return '—';
    return data.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resStats, resNot, resSet] = await Promise.all([
          api.get('/api/stats/geral'),
          api.get('/api/notificacoes/todas'),
          api.get('/api/admin/setores')
        ]);
        setStats(resStats.data);
        setNotificacoes(resNot.data || []);
        setSetores(resSet.data || []);
      } catch (error) {
        console.error('Erro ao buscar dados', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Contagem de pendências
  const notificacoesPendentes = notificacoes.filter(n => n.status === 'PENDENTE').length;

  // Esconde o popup automaticamente após 5 segundos
  useEffect(() => {
    if (notificacoesPendentes > 0) {
      const timer = setTimeout(() => setShowPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [notificacoesPendentes]);

  // Filtra notificações conforme aba ativa e filtros
  const notificacoesFiltradas = notificacoes.filter(n => {
    // Filtro por status
    if (abaAtiva === 'triagem' && n.status !== 'PENDENTE') return false;
    if (abaAtiva === 'andamento' && n.status !== 'ENCAMINHADA AO GESTOR') return false;
    if (abaAtiva === 'concluidas' && !['CONCLUIDO', 'ENCERRADA', 'ENCERRADO_POR_QUALIDADE'].includes(n.status)) return false;

    // Filtro por período
    if (filtros.dataInicio) {
      const dataCriacao = new Date(n.criado_em);
      if (dataCriacao < new Date(filtros.dataInicio)) return false;
    }
    if (filtros.dataFim) {
      const dataCriacao = new Date(n.criado_em);
      if (dataCriacao > new Date(filtros.dataFim)) return false;
    }

    // Filtro por setor
    if (filtros.setor !== 'TODOS' && n.unidade_notificada !== filtros.setor) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-900"></div>
        <span className="ml-3 text-sky-900 font-bold">Carregando Indicadores...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-sky-900">Painel de Gestão Qualidade</h1>
          <p className="text-gray-500 font-medium">Hospital do Coração - Visão Estratégica</p>
        </div>
        <div className="flex gap-3 flex-wrap relative">
          {/* Botão Centro de Triagem com badge e popup */}
          <div className="relative">
            <Link
              to="/triagem"
              className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-700 transition shadow-md flex items-center gap-2"
            >
              <span>🔍</span> Centro de Triagem
              {notificacoesPendentes > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificacoesPendentes}
                </span>
              )}
            </Link>
            {/* Popup flutuante */}
            {showPopup && notificacoesPendentes > 0 && (
              <div className="absolute top-full left-0 mt-2 bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg animate-bounce z-50 whitespace-nowrap">
                🔔 {notificacoesPendentes} nova(s) notificação(ões) aguardando triagem!
              </div>
            )}
          </div>

          <Link
            to="/admin/config-ocorrencias"
            className="bg-white border-2 border-sky-600 text-sky-700 px-5 py-2.5 rounded-xl font-bold hover:bg-sky-50 transition shadow-sm flex items-center gap-2"
          >
            <span>⚙️</span> Configurar Itens
          </Link>
          <Link
            to="/admin/usuarios"
            className="bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-800 transition shadow-md flex items-center gap-2"
          >
            <span>👥</span> Gestão de Usuários
          </Link>
        </div>
      </div>

      {/* Cards de métricas */}
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
        <div
          className={`${
            stats.graves > 0 ? 'bg-red-600 animate-pulse' : 'bg-gray-800'
          } p-6 rounded-2xl shadow-lg text-white transition-colors duration-500`}
        >
          <p className="text-xs uppercase font-black opacity-80 tracking-wider">Eventos Sentinela</p>
          <p className="text-4xl font-black">{stats.graves || 0}</p>
          <p className="text-[10px] mt-1 font-bold italic uppercase">
            {stats.graves > 0 ? 'Ação Crítica Necessária' : 'Nenhuma Crise Detectada'}
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setAbaAtiva('triagem')}
          className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all ${
            abaAtiva === 'triagem'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Triagem {abaAtiva === 'triagem' && notificacoesFiltradas.length > 0 && `(${notificacoesFiltradas.length})`}
        </button>
        <button
          onClick={() => setAbaAtiva('andamento')}
          className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all ${
            abaAtiva === 'andamento'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Em Andamento {abaAtiva === 'andamento' && notificacoesFiltradas.length > 0 && `(${notificacoesFiltradas.length})`}
        </button>
        <button
          onClick={() => setAbaAtiva('concluidas')}
          className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all ${
            abaAtiva === 'concluidas'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Concluídas {abaAtiva === 'concluidas' && notificacoesFiltradas.length > 0 && `(${notificacoesFiltradas.length})`}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400">De:</span>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400">Até:</span>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium"
            value={filtros.setor}
            onChange={(e) => setFiltros({ ...filtros, setor: e.target.value })}
          >
            <option value="TODOS">Todos os setores</option>
            {setores.map((s) => (
              <option key={s.id} value={s.nome}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {notificacoesFiltradas.length} registro(s) encontrado(s)
        </span>
      </div>

      {/* Tabela de notificações */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Protocolo</th>
                <th className="px-6 py-4 text-left font-semibold">Paciente</th>
                <th className="px-6 py-4 text-left font-semibold">Setor</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Classificação</th>
                <th className="px-6 py-4 text-left font-semibold">Data</th>
                <th className="px-6 py-4 text-center font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notificacoesFiltradas.length > 0 ? (
                notificacoesFiltradas.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold">{n.protocolo}</td>
                    <td className="px-6 py-4">
                      <div>{n.paciente_nome || n.nome_paciente || '—'}</div>
                      {n.prontuario && <div className="text-xs text-gray-400">Pront: {n.prontuario}</div>}
                    </td>
                    <td className="px-6 py-4">{n.unidade_notificada}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          n.status === 'PENDENTE'
                            ? 'bg-amber-100 text-amber-700'
                            : n.status === 'ENCAMINHADA AO GESTOR'
                            ? 'bg-blue-100 text-blue-700'
                            : n.status === 'CONCLUIDO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : n.status === 'ENCERRADA'
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {n.status === 'PENDENTE' && 'Pendente'}
                        {n.status === 'ENCAMINHADA AO GESTOR' && 'Com gestor'}
                        {n.status === 'CONCLUIDO' && 'Concluído'}
                        {n.status === 'ENCERRADA' && 'Encerrado'}
                        {n.status === 'ENCERRADO_POR_QUALIDADE' && 'Encerrado (Qualidade)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{n.classificacao || '—'}</td>
                    <td className="px-6 py-4">{formatarData(n.criado_em)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setNotificacaoSelecionada(n)}
                        className="text-sky-600 hover:text-sky-800 font-semibold text-xs uppercase tracking-wider"
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    Nenhuma notificação encontrada nesta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de visualização (mantido) */}
      {notificacaoSelecionada && (
        <VisualizarNotificacao
          notificacao={notificacaoSelecionada}
          onClose={() => setNotificacaoSelecionada(null)}
          calcularIdade={calcularIdade}
          formatarData={formatarData}
        />
      )}
    </div>
  );
};

// Componente modal (igual ao anterior, apenas ajustei para receber formatarData)
const VisualizarNotificacao = ({ notificacao, onClose, calcularIdade, formatarData }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
          <div>
            <h2 className="text-2xl font-light text-gray-800">
              Visualização · <span className="font-mono font-bold text-sky-600">{notificacao.protocolo}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Detalhes completos da notificação</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Dados do paciente */}
          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 border-b border-indigo-100 pb-3">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase">Paciente</p>
                <p className="font-bold text-gray-700">{notificacao.nome_paciente || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase">Prontuário</p>
                <p className="font-bold text-gray-700">{notificacao.prontuario || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase">Idade</p>
                <p className="font-bold text-gray-700">
                  {calcularIdade(notificacao.data_nascimento_paciente)
                    ? `${calcularIdade(notificacao.data_nascimento_paciente)} anos`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase">Nascimento</p>
                <p className="font-bold text-gray-700">
                  {notificacao.data_nascimento_paciente
                    ? new Date(notificacao.data_nascimento_paciente).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
            </div>
            <p className="text-indigo-800 font-medium mb-1 italic">Relato do Notificador:</p>
            <p className="text-gray-600 leading-relaxed italic">"{notificacao.descricao}"</p>
          </div>

          {/* Plano de Ação (se houver) */}
          {notificacao.plano_acao && (
            <div className="bg-sky-50/50 rounded-xl p-5 border border-sky-200">
              <h3 className="text-sm font-black text-sky-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>📋</span> Plano de Ação 5W2H
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">O quê?</span> {notificacao.plano_acao.o_que || '—'}</div>
                <div><span className="font-semibold">Por quê?</span> {notificacao.plano_acao.por_que || '—'}</div>
                <div><span className="font-semibold">Quem?</span> {notificacao.plano_acao.quem || '—'}</div>
                <div><span className="font-semibold">Quando?</span> {formatarData(notificacao.plano_acao.quando)}</div>
                <div><span className="font-semibold">Como?</span> {notificacao.plano_acao.como || '—'}</div>
                <div><span className="font-semibold">Onde?</span> {notificacao.plano_acao.onde || '—'}</div>
              </div>
            </div>
          )}

          {/* Ishikawa (se houver) */}
          {notificacao.ishikawa && (
            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200">
              <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🐟</span> Análise Ishikawa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(notificacao.ishikawa).map(([key, value]) => {
                  if (!value || key === 'id' || key === 'notificacao_id') return null;
                  return (
                    <div key={key} className={key === 'conclusao' ? 'col-span-2' : ''}>
                      <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evidência */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 107.072 7.072L21 12" />
              </svg>
              Evidência anexada
            </label>
            {notificacao.evidencia_path ? (
              <a
                href={notificacao.evidencia_path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline"
              >
                📎 Ver arquivo
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">Nenhuma evidência anexada.</p>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;