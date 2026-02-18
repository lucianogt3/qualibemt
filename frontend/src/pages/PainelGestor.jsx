import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ISHIKAWA_OPTIONS = {
  mao_de_obra: [
    "Falta de treinamento / capacitação",
    "Sobrecarga de trabalho",
    "Falha de comunicação",
    "Desatenção / fadiga",
    "Dimensionamento inadequado",
    "Não adesão a protocolo",
    "Equipe nova / rotatividade",
    "Não se aplica"
  ],
  maquinas: [
    "Equipamento com falha",
    "Manutenção preventiva atrasada",
    "Calibração vencida",
    "Uso inadequado do equipamento",
    "Falta de equipamento disponível",
    "Alarme/configuração incorreta",
    "Não se aplica"
  ],
  materiais: [
    "Falta de material/insumo",
    "Material inadequado",
    "Material com defeito",
    "Padronização insuficiente",
    "Armazenamento inadequado",
    "Validade / rastreabilidade",
    "Não se aplica"
  ],
  metodos: [
    "Protocolo inexistente",
    "Protocolo desatualizado",
    "Fluxo confuso",
    "Falta de checklist",
    "Processo com etapas manuais",
    "Mudança de rotina sem treinamento",
    "Não se aplica"
  ],
  ambiente: [
    "Interrupções durante a tarefa",
    "Ruído / iluminação inadequada",
    "Layout físico ruim",
    "Pressão de tempo / urgência",
    "Ambiente com alta rotatividade",
    "Falhas de sinalização",
    "Não se aplica"
  ],
  medida: [
    "Indicador inexistente",
    "Métrica inadequada",
    "Falha no registro/documentação",
    "Auditoria insuficiente",
    "Dados incompletos",
    "Monitoramento irregular",
    "Não se aplica"
  ]
};

