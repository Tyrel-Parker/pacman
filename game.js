// ─── ON-SCREEN ERROR LOG ─────────────────────────────────────────────────────
const errorLog = document.getElementById('error-log');
function logError(msg) {
  errorLog.style.display = 'block';
  errorLog.textContent += msg + '\n';
}
window.addEventListener('error', e => logError('ERR: ' + e.message + ' (' + e.lineno + ')'));
window.addEventListener('unhandledrejection', e => logError('REJ: ' + e.reason));

// ─── MAZE ────────────────────────────────────────────────────────────────────
// 0=dot 1=wall 2=empty 3=energizer 4=ghost-house-door 5=ghost-house-floor
const RAW_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,4,4,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,5,5,5,5,5,5,1,2,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,2,0,2,2,2,1,5,5,5,5,5,5,1,2,2,2,0,2,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,5,5,5,5,5,5,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,3,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const COLS = RAW_MAZE[0].length; // 28
const ROWS = RAW_MAZE.length;    // 29

// ─── CANVAS SETUP ────────────────────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const CELL = 20;
canvas.width  = COLS * CELL;
canvas.height = ROWS * CELL;

function resizeCanvas() {
  const maxW = window.innerWidth - 16;
  const maxH = window.innerHeight - 110;
  const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
  canvas.style.width  = (canvas.width  * scale) + 'px';
  canvas.style.height = (canvas.height * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);

// ─── GAME STATE ──────────────────────────────────────────────────────────────
let maze, totalDots, score, lives, gameState, frightenedTimer;
let floatingScores = [], freezeTimer = 0;
let leaderboard = JSON.parse(localStorage.getItem('pacman-leaderboard') || '[]');
let lastScore = 0;
let level = 1, dotsEaten = 0, fruitState = null;
let helpOpen = false;
// gameState: 'highscore' | 'nameentry' | 'playing' | 'dying' | 'levelclear' | 'gameover'

// ─── FRUIT DATA ───────────────────────────────────────────────────────────────
const FRUIT_PTS  = [100, 300, 500, 700, 1000, 2000, 3000, 5000];
const FRUIT_X = 13, FRUIT_Y = 16;
const FRUIT_SPAWN_1 = 70, FRUIT_SPAWN_2 = 170, FRUIT_LIFE = 600;

function getFruitType() {
  if (level === 1)  return 0;
  if (level === 2)  return 1;
  if (level <= 4)   return 2;
  if (level <= 6)   return 3;
  if (level <= 8)   return 4;
  if (level <= 10)  return 5;
  if (level <= 12)  return 6;
  return 7;
}

const DIRS = {
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
};

function cloneMaze() { return RAW_MAZE.map(r => [...r]); }

function countDots(m) {
  let n = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (m[r][c] === 0 || m[r][c] === 3) n++;
  return n;
}

// ─── PAC-MAN ─────────────────────────────────────────────────────────────────
const pac = {
  x: 13, y: 21,
  dir: { x: 0, y: 0 },
  nextDir: { x: 0, y: 0 },
  speed: 0.1,
  mouthAngle: 0,
  mouthDir: 1,
  dead: false,
  deathFrame: 0,
};

function resetPac() {
  pac.x = 13; pac.y = 21;
  pac.dir = { x: 0, y: 0 };
  pac.nextDir = { x: 0, y: 0 };
  pac.dead = false;
  pac.deathFrame = 0;
}

// ─── GHOSTS ──────────────────────────────────────────────────────────────────
// Modes: 'house' | 'exiting' | 'scatter' | 'chase' | 'frightened' | 'eaten'
const GHOST_COLORS = ['#FF0000','#FFB8FF','#00FFFF','#FFB852'];
const GHOST_NAMES  = ['Blinky','Pinky','Inky','Clyde'];

const SCATTER_TARGETS = [
  { x: 25, y: 0 },  // Blinky: top-right
  { x: 2,  y: 0 },  // Pinky:  top-left
  { x: 27, y: 29 }, // Inky:   bottom-right
  { x: 0,  y: 29 }, // Clyde:  bottom-left
];

const GHOST_STARTS = [
  { x: 13.5, y: 11, houseTimer: 0    }, // Blinky exits immediately
  { x: 11.5, y: 13, houseTimer: 100  }, // Pinky
  { x: 13.5, y: 13, houseTimer: 200  }, // Inky
  { x: 15.5, y: 13, houseTimer: 300  }, // Clyde
];

let ghosts = [];

function makeGhost(i) {
  return {
    id: i,
    x: GHOST_STARTS[i].x,
    y: GHOST_STARTS[i].y,
    dir: { x: 1, y: 0 },
    mode: i === 0 ? 'exiting' : 'house',
    houseTimer: GHOST_STARTS[i].houseTimer,
    speed: 0.08,
    color: GHOST_COLORS[i],
    name: GHOST_NAMES[i],
    prevDir: { x: 1, y: 0 },
    frightFlash: false,
  };
}

function resetGhosts() {
  ghosts = [0,1,2,3].map(makeGhost);
}

// ─── SCATTER / CHASE TIMING ──────────────────────────────────────────────────
const PHASE_TIMES = [700, 2000, 700, 2000, 400, 3000, 400, Infinity];
let phaseIndex, phaseTick;

// ─── CONTROLS ────────────────────────────────────────────────────────────────
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let controlMode = isMobile ? 'swipe' : 'keys';
let pendingDir = null;

const modeBtn = document.getElementById('mode-btn');
const helpBtn = document.getElementById('help-btn');
const helpOverlay = document.getElementById('help-overlay');
const helpModeHintBtn = document.getElementById('mode-hint-btn');

let swipeStart = null;
document.addEventListener('touchstart', e => {
  if (helpOverlay.contains(e.target)) return;
  if (e.target.closest('button')) return;
  e.preventDefault();
  swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: false });

document.addEventListener('touchend', e => {
  if (helpOverlay.contains(e.target)) return;
  if (e.target.closest('button')) return;
  e.preventDefault();
  if (helpOpen) return;
  if (!swipeStart) return;
  const dx = e.changedTouches[0].clientX - swipeStart.x;
  const dy = e.changedTouches[0].clientY - swipeStart.y;
  swipeStart = null;

  if (gameState === 'nameentry') {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      advanceNameCursor(1);
    } else if (Math.abs(dy) > Math.abs(dx)) {
      cycleNameChar(dy > 0 ? 1 : -1);
    } else {
      advanceNameCursor(dx > 0 ? 1 : -1);
    }
    return;
  }

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    handleStart();
    return;
  }

  if (controlMode !== 'swipe') return;
  if (Math.abs(dx) > Math.abs(dy)) {
    pendingDir = dx > 0 ? DIRS.right : DIRS.left;
  } else {
    pendingDir = dy > 0 ? DIRS.down : DIRS.up;
  }
}, { passive: false });

