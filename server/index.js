const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Route untuk root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Highscore storage (in-memory, bisa di-upgrade ke database)
const highscores = [];

// Game state - OFFLINE MODE: Single Player vs NPC AI only
const gameState = {
  players: {},
  npcs: {},
  foods: [],
  maxFood: 500,
  maxNPCs: 20, // Increased NPCs for single player challenge
  worldSize: 3000,
  maxPlayers: 1, // Only 1 player allowed (offline mode)
};

// Nama-nama bakteri/virus untuk makanan
const bacteriaNames = [
  'Bacillus',
  'E. coli',
  'Staphylococcus',
  'Streptococcus',
  'Lactobacillus',
  'Bifidobacterium',
  'Salmonella',
  'Vibrio',
  'Pseudomonas',
  'Mycobacterium',
  'Virus RNA',
  'Virus DNA',
  'Bakteri Gram+',
  'Bakteri Gram-',
  'Archaebacteria',
];

// Food types for sprites
const foodTypes = ['air', 'enzim', 'daun'];

// Generate random food dengan nama bakteri
function generateFood() {
  const foods = [];
  for (let i = 0; i < gameState.maxFood; i++) {
    const name = bacteriaNames[Math.floor(Math.random() * bacteriaNames.length)];
    const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    foods.push({
      id: i,
      x: Math.random() * gameState.worldSize,
      y: Math.random() * gameState.worldSize,
      radius: 4 + Math.random() * 3,
      color: `hsl(${Math.random() * 360}, 70%, ${50 + Math.random() * 20}%)`,
      name: name,
      foodType: foodType,
    });
  }
  return foods;
}

// Initialize food
gameState.foods = generateFood();

// Spawn new food when eaten
function spawnFood() {
  const name = bacteriaNames[Math.floor(Math.random() * bacteriaNames.length)];
  const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
  const newFood = {
    id: Date.now() + Math.random(),
    x: Math.random() * gameState.worldSize,
    y: Math.random() * gameState.worldSize,
    radius: 4 + Math.random() * 3,
    color: `hsl(${Math.random() * 360}, 70%, ${50 + Math.random() * 20}%)`,
    name: name,
    foodType: foodType,
  };
  gameState.foods.push(newFood);
  return newFood;
}

// Spawn multiple foods at once
function spawnMultipleFoods(count) {
  for (let i = 0; i < count; i++) {
    spawnFood();
  }
}

