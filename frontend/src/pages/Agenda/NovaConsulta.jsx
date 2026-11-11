import { useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Campo from '../../components/Campo';

const pacientesCadastrados = [
  'Maria Clara Oliveira Santos',
  'Pedro Henrique Souza',
  'Ana Paula Costa Lima',
  'João Carlos Ferreira',
  'Fernanda Rocha Alves',
];

const dentistas = ['Dr. Lucas de Oliveira'];
const procedimentos = [
  'Limpeza',
  'Avaliação',
  'Restauração',
  'Extração',
  'Consulta de rotina',
  'Retorno',
  'Clareamento',
];

const valoresIniciais = {
  paciente: '',
  profissional: '',
  data: '',
  horario: '',
  procedimento: '',
  status: 'Agendado',
  observacoes: '',
};

const camposObrigatorios = {
  paciente: 'Informe o nome do paciente.',
  profissional: 'Selecione o dentista responsável.',
  data: 'Informe a data da consulta.',
  horario: 'Informe o horário da consulta.',
  procedimento: 'Selecione o procedimento.',
};

export default function NovaConsulta({ dataInicial, onClose, onSave }) {
  const [formulario, setFormulario] = useState({
    ...valoresIniciais,
    data: dataInicial,
  });
  const [erros, setErros] = useState({});

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: '' }));
  }

  function enviarFormulario(evento) {
    evento.preventDefault();

    const novosErros = Object.fromEntries(
      Object.entries(camposObrigatorios)
        .filter(([campo]) => !formulario[campo].trim())
        .map(([campo, mensagem]) => [campo, mensagem])
    );

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    onSave(formulario);
  }

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={enviarFormulario} noValidate>
        <Modal.Header closeButton>
          <div>
            <Modal.Title as="h2" className="fs-5 fw-bold">Nova Consulta</Modal.Title>
            <small className="text-secondary">Preencha os dados para agendar</small>
          </div>
        </Modal.Header>

        <Modal.Body>
          {Object.values(erros).some(Boolean) && (
            <Alert variant="danger" className="py-2">
              Confira os campos obrigatórios antes de agendar.
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
            {pacientesCadastrados.map((paciente) => (
              <option key={paciente} value={paciente} />
            ))}
          </datalist>

          <Campo
            id="consulta-profissional"
            name="profissional"
            label="Dentista Responsável"
            obrigatorio
            tipo="select"
            value={formulario.profissional}
            onChange={atualizarCampo}
            erro={erros.profissional}
          >
            <option value="">Selecionar dentista...</option>
            {dentistas.map((dentista) => (
              <option key={dentista} value={dentista}>{dentista}</option>
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
            name="procedimento"
            label="Procedimento"
            obrigatorio
            tipo="select"
            value={formulario.procedimento}
            onChange={atualizarCampo}
            erro={erros.procedimento}
          >
            <option value="">Selecionar procedimento...</option>
            {procedimentos.map((procedimento) => (
              <option key={procedimento} value={procedimento}>{procedimento}</option>
            ))}
          </Campo>

          <Campo
            id="consulta-status"
            name="status"
            label="Status"
            tipo="select"
            value={formulario.status}
            onChange={atualizarCampo}
          >
            <option>Agendado</option>
            <option>Confirmado</option>
            <option>Aguardando</option>
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
          <Button variant="outline-secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Agendar Consulta</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
