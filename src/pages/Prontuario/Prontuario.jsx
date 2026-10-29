import { useState } from "react"; // Importa o hook useState do React
import Button from "../../components/button"; // Importa o componente reutilizável subindo dois níveis de pasta

function Relatorios() {
  // Estado para guardar as datas selecionadas no filtro
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  // Lista de relatórios disponíveis na clínica
  const listaRelatorios = [
    { id: 1, titulo: "Relatório de Pacientes", desc: "Total de pacientes, novos cadastros e pacientes ativos", icone: "👥", bgIcone: "#e0e7ff" },
    { id: 2, titulo: "Relatório de Consultas", desc: "Consultas realizadas, agendadas e canceladas por período", icone: "📅", bgIcone: "#dcfce7" },
    { id: 3, titulo: "Relatório Financeiro", desc: "Receitas, despesas, saldo e pagamentos pendentes", icone: "💰", bgIcone: "#fef3c7" },
    { id: 4, titulo: "Relatório de Estoque", desc: "Materiais disponíveis, baixos, esgotados e próximos da validade", icone: "📦", bgIcone: "#ffedd5" }
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#f4f6f9", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Relatórios</h1>
        <p style={{ color: "#666", fontSize: "14px" }}>Visualize e exporte informações consolidadas do consultório</p>
      </div>

      {/* Seção de Filtros */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#666", textTransform: "uppercase", fontSize: "12px" }}>Filtros</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Data Inicial</label>
            <input
              type="date"
              value={dataInicial}
              onChange={(event) => setDataInicial(event.target.value)} // Atualiza o estado da data inicial
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Data Final</label>
            <input
              type="date"
              value={dataFinal}
              onChange={(event) => setDataFinal(event.target.value)} // Atualiza o estado da data final
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Cards de Relatórios */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
        {listaRelatorios.map((relatorio) => (
          <div key={relatorio.id} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ddd", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", backgroundColor: relatorio.bgIcone, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                {relatorio.icone}
              </div>
              <div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>{relatorio.titulo}</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{relatorio.desc}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button label="Gerar Relatório" onClick={() => alert(`A gerar ${relatorio.titulo}...`)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Relatorios;