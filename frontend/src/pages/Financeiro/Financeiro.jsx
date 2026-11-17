import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap';
import NovaMovimentacao from './NovaMovimentacao';
import AppLayout from '../../components/AppLayout';
import Campo from '../../components/Campo';
import PageHeader from '../../components/PageHeader';
import IndicatorCard from '../../components/IndicatorCard';
import StatusBadge from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';
import { formatarData, formatarMoeda, mesAtual } from '../../utils/formatar';

const resumoVazio = {
  receitas_mes: 0,
  despesas_mes: 0,
  saldo: 0,
  pagamentos_pendentes: 0,
  quantidade_pendentes: 0,
  variacao_receitas: null,
  variacao_despesas: null,
};

function formatarMes(mes) {
  const [ano, numeroMes] = mes.split('-').map(Number);
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(ano, numeroMes - 1, 1)
  );
  return `${nomeMes.charAt(0).toUpperCase()}${nomeMes.slice(1)} ${ano}`;
}

// variacao vem do back em % (ou null quando o mês anterior foi zero)
function formatarVariacao(variacao) {
  if (variacao === null || variacao === undefined) return 'Sem dados do mês anterior';
  const prefixo = variacao > 0 ? '+' : '';
  return `${prefixo}${Number(variacao).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}% em relação ao anterior`;
}

