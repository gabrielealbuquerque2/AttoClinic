import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Alert, Breadcrumb, Button, Card, Col, Form, InputGroup, ListGroup, Row, Tab, Table, Tabs,
} from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';
import {
  formatarData, formatarHora, calcularIdade, iniciais, corDoAvatar,
} from '../../utils/formatar';

const abas = ['Resumo', 'Histórico', 'Procedimentos', 'Anotações'];

export default function Prontuario() {
  const location = useLocation();

  // Lista de pacientes
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregandoLista, setCarregandoLista] = useState(true);

  // Detalhe do paciente selecionado (null = mostra a lista)
  const [idSelecionado, setIdSelecionado] = useState(location.state?.idPaciente ?? null);
  const [detalhe, setDetalhe] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('Resumo');

  const [erro, setErro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erroObservacoes, setErroObservacoes] = useState('');
  const [sucessoObservacoes, setSucessoObservacoes] = useState('');
  const [salvandoObservacoes, setSalvandoObservacoes] = useState(false);

  // Lista (com busca por nome, CPF ou e-mail)
  useEffect(() => {
    let cancelado = false;
    const espera = setTimeout(async () => {
      try {
        const { data } = await api.get('/prontuarios/pacientes', { params: { busca } });
        if (!cancelado) {
          setPacientes(data);
          setErro('');
        }
      } catch (e) {
        if (!cancelado) setErro(mensagemDeErro(e, 'Erro ao carregar pacientes.'));
      } finally {
        if (!cancelado) setCarregandoLista(false);
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [busca]);

  // Detalhe do paciente escolhido
  useEffect(() => {
    if (!idSelecionado) {
      setDetalhe(null);
      return;
    }
    let cancelado = false;
    setDetalhe(null);
    api
      .get(`/prontuarios/detalhe/${idSelecionado}`)
      .then(({ data }) => {
        if (!cancelado) {
          setDetalhe(data);
          setObservacoes(data.prontuario?.observacoes ?? '');
          setErro('');
        }
      })
      .catch((e) => {
        if (!cancelado) setErro(mensagemDeErro(e, 'Erro ao carregar o prontuário.'));
      });
    return () => {
      cancelado = true;
    };
  }, [idSelecionado]);

  async function salvarObservacoes(evento) {
    evento.preventDefault();
    setSalvandoObservacoes(true);
    setErroObservacoes('');
    setSucessoObservacoes('');

    try {
      const texto = observacoes.trim();
      if (detalhe.prontuario) {
        await api.put(`/prontuarios/put/${detalhe.prontuario.id_prontuario}`, {
          observacoes: texto || null,
        });
      } else {
        const hoje = new Date();
        const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        await api.post('/prontuarios/post', {
          id_paciente: detalhe.paciente.id_paciente,
          data,
          historico: '',
          observacoes: texto || null,
        });
      }

      const { data } = await api.get(`/prontuarios/detalhe/${idSelecionado}`);
      setDetalhe(data);
      setObservacoes(data.prontuario?.observacoes ?? '');
      setSucessoObservacoes('Anotações salvas com sucesso.');
    } catch (e) {
      setErroObservacoes(mensagemDeErro(e, 'Erro ao salvar as anotações.'));
    } finally {
      setSalvandoObservacoes(false);
    }
  }

  function voltar(evento) {
    evento?.preventDefault();
    setIdSelecionado(null);
    setAbaAtiva('Resumo');
    setErro('');
  }

  // ---------- Detalhe ----------
  if (idSelecionado) {
    if (!detalhe) {
      return (
        <AppLayout>
          <Button variant="outline-secondary" className="mb-3" onClick={voltar}>← Voltar para lista</Button>
          {erro ? <Alert variant="danger">{erro}</Alert> : <div className="text-secondary">Carregando prontuário...</div>}
        </AppLayout>
      );
    }

    const { paciente, prontuario, ultima_consulta: ultima, proxima_consulta: proxima, atendimentos } = detalhe;
    const idade = calcularIdade(paciente.data_nascimento);

    const campos = [
      ['CPF', paciente.cpf],
      ['Nascimento', paciente.data_nascimento
        ? `${formatarData(paciente.data_nascimento)}${idade !== null ? ` (${idade} anos)` : ''}`
        : '—'],
      ['Telefone', paciente.telefone ?? '—'],
      ['E-mail', paciente.email ?? '—'],
      ['Último atendimento', formatarData(ultima?.data)],
    ];

    const resumo = (
      <>
        <Row className="g-3 mb-3">
          <Col md={6} xl={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="small fw-bold text-secondary text-uppercase mb-2">📅 Última consulta</div>
                {ultima ? (
                  <>
                    <h3 className="fs-5 fw-bold">{formatarData(ultima.data)}</h3>
                    <div className="small text-secondary">{formatarHora(ultima.horario)}</div>
                    <div className="small text-secondary mb-2">{ultima.profissional}</div>
                    <StatusBadge status="Concluído" />
                  </>
                ) : (
                  <div className="small text-secondary">Nenhuma consulta realizada.</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="h-100 border-primary bg-primary-subtle">
              <Card.Body>
                <div className="small fw-bold text-primary text-uppercase mb-2">🕒 Próxima consulta</div>
                {proxima ? (
                  <>
                    <h3 className="fs-5 fw-bold">{formatarData(proxima.data)}</h3>
                    <div className="small text-secondary">{formatarHora(proxima.horario)}</div>
                    <div className="small text-secondary">{proxima.procedimentos ?? 'Sem procedimento'}</div>
                    <div className="small text-secondary">{proxima.profissional}</div>
                  </>
                ) : (
                  <div className="small text-secondary">Nenhuma consulta agendada.</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="small fw-bold text-secondary text-uppercase mb-2">☑️ Procedimentos</div>
                <div className="display-6 fw-bold">{detalhe.total_procedimentos}</div>
                <div className="small text-secondary">Realizados</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="h-100 border-warning bg-warning-subtle">
              <Card.Body>
                <div className="small fw-bold text-warning-emphasis text-uppercase mb-2">⚠️ Observações</div>
                <p className="small mb-0">{prontuario?.observacoes || 'Sem observações registradas.'}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header className="bg-white fw-bold">Últimos Atendimentos</Card.Header>
          <ListaAtendimentos itens={atendimentos.slice(0, 3)} />
        </Card>
      </>
    );

    const conteudo = {
      Resumo: resumo,
      Histórico: (
       <Card>
        <Card.Header className="bg-white fw-bold">
          Histórico de atendimentos
        </Card.Header>
        <ListaAtendimentos itens={atendimentos} />
      </Card>
      ),
      Procedimentos: (
        <Card>
          <ListaAtendimentos itens={atendimentos} />
        </Card>
      ),
      Anotações: (
        <Card>
          <Card.Body>
            <Form onSubmit={salvarObservacoes}>
              <Form.Group controlId="prontuario-observacoes">
                <Form.Label className="fw-semibold">Observações do paciente</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={observacoes}
                  onChange={(e) => {
                    setObservacoes(e.target.value);
                    setErroObservacoes('');
                    setSucessoObservacoes('');
                  }}
                  placeholder="Registre observações importantes sobre o paciente..."
                />
              </Form.Group>
              {erroObservacoes && <Alert variant="danger" className="mt-3 mb-0">{erroObservacoes}</Alert>}
              {sucessoObservacoes && <Alert variant="success" className="mt-3 mb-0">{sucessoObservacoes}</Alert>}
              <div className="d-flex justify-content-end mt-3">
                <Button type="submit" disabled={salvandoObservacoes}>
                  {salvandoObservacoes ? 'Salvando...' : 'Salvar anotações'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ),
    };

    return (
      <AppLayout>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item active>OdontoGestão</Breadcrumb.Item>
            <Breadcrumb.Item href="#" linkProps={{ onClick: voltar }}>Prontuários</Breadcrumb.Item>
            <Breadcrumb.Item active>{paciente.nome}</Breadcrumb.Item>
          </Breadcrumb>
          <Button variant="outline-secondary" onClick={voltar}>← Voltar para lista</Button>
        </div>

        <Card className="mb-4">
          <Card.Body className="d-flex flex-wrap gap-4">
            <div className="avatar avatar-lg" style={{ backgroundColor: corDoAvatar(paciente.id_paciente) }}>
              {iniciais(paciente.nome)}
            </div>

            <div className="flex-grow-1">
              <div className="mb-3">
                <h2 className="fs-4 fw-bold mb-0">{paciente.nome}</h2>
                <small className="text-secondary">
                  Paciente #{String(paciente.id_paciente).padStart(4, '0')}
                </small>
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
              {conteudo[aba]}
            </Tab>
          ))}
        </Tabs>
      </AppLayout>
    );
  }

  // ---------- Lista de prontuários ----------
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

      {erro && <Alert variant="danger">{erro}</Alert>}

      <InputGroup className="mb-3" style={{ maxWidth: 480 }}>
        <InputGroup.Text>🔍</InputGroup.Text>
        <Form.Control
          placeholder="Buscar por nome, CPF ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </InputGroup>

      <div className="small fw-bold text-secondary text-uppercase mb-2">
        {pacientes.length} {pacientes.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}
      </div>

      <Card>
        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Última consulta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregandoLista && (
              <tr><td colSpan={5} className="text-center text-secondary py-4">Carregando...</td></tr>
            )}
            {!carregandoLista && pacientes.length === 0 && (
              <tr><td colSpan={5} className="text-center text-secondary py-4">Nenhum paciente encontrado.</td></tr>
            )}
            {pacientes.map((p) => (
              <tr key={p.id_paciente}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar" style={{ backgroundColor: corDoAvatar(p.id_paciente) }}>
                      {iniciais(p.nome)}
                    </div>
                    <div>
                      <strong>{p.nome}</strong>
                      <div className="small text-secondary">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="text-secondary">{p.cpf}</td>
                <td className="text-secondary">{p.telefone}</td>
                <td className="text-secondary">{formatarData(p.ultima_consulta)}</td>
                <td>
                  <Button size="sm" onClick={() => setIdSelecionado(p.id_paciente)}>
                    Ver Prontuário
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </AppLayout>
  );
}

function ListaAtendimentos({ itens }) {
  if (itens.length === 0) {
    return <Card.Body className="small text-secondary">Nenhum atendimento realizado.</Card.Body>;
  }

  return (
    <ListGroup variant="flush">
      {itens.map((item) => (
        <ListGroup.Item
          key={item.id_consulta}
          className="d-flex flex-wrap align-items-center justify-content-between gap-2"
        >
          <div className="d-flex align-items-center gap-3">
            <span className="d-inline-block rounded-circle bg-success ponto-status" />
            <div>
              <strong>{item.procedimentos ?? 'Consulta sem procedimento'}</strong>
              <div className="small text-secondary">{item.profissional}</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="small text-secondary">{formatarData(item.data)}</span>
            <StatusBadge status="Concluído" />
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
