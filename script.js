const numRows = 6;
const numCols = 5;
let targetWord = "";
let currentRow = 0;
let currentCol = 0;
let board = [];
let gameOver = false;

function pickWord() {
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
}

function setupBoard() {
    board = [];
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";
    for (let r = 0; r < numRows; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        let row = [];
        for (let c = 0; c < numCols; c++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";
            rowDiv.appendChild(cellDiv);
            row.push(cellDiv);
        }
        gameBoard.appendChild(rowDiv);
        board.push(row);
    }
}

function setupKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";

    function makeButton(ltr) {
        const btn = document.createElement("button");
        btn.className = "key";
        btn.textContent = ltr;
        btn.onclick = () => onKey(ltr);
        return btn;
    }

    // First row
    const row1 = document.createElement("div");
    row1.style.display = "flex";
    "qwertyuiop".split("").forEach(l => row1.appendChild(makeButton(l)));
    keyboard.appendChild(row1);

    // Second row
    const row2 = document.createElement("div");
    row2.style.display = "flex";
    "asdfghjkl".split("").forEach(l => row2.appendChild(makeButton(l)));
    keyboard.appendChild(row2);

    // Third row
    const row3 = document.createElement("div");
    row3.style.display = "flex";
    // Add enter key
    const enterBtn = document.createElement("button");
    enterBtn.className = "key";
    enterBtn.textContent = "Enter";
    enterBtn.onclick = () => onEnter();
    row3.appendChild(enterBtn);
    // Letter keys
    "zxcvbnm".split("").forEach(l => row3.appendChild(makeButton(l)));
    // Add backspace key
    const backBtn = document.createElement("button");
    backBtn.className = "key";
    backBtn.textContent = "←";
    backBtn.onclick = () => onBackspace();
    row3.appendChild(backBtn);
    keyboard.appendChild(row3);
}

function showMessage(msg) {
    document.getElementById("message").textContent = msg;
}

function clearMessage() {
    showMessage("");
}

function highlightCurrentCell() {
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            board[r][c].classList.remove("current");
        }
    }
    if (!gameOver && currentRow < numRows && currentCol < numCols) {
        board[currentRow][currentCol].classList.add("current");
    }
}

function onKey(ltr) {
    if (gameOver || currentCol >= numCols) return;
    if (!/^[a-z]$/.test(ltr)) return;
    board[currentRow][currentCol].textContent = ltr;
    currentCol++;
    highlightCurrentCell();
}

function onBackspace() {
    if (gameOver || currentCol === 0) return;
    currentCol--;
    board[currentRow][currentCol].textContent = "";
    highlightCurrentCell();
}

function onEnter() {
    if (gameOver) return;
    if (currentCol < numCols) {
        showMessage("Not enough letters!");
        return;
    }
    // Build guess
    let guess = "";
    for (let c = 0; c < numCols; c++) {
        guess += board[currentRow][c].textContent.toLowerCase();
    }
    if (!WORDS.includes(guess)) {
        showMessage("Not a valid word!");
        return;
    }

    // Color feedback
    let feedback = Array(numCols).fill("absent");
    let targetArr = targetWord.split("");
    let guessArr = guess.split("");

    // First pass: correct spots
    for (let i = 0; i < numCols; i++) {
        if (guessArr[i] === targetArr[i]) {
            feedback[i] = "correct";
            targetArr[i] = null;
        }
    }
    // Second pass: present letters
    for (let i = 0; i < numCols; i++) {
        if (feedback[i] !== "correct" && targetArr.includes(guessArr[i])) {
            feedback[i] = "present";
            targetArr[targetArr.indexOf(guessArr[i])] = null;
        }
    }
    // Color cells and update keyboard
    for (let i = 0; i < numCols; i++) {
        board[currentRow][i].classList.remove("current");
        board[currentRow][i].classList.add(feedback[i]);
        updateKeyColor(guessArr[i], feedback[i]);
    }

    if (guess === targetWord) {
        showMessage("You win! 🎉");
        gameOver = true;
        return;
    }
    currentRow++;
    currentCol = 0;
    highlightCurrentCell();
    if (currentRow >= numRows) {
        showMessage(`Game over! Word was: ${targetWord.toUpperCase()}`);
        gameOver = true;
    } else {
        clearMessage();
    }
}

function updateKeyColor(letter, color) {
    document.querySelectorAll(".key").forEach(btn => {
        if (btn.textContent.toLowerCase() === letter) {
            if (color === "correct" || 
                (color === "present" && !btn.classList.contains("correct")) ||
                (color === "absent" && !btn.classList.contains("correct") && !btn.classList.contains("present"))) {
                btn.classList.remove("absent", "present", "correct");
                btn.classList.add(color);
            }
        }
    });
}

document.addEventListener("keydown", e => {
    if (gameOver) return;
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
        onKey(key);
    } else if (key === "backspace") {
        onBackspace();
    } else if (key === "enter") {
        onEnter();
    }
});

function startGame() {
    pickWord();
    setupBoard();
    setupKeyboard();
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    clearMessage();
    highlightCurrentCell();
}

// Add a restart button
const msgDiv = document.getElementById("message");
const restartBtn = document.createElement("button");
restartBtn.textContent = "Restart";
restartBtn.onclick = startGame;
msgDiv.appendChild(restartBtn);

window.onload = startGame;
