import db from "../database.js";
import criarCrud from "../utils/crud.js";

const router = criarCrud(
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
        await conexao.beginTransaction();

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

        const idConsulta = resultado.insertId;

        await conexao.execute(
            `INSERT INTO consulta_procedimento
            (id_consulta, id_procedimento)
            VALUES (?, ?)`,
            [idConsulta, id_procedimento]
        );

        await conexao.commit();

        res.status(201).json({
            message: "Consulta agendada com sucesso",
            id_consulta: idConsulta
        });

    } catch (error) {
        
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

// editar consulta (dados da consulta + procedimento)
router.put("/atualizar/:id", async (req, res) => {
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
        await conexao.beginTransaction();

        const [[consultaExistente]] = await conexao.execute(
            `SELECT id_consulta
             FROM consulta
             WHERE id_consulta = ?
             FOR UPDATE`,
            [req.params.id]
        );

        if (!consultaExistente) {
            await conexao.rollback();

            return res.status(404).json({
                error: "Consulta não encontrada"
            });
        }

        await conexao.execute(
            `UPDATE consulta
             SET id_paciente = ?,
                 id_profissional = ?,
                 data = ?,
                 horario = ?,
                 status_consulta = ?,
                 observacoes = ?
             WHERE id_consulta = ?`,
            [
                id_paciente,
                id_profissional,
                data,
                horario,
                status_consulta || "Agendado",
                observacoes || null,
                req.params.id
            ]
        );

        // troca o procedimento da consulta
        await conexao.execute(
            `DELETE FROM consulta_procedimento WHERE id_consulta = ?`,
            [req.params.id]
        );

        await conexao.execute(
            `INSERT INTO consulta_procedimento
            (id_consulta, id_procedimento)
            VALUES (?, ?)`,
            [req.params.id, id_procedimento]
        );

        await conexao.commit();

        res.json({ message: "Consulta atualizada com sucesso" });

    } catch (error) {
        if (conexao) {
            await conexao.rollback();
        }

        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar consulta"
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

// busca
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
                GROUP_CONCAT(procedimento.nome_procedimento SEPARATOR ', ') AS procedimentos,
                MIN(procedimento.id_procedimento) AS id_procedimento
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

        if (data) {
            sql += " AND consulta.data = ?";
            valores.push(data);
        }

        if (dataInicio && dataFim) {
            sql += " AND consulta.data BETWEEN ? AND ?";
            valores.push(dataInicio, dataFim);
        }

        if (id_profissional) {
            sql += " AND consulta.id_profissional = ?";
            valores.push(id_profissional);
        }

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