const keysDown = {};
document.addEventListener('keydown', e => {
  keysDown[e.code] = true;
  if (helpOpen) {
    if (e.code === 'Escape') { closeHelp(); e.preventDefault(); }
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    handleStart();
  }
  if (gameState === 'nameentry') {
    e.preventDefault();
    if (e.code === 'ArrowUp'    || e.code === 'KeyW') cycleNameChar(-1);
    if (e.code === 'ArrowDown'  || e.code === 'KeyS') cycleNameChar(1);
    if (e.code === 'ArrowLeft'  || e.code === 'KeyA') advanceNameCursor(-1);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') advanceNameCursor(1);
    if (e.code === 'Enter') confirmName();
    return;
  }
  if (controlMode !== 'keys') return;
  const map = {
    ArrowLeft: DIRS.left, KeyA: DIRS.left,
    ArrowRight: DIRS.right, KeyD: DIRS.right,
    ArrowUp: DIRS.up, KeyW: DIRS.up,
    ArrowDown: DIRS.down, KeyS: DIRS.down,
  };
  if (map[e.code]) { pendingDir = map[e.code]; e.preventDefault(); }
});

// Tilt
let tiltPermissionGranted = false;
let tiltEventReceived = false, tiltCheckTimer = null;
const tiltIndicator = document.getElementById('tilt-indicator');

async function requestTiltPermission() {
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      return result === 'granted';
    } catch { return false; }
  }
  return true;
}

function handleOrientation(e) {
  if (controlMode !== 'tilt') return;
  tiltEventReceived = true;
  const beta  = e.beta  ?? 0;
  const gamma = e.gamma ?? 0;
  tiltIndicator.textContent = `b${beta.toFixed(0)} g${gamma.toFixed(0)}`;
  if (gameState !== 'playing') return;
  const THRESH = 10;
  if (Math.abs(gamma) > Math.abs(beta)) {
    if (gamma >  THRESH) pendingDir = DIRS.right;
    if (gamma < -THRESH) pendingDir = DIRS.left;
  } else {
    if (beta  >  THRESH) pendingDir = DIRS.down;
    if (beta  < -THRESH) pendingDir = DIRS.up;
  }
}
window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('deviceorientationabsolute', handleOrientation);

