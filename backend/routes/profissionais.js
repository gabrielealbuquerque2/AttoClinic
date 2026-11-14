import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "profissional",
    "id_profissional",
    [
        "nome",
        "cpf",
        "CRO",
        "cargo",
        "email",
        "rua",
        "numero",
        "bairro",
        "cidade",
        "CEP"
    ],
    ["nome"]
);

export default router;
