const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

function requireEnv(name) {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new Error(`Variable d'environnement obligatoire manquante: ${name}`);
    }
    return value;
}

let dbHost;
let dbPort;
let dbUser;
let dbPassword;
let dbName;
let apiPort;

try {
    dbHost = requireEnv("DB_HOST");
    dbPort = Number(requireEnv("DB_PORT"));
    dbUser = requireEnv("DB_USER");
    dbPassword = requireEnv("DB_PASSWORD");
    dbName = requireEnv("DB_NAME");
    apiPort = Number(requireEnv("API_PORT"));

    if (!Number.isInteger(dbPort) || dbPort <= 0) {
        throw new Error("DB_PORT doit être un entier strictement positif.");
    }

    if (!Number.isInteger(apiPort) || apiPort <= 0) {
        throw new Error("API_PORT doit être un entier strictement positif.");
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const app = express();
const pool = new Pool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
});

pool.on("error", (error) => {
    console.error("Connexion base interrompue.", error.message);
});

app.use(cors());
app.use(express.json());

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS scores (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            score INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

app.get("/scores", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT username, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10",
        );
        res.json(result.rows);
    } catch (error) {
        res.status(503).json({ error: "base indisponible" });
    }
});

app.post("/scores", async (req, res) => {
    const { username, score } = req.body;

    if (typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ error: "username invalide" });
    }

    if (!Number.isInteger(score) || score < 0) {
        return res.status(400).json({ error: "score invalide" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO scores (username, score) VALUES ($1, $2) RETURNING username, score, created_at",
            [username.trim(), score],
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(503).json({ error: "base indisponible" });
    }
});

initializeDatabase()
    .then(() => {
        app.listen(apiPort, () => {
            console.log(`Scores API active sur http://localhost:${apiPort}`);
        });
    })
    .catch((error) => {
        console.error("Impossible d'initialiser la base.", error.message);
        process.exit(1);
    });
