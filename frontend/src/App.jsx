import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Pacientes from './pages/Pacientes/Pacientes';
import Prontuario from './pages/Prontuario/Prontuario';
import Relatorios from './pages/Relatorios/Relatorios';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <main className="main-content-full">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/prontuario" element={<Prontuario />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}