import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal de Reset (1º acesso)
  const [mostrarModalReset, setMostrarModalReset] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [userTemp, setUserTemp] = useState(null); // { usuario_id, email }

  const navigate = useNavigate();

  // ✅ Redireciona APENAS se houver sessão e NÃO estivermos no modal
  useEffect(() => {
    if (mostrarModalReset) return;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');

    if (token && user) {
      navigate('/dashboard');
    }
  }, [navigate, mostrarModalReset]);

  const handleResetSenha = async (e) => {
    e.preventDefault();
    setError('');

    if (!userTemp?.usuario_id) {
      setError('Não foi possível identificar o usuário para troca de senha.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    try {
      // ✅ Agora o backend devolve token + usuario atualizado
      const res = await api.post('/api/auth/reset-primeiro-acesso', {
        usuario_id: userTemp.usuario_id,
        nova_senha: novaSenha,
      });

      const { token, usuario } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      setMostrarModalReset(false);
      setNovaSenha('');
      setConfirmarSenha('');
      setUserTemp(null);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });

      // Debug útil (se quiser)
      // console.log("LOGIN RESPONSE:", response.data);

      const { token, usuario, primeiro_acesso } = response.data;

      // ✅ Aceita variações (true, 1, "true") e também confere usuario.primeiro_acesso
      const isPrimeiroAcesso =
        primeiro_acesso === true ||
        primeiro_acesso === 1 ||
        primeiro_acesso === 'true' ||
        usuario?.primeiro_acesso === true ||
        usuario?.primeiro_acesso === 1 ||
        usuario?.primeiro_acesso === 'true';

      if (isPrimeiroAcesso) {
        // ✅ MUITO IMPORTANTE: limpa sessão antiga para não redirecionar
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        // Não salva token ainda. Só abre modal.
        setUserTemp({ usuario_id: usuario.id, email: usuario.email });
        setMostrarModalReset(true);
        return;
      }

      // ✅ Fluxo normal
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans relative">
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-[450px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-t-[12px] border-sky-500 relative overflow-hidden">
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex p-4 bg-sky-50 rounded-3xl mb-6 ring-8 ring-sky-50/50">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Acesso <span className="text-sky-600">Restrito</span>
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl">
              <p className="text-red-700 text-xs font-bold uppercase tracking-tight">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-widest">
                E-mail Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-6 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-sky-500 outline-none transition-all font-bold shadow-inner"
                placeholder="usuario@hospital.com"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-5 tracking-widest">
                Chave de Segurança
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-6 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-sky-500 outline-none transition-all font-bold shadow-inner"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs hover:bg-sky-700 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL DE PRIMEIRO ACESSO */}
      {mostrarModalReset && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border-t-[12px] border-amber-500 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce">
                🔑
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-tight">
                Segurança Obrigatória
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest underline decoration-amber-500 decoration-2">
                Troque sua senha para o primeiro acesso
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-2xl">
                <p className="text-red-700 text-xs font-bold uppercase tracking-tight">⚠️ {error}</p>
              </div>
            )}

            <form onSubmit={handleResetSenha} className="space-y-4">
              <input
                type="password"
                placeholder="Definir Nova Senha"
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 font-bold outline-none"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirmar Nova Senha"
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 font-bold outline-none"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar e Acessar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
