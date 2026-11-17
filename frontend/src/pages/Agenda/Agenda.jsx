import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Card, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import NovaConsulta from './NovaConsulta';
import AppLayout from '../../components/AppLayout';
import Campo from '../../components/Campo';
import PageHeader from '../../components/PageHeader';
import StatusBadge, { varianteDe } from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';
import { dataParaISO, formatarData, formatarHora, hojeISO } from '../../utils/formatar';

const horariosPadrao = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
];

const resumoStatus = [
  ['Confirmado', 'Confirmadas'],
  ['Aguardando', 'Aguardando'],
  ['Agendado', 'Agendadas'],
  ['Realizada', 'Realizadas'],
  ['Cancelado', 'Canceladas'],
];

const normalizarStatus = (status) => {
  const valor = String(status).toLowerCase();
  return valor === 'cancelada' ? 'cancelado' : valor;
};
const mesmoStatus = (a, b) => normalizarStatus(a) === normalizarStatus(b);

function intervaloDaAgenda(data, visualizacao) {
  const selecionada = new Date(`${data}T12:00:00`);
  let inicio = selecionada;
  let fim = selecionada;

  if (visualizacao === 'Semana') {
    inicio = new Date(selecionada);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
  } else if (visualizacao === 'Mês') {
    inicio = new Date(selecionada.getFullYear(), selecionada.getMonth(), 1, 12);
    fim = new Date(selecionada.getFullYear(), selecionada.getMonth() + 1, 0, 12);
  }

  return {
    dataInicio: dataParaISO(inicio),
    dataFim: dataParaISO(fim),
  };
}

