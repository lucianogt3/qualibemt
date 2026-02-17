import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Pegamos os dados do usuário salvos no Login
  const storedUser = localStorage.getItem('user');
  let user = null;

  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Erro ao ler dados do usuário", error);
  }

  const handleLogout = () => {
    localStorage.clear(); // Limpa tudo (token, user, perfil)
    navigate('/login');
  };

  return (
    <nav className="bg-sky-900 text-white shadow-2xl p-4 border-b border-sky-800">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo Modernizada */}
        <Link to="/" className="text-xl font-black italic tracking-tighter hover:text-sky-300 transition uppercase">
          Quali<span className="text-sky-400">Tec</span>
        </Link>

        <div className="flex gap-4 items-center">
          {/* Botão público sempre visível */}
          <Link to="/registrar" className="bg-sky-600 hover:bg-sky-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg">
            Nova Notificação
          </Link>
          
          {user ? (
            <>
              {/* LINKS BASEADOS NO PERFIL */}
              
              {/* Se for Qualidade ou Admin, vê a Triagem */}
              {(user.perfil === 'Qualidade' || user.perfil === 'ADM') && (
                <Link to="/triagem" className="hover:text-sky-300 text-[10px] font-black uppercase tracking-widest">Triagem</Link>
              )}

              {/* 🚀 Se for GESTOR, vê o Painel de Pendências */}
              {user.perfil === 'Gestor' && (
                <Link to="/gestor" className="text-orange-400 hover:text-orange-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="animate-pulse">●</span> Minhas Pendências
                </Link>
              )}
              
              {/* MENU EXCLUSIVO DO ADMINISTRADOR */}
              {user.perfil === 'ADM' && (
                <div className="flex gap-4 border-l border-sky-700 pl-4 ml-2">
                  <Link to="/admin/config-ocorrencias" className="text-gray-300 text-[10px] font-black uppercase hover:text-white">⚙️ Configs</Link>
                  <Link to="/admin/usuarios" className="text-gray-300 text-[10px] font-black uppercase hover:text-white">👥 Usuários</Link>
                </div>
              )}

              {/* Info Usuário e Sair */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-sky-800">
                <span className="text-[9px] font-bold text-sky-400 uppercase">{user.nome}</span>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition border border-red-500/20"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="text-[10px] font-black uppercase border border-sky-700 px-4 py-2 rounded-xl hover:bg-sky-800 transition tracking-widest">
              Acesso Restrito
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;