const MODES = ['keys', 'swipe', 'tilt'];
const MODE_LABELS = { keys: '⌨ KEYS', swipe: '👆 SWIPE', tilt: '📱 TILT' };
modeBtn.textContent = MODE_LABELS[controlMode];

modeBtn.addEventListener('click', async () => {
  const nextIndex = (MODES.indexOf(controlMode) + 1) % MODES.length;
  const next = MODES[nextIndex];
  if (next === 'tilt' && !tiltPermissionGranted) {
    tiltPermissionGranted = await requestTiltPermission();
    if (!tiltPermissionGranted) {
      setMessage('TILT NOT AVAILABLE');
      return;
    }
  }
  controlMode = next;
  modeBtn.textContent = MODE_LABELS[controlMode];
  modeBtn.classList.toggle('tilt-active', controlMode === 'tilt');
  tiltIndicator.textContent = controlMode === 'tilt' ? 'TILT ACTIVE' : '';
  clearTimeout(tiltCheckTimer);
  if (controlMode === 'tilt') {
    tiltEventReceived = false;
    tiltCheckTimer = setTimeout(() => {
      if (controlMode === 'tilt' && !tiltEventReceived) {
        tiltIndicator.textContent = 'TILT BLOCKED - CHECK BROWSER SETTINGS';
      }
    }, 2000);
  }
});

// ─── HELP MODAL ──────────────────────────────────────────────────────────────
function openHelp() {
  helpOpen = true;
  helpModeHintBtn.textContent = modeBtn.textContent;
  modeBtn.classList.add('help-highlight');
  helpOverlay.classList.add('open');
}

function closeHelp() {
  helpOpen = false;
  modeBtn.classList.remove('help-highlight');
  helpOverlay.classList.remove('open');
}

helpBtn.addEventListener('click', openHelp);
document.getElementById('help-close').addEventListener('click', closeHelp);
helpOverlay.addEventListener('click', e => {
  if (e.target === helpOverlay) closeHelp();
});

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
const NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
let nameChars = ['A','A','A'], nameCursor = 0;

function saveLeaderboard() {
  localStorage.setItem('pacman-leaderboard', JSON.stringify(leaderboard));
}
function qualifiesForLeaderboard(s) {
  return s > 0 && (leaderboard.length < 10 || s > leaderboard[leaderboard.length - 1].score);
}
function addToLeaderboard(name, s) {
  leaderboard.push({ name, score: s });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) leaderboard.length = 10;
  saveLeaderboard();
}
function cycleNameChar(dir) {
  const i = NAME_CHARS.indexOf(nameChars[nameCursor]);
  nameChars[nameCursor] = NAME_CHARS[(i + dir + NAME_CHARS.length) % NAME_CHARS.length];
}
function advanceNameCursor(dir) {
  if (dir > 0 && nameCursor === 2) { confirmName(); return; }
  nameCursor = Math.max(0, Math.min(2, nameCursor + dir));
}
function confirmName() {
  const name = nameChars.join('').trimEnd() || '???';
  localStorage.setItem('pacman-last-name', name);
  addToLeaderboard(name, lastScore);
  gameState = 'highscore';
}

// ─── GAME INIT ───────────────────────────────────────────────────────────────
function initGame() {
  maze = cloneMaze();
  totalDots = countDots(maze);
  score = 0;
  lives = 3;
  gameState = 'highscore';
  frightenedTimer = 0;
  phaseIndex = 0;
  phaseTick = 0;
  floatingScores = [];
  freezeTimer = 0;
  level = 1;
  dotsEaten = 0;
  fruitState = null;
  resetPac();
  resetGhosts();
  updateHUD();
  setMessage('');
}

function startLevel() {
  gameState = 'playing';
  setMessage('');
  frightenedTimer = 0;
  phaseIndex = 0;
  phaseTick = 0;
  floatingScores = [];
  freezeTimer = 0;
  dotsEaten = 0;
  fruitState = null;
}

