import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🦷</div>
        <div>
          <h2>OdontoGestão</h2>
          <span>SISTEMA WEB</span>
        </div>
      </div>

      <div className="sidebar-section">MENU PRINCIPAL</div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span>🎛️</span> Dashboard
        </NavLink>
        
        <NavLink 
          to="/pacientes" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span>👥</span> Pacientes
        </NavLink>
        
        <div className="nav-item disabled-item">
          <span>📅</span> Agenda
        </div>
        
        <NavLink 
          to="/prontuario" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span>📋</span> Prontuários
        </NavLink>
        
        <div className="nav-item disabled-item">
          <span>💰</span> Financeiro
        </div>
        
        <div className="nav-item disabled-item">
          <span>📦</span> Estoque
        </div>
        
        <NavLink 
          to="/relatorios" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span>📊</span> Relatórios
        </NavLink>
      </nav>
    </aside>
  );
}