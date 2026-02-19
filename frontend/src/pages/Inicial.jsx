import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;

const TermosTexto = () => (
  <div className="text-sm text-slate-700 space-y-3 max-h-56 overflow-auto pr-2">
    <p className="font-black uppercase text-xs tracking-widest text-slate-500">Termo de Uso</p>
    <p>
      Este sistema é destinado exclusivamente ao uso interno e/ou autorizado do hospital.
      O acesso é pessoal e intransferível. É proibido compartilhar credenciais.
    </p>

    <p className="font-black uppercase text-xs tracking-widest text-slate-500">Confidencialidade (LGPD)</p>
    <p>
      Ao utilizar este sistema, você se compromete a manter sigilo absoluto sobre informações assistenciais,
      dados de pacientes, prontuários, eventos, documentos e evidências. O uso indevido poderá gerar medidas
      administrativas, disciplinares e legais.
    </p>

    <p className="font-black uppercase text-xs tracking-widest text-slate-500">Auditoria e rastreabilidade</p>
    <p>
      O sistema registra logs de acesso e ações para fins de segurança e auditoria. Ao prosseguir, você concorda
      com esta rastreabilidade.
    </p>

    <p className="font-black uppercase text-xs tracking-widest text-slate-500">Responsabilidade</p>
    <p>
      Você é responsável por todas as ações realizadas em sua conta. Em caso de suspeita de acesso indevido,
      comunique imediatamente a Gestão da Qualidade/TI.
    </p>
  </div>
);

