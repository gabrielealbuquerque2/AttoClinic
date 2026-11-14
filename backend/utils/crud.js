
import express from "express";
import db from "../database.js";

function createCrudRouter(table, idColumn, fields, obrigatorios = []) { // fields = lista das colunas
    const router = express.Router();

    // Seleciona apenas os campos permitidos
    function pegarDados(body) {
        const dados = {};

        fields.forEach((campo) => {
            if (body[campo] !== undefined) {
                dados[campo] = body[campo];
            }
        });

        return dados;
    }

    // Valida os campos obrigatórios
    function validarDados(dados) {
        const faltando = obrigatorios.filter(
            (campo) =>
                dados[campo] === undefined ||
                dados[campo] === null ||
                String(dados[campo]).trim() === ""
        );

        return faltando;
    }

    // Buscar todos
    router.get("/buscar", async (req, res) => {
        try {
            const [rows] = await db.execute( // primeiro elemento do array são as linhas
                `SELECT * FROM ${table}`
            );

            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao buscar registros" });
        }
    });

    // Cadastrar
    router.post("/post", async (req, res) => {
        try {
            const dados = pegarDados(req.body);

            const faltando = validarDados(dados);

            if (faltando.length > 0) {
                return res.status(400).json({
                    error: "Preencha os campos obrigatórios",
                    campos: faltando
                });
            }

            const colunas = Object.keys(dados); // pega os nomes das colunas
            const valores = Object.values(dados); // pega os dados de cada coluna

            if (colunas.length === 0) {
                return res.status(400).json({ error: "Nenhum dado enviado" });
            }

            const sql = `
                INSERT INTO ${table} (${colunas.join(", ")})
                VALUES (${colunas.map(() => "?").join(", ")})
            `;
            // join transforma em string

            await db.execute(sql, valores);

            res.status(201).json({ message: "Cadastro realizado com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao cadastrar registro" });
        }
    });

    // Editar
    router.put("/put/:id", async (req, res) => {
        try {
            const dados = pegarDados(req.body);
            const colunas = Object.keys(dados); // pega os nomes das colunas
            const valores = Object.values(dados); // pega os dados de cada coluna

            if (colunas.length === 0) {
                return res.status(400).json({ error: "Nenhum dado enviado" });
            }

            const set = colunas.map((coluna) => `${coluna} = ?`).join(", ");

            const sql = `
                UPDATE ${table}
                SET ${set}
                WHERE ${idColumn} = ?
            `;

            await db.execute(sql, [...valores, req.params.id]);

            res.json({ message: "Registro atualizado com sucesso" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao atualizar registro" });
        }
    });

    // Excluir
    router.delete("/delete/:id", async (req, res) => {
        try {
            await db.execute(
                `DELETE FROM ${table} WHERE ${idColumn} = ?`,
                [req.params.id]
            );

            res.json({ message: "Registro excluído com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao excluir registro" });
        }
    });

    return router;
}

export default createCrudRouter;
