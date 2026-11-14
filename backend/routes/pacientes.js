import express from "express";
import db from "../database.js";
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "paciente",
    "id_paciente",
    [
        "nome",
        "cpf",
        "telefone",
        "data_nascimento",
        "email",
        "rua",
        "numero",
        "bairro",
        "cidade",
        "CEP"
    ],
    ["nome", "cpf"]
);

// Buscar pacientes pelo nome
router.get("/buscar/nome", async (req, res) => {
    try {
        const nome = req.query.nome || "";

        const [rows] = await db.execute(
            `SELECT * FROM paciente WHERE nome LIKE ? ORDER BY nome`,
            [`%${nome}%`]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Erro ao buscar pacientes pelo nome"
        });
    }
});

export default router;
