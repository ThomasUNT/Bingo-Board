// Import Firebase functions directly from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4puD-LKUnPOKS5idzZMrQO8YYIdtUiw0",
  authDomain: "bingo-board-239b6.firebaseapp.com",
  projectId: "bingo-board-239b6",
  storageBucket: "bingo-board-239b6.firebasestorage.app",
  messagingSenderId: "1048173610365",
  appId: "1:1048173610365:web:6b93285af74bcdda907814"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const boardRef = ref(db, 'board');

// ==========================================
// 2. GAME SETTINGS & TASKS
// ==========================================
const POINTS_PER_SQUARE = 1; // Easily adjust point values here

// Exactly 49 tasks for a 7x7 grid. 
// They render Left -> Right, Top -> Bottom.
const tasks = [
    "Task 1", "Task 2", "Task 3", "Task 4", "Task 5", "Task 6", "Task 7",
    "Task 8", "Task 9", "Task 10", "Task 11", "Task 12", "Task 13", "Task 14",
    "Task 15", "Task 16", "Task 17", "Task 18", "Task 19", "Task 20", "Task 21",
    "Task 22", "Task 23", "Task 24", "Task 25", "Task 26", "Task 27", "Task 28",
    "Task 29", "Task 30", "Task 31", "Task 32", "Task 33", "Task 34", "Task 35",
    "Task 36", "Task 37", "Task 38", "Task 39", "Task 40", "Task 41", "Task 42",
    "Task 43", "Task 44", "Task 45", "Task 46", "Task 47", "Task 48", "Task 49"
];

// ==========================================
// 3. APP LOGIC
// ==========================================
let myTeam = null;
let currentBoardState = {};

// Elements
const gridContainer = document.getElementById('bingo-grid');
const teamModal = document.getElementById('team-modal');
const scoreRedEl = document.getElementById('score-red');
const scoreBlueEl = document.getElementById('score-blue');
const playerIndicator = document.getElementById('player-indicator');

// Handle Team Selection Memory
function checkTeam() {
    const savedTeam = localStorage.getItem('bingoTeam');
    if (savedTeam) {
        setTeam(savedTeam);
    } else {
        teamModal.classList.remove('hidden');
    }
}

function setTeam(team) {
    myTeam = team;
    localStorage.setItem('bingoTeam', team);
    teamModal.classList.add('hidden');
    playerIndicator.innerText = `You are playing for ${team.toUpperCase()} TEAM`;
}

document.getElementById('btn-red').addEventListener('click', () => setTeam('red'));
document.getElementById('btn-blue').addEventListener('click', () => setTeam('blue'));

// Build the Grid HTML
function initializeGrid() {
    gridContainer.innerHTML = ''; // Clear container
    tasks.forEach((task, index) => {
        const square = document.createElement('div');
        square.classList.add('bingo-square');
        square.innerText = task;
        square.dataset.index = index; // Store index for DB reference
        
        square.addEventListener('click', () => handleSquareClick(index));
        gridContainer.appendChild(square);
    });
}

// Handle Square Clicks
function handleSquareClick(index) {
    if (!myTeam) return; // Prevent clicks if team not selected

    const currentOwner = currentBoardState[index];

    if (currentOwner === myTeam) {
        // Unclaim it if my team already owns it
        set(ref(db, `board/${index}`), null);
    } else if (!currentOwner) {
        // Claim it if it's empty
        set(ref(db, `board/${index}`), myTeam);
    }
    // If owned by opponent, do nothing (locked)
}

// Listen to Firebase Updates in Real-time
onValue(boardRef, (snapshot) => {
    const data = snapshot.val() || {};
    currentBoardState = data;
    
    let redScore = 0;
    let blueScore = 0;
    
    const squares = document.querySelectorAll('.bingo-square');
    
    squares.forEach((square, index) => {
        // Reset classes
        square.classList.remove('red-claimed', 'blue-claimed');
        
        const owner = currentBoardState[index];
        if (owner === 'red') {
            square.classList.add('red-claimed');
            redScore += POINTS_PER_SQUARE;
        } else if (owner === 'blue') {
            square.classList.add('blue-claimed');
            blueScore += POINTS_PER_SQUARE;
        }
    });
    
    // Update Scoreboard
    scoreRedEl.innerText = `Red: ${redScore}`;
    scoreBlueEl.innerText = `Blue: ${blueScore}`;
});

// Start the App
initializeGrid();
checkTeam();
