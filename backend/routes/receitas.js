import criarCrud from "../utils/crud.js";

const router = criarCrud(
    "receita", "id_receita",
    [
        "id_usuario",
        "id_paciente",
        "id_procedimento",
        "data_receita",
        "valor",
        "descricao",
        "tipo_pagamento",
        "status"
    ],
    ["id_paciente", "data_receita", "valor"]
);

export default router;
