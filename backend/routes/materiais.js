import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "material",
    "id_material",
    [
        "nome",
        "categoria",
        "unidade_medida",
        "qtd_disponivel",
        "qtd_minima",
        "data_validade",
        "fornecedor",
        "observacoes"
    ],
    [
        "nome",
        "categoria",
        "unidade_medida",
        "qtd_disponivel",
        "qtd_minima"
    ]
);

export default router;
