import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, senha });
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      localStorage.setItem('perfil', usuario.perfil);

      if (usuario.perfil === 'Gestor') {
        navigate('/gestor');
      } else {
        navigate('/triagem');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Falha na autenticação. Verifique suas credenciais.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagem de fundo com zoom dinâmico */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://i.ibb.co/nqDTxnLf/o-conceito-de-gestao-de-qualidade-padroes-e-classificacao-como-um-processo-de-negocio-e-tecnologia-a.avif" 
          alt="Gestão de Qualidade" 
          className="w-full h-full object-cover animate-zoom"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay escuro para legibilidade */}
      </div>

      {/* Conteúdo do login */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl w-[28rem] border border-white/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
            <span className="text-sky-600">QUALI-BENT</span>
          </h2>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2">
            Sistema de Gestão de Notificações
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-white border border-slate-200 focus:border-sky-500 p-4 rounded-2xl outline-none transition-all" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="mb-8">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Senha</label>
            <input 
              type="password" 
              className="w-full bg-white border border-slate-200 focus:border-sky-500 p-4 rounded-2xl outline-none transition-all" 
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-sky-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-700 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-sky-200">
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-slate-500 hover:text-sky-600 transition">
            ← Voltar para a página inicial
          </a>
        </div>
      </div>

      {/* Animação de zoom definida no CSS */}
      <style jsx>{`
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

export default Login;