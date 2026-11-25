import db from "../database.js";
import criarCrud from "../utils/crud.js";

const router = criarCrud(
    "prontuario", "id_prontuario",
    [
        "id_paciente",
        "data",
        "historico",
        "observacoes"
    ]
);

// busca pacientes - nome, email, cpf
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

// tudo que a tela de detalhe do prontuario precisa, em uma chamada so
router.get("/detalhe/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [pacientes] = await db.execute(
            `SELECT * FROM paciente WHERE id_paciente = ?`,
            [id]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({ error: "Paciente não encontrado" });
        }

        const [prontuarios] = await db.execute(
            `SELECT * FROM prontuario
             WHERE id_paciente = ?
             ORDER BY data DESC, id_prontuario DESC
             LIMIT 1`,
            [id]
        );

        const [atendimentos] = await db.execute(
            `SELECT
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
                consulta.observacoes,
                profissional.nome AS profissional,
                GROUP_CONCAT(
                    DISTINCT procedimento.nome_procedimento
                    SEPARATOR ', '
                ) AS procedimentos
             FROM consulta
             LEFT JOIN profissional
                ON consulta.id_profissional = profissional.id_profissional
             LEFT JOIN consulta_procedimento
                ON consulta.id_consulta = consulta_procedimento.id_consulta
             LEFT JOIN procedimento
                ON consulta_procedimento.id_procedimento = procedimento.id_procedimento
             WHERE consulta.id_paciente = ?
               AND LOWER(consulta.status_consulta) LIKE 'realizad%'
             GROUP BY
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                consulta.status_consulta,
                consulta.observacoes,
                profissional.nome
             ORDER BY consulta.data DESC, consulta.horario DESC
             `,
            [id]
        );

        const [proximas] = await db.execute(
            `SELECT
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                profissional.nome AS profissional,
                GROUP_CONCAT(
                    DISTINCT procedimento.nome_procedimento
                    SEPARATOR ', '
                ) AS procedimentos
             FROM consulta
             LEFT JOIN profissional
                ON consulta.id_profissional = profissional.id_profissional
             LEFT JOIN consulta_procedimento
                ON consulta.id_consulta = consulta_procedimento.id_consulta
             LEFT JOIN procedimento
                ON consulta_procedimento.id_procedimento = procedimento.id_procedimento
             WHERE consulta.id_paciente = ?
               AND consulta.data >= CURDATE()
               AND LOWER(consulta.status_consulta) NOT LIKE 'realizad%'
               AND LOWER(consulta.status_consulta) NOT LIKE 'cancel%'
             GROUP BY
                consulta.id_consulta,
                consulta.data,
                consulta.horario,
                profissional.nome
             ORDER BY consulta.data ASC, consulta.horario ASC
             LIMIT 1`,
            [id]
        );

        const [totais] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM consulta_procedimento
             INNER JOIN consulta
                ON consulta_procedimento.id_consulta = consulta.id_consulta
             WHERE consulta.id_paciente = ?
               AND LOWER(consulta.status_consulta) LIKE 'realizad%'`,
            [id]
        );

        res.json({
            paciente: pacientes[0],
            prontuario: prontuarios[0] || null,
            ultima_consulta: atendimentos[0] || null,
            proxima_consulta: proximas[0] || null,
            total_procedimentos: totais[0].total,
            atendimentos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar detalhes do prontuário" });
    }
});

// busca paciente especifico
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