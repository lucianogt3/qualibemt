import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute (Melhor versão)
 *
 * Uso:
 * 1) Simples:
 * <ProtectedRoute><Dashboard /></ProtectedRoute>
 *
 * 2) Exigindo um perfil:
 * <ProtectedRoute perfilRequerido="ADM"><Usuarios /></ProtectedRoute>
 *
 * 3) Aceitando vários perfis:
 * <ProtectedRoute perfisPermitidos={["ADM", "QUALIDADE"]}><Painel /></ProtectedRoute>
 *
 * 4) Se quiser bloquear primeiro acesso mandando pra rota específica:
 * <ProtectedRoute redirectPrimeiroAcesso="/primeiro-acesso"><Dashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  perfilRequerido, // string: "ADM"
  perfisPermitidos, // array: ["ADM","QUALIDADE"]
  redirectPrimeiroAcesso = "/login",
}) => {
  const token = localStorage.getItem("token");

  // Você salva "usuario" no localStorage
  const usuarioStr = localStorage.getItem("usuario");
  let usuario = null;

  try {
    usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  } catch (e) {
    // Se o JSON estiver corrompido, limpa e bloqueia
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return <Navigate to="/login" replace />;
  }

  // 1) Sem sessão válida: volta pro login
  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2) Usuário inativo: volta pro login (ou crie uma página /inativo)
  if (usuario.ativo === false) {
    // opcional: limpar sessão
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return <Navigate to="/login" replace />;
  }

  // 3) Primeiro acesso: NÃO entra em rotas privadas
  // (o modal de troca é no Login)
  if (usuario.primeiro_acesso === true) {
    return <Navigate to={redirectPrimeiroAcesso} replace />;
  }

  // 4) Regra de perfil único
  if (perfilRequerido && usuario.perfil !== perfilRequerido) {
    return <Navigate to="/login" replace />;
  }

  // 5) Regra de múltiplos perfis
  if (Array.isArray(perfisPermitidos) && perfisPermitidos.length > 0) {
    if (!perfisPermitidos.includes(usuario.perfil)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