// Maintain food count - ensure there's always enough food
function maintainFoodCount() {
  const currentFoodCount = gameState.foods.length;
  const minFood = gameState.maxFood * 0.8; // Keep at least 80% of max

  if (currentFoodCount < minFood) {
    const foodToSpawn = Math.min(gameState.maxFood - currentFoodCount, 50); // Spawn up to 50 at a time
    spawnMultipleFoods(foodToSpawn);
  }

  // Also ensure we don't exceed maxFood
  if (gameState.foods.length > gameState.maxFood) {
    gameState.foods = gameState.foods.slice(0, gameState.maxFood);
  }
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Check collision between two circles
function checkCollision(circle1, circle2) {
  const dist = distance(circle1.x, circle1.y, circle2.x, circle2.y);
  return dist < circle1.radius + circle2.radius;
}

// Virus and Bacteria names (scientific)
const npcNames = [
  // Common Bacteria
  'E.coli', 'Salmonella', 'Streptococcus', 'Staphylococcus', 'Lactobacillus',
  'Bacillus', 'Pseudomonas', 'Clostridium', 'Vibrio', 'Listeria',
  'Mycobacterium', 'Helicobacter', 'Neisseria', 'Shigella', 'Yersinia',
  'Campylobacter', 'Legionella', 'Bordetella', 'Treponema', 'Borrelia',
  // Common Viruses
  'Coronavirus', 'Influenza', 'Adenovirus', 'Rhinovirus', 'Rotavirus',
  'Norovirus', 'Poliovirus', 'Measles', 'Mumps', 'Rubella',
  'Herpes', 'Varicella', 'Hepatitis', 'Dengue', 'Zika',
  'Ebola', 'Rabies', 'HIV', 'HPV', 'Parvovirus',
  // Bacteriophages
  'T4-Phage', 'Lambda-Phage', 'M13-Phage', 'P1-Phage', 'Mu-Phage',
  // Other Microbes
  'Amoeba', 'Paramecium', 'Euglena', 'Plasmodium', 'Giardia'
];

// NPC types for sprites
const npcTypes = ['virus', 'bacillus'];

// NPC AI Logic - Enhanced with smarter behavior and competition
function createNPC() {
  const npcId = `npc_${Date.now()}_${Math.random()}`;
  const baseRadius = 20 + Math.random() * 25; // Larger starting size (20-45)
  
  // Create different NPC personalities
  const aggressionLevel = 0.6 + Math.random() * 0.4; // 0.6 to 1.0 (more aggressive)
  const intelligenceLevel = 0.7 + Math.random() * 0.3; // 0.7 to 1.0 (smarter)
  
  // Pick random name from list
  const randomName = npcNames[Math.floor(Math.random() * npcNames.length)];
  const nameWithNumber = Math.random() > 0.5 ? `${randomName}${Math.floor(Math.random() * 100)}` : randomName;
  
  // Pick random NPC type for sprite
  const npcType = npcTypes[Math.floor(Math.random() * npcTypes.length)];
  
  const npc = {
    id: npcId,
    x: Math.random() * gameState.worldSize,
    y: Math.random() * gameState.worldSize,
    radius: baseRadius,
    color: `hsl(${Math.random() * 360}, 60%, 45%)`,
    score: Math.floor(baseRadius * 2), // Start with some score
    name: nameWithNumber,
    target: null,
    isNPC: true,
    npcType: npcType, // 'virus' or 'bacillus' for sprite selection
    cells: [], // Will be initialized on first split
    lastDecision: Date.now(),
    aggressionLevel: aggressionLevel, // Higher = more likely to hunt
    intelligenceLevel: intelligenceLevel, // Higher = faster decisions, better movement
    personality: aggressionLevel > 0.8 ? 'hunter' : aggressionLevel > 0.7 ? 'balanced' : 'cautious',
  };
  return npc;
}

// Initialize NPCs
function initializeNPCs() {
  for (let i = 0; i < gameState.maxNPCs; i++) {
    const npc = createNPC();
    gameState.npcs[npc.id] = npc;
  }
}

// Reset game world - called when player dies
function resetGameWorld(socketId = null) {
  console.log('Resetting game world...');

  // Clear all NPCs
  gameState.npcs = {};

  // Clear all foods
  gameState.foods = [];

  // Reinitialize NPCs
  initializeNPCs();

  // Regenerate foods
  gameState.foods = generateFood();

  console.log(`Game world reset: ${Object.keys(gameState.npcs).length} NPCs, ${gameState.foods.length} foods`);

  // Broadcast reset state to client before disconnect
  if (socketId) {
    io.to(socketId).emit('gameState', {
      players: {},
      npcs: gameState.npcs,
      foods: gameState.foods,
      isOfflineMode: true,
    });
  }
}

// Get player's largest cell position (for prediction)
function getPlayerMainPosition(player) {
  if (player.cells && player.cells.length > 0) {
    let largestCell = player.cells[0];
    player.cells.forEach((cell) => {
      if (cell.radius > largestCell.radius) {
        largestCell = cell;
      }
    });
    return { x: largestCell.x, y: largestCell.y };
  }
  return { x: player.x, y: player.y };
}

// Enhanced NPC AI Decision Making with smarter strategies
function updateNPC(npc) {
  if (!npc || !npc.isNPC) return;

  const speed = (4 + npc.intelligenceLevel * 2) / (npc.radius / 15); // Smarter NPCs move faster
  let targetX = npc.x;
  let targetY = npc.y;

  const now = Date.now();
  const decisionInterval = 200 - npc.intelligenceLevel * 100; // Smarter NPCs decide more frequently

  // Only make new decisions periodically
  if (now - npc.lastDecision < decisionInterval) {
    // Continue moving towards last target
    const dx = (npc.targetX || npc.x) - npc.x;
    const dy = (npc.targetY || npc.y) - npc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > speed) {
      npc.x += (dx / dist) * speed;
      npc.y += (dy / dist) * speed;
    } else {
      npc.x = npc.targetX || npc.x;
      npc.y = npc.targetY || npc.y;
    }

    // Keep NPC within world bounds
    npc.x = Math.max(npc.radius, Math.min(gameState.worldSize - npc.radius, npc.x));
    npc.y = Math.max(npc.radius, Math.min(gameState.worldSize - npc.radius, npc.y));

    // Check collisions
    handleNPCEating(npc);
    return;
  }

  npc.lastDecision = now;

  // Enhanced threat detection - check for multiple threats (players AND other NPCs)
  let threats = [];
  let safeDirection = { x: 0, y: 0 };

  // Check player threats - FLEE if player is bigger!
  Object.values(gameState.players).forEach((player) => {
    const playerPos = getPlayerMainPosition(player);
    const dist = distance(npc.x, npc.y, playerPos.x, playerPos.y);
    const sizeDiff = player.radius / npc.radius;

    // Player is bigger by just 3% - RUN AWAY!
    if (sizeDiff > 1.03) {
      // Higher threat level = more urgent to flee
      const threatLevel = sizeDiff * sizeDiff * (600 / Math.max(dist, 30)); // Much higher threat awareness
      threats.push({
        entity: player,
        type: 'player',
        dist: dist,
        threatLevel: threatLevel,
        x: playerPos.x,
        y: playerPos.y,
      });

      // Calculate escape direction - run AWAY from player
      const dx = npc.x - playerPos.x;
      const dy = npc.y - playerPos.y;
      const escapeDist = Math.sqrt(dx * dx + dy * dy);
      if (escapeDist > 0) {
        safeDirection.x += (dx / escapeDist) * threatLevel;
        safeDirection.y += (dy / escapeDist) * threatLevel;
      }
    }
  });

  // Check NPC threats (other NPCs that are bigger) - SAME AS PLAYER THREAT
  Object.values(gameState.npcs).forEach((otherNPC) => {
    if (otherNPC.id === npc.id) return; // Skip self
    
    const dist = distance(npc.x, npc.y, otherNPC.x, otherNPC.y);
    const sizeDiff = otherNPC.radius / npc.radius;

    // Other NPC is bigger by 3% - FLEE! (same threshold as player)
    if (sizeDiff > 1.03) {
      // Same threat level calculation as player
      const threatLevel = sizeDiff * sizeDiff * (600 / Math.max(dist, 30));
      threats.push({
        entity: otherNPC,
        type: 'npc',
        dist: dist,
        threatLevel: threatLevel,
        x: otherNPC.x,
        y: otherNPC.y,
      });

      // Calculate escape direction - run AWAY from bigger NPC
      const dx = npc.x - otherNPC.x;
      const dy = npc.y - otherNPC.y;
      const escapeDist = Math.sqrt(dx * dx + dy * dy);
      if (escapeDist > 0) {
        safeDirection.x += (dx / escapeDist) * threatLevel;
        safeDirection.y += (dy / escapeDist) * threatLevel;
      }
    }
  });

  // Sort threats by danger level
  threats.sort((a, b) => b.threatLevel - a.threatLevel);
  const nearestThreat = threats[0];

  // Find best food target (considering size and distance)
  let bestFood = null;
  let bestFoodScore = -Infinity;

  gameState.foods.forEach((food) => {
    const dist = distance(npc.x, npc.y, food.x, food.y);
    const sizeValue = food.radius * 2; // Larger food = better
    const distancePenalty = dist * 0.1;
    const score = sizeValue - distancePenalty;

    // Check if path to food is safe (not too close to threats)
    let isSafe = true;
    threats.forEach((threat) => {
      const foodToThreatDist = distance(food.x, food.y, threat.x, threat.y);
      if (foodToThreatDist < threat.dist * 0.7) {
        isSafe = false;
      }
    });

    if (isSafe && score > bestFoodScore) {
      bestFoodScore = score;
      bestFood = food;
    }
  });

  // Find best prey (smaller players AND smaller NPCs that this NPC can eat)
  let bestPrey = null;
  let bestPreyScore = -Infinity;
  let playerPrey = null; // Separate tracking for player prey

  // Check players as prey - HIGHEST PRIORITY TARGET!
  Object.values(gameState.players).forEach((player) => {
    const playerPos = getPlayerMainPosition(player);
    const dist = distance(npc.x, npc.y, playerPos.x, playerPos.y);
    const sizeDiff = npc.radius / player.radius; // Direct size comparison

    // NPC is bigger than player - HUNT THEM! (reduced range to 400px)
    if (sizeDiff > 1.03 && dist < 400) {
      // Predict player movement (simple prediction)
      const predictedX = playerPos.x + (playerPos.x - (player.x || playerPos.x)) * 0.5;
      const predictedY = playerPos.y + (playerPos.y - (player.y || playerPos.y)) * 0.5;

      const predictedDist = distance(npc.x, npc.y, predictedX, predictedY);
      
      // PLAYER IS ALWAYS TOP PRIORITY - store separately
      playerPrey = {
        x: predictedX,
        y: predictedY,
        target: player,
        type: 'player',
        dist: predictedDist,
      };
    }
  });

  // If player is valid prey, ALWAYS prioritize player!
  if (playerPrey) {
    bestPrey = playerPrey;
    bestPreyScore = 99999; // Very high score to ensure player is always chosen
  }

  // Check other NPCs as prey - ONLY if no player prey available
  if (!playerPrey) {
    Object.values(gameState.npcs).forEach((otherNPC) => {
      if (otherNPC.id === npc.id) return; // Skip self
      
      const dist = distance(npc.x, npc.y, otherNPC.x, otherNPC.y);
      const sizeDiff = npc.radius / otherNPC.radius; // Direct size comparison

      // NPC is bigger by 3% - HUNT THEM! (reduced range to 350px)
      if (sizeDiff > 1.03 && dist < 350) {
        const preyValue = otherNPC.radius * 10;
        const distancePenalty = dist * 0.1;
        const score = preyValue - distancePenalty;

        if (score > bestPreyScore) {
          bestPreyScore = score;
          bestPrey = {
            x: otherNPC.x,
            y: otherNPC.y,
            target: otherNPC,
            type: 'npc',
            dist: dist,
          };
        }
      }
    });
  }

  // Decision making with priority system
  let decisionMade = false;

  // PRIORITY 1: Flee from threats - balanced range
  if (nearestThreat) {
    // Reduced flee range so NPC can still focus on food
    const fleeRange = 300;
    
    if (nearestThreat.dist < fleeRange) {
      const fleeDistance = 300 + npc.intelligenceLevel * 150;
      const dx = npc.x - nearestThreat.x;
      const dy = npc.y - nearestThreat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        targetX = npc.x + (dx / dist) * fleeDistance;
        targetY = npc.y + (dy / dist) * fleeDistance;
        decisionMade = true;
        
        // Debug log for fleeing
        if (Math.random() < 0.02) {
          const threatName = nearestThreat.entity.name || 'Unknown';
          console.log(`🏃💨 NPC ${npc.name} (${Math.floor(npc.radius)}px) FLEEING from ${nearestThreat.type.toUpperCase()} ${threatName} (${Math.floor(nearestThreat.entity.radius)}px) at distance ${Math.floor(nearestThreat.dist)}px`);
        }
        
        // STRATEGIC SPLIT: Split to escape faster when being chased
        if (npc.radius > 35 && nearestThreat.dist < 200 && Math.random() < 0.18) {
          console.log(`💨 NPC ${npc.name} split to escape from ${nearestThreat.type}!`);
          splitNPC(npc);
        }
      }
    }
  }

  // PRIORITY 2: Chase prey - ALWAYS chase if bigger (player OR NPC)!
  if (!decisionMade && bestPrey) {
    // ALWAYS chase prey - no aggression check needed for both player and NPC
    targetX = bestPrey.x;
    targetY = bestPrey.y;
    decisionMade = true;
    
    // Debug log for hunting
    if (Math.random() < 0.02) {
      const targetName = bestPrey.target.name || 'Unknown';
      console.log(`🎯 NPC ${npc.name} (${Math.floor(npc.radius)}px) HUNTING ${bestPrey.type.toUpperCase()} ${targetName} (${Math.floor(bestPrey.target.radius)}px) at distance ${Math.floor(bestPrey.dist)}px`);
    }
    
    // STRATEGIC SPLIT: Split to chase prey faster
    if (npc.radius > 40 && bestPrey.dist > 150 && bestPrey.dist < 350 && Math.random() < 0.12) {
      console.log(`🏃 NPC ${npc.name} split to chase ${bestPrey.type} faster!`);
      splitNPC(npc);
    }
  }

  // PRIORITY 3: Collect food (smarter pathfinding)
  if (!decisionMade && bestFood) {
    // Consider safe path to food
    if (!nearestThreat || nearestThreat.dist > 400) {
      targetX = bestFood.x;
      targetY = bestFood.y;
      decisionMade = true;
    } else {
      // Try to get food while avoiding threat
      const foodDx = bestFood.x - npc.x;
      const foodDy = bestFood.y - npc.y;
      const foodDist = Math.sqrt(foodDx * foodDx + foodDy * foodDy);

      const safeDx = safeDirection.x;
      const safeDy = safeDirection.y;
      const safeDist = Math.sqrt(safeDx * safeDx + safeDy * safeDy);

      if (foodDist > 0 && safeDist > 0) {
        // Blend between food direction and safe direction
        const blendFactor = 0.6; // 60% towards food, 40% away from threat
        targetX = npc.x + (foodDx / foodDist) * blendFactor * 150 + (safeDx / safeDist) * (1 - blendFactor) * 100;
        targetY = npc.y + (foodDy / foodDist) * blendFactor * 150 + (safeDy / safeDist) * (1 - blendFactor) * 100;
        decisionMade = true;
      }
    }
  }

  // PRIORITY 4: Default behavior - explore or stay safe
  if (!decisionMade) {
    if (nearestThreat && nearestThreat.dist < 500) {
      // Move away from threat
      const dx = npc.x - nearestThreat.x;
      const dy = npc.y - nearestThreat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        targetX = npc.x + (dx / dist) * 150;
        targetY = npc.y + (dy / dist) * 150;
      }
    } else {
      // Explore - move towards area with more food
      const exploreAngle = Math.random() * Math.PI * 2;
      targetX = npc.x + Math.cos(exploreAngle) * 200;
      targetY = npc.y + Math.sin(exploreAngle) * 200;
    }
  }

  // Store target for smooth movement
  npc.targetX = targetX;
  npc.targetY = targetY;

  // Move NPC towards target
  const dx = targetX - npc.x;
  const dy = targetY - npc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Calculate movement
  let moveX = 0;
  let moveY = 0;
  if (dist > speed) {
    moveX = (dx / dist) * speed;
    moveY = (dy / dist) * speed;
  } else {
    moveX = dx;
    moveY = dy;
  }

  // Move NPC (and all cells if split)
  if (npc.cells && npc.cells.length > 0) {
    // Move all cells together
    npc.cells.forEach((cell) => {
      cell.x += moveX;
      cell.y += moveY;
      // Keep within bounds
      cell.x = Math.max(cell.radius, Math.min(gameState.worldSize - cell.radius, cell.x));
      cell.y = Math.max(cell.radius, Math.min(gameState.worldSize - cell.radius, cell.y));
    });
    // Update main position from largest cell
    updateNPCStats(npc);
  } else {
    // Single cell NPC
    npc.x += moveX;
    npc.y += moveY;
    // Keep NPC within world bounds
    npc.x = Math.max(npc.radius, Math.min(gameState.worldSize - npc.radius, npc.x));
    npc.y = Math.max(npc.radius, Math.min(gameState.worldSize - npc.radius, npc.y));
  }

  // Handle collisions
  handleNPCEating(npc);
}