function handleStart() {
  if (gameState === 'highscore') {
    initGame();
    startLevel();
  } else if (gameState === 'nameentry') {
    advanceNameCursor(1);
  } else if (gameState === 'dying') {
    respawn();
  } else if (gameState === 'levelclear') {
    level++;
    maze = cloneMaze();
    totalDots = countDots(maze);
    resetPac();
    resetGhosts();
    startLevel();
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function setMessage(t) { document.getElementById('message').textContent = t; }
function updateHUD() {
  document.getElementById('score-val').textContent = score;
  document.getElementById('lives-val').textContent = lives;
}

function canMove(cx, cy, dir) {
  const nx = cx + dir.x;
  const ny = cy + dir.y;
  const wnx = ((nx % COLS) + COLS) % COLS;
  const wny = Math.round(ny);
  if (wny < 0 || wny >= ROWS) return false;
  const cell = maze[wny][wnx];
  return cell !== 1 && cell !== 4;
}

function tileCenter(v) { return Math.abs(v - Math.round(v)) < 0.15; }

// ─── PAC MOVEMENT ────────────────────────────────────────────────────────────
function updatePac() {
  if (pac.dead) return;

  if (pendingDir && tileCenter(pac.x) && tileCenter(pac.y)) {
    if (canMove(Math.round(pac.x), Math.round(pac.y), pendingDir)) {
      pac.dir = { ...pendingDir };
      pendingDir = null;
    }
  }

  if (pac.dir.x !== 0 || pac.dir.y !== 0) {
    const nx = pac.x + pac.dir.x * pac.speed;
    const ny = pac.y + pac.dir.y * pac.speed;
    const rx = Math.round(nx), ry = Math.round(ny);

    if (tileCenter(nx) && tileCenter(ny)) {
      if (canMove(rx, ry, pac.dir)) {
        pac.x = nx; pac.y = ny;
      } else {
        pac.x = rx; pac.y = ry;
        pac.dir = { x: 0, y: 0 };
      }
    } else {
      pac.x = nx; pac.y = ny;
    }

    if (pac.x < 0) pac.x = COLS - 0.5;
    if (pac.x >= COLS) pac.x = 0.5;
  }

  pac.mouthAngle += 0.15 * pac.mouthDir;
  if (pac.mouthAngle > 0.35) pac.mouthDir = -1;
  if (pac.mouthAngle < 0.02) pac.mouthDir =  1;

  const cr = Math.round(pac.y), cc = Math.round(pac.x);
  if (cr >= 0 && cr < ROWS && cc >= 0 && cc < COLS) {
    const cell = maze[cr][cc];
    if (cell === 0) {
      maze[cr][cc] = 2;
      score += 10;
      updateHUD();
      totalDots--;
      dotsEaten++;
      if (!fruitState && (dotsEaten === FRUIT_SPAWN_1 || dotsEaten === FRUIT_SPAWN_2)) fruitState = { timer: FRUIT_LIFE };
      if (totalDots <= 0) { gameState = 'levelclear'; setMessage(isMobile ? 'LEVEL CLEAR! TAP TO CONTINUE' : 'LEVEL CLEAR! PRESS SPACE'); }
    } else if (cell === 3) {
      maze[cr][cc] = 2;
      score += 50;
      updateHUD();
      totalDots--;
      dotsEaten++;
      frightenedTimer = 600;
      ghosts.forEach(g => {
        if (g.mode !== 'eaten' && g.mode !== 'house' && g.mode !== 'exiting') {
          g.mode = 'frightened';
          g.dir = { x: -g.dir.x, y: -g.dir.y };
        }
      });
    }
  }
}

// ─── GHOST AI ────────────────────────────────────────────────────────────────
function ghostTarget(g) {
  const px = Math.round(pac.x), py = Math.round(pac.y);
  if (g.mode === 'scatter') return SCATTER_TARGETS[g.id];
  switch (g.id) {
    case 0: return { x: px, y: py };
    case 1: return { x: px + pac.dir.x * 4, y: py + pac.dir.y * 4 };
    case 2: {
      const ahead = { x: px + pac.dir.x * 2, y: py + pac.dir.y * 2 };
      const blinky = ghosts[0];
      return { x: ahead.x + (ahead.x - blinky.x), y: ahead.y + (ahead.y - blinky.y) };
    }
    case 3: {
      const dist = Math.hypot(g.x - px, g.y - py);
      return dist > 8 ? { x: px, y: py } : SCATTER_TARGETS[3];
    }
  }
}

function dist2(ax, ay, bx, by) { return (ax-bx)**2 + (ay-by)**2; }

function ghostNeighbors(g) {
  const cx = Math.round(g.x), cy = Math.round(g.y);
  const dirs = [DIRS.up, DIRS.left, DIRS.down, DIRS.right];
  return dirs.filter(d => {
    if (d.x === -g.dir.x && d.y === -g.dir.y) return false;
    const nx = ((cx + d.x) % COLS + COLS) % COLS;
    const ny = cy + d.y;
    if (ny < 0 || ny >= ROWS) return false;
    const cell = maze[ny][nx];
    if (cell === 1) return false;
    if ((cell === 4 || cell === 5) && g.mode !== 'eaten') return false;
    return true;
  });
}

function updateGhostMode(g) {
  if (g.mode === 'house') {
    g.houseTimer--;
    if (g.houseTimer <= 0) g.mode = 'exiting';
    return;
  }
  if (g.mode === 'exiting') {
    const targetX = 13.5, targetY = 11;
    const dx = targetX - g.x, dy = targetY - g.y;
    if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
      g.x = targetX; g.y = targetY;
      g.mode = 'scatter';
      g.dir = { x: -1, y: 0 };
    } else {
      if (Math.abs(dy) > 0.1) { g.y += Math.sign(dy) * g.speed; }
      else { g.x += Math.sign(dx) * g.speed; }
    }
    return;
  }
  if (g.mode === 'eaten') {
    const tx = 13.5, ty = 13;
    const dx = tx - g.x, dy = ty - g.y;
    if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
      g.x = tx; g.y = ty;
      g.mode = 'exiting';
    }
    return;
  }
  if (g.mode === 'frightened') {
    if (frightenedTimer <= 0) g.mode = phaseIndex % 2 === 0 ? 'scatter' : 'chase';
    return;
  }
  const expectedMode = phaseIndex % 2 === 0 ? 'scatter' : 'chase';
  if (g.mode !== expectedMode) g.mode = expectedMode;
}

