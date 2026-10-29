import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import Sidebar from '../../components/SideBar';

const pacientesIniciais = [
  { id: 1, nome: 'Maria Clara Oliveira Santos', email: 'mariaclara@email.com', cpf: '345.678.901-23', telefone: '(11) 98765-4321', ultimaConsulta: '15/08/2025', status: 'Ativo', inicial: 'MC', cor: '#e11d48' },
  { id: 2, nome: 'Pedro Henrique Souza', email: 'pedrohs@email.com', cpf: '234.567.890-12', telefone: '(11) 97654-3210', ultimaConsulta: '10/08/2025', status: 'Ativo', inicial: 'PH', cor: '#0284c7' },
  { id: 3, nome: 'Ana Paula Costa Lima', email: 'anapaula@email.com', cpf: '456.789.012-34', telefone: '(11) 96543-2109', ultimaConsulta: '05/08/2025', status: 'Ativo', inicial: 'AP', cor: '#9333ea' },
  { id: 4, nome: 'João Carlos Ferreira', email: 'joaoferreira@email.com', cpf: '567.890.123-45', telefone: '(11) 95432-1098', ultimaConsulta: '28/07/2025', status: 'Inativo', inicial: 'JC', cor: '#d97706' },
  { id: 5, nome: 'Fernanda Rocha Alves', email: 'fernandarocha@email.com', cpf: '678.901.234-56', telefone: '(11) 94321-0987', ultimaConsulta: '20/07/2025', status: 'Ativo', inicial: 'FR', cor: '#059669' },
];

export default function Pacientes() {
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');

  const pacientesFiltrados = pacientesIniciais.filter(p => {
    const atendeFiltroStatus = filtroStatus === 'Todos' || p.status === filtroStatus;
    const atendeBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || 
                        p.cpf.includes(busca) || 
                        p.email.toLowerCase().includes(busca.toLowerCase());
    return atendeFiltroStatus && atendeBusca;
  });

  return (
    <div className="dashboard-layout">
    <Sidebar />

    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{pacientesIniciais.length} pacientes cadastrados</p>
        </div>
        <button className="btn-primary">+ Novo Paciente</button>
      </div>

      <div className="card">
        {/* Barra Superior de Busca e Filtros */}
        <div className="table-filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou e-mail..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {['Todos', 'Ativo', 'Inativo'].map(status => (
              <button 
                key={status}
                className={`btn-filter ${filtroStatus === status ? 'active' : ''}`}
                onClick={() => setFiltroStatus(status)}
              >
                {status === 'Todos' ? 'Todos' : status === 'Ativo' ? 'Ativo' : 'Inativo'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Pacientes */}
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
            {pacientesFiltrados.map((p) => (
              <tr key={p.id}>
                <td className="avatar-cell">
                  <div className="avatar" style={{ backgroundColor: p.cor }}>
                    {p.inicial}
                  </div>
                  <div>
                    <strong>{p.nome}</strong>
                    <div className="page-subtitle">{p.email}</div>
                  </div>
                </td>
                <td className="table-text-muted">{p.cpf}</td>
                <td className="table-text-muted">{p.telefone}</td>
                <td className="table-text-muted">{p.ultimaConsulta}</td>
                <td>
                  <span className={p.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-cell">
                    <button 
                      className="btn-action-outline"
                      onClick={() => navigate('/prontuario')}
                    >
                      Prontuário
                    </button>
                    <button className="btn-action-outline">
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}