// Get NPC cells (similar to getPlayerCells)
function getNPCCells(npc) {
  if (!npc.cells || npc.cells.length === 0) {
    // NPC hasn't split yet, return single cell representation
    return [
      {
        id: npc.id,
        x: npc.x,
        y: npc.y,
        radius: npc.radius,
        score: npc.score,
        owner: npc.id,
      },
    ];
  }

  return npc.cells.map((cell) => ({
    id: cell.id,
    x: cell.x,
    y: cell.y,
    radius: cell.radius,
    score: cell.score || 0,
    owner: npc.id,
  }));
}

// Handle NPC eating logic (with cells support)
function handleNPCEating(npc) {
  const npcCells = getNPCCells(npc);

  // Check food collision for each cell
  npcCells.forEach((npcCell) => {
    gameState.foods = gameState.foods.filter((food) => {
      if (checkCollision(npcCell, food)) {
        // Find cell in npc.cells array
        if (npc.cells && npc.cells.length > 0) {
          const cellData = npc.cells.find((c) => c.id === npcCell.id);
          if (cellData) {
            cellData.radius += 0.5;
            cellData.score += 1;
          }
          updateNPCStats(npc);
        } else {
          npc.radius += 0.5;
          npc.score += 1;
        }
        spawnFood();
        return false;
      }
      return true;
    });
  });

  // Check player collision (NPC cells vs Player cells)
  Object.values(gameState.players).forEach((player) => {
    if (player.id === npc.id) return;
    const playerCells = getPlayerCells(player);

    // Check each NPC cell against each player cell
    npcCells.forEach((npcCell) => {
      playerCells.forEach((playerCell) => {
        if (!checkCollision(npcCell, playerCell)) return;

        if (npcCell.radius > playerCell.radius * 1.03) {
          // NPC cell eats player cell
          if (npc.cells && npc.cells.length > 0) {
            const npcCellData = npc.cells.find((c) => c.id === npcCell.id);
            if (npcCellData) {
              npcCellData.radius += playerCell.radius * 0.3;
              npcCellData.score += Math.floor(playerCell.score / 2);
            }
            updateNPCStats(npc);
          } else {
            npc.radius += playerCell.radius * 0.3;
            npc.score += Math.floor(playerCell.score / 2);
          }

          // Remove eaten cell from player
          if (player.cells && player.cells.length > 1) {
            player.cells = player.cells.filter((c) => c.id !== playerCell.id);
            updatePlayerStats(player);

            if (player.cells.length === 0) {
              // Player died
              const finalScore = player.score;
              const playerId = player.id;
              delete gameState.players[player.id];
              io.to(playerId).emit('eaten', { score: finalScore });
              resetGameWorld(playerId);
              setTimeout(() => {
                io.to(playerId).disconnectSockets();
              }, 100);
            }
          } else {
            // Player died
            const finalScore = player.score;
            const playerId = player.id;
            delete gameState.players[player.id];
            io.to(playerId).emit('eaten', { score: finalScore });
            resetGameWorld(playerId);
            setTimeout(() => {
              io.to(playerId).disconnectSockets();
            }, 100);
          }
        } else if (playerCell.radius > npcCell.radius * 1.03) {
          // Player cell eats NPC cell
          const playerCellData = player.cells ? player.cells.find((c) => c.id === playerCell.id) : null;
          if (playerCellData) {
            playerCellData.radius += npcCell.radius * 0.3;
            playerCellData.score += Math.floor(npcCell.score / 2);
            updatePlayerStats(player);
          } else {
            player.radius += npcCell.radius * 0.3;
            player.score += Math.floor(npcCell.score / 2);
          }

          // Remove eaten NPC cell
          if (npc.cells && npc.cells.length > 1) {
            npc.cells = npc.cells.filter((c) => c.id !== npcCell.id);
            updateNPCStats(npc);
          } else {
            // NPC completely eaten, spawn new one
            delete gameState.npcs[npc.id];
            const newNPC = createNPC();
            gameState.npcs[newNPC.id] = newNPC;
            return;
          }
        }
      });
    });
  });

  // Check NPC vs NPC collision (cells vs cells!)
  const otherNPCs = Object.values(gameState.npcs);
  for (let i = 0; i < otherNPCs.length; i++) {
    const otherNPC = otherNPCs[i];
    
    // Skip if same NPC or if either NPC has been deleted
    if (otherNPC.id === npc.id || !gameState.npcs[npc.id] || !gameState.npcs[otherNPC.id]) continue;
    
    const otherNPCCells = getNPCCells(otherNPC);

    // Check each NPC cell against each other NPC cell
    npcCells.forEach((npcCell) => {
      otherNPCCells.forEach((otherCell) => {
        if (!checkCollision(npcCell, otherCell)) return;

        // If sizes are very similar (within 1%), bounce off each other
        if (Math.abs(npcCell.radius - otherCell.radius) < Math.max(npcCell.radius, otherCell.radius) * 0.01) {
          // Extremely strong push force to separate cells
          const dx = npcCell.x - otherCell.x;
          const dy = npcCell.y - otherCell.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0 && dist < npcCell.radius + otherCell.radius) {
            // Calculate overlap
            const overlap = (npcCell.radius + otherCell.radius) - dist;
            const pushForce = overlap * 4.0; // Very strong push force
            
            // Push both cells apart
            const pushX = (dx / dist) * pushForce;
            const pushY = (dy / dist) * pushForce;
            
            // Update cell positions if they exist in cells array
            if (npc.cells && npc.cells.length > 0) {
              const npcCellData = npc.cells.find((c) => c.id === npcCell.id);
              if (npcCellData) {
                npcCellData.x += pushX;
                npcCellData.y += pushY;
                npcCellData.x = Math.max(npcCellData.radius, Math.min(gameState.worldSize - npcCellData.radius, npcCellData.x));
                npcCellData.y = Math.max(npcCellData.radius, Math.min(gameState.worldSize - npcCellData.radius, npcCellData.y));
              }
              updateNPCStats(npc);
            }
            
            if (otherNPC.cells && otherNPC.cells.length > 0) {
              const otherCellData = otherNPC.cells.find((c) => c.id === otherCell.id);
              if (otherCellData) {
                otherCellData.x -= pushX;
                otherCellData.y -= pushY;
                otherCellData.x = Math.max(otherCellData.radius, Math.min(gameState.worldSize - otherCellData.radius, otherCellData.x));
                otherCellData.y = Math.max(otherCellData.radius, Math.min(gameState.worldSize - otherCellData.radius, otherCellData.y));
              }
              updateNPCStats(otherNPC);
            }
          }
          
          return; // Skip eating if bouncing
        }

        // One cell must be at least 2% bigger to eat the other (very aggressive)
        if (npcCell.radius > otherCell.radius * 1.02) {
          // This NPC cell eats the other NPC cell
          if (npc.cells && npc.cells.length > 0) {
            const npcCellData = npc.cells.find((c) => c.id === npcCell.id);
            if (npcCellData) {
              npcCellData.radius += otherCell.radius * 0.4;
              npcCellData.score += Math.floor(otherCell.score * 0.7);
            }
            updateNPCStats(npc);
          } else {
            npc.radius += otherCell.radius * 0.4;
            npc.score += Math.floor(otherCell.score * 0.7);
          }
          
          // Remove eaten cell from other NPC
          if (otherNPC.cells && otherNPC.cells.length > 1) {
            otherNPC.cells = otherNPC.cells.filter((c) => c.id !== otherCell.id);
            updateNPCStats(otherNPC);
          } else {
            // Other NPC completely eaten, spawn new one
            delete gameState.npcs[otherNPC.id];
            const newNPC = createNPC();
            gameState.npcs[newNPC.id] = newNPC;
            console.log(`🦠 NPC ${npc.name} cell ate NPC ${otherNPC.name}!`);
          }
        } else if (otherCell.radius > npcCell.radius * 1.02) {
          // Other NPC cell eats this NPC cell
          if (otherNPC.cells && otherNPC.cells.length > 0) {
            const otherCellData = otherNPC.cells.find((c) => c.id === otherCell.id);
            if (otherCellData) {
              otherCellData.radius += npcCell.radius * 0.4;
              otherCellData.score += Math.floor(npcCell.score * 0.7);
            }
            updateNPCStats(otherNPC);
          } else {
            otherNPC.radius += npcCell.radius * 0.4;
            otherNPC.score += Math.floor(npcCell.score * 0.7);
          }
          
          // Remove eaten cell from this NPC
          if (npc.cells && npc.cells.length > 1) {
            npc.cells = npc.cells.filter((c) => c.id !== npcCell.id);
            updateNPCStats(npc);
          } else {
            // This NPC completely eaten, spawn new one
            delete gameState.npcs[npc.id];
            const newNPC = createNPC();
            gameState.npcs[newNPC.id] = newNPC;
            console.log(`🦠 NPC ${otherNPC.name} cell ate NPC ${npc.name}!`);
            return;
          }
        }
      });
    });
  }
}

