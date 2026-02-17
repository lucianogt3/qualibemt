import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Triagem = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionada, setSelecionada] = useState(null);

  const [dadosTriagem, setDadosTriagem] = useState({
    status: '',
    classificacao: '',
    gravidade: '',
    unidade_notificada: '',
    gestor_responsavel: '',
    motivo_padrao: '',
    justificativa: ''
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resNot, resSet] = await Promise.all([
        api.get('/api/notificacoes/todas'),
        api.get('/api/admin/setores')
      ]);
      setNotificacoes(resNot.data || []);
      setSetores(resSet.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const salvarTratativa = async () => {
    try {
      await api.patch(`/api/notificacoes/${selecionada.id}/status`, dadosTriagem);
      alert('Gestão atualizada com sucesso!');
      setSelecionada(null);
      carregarDados();
    } catch (err) {
      alert('Erro ao salvar.');
    }
  };

  // Loading Skeleton moderno
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-xl w-64 mb-8"></div>
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 bg-gray-200 rounded-xl w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Cabeçalho moderno */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-800 tracking-tight">
          Triagem e<span className="font-bold text-sky-600"> Qualidade</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Gerencie as notificações e direcione para análise
        </p>
      </div>

      {/* Card da tabela */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-100">
                <th className="px-6 py-4 text-left font-semibold tracking-wider">Protocolo</th>
                <th className="px-6 py-4 text-left font-semibold tracking-wider">Setor Notificado</th>
                <th className="px-6 py-4 text-left font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 text-center font-semibold tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60">
              {notificacoes.map((n) => (
                <tr
                  key={n.id}
                  className={`group transition-all duration-200 hover:bg-sky-50/50 ${
                    n.atrasado ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-gray-800">{n.protocolo}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{n.criado_em}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{n.unidade_notificada}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        n.status === 'PENDENTE'
                          ? 'bg-amber-100 text-amber-700'
                          : n.status === 'ENCERRADA'
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {n.status === 'PENDENTE' && '⏳ Pendente'}
                      {n.status === 'ENCAMINHADA AO GESTOR' && '📤 Com gestor'}
                      {n.status === 'ENCERRADA' && '✅ Encerrada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelecionada(n);
                        setDadosTriagem({
                          status: n.status,
                          classificacao: n.classificacao || '',
                          gravidade: n.gravidade || '',
                          unidade_notificada: n.unidade_notificada,
                          gestor_responsavel: n.gestor_responsavel || ''
                        });
                      }}
                      className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 group-hover:shadow-md"
                    >
                      Analisar
                      <span className="text-lg leading-none">→</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MODERNO */}
      {selecionada && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Cabeçalho do modal */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
              <div>
                <h3 className="text-2xl font-light text-gray-800">
                  Tratativa · <span className="font-mono font-bold text-sky-600">{selecionada.protocolo}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Unidade notificante: <span className="font-medium">{selecionada.unidade_notificante}</span>
                </p>
              </div>
              <button
                onClick={() => setSelecionada(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Corpo do modal com scroll */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* Card da descrição */}
              <div className="bg-amber-50/80 rounded-2xl p-6 border border-amber-100 relative">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  📋 Descrição da ocorrência
                </span>
                <p className="mt-2 text-gray-700 leading-relaxed">"{selecionada.descricao}"</p>
                {selecionada.envolveu_paciente && (
                  <div className="mt-4 pt-4 border-t border-amber-200/50">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      ⚡ Ação imediata
                    </span>
                    <p className="mt-1 text-sm text-gray-600 italic">
                      {selecionada.descricao_acao_imediata || 'Nenhuma ação registrada.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Redirecionamento */}
              <div className="bg-sky-50/80 rounded-2xl p-6 border border-sky-100">
                <label className="block text-xs font-semibold text-sky-700 uppercase tracking-wider mb-3">
                  🏥 Redirecionar para unidade responsável
                </label>
                <select
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition"
                  value={dadosTriagem.unidade_notificada}
                  onChange={(e) =>
                    setDadosTriagem({ ...dadosTriagem, unidade_notificada: e.target.value })
                  }
                >
                  {setores.map((s) => (
                    <option key={s.id} value={s.nome}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid classificação / status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    📌 Classificação
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition"
                    value={dadosTriagem.classificacao}
                    onChange={(e) =>
                      setDadosTriagem({ ...dadosTriagem, classificacao: e.target.value })
                    }
                  >
                    <option value="">Selecione...</option>
                    <option value="Quase Erro">Quase Erro (Near Miss)</option>
                    <option value="Incidente sem Dano">Incidente sem Dano</option>
                    <option value="Evento Adverso">Evento Adverso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    🔄 Alterar status
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition"
                    value={dadosTriagem.status}
                    onChange={(e) =>
                      setDadosTriagem({ ...dadosTriagem, status: e.target.value })
                    }
                  >
                    <option value="PENDENTE">Aguardando Triagem</option>
                    <option value="ENCAMINHADA AO GESTOR">Encaminhar ao Gestor</option>
                    <option value="ENCERRADA">Encerrar Notificação</option>
                  </select>
                </div>
              </div>

              {/* Seção dinâmica: Encerramento */}
              {dadosTriagem.status === 'ENCERRADA' && (
                <div className="bg-rose-50/80 rounded-2xl p-6 border border-rose-100 animate-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-xs font-semibold text-rose-700 uppercase tracking-wider mb-3">
                    ⛔ Motivo do encerramento
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition mb-4"
                    onChange={(e) =>
                      setDadosTriagem({ ...dadosTriagem, motivo_padrao: e.target.value })
                    }
                  >
                    <option value="">Selecione um motivo...</option>
                    <option value="Duplicidade">Notificação em Duplicidade</option>
                    <option value="Falta de Dados">Falta de Dados Críticos</option>
                    <option value="Improcedente">Fato Improcedente</option>
                    <option value="Outros">Outros Motivos</option>
                  </select>
                  <textarea
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                    rows="3"
                    placeholder="Justificativa detalhada..."
                    onChange={(e) =>
                      setDadosTriagem({ ...dadosTriagem, justificativa: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Seção dinâmica: Encaminhamento ao gestor */}
              {dadosTriagem.status === 'ENCAMINHADA AO GESTOR' && (
                <div className="bg-sky-50/80 rounded-2xl p-6 border border-sky-100 animate-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-xs font-semibold text-sky-700 uppercase tracking-wider mb-3">
                    ⚖️ Definição de gravidade
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <select
                      className="flex-1 p-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition"
                      onChange={(e) =>
                        setDadosTriagem({ ...dadosTriagem, gravidade: e.target.value })
                      }
                    >
                      <option value="Leve">Grau: Leve (10 dias)</option>
                      <option value="Moderada">Grau: Moderada (5 dias)</option>
                      <option value="Grave / Sentinela">Grau: Grave (2 dias)</option>
                    </select>
                    <button className="px-5 py-3 bg-sky-100 text-sky-700 rounded-xl text-sm font-semibold hover:bg-sky-200 transition flex items-center gap-2">
                      <span>📊</span> Ishikawa
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do modal com ações */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setSelecionada(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarTratativa}
                className="px-8 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200"
              >
                Salvar Tratativa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Triagem;