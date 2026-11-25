import criarCrud from "../utils/crud.js";

const router = criarCrud(
    "despesa",
    "id_despesa",
    [
        "data_despesa",
        "categoria",
        "fornecedor",
        "descricao",
        "valor",
        "tipo_pagamento",
        "status",
        "observacoes"
    ],
    ["data_despesa", "categoria", "descricao", "valor"]
);

export default router;
