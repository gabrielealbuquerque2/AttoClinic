import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Campo from '../../components/Campo';

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

  const titulo = ehReceita ? 'Nova Receita' : 'Nova Despesa';
  const tituloEdicao = ehReceita ? 'Editar Receita' : 'Editar Despesa';

  const cor = ehReceita ? 'success' : 'danger';

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={registrar} noValidate>
        <Modal.Header closeButton>
          <span
            className={`indicador-icone bg-${cor}-subtle text-${cor}-emphasis me-3`}
            aria-hidden="true"
          >
            {ehReceita ? '↑' : '↓'}
          </span>
          <div>
            <Modal.Title as="h2" className="fs-5 fw-bold">
              {emEdicao ? tituloEdicao : titulo}
            </Modal.Title>
            <small className="text-secondary">
              {ehReceita ? 'Registrar entrada financeira' : 'Registrar saída financeira'}
            </small>
          </div>
        </Modal.Header>

        <Modal.Body>
          {ehReceita ? (
            <>
              <Campo
                id="financeiro-paciente"
                name="paciente"
                label="Paciente"
                obrigatorio
                tipo="select"
                value={formulario.paciente}
                onChange={atualizarCampo}
                erro={erros.paciente}
              >
                <option value="">Selecionar paciente...</option>
                {pacientes.map((paciente) => (
                  <option key={paciente}>{paciente}</option>
                ))}
              </Campo>

              <Campo
                id="financeiro-procedimento"
                name="procedimento"
                label="Procedimento"
                tipo="select"
                value={formulario.procedimento}
                onChange={atualizarCampo}
              >
                <option value="">Selecionar procedimento...</option>
                {procedimentos.map((procedimento) => (
                  <option key={procedimento}>{procedimento}</option>
                ))}
              </Campo>

              <Campo
                id="financeiro-descricao"
                name="descricao"
                label="Descrição"
                placeholder="Descrição da receita..."
                value={formulario.descricao}
                onChange={atualizarCampo}
              />
            </>
          ) : (
            <>
              <Campo
                id="financeiro-descricao"
                name="descricao"
                label="Descrição"
                obrigatorio
                placeholder="Descreva a despesa..."
                value={formulario.descricao}
                onChange={atualizarCampo}
                erro={erros.descricao}
              />

              <Campo
                id="financeiro-categoria"
                name="categoria"
                label="Categoria"
                obrigatorio
                tipo="select"
                value={formulario.categoria}
                onChange={atualizarCampo}
                erro={erros.categoria}
              >
                <option value="">Selecionar categoria...</option>
                {categoriasDespesa.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </Campo>

              <Campo
                id="financeiro-fornecedor"
                name="fornecedor"
                label="Fornecedor"
                placeholder="Nome do fornecedor..."
                value={formulario.fornecedor}
                onChange={atualizarCampo}
              />
            </>
          )}

          <Row>
            <Col sm={6}>
              <Campo
                id="financeiro-valor"
                name="valor"
                label="Valor (R$)"
                obrigatorio
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={formulario.valor}
                onChange={atualizarCampo}
                erro={erros.valor}
              />
            </Col>
            <Col sm={6}>
              <Campo
                id="financeiro-data"
                name="data"
                label="Data"
                obrigatorio
                type="date"
                value={formulario.data}
                onChange={atualizarCampo}
                erro={erros.data}
              />
            </Col>
          </Row>

          {ehReceita && (
            <Campo
              id="financeiro-pagamento"
              name="pagamento"
              label="Forma de Pagamento"
              tipo="select"
              value={formulario.pagamento}
              onChange={atualizarCampo}
            >
              <option value="">Selecionar forma de pagamento...</option>
              {pagamentos.map((pagamento) => (
                <option key={pagamento}>{pagamento}</option>
              ))}
            </Campo>
          )}

          <Campo
            id="financeiro-status"
            name="status"
            label="Status"
            tipo="select"
            value={formulario.status}
            onChange={atualizarCampo}
            className={ehReceita ? 'mb-0' : 'mb-3'}
          >
            <option>Pendente</option>
            <option>Pago</option>
          </Campo>

          {!ehReceita && (
            <Campo
              id="financeiro-observacoes"
              name="observacoes"
              label="Observações"
              tipo="textarea"
              rows={3}
              placeholder="Observações adicionais..."
              value={formulario.observacoes}
              onChange={atualizarCampo}
              className="mb-0"
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant={cor}>
            {emEdicao
              ? 'Salvar alterações'
              : ehReceita
                ? 'Registrar Receita'
                : 'Registrar Despesa'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
