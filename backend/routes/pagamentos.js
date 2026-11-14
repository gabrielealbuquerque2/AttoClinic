import express from "express";
import db from "../database.js";
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "pagamento",
    "id_pagamento",
    [
        "id_paciente",
        "status_pagamento",
        "forma_pagamento",
        "data_pagamento",
        "valor"
    ]
);

// Buscar lista de pagamentos com o nome do paciente
router.get("/lista", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                pagamento.id_pagamento,
                pagamento.id_paciente,
                paciente.nome AS nome_pagador,
                pagamento.status_pagamento,
                pagamento.forma_pagamento,
                pagamento.data_pagamento,
                pagamento.valor
            FROM pagamento

            LEFT JOIN paciente
                ON pagamento.id_paciente = paciente.id_paciente

            ORDER BY pagamento.data_pagamento DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar lista de pagamentos"
        });
    }
});

export default router;