// NPC split function - same as player (with cells and merge time)
function splitNPC(npc) {
  if (!npc || npc.radius < 40) return false;

  // Initialize cells array if not exists
  if (!npc.cells || npc.cells.length === 0) {
    npc.cells = [
      {
        id: `${npc.id}_cell_0`,
        x: npc.x,
        y: npc.y,
        radius: npc.radius,
        score: npc.score,
      },
    ];
  }

  // Find largest cell to split
  let largestCell = npc.cells[0];
  npc.cells.forEach((cell) => {
    if (cell.radius > largestCell.radius) {
      largestCell = cell;
    }
  });

  if (largestCell.radius < 30) return false;

  // Create new cell with merge time (30 seconds)
  const angle = Math.random() * Math.PI * 2;
  const distance = largestCell.radius * 1.5;
  const now = Date.now();
  
  const newCell = {
    id: `${npc.id}_cell_${Date.now()}_${Math.random()}`,
    x: largestCell.x + Math.cos(angle) * distance,
    y: largestCell.y + Math.sin(angle) * distance,
    radius: largestCell.radius / 2,
    score: Math.floor(largestCell.score / 2),
    createdAt: now,
    mergeTime: now + 30000, // Auto-merge after 30 seconds
  };

  // Add timestamp to original cell if not exists
  if (!largestCell.createdAt) {
    largestCell.createdAt = now;
    largestCell.mergeTime = now + 30000;
  }

  // Reduce original cell size
  largestCell.radius = largestCell.radius / 2;
  largestCell.score = Math.floor(largestCell.score / 2);

  // Add new cell
  npc.cells.push(newCell);

  // Update NPC stats
  updateNPCStats(npc);

  return true;
}

