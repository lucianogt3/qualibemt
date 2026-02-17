import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Inicial from './pages/Inicial'; // Sua tela azul (Busca + Acesso Restrito)
import RegistroOcorrencia from './pages/RegistroOcorrencia';
import Login from './pages/Login';
import Triagem from './pages/Triagem';
import PainelGestor from './pages/PainelGestor'; // Agora agindo como Dashboard Geral

// Administrativo
import AdminDashboard from './pages/AdminDashboard'; 
import GerenciarUsuarios from './pages/Admin/GerenciarUsuarios';
import ConfigOcorrencias from './pages/Admin/ConfiguracoesOcorrencia'; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* 1. TELA INICIAL (Apenas a tela azul de busca) */}
        <Route path="/" element={<Inicial />} />

        {/* 2. LOGIN (Removido o redirecionamento automático para a Inicial) */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. REGISTRO PÚBLICO */}
        <Route path="/registrar" element={<RegistroOcorrencia />} />
        
        {/* 4. DASHBOARD GERAL (Para Qualidade, Gestor e ADM verem os KPIs) */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedPerfis={['Qualidade', 'Gestor', 'ADM']}>
            <PainelGestor />
          </ProtectedRoute>
        } />

        {/* 5. TRIAGEM (Acesso apenas Qualidade e ADM) */}
        <Route path="/triagem" element={
          <ProtectedRoute allowedPerfis={['Qualidade', 'ADM']}>
            <Triagem />
          </ProtectedRoute>
        } />

        {/* 6. GESTOR (Caso queira manter uma rota específica, senão use o /dashboard) */}
        <Route path="/gestor" element={
          <ProtectedRoute allowedPerfis={['Gestor', 'ADM']}>
            <PainelGestor />
          </ProtectedRoute>
        } />

        {/* 7. ROTAS ADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute allowedPerfis={['ADM']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/usuarios" element={
          <ProtectedRoute allowedPerfis={['ADM']}>
            <GerenciarUsuarios />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/config-ocorrencias" element={
          <ProtectedRoute allowedPerfis={['ADM']}>
            <ConfigOcorrencias />
          </ProtectedRoute>
        } />

        {/* Rota de segurança: se digitar algo errado, volta para a tela azul */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;