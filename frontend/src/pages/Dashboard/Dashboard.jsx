import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, InputGroup, Form, Alert } from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import IndicatorCard from '../../components/IndicatorCard';
import StatusBadge from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';
import { formatarData, formatarHora, formatarMoeda } from '../../utils/formatar';

const acessoRapido = [
  { icone: '👤', rotulo: 'Novo Paciente', caminho: '/pacientes' },
  { icone: '📋', rotulo: 'Prontuários', caminho: '/prontuario' },
  { icone: '💳', rotulo: 'Financeiro', caminho: '/financeiro' },
  { icone: '📦', rotulo: 'Estoque', caminho: '/estoque' },
];

function dataPorExtenso() {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState(null);
  const [consultasHoje, setConsultasHoje] = useState([]);
  const [proximaConsulta, setProximaConsulta] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [termo, setTermo] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [r, c, p] = await Promise.all([
          api.get('/dashboard/resumo'),
          api.get('/dashboard/consultas-hoje'),
          api.get('/dashboard/proxima-consulta'),
        ]);
        setResumo(r.data);
        setConsultasHoje(c.data);
        setProximaConsulta(p.data);
      } catch (e) {
        setErro(mensagemDeErro(e, 'Erro ao carregar o painel.'));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // Busca com pequena espera (debounce) para não chamar o back a cada tecla
  useEffect(() => {
    if (!termo.trim()) {
      setResultadoBusca(null);
      return undefined;
    }
    let cancelado = false;
    const espera = setTimeout(async () => {
      try {
        const { data } = await api.get('/dashboard/buscar', { params: { termo } });
        if (!cancelado) setResultadoBusca(data);
      } catch {
        if (!cancelado) setResultadoBusca({ pacientes: [], consultas: [] });
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo]);

  const metricas = [
    { icone: '👥', tom: 'primary', titulo: 'Total de Pacientes', valor: resumo?.total_pacientes ?? '—', detalhe: 'Pacientes cadastrados' },
    { icone: '📅', tom: 'info', titulo: 'Consultas Hoje', valor: resumo?.consultas_hoje ?? '—', detalhe: 'Agendadas para hoje' },
    { icone: '💰', tom: 'warning', titulo: 'Receita do Mês', valor: resumo ? formatarMoeda(resumo.receita_mes) : '—', detalhe: 'Receitas pagas no mês' },
    { icone: '📦', tom: 'danger', titulo: 'Alertas de Estoque', valor: resumo?.alertas_estoque ?? '—', detalhe: 'Itens no mínimo ou abaixo' },
  ];

  return (
    <AppLayout>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-4 border-bottom">
        <div className="small text-secondary">
          OdontoGestão / <strong className="text-body">Painel de Controle</strong>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <InputGroup size="sm" className="busca-topo">
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                placeholder="Buscar paciente, consulta..."
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
              />
            </InputGroup>

            {resultadoBusca && (
              <Card className="position-absolute end-0 mt-1 shadow" style={{ zIndex: 10, width: 340 }}>
                <ListGroup variant="flush">
                  {resultadoBusca.pacientes.length === 0 && resultadoBusca.consultas.length === 0 && (
                    <ListGroup.Item className="small text-secondary">Nada encontrado.</ListGroup.Item>
                  )}
                  {resultadoBusca.pacientes.map((p) => (
                    <ListGroup.Item
                      key={`p-${p.id_paciente}`}
                      action
                      className="small"
                      onClick={() => navigate('/pacientes')}
                    >
                      👤 <strong>{p.nome}</strong>
                      <div className="text-secondary">{p.cpf}</div>
                    </ListGroup.Item>
                  ))}
                  {resultadoBusca.consultas.map((c) => (
                    <ListGroup.Item
                      key={`c-${c.id_consulta}`}
                      action
                      className="small"
                      onClick={() => navigate('/agenda')}
                    >
                      📅 <strong>{c.paciente}</strong>
                      <div className="text-secondary">
                        {formatarData(c.data)} às {formatarHora(c.horario)} · {c.procedimentos ?? 'Sem procedimento'}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="avatar" style={{ backgroundColor: '#0284c7' }}>CM</div>
            <div className="lh-sm d-none d-sm-block">
              <strong className="d-block small">Dr. Lucas de Oliveira</strong>
              <small className="text-secondary">Dentista</small>
            </div>
          </div>
        </div>
      </div>

      <PageHeader titulo={`${saudacao()}, Dr. Lucas!`} subtitulo={dataPorExtenso()}>
        <Button onClick={() => navigate('/agenda')}>📅 Ver Agenda Completa</Button>
      </PageHeader>

      {erro && <Alert variant="danger">{erro}</Alert>}

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
                <StatusBadge status="Agendado">{consultasHoje.length} no dia</StatusBadge>
              </div>

              {carregando && <div className="small text-secondary py-3">Carregando...</div>}
              {!carregando && consultasHoje.length === 0 && (
                <div className="small text-secondary py-3">Nenhuma consulta para hoje.</div>
              )}

              <ListGroup variant="flush">
                {consultasHoje.map((consulta) => (
                  <ListGroup.Item
                    key={consulta.id_consulta}
                    className="d-flex align-items-center gap-3 px-0"
                  >
                    <strong className="horario-lista">{formatarHora(consulta.horario)}</strong>
                    <div className="flex-grow-1">
                      <strong>{consulta.paciente}</strong>
                      <div className="small text-secondary">
                        {consulta.procedimentos ?? 'Sem procedimento'} · {consulta.profissional}
                      </div>
                    </div>
                    <StatusBadge status={consulta.status_consulta} />
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
              <Card.Title as="h4" className="fs-6 fw-bold">Próxima Consulta</Card.Title>
              {proximaConsulta ? (
                <Card.Text className="small">
                  Paciente: {proximaConsulta.paciente}
                  <br />
                  Data: {formatarData(proximaConsulta.data)}
                  <br />
                  Horário: {formatarHora(proximaConsulta.horario)}
                  {proximaConsulta.procedimentos && (
                    <>
                      <br />
                      Procedimento: {proximaConsulta.procedimentos}
                    </>
                  )}
                </Card.Text>
              ) : (
                <Card.Text className="small">Nenhuma consulta futura agendada.</Card.Text>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