// Update NPC stats from cells (same as player)
function updateNPCStats(npc) {
  if (!npc.cells || npc.cells.length === 0) return;

  let largestCell = npc.cells[0];
  let totalScore = 0;
  let totalRadius = 0;

  npc.cells.forEach((cell) => {
    totalScore += cell.score;
    totalRadius += cell.radius * cell.radius;
    if (cell.radius > largestCell.radius) {
      largestCell = cell;
    }
  });

  npc.x = largestCell.x;
  npc.y = largestCell.y;
  npc.radius = Math.sqrt(totalRadius);
  npc.score = totalScore;
}

// Update all NPCs
function updateNPCs() {
  Object.values(gameState.npcs).forEach((npc) => {
    updateNPC(npc);
  });
}

// Split player cells - cells become part of the player and follow together
function splitPlayer(playerId) {
  const player = gameState.players[playerId];
  if (!player) return false;

  // Initialize cells array if not exists
  if (!player.cells) {
    player.cells = [
      {
        id: playerId,
        x: player.x,
        y: player.y,
        radius: player.radius,
        score: player.score,
      },
    ];
    player.x = player.cells[0].x; // Main cell position
    player.y = player.cells[0].y;
  }

  // Find the largest cell to split
  let largestCell = null;
  let largestIndex = 0;
  player.cells.forEach((cell, index) => {
    if (!largestCell || cell.radius > largestCell.radius) {
      largestCell = cell;
      largestIndex = index;
    }
  });

  if (!largestCell || largestCell.radius < 30) return false; // Minimum size to split

  // Create new cell with timestamp for auto-merge
  const angle = Math.random() * Math.PI * 2;
  const distance = largestCell.radius * 1.5;
  const now = Date.now();
  const newCell = {
    id: `${playerId}_${now}_${Math.random()}`,
    x: largestCell.x + Math.cos(angle) * distance,
    y: largestCell.y + Math.sin(angle) * distance,
    radius: largestCell.radius / 2,
    score: Math.floor(largestCell.score / 2),
    createdAt: now, // Timestamp untuk auto-merge
    mergeTime: now + 30000, // Auto-merge setelah 30 detik
  };

  // Add timestamp to original cell if not exists
  if (!largestCell.createdAt) {
    largestCell.createdAt = now;
    largestCell.mergeTime = now + 30000;
  }

  // Reduce original cell size
  largestCell.radius = largestCell.radius / 2;
  largestCell.score = Math.floor(largestCell.score / 2);

  // Add new cell to player's cells
  player.cells.push(newCell);

  // Update player total score and radius
  updatePlayerStats(player);

  console.log(`✂️ Player ${player.name} split! Cells: ${player.cells.length}, will auto-merge in 30 seconds`);

  return true;
}

