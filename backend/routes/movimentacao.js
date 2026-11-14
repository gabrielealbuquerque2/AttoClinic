
import express from "express";
import db from "../database.js";

const router = express.Router();

// Registrar entrada ou saída de material
router.post("/registrar", async (req, res) => {
    let conexao;

    try {
        const {
            id_material,
            id_usuario,
            tipo_movimentacao,
            quantidade,
            data_movimentacao,
            motivo,
            observacao
        } = req.body;

        // Verifica os campos obrigatórios
        if (
            !id_material ||
            !tipo_movimentacao ||
            !quantidade ||
            !data_movimentacao ||
            !motivo
        ) {
            return res.status(400).json({
                error: "Preencha todos os campos obrigatórios"
            });
        }

        // Verifica o tipo de movimentação
        const tiposPermitidos = ["Entrada", "Saída"];

        if (!tiposPermitidos.includes(tipo_movimentacao)) {
            return res.status(400).json({
                error: "Tipo de movimentação inválido"
            });
        }

        // Verifica a quantidade
        if (!Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0) {
            return res.status(400).json({
                error: "A quantidade deve ser um número inteiro positivo"
            });
        }

        conexao = await db.getConnection();

        // Inicia a transação
        await conexao.beginTransaction();

        // Busca o material e bloqueia o registro durante a operação
        const [materiais] = await conexao.execute(
            `SELECT qtd_disponivel
             FROM material
             WHERE id_material = ?
             FOR UPDATE`,
            [id_material]
        );

        if (materiais.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                error: "Material não encontrado"
            });
        }

        const quantidadeAtual = Number(materiais[0].qtd_disponivel);
        const quantidadeMovimentada = Number(quantidade);

        let novaQuantidade;

        // Calcula a nova quantidade disponível
        if (tipo_movimentacao === "Entrada") {
            novaQuantidade = quantidadeAtual + quantidadeMovimentada;
        } else {
            novaQuantidade = quantidadeAtual - quantidadeMovimentada;

            if (novaQuantidade < 0) {
                await conexao.rollback();

                return res.status(400).json({
                    error: "Não há quantidade suficiente em estoque"
                });
            }
        }

        // Atualiza a quantidade do material
        await conexao.execute(
            `UPDATE material
             SET qtd_disponivel = ?
             WHERE id_material = ?`,
            [novaQuantidade, id_material]
        );

        // Registra a movimentação no histórico
        await conexao.execute(
            `INSERT INTO movimentacao_estoque
            (
                id_material,
                id_usuario,
                tipo_movimentacao,
                quantidade,
                data_movimentacao,
                motivo,
                observacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id_material,
                id_usuario || null,
                tipo_movimentacao,
                quantidadeMovimentada,
                data_movimentacao,
                motivo,
                observacao || null
            ]
        );

        // Confirma as operações
        await conexao.commit();

        res.status(201).json({
            message: "Movimentação registrada com sucesso",
            quantidade_anterior: quantidadeAtual,
            quantidade_atual: novaQuantidade
        });

    } catch (error) {
        if (conexao) {
            await conexao.rollback();
        }

        console.error(error);

        res.status(500).json({
            error: "Erro ao registrar movimentação"
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

// Buscar histórico de movimentações
router.get("/historico", async (req, res) => {
    try {
        const { id_material } = req.query;

        let sql = `
            SELECT
                movimentacao_estoque.id_movimentacao,
                movimentacao_estoque.id_material,
                movimentacao_estoque.id_usuario,
                material.nome AS nome_material,
                movimentacao_estoque.tipo_movimentacao,
                movimentacao_estoque.quantidade,
                movimentacao_estoque.data_movimentacao,
                movimentacao_estoque.motivo,
                movimentacao_estoque.observacao,
                usuario.nome AS nome_usuario

            FROM movimentacao_estoque

            INNER JOIN material
                ON movimentacao_estoque.id_material = material.id_material

            LEFT JOIN usuario
                ON movimentacao_estoque.id_usuario = usuario.id_usuario

            WHERE 1 = 1
        `;

        const valores = [];

        // Filtrar pelo material selecionado
        if (id_material) {
            sql += " AND movimentacao_estoque.id_material = ?";
            valores.push(id_material);
        }

        sql += " ORDER BY movimentacao_estoque.data_movimentacao DESC, movimentacao_estoque.id_movimentacao DESC";

        const [rows] = await db.execute(sql, valores);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar histórico de movimentações"
        });
    }
});

export default router;
