import { useState } from 'react';
import {
  Alert, Breadcrumb, Button, Card, Col, ListGroup, Row, Tab, Table, Tabs,
} from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';

const pacienteExemplo = {
  nome: 'Maria Clara Oliveira Santos',
  id: '0001',
  cpf: '345.678.901-23',
  nascimento: '15/03/1992 (33 anos)',
  telefone: '(11) 98765-4321',
  email: 'mariaclara@email.com',
  ultimoAtendimento: '15/08/2025',
  inicial: 'MC',
  cor: '#e11d48',
};

const abas = ['Resumo', 'Histórico', 'Procedimentos', 'Anotações'];

const ultimosAtendimentos = [
  { procedimento: 'Profilaxia', data: '15/08/2025' },
  { procedimento: 'Restauração — dente 14', data: '20/06/2025' },
  { procedimento: 'Avaliação odontológica', data: '10/04/2025' },
];

export default function Prontuario() {
  // Controla se exibe a lista ou o detalhe de um paciente
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('Resumo');

  if (pacienteSelecionado) {
    const voltar = (evento) => {
      evento?.preventDefault();
      setPacienteSelecionado(null);
    };

    const campos = [
      ['CPF', pacienteSelecionado.cpf],
      ['Nascimento', pacienteSelecionado.nascimento],
      ['Telefone', pacienteSelecionado.telefone],
      ['E-mail', pacienteSelecionado.email],
      ['Último atendimento', pacienteSelecionado.ultimoAtendimento],
    ];

    const resumo = (
      <>
        <Row className="g-3 mb-3">
          <Col md={6} xl={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="small fw-bold text-secondary text-uppercase mb-2">📅 Última consulta</div>
                <h3 className="fs-5 fw-bold">15/08/2025</h3>
                <div className="small text-secondary">09:00</div>
                <div className="small text-secondary mb-2">Dr. Lucas de Oliveira</div>
                <StatusBadge status="Concluído" />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="h-100 border-primary bg-primary-subtle">
              <Card.Body>
                <div className="small fw-bold text-primary text-uppercase mb-2">🕒 Próxima consulta</div>
                <h3 className="fs-5 fw-bold">25/09/2025</h3>
                <div className="small text-secondary">09:00</div>
                <div className="small text-secondary">Clareamento dental</div>
                <div className="small text-secondary">Dr. Lucas de Oliveira</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="small fw-bold text-secondary text-uppercase mb-2">☑️ Procedimentos</div>
                <div className="display-6 fw-bold">6</div>
                <div className="small text-secondary">Realizados</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="h-100 border-warning bg-warning-subtle">
              <Card.Body>
                <div className="small fw-bold text-warning-emphasis text-uppercase mb-2">⚠️ Observações</div>
                <p className="small mb-0">
                  Sensibilidade ao frio nos dentes anteriores. Dente 42 com cárie proximal — aguardando restauração....
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header className="bg-white fw-bold">Últimos Atendimentos</Card.Header>
          <ListGroup variant="flush">
            {ultimosAtendimentos.map((item) => (
              <ListGroup.Item
                key={item.procedimento}
                className="d-flex flex-wrap align-items-center justify-content-between gap-2"
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="d-inline-block rounded-circle bg-success ponto-status" />
                  <div>
                    <strong>{item.procedimento}</strong>
                    <div className="small text-secondary">Dr. Lucas de Oliveira</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-secondary">{item.data}</span>
                  <StatusBadge status="Concluído" />
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      </>
    );

    return (
      <AppLayout>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item active>OdontoGestão</Breadcrumb.Item>
            <Breadcrumb.Item href="#" linkProps={{ onClick: voltar }}>Prontuários</Breadcrumb.Item>
            <Breadcrumb.Item active>{pacienteSelecionado.nome}</Breadcrumb.Item>
          </Breadcrumb>
          <Button variant="outline-secondary" onClick={voltar}>← Voltar para lista</Button>
        </div>

        <Card className="mb-4">
          <Card.Body className="d-flex flex-wrap gap-4">
            <div className="avatar avatar-lg" style={{ backgroundColor: pacienteSelecionado.cor }}>
              {pacienteSelecionado.inicial}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <h2 className="fs-4 fw-bold mb-0">{pacienteSelecionado.nome}</h2>
                  <small className="text-secondary">Paciente #{pacienteSelecionado.id}</small>
                </div>
                <Button variant="outline-secondary">Editar paciente</Button>
              </div>

              <Row className="g-3">
                {campos.map(([rotulo, valor]) => (
                  <Col key={rotulo} xs={6} md={4} xl>
                    <div className="small fw-bold text-secondary text-uppercase">{rotulo}</div>
                    <div>{valor}</div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card.Body>
        </Card>

        <Tabs activeKey={abaAtiva} onSelect={(chave) => setAbaAtiva(chave)} className="mb-3">
          {abas.map((aba) => (
            <Tab key={aba} eventKey={aba} title={aba}>
              {aba === 'Resumo' && resumo}
            </Tab>
          ))}
        </Tabs>
      </AppLayout>
    );
  }

  // Visão inicial: lista de prontuários
  return (
    <AppLayout>
      <div className="small text-secondary mb-3">
        OdontoGestão / <strong className="text-body">Prontuários</strong>
      </div>

      <Alert variant="info">
        <span className="me-2" aria-hidden="true">ⓘ</span>
        Os prontuários são organizados por paciente. Clique em <strong>Ver Prontuário</strong> para
        acessar o histórico odontológico completo de um paciente.
      </Alert>

      <div className="small fw-bold text-secondary text-uppercase mb-2">1 paciente encontrado</div>

      <Card>
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
            <tr>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar" style={{ backgroundColor: pacienteExemplo.cor }}>
                    {pacienteExemplo.inicial}
                  </div>
                  <div>
                    <strong>{pacienteExemplo.nome}</strong>
                    <div className="small text-secondary">{pacienteExemplo.email}</div>
                  </div>
                </div>
              </td>
              <td className="text-secondary">{pacienteExemplo.cpf}</td>
              <td className="text-secondary">{pacienteExemplo.telefone}</td>
              <td className="text-secondary">{pacienteExemplo.ultimoAtendimento}</td>
              <td><StatusBadge status="Ativo" /></td>
              <td>
                <Button size="sm" onClick={() => setPacienteSelecionado(pacienteExemplo)}>
                  Ver Prontuário
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </AppLayout>
  );
}