function moveGhost(g) {
  if (g.mode === 'house' || g.mode === 'exiting') return;

  const atCenter = tileCenter(g.x) && tileCenter(g.y);
  if (!atCenter) {
    g.x += g.dir.x * g.speed;
    g.y += g.dir.y * g.speed;
    g.x = ((g.x % COLS) + COLS) % COLS;
    return;
  }

  const neighbors = ghostNeighbors(g);
  if (neighbors.length === 0) { g.dir = { x: -g.dir.x, y: -g.dir.y }; return; }

  let chosen;
  if (g.mode === 'frightened') {
    chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
  } else if (g.mode === 'eaten') {
    const tx = 13.5, ty = 13;
    chosen = neighbors.reduce((best, d) => {
      const cx2 = Math.round(g.x) + d.x, cy2 = Math.round(g.y) + d.y;
      return dist2(cx2, cy2, tx, ty) < dist2(Math.round(g.x)+best.x, Math.round(g.y)+best.y, tx, ty) ? d : best;
    });
  } else {
    const t = ghostTarget(g);
    chosen = neighbors.reduce((best, d) => {
      const cx2 = Math.round(g.x) + d.x, cy2 = Math.round(g.y) + d.y;
      return dist2(cx2, cy2, t.x, t.y) < dist2(Math.round(g.x)+best.x, Math.round(g.y)+best.y, t.x, t.y) ? d : best;
    });
  }

  g.dir = chosen;
  g.x += g.dir.x * g.speed;
  g.y += g.dir.y * g.speed;
}

let eatCombo = 0;
function checkCollisions() {
  ghosts.forEach(g => {
    if (g.mode === 'eaten') return;
    const dx = Math.abs(pac.x - g.x);
    const dy = Math.abs(pac.y - g.y);
    if (dx < 0.8 && dy < 0.8) {
      if (g.mode === 'frightened') {
        g.mode = 'eaten';
        const pts = 200 * Math.pow(2, eatCombo);
        eatCombo++;
        score += pts;
        updateHUD();
        showFloatingScore(pts, g.x, g.y);
        freezeTimer = 50;
      } else {
        killPac();
      }
    }
  });
}

function showFloatingScore(pts, gx, gy) {
  floatingScores.push({ x: gx, y: gy, pts, timer: 50 });
}

function killPac() {
  if (pac.dead) return;
  pac.dead = true;
  gameState = 'dying';
  lives--;
  updateHUD();
  setTimeout(() => {
    if (lives <= 0) {
      lastScore = score;
      gameState = 'gameover';
      setMessage('GAME OVER');
      setTimeout(() => {
        setMessage('');
        if (qualifiesForLeaderboard(lastScore)) {
          const saved = localStorage.getItem('pacman-last-name') || 'AAA';
          nameChars = (saved.padEnd(3, ' ').slice(0, 3)).split('');
          nameCursor = 0;
          gameState = 'nameentry';
        } else {
          gameState = 'highscore';
        }
      }, 2000);
    } else {
      setMessage(isMobile ? 'TAP TO CONTINUE' : 'PRESS SPACE TO CONTINUE');
    }
  }, 1200);
}

