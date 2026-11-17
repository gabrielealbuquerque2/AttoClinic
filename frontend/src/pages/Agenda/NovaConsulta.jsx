import { useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Campo from '../../components/Campo';
import { mensagemDeErro } from '../../services/api';

const valoresIniciais = {
  paciente: '',
  id_profissional: '',
  data: '',
  horario: '',
  id_procedimento: '',
  status_consulta: 'Agendado',
  observacoes: '',
};

const camposObrigatorios = {
  paciente: 'Selecione um paciente cadastrado.',
  id_profissional: 'Selecione o dentista responsável.',
  data: 'Informe a data da consulta.',
  horario: 'Informe o horário da consulta.',
  id_procedimento: 'Selecione o procedimento.',
};

export default function NovaConsulta({
  dataInicial,
  consulta,
  pacientes = [],
  profissionais = [],
  procedimentos = [],
  onClose,
  onSave,
}) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciais,
    paciente: consulta?.nome_paciente || '',
    id_profissional: consulta?.id_profissional?.toString() || '',
    data: consulta?.data?.slice(0, 10) || dataInicial,
    horario: consulta?.horario?.slice(0, 5) || '',
    id_procedimento: consulta?.id_procedimento?.toString() || '',
    status_consulta: consulta?.status_consulta || valoresIniciais.status_consulta,
    observacoes: consulta?.observacoes || '',
  });
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [salvando, setSalvando] = useState(false);
  const emEdicao = Boolean(consulta);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: '' }));
    setErroEnvio('');
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    const pacienteSelecionado = pacientes.find(
      (paciente) => paciente.nome === formulario.paciente
    );
    const novosErros = Object.fromEntries(
      Object.entries(camposObrigatorios)
        .filter(([campo]) =>
          campo === 'paciente'
            ? !pacienteSelecionado
            : !formulario[campo].trim()
        )
        .map(([campo, mensagem]) => [campo, mensagem])
    );

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    setErroEnvio('');
    try {
      await onSave({
        id_paciente: pacienteSelecionado.id_paciente,
        id_profissional: formulario.id_profissional,
        id_procedimento: formulario.id_procedimento,
        data: formulario.data,
        horario: formulario.horario,
        status_consulta: formulario.status_consulta,
        observacoes: formulario.observacoes,
      });
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={enviarFormulario} noValidate>
        <Modal.Header closeButton>
          <div>
            <Modal.Title as="h2" className="fs-5 fw-bold">
              {emEdicao ? 'Editar Consulta' : 'Nova Consulta'}
            </Modal.Title>
            <small className="text-secondary">
              {emEdicao ? 'Atualize os dados da consulta' : 'Preencha os dados para agendar'}
            </small>
          </div>
        </Modal.Header>

        <Modal.Body>
          {erroEnvio && (
            <Alert variant="danger" className="py-2">{erroEnvio}</Alert>
          )}
          {Object.values(erros).some(Boolean) && (
            <Alert variant="danger" className="py-2">
              Confira os campos obrigatórios antes de {emEdicao ? 'salvar' : 'agendar'}.
            </Alert>
          )}

          <Campo
            id="consulta-paciente"
            name="paciente"
            label="Paciente"
            obrigatorio
            placeholder="Nome do paciente..."
            list="nova-consulta-pacientes"
            value={formulario.paciente}
            onChange={atualizarCampo}
            erro={erros.paciente}
          />
          <datalist id="nova-consulta-pacientes">
            {pacientes.map((paciente) => (
              <option key={paciente.id_paciente} value={paciente.nome} />
            ))}
          </datalist>

          <Campo
            id="consulta-profissional"
            name="id_profissional"
            label="Dentista Responsável"
            obrigatorio
            tipo="select"
            value={formulario.id_profissional}
            onChange={atualizarCampo}
            erro={erros.id_profissional}
          >
            <option value="">Selecionar dentista...</option>
            {profissionais.map((profissional) => (
              <option
                key={profissional.id_profissional}
                value={profissional.id_profissional}
              >
                {profissional.nome}
              </option>
            ))}
          </Campo>

          <Row>
            <Col sm={6}>
              <Campo
                id="consulta-data"
                name="data"
                label="Data"
                obrigatorio
                type="date"
                value={formulario.data}
                onChange={atualizarCampo}
                erro={erros.data}
              />
            </Col>
            <Col sm={6}>
              <Campo
                id="consulta-horario"
                name="horario"
                label="Horário"
                obrigatorio
                type="time"
                value={formulario.horario}
                onChange={atualizarCampo}
                erro={erros.horario}
              />
            </Col>
          </Row>

          <Campo
            id="consulta-procedimento"
            name="id_procedimento"
            label="Procedimento"
            obrigatorio
            tipo="select"
            value={formulario.id_procedimento}
            onChange={atualizarCampo}
            erro={erros.id_procedimento}
          >
            <option value="">Selecionar procedimento...</option>
            {procedimentos.map((procedimento) => (
              <option
                key={procedimento.id_procedimento}
                value={procedimento.id_procedimento}
              >
                {procedimento.nome_procedimento}
              </option>
            ))}
          </Campo>

          <Campo
            id="consulta-status"
            name="status_consulta"
            label="Status"
            tipo="select"
            value={formulario.status_consulta}
            onChange={atualizarCampo}
          >
            <option>Agendado</option>
            <option>Confirmado</option>
            <option>Aguardando</option>
            <option>Realizada</option>
            <option>Cancelada</option>
            <option>Cancelado</option>
          </Campo>

          <Campo
            id="consulta-observacoes"
            name="observacoes"
            label="Observações"
            tipo="textarea"
            rows={3}
            placeholder="Observações sobre a consulta..."
            value={formulario.observacoes}
            onChange={atualizarCampo}
            className="mb-0"
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : emEdicao ? 'Salvar Alterações' : 'Agendar Consulta'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
