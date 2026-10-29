import { useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import Button from "../../components/button"; 

function Pacientes() {
  const [pacientes, setPacientes] = useState([
    { id: "1", nome: "Maria Clara Oliveira Santos", email: "mariaclara@email.com", cpf: "345.678.901-23", telefone: "(11) 98765-4321", ultimaConsulta: "15/08/2025", status: "Ativo", iniciais: "MC", corBg: "#e91e63" },
    { id: "2", nome: "Pedro Henrique Souza", email: "pedrohs@email.com", cpf: "234.567.890-12", telefone: "(11) 97654-3210", ultimaConsulta: "10/08/2025", status: "Ativo", iniciais: "PH", corBg: "#2196f3" },
    { id: "3", nome: "Ana Paula Costa Lima", email: "anapaula@email.com", cpf: "456.789.012-34", telefone: "(11) 96543-2109", ultimaConsulta: "05/08/2025", status: "Ativo", iniciais: "AP", corBg: "#9c27b0" },
    { id: "4", nome: "João Carlos Ferreira", email: "joaoferreira@email.com", cpf: "567.890.123-45", telefone: "(11) 95432-1098", ultimaConsulta: "28/07/2025", status: "Inativo", iniciais: "JC", corBg: "#ff9800" },
    { id: "5", nome: "Fernanda Rocha Alves", email: "fernandarocha@email.com", cpf: "678.901.234-56", telefone: "(11) 94321-0987", ultimaConsulta: "20/07/2025", status: "Ativo", iniciais: "FR", corBg: "#00bcd4" }
  ]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const navigate = useNavigate();

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const correspondeBusca = paciente.nome.toLowerCase().includes(busca.toLowerCase()) || paciente.cpf.includes(busca) || paciente.email.toLowerCase().includes(busca.toLowerCase());
    const correspondeStatus = filtroStatus === "Todos" ? true : paciente.status === filtroStatus;
    return correspondeBusca && correspondeStatus;
  });

  return (
    <div style={{ padding: "24px", backgroundColor: "#f4f6f9", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Pacientes</h1>
          <span style={{ color: "#666", fontSize: "14px" }}>{pacientesFiltrados.length} pacientes cadastrados</span>
        </div>
        <Button label="+ Novo Paciente" />
      </div>

      {/* Painel de busca e filtros */}
      <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "10px", marginBottom: "20px", display: "flex", gap: "12px" }}>
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou e-mail..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "6px" }}>
          {["Todos", "Ativo", "Inativo"].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              style={{
                border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold",
                backgroundColor: filtroStatus === status ? "#1d4ed8" : "transparent",
                color: filtroStatus === status ? "#fff" : "#666"
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de listagem */}
      <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ddd", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd", color: "#666", textTransform: "uppercase", fontSize: "12px" }}>
              <th style={{ padding: "16px" }}>Paciente</th>
              <th style={{ padding: "16px" }}>CPF</th>
              <th style={{ padding: "16px" }}>Telefone</th>
              <th style={{ padding: "16px" }}>Última Consulta</th>
              <th style={{ padding: "16px" }}>Status</th>
              <th style={{ padding: "16px", textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((paciente) => (
              <tr key={paciente.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: paciente.corBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {paciente.iniciais}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{paciente.nome}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{paciente.email}</div>
                  </div>
                </td>
                <td style={{ padding: "16px" }}>{paciente.cpf}</td>
                <td style={{ padding: "16px" }}>{paciente.telefone}</td>
                <td style={{ padding: "16px" }}>{paciente.ultimaConsulta}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: paciente.status === "Ativo" ? "#dcfce7" : "#f1f5f9", color: paciente.status === "Ativo" ? "#15803d" : "#666" }}>
                    {paciente.status}
                  </span>
                </td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <button onClick={() => navigate("/prontuarios")} style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginRight: "8px" }}>
                    Prontuário
                  </button>
                  <button style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Pacientes;