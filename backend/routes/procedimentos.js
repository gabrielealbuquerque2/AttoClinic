import criarCrud from "../utils/crud.js";

const router = criarCrud(
    "procedimento", "id_procedimento",
    [
        "nome_procedimento",
        "valor",
        "descricao"
    ],
    ["nome_procedimento"]
);

export default router;