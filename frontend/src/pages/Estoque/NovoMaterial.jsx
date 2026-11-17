import { useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Campo from '../../components/Campo';
import { mensagemDeErro } from '../../services/api';

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
  unidade_medida: '',
  qtd_disponivel: '',
  qtd_minima: '',
  data_validade: '',
  fornecedor: '',
  observacoes: '',
};

// Garante que um valor já gravado no banco apareça no select mesmo fora da lista padrão
function comAtual(lista, atual) {
  return atual && !lista.includes(atual) ? [...lista, atual] : lista;
}

export default function NovoMaterial({
  material = null,
  onClose,
  onSave,
  onDelete,
}) {
  const [formulario, setFormulario] = useState(() => (
    material
      ? Object.fromEntries(
          Object.keys(formularioVazio).map((campo) => [campo, String(material[campo] ?? '')])
        )
      : formularioVazio
  ));
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [salvando, setSalvando] = useState(false);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: '' }));
    setErroApi('');
  }

  async function salvar(evento) {
    evento.preventDefault();
    const novosErros = {};

    // Na edição a quantidade não é obrigatória: ela só muda pela Movimentação
    const obrigatorios = ['nome', 'categoria', 'unidade_medida', 'qtd_minima'];
    if (!material) obrigatorios.push('qtd_disponivel');

    obrigatorios.forEach((campo) => {
      if (!String(formulario[campo]).trim()) {
        novosErros[campo] = 'Este campo é obrigatório.';
      }
    });

    const camposNumericos = material
      ? ['qtd_minima']
      : ['qtd_disponivel', 'qtd_minima'];
    camposNumericos.forEach((campo) => {
      const numero = Number(formulario[campo]);
      if (formulario[campo] !== '' && (!Number.isInteger(numero) || numero < 0)) {
        novosErros[campo] = 'Informe um número inteiro igual ou maior que zero.';
      }
    });

    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    const dados = {
      nome: formulario.nome.trim(),
      categoria: formulario.categoria,
      unidade_medida: formulario.unidade_medida,
      qtd_minima: Number(formulario.qtd_minima),
      data_validade: formulario.data_validade || null,
      fornecedor: formulario.fornecedor.trim() || null,
      observacoes: formulario.observacoes.trim() || null,
    };
    // Estoque só entra no cadastro; depois disso, é alterado por entradas/saídas
    if (!material) dados.qtd_disponivel = Number(formulario.qtd_disponivel);

    setSalvando(true);
    try {
      await onSave(dados);
    } catch (e) {
      setErroApi(mensagemDeErro(e, 'Erro ao salvar material.'));
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!material) return;
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir "${material.nome}" do estoque?`
    );
    if (!confirmado) return;

    setSalvando(true);
    try {
      await onDelete(material.id_material);
    } catch (e) {
      setErroApi(mensagemDeErro(e, 'Erro ao excluir material.'));
      setSalvando(false);
    }
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
          {erroApi && <Alert variant="danger" className="py-2">{erroApi}</Alert>}

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
                {comAtual(categorias, formulario.categoria).map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </Campo>
            </Col>
            <Col sm={6}>
              <Campo
                id="novo-material-unidade"
                name="unidade_medida"
                label="Unidade"
                obrigatorio
                tipo="select"
                value={formulario.unidade_medida}
                onChange={atualizarCampo}
                erro={erros.unidade_medida}
              >
                <option value="">Selecione...</option>
                {comAtual(unidades, formulario.unidade_medida).map((unidade) => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </Campo>
            </Col>
          </Row>

          <Row>
            {!material && (
              <Col sm={6}>
                <Campo
                  id="novo-material-quantidade"
                  name="qtd_disponivel"
                  label="Quantidade Inicial"
                  obrigatorio
                  type="number"
                  min="0"
                  step="1"
                  value={formulario.qtd_disponivel}
                  onChange={atualizarCampo}
                  erro={erros.qtd_disponivel}
                />
              </Col>
            )}
            <Col sm={6}>
              <Campo
                id="novo-material-minimo"
                name="qtd_minima"
                label="Estoque Mínimo"
                obrigatorio
                type="number"
                min="0"
                step="1"
                value={formulario.qtd_minima}
                onChange={atualizarCampo}
                erro={erros.qtd_minima}
              />
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              <Campo
                id="novo-material-validade"
                name="data_validade"
                label="Data de Validade"
                type="date"
                value={formulario.data_validade}
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
            <Button variant="outline-danger" className="me-auto" onClick={excluir} disabled={salvando}>
              Excluir Material
            </Button>
          )}
          <Button variant="outline-secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : material ? 'Salvar Alterações' : 'Cadastrar Material'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}