const PainelGestor = () => {
    const [todasNotificacoes, setTodasNotificacoes] = useState([]);
    const [setores, setSetores] = useState([]);
    const [setorAtivo, setSetorAtivo] = useState("TODOS");
    const [selecionada, setSelecionada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState('pendentes'); // 'pendentes' ou 'historico'
    const [filtros, setFiltros] = useState({
        dataInicio: '',
        dataFim: '',
        busca: ''
    });

    // Estados para os formulários
    const [plano, setPlano] = useState({
        o_que: '',
        por_que: '',
        quem: '',
        quando: '',
        como: '',
        onde: ''
    });

    // ✅ Ajustado para as chaves do seu ISHIKAWA_OPTIONS + conclusão livre
    const [ishikawa, setIshikawa] = useState({
        metodos: '',
        mao_de_obra: '',
        maquinas: '',
        materiais: '',
        ambiente: '',
        medida: '',
        conclusao: ''
    });

    const [arquivoEvidencia, setArquivoEvidencia] = useState(null);

    // Função para calcular dias restantes
    const diasRestantes = (prazo) => {
        if (!prazo) return null;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const limite = new Date(prazo);
        limite.setHours(0, 0, 0, 0);
        const diff = limite - hoje;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    // Calcular idade
    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return null;
        const hoje = new Date();
        const nasc = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const mes = hoje.getMonth() - nasc.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        return idade;
    };

    // Formatar data para exibição
    const formatarData = (data) => {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [resNot, resSet] = await Promise.all([
                api.get('/api/notificacoes/todas'),
                api.get('/api/admin/setores')
            ]);

            console.log("📦 Dados recebidos do Flask:", resNot.data);
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
            const formData = new FormData();
            formData.append('plano', JSON.stringify(plano));
            formData.append('ishikawa', JSON.stringify(ishikawa));
            if (arquivoEvidencia) {
                formData.append('evidencia', arquivoEvidencia);
            }

            await api.post(`/api/notificacoes/${selecionada.id}/plano`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('✅ Plano de Ação enviado com sucesso!');
            setSelecionada(null);
            carregarDados();
        } catch (err) {
            alert('❌ Erro ao enviar plano. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    // Filtragem por setor e busca
    const dadosFiltrados = todasNotificacoes.filter(n => {
        // Filtro por setor
        if (setorAtivo !== "TODOS" && n.unidade_notificada !== setorAtivo) return false;

        // Filtro por período
        if (filtros.dataInicio) {
            const dataCriacao = new Date(n.criado_em);
            if (dataCriacao < new Date(filtros.dataInicio)) return false;
        }
        if (filtros.dataFim) {
            const dataCriacao = new Date(n.criado_em);
            if (dataCriacao > new Date(filtros.dataFim)) return false;
        }

        // Filtro por busca textual
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            const protocolo = (n.protocolo || '').toLowerCase();
            const paciente = (n.paciente_nome || n.nome_paciente || '').toLowerCase();
            const setor = (n.unidade_notificada || '').toLowerCase();
            if (!protocolo.includes(busca) && !paciente.includes(busca) && !setor.includes(busca)) {
                return false;
            }
        }

        return true;
    });

    // Separação entre pendências e histórico
    const pendentes = dadosFiltrados.filter(n =>
        n.status === 'ENCAMINHADA AO GESTOR'
    );

    const historico = dadosFiltrados.filter(n =>
        n.status === 'CONCLUIDO' || n.status === 'ENCERRADA' || n.status === 'ENCERRADO_POR_QUALIDADE'
    );

    // Stats (apenas para o setor ativo)
    const stats = {
        totalMes: dadosFiltrados.length,
        pendentes: pendentes.length,
        resolvidas: historico.length,
        graves: dadosFiltrados.filter(n => n.gravidade === 'Grave / Sentinela').length,
        nearMiss: dadosFiltrados.filter(n => n.classificacao === 'Quase Erro').length
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">CARREGANDO DASHBOARD...</div>;

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">

            {/* Cabeçalho com filtros */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Performance <span className="text-sky-600">Operacional</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Análise de Segurança e Qualidade por Unidade
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Unidade:</span>
                    <select
                        className="bg-slate-50 border-none font-black text-sky-900 text-sm rounded-xl px-4 py-2 focus:ring-0 cursor-pointer"
                        value={setorAtivo}
                        onChange={(e) => setSetorAtivo(e.target.value)}
                    >
                        <option value="TODOS">GERAL (TODOS)</option>
                        {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                    </select>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    <input
                        type="text"
                        placeholder="🔍 Buscar (protocolo, paciente, setor)"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                        value={filtros.busca}
                        onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    />

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">De:</span>
                        <input
                            type="date"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            value={filtros.dataInicio}
                            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                        />
                        <span className="text-[10px] font-black text-slate-400">Até:</span>
                        <input
                            type="date"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            value={filtros.dataFim}
                            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                        />
                    </div>
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

            {/* Abas */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setAbaAtiva('pendentes')}
                    className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all ${abaAtiva === 'pendentes'
                            ? 'text-sky-600 border-b-2 border-sky-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Pendências {pendentes.length > 0 && `(${pendentes.length})`}
                </button>
                <button
                    onClick={() => setAbaAtiva('historico')}
                    className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all ${abaAtiva === 'historico'
                            ? 'text-sky-600 border-b-2 border-sky-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Histórico {historico.length > 0 && `(${historico.length})`}
                </button>
            </div>

            {/* Conteúdo das abas */}
            {abaAtiva === 'pendentes' && (
                <>
                    {pendentes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendentes.map(p => {
                                const dias = diasRestantes(p.prazo_limite);
                                let prazoClass = '', prazoText = '';
                                if (dias === null) prazoText = 'Sem prazo';
                                else if (dias < 0) { prazoClass = 'bg-red-600 text-white'; prazoText = `⚠️ Vencido há ${Math.abs(dias)}d`; }
                                else if (dias === 0) { prazoClass = 'bg-red-500 text-white'; prazoText = '🔴 Vence hoje!'; }
                                else if (dias <= 2) { prazoClass = 'bg-orange-500 text-white'; prazoText = `🟡 ${dias}d`; }
                                else if (dias <= 5) { prazoClass = 'bg-amber-400 text-white'; prazoText = `🟡 ${dias}d`; }
                                else { prazoClass = 'bg-green-500 text-white'; prazoText = `🟢 ${dias}d`; }

                                return (
                                    <div key={p.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white hover:border-sky-200 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-sky-50">
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase">#{p.protocolo}</span>
                                        </div>

                                        {/* Dados do paciente */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                                                👤 {p.nome_paciente || 'Não identificado'}
                                            </span>
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                                                🆔 Pront: {p.prontuario || '---'}
                                            </span>
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                                                🎂 {calcularIdade(p.data_nascimento_paciente) ? `${calcularIdade(p.data_nascimento_paciente)} anos` : '---'}
                                            </span>
                                        </div>

                                        <h3 className="font-black text-slate-800 uppercase italic mb-2 tracking-tight line-clamp-1">{p.titulo_ocorrencia}</h3>
                                        <p className="text-xs text-slate-400 mb-6 italic line-clamp-2">"{p.descricao}"</p>

                                        <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-black text-slate-300 uppercase flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    Prazo
                                                </span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${prazoClass}`}>
                                                    {prazoText}
                                                </span>
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

                                                    // ✅ Se vier do back, preserva; se não, usa seu padrão
                                                    setIshikawa(p.ishikawa || {
                                                        metodos: '',
                                                        mao_de_obra: '',
                                                        maquinas: '',
                                                        materiais: '',
                                                        ambiente: '',
                                                        medida: '',
                                                        conclusao: ''
                                                    });

                                                    setArquivoEvidencia(null);
                                                }}
                                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg"
                                            >
                                                Responder
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-green-200 shadow-inner">
                            <div className="text-7xl mb-4 animate-bounce">🎉</div>
                            <h3 className="text-2xl font-black text-green-600 uppercase tracking-tight">Tudo em dia!</h3>
                            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                                Não há notificações pendentes para esta unidade.
                                Continue assim, a qualidade agradece! 🚀
                            </p>
                            <div className="mt-6 flex justify-center gap-2 text-2xl opacity-50">
                                <span>✨</span> <span>📋</span> <span>✅</span> <span>🏆</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {abaAtiva === 'historico' && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {historico.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Protocolo</th>
                                        <th className="px-6 py-4 text-left font-semibold">Paciente</th>
                                        <th className="px-6 py-4 text-left font-semibold">Setor</th>
                                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left font-semibold">Classificação</th>
                                        <th className="px-6 py-4 text-left font-semibold">Gravidade</th>
                                        <th className="px-6 py-4 text-left font-semibold">Data</th>
                                        <th className="px-6 py-4 text-center font-semibold">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {historico.map(n => (
                                        <tr key={n.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-mono font-bold">{n.protocolo}</td>
                                            <td className="px-6 py-4">
                                                <div>{n.paciente_nome || n.nome_paciente || '—'}</div>
                                                <div className="text-xs text-slate-400">Pront: {n.prontuario || '—'}</div>
                                            </td>
                                            <td className="px-6 py-4">{n.unidade_notificada}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${n.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-700' :
                                                        n.status === 'ENCERRADA' ? 'bg-gray-200 text-gray-600' :
                                                            'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {n.status === 'CONCLUIDO' && 'Concluído'}
                                                    {n.status === 'ENCERRADA' && 'Encerrado'}
                                                    {n.status === 'ENCERRADO_POR_QUALIDADE' && 'Encerrado (Qualidade)'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{n.classificacao || '—'}</td>
                                            <td className="px-6 py-4">{n.gravidade || '—'}</td>
                                            <td className="px-6 py-4">{formatarData(n.criado_em)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelecionada(n);
                                                        setPlano({
                                                            o_que: n.plano_acao?.o_que || '',
                                                            por_que: n.plano_acao?.por_que || '',
                                                            quem: n.plano_acao?.quem || '',
                                                            quando: n.plano_acao?.quando || '',
                                                            como: n.plano_acao?.como || '',
                                                            onde: n.plano_acao?.onde || ''
                                                        });

                                                        setIshikawa(n.ishikawa || {
                                                            metodos: '',
                                                            mao_de_obra: '',
                                                            maquinas: '',
                                                            materiais: '',
                                                            ambiente: '',
                                                            medida: '',
                                                            conclusao: ''
                                                        });

                                                        setArquivoEvidencia(null);
                                                    }}
                                                    className="text-sky-600 hover:text-sky-800 font-semibold text-xs uppercase tracking-wider"
                                                >
                                                    Visualizar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <span className="text-6xl mb-4 block">📭</span>
                            <p className="text-lg font-semibold">Nenhum registro no histórico</p>
                            <p className="text-sm mt-2">As notificações concluídas aparecerão aqui.</p>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO / EDIÇÃO */}
            {selecionada && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Cabeçalho */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
                            <div>
                                <h2 className="text-2xl font-light text-slate-800">
                                    {abaAtiva === 'historico' ? 'Visualização' : 'Plano de Ação'} · <span className="font-mono font-semibold text-indigo-600">{selecionada.protocolo}</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {abaAtiva === 'historico'
                                        ? 'Detalhes da notificação e plano de ação'
                                        : 'Preencha os campos abaixo para elaborar o plano 5W2H'}
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
                            {/* Ficha do paciente */}
                            <div className="bg-indigo-50/50 rounded-xl p-5 text-sm border border-indigo-100">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 border-b border-indigo-100 pb-3">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase">Paciente</p>
                                        <p className="font-bold text-slate-700">{selecionada.nome_paciente || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase">Prontuário</p>
                                        <p className="font-bold text-slate-700">{selecionada.prontuario || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase">Idade</p>
                                        <p className="font-bold text-slate-700">
                                            {calcularIdade(selecionada.data_nascimento_paciente) ? `${calcularIdade(selecionada.data_nascimento_paciente)} anos` : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase">Nascimento</p>
                                        <p className="font-bold text-slate-700">
                                            {selecionada.data_nascimento_paciente ? new Date(selecionada.data_nascimento_paciente).toLocaleDateString('pt-BR') : '—'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-indigo-800 font-medium mb-1 italic">Relato do Notificador:</p>
                                <p className="text-slate-600 leading-relaxed italic">"{selecionada.descricao}"</p>
                            </div>

                            {/* Grid 5W2H */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {['o_que', 'por_que', 'quem', 'quando', 'como', 'onde'].map((campo, idx) => (
                                    <div key={campo} className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                            <span className="text-indigo-500">{idx + 1}.</span> {campo === 'o_que' ? 'O quê? (What)' :
                                                campo === 'por_que' ? 'Por quê? (Why)' :
                                                    campo === 'quem' ? 'Quem? (Who)' :
                                                        campo === 'quando' ? 'Quando? (When)' :
                                                            campo === 'como' ? 'Como? (How)' : 'Onde? (Where)'}
                                        </label>
                                        {campo === 'o_que' || campo === 'por_que' || campo === 'como' ? (
                                            <textarea
                                                rows={2}
                                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                                placeholder={`Descreva ${campo === 'o_que' ? 'a ação' : campo === 'por_que' ? 'a justificativa' : 'o método'}`}
                                                value={plano[campo]}
                                                onChange={(e) => setPlano({ ...plano, [campo]: e.target.value })}
                                                disabled={abaAtiva === 'historico'}
                                            />
                                        ) : campo === 'quando' ? (
                                            <input
                                                type="date"
                                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                                value={plano[campo]}
                                                onChange={(e) => setPlano({ ...plano, [campo]: e.target.value })}
                                                disabled={abaAtiva === 'historico'}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                                placeholder={`Responsável pela execução`}
                                                value={plano[campo]}
                                                onChange={(e) => setPlano({ ...plano, [campo]: e.target.value })}
                                                disabled={abaAtiva === 'historico'}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ✅ Ishikawa (6Ms) com SELECT + conclusão livre */}
                            {selecionada.gravidade === 'Grave / Sentinela' && (
                                <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-200">
                                    <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span>🐟</span> Análise Ishikawa (6Ms) · Padronizada
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'mao_de_obra', label: 'Mão de Obra' },
                                            { key: 'maquinas', label: 'Máquinas' },
                                            { key: 'materiais', label: 'Materiais' },
                                            { key: 'metodos', label: 'Métodos' },
                                            { key: 'ambiente', label: 'Ambiente' },
                                            { key: 'medida', label: 'Medida' },
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="text-[10px] font-black text-amber-700 uppercase">{label}</label>
                                                <select
                                                    className="w-full p-3 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                                                    value={ishikawa[key] || ''}
                                                    onChange={(e) => setIshikawa({ ...ishikawa, [key]: e.target.value })}
                                                    disabled={abaAtiva === 'historico'}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {(ISHIKAWA_OPTIONS[key] || []).map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}

                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-amber-700 uppercase">Conclusão (livre)</label>
                                            <textarea
                                                rows={3}
                                                className="w-full p-3 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                                                placeholder="Descreva a síntese da análise, barreiras, aprendizados e ações preventivas..."
                                                value={ishikawa.conclusao || ''}
                                                onChange={(e) => setIshikawa({ ...ishikawa, conclusao: e.target.value })}
                                                disabled={abaAtiva === 'historico'}
                                            />
                                            <p className="text-[11px] text-amber-700/80 mt-2">
                                                Cultura Justa: foco em melhorar barreiras e processo — aprender com o evento.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Evidência */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 107.072 7.072L21 12"></path></svg>
                                    Evidência anexada
                                </label>
                                {selecionada.evidencia_path ? (
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={selecionada.evidencia_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline"
                                        >
                                            📎 Ver arquivo
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Nenhuma evidência anexada.</p>
                                )}
                                {abaAtiva === 'pendentes' && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf,.doc,.docx"
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mt-3"
                                            onChange={(e) => setArquivoEvidencia(e.target.files[0])}
                                        />
                                        {arquivoEvidencia && (
                                            <p className="text-xs text-green-600 mt-2">✅ {arquivoEvidencia.name} selecionado</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Rodapé com ações */}
                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setSelecionada(null)}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition"
                            >
                                Fechar
                            </button>
                            {abaAtiva === 'pendentes' && (
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
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PainelGestor;
