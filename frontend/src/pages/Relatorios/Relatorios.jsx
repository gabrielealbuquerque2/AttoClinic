import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';

const relatorios = [
  { icone: '👥', fundo: '#e0e7ff', cor: '#3730a3', titulo: 'Relatório de Pacientes', descricao: 'Total de pacientes, novos cadastros e pacientes ativos' },
  { icone: '📅', fundo: '#d1fae5', cor: '#065f46', titulo: 'Relatório de Consultas', descricao: 'Consultas realizadas, agendadas e canceladas por período' },
  { icone: '💰', fundo: '#fef3c7', cor: '#92400e', titulo: 'Relatório Financeiro', descricao: 'Receitas, despesas, saldos e pagamentos pendentes' },
  { icone: '📦', fundo: '#ffedd5', cor: '#9a3412', titulo: 'Relatório de Estoque', descricao: 'Materiais disponíveis, baixas, esgotados e prazos de validade' },
];

export default function Relatorios() {
  return (
    <AppLayout>
      <div className="small text-secondary mb-3">
        OdontoGestão / <strong className="text-body">Relatórios</strong>
      </div>

      <PageHeader
        titulo="Relatórios Consolidados"
        subtitulo="Visualize e exporte informações consolidadas do consultório"
      />

      <Card className="mb-4">
        <Card.Body>
          <div className="small fw-bold text-secondary text-uppercase mb-3">Filtros de data</div>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group controlId="data-inicial">
                <Form.Label className="small fw-semibold">Data Inicial:</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="data-final">
                <Form.Label className="small fw-semibold">Data Final:</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} xl={4} className="g-3">
        {relatorios.map((relatorio) => (
          <Col key={relatorio.titulo}>
            <Card className="h-100 text-center">
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <div>
                  <div
                    className="indicador-icone mx-auto mb-3"
                    style={{ background: relatorio.fundo, color: relatorio.cor }}
                  >
                    {relatorio.icone}
                  </div>
                  <Card.Title as="h3" className="fs-6 fw-bold">{relatorio.titulo}</Card.Title>
                  <Card.Text className="small text-secondary">{relatorio.descricao}</Card.Text>
                </div>
                <Button>Gerar Relatório</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </AppLayout>
  );
}