// Receita e despesa têm ids independentes, então a rota depende do tipo
function rotaDoTipo(tipo) {
  return tipo === 'receita' ? '/receitas' : '/despesas';
}

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState(resumoVazio);
  const [pacientes, setPacientes] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual());
  const [filtroTipo, setFiltroTipo] = useState('Todos os tipos');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null);
  const [lancamentoEditando, setLancamentoEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const ultimaRequisicao = useRef(0);

  const carregar = useCallback(async () => {
    // se o mês mudar rápido, ignora respostas antigas
    const numero = ++ultimaRequisicao.current;
    try {
      const [lista, resumoMes] = await Promise.all([
        api.get('/financeiro/movimentacoes', { params: { mes: mesSelecionado } }),
        api.get('/financeiro/resumo', { params: { mes: mesSelecionado } }),
      ]);
      if (numero !== ultimaRequisicao.current) return;
      setLancamentos(lista.data);
      setResumo(resumoMes.data);
      setErro('');
    } catch (e) {
      if (numero !== ultimaRequisicao.current) return;
      setErro(mensagemDeErro(e, 'Erro ao carregar o financeiro.'));
    } finally {
      if (numero === ultimaRequisicao.current) setCarregando(false);
    }
  }, [mesSelecionado]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Listas usadas no formulário de receita
  useEffect(() => {
    async function carregarCadastros() {
      try {
        const [listaPacientes, listaProcedimentos] = await Promise.all([
          api.get('/pacientes/buscar'),
          api.get('/procedimentos/buscar'),
        ]);
        setPacientes(listaPacientes.data);
        setProcedimentos(listaProcedimentos.data);
      } catch (e) {
        setErro(mensagemDeErro(e, 'Erro ao carregar pacientes e procedimentos.'));
      }
    }
    carregarCadastros();
  }, []);

  const lancamentosFiltrados = lancamentos
    .filter((lancamento) =>
      filtroTipo === 'Todos os tipos' || lancamento.tipo.toLowerCase() === filtroTipo
    )
    .filter((lancamento) =>
      filtroStatus === 'Todos os status' ||
      String(lancamento.status).toLowerCase() === filtroStatus.toLowerCase()
    );

  function abrirCadastro(tipo) {
    setMensagem('');
    setLancamentoEditando(null);
    setModal(tipo);
  }

  function abrirEdicao(lancamento) {
    setMensagem('');
    setLancamentoEditando(lancamento);
    setModal(lancamento.tipo.toLowerCase());
  }

  function fecharModal() {
    setModal(null);
    setLancamentoEditando(null);
  }

  // O modal captura o erro lançado aqui e mostra a mensagem dentro dele.
  async function salvarLancamento(dados) {
    const rota = rotaDoTipo(modal);

    if (lancamentoEditando) {
      await api.put(`${rota}/put/${lancamentoEditando.id}`, dados);
      setMensagem('Lançamento atualizado com sucesso.');
    } else {
      await api.post(`${rota}/post`, dados);
      setMensagem('Lançamento registrado com sucesso.');
    }

    // se a data caiu em outro mês, mostra esse mês para o lançamento não "sumir"
    const dataLancamento = dados.data_receita ?? dados.data_despesa;
    const mesDoLancamento = dataLancamento.slice(0, 7);
    fecharModal();
    if (mesDoLancamento !== mesSelecionado) {
      setMesSelecionado(mesDoLancamento);
    } else {
      await carregar();
    }
  }

  async function excluirLancamento(lancamento) {
    const confirmado = window.confirm(
      `Deseja excluir o lançamento "${lancamento.descricao}"?`
    );
    if (!confirmado) return;

    try {
      await api.delete(`${rotaDoTipo(lancamento.tipo.toLowerCase())}/delete/${lancamento.id}`);
      setMensagem('Lançamento excluído com sucesso.');
      setErro('');
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Erro ao excluir lançamento.'));
    }
  }

  const indicadores = [
    {
      titulo: 'Receitas do Mês',
      valor: formatarMoeda(resumo.receitas_mes),
      variacao: formatarVariacao(resumo.variacao_receitas),
      icone: '↗',
      tom: 'success',
    },
    {
      titulo: 'Despesas do Mês',
      valor: formatarMoeda(resumo.despesas_mes),
      variacao: formatarVariacao(resumo.variacao_despesas),
      icone: '↘',
      tom: 'danger',
    },
    {
      titulo: 'Saldo',
      valor: formatarMoeda(resumo.saldo),
      variacao: 'Receitas menos despesas pagas',
      icone: '=',
      tom: 'primary',
    },
    {
      titulo: 'Pagamentos Pendentes',
      valor: formatarMoeda(resumo.pagamentos_pendentes),
      variacao: `${resumo.quantidade_pendentes} lançamento${resumo.quantidade_pendentes === 1 ? '' : 's'} pendente${resumo.quantidade_pendentes === 1 ? '' : 's'}`,
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
            <Campo
              id="financeiro-mes"
              label="Selecionar mês do financeiro"
              labelClassName="visually-hidden"
              type="month"
              size="sm"
              className="w-auto mb-0"
              value={mesSelecionado}
              onChange={(evento) => {
                // o campo fica vazio se o usuário apagar o mês
                if (evento.target.value) setMesSelecionado(evento.target.value);
              }}
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
            <Campo
              id="filtro-tipo"
              label="Tipo"
              labelClassName="small text-secondary mb-0"
              className="d-flex align-items-center gap-2 mb-0"
              tipo="select"
              size="sm"
              value={filtroTipo}
              onChange={(evento) => setFiltroTipo(evento.target.value)}
            >
              <option>Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </Campo>
            <Campo
              id="filtro-status"
              label="Status"
              labelClassName="small text-secondary mb-0"
              className="d-flex align-items-center gap-2 mb-0"
              tipo="select"
              size="sm"
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option>Todos os status</option>
              <option>Pago</option>
              <option>Pendente</option>
            </Campo>
          </div>
        </Card.Header>

        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Paciente / Categoria</th>
              <th>Tipo</th>
              <th>Pagamento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="8" className="text-center text-secondary py-4">Carregando...</td>
              </tr>
            )}
            {lancamentosFiltrados.map((lancamento) => {
              const ehReceita = lancamento.tipo.toLowerCase() === 'receita';

              return (
                <tr key={`${lancamento.tipo}-${lancamento.id}`}>
                  <td className="text-nowrap">{formatarData(lancamento.data)}</td>
                  <td className="col-descricao">
                    <strong>{lancamento.descricao}</strong>
                  </td>
                  <td>{lancamento.paciente_fornecedor || '—'}</td>
                  <td><StatusBadge status={ehReceita ? 'Receita' : 'Despesa'} /></td>
                  <td className="text-nowrap">{lancamento.tipo_pagamento || '—'}</td>
                  <td className={`fw-bold text-nowrap ${ehReceita ? 'text-success' : 'text-danger'}`}>
                    {ehReceita ? '+ ' : '- '}
                    {formatarMoeda(lancamento.valor)}
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
              );
            })}
            {!carregando && lancamentosFiltrados.length === 0 && (
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
          procedimentos={procedimentos}
          onClose={fecharModal}
          onSave={salvarLancamento}
        />
      )}
    </AppLayout>
  );
}