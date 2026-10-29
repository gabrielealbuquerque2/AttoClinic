import { useState } from 'react';
import NovaMovimentacao from './NovaMovimentacao';

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

function classeTipo(tipo) {
  return `financeiro-tipo financeiro-tipo-${tipo}`;
}

function classeStatus(status) {
  return `financeiro-status financeiro-status-${status.toLowerCase()}`;
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
      cor: 'receita',
    },
    {
      titulo: 'Despesas do Mês',
      valor: moeda.format(despesas),
      variacao: formatarVariacao(despesas, despesasAnterior),
      icone: '↘',
      cor: 'despesa',
    },
    {
      titulo: 'Saldo',
      valor: moeda.format(receitas - despesas),
      variacao: 'Receitas menos despesas pagas',
      icone: '=',
      cor: 'saldo',
    },
    {
      titulo: 'Pagamentos Pendentes',
      valor: moeda.format(
        pendentes.reduce((total, item) => total + Number(item.valor), 0)
      ),
      variacao: `${pendentes.length} lançamento${pendentes.length === 1 ? '' : 's'} pendente${pendentes.length === 1 ? '' : 's'}`,
      icone: '◷',
      cor: 'pendente',
    },
  ];

  return (
    <main className="financeiro-page">
      <header className="financeiro-header">
        <div>
          <h1>Financeiro</h1>
          <div className="financeiro-mes">
            <p>{formatarMes(mesSelecionado)}</p>
            <input
              aria-label="Selecionar mês do financeiro"
              type="month"
              value={mesSelecionado}
              onChange={(evento) => setMesSelecionado(evento.target.value)}
            />
          </div>
        </div>
        <div className="financeiro-acoes">
          <button
            className="financeiro-botao financeiro-botao-receita"
            type="button"
            onClick={() => abrirCadastro('receita')}
          >
            + Nova Receita
          </button>
          <button
            className="financeiro-botao financeiro-botao-despesa"
            type="button"
            onClick={() => abrirCadastro('despesa')}
          >
            + Nova Despesa
          </button>
        </div>
      </header>

      {mensagem && <p className="financeiro-mensagem" role="status">{mensagem}</p>}

      <section className="financeiro-indicadores" aria-label="Resumo financeiro do mês">
        {indicadores.map((indicador) => (
          <article className={`financeiro-card financeiro-card-${indicador.cor}`} key={indicador.titulo}>
            <span className={`financeiro-icone financeiro-icone-${indicador.cor}`} aria-hidden="true">
              {indicador.icone}
            </span>
            <div className="financeiro-card-conteudo">
              <span className="financeiro-card-titulo">{indicador.titulo}</span>
              <strong>{indicador.valor}</strong>
              <small>{indicador.variacao}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="financeiro-tabela-container">
        <header className="financeiro-tabela-header">
          <div>
            <h2>Movimentações Financeiras</h2>
            <p>{lancamentosFiltrados.length} lançamentos no período</p>
          </div>
          <div className="financeiro-filtros">
            <label>
              <span>Tipo</span>
              <select value={filtroTipo} onChange={(evento) => setFiltroTipo(evento.target.value)}>
                <option>Todos os tipos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={filtroStatus} onChange={(evento) => setFiltroStatus(evento.target.value)}>
                <option>Todos os status</option>
                <option>Pago</option>
                <option>Pendente</option>
              </select>
            </label>
          </div>
        </header>

        <div className="financeiro-tabela-rolagem">
          <table className="financeiro-tabela">
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
                  <td>{new Date(`${lancamento.data}T00:00:00`).toLocaleDateString('pt-BR')}</td>
                  <td className="financeiro-descricao">
                    <strong>{lancamento.descricao}</strong>
                    {lancamento.categoria && <small>{lancamento.categoria}</small>}
                  </td>
                  <td>{lancamento.pessoa || '—'}</td>
                  <td><span className={classeTipo(lancamento.tipo)}>{lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
                  <td>{lancamento.pagamento || '—'}</td>
                  <td className={`financeiro-valor financeiro-valor-${lancamento.tipo}`}>
                    {lancamento.tipo === 'receita' ? '+ ' : '- '}
                    {moeda.format(Number(lancamento.valor))}
                  </td>
                  <td><span className={classeStatus(lancamento.status)}>{lancamento.status}</span></td>
                  <td>
                    <div className="financeiro-acoes-linha">
                      <button
                        className="financeiro-acao financeiro-acao-editar"
                        type="button"
                        title="Editar lançamento"
                        aria-label={`Editar ${lancamento.descricao}`}
                        onClick={() => abrirEdicao(lancamento)}
                      >
                        ✎
                      </button>
                      <button
                        className="financeiro-acao financeiro-acao-excluir"
                        type="button"
                        title="Excluir lançamento"
                        aria-label={`Excluir ${lancamento.descricao}`}
                        onClick={() => excluirLancamento(lancamento)}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lancamentosFiltrados.length === 0 && (
                <tr>
                  <td className="financeiro-vazio" colSpan="8">
                    Nenhuma movimentação encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
    </main>
  );
}