// Game client Micro.io
const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let gameState = {
  players: {},
  npcs: {},
  foods: [],
  worldSize: 3000,
  myPlayer: null,
  camera: { x: 0, y: 0 },
};

// Interpolation state for smooth movement
let interpolatedState = {
  players: {},
  npcs: {},
  foods: [],
};

// Previous state for interpolation
let previousState = {
  players: {},
  npcs: {},
  foods: [],
};

// Mouse position
let mouse = { x: 0, y: 0 };

// Initialize
let playerName = '';
let gameStarted = false;
let lastUpdateTime = Date.now();

// Start screen elements
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const gameOverScreen = document.getElementById('gameOverScreen');
const playAgainBtn = document.getElementById('playAgainBtn');

startBtn.addEventListener('click', () => {
  playerName = playerNameInput.value || `Bakteri${Math.floor(Math.random() * 1000)}`;
  socket.emit('nameChange', playerName);
  startScreen.classList.add('hidden');
  gameStarted = true;
});

playerNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    startBtn.click();
  }
});

playAgainBtn.addEventListener('click', () => {
  location.reload();
});

// Socket events
socket.on('gameFull', (data) => {
  alert('Game penuh! Ini adalah game offline single-player. Silakan refresh halaman.');
  location.reload();
});

socket.on('init', (data) => {
  gameState.myPlayer = data.player;
  gameState.worldSize = data.worldSize;
  updateCamera();
});

socket.on('gameState', (data) => {
  // Store previous state for interpolation
  previousState.players = JSON.parse(JSON.stringify(gameState.players));
  previousState.npcs = JSON.parse(JSON.stringify(gameState.npcs));
  previousState.foods = JSON.parse(JSON.stringify(gameState.foods));

  // Update current state
  gameState.players = data.players;
  gameState.npcs = data.npcs;
  gameState.foods = data.foods;

  // Initialize interpolated state
  interpolatedState.players = JSON.parse(JSON.stringify(data.players));
  interpolatedState.npcs = JSON.parse(JSON.stringify(data.npcs));
  interpolatedState.foods = JSON.parse(JSON.stringify(data.foods));

  if (gameState.myPlayer && gameState.players[gameState.myPlayer.id]) {
    gameState.myPlayer = gameState.players[gameState.myPlayer.id];
    updateCamera();
    updateUI();
  }

  lastUpdateTime = Date.now();
});

socket.on('eaten', (data) => {
  gameOverScreen.classList.remove('hidden');
  document.getElementById('finalScore').textContent = data.score || 0;
  gameStarted = false;

  // Clear game state when player dies
  gameState.players = {};
  gameState.npcs = {};
  gameState.foods = [];
  interpolatedState.players = {};
  interpolatedState.npcs = {};
  interpolatedState.foods = [];
  previousState.players = {};
  previousState.npcs = {};
  previousState.foods = {};
});

socket.on('highscores', (data) => {
  updateHighscores(data);
});

// Handle disconnect
socket.on('disconnect', () => {
  console.log('Disconnected from server');
  gameStarted = false;
  
  // Clear all game state
  gameState.players = {};
  gameState.npcs = {};
  gameState.foods = [];
  gameState.myPlayer = null;
  interpolatedState.players = {};
  interpolatedState.npcs = {};
  interpolatedState.foods = [];
  previousState.players = {};
  previousState.npcs = {};
  previousState.foods = {};
});

// Update camera to follow player's largest cell (with smoothing)
function updateCamera() {
  if (!gameState.myPlayer) return;

  const player = gameState.players[gameState.myPlayer.id];
  if (!player) return;

  // Find largest cell for camera positioning
  let cameraX = player.x;
  let cameraY = player.y;

  if (player.cells && player.cells.length > 0) {
    let largestCell = player.cells[0];
    player.cells.forEach((cell) => {
      if (cell.radius > largestCell.radius) {
        largestCell = cell;
      }
    });
    cameraX = largestCell.x;
    cameraY = largestCell.y;
  }

  // Smooth camera movement (lerp towards target)
  const targetX = cameraX - canvas.width / 2;
  const targetY = cameraY - canvas.height / 2;

  const cameraSpeed = 0.15; // Smoothing factor
  gameState.camera.x += (targetX - gameState.camera.x) * cameraSpeed;
  gameState.camera.y += (targetY - gameState.camera.y) * cameraSpeed;

  // Clamp camera to world bounds
  gameState.camera.x = Math.max(0, Math.min(gameState.worldSize - canvas.width, gameState.camera.x));
  gameState.camera.y = Math.max(0, Math.min(gameState.worldSize - canvas.height, gameState.camera.y));
}