// Pull cells towards main cell as merge time approaches
function pullCellsTowardsMain(player) {
  if (!player.cells || player.cells.length <= 1) return;

  const now = Date.now();
  
  // Find main cell (largest cell without mergeTime or with most time left)
  let mainCell = player.cells[0];
  player.cells.forEach((cell) => {
    if (!cell.mergeTime || (mainCell.mergeTime && cell.radius > mainCell.radius)) {
      mainCell = cell;
    }
  });

  // Add collision between player's own cells (prevent overlap)
  for (let i = 0; i < player.cells.length; i++) {
    for (let j = i + 1; j < player.cells.length; j++) {
      const cell1 = player.cells[i];
      const cell2 = player.cells[j];
      
      const dx = cell1.x - cell2.x;
      const dy = cell1.y - cell2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = cell1.radius + cell2.radius;
      
      // If cells overlap, push them apart
      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const pushForce = overlap * 0.5; // Gentle push
        
        const pushX = (dx / dist) * pushForce;
        const pushY = (dy / dist) * pushForce;
        
        cell1.x += pushX;
        cell1.y += pushY;
        cell2.x -= pushX;
        cell2.y -= pushY;
      }
    }
  }

  // Pull other cells towards main cell based on time remaining
  player.cells.forEach((cell) => {
    if (cell.id === mainCell.id || !cell.mergeTime) return;

    const timeRemaining = cell.mergeTime - now;
    const totalMergeTime = 30000; // 30 seconds
    
    // Start pulling immediately from the moment of split (30s remaining)
    if (timeRemaining > 0 && timeRemaining <= totalMergeTime) {
      // Pull strength increases as time passes (0 at start, 1 at end)
      const timeElapsed = totalMergeTime - timeRemaining;
      const pullStrength = timeElapsed / totalMergeTime; // 0 to 1 over 30 seconds
      
      const dx = mainCell.x - cell.x;
      const dy = mainCell.y - cell.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        // Reduced pull speed: starts very slow, ends moderate (not extreme)
        const pullSpeed = pullStrength * pullStrength * 2; // Reduced from 5 to 2 pixels/frame
        cell.x += (dx / dist) * pullSpeed;
        cell.y += (dy / dist) * pullSpeed;
      }
    }
  });
}

