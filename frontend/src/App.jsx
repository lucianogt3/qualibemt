import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RegistroOcorrencia from './pages/RegistroOcorrencia';
import Login from './pages/Login';
import Triagem from './pages/Triagem';
import AdminDashboard from './pages/AdminDashboard';
import ConfiguracoesOcorrencia from './pages/Admin/ConfiguracoesOcorrencia';
import GerenciarUsuarios from './pages/Admin/GerenciarUsuarios'; // ADICIONADO: Import da nova tela

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registrar" element={<RegistroOcorrencia />} />
            <Route path="/login" element={<Login />} />
            <Route path="/triagem" element={<Triagem />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/config-ocorrencias" element={<ConfiguracoesOcorrencia />} />
            
            {/* ADICIONADO: Rota para a tela de usuários que estava faltando */}
            <Route path="/admin/usuarios" element={<GerenciarUsuarios />} /> 
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;