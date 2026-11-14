
import express from "express";
import db from "../database.js";

const router = express.Router();

// Buscar movimentações financeiras com filtros
router.get("/movimentacoes", async (req, res) => {
    try {
        const { tipo, status, mes } = req.query;

        // Verifica se o tipo informado é válido
        const tiposPermitidos = ["receita", "despesa"];

        if (tipo && !tiposPermitidos.includes(tipo.toLowerCase())) {
            return res.status(400).json({
                error: "Tipo inválido. Use receita ou despesa."
            });
        }

        // Verifica se o status informado é válido
        const statusPermitidos = ["pago", "pendente"];

        if (status && !statusPermitidos.includes(status.toLowerCase())) {
            return res.status(400).json({
                error: "Status inválido. Use pago ou pendente."
            });
        }

        // Une receitas e despesas em uma única consulta
        let sql = `
            SELECT *
            FROM (
                SELECT
                    receita.id_receita AS id,
                    receita.data_receita AS data,
                    receita.descricao,
                    paciente.nome AS paciente_fornecedor,
                    'Receita' AS tipo,
                    receita.tipo_pagamento,
                    receita.valor,
                    receita.status
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
                    despesa.status
                FROM despesa
            ) AS movimentacoes

            WHERE 1 = 1
        `;

        const valores = [];

        // Filtrar por tipo
        if (tipo) {
            sql += " AND LOWER(tipo) = ?";
            valores.push(tipo.toLowerCase());
        }

        // Filtrar por status
        if (status) {
            sql += " AND LOWER(status) = ?";
            valores.push(status.toLowerCase());
        }

        // Filtrar por mês
        if (mes) {
            sql += `
                AND data >= ?
                AND data < DATE_ADD(?, INTERVAL 1 MONTH)
            `;

            valores.push(`${mes}-01`, `${mes}-01`);
        }

        sql += " ORDER BY data DESC";

        const [rows] = await db.execute(sql, valores);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar movimentações financeiras"
        });
    }
});

// Buscar resumo financeiro do mês
router.get("/resumo", async (req, res) => {
    try {
        const mes = req.query.mes ||
            new Date().toISOString().slice(0, 7);

        // Verifica se o mês está no formato correto
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
            return res.status(400).json({
                error: "Mês inválido. Use o formato AAAA-MM."
            });
        }

        const [ano, numeroMes] = mes.split("-").map(Number);

        const formatarData = (data) => {
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, "0");

            return `${ano}-${mes}-01`;
        };

        const inicioMes = formatarData(
            new Date(ano, numeroMes - 1, 1)
        );

        const inicioProximoMes = formatarData(
            new Date(ano, numeroMes, 1)
        );

        const inicioMesAnterior = formatarData(
            new Date(ano, numeroMes - 2, 1)
        );

        // Total de receitas do mês
        const [receitas] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM receita
             WHERE data_receita >= ?
             AND data_receita < ?`,
            [inicioMes, inicioProximoMes]
        );

        // Total de despesas do mês
        const [despesas] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM despesa
             WHERE data_despesa >= ?
             AND data_despesa < ?`,
            [inicioMes, inicioProximoMes]
        );

        // Total de receitas do mês anterior
        const [receitasAnteriores] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM receita
             WHERE data_receita >= ?
             AND data_receita < ?`,
            [inicioMesAnterior, inicioMes]
        );

        // Total de despesas do mês anterior
        const [despesasAnteriores] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM despesa
             WHERE data_despesa >= ?
             AND data_despesa < ?`,
            [inicioMesAnterior, inicioMes]
        );

        // Pagamentos pendentes de receitas e despesas
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

        // Calcula a variação percentual em relação ao mês anterior
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