// Auto-merge cells that are ready to merge (after 30 seconds)
function autoMergeCells(player) {
  if (!player.cells || player.cells.length <= 1) return;

  const now = Date.now();
  let cellsToMerge = [];
  let cellsToKeep = [];

  // Separate cells that are ready to merge
  player.cells.forEach((cell) => {
    if (cell.mergeTime && now >= cell.mergeTime) {
      cellsToMerge.push(cell);
    } else {
      cellsToKeep.push(cell);
    }
  });

  // If we have cells to merge
  if (cellsToMerge.length > 0) {
    // Create one merged cell from all cells that are ready to merge
    let mergedCell = cellsToMerge[0];
    
    // Merge all other ready cells into the first one
    for (let i = 1; i < cellsToMerge.length; i++) {
      const cell = cellsToMerge[i];
      mergedCell.radius = Math.sqrt(mergedCell.radius * mergedCell.radius + cell.radius * cell.radius);
      mergedCell.score += cell.score;
    }
    
    // Remove merge time from merged cell (it's now permanent)
    delete mergedCell.createdAt;
    delete mergedCell.mergeTime;

    // Add merged cell to cells to keep
    cellsToKeep.push(mergedCell);
    
    // Update player cells array with kept cells + merged cell
    player.cells = cellsToKeep;

    console.log(`🔄 Player ${player.name} auto-merged ${cellsToMerge.length} cells! Total cells now: ${player.cells.length}`);
    
    updatePlayerStats(player);
  }
}

// Update player stats from cells
function updatePlayerStats(player) {
  if (!player.cells || player.cells.length === 0) return;

  // Find largest cell (main cell)
  let largestCell = player.cells[0];
  let totalScore = 0;
  let totalRadius = 0;

  player.cells.forEach((cell) => {
    totalScore += cell.score;
    totalRadius += cell.radius * cell.radius; // Use area for total size
    if (cell.radius > largestCell.radius) {
      largestCell = cell;
    }
  });

  // Update main position to largest cell
  player.x = largestCell.x;
  player.y = largestCell.y;
  player.radius = Math.sqrt(totalRadius); // Total radius based on area
  player.score = totalScore;
}

// Get all cells for a player (for collision detection)
function getPlayerCells(player) {
  if (!player.cells || player.cells.length === 0) {
    return [
      {
        id: player.id,
        x: player.x,
        y: player.y,
        radius: player.radius,
        score: player.score || 0,
        owner: player.id,
      },
    ];
  }

  return player.cells.map((cell) => ({
    id: cell.id,
    x: cell.x,
    y: cell.y,
    radius: cell.radius,
    score: cell.score || 0,
    owner: player.id,
  }));
}

// Handle player eating logic with multiple cells
function handlePlayerEating(player) {
  const playerCells = getPlayerCells(player);

  // Check food collision for each cell
  playerCells.forEach((cell) => {
    gameState.foods = gameState.foods.filter((food) => {
      if (checkCollision(cell, food)) {
        // Find cell in player.cells array
        const cellData = player.cells ? player.cells.find((c) => c.id === cell.id) : null;
        if (cellData) {
          cellData.radius += 0.5;
          cellData.score += 1;
        } else {
          // Single cell player
          player.radius += 0.5;
          player.score += 1;
        }
        spawnFood();
        return false;
      }
      return true;
    });
  });

  // Update player stats after eating
  if (player.cells) {
    updatePlayerStats(player);
  }

  // Check NPC collision
  Object.values(gameState.npcs).forEach((npc) => {
    playerCells.forEach((cell) => {
      if (!checkCollision(cell, npc)) return;

      if (cell.radius > npc.radius * 1.03) {
        // Player cell eats NPC (same as NPC vs NPC: 3% bigger)
        console.log(`👤 Player ${player.name} (${Math.floor(cell.radius)}px) ate NPC ${npc.name} (${Math.floor(npc.radius)}px)!`);
        
        const cellData = player.cells ? player.cells.find((c) => c.id === cell.id) : null;
        if (cellData) {
          cellData.radius += npc.radius * 0.3;
          cellData.score += Math.floor(npc.score / 2);
        } else {
          player.radius += npc.radius * 0.3;
          player.score += Math.floor(npc.score / 2);
        }
        delete gameState.npcs[npc.id];
        const newNPC = createNPC();
        gameState.npcs[newNPC.id] = newNPC;
        if (player.cells) updatePlayerStats(player);
        return;
      } else if (npc.radius > cell.radius * 1.03) {
        // NPC eats player cell (same as NPC vs NPC: 3% bigger)
        if (player.cells && player.cells.length > 1) {
          // Remove eaten cell
          player.cells = player.cells.filter((c) => c.id !== cell.id);
          updatePlayerStats(player);

          // If no cells left, player dies
          if (player.cells.length === 0) {
            // Player died - reset game world
            const finalScore = player.score;
            const playerId = player.id;
            delete gameState.players[player.id];
            io.to(playerId).emit('eaten', { score: finalScore });

            // Reset game world and send new state
            resetGameWorld(playerId);

            // Disconnect after a short delay to ensure client receives reset state
            setTimeout(() => {
              io.to(playerId).disconnectSockets();
            }, 100);
          }
        } else {
          // Single cell player dies - reset game world
          const finalScore = player.score;
          const playerId = player.id;
          npc.radius += player.radius * 0.3;
          npc.score += Math.floor(player.score / 2);
          delete gameState.players[player.id];
          io.to(playerId).emit('eaten', { score: finalScore });

          // Reset game world and send new state
          resetGameWorld(playerId);

          // Disconnect after a short delay to ensure client receives reset state
          setTimeout(() => {
            io.to(playerId).disconnectSockets();
          }, 100);
        }
        return;
      }
    });
  });

  // OFFLINE MODE: No player vs player collision (only 1 player allowed)
}

// Initialize NPCs
initializeNPCs();

