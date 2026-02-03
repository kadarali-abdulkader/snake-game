const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

// Determine canvas size based on window size for responsiveness logic if needed
// For now, we rely on CSS scaling, but intrinsic resolution is 400x400
const TILE_SIZE = 20;
const TILE_COUNT = canvas.width / TILE_SIZE;

let score = 0;
let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let gameInterval;
let isGameRunning = false;
let isPaused = false;

// Audio context safely ignored for 'simple', but visual cues are good.

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    dx = 1; // Start moving right
    dy = 0;
    scoreElement.textContent = score;
    placeFood();
    gameOverScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    isGameRunning = true;
    isPaused = false;

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 250); // Slower speed (was 150)
}

function gameLoop() {
    if (!isGameRunning || isPaused) return;

    update();
    draw();
}

function update() {
    // Move snake head
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Check Food Collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        placeFood();
        // Snake grows (we don't pop the tail)
    } else {
        snake.pop(); // Remove tail
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#16213e'; // Match CSS game-bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#4cd137'; // Match CSS food-color
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#4cd137";
    ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#e94560'; // Head color
        } else {
            ctx.fillStyle = '#0f3460'; // Body color
            // Gradiant or slight color shift for fun?
        }
        ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
    });
}

function placeFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);

        validPosition = true;
        // Don't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Input Handling
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    // Prevent reversing directly
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    const keyPressed = event.keyCode;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Button Handling (Mobile & Click)
document.getElementById('upBtn').addEventListener('click', () => {
    if (dy !== 1) { dx = 0; dy = -1; }
});
document.getElementById('downBtn').addEventListener('click', () => {
    if (dy !== -1) { dx = 0; dy = 1; }
});
document.getElementById('leftBtn').addEventListener('click', () => {
    if (dx !== 1) { dx = -1; dy = 0; }
});
document.getElementById('rightBtn').addEventListener('click', () => {
    if (dx !== -1) { dx = 1; dy = 0; }
});

restartBtn.addEventListener('click', initGame);
startBtn.addEventListener('click', initGame);

// Initial draw to show start screen background if needed
draw();
