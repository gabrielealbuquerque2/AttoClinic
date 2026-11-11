import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Campo from '../../components/Campo';

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

  function excluir() {
    if (!material) return;
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir "${material.nome}" do estoque?`
    );
    if (confirmado) onDelete(material.id);
  }

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={salvar} noValidate>
        <Modal.Header closeButton>
          <div>
            <Modal.Title as="h2" className="fs-5 fw-bold">
              {material ? 'Editar Material' : 'Novo Material'}
            </Modal.Title>
            <small className="text-secondary">
              {material ? 'Atualizar material do estoque' : 'Cadastrar material no estoque'}
            </small>
          </div>
        </Modal.Header>

        <Modal.Body>
          <Campo
            id="novo-material-nome"
            name="nome"
            label="Nome do Material"
            obrigatorio
            placeholder="Ex: Luvas descartáveis P"
            value={formulario.nome}
            onChange={atualizarCampo}
            erro={erros.nome}
          />

          <Row>
            <Col sm={6}>
              <Campo
                id="novo-material-categoria"
                name="categoria"
                label="Categoria"
                obrigatorio
                tipo="select"
                value={formulario.categoria}
                onChange={atualizarCampo}
                erro={erros.categoria}
              >
                <option value="">Selecione...</option>
                {categorias.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </Campo>
            </Col>
            <Col sm={6}>
              <Campo
                id="novo-material-unidade"
                name="unidade"
                label="Unidade"
                obrigatorio
                tipo="select"
                value={formulario.unidade}
                onChange={atualizarCampo}
                erro={erros.unidade}
              >
                <option value="">Selecione...</option>
                {unidades.map((unidade) => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </Campo>
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              <Campo
                id="novo-material-quantidade"
                name="quantidade"
                label="Quantidade Inicial"
                obrigatorio
                type="number"
                min="0"
                step="any"
                value={formulario.quantidade}
                onChange={atualizarCampo}
                erro={erros.quantidade}
              />
            </Col>
            <Col sm={6}>
              <Campo
                id="novo-material-minimo"
                name="quantidadeMinima"
                label="Estoque Mínimo"
                obrigatorio
                type="number"
                min="0"
                step="any"
                value={formulario.quantidadeMinima}
                onChange={atualizarCampo}
                erro={erros.quantidadeMinima}
              />
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              <Campo
                id="novo-material-validade"
                name="validade"
                label="Data de Validade"
                type="date"
                value={formulario.validade}
                onChange={atualizarCampo}
              />
            </Col>
            <Col sm={6}>
              <Campo
                id="novo-material-fornecedor"
                name="fornecedor"
                label="Fornecedor"
                placeholder="Nome do fornecedor"
                value={formulario.fornecedor}
                onChange={atualizarCampo}
              />
            </Col>
          </Row>

          <Campo
            id="novo-material-observacoes"
            name="observacoes"
            label="Observações"
            tipo="textarea"
            rows={3}
            placeholder="Informações adicionais..."
            value={formulario.observacoes}
            onChange={atualizarCampo}
            className="mb-0"
          />
        </Modal.Body>

        <Modal.Footer>
          {material && (
            <Button variant="outline-danger" className="me-auto" onClick={excluir}>
              Excluir Material
            </Button>
          )}
          <Button variant="outline-secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{material ? 'Salvar Alterações' : 'Cadastrar Material'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
