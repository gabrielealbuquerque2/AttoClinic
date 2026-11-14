
import express from "express";
import cors from "cors";

// Importar as rotas
import pacientesRoutes from "./routes/pacientes.js";
import profissionaisRoutes from "./routes/profissionais.js";
import usuariosRoutes from "./routes/usuarios.js";
import prontuariosRoutes from "./routes/prontuarios.js";
import consultasRoutes from "./routes/consultas.js";
import receitasRoutes from "./routes/receitas.js";
import despesasRoutes from "./routes/despesas.js";
import financeiroRoutes from "./routes/financeiro.js";
import estoqueRoutes from "./routes/estoque.js";
import movimentacoesEstoqueRoutes from "./routes/movimentacoesEstoque.js";
import pagamentosRoutes from "./routes/pagamentos.js";
import procedimentosRoutes from "./routes/procedimentos.js";

const app = express();

// Configurações do servidor
app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.send("API do AttoClinic funcionando!");
});

// Rotas de pacientes
app.use("/pacientes", pacientesRoutes);

// Rotas de profissionais
app.use("/profissionais", profissionaisRoutes);

// Rotas de usuários
app.use("/usuarios", usuariosRoutes);

// Rotas de prontuários
app.use("/prontuarios", prontuariosRoutes);

// Rotas de consultas
app.use("/consultas", consultasRoutes);

// Rotas financeiras
app.use("/receitas", receitasRoutes);
app.use("/despesas", despesasRoutes);
app.use("/financeiro", financeiroRoutes);

// Rotas de estoque
app.use("/materiais", estoqueRoutes);
app.use("/estoque/movimentacoes", movimentacoesEstoqueRoutes);

// Rotas de pagamentos
app.use("/pagamentos", pagamentosRoutes);

// Rotas de procedimentos
app.use("/procedimentos", procedimentosRoutes);

// Inicializar o servidor
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor AttoClinic rodando em http://localhost:${PORT}`);
});