// Mouse tracking
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left + gameState.camera.x;
  mouse.y = e.clientY - rect.top + gameState.camera.y;

  if (gameStarted && gameState.myPlayer) {
    socket.emit('move', { x: mouse.x, y: mouse.y });
  }
});

// Touch support for mobile
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  mouse.x = touch.clientX - rect.left + gameState.camera.x;
  mouse.y = touch.clientY - rect.top + gameState.camera.y;

  if (gameStarted && gameState.myPlayer) {
    socket.emit('move', { x: mouse.x, y: mouse.y });
  }
});

// Split with spacebar
let lastSplitTime = 0;
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gameStarted && gameState.myPlayer) {
    const now = Date.now();
    if (now - lastSplitTime > 1000) {
      // Cooldown 1 second
      socket.emit('split');
      lastSplitTime = now;
    }
    e.preventDefault();
  }
});

// Window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateCamera();
});

// Draw bacteria-like shape
function drawBacteria(x, y, radius, color, isNPC = false) {
  // Main circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  // Gradient fill
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, isNPC ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.2)');

  ctx.fillStyle = gradient;
  ctx.fill();

  // Border
  ctx.strokeStyle = isNPC ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner details (bacteria-like)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// Linear interpolation function
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Interpolate positions for smooth movement
function interpolatePositions() {
  // Don't interpolate if game hasn't started
  if (!gameStarted) return;
  
  const now = Date.now();
  const timeSinceUpdate = now - lastUpdateTime;
  const updateInterval = 33; // Match server update rate

  // Interpolation factor (0 = previous state, 1 = current state)
  let factor = Math.min(1, timeSinceUpdate / updateInterval);

  // Interpolate players
  Object.keys(gameState.players).forEach((playerId) => {
    const currentPlayer = gameState.players[playerId];
    const previousPlayer = previousState.players[playerId];
    const isMyPlayer = playerId === gameState.myPlayer?.id;

    if (!currentPlayer) {
      delete interpolatedState.players[playerId];
      return;
    }

    // Initialize interpolated player
    if (!interpolatedState.players[playerId]) {
      interpolatedState.players[playerId] = JSON.parse(JSON.stringify(currentPlayer));
    }

    const interpPlayer = interpolatedState.players[playerId];

    // For my player, use less aggressive interpolation or skip it entirely
    // since we're already predicting movement client-side
    if (isMyPlayer) {
      // Use server position directly with minimal smoothing to reduce jitter
      const smoothingFactor = 0.9; // High smoothing factor (close to 1) for less jitter
      if (previousPlayer) {
        interpPlayer.x = lerp(previousPlayer.x, currentPlayer.x, smoothingFactor);
        interpPlayer.y = lerp(previousPlayer.y, currentPlayer.y, smoothingFactor);
      } else {
        interpPlayer.x = currentPlayer.x;
        interpPlayer.y = currentPlayer.y;
      }
    } else {
      // For other players, use normal interpolation
      if (previousPlayer) {
        interpPlayer.x = lerp(previousPlayer.x, currentPlayer.x, factor);
        interpPlayer.y = lerp(previousPlayer.y, currentPlayer.y, factor);
      } else {
        interpPlayer.x = currentPlayer.x;
        interpPlayer.y = currentPlayer.y;
      }
    }

    // Interpolate cells if they exist
    if (currentPlayer.cells && currentPlayer.cells.length > 0) {
      if (!interpPlayer.cells) {
        interpPlayer.cells = [];
      }

      // Ensure cells array matches
      while (interpPlayer.cells.length < currentPlayer.cells.length) {
        interpPlayer.cells.push({ x: 0, y: 0, radius: 0 });
      }
      interpPlayer.cells = interpPlayer.cells.slice(0, currentPlayer.cells.length);

      currentPlayer.cells.forEach((cell, index) => {
        const prevCell = previousPlayer?.cells?.[index];
        const cellSmoothingFactor = isMyPlayer ? 0.9 : factor; // High smoothing for own player

        if (prevCell) {
          interpPlayer.cells[index].x = lerp(prevCell.x, cell.x, cellSmoothingFactor);
          interpPlayer.cells[index].y = lerp(prevCell.y, cell.y, cellSmoothingFactor);
        } else {
          interpPlayer.cells[index].x = cell.x;
          interpPlayer.cells[index].y = cell.y;
        }

        // Copy non-positional data directly
        interpPlayer.cells[index].radius = cell.radius;
        interpPlayer.cells[index].score = cell.score;
      });
    }

    // Copy other properties
    interpPlayer.radius = currentPlayer.radius;
    interpPlayer.score = currentPlayer.score;
    interpPlayer.color = currentPlayer.color;
    interpPlayer.name = currentPlayer.name;
  });

  // Clean up disconnected players from interpolated state
  Object.keys(interpolatedState.players).forEach((playerId) => {
    if (!gameState.players[playerId]) {
      delete interpolatedState.players[playerId];
    }
  });

  // Interpolate NPCs
  Object.keys(gameState.npcs).forEach((npcId) => {
    const currentNPC = gameState.npcs[npcId];
    const previousNPC = previousState.npcs[npcId];

    if (!currentNPC) {
      delete interpolatedState.npcs[npcId];
      return;
    }

    if (!interpolatedState.npcs[npcId]) {
      interpolatedState.npcs[npcId] = JSON.parse(JSON.stringify(currentNPC));
    }

    const interpNPC = interpolatedState.npcs[npcId];

    if (previousNPC) {
      interpNPC.x = lerp(previousNPC.x, currentNPC.x, factor);
      interpNPC.y = lerp(previousNPC.y, currentNPC.y, factor);
    } else {
      interpNPC.x = currentNPC.x;
      interpNPC.y = currentNPC.y;
    }

    interpNPC.radius = currentNPC.radius;
    interpNPC.score = currentNPC.score;
    interpNPC.color = currentNPC.color;
    interpNPC.name = currentNPC.name;
  });

  // Clean up disconnected NPCs from interpolated state
  Object.keys(interpolatedState.npcs).forEach((npcId) => {
    if (!gameState.npcs[npcId]) {
      delete interpolatedState.npcs[npcId];
    }
  });

  // Foods don't need interpolation (they're static until eaten)
  interpolatedState.foods = gameState.foods;
}

