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
    "Win w/o any teammates being eliminated in a team game", "Get 1,000,000 of anything", "Get 3 kills in any online competetive game", "Beat a medium difficulty game of minesweeper", "Roll for a random item in minecraft and go get it (applies to both teams)", "Beat any soulslike boss", "Pet an animal",
    "Beat a night of any FNAF game ", "Die in 3 distinct ways between 3 different games", "Team Blackjack. First player to 5 wins for their team. (you must bet fractions of shots)", "Win a game of team pictionary", "Set yourself on fire", "Win a team game of knight squad (best 2/3)", "Win a team brawl in super smash brothers (best 2/3)",
    "Win a 4 player game of accelerated commander", "Win for your team the draft night merge game", "Travel to the nether in minecraft survival mode", "create a functioning \"vehicle\" in any game", "Get to hard difficulty in any risk of rain game", "complete test chamber 5 in a new run of any portal game", "be the victor for your team in any board game not already listed",
    "get your team to floor 3 of spelunky, if you die rotate to other team", "get to a randomized item in eldenring. If you die, you must swap to another teammate (non-dlc)", "Win mariokart for your team (best 2/3)", "Cook any food item", "win for your team in stick fight the game (best 2/3)", "Win the super smash brothers turnament for your team", "win for your team ultimate chicken horse (best 2/3)",
    "Survive through night 1 of Elden Ring: Nightreign with no relics, solo", "win for your team in any jackbox game best 2/3 must be two different games", "1v1 in genji pingpong.", "get a killstreak in any game", "perform a successful parry in any game (no executor does not count)", "reach the tallest point of the map/game", "win a game of streetbrawl, deadlock",
    "Switch survival minecraft, 2v2. 15 minute prep. PVP.", "complete a puzzle in a non-portal game", "genuinely just do 50 pushups", "Win a game of mario party for your team", "each player on your team makes a paper airplane. The one that flys the longest distance wins", "Craft an item with at least 3 different ingredients",
    "Team poker. First player to 3 wins for their team. (you must bet shots)", "Catch a fish.", "Build the tallest freestanding structure out of paper in 5 minutes.", "Obtain a legendary / gold rarity item in any game", "Take the pokemon quiz (ASK AIDAN) must complete atleast 100 total pokemon. OR a full generation with shadows enabled", "name 100 games in 10 minutes. Must restart if fail. Cannot be numbered sequels but may be titled sequels. If fail. May only do again after 5 minutes have passed", "get 100wpm on a typing test OR win a game of final sentence",
    "Beat any game on the arcade cabinet"
];

// ==========================================
// 3. APP LOGIC
// ==========================================
let myTeam = null;
let currentBoardState = {};

const gridContainer = document.getElementById('bingo-grid');
const gridWrapper = document.getElementById('grid-wrapper');
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

changeTeamBtn.addEventListener('click', () => {
    teamModal.classList.remove('hidden');
});

// Replace your entire initializeGrid() function with this updated version:

function initializeGrid() {
    gridContainer.innerHTML = ''; 
    tasks.forEach((task, index) => {
        const square = document.createElement('div');
        square.classList.add('bingo-square');
        square.innerText = task;
        square.dataset.index = index; 
        
        // --- NEW CLICK VS DRAG LOGIC ---
        let startX, startY;
        
        // When mouse/finger goes down, record the starting coordinates
        square.addEventListener('pointerdown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
        });

        // When mouse/finger goes up, check how far they moved
        square.addEventListener('pointerup', (e) => {
            const diffX = Math.abs(e.clientX - startX);
            const diffY = Math.abs(e.clientY - startY);
            
            // If they moved less than 5 pixels, it was a tap/click. 
            // If they moved more, they were dragging the camera!
            if (diffX < 5 && diffY < 5) {
                handleSquareClick(index);
            }
        });
        
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

// ==========================================
// 4. PANZOOM (DRAG & PINCH-TO-ZOOM)
// ==========================================
// Ensure Panzoom is loaded before initializing
window.addEventListener('load', () => {
    const panzoom = Panzoom(gridContainer, {
        maxScale: 2,         // How far they can zoom in
        minScale: 0.3,       // How far they can zoom out (allows seeing whole grid)
        step: 0.1,           // Zoom speed
        startX: 0,           // Start anchored to left
        startY: 0            // Start anchored to top
    });

    // Allow desktop users to zoom using their mouse wheel
    gridWrapper.addEventListener('wheel', panzoom.zoomWithWheel);
});
