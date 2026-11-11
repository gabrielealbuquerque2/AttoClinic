import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import NovaMovimentacao from './NovaMovimentacao';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import IndicatorCard from '../../components/IndicatorCard';
import StatusBadge from '../../components/StatusBadge';

const pacientes = [
  'Maria Clara Oliveira Santos',
  'Pedro Henrique Souza',
  'Ana Paula Costa Lima',
  'João Carlos Ferreira',
  'Fernanda Rocha Alves',
];

const lancamentosIniciais = [
  {
    id: 1,
    data: '2025-08-02',
    descricao: 'Limpeza',
    pessoa: 'Ana Paula Costa Lima',
    paciente: 'Ana Paula Costa Lima',
    procedimento: 'Limpeza',
    tipo: 'receita',
    pagamento: 'Pix',
    valor: 250,
    status: 'Pago',
  },
  {
    id: 2,
    data: '2025-08-05',
    descricao: 'Avaliação odontológica',
    pessoa: 'Pedro Henrique Souza',
    paciente: 'Pedro Henrique Souza',
    procedimento: 'Avaliação',
    tipo: 'receita',
    pagamento: 'Cartão',
    valor: 180,
    status: 'Pago',
  },
  {
    id: 3,
    data: '2025-08-08',
    descricao: 'Restauração',
    pessoa: 'Maria Clara Oliveira Santos',
    paciente: 'Maria Clara Oliveira Santos',
    procedimento: 'Restauração',
    tipo: 'receita',
    pagamento: 'Pix',
    valor: 420,
    status: 'Pendente',
  },
  {
    id: 4,
    data: '2025-08-11',
    descricao: 'Compra de materiais odontológicos',
    pessoa: 'Dental Supply',
    fornecedor: 'Dental Supply',
    categoria: 'Materiais',
    tipo: 'despesa',
    pagamento: 'Transferência',
    valor: 325,
    status: 'Pago',
  },
  {
    id: 5,
    data: '2025-08-14',
    descricao: 'Consulta de rotina',
    pessoa: 'João Carlos Ferreira',
    paciente: 'João Carlos Ferreira',
    procedimento: 'Consulta de rotina',
    tipo: 'receita',
    pagamento: 'Dinheiro',
    valor: 150,
    status: 'Pago',
  },
  {
    id: 6,
    data: '2025-08-19',
    descricao: 'Manutenção de equipamentos',
    pessoa: 'Oficina Odonto',
    fornecedor: 'Oficina Odonto',
    categoria: 'Manutenção',
    tipo: 'despesa',
    pagamento: 'Pix',
    valor: 210,
    status: 'Pendente',
  },
  {
    id: 7,
    data: '2025-07-04',
    descricao: 'Limpeza',
    pessoa: 'Fernanda Rocha Alves',
    paciente: 'Fernanda Rocha Alves',
    procedimento: 'Limpeza',
    tipo: 'receita',
    pagamento: 'Cartão',
    valor: 220,
    status: 'Pago',
  },
  {
    id: 8,
    data: '2025-07-16',
    descricao: 'Materiais clínicos',
    pessoa: 'MedDental',
    fornecedor: 'MedDental',
    categoria: 'Materiais',
    tipo: 'despesa',
    pagamento: 'Transferência',
    valor: 280,
    status: 'Pago',
  },
];

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatarMes(mes) {
  const [ano, numeroMes] = mes.split('-').map(Number);
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(ano, numeroMes - 1, 1)
  );
  return `${nomeMes.charAt(0).toUpperCase()}${nomeMes.slice(1)} ${ano}`;
}

