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
let highScoreValue = 0;

// Sprite images
const sprites = {
  player: new Image(),
  npcVirus: new Image(),
  npcBacillus: new Image(),
  foodAir: new Image(),
  foodEnzim: new Image(),
  foodDaun: new Image(),
};

// Load sprites
sprites.player.src = 'assets/Microba Alga.png';
sprites.npcVirus.src = 'assets/Virus HIV.png';
sprites.npcBacillus.src = 'assets/Bakteri Bacillus.png';
sprites.foodAir.src = 'assets/Air.png';
sprites.foodEnzim.src = 'assets/Enzim.png';
sprites.foodDaun.src = 'assets/Daun Mati.png';

// Track loaded sprites
let spritesLoaded = 0;
const totalSprites = Object.keys(sprites).length;

Object.values(sprites).forEach(sprite => {
  sprite.onload = () => {
    spritesLoaded++;
    console.log(`Sprite loaded: ${spritesLoaded}/${totalSprites}`);
  };
});

// Start screen elements
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const gameOverScreen = document.getElementById('gameOverScreen');
const playAgainBtn = document.getElementById('playAgainBtn');

// Loading Screen Animation
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const loaderProgress = document.getElementById('loaderProgress');
  
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      
      // Hide loading screen with animation
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.5,
        delay: 0.3,
        onComplete: () => {
          loadingScreen.style.display = 'none';
          initMenuAnimations();
        }
      });
    }
    loaderProgress.style.width = progress + '%';
  }, 100);
}

// GSAP Animations for Main Menu
function initMenuAnimations() {
  const heroContent = document.querySelector('.hero-content');
  const titleLines = document.querySelectorAll('.title-line');
  const titleDot = document.querySelector('.title-dot');
  const subtitle = document.querySelector('.subtitle');
  const heroVisual = document.querySelector('.hero-visual');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  // Initial state
  gsap.set(titleLines, { opacity: 0, y: 50 });
  gsap.set(titleDot, { opacity: 0, scale: 0 });
  gsap.set(subtitle, { opacity: 0, y: 20 });
  gsap.set(heroVisual, { opacity: 0, scale: 0.8 });
  gsap.set(scrollIndicator, { opacity: 0 });
  
  // Timeline for hero section
  const tl = gsap.timeline({ delay: 0.3 });
  
  // Title lines animate in
  tl.to(titleLines, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  });
  
  // Dot pops in
  tl.to(titleDot, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    ease: 'back.out(2)'
  }, '-=0.5');
  
  // Subtitle fades in
  tl.to(subtitle, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.3');
  
  // Hero visual scales in
  tl.to(heroVisual, {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.3');
  
  // Scroll indicator fades in
  tl.to(scrollIndicator, {
    opacity: 1,
    duration: 0.5
  }, '-=0.2');
  
  // Play section animations on scroll
  initScrollAnimations();
}

// Scroll-triggered animations
function initScrollAnimations() {
  const playSection = document.getElementById('playSection');
  const sectionHeading = document.querySelector('.section-heading');
  const characterSelect = document.querySelector('.character-select');
  const playForm = document.querySelector('.play-form');
  const foodPreview = document.querySelector('.food-preview');
  const instructionsBar = document.querySelector('.instructions-bar');
  
  // Initial state for play section elements
  gsap.set([sectionHeading, characterSelect, playForm, foodPreview, instructionsBar], { 
    opacity: 0, 
    y: 50 
  });
  
  // Create scroll trigger
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tl = gsap.timeline();
        
        tl.to(sectionHeading, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
        
        tl.to([characterSelect, playForm, foodPreview], {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out'
        }, '-=0.3');
        
        tl.to(instructionsBar, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        }, '-=0.2');
        
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(playSection);
}

// GSAP Animation for Game Over popup
function showGameOverAnimation() {
  const gameOverBg = document.querySelector('.game-over-bg');
  const popup = document.querySelector('.game-over-popup');
  const statCards = document.querySelectorAll('.stat-card');
  const actionBtns = document.querySelectorAll('.action-btn');
  
  // Initial state
  gsap.set(gameOverBg, { opacity: 0 });
  gsap.set(popup, { scale: 0.8, opacity: 0, y: 50 });
  gsap.set(statCards, { opacity: 0, y: 30, scale: 0.9 });
  gsap.set(actionBtns, { opacity: 0, y: 20 });
  
  // Animation timeline
  const tl = gsap.timeline();
  
  // Background fades in
  tl.to(gameOverBg, {
    opacity: 1,
    duration: 0.3
  });
  
  // Popup scales in
  tl.to(popup, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  }, '-=0.1');
  
  // Stat cards stagger in
  tl.to(statCards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out'
  }, '-=0.2');
  
  // Action buttons slide in
  tl.to(actionBtns, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out'
  }, '-=0.1');
}