function drawText(text, x, y, size, color) {
  ctx.font = `bold ${size}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

// Render game
function render() {
  // Only render if game has started
  if (!gameStarted) {
    // Clear canvas with dark background when not playing
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // Interpolate positions for smooth movement
  interpolatePositions();

  // Clear canvas with microsopic background
  ctx.fillStyle = '#1a3a52';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid background (microscopic view)
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.1)';
  ctx.lineWidth = 1;
  const gridSize = 50;
  for (let x = -gameState.camera.x % gridSize; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = -gameState.camera.y % gridSize; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw foods (bacteria/virus) - use interpolated state
  interpolatedState.foods.forEach((food) => {
    const screenX = food.x - gameState.camera.x;
    const screenY = food.y - gameState.camera.y;

    if (screenX > -food.radius && screenX < canvas.width + food.radius && screenY > -food.radius && screenY < canvas.height + food.radius) {
      drawBacteria(screenX, screenY, food.radius, food.color, false);
    }
  });

  // Draw NPCs with all their cells - use interpolated state
  Object.values(interpolatedState.npcs).forEach((npc) => {
    // Draw all cells of the NPC (if split)
    if (npc.cells && npc.cells.length > 0) {
      // Find largest cell for name display
      let largestCell = npc.cells[0];
      npc.cells.forEach((cell) => {
        if (cell.radius > largestCell.radius) {
          largestCell = cell;
        }
      });

      // Draw each cell
      npc.cells.forEach((cell) => {
        const screenX = cell.x - gameState.camera.x;
        const screenY = cell.y - gameState.camera.y;

        if (screenX > -cell.radius && screenX < canvas.width + cell.radius && 
            screenY > -cell.radius && screenY < canvas.height + cell.radius) {
          // Draw NPC cell
          drawBacteria(screenX, screenY, cell.radius, npc.color, true);
        }
      });

      // Draw name on largest cell
      const screenX = largestCell.x - gameState.camera.x;
      const screenY = largestCell.y - gameState.camera.y;
      if (npc.name) {
        const fontSize = Math.max(12, largestCell.radius / 2.5);
        drawText(npc.name, screenX, screenY - largestCell.radius - fontSize / 2, fontSize, '#ffaa00');
      }
    } else {
      // Single cell NPC (not split yet)
      const screenX = npc.x - gameState.camera.x;
      const screenY = npc.y - gameState.camera.y;

      if (screenX > -npc.radius && screenX < canvas.width + npc.radius && 
          screenY > -npc.radius && screenY < canvas.height + npc.radius) {
        // Draw NPC bacteria
        drawBacteria(screenX, screenY, npc.radius, npc.color, true);

        // Draw NPC name
        if (npc.name) {
          const fontSize = Math.max(12, npc.radius / 2.5);
          drawText(npc.name, screenX, screenY - npc.radius - fontSize / 2, fontSize, '#ffaa00');
        }
      }
    }
  });

  // Draw players with all their cells - use interpolated state
  Object.values(interpolatedState.players).forEach((player) => {
    const isMyPlayer = player.id === gameState.myPlayer?.id;

    // Draw all cells of the player
    if (player.cells && player.cells.length > 0) {
      // Find largest cell for name display
      let largestCell = player.cells[0];
      let largestIndex = 0;
      player.cells.forEach((cell, index) => {
        if (cell.radius > largestCell.radius) {
          largestCell = cell;
          largestIndex = index;
        }
      });

      player.cells.forEach((cell, index) => {
        const screenX = cell.x - gameState.camera.x;
        const screenY = cell.y - gameState.camera.y;

        if (screenX > -cell.radius && screenX < canvas.width + cell.radius && screenY > -cell.radius && screenY < canvas.height + cell.radius) {
          // Draw cell bacteria
          drawBacteria(screenX, screenY, cell.radius, player.color, false);

          // Highlight my player's cells
          if (isMyPlayer) {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, cell.radius + 2, 0, Math.PI * 2);
            ctx.stroke();

            // Show merge countdown if cell has mergeTime
            if (cell.mergeTime) {
              const timeLeft = Math.max(0, Math.ceil((cell.mergeTime - Date.now()) / 1000));
              if (timeLeft > 0) {
                const fontSize = Math.max(10, cell.radius / 3);
                drawText(`${timeLeft}s`, screenX, screenY + cell.radius + fontSize, fontSize, '#FFD700');
              }
            }
          }

          // Draw player name only on largest cell
          if (player.name && index === largestIndex) {
            const fontSize = Math.max(14, cell.radius / 2);
            drawText(player.name, screenX, screenY - cell.radius - fontSize / 2, fontSize, '#fff');
          }
        }
      });
    } else {
      // Single cell player (backward compatibility)
      const screenX = player.x - gameState.camera.x;
      const screenY = player.y - gameState.camera.y;

      if (screenX > -player.radius && screenX < canvas.width + player.radius && screenY > -player.radius && screenY < canvas.height + player.radius) {
        drawBacteria(screenX, screenY, player.radius, player.color, false);

        if (isMyPlayer) {
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(screenX, screenY, player.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (player.name) {
          const fontSize = Math.max(14, player.radius / 2);
          drawText(player.name, screenX, screenY - player.radius - fontSize / 2, fontSize, '#fff');
        }
      }
    }
  });

  // Draw mouse indicator
  if (gameStarted) {
    const screenMouseX = mouse.x - gameState.camera.x;
    const screenMouseY = mouse.y - gameState.camera.y;

    if (screenMouseX >= 0 && screenMouseX <= canvas.width && screenMouseY >= 0 && screenMouseY <= canvas.height) {
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenMouseX, screenMouseY, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// Update UI
function updateUI() {
  if (!gameState.myPlayer) return;

  const player = gameState.players[gameState.myPlayer.id];
  if (!player) return;

  document.getElementById('score').textContent = player.score || 0;

  // Count cells
  const cellCount = player.cells ? player.cells.length : 1;
  document.getElementById('cells').textContent = cellCount;

  // Show largest cell size
  let largestRadius = player.radius;
  if (player.cells && player.cells.length > 0) {
    player.cells.forEach((cell) => {
      if (cell.radius > largestRadius) {
        largestRadius = cell.radius;
      }
    });
  }
  document.getElementById('size').textContent = Math.floor(largestRadius);

  // Update leaderboard (only show player and NPCs in offline mode)
  const allEntities = [...Object.values(gameState.players), ...Object.values(gameState.npcs)];

  const leaderboard = allEntities.sort((a, b) => b.score - a.score).slice(0, 10);

  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';

  leaderboard.forEach((entity, index) => {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    if (entity.id === gameState.myPlayer.id) {
      item.classList.add('you');
    }
    const prefix = entity.isNPC ? '🤖 ' : '👤 ';
    item.textContent = `${index + 1}. ${prefix}${entity.name} - ${entity.score}`;
    leaderboardList.appendChild(item);
  });
}

// Update highscores
function updateHighscores(highscores) {
  const highscoreList = document.getElementById('highscore-list');
  if (!highscoreList) return;

  highscoreList.innerHTML = '';

  if (highscores.length === 0) {
    highscoreList.innerHTML = '<div style="color: #aaa; text-align: center;">Belum ada skor tinggi</div>';
    return;
  }

  highscores.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'highscore-item';
    item.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.score}</span>
        `;
    highscoreList.appendChild(item);
  });
}

// Game loop
function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();

// Send periodic updates (more frequent for smoother movement)
setInterval(() => {
  if (gameStarted && gameState.myPlayer && mouse.x && mouse.y) {
    socket.emit('move', { x: mouse.x, y: mouse.y });
  }
}, 16); // ~60 FPS for input updates
