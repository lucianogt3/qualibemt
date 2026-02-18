import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Inicial = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [protocolo, setProtocolo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, senha });
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      localStorage.setItem('perfil', usuario.perfil);

      if (usuario.perfil === 'Gestor') {
        navigate('/gestor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || "Falha na autenticação.");
    } finally {
      setLoginLoading(false);
    }
  };

  const consultarProtocolo = async () => {
    if (!protocolo) return alert("Digite um protocolo.");
    setLoading(true);
    try {
      const response = await api.get(`/api/notificacoes/consultar/${protocolo}`);
      setResultado(response.data);
    } catch (error) {
      alert("Protocolo não encontrado.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagem de fundo com zoom via CSS global */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://i.ibb.co/nqDTxnLf/o-conceito-de-gestao-de-qualidade-padroes-e-classificacao-como-um-processo-de-negocio-e-tecnologia-a.avif" 
          alt="Gestão de Qualidade" 
          className="w-full h-full object-cover animate-zoom"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Conteúdo central */}
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
          {/* Coluna esquerda: Busca */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acompanhe sua manifestação</h2>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Ex: NOT0012026"
                className="flex-1 border-2 border-gray-200 p-4 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all uppercase"
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && consultarProtocolo()}
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

          {/* Coluna direita: Login */}
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

      {/* Estilo da animação - movido para cá sem atributo jsx */}
      <style>{`
        @keyframes zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-zoom {
          animation: zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Inicial;

