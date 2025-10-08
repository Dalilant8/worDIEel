console.log("JavaScript loaded");
// --- Game Setup Variables ---
const POSSIBLE_WORDS = ['CRANE', 'BLAST', 'CHAIR', 'LIGHT', 'EAGLE', 'SHAPE', 'PLANT', 'TRAIN', 'MOUSE', 'PIANO', 'FROST', 'INDEX'];
const STARTING_WORDS = ['ADIEU', 'CRATE', 'SLANT', 'ROATE', 'RAISE'];

let TARGET_WORD = POSSIBLE_WORDS[Math.floor(Math.random() * POSSIBLE_WORDS.length)]; 
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

let currentGuess = '';
let currentGuessIndex = 0;
let isGameOver = false;

// --- Coin System Variables ---
let userCoins = 5;
const WIN_REWARD = 3;
const HINT_COST_BASE = 2;
const REVEAL_COST_BASE = 3;
let currentHintCost = HINT_COST_BASE;
let currentRevealCost = REVEAL_COST_BASE;
let incurredDebtThisGame = false;

// --- Sound Function (NO-OP replacement for removed Tone.js) ---
function playSound(type) {
    // Sound is intentionally removed. This function now does nothing.
}

// --- Coin Functions ---
function updateCoinDisplay() {
    const coinElement = document.getElementById('coin-count');
    const spanIcon = document.querySelector('#coin-display > span:first-child');
    const spanCount = document.getElementById('coin-count');
    if (userCoins < 0) {
        spanIcon.classList.remove('text-yellow-400');
        spanIcon.classList.add('text-red-500');
        spanCount.classList.remove('text-yellow-400');
        spanCount.classList.add('text-red-500');
    } else {
        spanIcon.classList.remove('text-red-500');
        spanIcon.classList.add('text-yellow-400');
        spanCount.classList.remove('text-red-500');
        spanCount.classList.add('text-yellow-400');
    }
    coinElement.textContent = userCoins;
    updateTooltips();
}

function updateTooltips() {
    const hintButton = document.getElementById('hint-button');
    const revealButton = document.getElementById('reveal-button');
    // Ensure elements exist before setting properties
    if (hintButton) {
        hintButton.title = `🧠 Hint (Cost: ${currentHintCost} Coins)`;
    }
    if (revealButton) {
        revealButton.title = `🔍 Reveal (Cost: ${currentRevealCost} Coins)`;
    }
}

// --- UI Functions ---
function showResult(message, buttonText, buttonAction) {
    const modal = document.getElementById('message-modal');
    const closeButton = document.getElementById('modal-close-button');
    document.getElementById('modal-message-text').textContent = message;
    closeButton.textContent = buttonText;
    closeButton.onclick = () => {
        modal.classList.remove('active');
        modal.classList.add('hidden'); // Use Tailwind class to hide
        if (typeof buttonAction === 'function') buttonAction();
    };
    modal.classList.remove('hidden'); // Use Tailwind class to show
    modal.classList.add('active');
}

function createGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'word-row';
        row.setAttribute('data-row', i);
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.setAttribute('data-col', j);
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function createKeyboard() {
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ];
    keys.forEach((rowKeys, index) => {
        const rowElement = document.getElementById(`row${index + 1}`);
        rowElement.innerHTML = '';
        rowKeys.forEach(keyText => {
            const key = document.createElement('div');
            key.className = 'key';
            key.textContent = keyText.length > 1 ? (keyText === 'BACKSPACE' ? '⌫' : keyText) : keyText;
            key.classList.add(keyText.toLowerCase());
            key.onclick = () => handleKey(keyText);
            rowElement.appendChild(key);
        });
    });
}

function updateRevealButton() {
    const revealButton = document.getElementById('reveal-button');
    const rowElement = document.querySelector(`.word-row[data-row="${currentGuessIndex}"]`);
    if (currentGuessIndex >= 3 && currentGuessIndex < MAX_GUESSES && !isGameOver && rowElement) {
        revealButton.classList.remove('hidden');
        // Logic for positioning the button relative to the current row
        const rowRect = rowElement.getBoundingClientRect();
        const containerRect = document.getElementById('game-container').getBoundingClientRect();
        const newTop = rowRect.top - containerRect.top; 
        revealButton.style.top = `${newTop}px`;
    } else {
        revealButton.classList.add('hidden');
    }
}

