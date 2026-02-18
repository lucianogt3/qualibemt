import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

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

  // ✅ Hooks SEMPRE no topo (antes de qualquer return)
  const [pendentesTriagem, setPendentesTriagem] = useState(0);

  useEffect(() => {
    if (!user) {
      setPendentesTriagem(0);
      return;
    }

    const podeVerTriagem = user.perfil === 'Qualidade' || user.perfil === 'ADM';
    if (!podeVerTriagem) {
      setPendentesTriagem(0);
      return;
    }

    let ativo = true;

    const carregarPendentes = async () => {
      try {
        const { data } = await api.get('/api/notificacoes/todas');

        const pendentes = (data || []).filter(n => {
          const status = (n?.status || '').toString().trim().toUpperCase();
          return status === 'PENDENTE';
        });

        if (ativo) setPendentesTriagem(pendentes.length);
      } catch (err) {
        console.error('Erro ao buscar pendentes de triagem:', err);
      }
    };

    carregarPendentes();
    const timer = setInterval(carregarPendentes, 20000);

    return () => {
      ativo = false;
      clearInterval(timer);
    };
  }, [storedUser]); // <- use storedUser para atualizar quando logar/deslogar

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ✅ Agora sim pode retornar null
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
              <Link
                to="/dashboard"
                className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-300 transition ${
                  location.pathname === '/dashboard' ? 'text-sky-300 underline underline-offset-4' : ''
                }`}
              >
                Dashboard
              </Link>

              {(user.perfil === 'Qualidade' || user.perfil === 'ADM') && (
                <Link
                  to="/triagem"
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-sky-600 hover:bg-sky-700 transition ${
                    location.pathname === '/triagem' ? 'bg-sky-700' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    Centro de Triagem

                    {pendentesTriagem > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black">
                        {pendentesTriagem}
                      </span>
                    )}
                  </span>
                </Link>
              )}

              {user.perfil === 'ADM' && (
                <div className="flex gap-4 border-l border-sky-600 pl-4 ml-2">
                  <Link to="/admin/usuarios" className="text-[10px] font-black uppercase text-sky-300 hover:text-white">
                    Usuários
                  </Link>
                  <Link to="/admin/config-ocorrencias" className="text-[10px] font-black uppercase text-sky-300 hover:text-white">
                    Config
                  </Link>
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
