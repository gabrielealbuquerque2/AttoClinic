
import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "receita",
    "id_receita",
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
