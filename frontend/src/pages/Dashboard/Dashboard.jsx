import React from 'react';
import '../../App.css';

export default function Dashboard() {
  const consultasHoje = [
    { horario: '08:00', paciente: 'Ana Costa Lima', procedimento: 'Limpeza · Dr. Lucas de Oliveira', status: 'Confirmado', tipo: 'ativo' },
    { horario: '09:00', paciente: 'Pedro Souza', procedimento: 'Avaliação · Dr. Lucas de Oliveira', status: 'Confirmado', tipo: 'ativo' },
    { horario: '10:30', paciente: 'Maria Clara Oliveira', procedimento: 'Restauração · Dr. Lucas de Oliveira', status: 'Aguardando', tipo: 'inativo' },
    { horario: '11:00', paciente: 'João Ferreira', procedimento: 'Extração · Dr. Lucas de Oliveira', status: 'Confirmado', tipo: 'ativo' },
    { horario: '14:00', paciente: 'Fernanda Rocha', procedimento: 'Clareamento · Dr. Lucas de Oliveira', status: 'Aguardando', tipo: 'inativo' },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-top-bar">
        <div className="breadcrumb-info">
          <span>OdontoGestão / </span>
          <strong>Painel de Controle</strong>
        </div>
        
        <div className="top-bar-right">
          <div className="search-header-box">
            <span>🔍</span>
            <input type="text" placeholder="Buscar paciente, consulta..." className="search-input" />
          </div>

          <div className="user-profile-header">
            <span className="bell-icon">🔔</span>
            <div className="avatar-header">CM</div>
            <div>
              <strong>Dr. Lucas de Oliveira</strong>
              <p>Dentista</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: '20px' }}>
        <div>
          <h1 className="page-title">Bom dia, Dr. Lucas!</h1>
          <p className="page-subtitle">Quinta-feira, 28 de agosto de 2025</p>
        </div>
        <button className="btn-primary">📅 Ver Agenda Completa</button>
      </div>

      <div className="dashboard-metrics-grid">
        <div className="metric-card-figma">
          <div className="metric-icon-wrapper purple">👥</div>
          <h2>1.248</h2>
          <p className="metric-label">Total de Pacientes</p>
          <span className="metric-sub">+12 este mês</span>
        </div>

        <div className="metric-card-figma">
          <div className="metric-icon-wrapper blue">📅</div>
          <h2>8</h2>
          <p className="metric-label">Consultas Hoje</p>
          <span className="metric-sub">2 confirmadas</span>
        </div>

        <div className="metric-card-figma">
          <div className="metric-icon-wrapper orange">💰</div>
          <h2>R$ 18.750</h2>
          <p className="metric-label">Receita do Mês</p>
          <span className="metric-sub">+8,2% em relação ao anterior</span>
        </div>

        <div className="metric-card-figma">
          <div className="metric-icon-wrapper brown">📦</div>
          <h2>3</h2>
          <p className="metric-label">Alertas de Estoque</p>
          <span className="metric-sub">Itens em falta</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="card consultations-card">
          <div className="consultations-header">
            <h3>Consultas de Hoje</h3>
            <span className="badge-agendadas">5 agendadas</span>
          </div>

          <div className="consultations-list">
            {consultasHoje.map((c, index) => (
              <div key={index} className="consultation-item">
                <span className="time-badge">{c.horario}</span>
                <div className="patient-details">
                  <strong>{c.paciente}</strong>
                  <p>{c.procedimento}</p>
                </div>
                <span className={c.tipo === 'ativo' ? 'badge-ativo' : 'badge-inativo'}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-sidebar-column">
          <div className="card">
            <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Acesso Rápido</h3>
            <div className="quick-access-list">
              <div className="quick-item">
                <div className="quick-item-left">
                  <span>👤</span>
                  <strong>Novo Paciente</strong>
                </div>
                <span>›</span>
              </div>

              <div className="quick-item">
                <div className="quick-item-left">
                  <span>📋</span>
                  <strong>Prontuários</strong>
                </div>
                <span>›</span>
              </div>

              <div className="quick-item">
                <div className="quick-item-left">
                  <span>💳</span>
                  <strong>Financeiro</strong>
                </div>
                <span>›</span>
              </div>

              <div className="quick-item highlight">
                <div className="quick-item-left">
                  <span>📦</span>
                  <strong>Estoque</strong>
                </div>
                <span>›</span>
              </div>
            </div>
          </div>

          <div className="system-reminder-card">
            <h4>Lembrete do Sistema</h4>
            <p>3 pacientes têm consulta de retorno vencida. Verifique a agenda para reagendamento.</p>
            <button className="btn-reminder">Ver detalhes</button>
          </div>
        </div>
      </div>
    </div>
  );
}