import React from 'react';
import '../../App.css';
import Sidebar from '../../components/SideBar';

export default function Relatorios() {
  return (
      <div className="dashboard-layout">
      <Sidebar />

    <div className="page-container">
      <div className="breadcrumb-info">
        <span>OdontoGestão / </span>
        <strong>Relatórios</strong>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios Consolidados</h1>
          <p className="page-subtitle">Visualize e exporte informações consolidadas do consultório</p>
        </div>
      </div>

      {/* Filtro de Datas */}
      <div className="filters-card">
        <strong style={{ fontSize: '12px', color: '#64748b', letterSpacing: '0.05em' }}>FILTROS DE DATA</strong>
        <div className="filters-grid">
          <label>Data Inicial:</label>
          <input type="date" />
          <label>Data Final:</label>
          <input type="date" />
        </div>
      </div>

      {/* Grid de Relatórios */}
      <div className="reports-grid">
        <div className="report-card">
          <div>
            <div className="report-icon-box" style={{ background: '#e0e7ff', color: '#3730a3' }}>👥</div>
            <h3>Relatório de Pacientes</h3>
            <p>Total de pacientes, novos cadastros e pacientes ativos</p>
          </div>
          <button className="btn-primary">Gerar Relatório</button>
        </div>

        <div className="report-card">
          <div>
            <div className="report-icon-box" style={{ background: '#d1fae5', color: '#065f46' }}>📅</div>
            <h3>Relatório de Consultas</h3>
            <p>Consultas realizadas, agendadas e canceladas por período</p>
          </div>
          <button className="btn-primary">Gerar Relatório</button>
        </div>

        <div className="report-card">
          <div>
            <div className="report-icon-box" style={{ background: '#fef3c7', color: '#92400e' }}>💰</div>
            <h3>Relatório Financeiro</h3>
            <p>Receitas, despesas, saldos e pagamentos pendentes</p>
          </div>
          <button className="btn-primary">Gerar Relatório</button>
        </div>

        <div className="report-card">
          <div>
            <div className="report-icon-box" style={{ background: '#ffedd5', color: '#9a3412' }}>📦</div>
            <h3>Relatório de Estoque</h3>
            <p>Materiais disponíveis, baixas, esgotados e prazos de validade</p>
          </div>
          <button className="btn-primary">Gerar Relatório</button>
        </div>
      </div>
    </div>
  </div>
  );
}