function resetGame() {
    currentGuess = '';
    currentGuessIndex = 0;
    isGameOver = false;
    TARGET_WORD = POSSIBLE_WORDS[Math.floor(Math.random() * POSSIBLE_WORDS.length)];
    if (incurredDebtThisGame) {
        currentHintCost = Math.ceil(HINT_COST_BASE * 1.5);
        currentRevealCost = Math.ceil(REVEAL_COST_BASE * 1.5);
        showResult(`Welcome back! Hint costs increased to ${currentHintCost} (🧠) and ${currentRevealCost} (🔍).`, "Got It!", () => {});
    } else {
        currentHintCost = HINT_COST_BASE;
        currentRevealCost = REVEAL_COST_BASE;
    }
    incurredDebtThisGame = false;
    userCoins = 5;
    updateCoinDisplay();
    updateTooltips();
    createGameBoard();
    createKeyboard();
    document.getElementById('hint-button').classList.remove('hidden');
    document.getElementById('reveal-button').classList.add('hidden');
    document.getElementById('hint-button').disabled = false;
    document.getElementById('reveal-button').disabled = false;
    document.querySelectorAll('.key').forEach(key => key.classList.remove('key-correct','key-present','key-absent'));
    console.log(`New game started. Target word is: ${TARGET_WORD}`);
}

window.populateStartingWord = function() {
    const hintButton = document.getElementById('hint-button');
    if (isGameOver || currentGuessIndex !== 0) return;
    hintButton.disabled = true; hintButton.blur();
    userCoins -= currentHintCost;
    if (userCoins < 0) incurredDebtThisGame = true;
    updateCoinDisplay();
    const currentRow = document.querySelector(`.word-row[data-row="${currentGuessIndex}"]`);
    for (let i = 0; i < currentGuess.length; i++) {
        const tile = currentRow.querySelector(`.tile[data-col="${i}"]`);
        tile.textContent = '';
        tile.classList.remove('filled', 'revealed-correct-hint', 'revealed-present-hint');
    }
    currentGuess = '';
    const hintWord = STARTING_WORDS[Math.floor(Math.random() * STARTING_WORDS.length)];
    const typingDelay = 50;
    for (let i = 0; i < hintWord.length; i++) {
        const letter = hintWord[i];
        const tile = currentRow.querySelector(`.tile[data-col="${i}"]`);
        setTimeout(() => { tile.textContent = letter; tile.classList.add('filled'); playSound('keypress'); }, i * typingDelay + 100);
    }
    setTimeout(() => { currentGuess = hintWord; hintButton.disabled = false; }, typingDelay * WORD_LENGTH + 100);
}

// FIXED: Completed the revealLetter function
window.revealLetter = function() {
    const revealButton = document.getElementById('reveal-button');
    if (isGameOver || currentGuessIndex < 3 || currentGuessIndex >= MAX_GUESSES) return;
    const revealIndex = currentGuess.length; 
    if (revealIndex >= WORD_LENGTH) return; // Prevent revealing beyond word length

    // Example implementation: Reveal next letter of TARGET_WORD
    if (userCoins < currentRevealCost) {
        showResult("Not enough coins to reveal a letter!", "Okay", () => {});
        return;
    }
    userCoins -= currentRevealCost;
    if (userCoins < 0) incurredDebtThisGame = true;
    updateCoinDisplay();

    const currentRow = document.querySelector(`.word-row[data-row="${currentGuessIndex}"]`);
    const tile = currentRow.querySelector(`.tile[data-col="${revealIndex}"]`);
    tile.textContent = TARGET_WORD[revealIndex];
    tile.classList.add('filled', 'revealed-correct-hint');
    currentGuess += TARGET_WORD[revealIndex];
    playSound('keypress');
};
// --- Part 2: Guess Handling, Evaluation, and Game Logic ---

/**
 * Handles letter input (physical or on-screen key).
 * @param {string} key - The key pressed.
 */
