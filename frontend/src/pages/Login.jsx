import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Importe sua configuração do axios

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Faz a chamada real para o seu backend Flask
      const res = await api.post('/api/auth/login', { email, senha });
      
      const { token, usuario } = res.data;

     // 2. Salva os dados para persistência (Token e Objeto do Usuário)
      localStorage.setItem('token', token);
      
      // Salvamos o objeto completo como string para a Navbar conseguir ler user.nome e user.perfil
      localStorage.setItem('user', JSON.stringify(usuario)); 
      
      // Opcional: manter o perfil separado se você usar em outros lugares
      localStorage.setItem('perfil', usuario.perfil);

      // 3. LOGICA DE REDIRECIONAMENTO 🚀
      if (usuario.perfil === 'Gestor') {
        navigate('/gestor');
      } else {
        navigate('/triagem');
      }

      // 3. LOGICA DE REDIRECIONAMENTO POR PERFIL 🚀
      console.log("Usuário logado como:", usuario.perfil);
      
      if (usuario.perfil === 'Gestor') {
        navigate('/gestor');
      } else {
        navigate('/triagem'); // Admin ou Qualidade
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Falha na autenticação. Verifique suas credenciais.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-[28rem] border border-slate-100">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Login <span className="text-sky-600">Sistema</span></h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Área de Governança e Qualidade</p>
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">E-mail Institucional</label>
          <input 
            type="email" 
            className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium" 
            placeholder="exemplo@hospital.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Senha de Acesso</label>
          <input 
            type="password" 
            className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium" 
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-700 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-200">
          Entrar no Painel
        </button>
      </form>
    </div>
  );
};

export default Login;