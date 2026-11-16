import db from "../database.js";
import criarCrud from "../utils/crud.js";

const router = criarCrud(
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

// lista para a tela de Pacientes (com ultima consulta e status)
// Ativo = sem consultas ainda (recem cadastrado) ou com consulta nos ultimos 12 meses
router.get("/lista", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                paciente.*,
                MAX(CASE WHEN LOWER(consulta.status_consulta) LIKE 'realizad%'
                         THEN consulta.data END) AS ultima_consulta,
                CASE
                    WHEN MAX(consulta.data) IS NULL THEN 'Ativo'
                    WHEN MAX(consulta.data) >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) THEN 'Ativo'
                    ELSE 'Inativo'
                END AS status
             FROM paciente
             LEFT JOIN consulta
                ON paciente.id_paciente = consulta.id_paciente
             GROUP BY paciente.id_paciente
             ORDER BY paciente.nome`
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar pacientes" });
    }
});

// filtro nome
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