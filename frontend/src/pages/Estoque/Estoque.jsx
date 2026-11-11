import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import Movimentacao from './Movimentacao';
import NovoMaterial from './NovoMaterial';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import IndicatorCard from '../../components/IndicatorCard';
import StatusBadge from '../../components/StatusBadge';

const DIAS_ALERTA_VALIDADE = 30;

function dataRelativa(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

const materiaisDemonstrativos = [
  {
    id: 1,
    nome: 'Luva nitrílica descartável',
    categoria: 'Descartáveis',
    quantidade: 240,
    unidade: 'un',
    quantidadeMinima: 80,
    validade: dataRelativa(180),
    fornecedor: 'Dental Supply',
  },
  {
    id: 2,
    nome: 'Resina composta A2',
    categoria: 'Materiais Restauradores',
    quantidade: 6,
    unidade: 'ser',
    quantidadeMinima: 10,
    validade: dataRelativa(120),
    fornecedor: 'Odonto Premium',
  },
  {
    id: 3,
    nome: 'Anestésico lidocaína 2%',
    categoria: 'Anestésicos',
    quantidade: 18,
    unidade: 'cx',
    quantidadeMinima: 8,
    validade: dataRelativa(18),
    fornecedor: 'MedDental',
  },
  {
    id: 4,
    nome: 'Máscara cirúrgica tripla',
    categoria: 'Descartáveis',
    quantidade: 0,
    unidade: 'un',
    quantidadeMinima: 50,
    validade: dataRelativa(300),
    fornecedor: 'Dental Supply',
  },
  {
    id: 5,
    nome: 'Gaze estéril 7,5 cm',
    categoria: 'Higiene',
    quantidade: 130,
    unidade: 'pct',
    quantidadeMinima: 40,
    validade: dataRelativa(240),
    fornecedor: 'Cirúrgica Central',
  },
  {
    id: 6,
    nome: 'Agulha gengival curta',
    categoria: 'Descartáveis',
    quantidade: 42,
    unidade: 'cx',
    quantidadeMinima: 20,
    validade: dataRelativa(12),
    fornecedor: 'MedDental',
  },
  {
    id: 7,
    nome: 'Cimento de ionômero de vidro',
    categoria: 'Materiais Restauradores',
    quantidade: 15,
    unidade: 'un',
    quantidadeMinima: 5,
    validade: dataRelativa(-8),
    fornecedor: 'Odonto Premium',
  },
];

function diasAteValidade(validade) {
  if (!validade) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${validade}T00:00:00`) - hoje) / 86400000);
}

function obterStatus(material) {
  const dias = diasAteValidade(material.validade);
  if (dias !== null && dias < 0) return 'Vencido';
  if (Number(material.quantidade) === 0) return 'Esgotado';
  if (Number(material.quantidade) < Number(material.quantidadeMinima)) {
    return 'Estoque Baixo';
  }
  if (dias !== null && dias <= DIAS_ALERTA_VALIDADE) return 'Próximo da Validade';
  return 'Normal';
}

function formatarData(data) {
  if (!data) return '—';
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
}

export default function Estoque() {
  const [materiais, setMateriais] = useState(materiaisDemonstrativos);
  const [historico, setHistorico] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [modal, setModal] = useState(null);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [materialMovimentadoId, setMaterialMovimentadoId] = useState('');
  const [mensagem, setMensagem] = useState('');

  const materiaisComStatus = materiais.map((material) => ({
    ...material,
    status: obterStatus(material),
  }));
  const materiaisFiltrados =
    filtroStatus === 'Todos os status'
      ? materiaisComStatus
      : materiaisComStatus.filter((material) => material.status === filtroStatus);

  const indicadores = [
    {
      titulo: 'Total de Materiais',
      valor: materiais.length,
      auxiliar: 'itens cadastrados',
      icone: '▦',
      tom: 'primary',
    },
    {
      titulo: 'Estoque Baixo',
      valor: materiaisComStatus.filter((material) => material.status === 'Estoque Baixo').length,
      auxiliar: 'abaixo do mínimo',
      icone: '!',
      tom: 'warning',
    },
    {
      titulo: 'Próx. da Validade',
      valor: materiais.filter((material) => {
        const dias = diasAteValidade(material.validade);
        return dias !== null && dias >= 0 && dias <= DIAS_ALERTA_VALIDADE;
      }).length,
      auxiliar: `vencem em até ${DIAS_ALERTA_VALIDADE} dias`,
      icone: '◷',
      tom: 'info',
    },
    {
      titulo: 'Esgotados',
      valor: materiais.filter((material) => Number(material.quantidade) === 0).length,
      auxiliar: 'sem unidades disponíveis',
      icone: '×',
      tom: 'danger',
    },
  ];

  function abrirNovoMaterial() {
    setMensagem('');
    setMaterialEditando(null);
    setModal('material');
  }

  function salvarMaterial(dados) {
    if (materialEditando) {
      setMateriais((atuais) =>
        atuais.map((material) =>
          material.id === materialEditando.id
            ? { ...material, ...dados }
            : material
        )
      );
      setMensagem('Material atualizado nesta sessão.');
    } else {
      setMateriais((atuais) => [...atuais, { ...dados, id: Date.now() }]);
      setMensagem('Material cadastrado nesta sessão.');
    }
    setModal(null);
    setMaterialEditando(null);
  }

  function excluirMaterial(materialId) {
    setMateriais((atuais) => atuais.filter((material) => material.id !== materialId));
    setMensagem('Material excluído nesta sessão.');
    setModal(null);
    setMaterialEditando(null);
  }

  function registrarMovimentacao(movimentacao) {
    setMateriais((atuais) =>
      atuais.map((material) => {
        if (material.id !== movimentacao.materialId) return material;
        const variacao =
          movimentacao.tipo === 'entrada'
            ? movimentacao.quantidade
            : -movimentacao.quantidade;
        return { ...material, quantidade: Number(material.quantidade) + variacao };
      })
    );
    setHistorico((atuais) => [
      { ...movimentacao, id: Date.now(), usuario: 'Usuário atual' },
      ...atuais,
    ]);
    setMensagem('Movimentação registrada nesta sessão.');
    setModal(null);
    setMaterialMovimentadoId('');
  }

  function abrirMovimentacao(materialId = '') {
    setMensagem('');
    setMaterialMovimentadoId(String(materialId));
    setModal('movimentacao');
  }

  function fecharModal() {
    setModal(null);
    setMaterialEditando(null);
    setMaterialMovimentadoId('');
  }

  return (
    <AppLayout>
      <PageHeader titulo="Estoque" subtitulo="Materiais odontológicos">
        <Button variant="outline-secondary" onClick={() => abrirMovimentacao()}>
          <span aria-hidden="true">↕</span> Movimentação
        </Button>
        <Button onClick={abrirNovoMaterial}>
          <span aria-hidden="true">+</span> Novo Material
        </Button>
      </PageHeader>

      {mensagem && (
        <Alert
          variant="success"
          role="status"
          className="py-2"
          dismissible
          onClose={() => setMensagem('')}
        >
          {mensagem}
        </Alert>
      )}

      <Row className="g-3 mb-4" aria-label="Indicadores do estoque">
        {indicadores.map((indicador) => (
          <Col key={indicador.titulo} xs={12} sm={6} xl={3}>
            <IndicatorCard
              icone={indicador.icone}
              tom={indicador.tom}
              titulo={indicador.titulo}
              valor={indicador.valor}
              detalhe={indicador.auxiliar}
            />
          </Col>
        ))}
      </Row>

      <Card>
        <Card.Header className="bg-white d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
          <div>
            <h2 className="fs-5 fw-bold mb-0">Materiais em Estoque</h2>
            <small className="text-secondary">{materiaisFiltrados.length} materiais exibidos</small>
          </div>
          <Form.Group controlId="estoque-filtro" className="d-flex align-items-center gap-2">
            <Form.Label className="small text-secondary mb-0 text-nowrap">Filtrar por status</Form.Label>
            <Form.Select
              size="sm"
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option>Todos os status</option>
              <option>Normal</option>
              <option>Estoque Baixo</option>
              <option>Próximo da Validade</option>
              <option>Esgotado</option>
              <option>Vencido</option>
            </Form.Select>
          </Form.Group>
        </Card.Header>

        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Material</th>
              <th>Categoria</th>
              <th>QTD</th>
              <th>UN</th>
              <th>MÍN</th>
              <th>Validade</th>
              <th>Fornecedor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {materiaisFiltrados.map((material) => (
              <tr key={material.id}>
                <td className="fw-semibold">{material.nome}</td>
                <td>{material.categoria}</td>
                <td
                  className={`fw-bold ${
                    material.quantidade === 0
                      ? 'text-danger'
                      : material.quantidade < material.quantidadeMinima
                        ? 'text-warning-emphasis'
                        : ''
                  }`}
                >
                  {material.quantidade}
                </td>
                <td>{material.unidade}</td>
                <td>{material.quantidadeMinima}</td>
                <td>{formatarData(material.validade)}</td>
                <td>{material.fornecedor || '—'}</td>
                <td><StatusBadge status={material.status} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      aria-label={`Editar ${material.nome}`}
                      title="Editar material"
                      onClick={() => {
                        setMaterialEditando(material);
                        setMensagem('');
                        setModal('material');
                      }}
                    >
                      ✎
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      aria-label={`Movimentar estoque de ${material.nome}`}
                      title="Movimentar estoque"
                      onClick={() => abrirMovimentacao(material.id)}
                    >
                      ↕
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {materiaisFiltrados.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-secondary py-4">
                  Nenhum material encontrado para este status.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {modal === 'material' && (
        <NovoMaterial
          material={materialEditando}
          onClose={fecharModal}
          onSave={salvarMaterial}
          onDelete={excluirMaterial}
        />
      )}
      {modal === 'movimentacao' && (
        <Movimentacao
          materiais={materiais}
          historico={historico}
          materialInicialId={materialMovimentadoId}
          onClose={fecharModal}
          onRegister={registrarMovimentacao}
        />
      )}
    </AppLayout>
  );
}
