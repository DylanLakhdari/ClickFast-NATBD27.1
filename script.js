// Une fois que le HTML ressemble à ce que vous voulez :
// 1. Faire une variable count, qui stockera le nombre de clics
// 2. Faire un eventListener sur le bouton
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const clickButton = document.getElementById("button-clicker");

let count = 0;
let timeLeft = 5;
let gameActive = true;

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
        gameActive = false;
        clickButton.disabled = true;
        clearInterval(countdown);
    }
}, 1000);