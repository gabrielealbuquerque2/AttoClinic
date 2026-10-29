import { useEffect, useState } from 'react';

const categorias = [
  'Anestésicos',
  'Descartáveis',
  'Higiene',
  'Instrumentais',
  'Materiais Restauradores',
  'Outros',
];

const unidades = ['un', 'cx', 'ser', 'pct', 'ml', 'l', 'par', 'kit'];

const formularioVazio = {
  nome: '',
  categoria: '',
  unidade: '',
  quantidade: '',
  quantidadeMinima: '',
  validade: '',
  fornecedor: '',
  observacoes: '',
};

export default function NovoMaterial({
  material = null,
  onClose,
  onSave,
  onDelete,
}) {
  const [formulario, setFormulario] = useState(() => (
    material
      ? {
          ...formularioVazio,
          ...material,
          quantidade: String(material.quantidade),
          quantidadeMinima: String(material.quantidadeMinima),
        }
      : formularioVazio
  ));
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

  function salvar(evento) {
    evento.preventDefault();
    const novosErros = {};

    ['nome', 'categoria', 'unidade', 'quantidade', 'quantidadeMinima'].forEach((campo) => {
      if (!String(formulario[campo]).trim()) {
        novosErros[campo] = 'Este campo é obrigatório.';
      }
    });

    const quantidade = Number(formulario.quantidade);
    const quantidadeMinima = Number(formulario.quantidadeMinima);
    if (formulario.quantidade !== '' && (!Number.isFinite(quantidade) || quantidade < 0)) {
      novosErros.quantidade = 'Informe um valor igual ou maior que zero.';
    }
    if (
      formulario.quantidadeMinima !== '' &&
      (!Number.isFinite(quantidadeMinima) || quantidadeMinima < 0)
    ) {
      novosErros.quantidadeMinima = 'Informe um valor igual ou maior que zero.';
    }

    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    onSave({
      ...formulario,
      quantidade,
      quantidadeMinima,
      validade: formulario.validade || '',
    });
  }

  function fecharAoClicarNoFundo(evento) {
    if (evento.target === evento.currentTarget) onClose();
  }

  function excluir() {
    if (!material) return;
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir "${material.nome}" do estoque?`
    );
    if (confirmado) onDelete(material.id);
  }

  return (
    <div className="novo-material-overlay" onMouseDown={fecharAoClicarNoFundo}>
      <section
        className="novo-material-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-material-titulo"
      >
        <header className="novo-material-header">
          <div>
            <h2 id="novo-material-titulo">{material ? 'Editar Material' : 'Novo Material'}</h2>
            <p>{material ? 'Atualizar material do estoque' : 'Cadastrar material no estoque'}</p>
          </div>
          <button
            className="novo-material-close"
            type="button"
            aria-label="Fechar cadastro de material"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="novo-material-form" onSubmit={salvar} noValidate>
          <div className="novo-material-fields">
            <label className="novo-material-field" htmlFor="novo-material-nome">
              <span>Nome do Material <i>*</i></span>
              <input
                id="novo-material-nome"
                name="nome"
                placeholder="Ex: Luvas descartáveis P"
                value={formulario.nome}
                onChange={atualizarCampo}
                aria-invalid={Boolean(erros.nome)}
              />
              {erros.nome && <small>{erros.nome}</small>}
            </label>

            <div className="novo-material-row">
              <label className="novo-material-field" htmlFor="novo-material-categoria">
                <span>Categoria <i>*</i></span>
                <select
                  id="novo-material-categoria"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erros.categoria)}
                >
                  <option value="">Selecione...</option>
                  {categorias.map((categoria) => (
                    <option key={categoria}>{categoria}</option>
                  ))}
                </select>
                {erros.categoria && <small>{erros.categoria}</small>}
              </label>

              <label className="novo-material-field" htmlFor="novo-material-unidade">
                <span>Unidade <i>*</i></span>
                <select
                  id="novo-material-unidade"
                  name="unidade"
                  value={formulario.unidade}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erros.unidade)}
                >
                  <option value="">Selecione...</option>
                  {unidades.map((unidade) => (
                    <option key={unidade} value={unidade}>{unidade}</option>
                  ))}
                </select>
                {erros.unidade && <small>{erros.unidade}</small>}
              </label>
            </div>

            <div className="novo-material-row">
              <label className="novo-material-field" htmlFor="novo-material-quantidade">
                <span>Quantidade Inicial <i>*</i></span>
                <input
                  id="novo-material-quantidade"
                  name="quantidade"
                  type="number"
                  min="0"
                  step="any"
                  value={formulario.quantidade}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erros.quantidade)}
                />
                {erros.quantidade && <small>{erros.quantidade}</small>}
              </label>
              <label className="novo-material-field" htmlFor="novo-material-minimo">
                <span>Estoque Mínimo <i>*</i></span>
                <input
                  id="novo-material-minimo"
                  name="quantidadeMinima"
                  type="number"
                  min="0"
                  step="any"
                  value={formulario.quantidadeMinima}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erros.quantidadeMinima)}
                />
                {erros.quantidadeMinima && <small>{erros.quantidadeMinima}</small>}
              </label>
            </div>

            <div className="novo-material-row">
              <label className="novo-material-field" htmlFor="novo-material-validade">
                <span>Data de Validade</span>
                <input
                  id="novo-material-validade"
                  name="validade"
                  type="date"
                  value={formulario.validade}
                  onChange={atualizarCampo}
                />
              </label>
              <label className="novo-material-field" htmlFor="novo-material-fornecedor">
                <span>Fornecedor</span>
                <input
                  id="novo-material-fornecedor"
                  name="fornecedor"
                  placeholder="Nome do fornecedor"
                  value={formulario.fornecedor}
                  onChange={atualizarCampo}
                />
              </label>
            </div>

            <label className="novo-material-field" htmlFor="novo-material-observacoes">
              <span>Observações</span>
              <textarea
                id="novo-material-observacoes"
                name="observacoes"
                placeholder="Informações adicionais..."
                rows="3"
                value={formulario.observacoes}
                onChange={atualizarCampo}
              />
            </label>
          </div>

          <footer className="novo-material-footer">
            <div className="novo-material-footer-acoes">
              {material && (
                <button
                  className="estoque-botao novo-material-delete"
                  type="button"
                  onClick={excluir}
                >
                  Excluir Material
                </button>
              )}
            </div>
            <div className="novo-material-footer-acoes">
              <button
                className="estoque-botao estoque-botao-secundario"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button className="estoque-botao estoque-botao-principal" type="submit">
                {material ? 'Salvar Alterações' : 'Cadastrar Material'}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}