// Initialize loading screen when page loads
document.addEventListener('DOMContentLoaded', initLoadingScreen);

startBtn.addEventListener('click', () => {
  playerName = playerNameInput.value || `Bakteri${Math.floor(Math.random() * 1000)}`;
  
  // Send startGame event to server - this creates the player
  socket.emit('startGame', { name: playerName });
  
  // GSAP exit animation for start screen
  gsap.to(startScreen, {
    opacity: 0,
    scale: 1.1,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      startScreen.classList.add('hidden');
      gsap.set(startScreen, { opacity: 1, scale: 1 }); // Reset for potential replay
      
      // Animate leaderboard sliding in
      const leaderboard = document.querySelector('.leaderboard');
      gsap.fromTo(leaderboard, 
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  });
  
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

// Home button handler
const homeBtn = document.getElementById('homeBtn');
if (homeBtn) {
  homeBtn.addEventListener('click', () => {
    location.reload();
  });
}

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
  const finalScore = data.score || 0;
  document.getElementById('finalScore').textContent = finalScore;
  
  // Update high score
  if (finalScore > highScoreValue) {
    highScoreValue = finalScore;
  }
  document.getElementById('highScore').textContent = highScoreValue;
  
  // Calculate position (simplified - based on leaderboard)
  const position = data.position || '-';
  document.getElementById('topPosition').textContent = position;
  
  // Trigger GSAP game over animation
  showGameOverAnimation();
  
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

// Animation time tracker
let animationTime = 0;

// Draw sprite image with animation
function drawSprite(sprite, x, y, radius, scale = 1.0, animOptions = {}) {
  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    const drawSize = radius * 2 * scale;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Apply animations based on options
    if (animOptions.rotate) {
      const rotationSpeed = animOptions.rotateSpeed || 0.001;
      ctx.rotate(animationTime * rotationSpeed + (animOptions.rotateOffset || 0));
    }
    
    if (animOptions.pulse) {
      const pulseAmount = animOptions.pulseAmount || 0.05;
      const pulseSpeed = animOptions.pulseSpeed || 0.003;
      const pulseFactor = 1 + Math.sin(animationTime * pulseSpeed + (animOptions.pulseOffset || 0)) * pulseAmount;
      ctx.scale(pulseFactor, pulseFactor);
    }
    
    if (animOptions.float) {
      const floatAmount = animOptions.floatAmount || 3;
      const floatSpeed = animOptions.floatSpeed || 0.002;
      const floatY = Math.sin(animationTime * floatSpeed + (animOptions.floatOffset || 0)) * floatAmount;
      ctx.translate(0, floatY);
    }
    
    // Draw the sprite centered
    ctx.drawImage(sprite, -drawSize/2, -drawSize/2, drawSize, drawSize);
    
    // Add glow effect if specified
    if (animOptions.glow) {
      ctx.globalAlpha = 0.3 + Math.sin(animationTime * 0.003) * 0.2;
      ctx.shadowColor = animOptions.glowColor || '#00f0ff';
      ctx.shadowBlur = animOptions.glowSize || 15;
      ctx.drawImage(sprite, -drawSize/2, -drawSize/2, drawSize, drawSize);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  } else {
    // Fallback to circle if sprite not loaded
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#4CAF50';
    ctx.fill();
  }
}

// Draw player (Microba Alga) with pulse and glow animation
function drawPlayer(x, y, radius) {
  drawSprite(sprites.player, x, y, radius, 1.3, {
    pulse: true,
    pulseAmount: 0.08,
    pulseSpeed: 0.004,
    glow: true,
    glowColor: '#00ff88',
    glowSize: 20
  });
}

// Draw NPC based on type with animations
function drawNPC(x, y, radius, npcType, playerRadius = 0, entityId = '') {
  // Use entity ID to create unique animation offset
  const idOffset = entityId ? entityId.charCodeAt(0) * 100 : Math.random() * 1000;
  
  if (npcType === 'bacillus') {
    drawSprite(sprites.npcBacillus, x, y, radius, 1.8, {
      rotate: true,
      rotateSpeed: 0.0005,
      rotateOffset: idOffset,
      pulse: true,
      pulseAmount: 0.06,
      pulseSpeed: 0.003,
      pulseOffset: idOffset
    });
  } else {
    drawSprite(sprites.npcVirus, x, y, radius, 2.1, {
      rotate: true,
      rotateSpeed: 0.001,
      rotateOffset: idOffset,
      pulse: true,
      pulseAmount: 0.05,
      pulseSpeed: 0.004,
      pulseOffset: idOffset
    });
  }
  
  // Draw indicator based on size comparison with player
  // GREEN = you can eat this NPC (player is bigger)
  // RED = this NPC can eat you (NPC is bigger)
  if (playerRadius > 0) {
    const playerToNpcRatio = playerRadius / radius; // How much bigger is player?
    
    if (playerToNpcRatio > 1.03) {
      // Player is bigger - GREEN (you CAN eat this NPC!)
      const pulseAlpha = 0.5 + Math.sin(animationTime * 0.006) * 0.3;
      ctx.strokeStyle = `rgba(50, 255, 50, ${pulseAlpha})`;
      ctx.lineWidth = 3 + Math.sin(animationTime * 0.006) * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (playerToNpcRatio < 0.97) {
      // NPC is bigger - RED (DANGER! NPC can eat you!)
      const pulseAlpha = 0.5 + Math.sin(animationTime * 0.008) * 0.3;
      ctx.strokeStyle = `rgba(255, 50, 50, ${pulseAlpha})`;
      ctx.lineWidth = 3 + Math.sin(animationTime * 0.008) * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    // If similar size (0.97 - 1.03), no indicator - cannot eat each other
  }
}

// Draw food based on type with floating animation
function drawFood(x, y, radius, foodType, foodId = '') {
  let sprite;
  let glowColor;
  
  // Use food ID for unique animation offset
  const idOffset = foodId ? (typeof foodId === 'number' ? foodId : foodId.toString().charCodeAt(0)) * 50 : Math.random() * 500;
  
  switch (foodType) {
    case 'air':
      sprite = sprites.foodAir;
      glowColor = '#00d4ff';
      break;
    case 'enzim':
      sprite = sprites.foodEnzim;
      glowColor = '#ff00ff';
      break;
    case 'daun':
      sprite = sprites.foodDaun;
      glowColor = '#ffaa00';
      break;
    default:
      sprite = sprites.foodAir;
      glowColor = '#00d4ff';
  }
  
  drawSprite(sprite, x, y, radius, 3.0, {
    float: true,
    floatAmount: 2,
    floatSpeed: 0.003,
    floatOffset: idOffset,
    rotate: true,
    rotateSpeed: 0.0003,
    rotateOffset: idOffset,
    glow: true,
    glowColor: glowColor,
    glowSize: 8
  });
}

// Legacy function for backward compatibility
function drawBacteria(x, y, radius, color, isNPC = false) {
  if (isNPC) {
    drawNPC(x, y, radius, 'virus');
  } else {
    drawPlayer(x, y, radius);
  }
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
    // Clear canvas with light background when not playing
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // Interpolate positions for smooth movement
  interpolatePositions();
  
  // Update animation time
  animationTime = Date.now();

  // Clear canvas with dark microscopic background (matches menu theme)
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid background (dark theme with cyan lines)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
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

  // Draw foods with sprites and animations - use interpolated state
  interpolatedState.foods.forEach((food) => {
    const screenX = food.x - gameState.camera.x;
    const screenY = food.y - gameState.camera.y;

    if (screenX > -food.radius * 3 && screenX < canvas.width + food.radius * 3 && 
        screenY > -food.radius * 3 && screenY < canvas.height + food.radius * 3) {
      drawFood(screenX, screenY, food.radius, food.foodType || 'air', food.id);
    }
  });

  // Get player's radius for size comparison
  let myPlayerRadius = 0;
  if (gameState.myPlayer && interpolatedState.players[gameState.myPlayer.id]) {
    const myPlayer = interpolatedState.players[gameState.myPlayer.id];
    if (myPlayer.cells && myPlayer.cells.length > 0) {
      // Use smallest cell radius for safety comparison
      myPlayerRadius = Math.min(...myPlayer.cells.map(c => c.radius));
    } else {
      myPlayerRadius = myPlayer.radius || 0;
    }
  }

  // Draw NPCs with all their cells - use interpolated state
  Object.values(interpolatedState.npcs).forEach((npc) => {
    // Determine NPC type for sprite selection
    const npcType = npc.npcType || 'virus';
    
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

        if (screenX > -cell.radius * 2 && screenX < canvas.width + cell.radius * 2 && 
            screenY > -cell.radius * 2 && screenY < canvas.height + cell.radius * 2) {
          // Draw NPC cell with sprite, size indicator, and animation
          drawNPC(screenX, screenY, cell.radius, npcType, myPlayerRadius, npc.id);
        }
      });

      // Draw name on largest cell
      const screenX = largestCell.x - gameState.camera.x;
      const screenY = largestCell.y - gameState.camera.y;
      if (npc.name) {
        const fontSize = Math.max(12, largestCell.radius / 2.5);
        drawText(npc.name, screenX, screenY - largestCell.radius - fontSize / 2, fontSize, '#00f0ff');
      }
    } else {
      // Single cell NPC (not split yet)
      const screenX = npc.x - gameState.camera.x;
      const screenY = npc.y - gameState.camera.y;

      if (screenX > -npc.radius * 2 && screenX < canvas.width + npc.radius * 2 && 
          screenY > -npc.radius * 2 && screenY < canvas.height + npc.radius * 2) {
        // Draw NPC with sprite, size indicator, and animation
        drawNPC(screenX, screenY, npc.radius, npcType, myPlayerRadius, npc.id);

        // Draw NPC name
        if (npc.name) {
          const fontSize = Math.max(12, npc.radius / 2.5);
          drawText(npc.name, screenX, screenY - npc.radius - fontSize / 2, fontSize, '#00f0ff');
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

        if (screenX > -cell.radius * 2 && screenX < canvas.width + cell.radius * 2 && 
            screenY > -cell.radius * 2 && screenY < canvas.height + cell.radius * 2) {
          // Draw player cell with sprite
          drawPlayer(screenX, screenY, cell.radius);

          // Show merge countdown if cell has mergeTime
          if (isMyPlayer && cell.mergeTime) {
            const timeLeft = Math.max(0, Math.ceil((cell.mergeTime - Date.now()) / 1000));
            if (timeLeft > 0) {
              const fontSize = Math.max(10, cell.radius / 3);
              drawText(`${timeLeft}s`, screenX, screenY + cell.radius + fontSize, fontSize, '#FFD700');
            }
          }

          // Draw player name only on largest cell
          if (player.name && index === largestIndex) {
            const fontSize = Math.max(14, cell.radius / 2);
            drawText(player.name, screenX, screenY - cell.radius - fontSize / 2, fontSize, '#FFD700');
          }
        }
      });
    } else {
      // Single cell player (backward compatibility)
      const screenX = player.x - gameState.camera.x;
      const screenY = player.y - gameState.camera.y;

      if (screenX > -player.radius * 2 && screenX < canvas.width + player.radius * 2 && 
          screenY > -player.radius * 2 && screenY < canvas.height + player.radius * 2) {
        // Draw player with sprite
        drawPlayer(screenX, screenY, player.radius);

        if (player.name) {
          const fontSize = Math.max(14, player.radius / 2);
          drawText(player.name, screenX, screenY - player.radius - fontSize / 2, fontSize, '#FFD700');
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
    // Simple format like prototype: "1.Enemy1"
    item.textContent = `${index + 1}.${entity.name}`;
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
