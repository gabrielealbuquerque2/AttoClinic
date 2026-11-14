import createCrudRouter from "../utils/crud.js";

const router = createCrudRouter(
    "usuario",
    "id_usuario",
    ["nome", "email", "perfil", "firebase_uid"],
    ["nome", "email", "firebase_uid"]
);

export default router;