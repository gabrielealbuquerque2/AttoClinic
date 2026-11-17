import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap';
import Movimentacao from './Movimentacao';
import NovoMaterial from './NovoMaterial';
import AppLayout from '../../components/AppLayout';
import Campo from '../../components/Campo';
import PageHeader from '../../components/PageHeader';
import IndicatorCard from '../../components/IndicatorCard';
import StatusBadge from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';

const DIAS_ALERTA_VALIDADE = 30;

function adaptarMaterial(material) {
  return {
    ...material,
    id: material.id_material,
    quantidade: Number(material.qtd_disponivel),
    unidade: material.unidade_medida,
    quantidadeMinima: Number(material.qtd_minima),
    validade: material.data_validade,
  };
}

function adaptarMovimentacao(item) {
  return {
    ...item,
    id: item.id_movimentacao,
    material: item.nome_material,
    tipo: item.tipo_movimentacao.toLowerCase() === 'entrada' ? 'entrada' : 'saida',
    data: item.data_movimentacao,
    usuario: item.nome_usuario || '—',
  };
}

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
  const [materiais, setMateriais] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [modal, setModal] = useState(null);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [materialMovimentadoId, setMaterialMovimentadoId] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(async () => {
    try {
      const [listaMateriais, listaHistorico] = await Promise.all([
        api.get('/materiais/lista'),
        api.get('/estoque/movimentacoes/historico'),
      ]);
      setMateriais(listaMateriais.data.map(adaptarMaterial));
      setHistorico(listaHistorico.data.map(adaptarMovimentacao));
      setErro('');
    } catch (e) {
      setErro(mensagemDeErro(e, 'Erro ao carregar o estoque.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

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

  async function salvarMaterial(dados) {
    if (materialEditando) {
      await api.put(`/materiais/put/${materialEditando.id_material}`, dados);
      setMensagem('Material atualizado com sucesso.');
    } else {
      await api.post('/materiais/post', dados);
      setMensagem('Material cadastrado com sucesso.');
    }
    setModal(null);
    setMaterialEditando(null);
    await carregar();
  }

  async function excluirMaterial(materialId) {
    await api.delete(`/materiais/delete/${materialId}`);
    setMensagem('Material excluído com sucesso.');
    setModal(null);
    setMaterialEditando(null);
    await carregar();
  }

  async function registrarMovimentacao(movimentacao) {
    await api.post('/estoque/movimentacoes/registrar', {
      id_material: movimentacao.materialId,
      tipo_movimentacao: movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída',
      quantidade: movimentacao.quantidade,
      data_movimentacao: movimentacao.data,
      motivo: movimentacao.motivo,
      observacao: movimentacao.observacao,
    });
    setMensagem('Movimentação registrada com sucesso.');
    setModal(null);
    setMaterialMovimentadoId('');
    await carregar();
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

      {erro && <Alert variant="danger">{erro}</Alert>}

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
          <Campo
            id="estoque-filtro"
            label="Filtrar por status"
            labelClassName="small text-secondary mb-0 text-nowrap"
            className="d-flex align-items-center gap-2 mb-0"
            tipo="select"
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
          </Campo>
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
            {carregando && (
              <tr>
                <td colSpan="9" className="text-center text-secondary py-4">
                  Carregando estoque...
                </td>
              </tr>
            )}
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
            {!carregando && materiaisFiltrados.length === 0 && (
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
