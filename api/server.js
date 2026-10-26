const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;
const scores = [];

app.use(cors());
app.use(express.json());

app.get("/scores", (req, res) => {
    const ranking = [...scores].sort((a, b) => b.score - a.score);
    res.json(ranking);
});

app.post("/scores", (req, res) => {
    const { username, score } = req.body;

    if (typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ error: "username invalide" });
    }

    if (!Number.isInteger(score) || score < 0) {
        return res.status(400).json({ error: "score invalide" });
    }

    const entry = {
        username: username.trim(),
        score,
        createdAt: new Date().toISOString(),
    };

    scores.push(entry);
    return res.status(201).json(entry);
});

app.listen(port, () => {
    console.log(`Scores API active sur http://localhost:${port}`);
});
