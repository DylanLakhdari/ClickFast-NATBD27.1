// Une fois que le HTML ressemble à ce que vous voulez :
// 1. Faire une variable count, qui stockera le nombre de clics
// 2. Faire un eventListener sur le bouton
const API_BASE_URL = "http://localhost:3000";
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const clickButton = document.getElementById("button-clicker");
const usernameInput = document.getElementById("username");
const rankingElement = document.getElementById("ranking");
const apiStatusElement = document.getElementById("api-status");

let count = 0;
let timeLeft = 5;
let gameActive = true;
let gameFinished = false;

clickButton.addEventListener("click", () => {
    if (!gameActive) {
        return;
    }

    count += 1;
    scoreElement.textContent = String(count);
});

const countdown = setInterval(() => {
    timeLeft -= 1;
    timerElement.textContent = String(Math.max(timeLeft, 0));

    if (timeLeft <= 0) {
        endGame();
    }
}, 1000);

async function endGame() {
    if (gameFinished) {
        return;
    }

    gameFinished = true;
    gameActive = false;
    clickButton.disabled = true;
    clearInterval(countdown);
    await submitScore();
    await loadRanking();
}

async function submitScore() {
    const username = usernameInput.value.trim() || "Anonymous";

    try {
        const response = await fetch(`${API_BASE_URL}/scores`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, score: count }),
        });

        if (!response.ok) {
            apiStatusElement.textContent = "Score non enregistré (API indisponible).";
            return;
        }

        apiStatusElement.textContent = "Score enregistré.";
    } catch (error) {
        apiStatusElement.textContent = "Score non enregistré (API indisponible).";
    }
}

async function loadRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/scores`);

        if (!response.ok) {
            apiStatusElement.textContent = "Classement indisponible.";
            return;
        }

        const ranking = await response.json();
        rankingElement.innerHTML = "";

        ranking.forEach((entry) => {
            const item = document.createElement("li");
            item.textContent = `${entry.username} - ${entry.score}`;
            rankingElement.appendChild(item);
        });
    } catch (error) {
        apiStatusElement.textContent = "Classement indisponible.";
    }
}