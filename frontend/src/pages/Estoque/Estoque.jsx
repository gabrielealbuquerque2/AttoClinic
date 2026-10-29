import { useState } from 'react';
import Movimentacao from './Movimentacao';
import NovoMaterial from './NovoMaterial';

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

function classeStatus(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
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
      cor: 'azul',
    },
    {
      titulo: 'Estoque Baixo',
      valor: materiaisComStatus.filter((material) => material.status === 'Estoque Baixo').length,
      auxiliar: 'abaixo do mínimo',
      icone: '!',
      cor: 'laranja',
    },
    {
      titulo: 'Próx. da Validade',
      valor: materiais.filter((material) => {
        const dias = diasAteValidade(material.validade);
        return dias !== null && dias >= 0 && dias <= DIAS_ALERTA_VALIDADE;
      }).length,
      auxiliar: `vencem em até ${DIAS_ALERTA_VALIDADE} dias`,
      icone: '◷',
      cor: 'amarelo',
    },
    {
      titulo: 'Esgotados',
      valor: materiais.filter((material) => Number(material.quantidade) === 0).length,
      auxiliar: 'sem unidades disponíveis',
      icone: '×',
      cor: 'vermelho',
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
    <main className="estoque-page">
      <header className="estoque-header">
        <div>
          <h1>Estoque</h1>
          <p>Materiais odontológicos</p>
        </div>
        <div className="estoque-acoes">
          <button
            className="estoque-botao estoque-botao-secundario"
            type="button"
            onClick={() => abrirMovimentacao()}
          >
            <span aria-hidden="true">↕</span>
            Movimentação
          </button>
          <button
            className="estoque-botao estoque-botao-principal"
            type="button"
            onClick={abrirNovoMaterial}
          >
            <span aria-hidden="true">+</span>
            Novo Material
          </button>
        </div>
      </header>

      {mensagem && <p className="estoque-mensagem" role="status">{mensagem}</p>}

      <section className="estoque-indicadores" aria-label="Indicadores do estoque">
        {indicadores.map((indicador) => (
          <article className="estoque-card-indicador" key={indicador.titulo}>
            <span
              className={`estoque-icone estoque-icone-${indicador.cor}`}
              aria-hidden="true"
            >
              {indicador.icone}
            </span>
            <div className="estoque-indicador-conteudo">
              <span className="estoque-indicador-titulo">{indicador.titulo}</span>
              <strong>{indicador.valor}</strong>
              <small>{indicador.auxiliar}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="estoque-tabela-container">
        <header className="estoque-tabela-cabecalho">
          <div>
            <h2>Materiais em Estoque</h2>
            <p>{materiaisFiltrados.length} materiais exibidos</p>
          </div>
          <label className="estoque-filtro">
            <span>Filtrar por status</span>
            <select
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
              aria-label="Filtrar materiais por status"
            >
              <option>Todos os status</option>
              <option>Normal</option>
              <option>Estoque Baixo</option>
              <option>Próximo da Validade</option>
              <option>Esgotado</option>
              <option>Vencido</option>
            </select>
          </label>
        </header>

        <div className="estoque-tabela-rolagem">
          <table className="estoque-tabela">
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
                  <td className="estoque-nome-material">{material.nome}</td>
                  <td>{material.categoria}</td>
                  <td
                    className={`estoque-quantidade ${
                      material.quantidade === 0
                        ? 'estoque-quantidade-zero'
                        : material.quantidade < material.quantidadeMinima
                          ? 'estoque-quantidade-baixa'
                          : ''
                    }`}
                  >
                    {material.quantidade}
                  </td>
                  <td>{material.unidade}</td>
                  <td>{material.quantidadeMinima}</td>
                  <td>{formatarData(material.validade)}</td>
                  <td>{material.fornecedor || '—'}</td>
                  <td>
                    <span
                      className={`estoque-status estoque-status-${classeStatus(material.status)}`}
                    >
                      {material.status}
                    </span>
                  </td>
                  <td>
                    <div className="estoque-acoes-linha">
                      <button
                        className="estoque-acao-icone"
                        type="button"
                        aria-label={`Editar ${material.nome}`}
                        title="Editar material"
                        onClick={() => {
                          setMaterialEditando(material);
                          setMensagem('');
                          setModal('material');
                        }}
                      >
                        ✎
                      </button>
                      <button
                        className="estoque-acao-icone estoque-acao-movimentar"
                        type="button"
                        aria-label={`Movimentar estoque de ${material.nome}`}
                        title="Movimentar estoque"
                        onClick={() => abrirMovimentacao(material.id)}
                      >
                        ↕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materiaisFiltrados.length === 0 && (
                <tr>
                  <td className="estoque-vazio" colSpan="9">
                    Nenhum material encontrado para este status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
    </main>
  );
}
