import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PainelGestor = () => {
    const [todasNotificacoes, setTodasNotificacoes] = useState([]);
    const [setores, setSetores] = useState([]);
    const [setorAtivo, setSetorAtivo] = useState("TODOS");
    const [selecionada, setSelecionada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [plano, setPlano] = useState({
        o_que: '',
        por_que: '',
        quem: '',
        quando: '',
        como: '',
        onde: ''
    });

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [resNot, resSet] = await Promise.all([
                api.get('/api/notificacoes/todas'),
                api.get('/api/admin/setores')
            ]);
            setTodasNotificacoes(resNot.data || []);
            setSetores(resSet.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarDados(); }, []);

    const enviarPlano = async () => {
        setEnviando(true);
        try {
            await api.post(`/api/notificacoes/${selecionada.id}/plano`, plano);
            alert('✅ Plano de Ação enviado com sucesso!');
            setSelecionada(null);
            carregarDados();
        } catch (err) {
            alert('❌ Erro ao enviar plano. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    // --- LÓGICA DE FILTRO E INDICADORES ---
    const dadosFiltrados = todasNotificacoes.filter(n =>
        setorAtivo === "TODOS" ? true : n.unidade_notificada === setorAtivo
    );

    const stats = {
        totalMes: dadosFiltrados.length,
        pendentes: dadosFiltrados.filter(n => n.status === 'ENCAMINHADA AO GESTOR').length,
        resolvidas: dadosFiltrados.filter(n => n.status === 'CONCLUIDO' || n.status === 'ENCERRADA').length,
        graves: dadosFiltrados.filter(n => n.gravidade === 'Grave / Sentinela').length,
        nearMiss: dadosFiltrados.filter(n => n.classificacao === 'Quase Erro').length
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">CARREGANDO DASHBOARD...</div>;

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">

            {/* TOP BAR: SELETOR DE SETOR E TÍTULO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Performance <span className="text-sky-600">Operacional</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Análise de Segurança e Qualidade por Unidade</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase ml-4">Unidade:</span>
                    <select
                        className="bg-slate-50 border-none font-black text-sky-900 text-sm rounded-xl px-4 py-2 focus:ring-0 cursor-pointer"
                        value={setorAtivo}
                        onChange={(e) => setSetorAtivo(e.target.value)}
                    >
                        <option value="TODOS">GERAL (TODOS)</option>
                        {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                    </select>
                </div>
            </div>

            {/* GRID DE INDICADORES (KPIs) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-sky-500 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Recebidas (Mês)</p>
                    <p className="text-3xl font-black text-slate-800">{stats.totalMes}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-orange-500 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Pendentes</p>
                    <p className="text-3xl font-black text-orange-600">{stats.pendentes}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-emerald-500 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Resolvidas</p>
                    <p className="text-3xl font-black text-emerald-600">{stats.resolvidas}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-red-500 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Eventos Graves</p>
                    <p className="text-3xl font-black text-red-600">{stats.graves}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-amber-400 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Near Miss</p>
                    <p className="text-3xl font-black text-amber-600">{stats.nearMiss}</p>
                </div>
            </div>

            {/* LISTA DE PENDÊNCIAS FILTRADA */}
            <h2 className="text-xs font-black text-slate-400 uppercase mb-6 tracking-[0.3em] flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                Notificações Aguardando Plano de Ação - {setorAtivo}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dadosFiltrados.filter(n => n.status === 'ENCAMINHADA AO GESTOR').map(p => (
                    <div key={p.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white hover:border-sky-200 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-sky-50 transition-colors">
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase">#{p.protocolo}</span>
                        </div>
                        <h3 className="font-black text-slate-800 uppercase italic mb-2 tracking-tight line-clamp-1">{p.titulo_ocorrencia}</h3>
                        <p className="text-xs text-slate-400 mb-6 italic line-clamp-2">"{p.descricao}"</p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-300 uppercase">Prazo Final</span>
                                <span className="text-xs font-bold text-slate-600">{new Date(p.prazo_limite).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setSelecionada(p);
                                    setPlano({
                                        o_que: p.plano_acao?.o_que || '',
                                        por_que: p.plano_acao?.por_que || '',
                                        quem: p.plano_acao?.quem || '',
                                        quando: p.plano_acao?.quando || '',
                                        como: p.plano_acao?.como || '',
                                        onde: p.plano_acao?.onde || ''
                                    });
                                }}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg"
                            >
                                Responder
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* SE VAZIO */}
            {dadosFiltrados.filter(n => n.status === 'ENCAMINHADA AO GESTOR').length === 0 && (
                <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                    <p className="font-black text-slate-300 uppercase tracking-widest text-sm">Nenhuma pendência crítica para esta unidade 🛡️</p>
                </div>
            )}

            {/* MODAL 5W2H */}
            {selecionada && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Cabeçalho */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
                            <div>
                                <h2 className="text-2xl font-light text-slate-800">
                                    Plano de Ação · <span className="font-mono font-semibold text-indigo-600">{selecionada.protocolo}</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Preencha os campos abaixo para elaborar o plano 5W2H
                                </p>
                            </div>
                            <button
                                onClick={() => setSelecionada(null)}
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Corpo com scroll */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                            {/* Resumo da notificação */}
                            <div className="bg-indigo-50/50 rounded-xl p-4 text-sm border border-indigo-100">
                                <p className="text-indigo-800 font-medium mb-1">📌 Resumo da ocorrência</p>
                                <p className="text-slate-600 italic">"{selecionada.descricao}"</p>
                            </div>

                            {/* Grid 5W2H */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="text-indigo-500">1.</span> O quê? (What)
                                    </label>
                                    <textarea
                                        rows={2}
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                        placeholder="Descreva a ação a ser executada..."
                                        value={plano.o_que}
                                        onChange={(e) => setPlano({ ...plano, o_que: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="text-indigo-500">2.</span> Por quê? (Why)
                                    </label>
                                    <textarea
                                        rows={2}
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                        placeholder="Justifique a necessidade da ação..."
                                        value={plano.por_que}
                                        onChange={(e) => setPlano({ ...plano, por_que: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="text-indigo-500">3.</span> Quem? (Who)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                        placeholder="Responsável pela execução"
                                        value={plano.quem}
                                        onChange={(e) => setPlano({ ...plano, quem: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="text-indigo-500">4.</span> Quando? (When)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                        value={plano.quando}
                                        onChange={(e) => setPlano({ ...plano, quando: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="text-indigo-500">5.</span> Como? (How)
                                    </label>
                                    <textarea
                                        rows={2}
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                        placeholder="Descreva o método ou processo..."
                                        value={plano.como}
                                        onChange={(e) => setPlano({ ...plano, como: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="text-indigo-500">6.</span> Onde? (Where)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                        placeholder="Local de execução"
                                        value={plano.onde}
                                        onChange={(e) => setPlano({ ...plano, onde: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Dica educativa */}
                            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 border border-slate-200">
                                <span className="font-semibold text-indigo-600">💡 Dica:</span> Preencha todos os campos para garantir um plano de ação completo e eficaz.
                            </div>
                        </div>

                        {/* Rodapé com ações */}
                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setSelecionada(null)}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={enviarPlano}
                                disabled={enviando}
                                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {enviando ? (
                                    <>
                                        <span className="animate-spin">⏳</span> Enviando...
                                    </>
                                ) : (
                                    '✅ Finalizar Tratativa'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PainelGestor;