import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import Sidebar from './components/sidebar';

import Dashboard from './pages/Dashboard/Dashboard';
import Pacientes from './pages/Pacientes/Pacientes';
import Prontuario from './pages/Prontuario/Prontuario';
import Relatorios from './pages/Relatorios/Relatorios';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Menu Lateral Fixo */}
        <Sidebar />

        {/* Área Principal das Telas */}
        <main className="main-content">
          <Routes>
            {/* Rota inicial entra direto no Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rotas Oficiais do Teu Trabalho */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/prontuario" element={<Prontuario />} />
            <Route path="/relatorios" element={<Relatorios />} />

            {/* Redirecionamento para qualquer rota desconhecida */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}