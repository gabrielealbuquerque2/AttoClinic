import express from "express";
import db from "../database.js";

const router = express.Router();

const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// Le e valida ?dataInicial=AAAA-MM-DD&dataFinal=AAAA-MM-DD (ambas opcionais)
function lerPeriodo(query) {
    const { dataInicial, dataFinal } = query;

    for (const valor of [dataInicial, dataFinal]) {
        if (valor && !DATA_VALIDA.test(valor)) {
            return { erro: "Datas devem estar no formato AAAA-MM-DD" };
        }
    }

    if (dataInicial && dataFinal && dataInicial > dataFinal) {
        return { erro: "A data inicial não pode ser maior que a data final" };
    }

    return { dataInicial: dataInicial || null, dataFinal: dataFinal || null };
}

// Monta o trecho " AND coluna >= ? AND coluna <= ?" conforme o periodo
function filtroPeriodo(coluna, { dataInicial, dataFinal }, valores) {
    let sql = "";

    if (dataInicial) {
        sql += ` AND ${coluna} >= ?`;
        valores.push(dataInicial);
    }

    if (dataFinal) {
        sql += ` AND ${coluna} <= ?`;
        valores.push(dataFinal);
    }

    return sql;
}

// Relatorio de pacientes
router.get("/pacientes", async (req, res) => {
    try {
        const periodo = lerPeriodo(req.query);
        if (periodo.erro) return res.status(400).json({ error: periodo.erro });

        const valores = [];
        const filtro = filtroPeriodo("consulta.data", periodo, valores);

        const [[total]] = await db.execute(`SELECT COUNT(*) AS total FROM paciente`);

        const [linhas] = await db.execute(
            `SELECT
                paciente.nome,
                paciente.cpf,
                paciente.telefone,
                COUNT(consulta.id_consulta) AS consultas,
                MAX(consulta.data) AS ultima_consulta
             FROM paciente
             INNER JOIN consulta
                ON paciente.id_paciente = consulta.id_paciente
             WHERE 1 = 1 ${filtro}
             GROUP BY paciente.id_paciente, paciente.nome, paciente.cpf, paciente.telefone
             ORDER BY consultas DESC, paciente.nome`,
            valores
        );

        res.json({
            resumo: [
                { rotulo: "Pacientes cadastrados", valor: total.total },
                { rotulo: "Pacientes com consulta no período", valor: linhas.length }
            ],
            colunas: [
                { campo: "nome", rotulo: "Paciente" },
                { campo: "cpf", rotulo: "CPF" },
                { campo: "telefone", rotulo: "Telefone" },
                { campo: "consultas", rotulo: "Consultas" },
                { campo: "ultima_consulta", rotulo: "Última consulta", tipo: "data" }
            ],
            linhas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar relatório de pacientes" });
    }
});

// Relatorio de consultas
router.get("/consultas", async (req, res) => {
    try {
        const periodo = lerPeriodo(req.query);
        if (periodo.erro) return res.status(400).json({ error: periodo.erro });

        const valores = [];
        const filtro = filtroPeriodo("consulta.data", periodo, valores);

        const [linhas] = await db.execute(
            `SELECT
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                consulta.status_consulta AS status,
                paciente.nome AS paciente,
                profissional.nome AS profissional,
                GROUP_CONCAT(
                    DISTINCT procedimento.nome_procedimento
                    SEPARATOR ', '
                ) AS procedimentos
             FROM consulta
             LEFT JOIN paciente
                ON consulta.id_paciente = paciente.id_paciente
             LEFT JOIN profissional
                ON consulta.id_profissional = profissional.id_profissional
             LEFT JOIN consulta_procedimento
                ON consulta.id_consulta = consulta_procedimento.id_consulta
             LEFT JOIN procedimento
                ON consulta_procedimento.id_procedimento = procedimento.id_procedimento
             WHERE 1 = 1 ${filtro}
             GROUP BY
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
                paciente.nome,
                profissional.nome
             ORDER BY consulta.data DESC, consulta.horario DESC`,
            valores
        );

        const realizadas = linhas.filter((c) => /^realizad/i.test(c.status)).length;
        const canceladas = linhas.filter((c) => /^cancel/i.test(c.status)).length;

        res.json({
            resumo: [
                { rotulo: "Total de consultas", valor: linhas.length },
                { rotulo: "Realizadas", valor: realizadas },
                { rotulo: "Agendadas / em aberto", valor: linhas.length - realizadas - canceladas },
                { rotulo: "Canceladas", valor: canceladas }
            ],
            colunas: [
                { campo: "data", rotulo: "Data", tipo: "data" },
                { campo: "horario", rotulo: "Horário", tipo: "hora" },
                { campo: "paciente", rotulo: "Paciente" },
                { campo: "profissional", rotulo: "Profissional" },
                { campo: "procedimentos", rotulo: "Procedimentos" },
                { campo: "status", rotulo: "Status", tipo: "status" }
            ],
            linhas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar relatório de consultas" });
    }
});

// Relatorio financeiro (receitas x despesas)
router.get("/financeiro", async (req, res) => {
    try {
        const periodo = lerPeriodo(req.query);
        if (periodo.erro) return res.status(400).json({ error: periodo.erro });

        const valoresReceita = [];
        const filtroReceita = filtroPeriodo("receita.data_receita", periodo, valoresReceita);

        const valoresDespesa = [];
        const filtroDespesa = filtroPeriodo("despesa.data_despesa", periodo, valoresDespesa);

        const [linhas] = await db.execute(
            `SELECT * FROM (
                SELECT
                    receita.data_receita AS data,
                    'Receita' AS tipo,
                    receita.descricao,
                    paciente.nome AS paciente_fornecedor,
                    receita.valor,
                    receita.status
                FROM receita
                LEFT JOIN paciente
                    ON receita.id_paciente = paciente.id_paciente
                WHERE 1 = 1 ${filtroReceita}

                UNION ALL

                SELECT
                    despesa.data_despesa AS data,
                    'Despesa' AS tipo,
                    despesa.descricao,
                    despesa.categoria AS paciente_fornecedor,
                    despesa.valor,
                    despesa.status
                FROM despesa
                WHERE 1 = 1 ${filtroDespesa}
            ) AS movimentacoes
            ORDER BY data DESC`,
            [...valoresReceita, ...valoresDespesa]
        );

        const soma = (tipo, status) =>
            linhas
                .filter((m) => m.tipo === tipo && String(m.status).toLowerCase() === status)
                .reduce((acc, m) => acc + Number(m.valor), 0);

        const receitasPagas = soma("Receita", "pago");
        const despesasPagas = soma("Despesa", "pago");

        res.json({
            resumo: [
                { rotulo: "Receitas recebidas", valor: receitasPagas, formato: "moeda" },
                { rotulo: "Despesas pagas", valor: despesasPagas, formato: "moeda" },
                { rotulo: "Saldo", valor: receitasPagas - despesasPagas, formato: "moeda" },
                { rotulo: "A receber (pendente)", valor: soma("Receita", "pendente"), formato: "moeda" },
                { rotulo: "A pagar (pendente)", valor: soma("Despesa", "pendente"), formato: "moeda" }
            ],
            colunas: [
                { campo: "data", rotulo: "Data", tipo: "data" },
                { campo: "tipo", rotulo: "Tipo", tipo: "status" },
                { campo: "descricao", rotulo: "Descrição" },
                { campo: "paciente_fornecedor", rotulo: "Paciente / Categoria" },
                { campo: "valor", rotulo: "Valor", tipo: "moeda" },
                { campo: "status", rotulo: "Status", tipo: "status" }
            ],
            linhas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar relatório financeiro" });
    }
});

// Relatorio de estoque (situacao atual; nao depende do periodo)
router.get("/estoque", async (req, res) => {
    try {
        const [linhas] = await db.execute(
            `SELECT * FROM (
                SELECT
                    nome,
                    categoria,
                    qtd_disponivel,
                    qtd_minima,
                    data_validade,
                    CASE
                        WHEN qtd_disponivel = 0 THEN 'Esgotado'
                        WHEN data_validade < CURDATE() THEN 'Vencido'
                        WHEN data_validade BETWEEN CURDATE()
                            AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Próximo da Validade'
                        WHEN qtd_disponivel <= qtd_minima THEN 'Estoque Baixo'
                        ELSE 'Normal'
                    END AS status
                FROM material
            ) AS materiais
            ORDER BY (status = 'Normal'), nome`
        );

        const contar = (status) => linhas.filter((m) => m.status === status).length;

        res.json({
            resumo: [
                { rotulo: "Materiais cadastrados", valor: linhas.length },
                { rotulo: "Esgotados", valor: contar("Esgotado") },
                { rotulo: "Estoque baixo", valor: contar("Estoque Baixo") },
                { rotulo: "Próximos da validade", valor: contar("Próximo da Validade") },
                { rotulo: "Vencidos", valor: contar("Vencido") }
            ],
            colunas: [
                { campo: "nome", rotulo: "Material" },
                { campo: "categoria", rotulo: "Categoria" },
                { campo: "qtd_disponivel", rotulo: "Disponível" },
                { campo: "qtd_minima", rotulo: "Mínimo" },
                { campo: "data_validade", rotulo: "Validade", tipo: "data" },
                { campo: "status", rotulo: "Status", tipo: "status" }
            ],
            linhas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar relatório de estoque" });
    }
});

export default router;
