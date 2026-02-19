import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Inicial from './pages/Inicial'; // ✅ agora vai ser a tela de login bonita
import RegistroOcorrencia from './pages/RegistroOcorrencia';
import Triagem from './pages/Triagem';
import PainelGestor from './pages/PainelGestor';

// Administrativo
import AdminDashboard from './pages/AdminDashboard';
import GerenciarUsuarios from './pages/Admin/GerenciarUsuarios';
import ConfigOcorrencias from './pages/Admin/ConfiguracoesOcorrencia';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ✅ 1) / agora redireciona para /login (tela bonita) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ✅ 2) /login agora é a tela bonita (Inicial) */}
        <Route path="/login" element={<Inicial />} />

        {/* ✅ 3) REGISTRO PÚBLICO */}
        <Route path="/registrar" element={<RegistroOcorrencia />} />

        {/* ✅ 4) DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedPerfis={['Qualidade', 'Gestor', 'ADM']}>
              <PainelGestor />
            </ProtectedRoute>
          }
        />

        {/* ✅ 5) TRIAGEM */}
        <Route
          path="/triagem"
          element={
            <ProtectedRoute allowedPerfis={['Qualidade', 'ADM']}>
              <Triagem />
            </ProtectedRoute>
          }
        />

        {/* ✅ 6) /gestor (opcional) */}
        <Route
          path="/gestor"
          element={
            <ProtectedRoute allowedPerfis={['Gestor', 'ADM']}>
              <PainelGestor />
            </ProtectedRoute>
          }
        />

        {/* ✅ 7) ROTAS ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedPerfis={['ADM']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedPerfis={['ADM']}>
              <GerenciarUsuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/config-ocorrencias"
          element={
            <ProtectedRoute allowedPerfis={['ADM']}>
              <ConfigOcorrencias />
            </ProtectedRoute>
          }
        />

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
