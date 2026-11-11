import { useState } from 'react';
import {
  Alert, Button, ButtonGroup, Card, Form, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import NovaConsulta from './NovaConsulta';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge, { varianteDe } from '../../components/StatusBadge';

const horariosPadrao = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
];

const resumoStatus = [
  ['Confirmado', 'Confirmadas'],
  ['Aguardando', 'Aguardando'],
  ['Agendado', 'Agendadas'],
  ['Cancelado', 'Canceladas'],
];

function paraTextoData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState('2025-08-28');
  const [visualizacao, setVisualizacao] = useState('Dia');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const [consultas, setConsultas] = useState([
    { id: 1, data: '2025-08-28', horario: '08:00', paciente: 'Ana Costa Lima', profissional: 'Dr. Lucas de Oliveira', procedimento: 'Limpeza', status: 'Confirmado' },
    { id: 2, data: '2025-08-28', horario: '09:00', paciente: 'Pedro Henrique Souza', profissional: 'Dr. Lucas de Oliveira', procedimento: 'Avaliação', status: 'Confirmado' },
    { id: 3, data: '2025-08-28', horario: '10:30', paciente: 'Maria Clara Oliveira', profissional: 'Dr. Lucas de Oliveira', procedimento: 'Restauração', status: 'Aguardando' },
    { id: 4, data: '2025-08-28', horario: '11:00', paciente: 'João Carlos Ferreira', profissional: 'Dr. Lucas de Oliveira', procedimento: 'Extração', status: 'Confirmado' },
    { id: 5, data: '2025-08-28', horario: '14:00', paciente: 'Beatriz Almeida', profissional: 'Dr. Lucas de Oliveira', procedimento: 'Consulta de rotina', status: 'Aguardando' },
    { id: 6, data: '2025-08-28', horario: '15:30', paciente: 'Rafael Martins', profissional: 'Dr. Lucas de Oliveira', procedimento: 'Retorno', status: 'Agendado' },
  ]);

  const consultasDoDia = consultas.filter((consulta) => consulta.data === dataSelecionada);
  const consultasFiltradas = consultasDoDia.filter(
    (consulta) => filtroStatus === 'Todos os status' || consulta.status === filtroStatus
  );
  const horariosTimeline = [...new Set([
    ...horariosPadrao,
    ...consultasFiltradas.map((consulta) => `${consulta.horario.slice(0, 2)}:00`),
  ])].sort();

  const dataFormatada = new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function mudarData(dias) {
    const data = new Date(`${dataSelecionada}T12:00:00`);
    data.setDate(data.getDate() + dias);
    setDataSelecionada(paraTextoData(data));
  }

  function irParaHoje() {
    setDataSelecionada(paraTextoData(new Date()));
  }

  function novaConsulta() {
    setMensagemSucesso('');
    setModalAberto(true);
  }

  function cadastrarConsulta(dados) {
    setConsultas((atuais) => [...atuais, { ...dados, id: Date.now() }]);
    setModalAberto(false);
    setMensagemSucesso('Consulta cadastrada temporariamente nesta sessão.');
  }

  return (
    <AppLayout>
      <PageHeader titulo="Agenda" subtitulo={`${consultasDoDia.length} consultas nesta data`}>
        <Button onClick={novaConsulta}>+ Nova Consulta</Button>
      </PageHeader>

      {mensagemSucesso && (
        <Alert
          variant="success"
          role="status"
          className="py-2"
          dismissible
          onClose={() => setMensagemSucesso('')}
        >
          {mensagemSucesso}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <ToggleButtonGroup
              type="radio"
              name="visualizacao"
              value={visualizacao}
              onChange={setVisualizacao}
              size="sm"
            >
              {['Dia', 'Semana', 'Mês'].map((opcao) => (
                <ToggleButton
                  key={opcao}
                  id={`visualizacao-${opcao}`}
                  value={opcao}
                  variant="outline-primary"
                >
                  {opcao}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <ButtonGroup size="sm">
              <Button variant="outline-secondary" onClick={() => mudarData(-1)} aria-label="Data anterior">
                ‹
              </Button>
              <Button variant="outline-secondary" disabled className="agenda-data text-body">
                {dataFormatada}
              </Button>
              <Button variant="outline-secondary" onClick={() => mudarData(1)} aria-label="Próxima data">
                ›
              </Button>
            </ButtonGroup>

            <Button variant="outline-primary" size="sm" onClick={irParaHoje}>Hoje</Button>
          </div>

          <Form.Select
            size="sm"
            className="w-auto"
            aria-label="Filtrar por status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option>Todos os status</option>
            <option value="Confirmado">Confirmadas</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Agendado">Agendadas</option>
            <option value="Cancelado">Canceladas</option>
          </Form.Select>
        </Card.Body>
      </Card>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {resumoStatus.map(([status, rotulo]) => (
          <StatusBadge key={status} status={status} className="fs-6 fw-normal px-3 py-2">
            <strong>{consultasDoDia.filter((c) => c.status === status).length}</strong> {rotulo}
          </StatusBadge>
        ))}
      </div>

      <Card>
        <Card.Body>
          {visualizacao === 'Semana' && (
            <Alert variant="info" className="py-2">
              Visualização semanal — selecione uma data pelas setas.
            </Alert>
          )}

          {visualizacao === 'Mês' && (
            <Alert variant="info" className="py-2">
              Visualização mensal — as consultas da data selecionada são exibidas abaixo.
            </Alert>
          )}

          {consultasFiltradas.length === 0 ? (
            <p className="text-center text-secondary my-4">
              Nenhuma consulta encontrada para esses filtros.
            </p>
          ) : (
            horariosTimeline.map((horario) => {
              const consultasDoHorario = consultasFiltradas.filter((consulta) =>
                consulta.horario.startsWith(horario.slice(0, 2) + ':')
              );

              return (
                <div key={horario} className="d-flex gap-3 py-2 border-top">
                  <div className="agenda-hora text-secondary small">{horario}</div>

                  <div className="flex-grow-1 min-w-0">
                    {consultasDoHorario.map((consulta) => (
                      <Card
                        key={consulta.id}
                        className="agenda-consulta mb-2"
                        style={{ '--faixa': `var(--bs-${varianteDe(consulta.status)})` }}
                      >
                        <Card.Body className="d-flex flex-wrap align-items-center gap-3 py-2">
                          <strong className="horario-lista">{consulta.horario}</strong>

                          <div className="flex-grow-1">
                            <h3 className="fs-6 fw-bold mb-0">{consulta.paciente}</h3>
                            <div className="small">{consulta.procedimento}</div>
                            <div className="small text-secondary">{consulta.profissional}</div>
                            {consulta.observacoes && (
                              <div className="small text-secondary">{consulta.observacoes}</div>
                            )}
                          </div>

                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <StatusBadge status={consulta.status} />
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => alert(`Prontuário de ${consulta.paciente}`)}
                            >
                              Prontuário
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => alert(`Editar consulta de ${consulta.paciente}`)}
                            >
                              Editar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Card.Body>
      </Card>

      {modalAberto && (
        <NovaConsulta
          dataInicial={dataSelecionada}
          onClose={() => setModalAberto(false)}
          onSave={cadastrarConsulta}
        />
      )}
    </AppLayout>
  );
}

export default Agenda;
