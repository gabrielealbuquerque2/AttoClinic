import express from "express";
import cors from "cors";
import pacientesRoutes from "./routes/pacientes.js";
import profissionaisRoutes from "./routes/profissionais.js";
import usuariosRoutes from "./routes/usuarios.js";
import prontuariosRoutes from "./routes/prontuarios.js";
import consultasRoutes from "./routes/consultas.js";
import receitasRoutes from "./routes/receitas.js";
import despesasRoutes from "./routes/despesas.js";
import financeiroRoutes from "./routes/financeiro.js";
import estoqueRoutes from "./routes/estoque.js";
import movimentacoesEstoqueRoutes from "./routes/movimentacao.js";
import pagamentosRoutes from "./routes/pagamentos.js";
import procedimentosRoutes from "./routes/procedimentos.js";
import dashboardRoutes from "./routes/dashboard.js";
import relatoriosRoutes from "./routes/relatorios.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API do AttoClinic funcionando!");
});

app.use("/pacientes", pacientesRoutes);
app.use("/profissionais", profissionaisRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/prontuarios", prontuariosRoutes);
app.use("/consultas", consultasRoutes);
app.use("/receitas", receitasRoutes);
app.use("/despesas", despesasRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/materiais", estoqueRoutes);
app.use("/estoque/movimentacoes", movimentacoesEstoqueRoutes);
app.use("/pagamentos", pagamentosRoutes);
app.use("/procedimentos", procedimentosRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/relatorios", relatoriosRoutes);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Servidor AttoClinic rodando em http://localhost:${PORT}`);
});