// Socket.io connection handling - OFFLINE MODE: Single Player Only
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send highscores immediately (for menu display)
  socket.emit('highscores', highscores.slice(0, 10));
  
  // Handle start game request - only create player when user clicks START
  socket.on('startGame', (data) => {
    // Check if there's already a player (offline mode - only 1 player)
    const currentPlayerCount = Object.keys(gameState.players).length;

    if (currentPlayerCount >= gameState.maxPlayers) {
      console.log('Game is full (offline mode - single player only). Rejecting:', socket.id);
      socket.emit('gameFull', { message: 'Game is full. This is an offline single-player game.' });
      return;
    }

    console.log('Player starting game (Offline Mode):', socket.id);

    // Reset game world for fresh start
    console.log('Resetting game world for new player...');
    resetGameWorld();

    // Create new player
    const playerName = data.name || `Bakteri ${socket.id.substring(0, 5)}`;
    const player = {
      id: socket.id,
      x: Math.random() * gameState.worldSize,
      y: Math.random() * gameState.worldSize,
      radius: 15,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      score: 0,
      name: playerName,
    };

    gameState.players[socket.id] = player;

    // Send initial game state
    socket.emit('init', {
      player: player,
      worldSize: gameState.worldSize,
    });

    // Send current game state (only this player's data in offline mode)
    socket.emit('gameState', {
      players: gameState.players, // Only contains this player
      npcs: gameState.npcs,
      foods: gameState.foods,
      isOfflineMode: true, // Flag to indicate offline mode
    });
    
    console.log(`Player ${playerName} joined the game!`);
  });

  // Handle player movement - all cells move together
  socket.on('move', (data) => {
    if (!gameState.players[socket.id]) return;

    const player = gameState.players[socket.id];

    // Initialize cells if not exists
    if (!player.cells) {
      player.cells = [
        {
          id: socket.id,
          x: player.x,
          y: player.y,
          radius: player.radius,
          score: player.score,
        },
      ];
    }

    // Find largest cell (main cell)
    let largestCell = player.cells[0];
    player.cells.forEach((cell) => {
      if (cell.radius > largestCell.radius) {
        largestCell = cell;
      }
    });

    // Calculate speed based on largest cell
    const speed = 5 / (largestCell.radius / 15);

    // Calculate movement direction towards mouse
    const dx = data.x - largestCell.x;
    const dy = data.y - largestCell.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Move all cells together
    if (dist > speed) {
      const moveX = (dx / dist) * speed;
      const moveY = (dy / dist) * speed;

      // Move each cell toward mouse but maintain relative positions
      player.cells.forEach((cell, index) => {
        if (index === 0 || cell.id === largestCell.id) {
          // Main cell moves directly to mouse
          cell.x += moveX;
          cell.y += moveY;
        } else {
          // Other cells follow the main cell
          const cellDx = largestCell.x - cell.x;
          const cellDy = largestCell.y - cell.y;
          const cellDist = Math.sqrt(cellDx * cellDx + cellDy * cellDy);

          // Try to maintain spacing but also move toward mouse
          const followSpeed = speed * 0.8; // Slightly slower for following cells
          const targetX = largestCell.x + moveX;
          const targetY = largestCell.y + moveY;

          const followDx = targetX - cell.x;
          const followDy = targetY - cell.y;
          const followDist = Math.sqrt(followDx * followDx + followDy * followDy);

          if (followDist > followSpeed) {
            cell.x += (followDx / followDist) * followSpeed;
            cell.y += (followDy / followDist) * followSpeed;
          } else {
            cell.x = targetX;
            cell.y = targetY;
          }
        }

        // Keep cell within world bounds
        cell.x = Math.max(cell.radius, Math.min(gameState.worldSize - cell.radius, cell.x));
        cell.y = Math.max(cell.radius, Math.min(gameState.worldSize - cell.radius, cell.y));
      });

      // Update main position
      player.x = largestCell.x;
      player.y = largestCell.y;
    } else {
      // If close enough, just update position
      largestCell.x = data.x;
      largestCell.y = data.y;
      player.x = data.x;
      player.y = data.y;
    }

    // Update player stats
    updatePlayerStats(player);

    // Handle eating
    handlePlayerEating(player);
  });

  // Handle split
  socket.on('split', () => {
    if (gameState.players[socket.id]) {
      splitPlayer(socket.id);
    }
  });

  // Handle player name change
  socket.on('nameChange', (name) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].name = name.substring(0, 15);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    const player = gameState.players[socket.id];
    if (player) {
      // Save highscore
      if (player.score > 0) {
        highscores.push({
          name: player.name,
          score: player.score,
          date: new Date().toISOString(),
        });
        highscores.sort((a, b) => b.score - a.score);
        highscores.splice(10); // Keep top 10
        io.emit('highscores', highscores.slice(0, 10));
      }
      delete gameState.players[socket.id];
    }
  });
});

// Game loop - update NPCs and broadcast game state (higher frequency for smoother movement)
// Only runs when there are active players
setInterval(() => {
  // Only run game logic if there are players
  const hasPlayers = Object.keys(gameState.players).length > 0;
  if (!hasPlayers) return;
  
  updateNPCs();

  // Maintain food count - ensure there's always enough food
  maintainFoodCount();

  // Pull cells towards main cell and auto-merge when ready (for both players and NPCs)
  Object.values(gameState.players).forEach((player) => {
    pullCellsTowardsMain(player); // Pull cells when time is almost up
    autoMergeCells(player); // Merge cells when time is up
  });

  // Same for NPCs
  Object.values(gameState.npcs).forEach((npc) => {
    pullCellsTowardsMain(npc); // Pull NPC cells
    autoMergeCells(npc); // Merge NPC cells
  });

  // Broadcast game state (in offline mode, only to the single player)
  Object.keys(gameState.players).forEach((playerId) => {
    io.to(playerId).emit('gameState', {
      players: gameState.players,
      npcs: gameState.npcs,
      foods: gameState.foods,
      isOfflineMode: true,
    });
  });
}, 33); // ~30 FPS (33ms) for smoother updates

// Auto-spawn food periodically to ensure continuous food supply
// Only runs when there are active players
setInterval(() => {
  const hasPlayers = Object.keys(gameState.players).length > 0;
  if (!hasPlayers) return;
  
  maintainFoodCount();
  // Spawn extra food if count is low
  if (gameState.foods.length < gameState.maxFood * 0.7) {
    const foodToSpawn = Math.min(gameState.maxFood - gameState.foods.length, 100);
    spawnMultipleFoods(foodToSpawn);
  }
}, 2000); // Check every 2 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Micro.io running on http://localhost:${PORT}`);
});
