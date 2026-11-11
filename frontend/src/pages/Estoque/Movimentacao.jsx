import { useState } from 'react';
import {
  Alert, Button, Col, Form, Modal, Row, Table, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import Campo from '../../components/Campo';
import StatusBadge from '../../components/StatusBadge';

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

  return (
    <Modal show onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <div>
          <Modal.Title as="h2" className="fs-5 fw-bold">Movimentação de Estoque</Modal.Title>
          <small className="text-secondary">Registrar entrada ou saída de material</small>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Form id="form-movimentacao" onSubmit={registrar} noValidate>
          <Campo
            id="movimentacao-material"
            name="materialId"
            label="Material"
            obrigatorio
            tipo="select"
            value={formulario.materialId}
            onChange={atualizarCampo}
          >
            <option value="">Selecionar material...</option>
            {materiais.map((material) => (
              <option key={material.id} value={material.id}>
                {material.nome} ({material.quantidade} {material.unidade})
              </option>
            ))}
          </Campo>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold mb-1">
              Tipo de Movimentação <span className="text-danger">*</span>
            </Form.Label>
            <ToggleButtonGroup
              type="radio"
              name="tipo-movimentacao"
              value={formulario.tipo}
              onChange={(tipo) => {
                setFormulario((atual) => ({ ...atual, tipo }));
                setErro('');
              }}
              className="w-100"
            >
              <ToggleButton id="tipo-entrada" value="entrada" variant="outline-success">
                ↑ Entrada
              </ToggleButton>
              <ToggleButton id="tipo-saida" value="saida" variant="outline-danger">
                ↓ Saída
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>

          <Row>
            <Col sm={6}>
              <Campo
                id="movimentacao-quantidade"
                name="quantidade"
                label="Quantidade"
                obrigatorio
                type="number"
                min="0.01"
                step="any"
                value={formulario.quantidade}
                onChange={atualizarCampo}
              />
            </Col>
            <Col sm={6}>
              <Campo
                id="movimentacao-data"
                name="data"
                label="Data"
                type="date"
                value={formulario.data}
                onChange={atualizarCampo}
              />
            </Col>
          </Row>

          <Campo
            id="movimentacao-motivo"
            name="motivo"
            label="Motivo"
            obrigatorio
            placeholder="Ex: Uso clínico, Compra de reposição..."
            value={formulario.motivo}
            onChange={atualizarCampo}
          />

          <Campo
            id="movimentacao-observacao"
            name="observacao"
            label="Observação"
            tipo="textarea"
            rows={3}
            placeholder="Observações adicionais..."
            value={formulario.observacao}
            onChange={atualizarCampo}
          />

          {erro && <Alert variant="danger" className="py-2 mb-0">{erro}</Alert>}
        </Form>

        <hr />

        <h3 className="fs-6 fw-bold">Histórico de Movimentações</h3>
        <Table size="sm" responsive className="align-middle mb-0">
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
                  <StatusBadge status={item.tipo === 'entrada' ? 'Entrada' : 'Saída'} />
                </td>
                <td>{item.quantidade}</td>
                <td>{item.motivo}</td>
                <td>{item.usuario}</td>
              </tr>
            ))}
            {historico.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-3">
                  Nenhuma movimentação registrada nesta sessão.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="form-movimentacao">Registrar Movimentação</Button>
      </Modal.Footer>
    </Modal>
  );
}
