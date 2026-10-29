import { useEffect, useState } from 'react';

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

  useEffect(() => {
    function fecharComEscape(evento) {
      if (evento.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', fecharComEscape);
    return () => window.removeEventListener('keydown', fecharComEscape);
  }, [onClose]);

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

  function fecharAoClicarNoFundo(evento) {
    if (evento.target === evento.currentTarget) onClose();
  }

  return (
    <div
      className="nova-consulta-overlay"
      onMouseDown={fecharAoClicarNoFundo}
    >
      <section
        className="nova-consulta-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-consulta-titulo"
      >
        <header className="nova-consulta-cabecalho">
          <div>
            <h2 id="nova-consulta-titulo">Nova Consulta</h2>
            <p>Preencha os dados para agendar</p>
          </div>
          <button
            className="nova-consulta-fechar"
            type="button"
            onClick={onClose}
            aria-label="Fechar cadastro de consulta"
          >
            ×
          </button>
        </header>

        <form className="nova-consulta-formulario" onSubmit={enviarFormulario} noValidate>
          <div className="nova-consulta-campos">
            {Object.keys(erros).some((campo) => erros[campo]) && (
              <p className="nova-consulta-erro-geral" role="alert">
                Confira os campos obrigatórios antes de agendar.
              </p>
            )}

            <label className="nova-consulta-campo" htmlFor="consulta-paciente">
              <span>Paciente <i>*</i></span>
              <input
                id="consulta-paciente"
                name="paciente"
                type="text"
                placeholder="Nome do paciente..."
                list="nova-consulta-pacientes"
                value={formulario.paciente}
                onChange={atualizarCampo}
                aria-required="true"
                aria-invalid={Boolean(erros.paciente)}
                aria-describedby={erros.paciente ? 'erro-paciente' : undefined}
              />
              <datalist id="nova-consulta-pacientes">
                {pacientesCadastrados.map((paciente) => (
                  <option key={paciente} value={paciente} />
                ))}
              </datalist>
              {erros.paciente && <small id="erro-paciente">{erros.paciente}</small>}
            </label>

            <label className="nova-consulta-campo" htmlFor="consulta-profissional">
              <span>Dentista Responsável <i>*</i></span>
              <select
                id="consulta-profissional"
                name="profissional"
                value={formulario.profissional}
                onChange={atualizarCampo}
                aria-required="true"
                aria-invalid={Boolean(erros.profissional)}
                aria-describedby={erros.profissional ? 'erro-profissional' : undefined}
              >
                <option value="">Selecionar dentista...</option>
                {dentistas.map((dentista) => (
                  <option key={dentista} value={dentista}>{dentista}</option>
                ))}
              </select>
              {erros.profissional && <small id="erro-profissional">{erros.profissional}</small>}
            </label>

            <div className="nova-consulta-linha">
              <label className="nova-consulta-campo" htmlFor="consulta-data">
                <span>Data <i>*</i></span>
                <input
                  id="consulta-data"
                  name="data"
                  type="date"
                  value={formulario.data}
                  onChange={atualizarCampo}
                  aria-required="true"
                  aria-invalid={Boolean(erros.data)}
                  aria-describedby={erros.data ? 'erro-data' : undefined}
                />
                {erros.data && <small id="erro-data">{erros.data}</small>}
              </label>

              <label className="nova-consulta-campo" htmlFor="consulta-horario">
                <span>Horário <i>*</i></span>
                <input
                  id="consulta-horario"
                  name="horario"
                  type="time"
                  value={formulario.horario}
                  onChange={atualizarCampo}
                  aria-required="true"
                  aria-invalid={Boolean(erros.horario)}
                  aria-describedby={erros.horario ? 'erro-horario' : undefined}
                />
                {erros.horario && <small id="erro-horario">{erros.horario}</small>}
              </label>
            </div>

            <label className="nova-consulta-campo" htmlFor="consulta-procedimento">
              <span>Procedimento <i>*</i></span>
              <select
                id="consulta-procedimento"
                name="procedimento"
                value={formulario.procedimento}
                onChange={atualizarCampo}
                aria-required="true"
                aria-invalid={Boolean(erros.procedimento)}
                aria-describedby={erros.procedimento ? 'erro-procedimento' : undefined}
              >
                <option value="">Selecionar procedimento...</option>
                {procedimentos.map((procedimento) => (
                  <option key={procedimento} value={procedimento}>{procedimento}</option>
                ))}
              </select>
              {erros.procedimento && <small id="erro-procedimento">{erros.procedimento}</small>}
            </label>

            <label className="nova-consulta-campo" htmlFor="consulta-status">
              <span>Status</span>
              <select
                id="consulta-status"
                name="status"
                value={formulario.status}
                onChange={atualizarCampo}
              >
                <option>Agendado</option>
                <option>Confirmado</option>
                <option>Aguardando</option>
                <option>Cancelado</option>
              </select>
            </label>

            <label className="nova-consulta-campo" htmlFor="consulta-observacoes">
              <span>Observações</span>
              <textarea
                id="consulta-observacoes"
                name="observacoes"
                placeholder="Observações sobre a consulta..."
                rows="3"
                value={formulario.observacoes}
                onChange={atualizarCampo}
              />
            </label>
          </div>

          <footer className="nova-consulta-rodape">
            <button
              className="nova-consulta-botao nova-consulta-botao-secundario"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="nova-consulta-botao nova-consulta-botao-principal"
              type="submit"
            >
              Agendar Consulta
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}