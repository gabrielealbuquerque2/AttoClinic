import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Card, Table, Button, Form, InputGroup, Modal, ToggleButton, ToggleButtonGroup, Row, Col,
} from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';
import { formatarData, iniciais, corDoAvatar } from '../../utils/formatar';

const formVazio = {
  nome: '', cpf: '', telefone: '', data_nascimento: '', email: '',
  rua: '', numero: '', bairro: '', cidade: '', CEP: '',
};

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Modal de cadastro/edição. editando = id do paciente (null = novo)
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVazio);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get('/pacientes/lista');
      setPacientes(data);
      setErro('');
    } catch (e) {
      setErro(mensagemDeErro(e, 'Erro ao carregar pacientes.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const termo = busca.toLowerCase();
  const pacientesFiltrados = pacientes.filter((p) => {
    const atendeFiltroStatus = filtroStatus === 'Todos' || p.status === filtroStatus;
    const atendeBusca =
      p.nome.toLowerCase().includes(termo) ||
      (p.cpf ?? '').includes(busca) ||
      (p.email ?? '').toLowerCase().includes(termo);
    return atendeFiltroStatus && atendeBusca;
  });

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setErroForm('');
    setModalAberto(true);
  }

  function abrirEdicao(paciente) {
    setEditando(paciente.id_paciente);
    setForm({
      ...formVazio,
      ...Object.fromEntries(
        Object.keys(formVazio).map((campo) => [campo, paciente[campo] ?? '']),
      ),
      data_nascimento: paciente.data_nascimento ? String(paciente.data_nascimento).slice(0, 10) : '',
    });
    setErroForm('');
    setModalAberto(true);
  }

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErroForm('');

    // Campos vazios viram null para não gravar "" em data/número
    const dados = Object.fromEntries(
      Object.entries(form).map(([campo, valor]) => [campo, valor === '' ? null : valor]),
    );

    try {
      if (editando) {
        await api.put(`/pacientes/put/${editando}`, dados);
      } else {
        await api.post('/pacientes/post', dados);
      }
      setModalAberto(false);
      await carregar();
    } catch (e) {
      setErroForm(mensagemDeErro(e, 'Erro ao salvar paciente.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader
        titulo="Pacientes"
        subtitulo={`${pacientes.length} pacientes cadastrados`}
      >
        <Button onClick={abrirNovo}>+ Novo Paciente</Button>
      </PageHeader>

      {erro && <Alert variant="danger">{erro}</Alert>}

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
            {carregando && (
              <tr><td colSpan={6} className="text-center text-secondary py-4">Carregando...</td></tr>
            )}
            {!carregando && pacientesFiltrados.length === 0 && (
              <tr><td colSpan={6} className="text-center text-secondary py-4">Nenhum paciente encontrado.</td></tr>
            )}
            {pacientesFiltrados.map((p) => (
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
                <td><StatusBadge status={p.status} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigate('/prontuario', { state: { idPaciente: p.id_paciente } })}
                    >
                      Prontuário
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => abrirEdicao(p)}>
                      Editar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={modalAberto} onHide={() => setModalAberto(false)} size="lg">
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">{editando ? 'Editar paciente' : 'Novo paciente'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}
            <Row className="g-3">
              <Col md={8}>
                <Form.Group controlId="p-nome">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control required value={form.nome} onChange={(e) => alterar('nome', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-cpf">
                  <Form.Label>CPF *</Form.Label>
                  <Form.Control required value={form.cpf} onChange={(e) => alterar('cpf', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-telefone">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control value={form.telefone} onChange={(e) => alterar('telefone', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-nascimento">
                  <Form.Label>Data de nascimento</Form.Label>
                  <Form.Control type="date" value={form.data_nascimento} onChange={(e) => alterar('data_nascimento', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-email">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={(e) => alterar('email', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group controlId="p-rua">
                  <Form.Label>Rua</Form.Label>
                  <Form.Control value={form.rua} onChange={(e) => alterar('rua', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-numero">
                  <Form.Label>Número</Form.Label>
                  <Form.Control value={form.numero} onChange={(e) => alterar('numero', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-bairro">
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control value={form.bairro} onChange={(e) => alterar('bairro', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-cidade">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control value={form.cidade} onChange={(e) => alterar('cidade', e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="p-cep">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control value={form.CEP} onChange={(e) => alterar('CEP', e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AppLayout>
  );
}
