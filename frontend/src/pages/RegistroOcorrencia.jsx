// src/pages/RegistroOcorrencia.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const RegistroOcorrencia = () => {
  const navigate = useNavigate();

  const [setores, setSetores] = useState([]);
  const [itensDinamicos, setItensDinamicos] = useState([]);
  const [foto, setFoto] = useState(null);

  // ✅ Modal de sucesso + protocolo + tipo
  const [sucesso, setSucesso] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');
  const [tipoSucesso, setTipoSucesso] = useState('NOT'); // NOT | REC | ELO
  const [copiado, setCopiado] = useState(false);

  const [formData, setFormData] = useState({
    origem: '',
    envolveu_paciente: '',
    titulo_ocorrencia: '',
    unidade_notificante: '',
    unidade_notificada: '',
    turno: '',
    gravidade: 'Leve',
    descricao: '',
    data_evento: new Date().toISOString().split('T')[0],
    nome_paciente: '',
    prontuario: '',
    data_nascimento_paciente: '',
    identificacao_notificante: ''
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resSetores, resItens] = await Promise.all([
          api.get('/api/admin/setores'),
          api.get('/api/admin/config/itens')
        ]);
        setSetores((resSetores.data || []).filter(s => s.ativo) || []);
        setItensDinamicos((resItens.data || []).filter(i => i.ativo) || []);
      } catch (err) {
        console.error('Erro ao carregar dados', err);
      }
    };
    carregarDados();
  }, []);

  const itensAssistenciais = itensDinamicos.filter(i => i.categoria === 'Assistencial');
  const itensApoio = itensDinamicos.filter(i => i.categoria === 'Apoio');

  const resetarFormulario = () => {
    setFoto(null);
    setFormData({
      origem: '',
      envolveu_paciente: '',
      titulo_ocorrencia: '',
      unidade_notificante: '',
      unidade_notificada: '',
      turno: '',
      gravidade: 'Leve',
      descricao: '',
      data_evento: new Date().toISOString().split('T')[0],
      nome_paciente: '',
      prontuario: '',
      data_nascimento_paciente: '',
      identificacao_notificante: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    const finalData = {
      ...formData,
      envolveu_paciente: formData.envolveu_paciente === 'Sim'
    };

    Object.keys(finalData).forEach(key => data.append(key, finalData[key]));
    if (foto) data.append('foto', foto);

    try {
      const response = await api.post('/api/notificacoes/registrar', data);

      setTipoSucesso(formData.origem || 'NOT');
      setProtocoloGerado(response.data.protocolo || '');
      setSucesso(true);
      setCopiado(false);

      // ✅ opcional: limpar formulário já (fica pronto pra “Nova notificação”)
      resetarFormulario();
    } catch (error) {
      alert('Erro ao enviar: ' + (error.response?.data?.error || 'Verifique a conexão'));
    }
  };

  // ======= CONFIG DO MODAL POR TIPO =======
  const cfg = {
    NOT: {
      titulo: 'Notificação recebida!',
      faixa: 'border-emerald-500',
      bola: 'bg-emerald-600',
      halo: 'bg-emerald-400/20',
      numeroBg: 'bg-emerald-50',
      numeroText: 'text-emerald-700',
      icone: '✓',
      texto: (
        <>
          Obrigado por contribuir com a <span className="font-black">Cultura Justa</span>.
          Aqui o foco é <span className="font-black">aprender com o processo</span> e fortalecer barreiras de segurança —
          <span className="font-black"> não punir pessoas por erros não intencionais</span>.
        </>
      ),
      passos: [
        { n: 1, t: 'Triagem da Qualidade', d: 'Sua notificação entra em triagem e pode ser encaminhada ao gestor responsável.' },
        { n: 2, t: 'Análise e ações', d: 'Se necessário, será aberto plano de ação (5W2H) e análise de causa (Ishikawa/6M).' },
        { n: 3, t: 'Acompanhamento', d: 'Guarde o protocolo para consultar o andamento e complementar informações.' },
      ],
      botaoPrimario: 'bg-emerald-600 hover:bg-emerald-700'
    },
    REC: {
      titulo: 'Reclamação registrada!',
      faixa: 'border-amber-500',
      bola: 'bg-amber-500',
      halo: 'bg-amber-400/20',
      numeroBg: 'bg-amber-50',
      numeroText: 'text-amber-700',
      icone: '!',
      texto: (
        <>
          Obrigado por relatar. Sua percepção melhora a <span className="font-black">experiência do paciente</span> e a qualidade do serviço.
          Vamos tratar com <span className="font-black">respeito e foco em solução</span>.
        </>
      ),
      passos: [
        { n: 1, t: 'Encaminhamento', d: 'A reclamação será direcionada ao setor responsável para avaliação.' },
        { n: 2, t: 'Resposta e melhorias', d: 'Se necessário, serão definidas ações corretivas e prazo de retorno.' },
        { n: 3, t: 'Acompanhe', d: 'Guarde o protocolo para consultar o andamento e complementar detalhes.' },
      ],
      botaoPrimario: 'bg-amber-500 hover:bg-amber-600'
    },
    ELO: {
      titulo: 'Elogio registrado!',
      faixa: 'border-sky-500',
      bola: 'bg-sky-600',
      halo: 'bg-sky-400/20',
      numeroBg: 'bg-sky-50',
      numeroText: 'text-sky-700',
      icone: '★',
      texto: (
        <>
          Obrigado por reconhecer boas práticas! Isso fortalece o que fazemos de melhor e ajuda a
          <span className="font-black"> replicar comportamentos seguros</span> e humanizados.
        </>
      ),
      passos: [
        { n: 1, t: 'Reconhecimento', d: 'O elogio será direcionado ao setor/unidade para ciência e valorização da equipe.' },
        { n: 2, t: 'Boas práticas', d: 'Podemos transformar em exemplo para reforçar cultura de segurança e humanização.' },
        { n: 3, t: 'Protocolo', d: 'Guarde o protocolo para consultar e complementar se desejar.' },
      ],
      botaoPrimario: 'bg-sky-600 hover:bg-sky-700'
    }
  };

  const c = cfg[tipoSucesso] || cfg.NOT;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-2xl mt-4 md:mt-10 rounded-3xl border border-gray-100 mb-20">
      <h2 className="text-2xl md:text-3xl font-black text-sky-900 mb-8 border-b-4 border-sky-500 pb-4 text-center italic uppercase">
        Notificação de Qualidade
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

        {/* 1. SELEÇÃO DE ORIGEM E DATA */}
        <div className="bg-sky-50/50 p-4 md:p-6 rounded-2xl border-2 border-sky-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-[10px] font-black text-sky-800 mb-2 uppercase tracking-widest">
              O que deseja registrar?
            </label>
            <select
              required
              className="w-full border-2 p-3 rounded-xl focus:border-sky-500 font-bold text-sky-700 bg-white"
              value={formData.origem}
              onChange={e =>
                setFormData({
                  ...formData,
                  origem: e.target.value,
                  envolveu_paciente: '',
                  titulo_ocorrencia: ''
                })
              }
            >
              <option value="">Selecione...</option>
              <option value="NOT">Notificação de Incidente / Erro</option>
              <option value="ELO">Elogio</option>
              <option value="REC">Reclamação</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-sky-800 mb-2 uppercase tracking-widest">
              Data do Evento
            </label>
            <input
              type="date"
              required
              className="w-full border-2 p-3 rounded-xl focus:border-sky-500 font-bold text-gray-600 bg-white"
              value={formData.data_evento}
              onChange={e => setFormData({ ...formData, data_evento: e.target.value })}
            />
          </div>
        </div>

        {/* 2. BLOCO DE SETORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-sky-600 mb-1 uppercase tracking-[0.15em] block ml-1">
              🏢 Setor Notificante (Sua Unidade)
            </label>
            <select
              required
              className="w-full border-2 p-4 rounded-2xl bg-gray-50 font-bold text-gray-700 focus:border-sky-500 outline-none transition-all"
              value={formData.unidade_notificante}
              onChange={e => setFormData({ ...formData, unidade_notificante: e.target.value })}
            >
              <option value="">Quem está avisando?</option>
              {setores.map(s => (
                <option key={s.id} value={s.nome}>{s.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-orange-600 mb-1 uppercase tracking-[0.15em] block ml-1">
              📍 Setor Notificado (Onde ocorreu)
            </label>
            <select
              required
              className="w-full border-2 p-4 rounded-2xl bg-orange-50/20 border-orange-100 font-bold text-gray-700 focus:border-orange-500 outline-none transition-all"
              value={formData.unidade_notificada}
              onChange={e => setFormData({ ...formData, unidade_notificada: e.target.value })}
            >
              <option value="">Onde aconteceu o fato?</option>
              {setores.map(s => (
                <option key={s.id} value={s.nome}>{s.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. LÓGICA PARA NOTIFICAÇÃO (SIM/NÃO) */}
        {formData.origem === 'NOT' && (
          <div className="bg-sky-900 p-6 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-300">
            <label className="block font-black text-white mb-4 text-center uppercase text-xs tracking-widest">
              A ocorrência envolveu um paciente?
            </label>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, envolveu_paciente: 'Sim' })}
                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs transition-all ${
                  formData.envolveu_paciente === 'Sim'
                    ? 'bg-green-500 text-white scale-105 shadow-lg'
                    : 'bg-sky-800 text-sky-300 hover:bg-sky-700'
                }`}
              >
                Sim, envolveu
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, envolveu_paciente: 'Não' })}
                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs transition-all ${
                  formData.envolveu_paciente === 'Não'
                    ? 'bg-orange-500 text-white scale-105 shadow-lg'
                    : 'bg-sky-800 text-sky-300 hover:bg-sky-700'
                }`}
              >
                Não, processo/apoio
              </button>
            </div>
          </div>
        )}

        {/* 4. CAMPOS DINÂMICOS */}
        {(formData.origem !== '' && (formData.origem !== 'NOT' || formData.envolveu_paciente !== '')) && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest ml-1">
                  Assunto / Título
                </label>

                {formData.origem === 'NOT' ? (
                  <select
                    required
                    className="w-full border-2 p-4 rounded-2xl bg-white font-bold text-sky-700 outline-none focus:border-sky-500 shadow-sm"
                    value={formData.titulo_ocorrencia}
                    onChange={e => setFormData({ ...formData, titulo_ocorrencia: e.target.value })}
                  >
                    <option value="">Selecione o tipo...</option>
                    {formData.envolveu_paciente === 'Sim'
                      ? itensAssistenciais.map(i => <option key={i.id} value={i.titulo}>{i.titulo}</option>)
                      : itensApoio.map(i => <option key={i.id} value={i.titulo}>{i.titulo}</option>)
                    }
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={formData.origem === 'REC' ? 'Resumo da reclamação' : 'Resumo do elogio'}
                    required
                    className="w-full border-2 p-4 rounded-2xl font-bold"
                    value={formData.titulo_ocorrencia}
                    onChange={e => setFormData({ ...formData, titulo_ocorrencia: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest ml-1">
                  Turno do Evento
                </label>
                <select
                  required
                  className="w-full border-2 p-4 rounded-2xl bg-white font-bold text-gray-700 shadow-sm"
                  value={formData.turno}
                  onChange={e => setFormData({ ...formData, turno: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="ADM">ADM</option>
                </select>
              </div>
            </div>

            {/* Dados do Paciente (somente NOT com paciente) */}
            {formData.envolveu_paciente === 'Sim' && (
              <div className="p-6 border-2 border-sky-100 rounded-[2rem] bg-sky-50/20 grid grid-cols-1 md:grid-cols-3 gap-4 border-l-8 border-l-sky-500 shadow-sm">
                <div className="md:col-span-3 font-black text-sky-800 uppercase text-[10px] tracking-[.2em] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                  Dados do Paciente
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Nome Completo</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 rounded-xl bg-white"
                    value={formData.nome_paciente}
                    onChange={e => setFormData({ ...formData, nome_paciente: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Prontuário</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 rounded-xl bg-white"
                    value={formData.prontuario}
                    onChange={e => setFormData({ ...formData, prontuario: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Data de Nascimento</label>
                  <input
                    type="date"
                    className="w-full p-3 border-2 rounded-xl bg-white text-gray-500"
                    value={formData.data_nascimento_paciente}
                    onChange={e => setFormData({ ...formData, data_nascimento_paciente: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest ml-1">
                {formData.origem === 'ELO'
                  ? 'Descrição do Elogio'
                  : formData.origem === 'REC'
                    ? 'Descrição da Reclamação'
                    : 'Descrição Detalhada do Relato'}
              </label>

              <textarea
                placeholder={
                  formData.origem === 'ELO'
                    ? 'Descreva o que foi positivo e por quê...'
                    : formData.origem === 'REC'
                      ? 'Descreva o que ocorreu e como podemos melhorar...'
                      : 'Relate os fatos de forma objetiva...'
                }
                required
                className="w-full border-2 p-4 rounded-2xl h-40 focus:border-sky-500 outline-none transition-all font-medium bg-gray-50 shadow-inner"
                value={formData.descricao}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="bg-gray-50 p-6 md:p-8 border-4 border-dashed border-gray-100 rounded-[2.5rem] text-center hover:bg-white hover:border-sky-200 transition-all cursor-pointer group">
              <label className="block text-gray-400 group-hover:text-sky-600 font-black mb-2 uppercase text-[10px] tracking-widest">
                📸 Evidência (Foto ou Documento)
              </label>
              <input
                type="file"
                onChange={e => setFoto(e.target.files?.[0] || null)}
                className="text-xs mx-auto text-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-700 text-white py-6 rounded-3xl font-black text-xl hover:bg-sky-800 shadow-2xl shadow-sky-100 transition-all active:scale-95 uppercase tracking-tighter"
            >
              Finalizar Notificação
            </button>
          </div>
        )}
      </form>

      {/* ✅ MODAL ANIMADO COM ORIENTAÇÃO + CULTURA JUSTA (por tipo) */}
      {sucesso && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSucesso(false)}
          />

          {/* card */}
          <div className={`relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[12px] ${c.faixa} animate-[zoomIn_0.35s_ease-out]`}>
            {/* glows */}
            <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[60px] ${c.halo}`} />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-[60px] bg-slate-900/10" />

            <div className="relative p-10">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-slate-50 ring-8 ring-slate-50/60 flex items-center justify-center">
                <div className={`w-14 h-14 rounded-full ${c.bola} text-white flex items-center justify-center text-3xl font-black animate-[pop_0.55s_ease-out]`}>
                  {c.icone}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight text-center">
                {c.titulo}
              </h2>

              <p className="mt-3 text-center text-slate-600 text-sm leading-relaxed">
                {c.texto}
              </p>

              {/* protocolo */}
              <div className="mt-7 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Protocolo gerado
                    </div>
                    <div className="mt-1 text-xl font-black tracking-[0.25em] text-sky-700">
                      {protocoloGerado || '—'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(protocoloGerado || '');
                        setCopiado(true);
                        setTimeout(() => setCopiado(false), 1600);
                      } catch {
                        setCopiado(false);
                      }
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition"
                  >
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* orientações */}
              <div className="mt-6 grid gap-3">
                {c.passos.map(p => (
                  <div key={p.n} className="flex gap-3 items-start bg-white border border-slate-200 rounded-2xl p-4">
                    <div className={`w-9 h-9 rounded-xl ${c.numeroBg} ${c.numeroText} flex items-center justify-center font-black`}>
                      {p.n}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-slate-700">
                        {p.t}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {p.d}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ações */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // já está resetado, só fecha
                    setSucesso(false);
                    // volta pro topo do formulário
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-sky-700 transition"
                >
                  Nova notificação
                </button>

                {/* Se você tiver rota de consulta por protocolo, troque o to="/consultar" para a sua rota real */}
                <Link
                  to="/"
                  className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition text-center"
                >
                  Voltar ao início
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSucesso(false);
                    navigate('/'); // pode trocar para /dashboard se preferir
                  }}
                  className={`w-full sm:w-auto px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition ${c.botaoPrimario}`}
                >
                  Concluir
                </button>
              </div>

              <p className="mt-5 text-center text-[11px] text-slate-400">
                * Cultura Justa: responsabilidade proporcional — aprendemos com falhas do sistema e fortalecemos barreiras.
              </p>
            </div>

            {/* keyframes (sem libs) */}
            <style>{`
              @keyframes zoomIn { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes pop { 0% { transform: scale(.6); opacity: .35; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroOcorrencia;
