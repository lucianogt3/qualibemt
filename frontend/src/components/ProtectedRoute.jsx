import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, perfilRequerido }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Se não tem token, tchau! Volta pro login.
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se a rota pede um perfil específico (ex: Gestor) e o usuário não é, bloqueia.
  if (perfilRequerido && user.perfil !== perfilRequerido) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
