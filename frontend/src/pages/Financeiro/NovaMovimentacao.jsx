import { useEffect, useState } from 'react';

const pagamentos = ['Pix', 'Cartão', 'Dinheiro', 'Transferência'];
const procedimentos = [
  'Avaliação',
  'Clareamento',
  'Consulta de rotina',
  'Extração',
  'Limpeza',
  'Restauração',
  'Retorno',
];
const categoriasDespesa = [
  'Aluguel',
  'Equipamentos',
  'Impostos',
  'Manutenção',
  'Materiais',
  'Salários',
  'Serviços',
  'Outros',
];

function dataHoje() {
  const data = new Date();
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function criarFormulario(tipo, lancamento) {
  if (lancamento) {
    return {
      paciente: lancamento.paciente || '',
      procedimento: lancamento.procedimento || '',
      descricao: lancamento.descricao || '',
      categoria: lancamento.categoria || '',
      fornecedor: lancamento.fornecedor || '',
      valor: String(lancamento.valor ?? ''),
      data: lancamento.data || dataHoje(),
      pagamento: lancamento.pagamento || '',
      status: lancamento.status || 'Pendente',
      observacoes: lancamento.observacoes || '',
    };
  }

  return {
    paciente: '',
    procedimento: '',
    descricao: '',
    categoria: '',
    fornecedor: '',
    valor: '',
    data: dataHoje(),
    pagamento: '',
    status: 'Pendente',
    observacoes: '',
    tipo,
  };
}

export default function NovaMovimentacao({
  tipo,
  lancamento = null,
  pacientes,
  onClose,
  onSave,
}) {
  const [formulario, setFormulario] = useState(() => criarFormulario(tipo, lancamento));
  const [erros, setErros] = useState({});
  const ehReceita = tipo === 'receita';
  const emEdicao = Boolean(lancamento);

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

  function registrar(evento) {
    evento.preventDefault();
    const camposObrigatorios = ehReceita
      ? ['paciente', 'valor', 'data']
      : ['descricao', 'categoria', 'valor', 'data'];
    const novosErros = {};

    camposObrigatorios.forEach((campo) => {
      if (!String(formulario[campo]).trim()) {
        novosErros[campo] = 'Este campo é obrigatório.';
      }
    });

    const valor = Number(formulario.valor);
    if (formulario.valor !== '' && (!Number.isFinite(valor) || valor <= 0)) {
      novosErros.valor = 'Informe um valor maior que zero.';
    }

    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    const paciente = pacientes.find((nome) => nome === formulario.paciente);
    const descricao = ehReceita
      ? formulario.descricao.trim() ||
        formulario.procedimento ||
        'Receita odontológica'
      : formulario.descricao.trim();

    onSave({
      ...formulario,
      id: lancamento?.id,
      tipo,
      descricao,
      pessoa: ehReceita ? formulario.paciente : formulario.fornecedor.trim() || '—',
      paciente: paciente || formulario.paciente,
      fornecedor: formulario.fornecedor.trim(),
      valor,
    });
  }

  function fecharAoClicarNoFundo(evento) {
    if (evento.target === evento.currentTarget) onClose();
  }

  const titulo = ehReceita ? 'Nova Receita' : 'Nova Despesa';
  const tituloEdicao = ehReceita ? 'Editar Receita' : 'Editar Despesa';

  return (
    <div className={`financeiro-modal-overlay financeiro-modal-overlay-${tipo}`} onMouseDown={fecharAoClicarNoFundo}>
      <section
        className={`financeiro-modal financeiro-modal-${tipo}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="financeiro-modal-titulo"
      >
        <header className="financeiro-modal-header">
          <span className={`financeiro-modal-icone financeiro-modal-icone-${tipo}`} aria-hidden="true">
            {ehReceita ? '↑' : '↓'}
          </span>
          <div className="financeiro-modal-titulos">
            <h2 id="financeiro-modal-titulo">{emEdicao ? tituloEdicao : titulo}</h2>
            <p>{ehReceita ? 'Registrar entrada financeira' : 'Registrar saída financeira'}</p>
          </div>
          <button
            className="financeiro-modal-fechar"
            type="button"
            aria-label="Fechar formulário"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="financeiro-modal-form" onSubmit={registrar} noValidate>
          <div className="financeiro-modal-campos">
            {ehReceita ? (
              <>
                <label className="financeiro-campo" htmlFor="financeiro-paciente">
                  <span>Paciente <i>*</i></span>
                  <select
                    id="financeiro-paciente"
                    name="paciente"
                    value={formulario.paciente}
                    onChange={atualizarCampo}
                    aria-invalid={Boolean(erros.paciente)}
                  >
                    <option value="">Selecionar paciente...</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente}>{paciente}</option>
                    ))}
                  </select>
                  {erros.paciente && <small>{erros.paciente}</small>}
                </label>

                <label className="financeiro-campo" htmlFor="financeiro-procedimento">
                  <span>Procedimento</span>
                  <select
                    id="financeiro-procedimento"
                    name="procedimento"
                    value={formulario.procedimento}
                    onChange={atualizarCampo}
                  >
                    <option value="">Selecionar procedimento...</option>
                    {procedimentos.map((procedimento) => (
                      <option key={procedimento}>{procedimento}</option>
                    ))}
                  </select>
                </label>

                <label className="financeiro-campo" htmlFor="financeiro-descricao">
                  <span>Descrição</span>
                  <input
                    id="financeiro-descricao"
                    name="descricao"
                    placeholder="Descrição da receita..."
                    value={formulario.descricao}
                    onChange={atualizarCampo}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="financeiro-campo" htmlFor="financeiro-descricao">
                  <span>Descrição <i>*</i></span>
                  <input
                    id="financeiro-descricao"
                    name="descricao"
                    placeholder="Descreva a despesa..."
                    value={formulario.descricao}
                    onChange={atualizarCampo}
                    aria-invalid={Boolean(erros.descricao)}
                  />
                  {erros.descricao && <small>{erros.descricao}</small>}
                </label>

                <label className="financeiro-campo" htmlFor="financeiro-categoria">
                  <span>Categoria <i>*</i></span>
                  <select
                    id="financeiro-categoria"
                    name="categoria"
                    value={formulario.categoria}
                    onChange={atualizarCampo}
                    aria-invalid={Boolean(erros.categoria)}
                  >
                    <option value="">Selecionar categoria...</option>
                    {categoriasDespesa.map((categoria) => (
                      <option key={categoria}>{categoria}</option>
                    ))}
                  </select>
                  {erros.categoria && <small>{erros.categoria}</small>}
                </label>

                <label className="financeiro-campo" htmlFor="financeiro-fornecedor">
                  <span>Fornecedor</span>
                  <input
                    id="financeiro-fornecedor"
                    name="fornecedor"
                    placeholder="Nome do fornecedor..."
                    value={formulario.fornecedor}
                    onChange={atualizarCampo}
                  />
                </label>
              </>
            )}

            <div className="financeiro-campo-linha">
              <label className="financeiro-campo" htmlFor="financeiro-valor">
                <span>Valor (R$) <i>*</i></span>
                <input
                  id="financeiro-valor"
                  name="valor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={formulario.valor}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erros.valor)}
                />
                {erros.valor && <small>{erros.valor}</small>}
              </label>

              <label className="financeiro-campo" htmlFor="financeiro-data">
                <span>Data <i>*</i></span>
                <input
                  id="financeiro-data"
                  name="data"
                  type="date"
                  value={formulario.data}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erros.data)}
                />
                {erros.data && <small>{erros.data}</small>}
              </label>
            </div>

            {ehReceita ? (
              <label className="financeiro-campo" htmlFor="financeiro-pagamento">
                <span>Forma de Pagamento</span>
                <select
                  id="financeiro-pagamento"
                  name="pagamento"
                  value={formulario.pagamento}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecionar forma de pagamento...</option>
                  {pagamentos.map((pagamento) => (
                    <option key={pagamento}>{pagamento}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="financeiro-campo" htmlFor="financeiro-status">
              <span>Status</span>
              <select
                id="financeiro-status"
                name="status"
                value={formulario.status}
                onChange={atualizarCampo}
              >
                <option>Pendente</option>
                <option>Pago</option>
              </select>
            </label>

            {!ehReceita && (
              <label className="financeiro-campo" htmlFor="financeiro-observacoes">
                <span>Observações</span>
                <textarea
                  id="financeiro-observacoes"
                  name="observacoes"
                  placeholder="Observações adicionais..."
                  rows="3"
                  value={formulario.observacoes}
                  onChange={atualizarCampo}
                />
              </label>
            )}
          </div>

          <footer className="financeiro-modal-footer">
            <button
              className="financeiro-modal-botao financeiro-modal-botao-cancelar"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className={`financeiro-modal-botao financeiro-modal-botao-${tipo}`}
              type="submit"
            >
              {emEdicao
                ? 'Salvar alterações'
                : ehReceita
                  ? 'Registrar Receita'
                  : 'Registrar Despesa'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}