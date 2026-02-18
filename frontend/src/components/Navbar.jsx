import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const storedUser = localStorage.getItem('usuario') || localStorage.getItem('user');
  let user = null;

  try {
    if (storedUser) user = JSON.parse(storedUser);
  } catch (error) {
    console.error("Erro ao carregar usuário", error);
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Não mostrar na tela azul de busca
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-sky-800 text-white shadow-xl p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-black italic tracking-tighter">
          SISTEMA <span className="text-sky-400">QUALIDADE</span>
        </Link>

        <div className="flex gap-6 items-center">
          {user && (
            <>
              {/* 📊 LINK DASHBOARD (Garante que apareça para todos agora) */}
              <Link 
                to="/dashboard" 
                className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-300 transition ${location.pathname === '/dashboard' ? 'text-sky-300 underline underline-offset-4' : ''}`}
              >
                Dashboard
              </Link>
              
              {/* 📋 CENTRO DE TRIAGEM (Acesso Qualidade e ADM) */}
              {(user.perfil === 'Qualidade' || user.perfil === 'ADM') && (
                <Link 
                  to="/triagem" 
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-sky-600 hover:bg-sky-700 transition ${location.pathname === '/triagem' ? 'bg-sky-700' : ''}`}
                >
                  Centro de Triagem
                </Link>
              )}

              {/* ⚙️ CONFIGURAÇÕES (Somente ADM) */}
              {user.perfil === 'ADM' && (
                <div className="flex gap-4 border-l border-sky-600 pl-4 ml-2">
                   <Link to="/admin/usuarios" className="text-[10px] font-black uppercase text-sky-300 hover:text-white">Usuários</Link>
                   <Link to="/admin/config-ocorrencias" className="text-[10px] font-black uppercase text-sky-300 hover:text-white">Config</Link>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;