function respawn() {
  resetPac();
  resetGhosts();
  startLevel();
}

// ─── DRAW ────────────────────────────────────────────────────────────────────
const WALL_COLOR   = '#1a1aff';
const WALL_GLOW    = '#4444ff';
const DOT_COLOR    = '#ffddaa';
const ENRG_COLOR   = '#FFD700';

function drawMaze() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = maze[r][c];
      const x = c * CELL, y = r * CELL;
      if (cell === 1) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x, y, CELL, CELL);
        ctx.strokeStyle = WALL_GLOW;
        ctx.lineWidth = 1;
        ctx.strokeRect(x+1, y+1, CELL-2, CELL-2);
      } else if (cell === 0) {
        ctx.fillStyle = DOT_COLOR;
        ctx.beginPath();
        ctx.arc(x + CELL/2, y + CELL/2, 2, 0, Math.PI*2);
        ctx.fill();
      } else if (cell === 3) {
        ctx.fillStyle = ENRG_COLOR;
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 180);
        ctx.beginPath();
        ctx.arc(x + CELL/2, y + CELL/2, 4 + pulse * 2, 0, Math.PI*2);
        ctx.fill();
      } else if (cell === 4) {
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(x+2, y + CELL/2 - 1, CELL-4, 3);
      }
    }
  }
}

