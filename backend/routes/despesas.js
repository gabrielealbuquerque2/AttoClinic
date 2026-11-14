
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "despesa",
    "id_despesa",
    [
        "id_usuario",
        "data_despesa",
        "categoria",
        "descricao",
        "valor",
        "tipo_pagamento",
        "status",
        "observacoes"
    ],
    ["data_despesa", "categoria", "descricao", "valor"]
);

export default router;
