import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/resumo", async (req, res) => {
    try {
        //pacientes cadastrados
        const [pacientes] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM paciente`
        );

        // consultas agendadas de hoje
        const [consultas] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM consulta
             WHERE data = CURDATE()`
        );

        // receita desse mes
        const [receitas] = await db.execute(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM receita
             WHERE LOWER(status) = 'pago'
             AND data_receita >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
             AND data_receita < DATE_ADD(
                 DATE_FORMAT(CURDATE(), '%Y-%m-01'),
                 INTERVAL 1 MONTH
             )`
        );

        // materiais poucos
        const [estoque] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM material
             WHERE qtd_disponivel <= qtd_minima`
        );

        res.json({
            total_pacientes: pacientes[0].total,
            consultas_hoje: consultas[0].total,
            receita_mes: Number(receitas[0].total),
            alertas_estoque: estoque[0].total
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar resumo do Dashboard"
        });
    }
});

router.get("/consultas-hoje", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                consulta.id_consulta,
                consulta.horario,
                consulta.data,
                consulta.status_consulta,
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

             WHERE consulta.data = CURDATE()

             GROUP BY
                consulta.id_consulta,
                consulta.horario,
                consulta.data,
                consulta.status_consulta,
                paciente.nome,
                profissional.nome

             ORDER BY consulta.horario ASC`
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar consultas de hoje"
        });
    }
});

// pesquisa
router.get("/buscar", async (req, res) => {
    try {
        const { termo } = req.query;

        if (!termo || !termo.trim()) {
            return res.json({
                pacientes: [],
                consultas: []
            });
        }

        const pesquisa = `%${termo.trim()}%`;

        const [pacientes] = await db.execute(
            `SELECT
                id_paciente,
                nome,
                cpf,
                telefone
             FROM paciente
             WHERE nome LIKE ?
                OR cpf LIKE ?
                OR telefone LIKE ?
             ORDER BY nome ASC
             LIMIT 10`,
            [pesquisa, pesquisa, pesquisa]
        );

        const [consultas] = await db.execute(
            `SELECT
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
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

             WHERE paciente.nome LIKE ?
                OR profissional.nome LIKE ?
                OR procedimento.nome_procedimento LIKE ?

             GROUP BY
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
                paciente.nome,
                profissional.nome

             ORDER BY consulta.data DESC, consulta.horario ASC
             LIMIT 10`,
            [pesquisa, pesquisa, pesquisa]
        );

        res.json({
            pacientes,
            consultas
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao pesquisar pacientes e consultas"
        });
    }
});

router.get("/proxima-consulta", async (req, res) => {
    try {
        const [resultado] = await db.query(
            `SELECT
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                paciente.nome AS paciente,
                GROUP_CONCAT(procedimento.nome_procedimento SEPARATOR ', ') AS procedimentos
            FROM consulta
            INNER JOIN paciente
                ON consulta.id_paciente = paciente.id_paciente
            LEFT JOIN consulta_procedimento
                ON consulta.id_consulta = consulta_procedimento.id_consulta
            LEFT JOIN procedimento
                ON consulta_procedimento.id_procedimento = procedimento.id_procedimento
            WHERE
                consulta.data > CURDATE()
                OR (
                    consulta.data = CURDATE()
                    AND STR_TO_DATE(consulta.horario, '%H:%i') >= CURTIME()
                )
            GROUP BY
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                paciente.nome
            ORDER BY
                consulta.data ASC,
                consulta.horario ASC
            LIMIT 1
        `);

        res.json(resultado[0] || null);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao buscar próxima consulta." });
    }
});

export default router;