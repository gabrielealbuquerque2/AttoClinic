import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Form, InputGroup, ToggleButton, ToggleButtonGroup, Row, Col,
} from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

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

  const pacientesFiltrados = pacientesIniciais.filter((p) => {
    const atendeFiltroStatus = filtroStatus === 'Todos' || p.status === filtroStatus;
    const atendeBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca) ||
      p.email.toLowerCase().includes(busca.toLowerCase());
    return atendeFiltroStatus && atendeBusca;
  });

  return (
    <AppLayout>
      <PageHeader
        titulo="Pacientes"
        subtitulo={`${pacientesIniciais.length} pacientes cadastrados`}
      >
        <Button>+ Novo Paciente</Button>
      </PageHeader>

      <Card>
        <Card.Body className="border-bottom">
          <Row className="g-2 align-items-center justify-content-between">
            <Col md={6} lg={5}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nome, CPF ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs="auto">
              <ToggleButtonGroup
                type="radio"
                name="filtro-status"
                value={filtroStatus}
                onChange={setFiltroStatus}
                size="sm"
              >
                {['Todos', 'Ativo', 'Inativo'].map((status) => (
                  <ToggleButton
                    key={status}
                    id={`filtro-${status}`}
                    value={status}
                    variant="outline-primary"
                  >
                    {status}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Col>
          </Row>
        </Card.Body>

        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Última consulta</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar" style={{ backgroundColor: p.cor }}>{p.inicial}</div>
                    <div>
                      <strong>{p.nome}</strong>
                      <div className="small text-secondary">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="text-secondary">{p.cpf}</td>
                <td className="text-secondary">{p.telefone}</td>
                <td className="text-secondary">{p.ultimaConsulta}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigate('/prontuario')}
                    >
                      Prontuário
                    </Button>
                    <Button variant="outline-secondary" size="sm">Editar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </AppLayout>
  );
}
