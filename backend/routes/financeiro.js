import express from "express";
import db from "../database.js";

const router = express.Router();

// filtro movimentacao
router.get("/movimentacoes", async (req, res) => {
    try {
        const { tipo, status, mes } = req.query;
        const tiposPermitidos = ["receita", "despesa"];
        const statusPermitidos = ["pago", "pendente"];

        if (tipo && !tiposPermitidos.includes(tipo.toLowerCase())) {
            return res.status(400).json({
                error: "Tipo inválido. Use receita ou despesa."
            });
        }

        if (status && !statusPermitidos.includes(status.toLowerCase())) {
            return res.status(400).json({
                error: "Status inválido. Use pago ou pendente."
            });
        }

        // receita e despesa juntos
        let sql = `SELECT * FROM (
                SELECT
                    receita.id_receita AS id,
                    receita.data_receita AS data,
                    receita.descricao,
                    paciente.nome AS paciente_fornecedor,
                    'Receita' AS tipo,
                    receita.tipo_pagamento,
                    receita.valor,
                    receita.status,
                    receita.id_paciente,
                    receita.id_procedimento,
                    NULL AS categoria,
                    NULL AS fornecedor,
                    NULL AS observacoes
                FROM receita

                LEFT JOIN paciente
                    ON receita.id_paciente = paciente.id_paciente
                UNION ALL

                SELECT
                    despesa.id_despesa AS id,
                    despesa.data_despesa AS data,
                    despesa.descricao,
                    despesa.categoria AS paciente_fornecedor,
                    'Despesa' AS tipo,
                    despesa.tipo_pagamento,
                    despesa.valor,
                    despesa.status,
                    NULL AS id_paciente,
                    NULL AS id_procedimento,
                    despesa.categoria,
                    despesa.fornecedor,
                    despesa.observacoes
                FROM despesa
            ) AS movimentacoes

            WHERE 1 = 1`;

        const valores = [];

        if (tipo) {
            sql += " AND LOWER(tipo) = ?";
            valores.push(tipo.toLowerCase());
        }

        if (status) {
            sql += " AND LOWER(status) = ?";
            valores.push(status.toLowerCase());
        }

        if (mes) {
            sql += `
                AND data >= ?
                AND data < DATE_ADD(?, INTERVAL 1 MONTH)`;

            valores.push(`${mes}-01`, `${mes}-01`);
        }

        sql += " ORDER BY data DESC, id DESC";

        const [rows] = await db.execute(sql, valores);
        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar movimentações financeiras"
        });
    }
});

// resumo do mes
router.get("/resumo", async (req, res) => {
    try {
        const mes = req.query.mes ||
            new Date().toISOString().slice(0, 7);  // pega o mes atual

        const [ano, numeroMes] = mes.split("-").map(Number);

        const formatarData = (data) => {
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, "0");

            return `${ano}-${mes}-01`;
        };

        const inicioMes = formatarData(
            new Date(ano, numeroMes - 1, 1) // -----------------
        );

        const inicioProximoMes = formatarData(
            new Date(ano, numeroMes, 1)
        );

        const inicioMesAnterior = formatarData(
            new Date(ano, numeroMes - 2, 1)
        );

        // receita desse mes 
        const [receitas] = await db.execute( // coalesce substitui o null por zero
            `SELECT COALESCE(SUM(valor), 0) AS total  
             FROM receita
             WHERE data_receita >= ?
             AND data_receita < ?
             AND LOWER(status) = 'pago'`,
            [inicioMes, inicioProximoMes]
        );

        // despesa desse mes
        const [despesas] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM despesa
             WHERE data_despesa >= ?
             AND data_despesa < ?
             AND LOWER(status) = 'pago'`,
            [inicioMes, inicioProximoMes]
        );

        // receita mes passado
        const [receitasAnteriores] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM receita
             WHERE data_receita >= ?
             AND data_receita < ?
             AND LOWER(status) = 'pago'`,
            [inicioMesAnterior, inicioMes]
        );

        // despesa mes passado
        const [despesasAnteriores] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM despesa
             WHERE data_despesa >= ?
             AND data_despesa < ?
             AND LOWER(status) = 'pago'`,
            [inicioMesAnterior, inicioMes]
        );

        // pagamento pendente
        const [pendentesReceita] = await db.execute(
            `SELECT
                COALESCE(SUM(valor), 0) AS total,
                COUNT(*) AS quantidade
             FROM receita
             WHERE LOWER(status) = 'pendente'
             AND data_receita >= ?
             AND data_receita < ?`,
            [inicioMes, inicioProximoMes]
        );

        // despesa pendente
        const [pendentesDespesa] = await db.execute(
            `SELECT
                COALESCE(SUM(valor), 0) AS total,
                COUNT(*) AS quantidade
             FROM despesa
             WHERE LOWER(status) = 'pendente'
             AND data_despesa >= ?
             AND data_despesa < ?`,
            [inicioMes, inicioProximoMes]
        );

        const totalReceitas = Number(receitas[0].total);
        const totalDespesas = Number(despesas[0].total);

        const totalReceitasAnterior = Number(receitasAnteriores[0].total);
        const totalDespesasAnterior = Number(despesasAnteriores[0].total);

        const totalPendente =
            Number(pendentesReceita[0].total) +
            Number(pendentesDespesa[0].total);

        const quantidadePendente =
            Number(pendentesReceita[0].quantidade) +
            Number(pendentesDespesa[0].quantidade);

        // variacao percentual em relacao ao mes anterior
        function calcularVariacao(atual, anterior) {
            if (anterior === 0) {
                return null;
            }

            return Number(
                (((atual - anterior) / anterior) * 100).toFixed(2)
            );
        }

        res.json({
            receitas_mes: totalReceitas,
            despesas_mes: totalDespesas,
            saldo: totalReceitas - totalDespesas,
            pagamentos_pendentes: totalPendente,
            quantidade_pendentes: quantidadePendente,
            variacao_receitas: calcularVariacao(
                totalReceitas,
                totalReceitasAnterior
            ),
            variacao_despesas: calcularVariacao(
                totalDespesas,
                totalDespesasAnterior
            )
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar resumo financeiro"
        });
    }
});

export default router;