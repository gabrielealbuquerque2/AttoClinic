import criarCrud from "../utils/crud.js";
import { firebaseAuth } from "../services/firebaseAdmin.js";

const perfisPermitidos = new Set(["gestor", "funcionario"]);

async function validarCadastroFirebase(req, res, next) {
    const token = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
        return res.status(401).json({ error: "Token Firebase obrigatório" });
    }

    let usuarioFirebase;
    try {
        usuarioFirebase = await firebaseAuth.verifyIdToken(token);
    } catch (error) {
        if (error.code === "app/invalid-credential" || error.code === "auth/invalid-credential") {
            console.error("Firebase Admin não conseguiu validar o token:", error.code);
            return res.status(500).json({ error: "Autenticação Firebase não está configurada no servidor" });
        }

        return res.status(401).json({ error: "Token Firebase inválido ou expirado" });
    }

    const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const perfil = typeof req.body?.perfil === "string" ? req.body.perfil.trim() : "";
    const firebaseUid = typeof req.body?.firebase_uid === "string"
        ? req.body.firebase_uid.trim()
        : "";

    if (!nome || !email || !perfil || !firebaseUid) {
        return res.status(400).json({ error: "Preencha nome, e-mail, função e UID do Firebase" });
    }

    if (!perfisPermitidos.has(perfil)) {
        return res.status(400).json({ error: "Função inválida" });
    }

    if (
        firebaseUid !== usuarioFirebase.uid ||
        !usuarioFirebase.email ||
        email.toLowerCase() !== usuarioFirebase.email.toLowerCase()
    ) {
        return res.status(403).json({ error: "Os dados não correspondem à conta Firebase autenticada" });
    }

    req.body = {
        nome,
        email: usuarioFirebase.email,
        perfil,
        firebase_uid: usuarioFirebase.uid
    };

    next();
}

const router = criarCrud(
    "usuario", "id_usuario",
    ["nome", "email", "perfil", "firebase_uid"],
    ["nome", "email", "perfil", "firebase_uid"],
    [validarCadastroFirebase]
);

export default router;