const Inicial = () => {
  const navigate = useNavigate();

  // Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Busca protocolo
  const [protocolo, setProtocolo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ações obrigatórias (modal)
  const [mostrarModalAcoes, setMostrarModalAcoes] = useState(false);
  const [acoes, setAcoes] = useState([]); // ["TROCAR_SENHA","ACEITAR_TERMOS"]
  const [usuarioIdTemp, setUsuarioIdTemp] = useState(null);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceite, setAceite] = useState(false);

  // Auto redirect se já logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario?.perfil === 'Gestor') navigate('/gestor');
        else navigate('/dashboard');
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
  }, [navigate]);

  const consultarProtocolo = async () => {
    if (!protocolo) return alert("Digite um protocolo.");
    setLoading(true);
    try {
      const response = await api.get(`/api/notificacoes/consultar/${protocolo}`);
      setResultado(response.data);
    } catch {
      alert("Protocolo não encontrado.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      const res = await api.post('/api/auth/login', { email, senha });


      // ✅ Se backend exigir ações, abre modal
      if (res.data?.requires_action) {
        setAcoes(res.data.acoes || []);
        setUsuarioIdTemp(res.data.usuario_id);
        setAceite(false);
        setNovaSenha('');
        setConfirmarSenha('');
        setMostrarModalAcoes(true);
        return;
      }

      // ✅ Login ok
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      if (usuario.perfil === 'Gestor') navigate('/gestor');
      else navigate('/dashboard');

    } catch (err) {
      alert(err.response?.data?.error || "Falha na autenticação.");
    } finally {
      setLoginLoading(false);
    }
  };

  const finalizarAcesso = async (e) => {
    e.preventDefault();

    const precisaTrocar = acoes.includes("TROCAR_SENHA");
    const precisaAceitar = acoes.includes("ACEITAR_TERMOS");

    if (precisaTrocar) {
      if (!SENHA_FORTE_REGEX.test(novaSenha)) {
        alert(
          "Senha fraca.\n\nRegras:\n- Mínimo 8 caracteres\n- 1 maiúscula\n- 1 minúscula\n- 1 número\n- 1 símbolo (@$!%*?&#^()_-+=)"
        );
        return;
      }
      if (novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
      }
    }

    if (precisaAceitar && !aceite) {
      alert("Você precisa concordar com os termos e confidencialidade para acessar.");
      return;
    }

    setLoginLoading(true);
    try {
      const payload = {
        usuario_id: usuarioIdTemp,
        aceitou_termos: !!aceite
      };

      if (precisaTrocar) payload.nova_senha = novaSenha;

      const res = await api.post('/api/auth/finalizar-acesso', payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

      setMostrarModalAcoes(false);

      if (res.data.usuario.perfil === 'Gestor') navigate('/gestor');
      else navigate('/dashboard');

    } catch (err) {
      alert(err.response?.data?.error || "Erro ao liberar acesso.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fundo */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.ibb.co/nqDTxnLf/o-conceito-de-gestao-de-qualidade-padroes-e-classificacao-como-um-processo-de-negocio-e-tecnologia-a.avif"
          alt="Gestão de Qualidade"
          className="w-full h-full object-cover animate-zoom"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
            <span className="text-sky-400">QUALI-BEMT</span>
          </h1>
          <p className="text-white/80 text-sm uppercase tracking-widest mt-2">
            Sistema de Gestão de Notificações
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Busca */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acompanhe sua manifestação</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ex: NOT0012026"
                className="flex-1 border-2 border-gray-200 p-4 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all uppercase"
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && consultarProtocolo()}
              />
              <button
                onClick={consultarProtocolo}
                disabled={loading}
                className={`px-6 ${loading ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'} text-white font-bold py-4 rounded-xl transition-all shadow-lg`}
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </div>

            {resultado && (
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl text-left border border-gray-200 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Resultado</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    resultado.status === 'PENDENTE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {resultado.status}
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>📅 Data:</strong> {resultado.criado_em || resultado.data}</p>
                  <p><strong>🏷️ Tipo:</strong> {resultado.origem}</p>
                  {resultado.descricao && (
                    <p className="border-t pt-2 mt-2 italic text-gray-500">
                      "{resultado.descricao.substring(0, 100)}..."
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/registrar')}
                className="w-full bg-sky-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-sky-700 transition shadow-lg"
              >
                + Nova Notificação
              </button>
            </div>
          </div>

          {/* Login */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">E-mail</label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Senha</label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-sky-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-sky-800 transition shadow-lg disabled:bg-gray-400"
              >
                {loginLoading ? 'Entrando...' : 'Entrar no Painel'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL AÇÕES OBRIGATÓRIAS */}
      {mostrarModalAcoes && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-t-8 border-amber-500 p-8">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                🔐
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic">Ação obrigatória</h3>
              <p className="text-xs text-slate-500 font-bold uppercase mt-2 tracking-widest">
                Para acessar, conclua os passos abaixo
              </p>
            </div>

            <form onSubmit={finalizarAcesso} className="space-y-4">
              {acoes.includes("TROCAR_SENHA") && (
                <>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-1 block">
                      Nova senha (forte)
                    </label>
                    <input
                      type="password"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 font-bold outline-none"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Ex: Quali@2026"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-2">
                      Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-1 block">
                      Confirmar senha
                    </label>
                    <input
                      type="password"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 font-bold outline-none"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {acoes.includes("ACEITAR_TERMOS") && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <TermosTexto />
                  <label className="flex items-center gap-3 mt-4 select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={aceite}
                      onChange={(e) => setAceite(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-slate-800">
                      Li e concordo com os termos de uso e confidencialidade
                    </span>
                  </label>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Não deixa acessar sem finalizar, mas pode fechar e tentar login de novo
                    setMostrarModalAcoes(false);
                  }}
                  className="w-1/3 bg-gray-200 text-gray-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-300 transition"
                  disabled={loginLoading}
                >
                  Fechar
                </button>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-2/3 bg-amber-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-amber-600 transition disabled:opacity-60"
                >
                  {loginLoading ? 'Salvando...' : 'Confirmar e acessar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-zoom { animation: zoom 20s infinite alternate ease-in-out; }
      `}</style>
    </div>
  );
};

export default Inicial;
