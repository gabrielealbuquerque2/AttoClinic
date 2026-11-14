
import express from "express";
import db from "../database.js";
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "material",
    "id_material",
    [
        "nome",
        "categoria",
        "unidade_medida",
        "qtd_disponivel",
        "qtd_minima",
        "data_validade",
        "fornecedor",
        "observacoes"
    ],
    [
        "nome",
        "categoria",
        "unidade_medida",
        "qtd_disponivel",
        "qtd_minima"
    ]
);

// Buscar materiais com filtro por status
router.get("/lista", async (req, res) => {
    try {
        const { status } = req.query;

        // Calcula o status de cada material
        let sql = `
            SELECT *
            FROM (
                SELECT
                    id_material,
                    nome,
                    categoria,
                    unidade_medida,
                    qtd_disponivel,
                    qtd_minima,
                    data_validade,
                    fornecedor,
                    observacoes,

                    CASE
                        WHEN qtd_disponivel = 0
                            THEN 'Esgotado'

                        WHEN data_validade < CURDATE()
                            THEN 'Vencido'

                        WHEN data_validade BETWEEN CURDATE()
                            AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                            THEN 'Próximo da Validade'

                        WHEN qtd_disponivel <= qtd_minima
                            THEN 'Estoque Baixo'

                        ELSE 'Normal'
                    END AS status

                FROM material
            ) AS materiais

            WHERE 1 = 1
        `;

        const valores = [];

        // Filtrar por status
        if (status && status !== "Todos os status") {
            sql += " AND status = ?";
            valores.push(status);
        }

        sql += " ORDER BY nome";

        const [rows] = await db.execute(sql, valores);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar materiais do estoque"
        });
    }
});

// Buscar resumo do estoque
router.get("/resumo", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                COUNT(*) AS total_materiais,

                SUM(
                    CASE
                        WHEN qtd_disponivel > 0
                        AND qtd_disponivel <= qtd_minima
                        THEN 1
                        ELSE 0
                    END
                ) AS estoque_baixo,

                SUM(
                    CASE
                        WHEN data_validade BETWEEN CURDATE()
                        AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                        THEN 1
                        ELSE 0
                    END
                ) AS proxima_validade,

                SUM(
                    CASE
                        WHEN qtd_disponivel = 0
                        THEN 1
                        ELSE 0
                    END
                ) AS esgotados

            FROM material
        `);

        res.json({
            total_materiais: Number(rows[0].total_materiais),
            estoque_baixo: Number(rows[0].estoque_baixo),
            proxima_validade: Number(rows[0].proxima_validade),
            esgotados: Number(rows[0].esgotados)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar resumo do estoque"
        });
    }
});

export default router;
