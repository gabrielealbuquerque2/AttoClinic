import { useEffect, useState } from 'react';

function dataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data) return '—';
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
}

export default function Movimentacao({
  materiais,
  historico,
  materialInicialId = '',
  onClose,
  onRegister,
}) {
  const [formulario, setFormulario] = useState({
    materialId: materialInicialId,
    tipo: 'entrada',
    quantidade: '',
    data: dataHoje(),
    motivo: '',
    observacao: '',
  });
  const [erro, setErro] = useState('');

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
    setErro('');
  }

  function registrar(evento) {
    evento.preventDefault();
    const quantidade = Number(formulario.quantidade);
    const material = materiais.find(
      (item) => item.id === Number(formulario.materialId)
    );

    if (!material) {
      setErro('Selecione um material para continuar.');
      return;
    }
    if (!['entrada', 'saida'].includes(formulario.tipo)) {
      setErro('Selecione entrada ou saída.');
      return;
    }
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setErro('Informe uma quantidade maior que zero.');
      return;
    }
    if (!formulario.motivo.trim()) {
      setErro('Informe o motivo da movimentação.');
      return;
    }
    if (formulario.tipo === 'saida' && quantidade > Number(material.quantidade)) {
      setErro('A saída não pode ser maior que a quantidade disponível.');
      return;
    }

    onRegister({
      materialId: material.id,
      material: material.nome,
      tipo: formulario.tipo,
      quantidade,
      data: formulario.data || dataHoje(),
      motivo: formulario.motivo.trim(),
      observacao: formulario.observacao.trim(),
    });
  }

  function fecharAoClicarNoFundo(evento) {
    if (evento.target === evento.currentTarget) onClose();
  }

  return (
    <div className="movimentacao-overlay" onMouseDown={fecharAoClicarNoFundo}>
      <section
        className="movimentacao-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movimentacao-titulo"
      >
        <header className="movimentacao-header">
          <div>
            <h2 id="movimentacao-titulo">Movimentação de Estoque</h2>
            <p>Registrar entrada ou saída de material</p>
          </div>
          <button
            className="movimentacao-close"
            type="button"
            aria-label="Fechar movimentação"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="movimentacao-content">
          <form className="movimentacao-form" onSubmit={registrar} noValidate>
            <label className="movimentacao-field" htmlFor="movimentacao-material">
              <span>Material <i>*</i></span>
              <select
                id="movimentacao-material"
                name="materialId"
                value={formulario.materialId}
                onChange={atualizarCampo}
                aria-invalid={Boolean(erro && !formulario.materialId)}
              >
                <option value="">Selecionar material...</option>
                {materiais.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.nome} ({material.quantidade} {material.unidade})
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="movimentacao-tipo">
              <legend>Tipo de Movimentação <i>*</i></legend>
              <div className="movimentacao-tipo-opcoes">
                <button
                  className={`movimentacao-tipo-botao movimentacao-tipo-entrada ${
                    formulario.tipo === 'entrada' ? 'selecionado' : ''
                  }`}
                  type="button"
                  aria-pressed={formulario.tipo === 'entrada'}
                  onClick={() => {
                    setFormulario((atual) => ({ ...atual, tipo: 'entrada' }));
                    setErro('');
                  }}
                >
                  ↑ Entrada
                </button>
                <button
                  className={`movimentacao-tipo-botao movimentacao-tipo-saida ${
                    formulario.tipo === 'saida' ? 'selecionado' : ''
                  }`}
                  type="button"
                  aria-pressed={formulario.tipo === 'saida'}
                  onClick={() => {
                    setFormulario((atual) => ({ ...atual, tipo: 'saida' }));
                    setErro('');
                  }}
                >
                  ↓ Saída
                </button>
              </div>
            </fieldset>

            <div className="movimentacao-row">
              <label className="movimentacao-field" htmlFor="movimentacao-quantidade">
                <span>Quantidade <i>*</i></span>
                <input
                  id="movimentacao-quantidade"
                  name="quantidade"
                  type="number"
                  min="0.01"
                  step="any"
                  value={formulario.quantidade}
                  onChange={atualizarCampo}
                  aria-invalid={Boolean(erro && formulario.quantidade)}
                />
              </label>
              <label className="movimentacao-field" htmlFor="movimentacao-data">
                <span>Data</span>
                <input
                  id="movimentacao-data"
                  name="data"
                  type="date"
                  value={formulario.data}
                  onChange={atualizarCampo}
                />
              </label>
            </div>

            <label className="movimentacao-field" htmlFor="movimentacao-motivo">
              <span>Motivo <i>*</i></span>
              <input
                id="movimentacao-motivo"
                name="motivo"
                placeholder="Ex: Uso clínico, Compra de reposição..."
                value={formulario.motivo}
                onChange={atualizarCampo}
                aria-invalid={Boolean(erro && !formulario.motivo.trim())}
              />
            </label>

            <label className="movimentacao-field" htmlFor="movimentacao-observacao">
              <span>Observação</span>
              <textarea
                id="movimentacao-observacao"
                name="observacao"
                placeholder="Observações adicionais..."
                rows="3"
                value={formulario.observacao}
                onChange={atualizarCampo}
              />
            </label>

            {erro && <p className="movimentacao-error" role="alert">{erro}</p>}

            <footer className="movimentacao-footer">
              <button
                className="estoque-botao estoque-botao-secundario"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button className="estoque-botao estoque-botao-principal" type="submit">
                Registrar Movimentação
              </button>
            </footer>
          </form>

          <section className="movimentacao-historico" aria-labelledby="movimentacao-historico-titulo">
            <h3 id="movimentacao-historico-titulo">Histórico de Movimentações</h3>
            <div className="movimentacao-historico-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Material</th>
                    <th>Tipo</th>
                    <th>QTD</th>
                    <th>Motivo</th>
                    <th>Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item) => (
                    <tr key={item.id}>
                      <td>{formatarData(item.data)}</td>
                      <td>{item.material}</td>
                      <td>
                        <span className={`movimentacao-badge movimentacao-badge-${item.tipo}`}>
                          {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td>{item.quantidade}</td>
                      <td>{item.motivo}</td>
                      <td>{item.usuario}</td>
                    </tr>
                  ))}
                  {historico.length === 0 && (
                    <tr>
                      <td className="movimentacao-historico-vazio" colSpan="6">
                        Nenhuma movimentação registrada nesta sessão.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}