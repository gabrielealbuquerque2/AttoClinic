import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "procedimento",
    "id_procedimento",
    [
        "nome_procedimento",
        "valor",
        "descricao"
    ],
    ["nome_procedimento"]
);

export default router;
