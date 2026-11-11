import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, InputGroup, Form } from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import IndicatorCard from '../../components/IndicatorCard';
import StatusBadge from '../../components/StatusBadge';

const consultasHoje = [
  { horario: '08:00', paciente: 'Ana Costa Lima', procedimento: 'Limpeza · Dr. Lucas de Oliveira', status: 'Confirmado' },
  { horario: '09:00', paciente: 'Pedro Souza', procedimento: 'Avaliação · Dr. Lucas de Oliveira', status: 'Confirmado' },
  { horario: '10:30', paciente: 'Maria Clara Oliveira', procedimento: 'Restauração · Dr. Lucas de Oliveira', status: 'Aguardando' },
  { horario: '11:00', paciente: 'João Ferreira', procedimento: 'Extração · Dr. Lucas de Oliveira', status: 'Confirmado' },
  { horario: '14:00', paciente: 'Fernanda Rocha', procedimento: 'Clareamento · Dr. Lucas de Oliveira', status: 'Aguardando' },
];

const metricas = [
  { icone: '👥', tom: 'primary', titulo: 'Total de Pacientes', valor: '1.248', detalhe: '+12 este mês' },
  { icone: '📅', tom: 'info', titulo: 'Consultas Hoje', valor: '8', detalhe: '2 confirmadas' },
  { icone: '💰', tom: 'warning', titulo: 'Receita do Mês', valor: 'R$ 18.750', detalhe: '+8,2% em relação ao anterior' },
  { icone: '📦', tom: 'danger', titulo: 'Alertas de Estoque', valor: '3', detalhe: 'Itens em falta' },
];

const acessoRapido = [
  { icone: '👤', rotulo: 'Novo Paciente', caminho: '/pacientes' },
  { icone: '📋', rotulo: 'Prontuários', caminho: '/prontuario' },
  { icone: '💳', rotulo: 'Financeiro', caminho: '/financeiro' },
  { icone: '📦', rotulo: 'Estoque', caminho: '/estoque' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-4 border-bottom">
        <div className="small text-secondary">
          OdontoGestão / <strong className="text-body">Painel de Controle</strong>
        </div>

        <div className="d-flex align-items-center gap-3">
          <InputGroup size="sm" className="busca-topo">
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control placeholder="Buscar paciente, consulta..." />
          </InputGroup>

          <div className="d-flex align-items-center gap-2">
            <span aria-hidden="true">🔔</span>
            <div className="avatar" style={{ backgroundColor: '#0284c7' }}>CM</div>
            <div className="lh-sm d-none d-sm-block">
              <strong className="d-block small">Dr. Lucas de Oliveira</strong>
              <small className="text-secondary">Dentista</small>
            </div>
          </div>
        </div>
      </div>

      <PageHeader titulo="Bom dia, Dr. Lucas!" subtitulo="Quinta-feira, 28 de agosto de 2025">
        <Button onClick={() => navigate('/agenda')}>📅 Ver Agenda Completa</Button>
      </PageHeader>

      <Row className="g-3 mb-4">
        {metricas.map((metrica) => (
          <Col key={metrica.titulo} xs={12} sm={6} xl={3}>
            <IndicatorCard {...metrica} />
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title as="h3" className="fs-6 fw-bold mb-0">Consultas de Hoje</Card.Title>
                <StatusBadge status="Agendado">5 agendadas</StatusBadge>
              </div>

              <ListGroup variant="flush">
                {consultasHoje.map((consulta) => (
                  <ListGroup.Item
                    key={consulta.horario}
                    className="d-flex align-items-center gap-3 px-0"
                  >
                    <strong className="horario-lista">{consulta.horario}</strong>
                    <div className="flex-grow-1">
                      <strong>{consulta.paciente}</strong>
                      <div className="small text-secondary">{consulta.procedimento}</div>
                    </div>
                    <StatusBadge status={consulta.status} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="d-flex flex-column gap-3">
          <Card>
            <Card.Body>
              <Card.Title as="h3" className="fs-6 fw-bold mb-3">Acesso Rápido</Card.Title>
              <ListGroup>
                {acessoRapido.map((item) => (
                  <ListGroup.Item
                    key={item.rotulo}
                    action
                    onClick={() => navigate(item.caminho)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      <span className="me-2" aria-hidden="true">{item.icone}</span>
                      <strong>{item.rotulo}</strong>
                    </span>
                    <span aria-hidden="true">›</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card bg="primary" text="white">
            <Card.Body>
              <Card.Title as="h4" className="fs-6 fw-bold">Lembrete do Sistema</Card.Title>
              <Card.Text className="small">
                3 pacientes têm consulta de retorno vencida. Verifique a agenda para reagendamento.
              </Card.Text>
              <Button variant="outline-light" size="sm">Ver detalhes</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
