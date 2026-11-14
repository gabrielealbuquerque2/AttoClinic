
import express from "express";
import db from "../database.js";
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "consulta",
    "id_consulta",
    [
        "id_prontuario",
        "id_paciente",
        "id_usuario",
        "id_profissional",
        "data",
        "horario",
        "status_consulta",
        "observacoes"
    ],
    ["id_paciente", "id_profissional", "data", "horario", "status_consulta"]
);

// Agendar consulta e associar o procedimento
router.post("/agendar", async (req, res) => {
    let conexao;

    try {
        const {
            id_paciente,
            id_profissional,
            data,
            horario,
            id_procedimento,
            status_consulta,
            observacoes
        } = req.body;

        // Verifica os campos obrigatórios
        if (
            !id_paciente ||
            !id_profissional ||
            !data ||
            !horario ||
            !id_procedimento
        ) {
            return res.status(400).json({
                error: "Preencha todos os campos obrigatórios"
            });
        }

        conexao = await db.getConnection();

        // Inicia a transação
        await conexao.beginTransaction();

        // Cadastra a consulta
        const [resultado] = await conexao.execute(
            `INSERT INTO consulta
            (id_paciente, id_profissional, data, horario, status_consulta, observacoes)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id_paciente,
                id_profissional,
                data,
                horario,
                status_consulta || "Agendado",
                observacoes || null
            ]
        );

        // Pega o ID da consulta que acabou de ser cadastrada
        const idConsulta = resultado.insertId;

        // Associa o procedimento à consulta
        await conexao.execute(
            `INSERT INTO consulta_procedimento
            (id_consulta, id_procedimento)
            VALUES (?, ?)`,
            [idConsulta, id_procedimento]
        );

        // Confirma as duas operações
        await conexao.commit();

        res.status(201).json({
            message: "Consulta agendada com sucesso",
            id_consulta: idConsulta
        });

    } catch (error) {
        // Desfaz as operações caso ocorra algum erro
        if (conexao) {
            await conexao.rollback();
        }

        console.error(error);

        res.status(500).json({
            error: "Erro ao agendar consulta"
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

// Buscar consultas da agenda
router.get("/agenda", async (req, res) => {
    try {
        const { data, dataInicio, dataFim, id_profissional, status } = req.query;

        let sql = `
            SELECT
                consulta.id_consulta,
                consulta.id_paciente,
                consulta.id_profissional,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
                consulta.observacoes,
                paciente.nome AS nome_paciente,
                paciente.telefone AS telefone_paciente,
                profissional.nome AS nome_profissional,
                GROUP_CONCAT(procedimento.nome_procedimento) AS procedimentos
            FROM consulta

            INNER JOIN paciente
                ON consulta.id_paciente = paciente.id_paciente

            INNER JOIN profissional
                ON consulta.id_profissional = profissional.id_profissional

            LEFT JOIN consulta_procedimento
                ON consulta.id_consulta = consulta_procedimento.id_consulta

            LEFT JOIN procedimento
                ON consulta_procedimento.id_procedimento = procedimento.id_procedimento

            WHERE 1 = 1
        `;

        const valores = [];

        // Filtrar por uma data específica
        if (data) {
            sql += " AND consulta.data = ?";
            valores.push(data);
        }

        // Filtrar por período
        if (dataInicio && dataFim) {
            sql += " AND consulta.data BETWEEN ? AND ?";
            valores.push(dataInicio, dataFim);
        }

        // Filtrar por profissional
        if (id_profissional) {
            sql += " AND consulta.id_profissional = ?";
            valores.push(id_profissional);
        }

        // Filtrar por status
        if (status) {
            sql += " AND LOWER(consulta.status_consulta) = ?";
            valores.push(status.toLowerCase());
        }

        sql += `
            GROUP BY
                consulta.id_consulta,
                consulta.id_paciente,
                consulta.id_profissional,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
                consulta.observacoes,
                paciente.nome,
                paciente.telefone,
                profissional.nome

            ORDER BY consulta.data, consulta.horario
        `;

        const [rows] = await db.execute(sql, valores);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar consultas da agenda"
        });
    }
});

export default router;