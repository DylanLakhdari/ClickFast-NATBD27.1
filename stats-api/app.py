import os
from flask import Flask, jsonify
import psycopg2
from psycopg2 import OperationalError


def require_env(name: str) -> str:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        raise RuntimeError(f"Variable d'environnement obligatoire manquante: {name}")
    return value


DB_HOST = require_env("DB_HOST")
DB_PORT = require_env("DB_PORT")
DB_USER = require_env("DB_USER")
DB_PASSWORD = require_env("DB_PASSWORD")
DB_NAME = require_env("DB_NAME")
STATS_API_PORT = require_env("STATS_API_PORT")

app = Flask(__name__)


@app.get("/stats")
def get_stats():
    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME,
        )
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT
                COALESCE(MAX(score), 0) AS best_score,
                COUNT(*) AS games_played,
                COUNT(DISTINCT username) AS distinct_players
            FROM scores
            """
        )
        best_score, games_played, distinct_players = cursor.fetchone()
        cursor.close()
        connection.close()

        return jsonify(
            {
                "best_score": int(best_score),
                "games_played": int(games_played),
                "distinct_players": int(distinct_players),
            }
        )
    except OperationalError:
        return jsonify({"error": "base indisponible"}), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(STATS_API_PORT))