function Agenda() {
  const navigate = useNavigate();
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [visualizacao, setVisualizacao] = useState('Dia');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const ultimaRequisicao = useRef(0);

  const carregar = useCallback(async () => {
    // se a data mudar rápido, ignora respostas antigas
    const numero = ++ultimaRequisicao.current;
    try {
      const params = visualizacao === 'Dia'
        ? { data: dataSelecionada }
        : intervaloDaAgenda(dataSelecionada, visualizacao);
      const { data } = await api.get('/consultas/agenda', { params });
      if (numero !== ultimaRequisicao.current) return;
      setConsultas(data);
      setErro('');
    } catch (e) {
      if (numero !== ultimaRequisicao.current) return;
      setErro(mensagemDeErro(e, 'Erro ao carregar a agenda.'));
    } finally {
      if (numero === ultimaRequisicao.current) setCarregando(false);
    }
  }, [dataSelecionada, visualizacao]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Listas usadas no formulário da consulta
  useEffect(() => {
    async function carregarCadastros() {
      try {
        const [listaPacientes, listaProfissionais, listaProcedimentos] = await Promise.all([
          api.get('/pacientes/buscar'),
          api.get('/profissionais/buscar'),
          api.get('/procedimentos/buscar'),
        ]);
        setPacientes(listaPacientes.data);
        setProfissionais(listaProfissionais.data);
        setProcedimentos(listaProcedimentos.data);
      } catch (e) {
        setErro(mensagemDeErro(e, 'Erro ao carregar pacientes, profissionais e procedimentos.'));
      }
    }
    carregarCadastros();
  }, []);

  const consultasFiltradas = consultas.filter(
    (consulta) =>
      filtroStatus === 'Todos os status' || mesmoStatus(consulta.status_consulta, filtroStatus)
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

  const periodo = intervaloDaAgenda(dataSelecionada, visualizacao);
  const rotuloPeriodo = visualizacao === 'Dia'
    ? dataFormatada
    : visualizacao === 'Semana'
      ? `${formatarData(periodo.dataInicio)} a ${formatarData(periodo.dataFim)}`
      : new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
  const consultasAgrupadas = Object.entries(
    consultasFiltradas.reduce((grupos, consulta) => {
      const data = String(consulta.data).slice(0, 10);
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(consulta);
      return grupos;
    }, {}),
  ).sort(([dataA], [dataB]) => dataA.localeCompare(dataB));

  function irParaHoje() {
    setDataSelecionada(hojeISO());
  }

  function novaConsulta() {
    setMensagemSucesso('');
    setConsultaEditando(null);
    setModalAberto(true);
  }

  function editarConsulta(consulta) {
    setMensagemSucesso('');
    const nomeProcedimento = String(consulta.procedimentos || '').split(',')[0].trim();
    const procedimento = procedimentos.find(
      (item) => item.nome_procedimento === nomeProcedimento
    );
    setConsultaEditando({
      ...consulta,
      id_procedimento: consulta.id_procedimento ?? procedimento?.id_procedimento,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setConsultaEditando(null);
  }

  // O modal captura o erro lançado aqui e mostra a mensagem dentro dele.
  async function salvarConsulta(dados) {
    if (consultaEditando) {
      await api.put(`/consultas/atualizar/${consultaEditando.id_consulta}`, dados);
      setMensagemSucesso('Consulta atualizada com sucesso.');
    } else {
      await api.post('/consultas/agendar', dados);
      setMensagemSucesso('Consulta agendada com sucesso.');
    }

    fecharModal();
    // se a consulta caiu em outro dia, vai para esse dia para ela não "sumir"
    if (dados.data !== dataSelecionada) {
      setDataSelecionada(dados.data);
    } else {
      await carregar();
    }
  }

  return (
    <AppLayout>
      <PageHeader
        titulo="Agenda"
        subtitulo={`${consultas.length} consulta${consultas.length === 1 ? '' : 's'} ${
          visualizacao === 'Dia' ? 'neste dia' : visualizacao === 'Semana' ? 'nesta semana' : 'neste mês'
        }`}
      >
        <Button onClick={novaConsulta}>+ Nova Consulta</Button>
      </PageHeader>

      {erro && <Alert variant="danger">{erro}</Alert>}

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

            <Campo
              id="agenda-data"
              label="Selecionar data"
              labelClassName="visually-hidden"
              type="date"
              size="sm"
              className="w-auto mb-0"
              value={dataSelecionada}
              onChange={(e) => {
                if (e.target.value) setDataSelecionada(e.target.value);
              }}
            />
            <span className="small text-secondary text-capitalize">{rotuloPeriodo}</span>

            <Button variant="outline-primary" size="sm" onClick={irParaHoje}>Hoje</Button>
          </div>

          <Campo
            id="agenda-filtro-status"
            label="Filtrar por status"
            labelClassName="visually-hidden"
            tipo="select"
            className="w-auto mb-0"
            size="sm"
            aria-label="Filtrar por status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option>Todos os status</option>
            <option value="Confirmado">Confirmadas</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Agendado">Agendadas</option>
            <option value="Realizada">Realizadas</option>
            <option value="Cancelado">Canceladas</option>
          </Campo>
        </Card.Body>
      </Card>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {resumoStatus.map(([status, rotulo]) => (
          <StatusBadge key={status} status={status} className="fs-6 fw-normal px-3 py-2">
            <strong>
              {consultas.filter((c) => mesmoStatus(c.status_consulta, status)).length}
            </strong>{' '}
            {rotulo}
          </StatusBadge>
        ))}
      </div>

      <Card>
        <Card.Body>
          {visualizacao === 'Semana' && (
            <Alert variant="info" className="py-2">
              Exibindo todas as consultas da semana indicada pela data selecionada.
            </Alert>
          )}

          {visualizacao === 'Mês' && (
            <Alert variant="info" className="py-2">
              Exibindo todas as consultas do mês indicado pela data selecionada.
            </Alert>
          )}

          {carregando ? (
            <p className="text-center text-secondary my-4">Carregando...</p>
          ) : consultasFiltradas.length === 0 ? (
            <p className="text-center text-secondary my-4">
              Nenhuma consulta encontrada para esses filtros.
            </p>
          ) : visualizacao === 'Dia' ? (
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
                        key={consulta.id_consulta}
                        className="agenda-consulta mb-2"
                        style={{ '--faixa': `var(--bs-${varianteDe(consulta.status_consulta)})` }}
                      >
                        <Card.Body className="d-flex flex-wrap align-items-center gap-3 py-2">
                          <strong className="horario-lista">{formatarHora(consulta.horario)}</strong>

                          <div className="flex-grow-1">
                            <h3 className="fs-6 fw-bold mb-0">{consulta.nome_paciente}</h3>
                            <div className="small">{consulta.procedimentos || '—'}</div>
                            <div className="small text-secondary">{consulta.nome_profissional}</div>
                            {consulta.observacoes && (
                              <div className="small text-secondary">{consulta.observacoes}</div>
                            )}
                          </div>

                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <StatusBadge status={consulta.status_consulta} />
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                navigate('/prontuario', { state: { idPaciente: consulta.id_paciente } })
                              }
                            >
                              Prontuário
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => editarConsulta(consulta)}
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
          ) : (
            <div className="d-flex flex-column gap-4">
              {consultasAgrupadas.map(([data, consultasDoDia]) => (
                <section key={data}>
                  <h3 className="fs-6 fw-bold text-capitalize mb-2">
                    {new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <div className="d-flex flex-column gap-2">
                    {consultasDoDia.map((consulta) => (
                      <Card
                        key={consulta.id_consulta}
                        className="agenda-consulta"
                        style={{ '--faixa': `var(--bs-${varianteDe(consulta.status_consulta)})` }}
                      >
                        <Card.Body className="d-flex flex-wrap align-items-center gap-3 py-2">
                          <strong className="horario-lista">{formatarHora(consulta.horario)}</strong>
                          <div className="flex-grow-1">
                            <h4 className="fs-6 fw-bold mb-0">{consulta.nome_paciente}</h4>
                            <div className="small">{consulta.procedimentos || '—'}</div>
                            <div className="small text-secondary">{consulta.nome_profissional}</div>
                            {consulta.observacoes && (
                              <div className="small text-secondary">{consulta.observacoes}</div>
                            )}
                          </div>
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <StatusBadge status={consulta.status_consulta} />
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                navigate('/prontuario', { state: { idPaciente: consulta.id_paciente } })
                              }
                            >
                              Prontuário
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => editarConsulta(consulta)}
                            >
                              Editar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {modalAberto && (
        <NovaConsulta
          dataInicial={dataSelecionada}
          consulta={consultaEditando}
          pacientes={pacientes}
          profissionais={profissionais}
          procedimentos={procedimentos}
          onClose={fecharModal}
          onSave={salvarConsulta}
        />
      )}
    </AppLayout>
  );
}

export default Agenda;