
import express from "express";
import db from "../database.js";
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "prontuario",
    "id_prontuario",
    [
        "id_paciente",
        "data",
        "historico",
        "observacoes"
    ]
);

// Buscar pacientes para a tela de prontuários
router.get("/pacientes", async (req, res) => {
    try {
        const busca = req.query.busca || "";

        const [rows] = await db.execute(
            `SELECT
                paciente.id_paciente,
                paciente.nome,
                paciente.cpf,
                paciente.telefone,
                paciente.email,
                MAX(consulta.data) AS ultima_consulta

            FROM paciente

            LEFT JOIN consulta
                ON paciente.id_paciente = consulta.id_paciente
                AND consulta.status_consulta = 'Realizada'

            WHERE
                paciente.nome LIKE ?
                OR paciente.cpf LIKE ?
                OR paciente.email LIKE ?

            GROUP BY
                paciente.id_paciente,
                paciente.nome,
                paciente.cpf,
                paciente.telefone,
                paciente.email

            ORDER BY paciente.nome `,

            [ `%${busca}%`, `%${busca}%`, `%${busca}%` ]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Erro ao buscar pacientes"
        });
    }
});

// Buscar prontuário de um paciente específico
router.get("/paciente/:id", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM prontuario WHERE id_paciente = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Prontuário não encontrado"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Erro ao buscar prontuário do paciente"
        });
    }
});

export default router;