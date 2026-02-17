import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegamos os dados do localStorage com uma verificação de segurança
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Não mostrar a navbar na página inicial
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-sky-700 text-white shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Nome do Sistema */}
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-sky-200 transition">
          SISTEMA <span className="text-sky-300">QUALIDADE</span>
        </Link>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {/* Menu Comum para usuários logados */}
              <Link to="/admin" className="hover:text-sky-200 font-medium">Dashboard</Link>
              <Link to="/triagem" className="hover:text-sky-200 font-medium">Triagem</Link>
              
              {/* MENU EXCLUSIVO DO ADMINISTRADOR (perfil: ADM) */}
              {user?.perfil === 'ADM' && (
                <div className="flex gap-3 border-l border-sky-500 pl-4 ml-2">
                  <Link 
                    to="/admin/config-ocorrencias" 
                    className="text-yellow-300 font-bold hover:text-yellow-100 flex items-center gap-1"
                  >
                    <span>⚙️</span> Itens/Setores
                  </Link>
                  <Link 
                    to="/admin/usuarios" 
                    className="text-green-300 font-bold hover:text-green-100 flex items-center gap-1"
                  >
                    <span>👥</span> Usuários
                  </Link>
                </div>
              )}

              {/* Botão Sair */}
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition ml-4"
              >
                Sair
              </button>
            </>
          ) : null /* Se não estiver logado, não mostra nada (já oculto na página inicial) */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;