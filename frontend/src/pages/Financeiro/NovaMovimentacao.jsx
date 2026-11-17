import { useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Campo from '../../components/Campo';
import { mensagemDeErro } from '../../services/api';

const pagamentos = ['Pix', 'Cartão', 'Dinheiro', 'Transferência', 'Boleto'];
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
      paciente: String(lancamento.id_paciente ?? ''),
      procedimento: String(lancamento.id_procedimento ?? ''),
      descricao: lancamento.descricao || '',
      categoria: lancamento.categoria || '',
      fornecedor: lancamento.fornecedor || '',
      valor: String(lancamento.valor ?? ''),
      data: lancamento.data_receita || lancamento.data_despesa || lancamento.data || dataHoje(),
      pagamento: lancamento.tipo_pagamento || lancamento.pagamento || '',
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
  pacientes = [],
  procedimentos = [],
  onClose,
  onSave,
}) {
  const [formulario, setFormulario] = useState(() => criarFormulario(tipo, lancamento));
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [salvando, setSalvando] = useState(false);
  const ehReceita = tipo === 'receita';
  const emEdicao = Boolean(lancamento);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: '' }));
    setErroEnvio('');
  }

  async function registrar(evento) {
    evento.preventDefault();
    const camposObrigatorios = ehReceita
      ? ['paciente', 'valor', 'data']
      : ['descricao', 'categoria', 'valor', 'data'];
    const novosErros = {};

    camposObrigatorios.forEach((campo) => {
      if (!String(formulario[campo] ?? '').trim()) {
        novosErros[campo] = 'Este campo é obrigatório.';
      }
    });

    const pacienteSelecionado = pacientes.find(
      (paciente) => String(paciente.id_paciente) === formulario.paciente
    );
    if (ehReceita && !pacienteSelecionado) {
      novosErros.paciente = 'Selecione um paciente cadastrado.';
    }

    const valor = Number(formulario.valor);
    if (formulario.valor !== '' && (!Number.isFinite(valor) || valor <= 0)) {
      novosErros.valor = 'Informe um valor maior que zero.';
    }

    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    const dados = ehReceita
      ? {
          id_paciente: pacienteSelecionado.id_paciente,
          id_procedimento: formulario.procedimento
            ? Number(formulario.procedimento)
            : null,
          data_receita: formulario.data,
          valor,
          descricao: formulario.descricao.trim() ||
            procedimentos.find(
              (procedimento) =>
                String(procedimento.id_procedimento) === formulario.procedimento
            )?.nome_procedimento ||
            'Receita odontológica',
          tipo_pagamento: formulario.pagamento || null,
          status: formulario.status,
        }
      : {
          data_despesa: formulario.data,
          categoria: formulario.categoria,
          fornecedor: formulario.fornecedor.trim() || null,
          descricao: formulario.descricao.trim(),
          valor,
          tipo_pagamento: formulario.pagamento || null,
          status: formulario.status,
          observacoes: formulario.observacoes,
        };

    setSalvando(true);
    setErroEnvio('');
    try {
      await onSave(dados);
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setSalvando(false);
    }
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
          {erroEnvio && (
            <Alert variant="danger" className="py-2">{erroEnvio}</Alert>
          )}
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
                  <option key={paciente.id_paciente} value={paciente.id_paciente}>
                    {paciente.nome}
                  </option>
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
                  <option
                    key={procedimento.id_procedimento}
                    value={procedimento.id_procedimento}
                  >
                    {procedimento.nome_procedimento}
                  </option>
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
                maxLength={255}
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
          <Button variant="outline-secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" variant={cor} disabled={salvando}>
            {emEdicao
              ? salvando ? 'Salvando...' : 'Salvar alterações'
              : ehReceita
                ? salvando ? 'Salvando...' : 'Registrar Receita'
                : salvando ? 'Salvando...' : 'Registrar Despesa'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
