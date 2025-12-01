const { app, BrowserWindow } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;
let httpServer;

// Start the game server embedded in Electron
function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const express = require('express');
      const http = require('http');
      const { Server } = require('socket.io');

      const expressApp = express();
      httpServer = http.createServer(expressApp);
      const io = new Server(httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      // Serve static files from client folder
      const clientPath = path.join(__dirname, '..', 'client');
      expressApp.use(express.static(clientPath));

      expressApp.get('/', (req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
      });

      // ============ GAME LOGIC (embedded from server/index.js) ============
      
      // Highscore storage
      const highscores = [];

      // Game state
      const gameState = {
        players: {},
        npcs: {},
        foods: [],
        maxFood: 500,
        maxNPCs: 20,
        worldSize: 3000,
        maxPlayers: 1,
      };

      // Bacteria names for food
      const bacteriaNames = [
        'Bacillus', 'E. coli', 'Staphylococcus', 'Streptococcus', 'Lactobacillus',
        'Bifidobacterium', 'Salmonella', 'Vibrio', 'Pseudomonas', 'Mycobacterium',
        'Virus RNA', 'Virus DNA', 'Bakteri Gram+', 'Bakteri Gram-', 'Archaebacteria',
      ];

      // NPC names
      const npcNames = [
        'Coronavirus', 'Influenza', 'HIV', 'Ebola', 'Rabies', 'Herpes', 'Hepatitis',
        'Rotavirus', 'Norovirus', 'Zika', 'Dengue', 'Malaria', 'Plasmodium',
        'E.coli', 'Salmonella', 'Listeria', 'Campylobacter', 'Shigella', 'Vibrio',
        'Staphylococcus', 'Streptococcus', 'Enterococcus', 'Clostridium', 'Bacillus',
        'Mycobacterium', 'Neisseria', 'Haemophilus', 'Bordetella', 'Legionella',
        'Pseudomonas', 'Acinetobacter', 'Klebsiella', 'Proteus', 'Serratia',
        'Treponema', 'Borrelia', 'Leptospira', 'Chlamydia', 'Rickettsia',
        'Candida', 'Aspergillus', 'Cryptococcus', 'Histoplasma', 'Blastomyces',
        'T4-Phage', 'Lambda', 'Adenovirus', 'Papilloma', 'Polyoma', 'Parvovirus',
        'Reovirus', 'Togavirus', 'Flavivirus', 'Bunyavirus', 'Arenavirus', 'Yersinia',
      ];

      const foodTypes = ['air', 'enzim', 'daun'];
      const npcTypes = ['virus', 'bacillus', 'amoeba', 'sel'];

      // Helper functions
      function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      }

      function generateFood() {
        const foods = [];
        for (let i = 0; i < gameState.maxFood; i++) {
          foods.push({
            id: i,
            x: Math.random() * gameState.worldSize,
            y: Math.random() * gameState.worldSize,
            radius: 4 + Math.random() * 3,
            color: `hsl(${Math.random() * 360}, 70%, ${50 + Math.random() * 20}%)`,
            name: bacteriaNames[Math.floor(Math.random() * bacteriaNames.length)],
            foodType: foodTypes[Math.floor(Math.random() * foodTypes.length)],
          });
        }
        return foods;
      }

      function spawnFood() {
        const newFood = {
          id: Date.now() + Math.random(),
          x: Math.random() * gameState.worldSize,
          y: Math.random() * gameState.worldSize,
          radius: 4 + Math.random() * 3,
          color: `hsl(${Math.random() * 360}, 70%, ${50 + Math.random() * 20}%)`,
          name: bacteriaNames[Math.floor(Math.random() * bacteriaNames.length)],
          foodType: foodTypes[Math.floor(Math.random() * foodTypes.length)],
        };
        gameState.foods.push(newFood);
        return newFood;
      }

      function getPlayerMainPosition(player) {
        if (player.cells && player.cells.length > 0) {
          let largestCell = player.cells[0];
          player.cells.forEach((cell) => {
            if (cell.radius > largestCell.radius) largestCell = cell;
          });
          return { x: largestCell.x, y: largestCell.y, radius: largestCell.radius };
        }
        return { x: player.x, y: player.y, radius: player.radius };
      }

      // Initialize food
      gameState.foods = generateFood();

      // Create NPC
      function createNPC() {
        const id = 'npc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const baseName = npcNames[Math.floor(Math.random() * npcNames.length)];
        const uniqueNumber = Math.floor(Math.random() * 100);
        
        return {
          id: id,
          x: Math.random() * gameState.worldSize,
          y: Math.random() * gameState.worldSize,
          radius: 15 + Math.random() * 25,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          score: 0,
          name: baseName + uniqueNumber,
          npcType: npcTypes[Math.floor(Math.random() * npcTypes.length)],
          targetX: null,
          targetY: null,
          lastDecision: 0,
          aggressionLevel: 0.3 + Math.random() * 0.7,
          intelligenceLevel: 0.3 + Math.random() * 0.7,
        };
      }

      // Initialize NPCs
      function initializeNPCs() {
        for (let i = 0; i < gameState.maxNPCs; i++) {
          const npc = createNPC();
          gameState.npcs[npc.id] = npc;
        }
      }

      // Reset game world
      function resetGameWorld() {
        gameState.npcs = {};
        initializeNPCs();
        gameState.foods = generateFood();
        console.log('Game world reset');
      }

      // Simple NPC AI update
      function updateNPC(npc) {
        const speed = 2.5 / (npc.radius / 20);
        
        // Find nearest food
        let nearestFood = null;
        let nearestFoodDist = Infinity;
        
        gameState.foods.forEach((food) => {
          const dist = distance(npc.x, npc.y, food.x, food.y);
          if (dist < nearestFoodDist) {
            nearestFoodDist = dist;
            nearestFood = food;
          }
        });

        // Check for player prey or threat
        let targetX = npc.x;
        let targetY = npc.y;
        let fleeing = false;

        Object.values(gameState.players).forEach((player) => {
          const playerPos = getPlayerMainPosition(player);
          const dist = distance(npc.x, npc.y, playerPos.x, playerPos.y);
          const sizeDiff = npc.radius / playerPos.radius;

          if (sizeDiff > 1.03 && dist < 400) {
            // Hunt player
            targetX = playerPos.x;
            targetY = playerPos.y;
          } else if (sizeDiff < 0.97 && dist < 300) {
            // Flee from player
            const dx = npc.x - playerPos.x;
            const dy = npc.y - playerPos.y;
            const fleeD = Math.sqrt(dx * dx + dy * dy);
            if (fleeD > 0) {
              targetX = npc.x + (dx / fleeD) * 300;
              targetY = npc.y + (dy / fleeD) * 300;
              fleeing = true;
            }
          }
        });

        // Hunt other NPCs if bigger
        if (!fleeing && targetX === npc.x) {
          let bestPrey = null;
          let bestPreyScore = -Infinity;
          
          Object.values(gameState.npcs).forEach((otherNpc) => {
            if (otherNpc.id === npc.id) return;
            const d = distance(npc.x, npc.y, otherNpc.x, otherNpc.y);
            const sizeDiff = npc.radius / otherNpc.radius;
            
            // Can eat if 3% bigger and within range
            if (sizeDiff > 1.03 && d < 350) {
              const score = (sizeDiff - 1) * 100 - d * 0.1;
              if (score > bestPreyScore) {
                bestPreyScore = score;
                bestPrey = otherNpc;
              }
            }
            
            // Flee from bigger NPCs
            if (sizeDiff < 0.97 && d < 300 && !fleeing) {
              const dx = npc.x - otherNpc.x;
              const dy = npc.y - otherNpc.y;
              const fleeD = Math.sqrt(dx * dx + dy * dy) || 1;
              targetX = npc.x + (dx / fleeD) * 300;
              targetY = npc.y + (dy / fleeD) * 300;
              fleeing = true;
            }
          });
          
          if (bestPrey && !fleeing) {
            targetX = bestPrey.x;
            targetY = bestPrey.y;
          }
        }

        // If not fleeing and no prey target, go for food
        if (!fleeing && nearestFood && targetX === npc.x) {
          targetX = nearestFood.x;
          targetY = nearestFood.y;
        }

        // Move towards target
        const dx = targetX - npc.x;
        const dy = targetY - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > speed) {
          npc.x += (dx / dist) * speed;
          npc.y += (dy / dist) * speed;
        }

        // Keep within bounds
        npc.x = Math.max(npc.radius, Math.min(gameState.worldSize - npc.radius, npc.x));
        npc.y = Math.max(npc.radius, Math.min(gameState.worldSize - npc.radius, npc.y));

        // Eat food
        gameState.foods = gameState.foods.filter((food) => {
          const dist = distance(npc.x, npc.y, food.x, food.y);
          if (dist < npc.radius + food.radius) {
            npc.radius += food.radius * 0.15;
            npc.score += Math.floor(food.radius);
            return false;
          }
          return true;
        });

        // NPC vs NPC collision
        Object.values(gameState.npcs).forEach((otherNpc) => {
          if (otherNpc.id === npc.id) return;
          if (!gameState.npcs[npc.id] || !gameState.npcs[otherNpc.id]) return;
          
          const d = distance(npc.x, npc.y, otherNpc.x, otherNpc.y);
          if (d < npc.radius + otherNpc.radius) {
            // Check size difference (3% threshold)
            if (npc.radius > otherNpc.radius * 1.03) {
              // This NPC eats the other
              npc.radius += otherNpc.radius * 0.4;
              npc.score += Math.floor(otherNpc.score * 0.7);
              delete gameState.npcs[otherNpc.id];
              // Respawn new NPC
              const newNpc = createNPC();
              gameState.npcs[newNpc.id] = newNpc;
            } else if (otherNpc.radius > npc.radius * 1.03) {
              // Other NPC eats this one
              otherNpc.radius += npc.radius * 0.4;
              otherNpc.score += Math.floor(npc.score * 0.7);
              delete gameState.npcs[npc.id];
              // Respawn new NPC
              const newNpc = createNPC();
              gameState.npcs[newNpc.id] = newNpc;
            } else {
              // Similar size - push apart
              const dx = npc.x - otherNpc.x;
              const dy = npc.y - otherNpc.y;
              const pushDist = Math.sqrt(dx * dx + dy * dy) || 1;
              const overlap = (npc.radius + otherNpc.radius) - d;
              const pushForce = overlap * 0.5;
              
              npc.x += (dx / pushDist) * pushForce;
              npc.y += (dy / pushDist) * pushForce;
              otherNpc.x -= (dx / pushDist) * pushForce;
              otherNpc.y -= (dy / pushDist) * pushForce;
            }
          }
        });
      }

      // Initialize
      initializeNPCs();

      // Socket.io handling
      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.emit('highscores', highscores.slice(0, 10));

        socket.on('startGame', (data) => {
          if (Object.keys(gameState.players).length >= gameState.maxPlayers) {
            socket.emit('gameFull');
            return;
          }

          resetGameWorld();

          const startX = Math.random() * gameState.worldSize;
          const startY = Math.random() * gameState.worldSize;
          const player = {
            id: socket.id,
            x: startX,
            y: startY,
            radius: 15,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            score: 0,
            name: data.name || 'Player',
            cells: [{
              id: socket.id + '_0',
              x: startX,
              y: startY,
              radius: 15,
              mergeTime: 0,
            }],
          };

          gameState.players[socket.id] = player;
          socket.emit('init', { player, worldSize: gameState.worldSize });
          socket.emit('gameState', { players: gameState.players, npcs: gameState.npcs, foods: gameState.foods });
        });

        socket.on('move', (data) => {
          const player = gameState.players[socket.id];
          if (!player) return;

          // Store target for split direction
          player.targetX = data.x;
          player.targetY = data.y;

          // Move all cells towards target
          if (player.cells && player.cells.length > 0) {
            player.cells.forEach(cell => {
              const speed = 5 / (cell.radius / 15);
              const dx = data.x - cell.x;
              const dy = data.y - cell.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Apply velocity (for split momentum)
              if (cell.velocityX) {
                cell.x += cell.velocityX;
                cell.y += cell.velocityY;
                cell.velocityX *= 0.9;
                cell.velocityY *= 0.9;
                if (Math.abs(cell.velocityX) < 0.1) cell.velocityX = 0;
                if (Math.abs(cell.velocityY) < 0.1) cell.velocityY = 0;
              }

              if (dist > speed) {
                cell.x += (dx / dist) * speed;
                cell.y += (dy / dist) * speed;
              }

              cell.x = Math.max(cell.radius, Math.min(gameState.worldSize - cell.radius, cell.x));
              cell.y = Math.max(cell.radius, Math.min(gameState.worldSize - cell.radius, cell.y));

              // Eat food (reduced growth)
              gameState.foods = gameState.foods.filter((food) => {
                const d = distance(cell.x, cell.y, food.x, food.y);
                if (d < cell.radius + food.radius) {
                  cell.radius += food.radius * 0.1; // Reduced from 0.15
                  player.score += Math.floor(food.radius);
                  return false;
                }
                return true;
              });

              // Check NPC collisions for this cell
              Object.values(gameState.npcs).forEach((npc) => {
                const d = distance(cell.x, cell.y, npc.x, npc.y);
                if (d < cell.radius + npc.radius) {
                  if (cell.radius > npc.radius * 1.03) {
                    // Cell eats NPC (reduced growth)
                    cell.radius += npc.radius * 0.15; // Reduced from 0.3
                    player.score += Math.floor(npc.radius * 10);
                    delete gameState.npcs[npc.id];
                    const newNpc = createNPC();
                    gameState.npcs[newNpc.id] = newNpc;
                  } else if (npc.radius > cell.radius * 1.03) {
                    // NPC eats cell
                    player.cells = player.cells.filter(c => c.id !== cell.id);
                    if (player.cells.length === 0) {
                      socket.emit('eaten', { score: player.score });
                      delete gameState.players[socket.id];
                    }
                  }
                }
              });
            });

            // Auto-merge cells after merge time
            const now = Date.now();
            if (player.cells.length > 1) {
              for (let i = 0; i < player.cells.length; i++) {
                for (let j = i + 1; j < player.cells.length; j++) {
                  const c1 = player.cells[i];
                  const c2 = player.cells[j];
                  if (!c1 || !c2) continue;
                  
                  const d = distance(c1.x, c1.y, c2.x, c2.y);
                  const canMerge = now > c1.mergeTime && now > c2.mergeTime;
                  
                  if (canMerge && d < c1.radius + c2.radius - 5) {
                    // Merge cells
                    const newRadius = Math.sqrt(c1.radius * c1.radius + c2.radius * c2.radius);
                    c1.radius = newRadius;
                    c1.x = (c1.x + c2.x) / 2;
                    c1.y = (c1.y + c2.y) / 2;
                    player.cells.splice(j, 1);
                    j--;
                  }
                }
              }
            }

            // Update main player stats
            updatePlayerMainStats(player);
          } else {
            // Fallback for old player format
            const speed = 5 / (player.radius / 15);
            const dx = data.x - player.x;
            const dy = data.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > speed) {
              player.x += (dx / dist) * speed;
              player.y += (dy / dist) * speed;
            }

            player.x = Math.max(player.radius, Math.min(gameState.worldSize - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(gameState.worldSize - player.radius, player.y));
          }
        });

        // Split handler
        socket.on('split', () => {
          const player = gameState.players[socket.id];
          if (!player || !player.cells || player.cells.length === 0) return;
          if (player.cells.length >= 8) return; // Max 8 cells

          // Find largest cell that can split
          let largestCell = null;
          let largestIdx = -1;
          player.cells.forEach((cell, idx) => {
            if (cell.radius >= 20) {
              if (!largestCell || cell.radius > largestCell.radius) {
                largestCell = cell;
                largestIdx = idx;
              }
            }
          });

          if (!largestCell) return;

          // Calculate split direction towards mouse
          const dx = player.targetX ? player.targetX - largestCell.x : 1;
          const dy = player.targetY ? player.targetY - largestCell.y : 0;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const dirX = dx / dist;
          const dirY = dy / dist;

          // Split the cell
          const newRadius = largestCell.radius / Math.sqrt(2);
          largestCell.radius = newRadius;

          const splitDistance = newRadius * 4;
          const newCell = {
            id: socket.id + '_' + Date.now(),
            x: largestCell.x + dirX * splitDistance,
            y: largestCell.y + dirY * splitDistance,
            radius: newRadius,
            mergeTime: Date.now() + 15000, // 15 seconds to merge
            velocityX: dirX * 15,
            velocityY: dirY * 15,
          };

          // Keep within bounds
          newCell.x = Math.max(newCell.radius, Math.min(gameState.worldSize - newCell.radius, newCell.x));
          newCell.y = Math.max(newCell.radius, Math.min(gameState.worldSize - newCell.radius, newCell.y));

          player.cells.push(newCell);

          // Update player main position and radius
          updatePlayerMainStats(player);
          console.log(`Player ${player.name} split! Now has ${player.cells.length} cells`);
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
          delete gameState.players[socket.id];
        });
      });

      // Helper to update player main stats from cells
      function updatePlayerMainStats(player) {
        if (!player.cells || player.cells.length === 0) return;
        
        let totalRadius = 0;
        let largestCell = player.cells[0];
        
        player.cells.forEach(cell => {
          totalRadius += cell.radius * cell.radius;
          if (cell.radius > largestCell.radius) {
            largestCell = cell;
          }
        });
        
        player.radius = Math.sqrt(totalRadius);
        player.x = largestCell.x;
        player.y = largestCell.y;
      }

      // Game loop
      setInterval(() => {
        Object.values(gameState.npcs).forEach(updateNPC);
        
        // Maintain food count
        while (gameState.foods.length < gameState.maxFood) {
          spawnFood();
        }

        // Broadcast state
        io.emit('gameState', {
          players: gameState.players,
          npcs: gameState.npcs,
          foods: gameState.foods,
        });
      }, 33);

      // Start server with auto port selection
      const tryPort = (port) => {
        httpServer.listen(port, () => {
          console.log(`Server running on http://localhost:${port}`);
          resolve(port);
        }).on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} busy, trying ${port + 1}...`);
            tryPort(port + 1);
          } else {
            reject(err);
          }
        });
      };
      tryPort(3000);

    } catch (error) {
      reject(error);
    }
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: 'Micro.io - Bakteri vs Bakteri',
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the game
  mainWindow.loadURL('http://localhost:3000');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle fullscreen toggle with F11
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  console.log('Starting Micro.io...');
  
  // Start the server first, then create window
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error('Failed to start server:', error);
    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app quit - close server
app.on('before-quit', () => {
  console.log('Shutting down Micro.io...');
  if (httpServer) {
    httpServer.close();
  }
});