function handleKey(key) {
    if (isGameOver) return;

    const letter = key.toUpperCase();
    const currentRow = document.querySelector(`.word-row[data-row="${currentGuessIndex}"]`);

    if (letter === 'ENTER') {
        if (currentGuess.length === WORD_LENGTH) {
            checkGuess(currentRow);
        } else {
            playSound('invalid');
            showResult("Not enough letters!", "Okay", () => {});
            setTimeout(() => {
                const modal = document.getElementById('message-modal');
                if(modal) modal.classList.remove('active', 'hidden');
            }, 1000);
        }
    } else if (letter === 'BACKSPACE' || letter === 'DELETE') {
        handleBackspace(currentRow);
    } else if (letter.length === 1 && letter >= 'A' && letter <= 'Z' && currentGuess.length < WORD_LENGTH) {
        handleLetterInput(letter, currentRow);
    }
}

function handleLetterInput(letter, row) {
    if (currentGuess.length < WORD_LENGTH) {
        const tile = row.querySelector(`.tile[data-col="${currentGuess.length}"]`);
        tile.textContent = letter;
        tile.classList.add('filled');
        tile.classList.remove('revealed-correct-hint', 'revealed-present-hint');
        currentGuess += letter;
        playSound('keypress');
    }
}

function handleBackspace(row) {
    if (currentGuess.length > 0) {
        const tileIndex = currentGuess.length - 1;
        const tile = row.querySelector(`.tile[data-col="${tileIndex}"]`);
        tile.textContent = '';
        tile.classList.remove('filled', 'revealed-correct-hint', 'revealed-present-hint');
        currentGuess = currentGuess.slice(0, -1);
        playSound('keypress');
    }
}

function checkGuess(currentRow) {
    const guess = currentGuess;
    const target = TARGET_WORD;
    let targetCopy = Array.from(target);
    const guessTiles = Array.from(currentRow.querySelectorAll('.tile'));

    const wasFirstGuess = currentGuessIndex === 0;

    // Determine correct letters
    const results = Array(WORD_LENGTH).fill(null);
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === target[i]) {
            results[i] = 'correct';
            targetCopy[i] = null;
        }
    }

    // Determine present/absent letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (results[i] === null) {
            const letter = guess[i];
            const targetIndex = targetCopy.indexOf(letter);
            results[i] = targetIndex !== -1 ? 'present' : 'absent';
            if (targetIndex !== -1) targetCopy[targetIndex] = null;
        }
    }

    // Apply styles and keyboard updates
    let correctCount = 0;
    results.forEach((result, i) => {
        const tile = guessTiles[i];
        const key = document.querySelector(`.key.${guess[i].toLowerCase()}`);

        setTimeout(() => {
            tile.classList.remove('revealed-correct-hint', 'revealed-present-hint');
            tile.classList.add(result);
        }, i * 300);

        if (result === 'correct') {
            key.classList.remove('key-present', 'key-absent');
            key.classList.add('key-correct');
            correctCount++;
        } else if (result === 'present' && !key.classList.contains('key-correct')) {
            key.classList.remove('key-absent');
            key.classList.add('key-present');
        } else if (result === 'absent' && !key.classList.contains('key-correct') && !key.classList.contains('key-present')) {
            key.classList.add('key-absent');
        }
    });

    // Win/Loss check
    setTimeout(() => {
        if (correctCount === WORD_LENGTH) {
            isGameOver = true;
            userCoins += WIN_REWARD;
            updateCoinDisplay();
            playSound('win');
            showResult(`You won! You earned ${WIN_REWARD} coins! The word was ${TARGET_WORD}.`, "Play Again", resetGame);
        }

        currentGuessIndex++;
        currentGuess = '';

        if (wasFirstGuess) {
            document.getElementById('hint-button').classList.add('hidden');
            document.getElementById('hint-button').disabled = true;
        }

        updateRevealButton();

        if (currentGuessIndex >= MAX_GUESSES && !isGameOver) {
            isGameOver = true;
            document.getElementById('reveal-button').classList.add('hidden');
            document.getElementById('reveal-button').disabled = true;
            playSound('fail');
            showResult(`Game Over! The word was ${TARGET_WORD}.`, "Play Again", resetGame);
        }
    }, WORD_LENGTH * 300 + 100);
}

// Global keyboard listener
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    if (e.key === 'Enter') {
        if (document.activeElement.tagName !== 'BUTTON') handleKey('ENTER');
    } else if (e.key === 'Backspace') {
        handleKey('BACKSPACE');
    } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        handleKey(e.key);
    }
});

// Recalculate reveal button on resize
window.addEventListener('resize', () => updateRevealButton());

// Initialize game
window.onload = function () {
    // Note: The script is placed just before </body>, so the DOM is ready here.
    resetGame();
};
