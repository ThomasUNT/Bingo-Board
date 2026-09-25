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
    "Clear any level in any game while one player controls the keyboard and another controls the mouse", "Task 2", "Task 3", "Task 4", "Task 5", "Task 6", "Task 7",
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

const gridContainer = document.getElementById('bingo-grid');
const teamModal = document.getElementById('team-modal');
const scoreRedEl = document.getElementById('score-red');
const scoreBlueEl = document.getElementById('score-blue');
const playerIndicator = document.getElementById('player-indicator');
const changeTeamBtn = document.getElementById('btn-change-team');

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
    playerIndicator.innerText = `Playing for ${team.toUpperCase()} TEAM`;
}

document.getElementById('btn-red').addEventListener('click', () => setTeam('red'));
document.getElementById('btn-blue').addEventListener('click', () => setTeam('blue'));

// Wire up the new Change Team button
changeTeamBtn.addEventListener('click', () => {
    teamModal.classList.remove('hidden');
});

function initializeGrid() {
    gridContainer.innerHTML = ''; 
    tasks.forEach((task, index) => {
        const square = document.createElement('div');
        square.classList.add('bingo-square');
        square.innerText = task;
        square.dataset.index = index; 
        
        square.addEventListener('click', () => handleSquareClick(index));
        gridContainer.appendChild(square);
    });
}

function handleSquareClick(index) {
    if (!myTeam) return; 

    const currentOwner = currentBoardState[index];

    if (currentOwner === myTeam) {
        set(ref(db, `board/${index}`), null);
    } else if (!currentOwner) {
        set(ref(db, `board/${index}`), myTeam);
    }
}

onValue(boardRef, (snapshot) => {
    const data = snapshot.val() || {};
    currentBoardState = data;
    
    let redScore = 0;
    let blueScore = 0;
    
    const squares = document.querySelectorAll('.bingo-square');
    
    squares.forEach((square, index) => {
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
    
    scoreRedEl.innerText = `Red: ${redScore}`;
    scoreBlueEl.innerText = `Blue: ${blueScore}`;
});

initializeGrid();
checkTeam();