function drawPac() {
  const x = pac.x * CELL + CELL/2;
  const y = pac.y * CELL + CELL/2;
  const r = CELL/2 - 1;

  if (pac.dead) {
    pac.deathFrame += 0.05;
    const angle = Math.min(pac.deathFrame * Math.PI, Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, angle, Math.PI * 2 - angle);
    ctx.closePath();
    ctx.fill();
    return;
  }

  const angle = Math.atan2(pac.dir.y, pac.dir.x);
  const mouth = pac.mouthAngle;

  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, angle + mouth, angle + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGhosts() {
  ghosts.forEach(g => {
    const x = g.x * CELL + CELL/2;
    const y = g.y * CELL + CELL/2;
    const r = CELL/2 - 1;

    if (g.mode === 'eaten') {
      drawGhostEyes(x, y, g.dir, '#fff');
      return;
    }

    let color = g.color;
    if (g.mode === 'frightened') {
      const flash = frightenedTimer < 150 && Math.floor(Date.now() / 200) % 2 === 0;
      color = flash ? '#ffffff' : '#2121DE';
    }

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.arc(x, y - 1, r, Math.PI, 0);
    const waveY = y + r - 2;
    const segments = 3;
    const segW = (r * 2) / segments;
    ctx.lineTo(x + r, waveY);
    for (let i = segments; i >= 0; i--) {
      const sx = (x - r) + i * segW;
      const peakY = waveY + (i % 2 === 0 ? 4 : 0);
      ctx.lineTo(sx, peakY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    drawGhostEyes(x, y - 2, g.dir, '#fff', g.mode === 'frightened' ? '#2121DE' : '#000');
  });
}

function drawGhostEyes(x, y, dir, white, pupil) {
  const ew = 3, eh = 4;
  [-4, 4].forEach(ox => {
    ctx.fillStyle = white || '#fff';
    ctx.beginPath();
    ctx.ellipse(x + ox, y, ew, eh, 0, 0, Math.PI*2);
    ctx.fill();
    if (pupil !== undefined) {
      ctx.fillStyle = pupil;
      ctx.beginPath();
      ctx.arc(x + ox + (dir.x * 1.5), y + (dir.y * 1.5), 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  });
}

function drawLeaderboard() {
  const cx = canvas.width / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,10,0.90)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#FFD700';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HIGH SCORES', cx, 40);

  if (leaderboard.length === 0) {
    ctx.fillStyle = '#444466';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('NO RECORDS YET', cx, 200);
  } else {
    ctx.fillStyle = '#444466';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('#', 28, 72);
    ctx.fillText('NAME', 90, 72);
    ctx.textAlign = 'right';
    ctx.fillText('SCORE', 532, 72);

    leaderboard.forEach((entry, i) => {
      const y = 93 + i * 22;
      const isLast = lastScore > 0 && entry.score === lastScore &&
        i === leaderboard.findIndex(e => e.score === lastScore && e.name === entry.name);
      ctx.fillStyle = isLast ? '#FFD700' : (i % 2 === 0 ? '#FFFFFF' : '#AAAACC');
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}.`, 20, y);
      ctx.fillText(entry.name.padEnd(3, ' '), 80, y);
      ctx.textAlign = 'right';
      ctx.fillText(String(entry.score).padStart(6, '0'), 540, y);
    });
  }

  if (Math.floor(Date.now() / 550) % 2 === 0) {
    ctx.fillStyle = '#00FFFF';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isMobile ? 'TAP TO PLAY' : 'PRESS SPACE TO PLAY', cx, 330);
  }

  ctx.restore();
}

function drawNameEntry() {
  const cx = canvas.width / 2;
  const slotY = 260;
  const slotSpacing = 64;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,10,0.92)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#FFD700';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillText('NEW HIGH SCORE!', cx, 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillText(String(lastScore).padStart(6, '0'), cx, 115);

  ctx.fillStyle = '#888888';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText('ENTER YOUR NAME', cx, 185);

  [-1, 0, 1].forEach((offset, i) => {
    const sx = cx + offset * slotSpacing;
    const active = i === nameCursor;

    ctx.fillStyle = active ? '#1a1a44' : '#0a0a22';
    ctx.fillRect(sx - 22, slotY - 24, 44, 48);
    ctx.strokeStyle = active ? '#FFD700' : '#333366';
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeRect(sx - 22, slotY - 24, 44, 48);

    ctx.fillStyle = active ? '#FFD700' : '#FFFFFF';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText(nameChars[i], sx, slotY);

    const arrowColor = active ? '#FFD700' : '#333366';
    ctx.fillStyle = arrowColor;
    ctx.beginPath(); ctx.moveTo(sx, slotY-42); ctx.lineTo(sx-8,slotY-32); ctx.lineTo(sx+8,slotY-32); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx, slotY+42); ctx.lineTo(sx-8,slotY+32); ctx.lineTo(sx+8,slotY+32); ctx.closePath(); ctx.fill();
  });

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(isMobile ? 'UP/DN:LETTER  LT/RT:MOVE  TAP:NEXT' : 'UP/DN: LETTER    LT/RT: MOVE    ENTER: OK', cx, 355);

  ctx.restore();
}

function drawFloatingScores() {
  if (floatingScores.length === 0) return;
  ctx.save();
  ctx.font = 'bold 10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00FFFF';
  floatingScores.forEach(s => {
    ctx.fillText(String(s.pts), s.x * CELL + CELL / 2, s.y * CELL + CELL / 2);
  });
  ctx.restore();
}

function updateFruit() {
  if (!fruitState) return;
  if (--fruitState.timer <= 0) { fruitState = null; return; }
  if (Math.abs(pac.x - FRUIT_X) < 0.8 && Math.abs(pac.y - FRUIT_Y) < 0.8) {
    const pts = FRUIT_PTS[getFruitType()];
    score += pts;
    updateHUD();
    showFloatingScore(pts, FRUIT_X, FRUIT_Y);
    fruitState = null;
  }
}

function drawFruitSprite() {
  if (!fruitState) return;
  const px = FRUIT_X * CELL + CELL / 2;
  const py = FRUIT_Y * CELL + CELL / 2;
  const pulse = 0.88 + 0.12 * Math.sin(Date.now() / 250);
  ctx.save();
  ctx.shadowBlur = 10;
  const t = getFruitType();
  switch (t) {
    case 0: { // Cherry
      ctx.shadowColor = '#FF4444'; ctx.fillStyle = '#CC0000';
      ctx.beginPath(); ctx.arc(px - 3, py + 2, 4 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 3, py + 2, 4 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = '#33AA33'; ctx.strokeStyle = '#33AA33'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px - 3, py - 2); ctx.quadraticCurveTo(px, py - 7, px + 3, py - 2); ctx.stroke();
      break;
    }
    case 1: { // Strawberry
      ctx.shadowColor = '#FF4466'; ctx.fillStyle = '#DD1133';
      ctx.beginPath(); ctx.arc(px, py + 1, 6 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFEE44';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(px + Math.cos(a) * 3.5, py + 1 + Math.sin(a) * 3.5, 1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowColor = '#22BB22'; ctx.fillStyle = '#22BB22';
      ctx.beginPath(); ctx.moveTo(px - 4, py - 5); ctx.lineTo(px, py - 2); ctx.lineTo(px + 4, py - 5); ctx.closePath(); ctx.fill();
      break;
    }
    case 2: { // Orange
      ctx.shadowColor = '#FF8800'; ctx.fillStyle = '#FF8800';
      ctx.beginPath(); ctx.arc(px, py, 7 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFCC77';
      ctx.beginPath(); ctx.arc(px - 2, py - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = '#33AA33'; ctx.strokeStyle = '#33AA33'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px + 4, py - 5); ctx.quadraticCurveTo(px + 8, py - 10, px + 5, py - 8); ctx.stroke();
      break;
    }
    case 3: { // Apple
      ctx.shadowColor = '#FF2222'; ctx.fillStyle = '#CC0000';
      ctx.beginPath(); ctx.arc(px, py + 1, 7 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = '#22BB22'; ctx.fillStyle = '#22BB22';
      ctx.beginPath(); ctx.ellipse(px + 2, py - 5, 2, 4, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#441100'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px, py - 9); ctx.stroke();
      break;
    }
    case 4: { // Melon
      ctx.shadowColor = '#44BB44'; ctx.fillStyle = '#33AA33';
      ctx.beginPath(); ctx.arc(px, py, 7 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1A6A1A'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px - 6, py - 2); ctx.quadraticCurveTo(px, py + 6, px + 6, py - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 5, py + 2); ctx.lineTo(px + 5, py + 2); ctx.stroke();
      break;
    }
    case 5: { // Galaxian
      ctx.shadowColor = '#4488FF'; ctx.fillStyle = '#2255CC';
      const s = pulse;
      ctx.beginPath();
      ctx.moveTo(px,        py - 8 * s);
      ctx.lineTo(px + 7*s,  py + 5*s);
      ctx.lineTo(px + 3*s,  py + 3*s);
      ctx.lineTo(px + 3*s,  py + 7*s);
      ctx.lineTo(px,        py + 4*s);
      ctx.lineTo(px - 3*s,  py + 7*s);
      ctx.lineTo(px - 3*s,  py + 3*s);
      ctx.lineTo(px - 7*s,  py + 5*s);
      ctx.closePath(); ctx.fill();
      ctx.shadowColor = '#FF4444'; ctx.fillStyle = '#FF4444';
      ctx.beginPath(); ctx.arc(px, py + 1, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 6: { // Bell
      ctx.shadowColor = '#FFD700'; ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(px, py - 2, 7 * pulse, Math.PI, 0);
      ctx.lineTo(px + 7, py + 5);
      ctx.quadraticCurveTo(px, py + 9, px - 7, py + 5);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#CC9900';
      ctx.beginPath(); ctx.arc(px, py + 6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#997700'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py - 2, 5, Math.PI + 0.4, -0.4); ctx.stroke();
      break;
    }
    case 7: { // Key
      ctx.shadowColor = '#BBBBBB'; ctx.fillStyle = '#AAAAAA';
      ctx.beginPath(); ctx.arc(px - 4, py, 5 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px - 1, py - 2, 11, 4);
      ctx.fillRect(px + 5, py + 1, 3, 3);
      ctx.fillRect(px + 8, py + 1, 3, 3);
      ctx.fillStyle = '#222222';
      ctx.beginPath(); ctx.arc(px - 4, py, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawFruitSprite();
  drawGhosts();
  drawPac();
  drawFloatingScores();
  if (gameState === 'highscore') drawLeaderboard();
  if (gameState === 'nameentry') drawNameEntry();
}

// ─── GAME LOOP ───────────────────────────────────────────────────────────────
let lastTime = 0;

function loop(ts) {
  requestAnimationFrame(loop);
  const dt = ts - lastTime;
  if (dt < 14) return;
  lastTime = ts;

  if (gameState === 'playing' && !helpOpen) {
    floatingScores = floatingScores.filter(s => --s.timer > 0);

    if (freezeTimer > 0) {
      freezeTimer--;
    } else {
      phaseTick++;
      if (phaseTick >= PHASE_TIMES[phaseIndex] && phaseIndex < PHASE_TIMES.length - 1) {
        phaseIndex++;
        phaseTick = 0;
      }

      if (frightenedTimer > 0) {
        frightenedTimer--;
        if (frightenedTimer === 0) {
          eatCombo = 0;
          ghosts.forEach(g => {
            if (g.mode === 'frightened') g.mode = phaseIndex % 2 === 0 ? 'scatter' : 'chase';
          });
        }
      }

      updatePac();
      ghosts.forEach(g => { updateGhostMode(g); moveGhost(g); });
      checkCollisions();
      updateFruit();
    }
  }

  render();
}

// ─── START ───────────────────────────────────────────────────────────────────
document.fonts.ready.then(() => {
  try {
    resizeCanvas();
    initGame();
    requestAnimationFrame(loop);
  } catch(e) {
    logError('BOOT: ' + e.message);
  }
}).catch(e => logError('FONTS: ' + e.message));
