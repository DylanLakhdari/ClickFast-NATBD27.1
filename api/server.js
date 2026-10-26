const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;
const pool = new Pool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "clickfast",
    password: process.env.DB_PASSWORD || "clickfast",
    database: process.env.DB_NAME || "clickfast",
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
        app.listen(port, () => {
            console.log(`Scores API active sur http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Impossible d'initialiser la base.", error.message);
        process.exit(1);
    });
