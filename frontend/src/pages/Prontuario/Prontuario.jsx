import React, { useState } from 'react';
import '../../App.css';

export default function Prontuario() {
  // Estado para controlar se exibe a lista ou o detalhe de um paciente
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('Resumo');

  const pacienteExemplo = {
    nome: 'Maria Clara Oliveira Santos',
    id: '0001',
    cpf: '345.678.901-23',
    nascimento: '15/03/1992 (33 anos)',
    telefone: '(11) 98765-4321',
    email: 'mariaclara@email.com',
    ultimoAtendimento: '15/08/2025',
    inicial: 'MC',
    cor: '#e11d48'
  };

  // Se o utilizador clicou em "Ver Prontuário", exibe a tela detalhada do Figma
  if (pacienteSelecionado) {
    return (
      <div className="page-container">
        {/* Cabeçalho superior / Breadcrumb */}
        <div className="page-header-top">
          <div className="breadcrumb-info">
            <span style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => setPacienteSelecionado(null)}>
              OdontoGestão / Prontuários / 
            </span>
            <strong> {pacienteSelecionado.nome}</strong>
          </div>
          <button className="btn-secondary" onClick={() => setPacienteSelecionado(null)}>
            ← Voltar para lista
          </button>
        </div>

        {/* Card do Paciente */}
        <div className="card patient-detail-card">
          <div className="avatar-huge" style={{ backgroundColor: pacienteSelecionado.cor }}>
            {pacienteSelecionado.inicial}
          </div>
          <div className="patient-info-main">
            <div className="patient-header-row">
              <div>
                <h2 className="patient-name-title">{pacienteSelecionado.nome}</h2>
                <span className="patient-code">Paciente #{pacienteSelecionado.id}</span>
              </div>
              <button className="btn-secondary">Editar paciente</button>
            </div>
            <div className="patient-stats-grid">
              <div>
                <label>CPF</label>
                <p>{pacienteSelecionado.cpf}</p>
              </div>
              <div>
                <label>NASCIMENTO</label>
                <p>{pacienteSelecionado.nascimento}</p>
              </div>
              <div>
                <label>TELEFONE</label>
                <p>{pacienteSelecionado.telefone}</p>
              </div>
              <div>
                <label>E-MAIL</label>
                <p>{pacienteSelecionado.email}</p>
              </div>
              <div>
                <label>ÚLTIMO ATENDIMENTO</label>
                <p>{pacienteSelecionado.ultimoAtendimento}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Abas de Navegação (Resumo, Histórico, Procedimentos, Anotações) */}
        <div className="tabs-container">
          {['Resumo', 'Histórico', 'Procedimentos', 'Anotações'].map((aba) => (
            <button
              key={aba}
              className={`tab-btn ${abaAtiva === aba ? 'active' : ''}`}
              onClick={() => setAbaAtiva(aba)}
            >
              {aba}
            </button>
          ))}
        </div>

        {/* Conteúdo da Aba Resumo */}
        {abaAtiva === 'Resumo' && (
          <div className="tab-content">
            {/* Grid de Métricas do Prontuário */}
            <div className="prontuario-cards-grid">
              <div className="metric-box">
                <div className="metric-box-header">
                  <span>📅 ÚLTIMA CONSULTA</span>
                </div>
                <h3>15/08/2025</h3>
                <p className="subtext">09:00</p>
                <p className="subtext">Dr. Lucas de Oliveira</p>
                <span className="badge-ativo">Concluído</span>
              </div>

              <div className="metric-box highlight-blue">
                <div className="metric-box-header text-blue">
                  <span>🕒 PRÓXIMA CONSULTA</span>
                </div>
                <h3>25/09/2025</h3>
                <p className="subtext">09:00</p>
                <p className="subtext">Clareamento dental</p>
                <p className="subtext">Dr. Lucas de Oliveira</p>
              </div>

              <div className="metric-box">
                <div className="metric-box-header">
                  <span>☑️ PROCEDIMENTOS</span>
                </div>
                <h2 className="big-number">6</h2>
                <p className="subtext">Realizados</p>
              </div>

              <div className="metric-box highlight-orange">
                <div className="metric-box-header text-orange">
                  <span>⚠️ OBSERVAÇÕES</span>
                </div>
                <p className="obs-text">
                  Sensibilidade ao frio nos dentes anteriores. Dente 42 com cárie proximal — aguardando restauração....
                </p>
              </div>
            </div>

            {/* Tabela de Últimos Atendimentos */}
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="section-title">Últimos Atendimentos</h3>
              <div className="history-list">
                <div className="history-item">
                  <div className="history-left">
                    <span className="dot-status green"></span>
                    <div>
                      <strong>Profilaxia</strong>
                      <p className="subtext">Dr. Lucas de Oliveira</p>
                    </div>
                  </div>
                  <div className="history-right">
                    <span>15/08/2025</span>
                    <span className="badge-ativo">Concluído</span>
                  </div>
                </div>

                <div className="history-item">
                  <div className="history-left">
                    <span className="dot-status green"></span>
                    <div>
                      <strong>Restauração — dente 14</strong>
                      <p className="subtext">Dr. Lucas de Oliveira</p>
                    </div>
                  </div>
                  <div className="history-right">
                    <span>20/06/2025</span>
                    <span className="badge-ativo">Concluído</span>
                  </div>
                </div>

                <div className="history-item">
                  <div className="history-left">
                    <span className="dot-status green"></span>
                    <div>
                      <strong>Avaliação odontológica</strong>
                      <p className="subtext">Dr. Lucas de Oliveira</p>
                    </div>
                  </div>
                  <div className="history-right">
                    <span>10/04/2025</span>
                    <span className="badge-ativo">Concluído</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Visão Inicial da Lista de Prontuários
  return (
    <div className="page-container">
      <div className="breadcrumb-info">
        <span>OdontoGestão / </span>
        <strong>Prontuários</strong>
      </div>

      <div className="alert-info">
        <span className="alert-icon">ⓘ</span>
        <span>
          Os prontuários são organizados por paciente. Clique em <strong>Ver Prontuário</strong> para acessar o histórico odontológico completo de um paciente.
        </span>
      </div>

      <div className="section-subtitle">1 PACIENTE ENCONTRADO</div>

      <div className="card-table">
        <table className="table">
          <thead>
            <tr>
              <th>PACIENTE</th>
              <th>CPF</th>
              <th>TELEFONE</th>
              <th>ÚLTIMA CONSULTA</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="avatar-cell">
                <div className="avatar" style={{ backgroundColor: pacienteExemplo.cor }}>
                  {pacienteExemplo.inicial}
                </div>
                <div>
                  <strong className="patient-name">{pacienteExemplo.nome}</strong>
                  <div className="patient-email">{pacienteExemplo.email}</div>
                </div>
              </td>
              <td className="table-text-muted">{pacienteExemplo.cpf}</td>
              <td className="table-text-muted">{pacienteExemplo.telefone}</td>
              <td className="table-text-muted">{pacienteExemplo.ultimoAtendimento}</td>
              <td><span className="badge-ativo">Ativo</span></td>
              <td>
                <button
                  className="btn-action-primary"
                  onClick={() => setPacienteSelecionado(pacienteExemplo)}
                >
                  Ver Prontuário
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}