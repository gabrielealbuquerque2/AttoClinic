import "dotenv/config";
import mysql from "mysql2/promise";

const db = mysql.createPool({   // varias rotas acessam o banco
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: ["DATE"], // colunas DATE voltam como "AAAA-MM-DD" (evita erro de fuso no JSON)
});

export default db;