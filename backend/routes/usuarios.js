import criarCrud from "../utils/crud.js";

const router = criarCrud(
    "usuario",
    "id_usuario",
    ["nome", "email", "perfil", "firebase_uid"],
    ["nome", "email", "perfil", "firebase_uid"]
);

export default router;