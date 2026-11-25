import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import AppLayout from '../../components/AppLayout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import api, { mensagemDeErro } from '../../services/api';
import { formatarData, formatarHora, formatarMoeda } from '../../utils/formatar';

const relatorios = [
  { chave: 'pacientes', icone: '👥', fundo: '#e0e7ff', cor: '#3730a3', titulo: 'Relatório de Pacientes', descricao: 'Total de pacientes cadastrados e pacientes atendidos no período' },
  { chave: 'consultas', icone: '📅', fundo: '#d1fae5', cor: '#065f46', titulo: 'Relatório de Consultas', descricao: 'Consultas realizadas, agendadas e canceladas por período' },
  { chave: 'financeiro', icone: '💰', fundo: '#fef3c7', cor: '#92400e', titulo: 'Relatório Financeiro', descricao: 'Receitas, despesas, saldos e pagamentos pendentes' },
  { chave: 'estoque', icone: '📦', fundo: '#ffedd5', cor: '#9a3412', titulo: 'Relatório de Estoque', descricao: 'Situação atual dos materiais: esgotados, estoque baixo e validade' },
];

function renderizarCelula(coluna, valor) {
  switch (coluna.tipo) {
    case 'data': return formatarData(valor);
    case 'hora': return formatarHora(valor);
    case 'moeda': return formatarMoeda(valor);
    case 'status': return valor ? <StatusBadge status={valor} /> : '—';
    default: return valor ?? '—';
  }
}

export default function Relatorios() {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [carregando, setCarregando] = useState(null); // chave do relatório em geração
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null); // { titulo, chave, dados }

  async function gerar(relatorio) {
    setCarregando(relatorio.chave);
    setErro('');

    try {
      const { data } = await api.get(`/relatorios/${relatorio.chave}`, {
        params: { dataInicial: dataInicial || undefined, dataFinal: dataFinal || undefined },
      });
      setResultado({ chave: relatorio.chave, titulo: relatorio.titulo, dados: data });
    } catch (e) {
      setResultado(null);
      setErro(mensagemDeErro(e, 'Erro ao gerar o relatório.'));
    } finally {
      setCarregando(null);
    }
  }

  const periodoInvalido = dataInicial && dataFinal && dataInicial > dataFinal;

  return (
    <AppLayout>
      <div className="small text-secondary mb-3">
        OdontoGestão / <strong className="text-body">Relatórios</strong>
      </div>

      <PageHeader
        titulo="Relatórios Consolidados"
        subtitulo="Visualize e exporte informações consolidadas do consultório"
      >
        {resultado && <Button variant="outline-secondary" onClick={() => window.print()}>🖨️ Imprimir / PDF</Button>}
      </PageHeader>

      <Card className="mb-4">
        <Card.Body>
          <div className="small fw-bold text-secondary text-uppercase mb-3">Filtros de data</div>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group controlId="data-inicial">
                <Form.Label className="small fw-semibold">Data Inicial:</Form.Label>
                <Form.Control type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="data-final">
                <Form.Label className="small fw-semibold">Data Final:</Form.Label>
                <Form.Control type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          {periodoInvalido && (
            <div className="small text-danger mt-2">A data inicial não pode ser maior que a final.</div>
          )}
          <div className="small text-secondary mt-2">
            Sem datas, o relatório considera todo o período. O de estoque mostra sempre a situação atual.
          </div>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} xl={4} className="g-3 mb-4">
        {relatorios.map((relatorio) => (
          <Col key={relatorio.chave}>
            <Card className="h-100 text-center">
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <div>
                  <div
                    className="indicador-icone mx-auto mb-3"
                    style={{ background: relatorio.fundo, color: relatorio.cor }}
                  >
                    {relatorio.icone}
                  </div>
                  <Card.Title as="h3" className="fs-6 fw-bold">{relatorio.titulo}</Card.Title>
                  <Card.Text className="small text-secondary">{relatorio.descricao}</Card.Text>
                </div>
                <Button
                  disabled={periodoInvalido || carregando !== null}
                  onClick={() => gerar(relatorio)}
                >
                  {carregando === relatorio.chave ? <Spinner size="sm" /> : 'Gerar Relatório'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {resultado && (
        <Card className="relatorio-impressao">
          <Card.Body>
            <Card.Title as="h3" className="fs-5 fw-bold">{resultado.titulo}</Card.Title>
            <div className="small text-secondary mb-3">
              {dataInicial || dataFinal
                ? `Período: ${dataInicial ? formatarData(dataInicial) : 'início'} a ${dataFinal ? formatarData(dataFinal) : 'hoje'}`
                : 'Período: todo o histórico'}
            </div>

            <Row xs={2} md={3} xl={5} className="g-3 mb-4">
              {resultado.dados.resumo.map((item) => (
                <Col key={item.rotulo}>
                  <div className="border rounded p-3 h-100">
                    <div className="small text-secondary">{item.rotulo}</div>
                    <div className="fs-4 fw-bold">
                      {item.formato === 'moeda' ? formatarMoeda(item.valor) : item.valor}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            <Table responsive hover size="sm" className="align-middle mb-0">
              <thead>
                <tr>
                  {resultado.dados.colunas.map((coluna) => (
                    <th key={coluna.campo}>{coluna.rotulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultado.dados.linhas.length === 0 && (
                  <tr>
                    <td colSpan={resultado.dados.colunas.length} className="text-center text-secondary py-4">
                      Nenhum registro no período.
                    </td>
                  </tr>
                )}
                {resultado.dados.linhas.map((linha, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={i}>
                    {resultado.dados.colunas.map((coluna) => (
                      <td key={coluna.campo}>{renderizarCelula(coluna, linha[coluna.campo])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </AppLayout>
  );
}