function mesAnterior(mes) {
  const [ano, numeroMes] = mes.split('-').map(Number);
  const data = new Date(ano, numeroMes - 2, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

function totalPorTipo(lancamentos, tipo) {
  return lancamentos
    .filter((lancamento) => lancamento.tipo === tipo)
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0);
}

function formatarVariacao(atual, anterior) {
  if (!anterior) return atual ? 'Novo neste período' : 'Sem variação';
  const percentual = ((atual - anterior) / anterior) * 100;
  const prefixo = percentual > 0 ? '+' : '';
  return `${prefixo}${percentual.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}% em relação ao anterior`;
}

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState(lancamentosIniciais);
  const [mesSelecionado, setMesSelecionado] = useState('2025-08');
  const [filtroTipo, setFiltroTipo] = useState('Todos os tipos');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [modal, setModal] = useState(null);
  const [lancamentoEditando, setLancamentoEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const dadosMes = lancamentos.filter((lancamento) =>
    lancamento.data.startsWith(mesSelecionado)
  );
  const dadosMesAnterior = lancamentos.filter((lancamento) =>
    lancamento.data.startsWith(mesAnterior(mesSelecionado))
  );
  const receitas = totalPorTipo(dadosMes, 'receita');
  const despesas = totalPorTipo(dadosMes, 'despesa');
  const receitasAnterior = totalPorTipo(dadosMesAnterior, 'receita');
  const despesasAnterior = totalPorTipo(dadosMesAnterior, 'despesa');
  const pendentes = dadosMes.filter((lancamento) => lancamento.status === 'Pendente');

  const lancamentosFiltrados = dadosMes
    .filter((lancamento) =>
      filtroTipo === 'Todos os tipos' || lancamento.tipo === filtroTipo
    )
    .filter((lancamento) =>
      filtroStatus === 'Todos os status' || lancamento.status === filtroStatus
    )
    .sort((a, b) => b.data.localeCompare(a.data));

  function abrirCadastro(tipo) {
    setMensagem('');
    setLancamentoEditando(null);
    setModal(tipo);
  }

  function abrirEdicao(lancamento) {
    setMensagem('');
    setLancamentoEditando(lancamento);
    setModal(lancamento.tipo);
  }

  function salvarLancamento(dados) {
    if (lancamentoEditando) {
      setLancamentos((atuais) =>
        atuais.map((item) =>
          item.id === lancamentoEditando.id
            ? { ...item, ...dados, id: lancamentoEditando.id }
            : item
        )
      );
      setMensagem('Lançamento atualizado nesta sessão.');
    } else {
      setLancamentos((atuais) => [...atuais, { ...dados, id: Date.now() }]);
      setMensagem('Lançamento registrado nesta sessão.');
    }

    setModal(null);
    setLancamentoEditando(null);
  }

  function excluirLancamento(lancamento) {
    const confirmado = window.confirm(
      `Deseja excluir o lançamento "${lancamento.descricao}"?`
    );
    if (!confirmado) return;

    setLancamentos((atuais) =>
      atuais.filter((item) => item.id !== lancamento.id)
    );
    setMensagem('Lançamento excluído nesta sessão.');
  }

  const indicadores = [
    {
      titulo: 'Receitas do Mês',
      valor: moeda.format(receitas),
      variacao: formatarVariacao(receitas, receitasAnterior),
      icone: '↗',
      tom: 'success',
    },
    {
      titulo: 'Despesas do Mês',
      valor: moeda.format(despesas),
      variacao: formatarVariacao(despesas, despesasAnterior),
      icone: '↘',
      tom: 'danger',
    },
    {
      titulo: 'Saldo',
      valor: moeda.format(receitas - despesas),
      variacao: 'Receitas menos despesas pagas',
      icone: '=',
      tom: 'primary',
    },
    {
      titulo: 'Pagamentos Pendentes',
      valor: moeda.format(
        pendentes.reduce((total, item) => total + Number(item.valor), 0)
      ),
      variacao: `${pendentes.length} lançamento${pendentes.length === 1 ? '' : 's'} pendente${pendentes.length === 1 ? '' : 's'}`,
      icone: '◷',
      tom: 'warning',
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        titulo="Financeiro"
        subtitulo={
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span>{formatarMes(mesSelecionado)}</span>
            <Form.Control
              aria-label="Selecionar mês do financeiro"
              type="month"
              size="sm"
              className="w-auto"
              value={mesSelecionado}
              onChange={(evento) => setMesSelecionado(evento.target.value)}
            />
          </div>
        }
      >
        <Button variant="success" onClick={() => abrirCadastro('receita')}>
          + Nova Receita
        </Button>
        <Button variant="danger" onClick={() => abrirCadastro('despesa')}>
          + Nova Despesa
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

      <Row className="g-3 mb-4" aria-label="Resumo financeiro do mês">
        {indicadores.map((indicador) => (
          <Col key={indicador.titulo} xs={12} sm={6} xl={3}>
            <IndicatorCard
              icone={indicador.icone}
              tom={indicador.tom}
              titulo={indicador.titulo}
              valor={indicador.valor}
              detalhe={indicador.variacao}
            />
          </Col>
        ))}
      </Row>

      <Card>
        <Card.Header className="bg-white d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
          <div>
            <h2 className="fs-5 fw-bold mb-0">Movimentações Financeiras</h2>
            <small className="text-secondary">{lancamentosFiltrados.length} lançamentos no período</small>
          </div>
          <div className="d-flex flex-wrap gap-3">
            <Form.Group controlId="filtro-tipo" className="d-flex align-items-center gap-2">
              <Form.Label className="small text-secondary mb-0">Tipo</Form.Label>
              <Form.Select
                size="sm"
                value={filtroTipo}
                onChange={(evento) => setFiltroTipo(evento.target.value)}
              >
                <option>Todos os tipos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="filtro-status" className="d-flex align-items-center gap-2">
              <Form.Label className="small text-secondary mb-0">Status</Form.Label>
              <Form.Select
                size="sm"
                value={filtroStatus}
                onChange={(evento) => setFiltroStatus(evento.target.value)}
              >
                <option>Todos os status</option>
                <option>Pago</option>
                <option>Pendente</option>
              </Form.Select>
            </Form.Group>
          </div>
        </Card.Header>

        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Paciente / Fornecedor</th>
              <th>Tipo</th>
              <th>Pagamento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentosFiltrados.map((lancamento) => (
              <tr key={lancamento.id}>
                <td className="text-nowrap">{new Date(`${lancamento.data}T00:00:00`).toLocaleDateString('pt-BR')}</td>
                <td className="col-descricao">
                  <strong>{lancamento.descricao}</strong>
                  {lancamento.categoria && (
                    <div className="small text-secondary">{lancamento.categoria}</div>
                  )}
                </td>
                <td>{lancamento.pessoa || '—'}</td>
                <td>
                  <StatusBadge status={lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'} />
                </td>
                <td className="text-nowrap">{lancamento.pagamento || '—'}</td>
                <td
                  className={`fw-bold text-nowrap ${
                    lancamento.tipo === 'receita' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {lancamento.tipo === 'receita' ? '+ ' : '- '}
                  {moeda.format(Number(lancamento.valor))}
                </td>
                <td><StatusBadge status={lancamento.status} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      title="Editar lançamento"
                      aria-label={`Editar ${lancamento.descricao}`}
                      onClick={() => abrirEdicao(lancamento)}
                    >
                      ✎
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Excluir lançamento"
                      aria-label={`Excluir ${lancamento.descricao}`}
                      onClick={() => excluirLancamento(lancamento)}
                    >
                      ×
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {lancamentosFiltrados.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-secondary py-4">
                  Nenhuma movimentação encontrada para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {modal && (
        <NovaMovimentacao
          tipo={modal}
          lancamento={lancamentoEditando}
          pacientes={pacientes}
          onClose={() => {
            setModal(null);
            setLancamentoEditando(null);
          }}
          onSave={salvarLancamento}
        />
      )}
    </AppLayout>
  );
}
