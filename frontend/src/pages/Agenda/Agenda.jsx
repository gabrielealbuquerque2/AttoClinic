
import { useState } from 'react';
import NovaConsulta from './NovaConsulta';
import Sidebar from '../../components/SideBar';

function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState('2025-08-28');
  const [visualizacao, setVisualizacao] = useState('Dia');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const [consultas, setConsultas] = useState([
    {
      id: 1,
      data: '2025-08-28',
      horario: '08:00',
      paciente: 'Ana Costa Lima',
      profissional: 'Dr. Lucas de Oliveira',
      procedimento: 'Limpeza',
      status: 'Confirmado',
    },
    {
      id: 2,
      data: '2025-08-28',
      horario: '09:00',
      paciente: 'Pedro Henrique Souza',
      profissional: 'Dr. Lucas de Oliveira',
      procedimento: 'Avaliação',
      status: 'Confirmado',
    },
    {
      id: 3,
      data: '2025-08-28',
      horario: '10:30',
      paciente: 'Maria Clara Oliveira',
      profissional: 'Dr. Lucas de Oliveira',
      procedimento: 'Restauração',
      status: 'Aguardando',
    },
    {
      id: 4,
      data: '2025-08-28',
      horario: '11:00',
      paciente: 'João Carlos Ferreira',
      profissional: 'Dr. Lucas de Oliveira',
      procedimento: 'Extração',
      status: 'Confirmado',
    },
    {
      id: 5,
      data: '2025-08-28',
      horario: '14:00',
      paciente: 'Beatriz Almeida',
      profissional: 'Dr. Lucas de Oliveira',
      procedimento: 'Consulta de rotina',
      status: 'Aguardando',
    },
    {
      id: 6,
      data: '2025-08-28',
      horario: '15:30',
      paciente: 'Rafael Martins',
      profissional: 'Dr. Lucas de Oliveira',
      procedimento: 'Retorno',
      status: 'Agendado',
    },
  ]);

  const consultasDoDia = consultas.filter(
    (consulta) => consulta.data === dataSelecionada
  );
  const consultasFiltradas = consultasDoDia.filter((consulta) => {
    const statusCorresponde =
      filtroStatus === 'Todos os status' ||
      consulta.status === filtroStatus;

    return statusCorresponde;
  });
  const horariosPadrao = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
  ];
  const horariosTimeline = [...new Set([
    ...horariosPadrao,
    ...consultasFiltradas.map((consulta) => `${consulta.horario.slice(0, 2)}:00`),
  ])].sort();

  const dataFormatada = new Date(
    `${dataSelecionada}T12:00:00`
  ).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function mudarData(dias) {
    const data = new Date(`${dataSelecionada}T12:00:00`);
    data.setDate(data.getDate() + dias);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    setDataSelecionada(`${ano}-${mes}-${dia}`);
  }

  function irParaHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    setDataSelecionada(`${ano}-${mes}-${dia}`);
  }

  function novaConsulta() {
    setMensagemSucesso('');
    setModalAberto(true);
  }

  function cadastrarConsulta(dados) {
    setConsultas((atuais) => [
      ...atuais,
      { ...dados, id: Date.now() },
    ]);
    setModalAberto(false);
    setMensagemSucesso('Consulta cadastrada temporariamente nesta sessão.');
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="agenda-page">
      <header className="agenda-header">
        <div>
          <h1>Agenda</h1>
          <p>{consultasDoDia.length} consultas nesta data</p>
        </div>

        <button className="agenda-button" onClick={novaConsulta} type="button">
          <span>+</span>  Nova Consulta
        </button>
      </header>

      {mensagemSucesso && (
        <p className="nova-consulta-sucesso" role="status">{mensagemSucesso}</p>
      )}

      <section className="agenda-toolbar">
        <div className="agenda-navegacao">
          <div className="agenda-visualizacoes">
            {['Dia', 'Semana', 'Mês'].map((opcao) => (
              <button
                key={opcao}
                className={
                  visualizacao === opcao ? 'agenda-visual-ativa' : ''
                }
                onClick={() => setVisualizacao(opcao)}
              >
                {opcao}
              </button>
            ))}
          </div>

          <button
            className="agenda-seta"
            onClick={() => mudarData(-1)}
            aria-label="Data anterior"
          >
            ‹
          </button>

          <strong className="agenda-data">{dataFormatada}</strong>

          <button
            className="agenda-seta"
            onClick={() => mudarData(1)}
            aria-label="Próxima data"
          >
            ›
          </button>

          <button className="agenda-hoje" onClick={irParaHoje}>
            Hoje
          </button>
        </div>

        <div className="agenda-filtros">
          <select
            aria-label="Filtrar por status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option>Todos os status</option>
            <option value="Confirmado">Confirmadas</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Agendado">Agendadas</option>
            <option value="Cancelado">Canceladas</option>
          </select>
        </div>
      </section>

      <section className="agenda-indicadores">
        <span className="agenda-indicador indicador-confirmadas">
          <strong>
            {consultasDoDia.filter((c) => c.status === 'Confirmado').length}
          </strong>
          Confirmadas
        </span>

        <span className="agenda-indicador indicador-aguardando">
          <strong>
            {consultasDoDia.filter((c) => c.status === 'Aguardando').length}
          </strong>
          Aguardando
        </span>

        <span className="agenda-indicador indicador-agendadas">
          <strong>
            {consultasDoDia.filter((c) => c.status === 'Agendado').length}
          </strong>
          Agendadas
        </span>

        <span className="agenda-indicador indicador-canceladas">
          <strong>
            {consultasDoDia.filter((c) => c.status === 'Cancelado').length}
          </strong>
          Canceladas
        </span>
      </section>

      <section className={`agenda-calendario agenda-modo-${visualizacao.toLowerCase()}`}>
        {visualizacao === 'Semana' && (
          <div className="agenda-aviso-visualizacao">
            Visualização semanal — selecione uma data pelas setas.
          </div>
        )}

        {visualizacao === 'Mês' && (
          <div className="agenda-aviso-visualizacao">
            Visualização mensal — as consultas da data selecionada são exibidas abaixo.
          </div>
        )}

        {consultasFiltradas.length === 0 ? (
          <p className="agenda-vazio">
            Nenhuma consulta encontrada para esses filtros.
          </p>
        ) : (
          <>
            {horariosTimeline.map(
              (horario) => {
                const consultasDoHorario = consultasFiltradas.filter(
                  (consulta) => consulta.horario.startsWith(horario.slice(0, 2) + ':')
                );

                return (
                  <div className="agenda-linha-tempo" key={horario}>
                    <span className="agenda-hora-eixo">{horario}</span>

                    <div className="agenda-eventos">
                      {consultasDoHorario.map((consulta) => (
                        <article
                          className={`agenda-consulta agenda-${consulta.status === 'Agendado' ? 'agendada' : consulta.status.toLowerCase()}`}
                          key={consulta.id}
                        >
                          <div className="agenda-horario">
                            {consulta.horario}
                          </div>

                          <div className="agenda-detalhes">
                            <h3>{consulta.paciente}</h3>
                            <p>{consulta.procedimento}</p>
                            <span>{consulta.profissional}</span>
                            {consulta.observacoes && <span>{consulta.observacoes}</span>}
                          </div>

                          <div className="agenda-acoes">
                            <span
                              className={`agenda-status status-${consulta.status.toLowerCase()}`}
                            >
                              {consulta.status}
                            </span>

                            <button
                              className="agenda-prontuario"
                              onClick={() =>
                                alert(`Prontuário de ${consulta.paciente}`)
                              }
                            >
                              Prontuário
                            </button>

                            <button
                              className="agenda-editar"
                              onClick={() =>
                                alert(`Editar consulta de ${consulta.paciente}`)
                              }
                            >
                              Editar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </>
        )}
      </section>

      {modalAberto && (
        <NovaConsulta
          dataInicial={dataSelecionada}
          onClose={() => setModalAberto(false)}
          onSave={cadastrarConsulta}
        />
      )}
      </main>
    </div>
  );
}

export default Agenda;
