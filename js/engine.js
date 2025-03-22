class GameEngine {
    constructor() {
        // Initialize properties
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Could not get canvas context');
        }

        // Initialize core properties
        this.currentScene = 'policeStation';
        this.isRunning = false;
        this.initialized = false;
        this.spriteCache = new Map();
        this.colorCache = new Map();
        this.ambientAnimations = {
            coffeeSteam: { active: false, x: 0, y: 0 },
            typingNPC: { active: false, x: 0, y: 0 }
        };
        
        // Enable debug mode during development (set to false for production)
        this.debugMode = false;
        
        // Game state persistence
        this.savedGames = {};
        this.currentSaveSlot = 'autosave';
        this.autoSaveInterval = 60000; // Autosave every minute
        this.lastAutoSave = Date.now();
        
        // Initialize npcs with an empty object to prevent undefined errors
        this.npcs = {};
        this.roomBoundaries = {};
        this.collisionObjects = [];

        // Initialize color palette immediately to avoid null references
        this.colors = {
            black: '#000000',
            blue: '#0000AA',
            green: '#00AA00',
            cyan: '#00AAAA',
            red: '#AA0000',
            magenta: '#AA00AA',
            brown: '#AA5500',
            lightGray: '#AAAAAA',
            darkGray: '#555555',
            brightBlue: '#5555FF',
            brightGreen: '#55FF55',
            brightCyan: '#55FFFF',
            brightRed: '#FF5555',
            brightMagenta: '#FF55FF',
            yellow: '#FFFF55',
            white: '#FFFFFF',
            skin: '#FFD8B1',
            darkBlue: '#000066'
        };
        
        // Set floor level constraints
        this.floorLevel = {
            min: 300,
            max: 450
        };
        
        // Initialize game state
        this.playerPosition = { x: 400, y: this.floorLevel.min + 50 };
        this.playerFacing = 'down';
        this.playerWalkCycle = 0;
        this.isWalking = false;
        this.walkTarget = null;
        
        // Animation frame counter
        this.animationFrame = 0;
        
        // FPS tracking
        this.fpsValues = [];
        this.currentFPS = 60;
        this.lastFpsUpdate = 0;
        
        // Performance optimization
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameDuration = 1000 / this.targetFPS;
        this.accumulatedTime = 0;
        
        // Minimap settings
        this.showMinimap = false;
        this.minimapSize = 150;
        this.minimapPosition = { x: 20, y: 20 };
        
        // Initialize immediately if document is ready
        if (document.readyState === 'complete') {
            this.init();
        } else {
            window.addEventListener('DOMContentLoaded', () => this.init());
        }
        
        // Set up keyboard shortcuts for commands
        this.setupCommandShortcuts();
    }

    init() {
        try {
            if (this.initialized) return;
            console.log('Initializing game engine...');
            
            // Setup core components
            this.setupCanvas();
            this.setupBufferCanvas();
            this.colors = this.setupColorPalette();
            this.setupEventListeners();
            
            // Set initial game state
            this.keyboardEnabled = true;
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.accumulator = 0;
            this.frameInterval = 1000 / 60;
            
            this.initialized = true;
            console.log('Game engine initialized successfully');
            
            // Load initial scene and start game loop
            this.loadScene(this.currentScene);
            this.startGameLoop();
            
            // Dispatch initialization event
            document.dispatchEvent(new Event('gameEngineInitialized'));
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
            throw error;
        }
    }

    setupCanvas() {
        console.log("Setting up canvas");
        // Use device pixel ratio for better rendering on high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 800 * dpr;
        this.canvas.height = 600 * dpr;  // Changed from 450 to 600 to match HTML
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.width = '800px';
        this.canvas.style.height = '600px';  // Changed from 450 to 600 to match HTML
    }

    setupBufferCanvas() {
        console.log("Setting up buffer canvas");
        // Setup buffer canvas
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.canvas.width;
        this.bufferCanvas.height = this.canvas.height;
        this.bufferCtx = this.bufferCanvas.getContext('2d', { alpha: false });
        
        // Setup back buffer
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = this.canvas.width;
        this.backBuffer.height = this.canvas.height;
        this.backContext = this.backBuffer.getContext('2d', { alpha: false });
        
        // Setup offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false });
    }

    setupColorPalette() {
        // 16-color palette for consistent use across the app
        return {
            black: '#000000',
            blue: '#0000AA',
            green: '#00AA00',
            cyan: '#00AAAA',
            red: '#AA0000',
            magenta: '#AA00AA',
            brown: '#AA5500',
            lightGray: '#AAAAAA',
            darkGray: '#555555',
            brightBlue: '#5555FF',
            brightGreen: '#55FF55',
            brightCyan: '#55FFFF',
            brightRed: '#FF5555',
            brightMagenta: '#FF55FF',
            yellow: '#FFFF55',
            white: '#FFFFFF',
            skin: '#FFD8B1',
            darkBlue: '#000066'
        };
    }

    clear() {
        // Clear all canvas contexts
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        this.backContext.clearRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    startGameLoop() {
        console.log("Starting game loop");
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.accumulator = 0;
        this.frameInterval = 1000 / 60; // Target 60 FPS
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time and maintain consistent frame rate
        const deltaTime = timestamp - this.lastFrameTime;
        this.accumulatedTime += deltaTime;
        
        // Update animation frame counter
        this.animationFrame++;
        
        // Track FPS
        this.updateFPS(deltaTime);
        
        // Process as many updates as needed based on accumulated time
        let updatesCount = 0;
        while (this.accumulatedTime >= this.frameDuration && updatesCount < 5) {
            // Update game state with proper delta time
            this.update(this.frameDuration / 1000);
            this.accumulatedTime -= this.frameDuration;
            updatesCount++;
            
            // Check for autosave
            this.checkAutosave();
        }

        // Render to offscreen canvas
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCurrentScene();
        
        // Draw minimap if enabled
        if (this.showMinimap) {
            this.drawMinimap();
        }
        
        // Draw debug info if enabled
        if (this.debugMode) {
            this.drawDebugInfo(this.offscreenCtx);
        }

        // Swap buffers
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);

        this.lastFrameTime = timestamp;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    stopGameLoop() {
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
        }
        this.isRunning = false;
    }

    addAnimation = (id, frames, duration) => {
        this.animations.set(id, {
            frames,
            duration,
            currentFrame: 0,
            elapsed: 0
        });
    };

    updateAnimations = (deltaTime) => {
        for (const [id, anim] of this.animations) {
            anim.elapsed += deltaTime;
            if (anim.elapsed >= anim.duration) {
                anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
                anim.elapsed = 0;
            }
        }
    };

    update = (deltaTime = 1/60) => {
        // Handle player walking animation and movement
        if (this.isWalking && this.walkTarget) {
            // Calculate direction and distance
            const dx = this.walkTarget.x - this.playerPosition.x;
            const dy = this.walkTarget.y - this.playerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If we've reached the target (or close enough), stop walking
            if (distance < 5) {
                this.isWalking = false;
                this.walkTarget = null;
                // Check if we reached a hotspot
                const hitObject = this.checkCollision(this.playerPosition.x, this.playerPosition.y);
                if (hitObject) {
                    this.processInteraction(hitObject);
                }
            } else {
                // Move player towards target - INCREASED SPEED from 3 to 5
                const speed = 5; // pixels per frame - faster player movement
                const moveX = (dx / distance) * speed;
                const moveY = (dy / distance) * speed;
                this.playerPosition.x += moveX;
                this.playerPosition.y += moveY;
                
                // Update player facing based on movement direction
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.playerFacing = dx > 0 ? 'right' : 'left';
                } else {
                    this.playerFacing = dy > 0 ? 'down' : 'up';
                }
            }
        }
        
        // Update NPCs for the current scene
        this.updateNPCs(deltaTime);
    };
    
    updateNPCs = (deltaTime = 1/60) => {
        const currentSceneNPCs = this.npcs[this.currentScene];
        if (!currentSceneNPCs) return;

        currentSceneNPCs.forEach(npc => {
            // Special handling for receptionist - COMPLETE REWRITE TO KEEP HER AT DESK
            if (npc.isReceptionist && npc.stayAtDesk) {
                // Keep Jenny at the chair position
                npc.x = 515; // Force position to match chair position at the desk side
                npc.y = this.floorLevel.min + 75; // Force height to appear seated
                npc.facing = 'left'; // Always face the computer
                npc.isWalking = false;
                
                // Typing animation position adjustment
                this.ambientAnimations.typingNPC.x = npc.x - 30;
                this.ambientAnimations.typingNPC.y = npc.y - 15;
                this.ambientAnimations.typingNPC.active = true;
                
                return;
            }

            // Normal NPC behavior for everyone else
            if (npc.conversationTime > 0) {
                npc.conversationTime -= deltaTime;
                npc.isWalking = false;
                return;
            }

            if (npc.waitTime > 0) {
                npc.waitTime -= deltaTime;
                npc.isWalking = false;
                return;
            }

            const target = npc.patrolPoints[npc.currentPatrolPoint];
            if (!target) return;
            
            const dx = target.x - npc.x;
            const dy = target.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) {
                // Use custom wait times if available, otherwise use random
                if (npc.waitTimes && npc.waitTimes[npc.currentPatrolPoint]) {
                    npc.waitTime = npc.waitTimes[npc.currentPatrolPoint];
                } else {
                    npc.waitTime = 1 + Math.random() * 3;
                }
                
                npc.currentPatrolPoint = (npc.currentPatrolPoint + 1) % npc.patrolPoints.length;
                npc.isWalking = false;
                
                // Check if we should start a random conversation (30% chance)
                if (Math.random() > 0.7) {
                    npc.conversationTime = 2 + Math.random() * 3; // 2-5 seconds conversation
                    npc.dialogue = this.getRandomDialogue(npc.type);
                }
            } else {
                // Move towards target
                const speed = 0.7; // pixels per frame - slower NPC movement
                npc.x += (dx / distance) * speed;
                npc.y += (dy / distance) * speed;
                npc.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
                npc.isWalking = true;
            }

            npc.y = Math.max(this.floorLevel.min + 50, Math.min(npc.y, this.floorLevel.max));
            
            // Check for NPC conversations - if NPCs are close to each other, they might start talking
            this.checkNPCConversations(npc, currentSceneNPCs);
        });
    };

    render = (interpolation) => {
        // Clear back buffer
        this.backContext.clearRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        
        // Draw game state to back buffer
        this.drawCurrentScene();
        
        // Draw debug info if enabled
        if (this.debugMode) {
            this.drawDebugInfo(this.backContext);
        }
        
        // Flip buffers
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.backBuffer, 0, 0);
    };

    drawDebugInfo = (ctx) => {
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.currentFPS}`, 10, 20);
        ctx.fillText(`Objects: ${this.game.gameObjects.length}`, 10, 40);
        ctx.fillText(`Draw calls: ${this.drawCallCount}`, 10, 60);
    };

    drawCurrentScene = () => {
        try {
            const ctx = this.offscreenCtx || this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw the current scene background
            switch(this.currentScene) {
                case 'policeStation':
                    this.drawPoliceStation(ctx);
                    break;
                case 'downtown':
                    this.drawDowntown(ctx);
                    break;
                case 'park':
                    this.drawPark(ctx);
                    break;
                case 'sheriffsOffice':
                    this.drawSheriffsOffice(ctx);
                    break;
                case 'briefingRoom':
                    this.drawBriefingRoom(ctx);
                    break;
                case 'officeArea':
                    this.drawOfficeArea(ctx);
                    break;
                default:
                    console.warn('Unknown scene:', this.currentScene);
                    return;
            }
            
            // Draw ambient animations
            this.drawAmbientAnimations();
            
            // Get sitting officer (if any)
            let sittingOfficer = null;
            if (this.npcs && this.npcs[this.currentScene]) {
                sittingOfficer = this.npcs[this.currentScene].find(npc => 
                    npc.isReceptionist && npc.isWorking && !npc.isWalking);
            }
            
            // Draw chair for receptionist desk - POSITIONED TO THE SIDE OF THE DESK
            if (this.currentScene === 'policeStation') {
                this.drawOfficeChair(515, this.floorLevel.min + 80, 'left', ctx);
            }
            
            // Draw NPCs in the correct Z-order
            if (this.npcs && this.npcs[this.currentScene]) {
                // Sort NPCs by Y position for proper depth
                const sortedNPCs = [...this.npcs[this.currentScene]].sort((a, b) => a.y - b.y);
                
                sortedNPCs.forEach(npc => {
                    if (!npc || npc === sittingOfficer) return; // Skip sitting officer for now
                    
                    const yPosition = Math.max(this.floorLevel.min + 50, Math.min(npc.y, this.floorLevel.max));
                    
                    // Draw NPC
                    this.drawPixelCharacter(
                        npc.x, 
                        yPosition,
                        npc.type === 'sergeant' ? this.colors.brightBlue : this.colors.blue,
                        this.colors.yellow,
                        npc.facing || 'down',
                        npc.isWalking,
                        true,
                        npc.isFemale || npc.isReceptionist
                    );

                    // Draw conversation bubble
                    if (npc.conversationTime > 0 && npc.dialogue) {
                        this.drawConversationBubble(npc.x, yPosition - 50, npc.dialogue, ctx);
                    }
                });
            }
            
            // Now draw the desk for the police station (after chair, before sitting officer)
            if (this.currentScene === 'policeStation') {
                // Draw the desk - ADJUSTED POSITION to allow for chair on side
                this.draw3DDesk(400, this.floorLevel.min + 40, 150, 70, ctx);
                
                // Draw desk items
                this.drawDeskItems(400, this.floorLevel.min + 40, 150, 70, ctx);
                
                // Now draw the sitting receptionist if present - POSITIONED AT CHAIR
                if (sittingOfficer) {
                    // Make sure officer appears to be sitting at the chair on the side of desk
                    const sittingX = 515; // Matching chair position
                    const sittingY = this.floorLevel.min + 75; // Positioned to look like sitting in chair
                    
                    // Draw the sitting officer
                    this.drawPixelCharacter(
                        sittingX,
                        sittingY,
                        this.colors.blue,
                        this.colors.yellow,
                        'left', // Always facing left when at desk (facing the computer)
                        false, // Not walking when at desk
                        true,
                        true // Female
                    );
                    
                    // Draw typing animation or dialogue bubble
                    if (sittingOfficer.conversationTime > 0 && sittingOfficer.dialogue) {
                        this.drawConversationBubble(sittingX, sittingY - 50, sittingOfficer.dialogue, ctx);
                    }
                }
            }

            // Draw player last (on top)
            this.drawPixelCharacter(
                this.playerPosition.x, 
                this.playerPosition.y, 
                this.colors.blue, 
                this.colors.yellow, 
                this.playerFacing,
                this.isWalking
            );
            
            // Flip buffers if needed
            if (ctx !== this.ctx && this.offscreenCtx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.offscreenCanvas, 0, 0);
            }
        } catch (error) {
            console.error("Error drawing scene:", error);
        }
    };

    setupEventListeners = () => {
        // Command buttons
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cmd-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeCommand = btn.dataset.action;
                soundManager.playSound('click');
                this.updateCursor();
            });
        });

        // Canvas click with throttling
        let lastClickTime = 0;
        this.canvas.addEventListener('click', (e) => {
            // Throttle clicks to prevent double-clicks or spam
            const now = Date.now();
            if (now - lastClickTime < 300) return; // 300ms debounce
            lastClickTime = now;

            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width / (window.devicePixelRatio || 1));
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height / (window.devicePixelRatio || 1));
            
            // First check for door interactions
            const doors = this.collisionObjects.filter(obj => obj.type === 'door');
            for (const door of doors) {
                if (x >= door.x && x <= door.x + door.width &&
                    y >= door.y && y <= door.y + door.height) {
                    if (this.activeCommand === 'use') {
                        this.processInteraction(door);
                        return;
                    }
                }
            }
            
            // Otherwise handle movement or other interactions
            this.handleInteraction(x, y);
        });

        // Keyboard navigation
        let keyLastPressed = 0;
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardEnabled) return;
            
            // Throttle key presses
            const now = Date.now();
            if (now - keyLastPressed < 200) return; // 200ms debounce
            keyLastPressed = now;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.handleMovement('up');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                    this.handleMovement('down');
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.handleMovement('left');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                    this.handleMovement('right');
                    e.preventDefault();
                    break;
            }
        });

        // Improved mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - (rect.top) * (this.canvas.height / rect.height));
            
            // Change cursor if hovering over interactive element
            if (this.checkCollision(x, y)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.updateCursor(); // Use action-specific cursor
            }
        });
    };

    updateCursor = () => {
        const cursorStyle = this.activeCommand ? 'pointer' : 'default';
        this.canvas.style.cursor = cursorStyle;
    };

    handleInteraction = (x, y) => {
        if (this.activeCommand === 'move') {
            // Move character to clicked location
            const rect = this.canvas.getBoundingClientRect();
            const targetX = (x - rect.left) * (this.canvas.width / rect.width);
            const targetY = (y - rect.top) * (this.canvas.height / rect.height);
            
            // Ensure target is within walkable area
            if (targetY >= 300 && targetY <= this.floorLevel) {
                this.walkTarget = { x: targetX, y: targetY };
                this.isWalking = true;
            }
            return;
        }

        // Check for clickable objects
        const clickedObject = this.checkCollision(x, y);
        if (clickedObject) {
            this.processInteraction(clickedObject);
        }
    };

    handleMovement = (direction) => {
        const moveSpeed = 5;
        const oldX = this.playerPosition.x;
        const oldY = this.playerPosition.y;

        this.playerFacing = direction;
        this.isWalking = true;
        this.playerWalkCycle = (this.playerWalkCycle + 1) % 4;

        switch(direction) {
            case 'up':
                this.playerPosition.y -= moveSpeed;
                break;
            case 'down':
                this.playerPosition.y += moveSpeed;
                break;
            case 'left':
                this.playerPosition.x -= moveSpeed;
                break;
            case 'right':
                this.playerPosition.x += moveSpeed;
                break;
        }

        // Check all collisions
        const collision = this.checkCollision(this.playerPosition.x, this.playerPosition.y);
        if (collision) {
            if (collision.type === 'desk' || collision.type === 'wall') {
                // Revert movement if colliding with desk or wall
                this.playerPosition.x = oldX;
                this.playerPosition.y = oldY;
                return;
            } else if (collision.type === 'door' && this.activeCommand === 'use') {
                // Handle door transitions
                this.currentScene = collision.target;
                this.loadScene(collision.target);
                return;
            }
        }

        this.drawCurrentScene();
        
        setTimeout(() => {
            this.isWalking = false;
            this.drawCurrentScene();
        }, 100);
    };

    drawPoliceStation = (ctx) => {
        ctx = ctx || this.ctx; // Use provided context or default to main context
        
        // Use the stored color palette for consistency
        const colors = this.colors;
        
        // MAKE FLOOR SPACE BIGGER AND WALL SPACE LESS
        // Adjust floor level to begin higher up on the screen
        const floorY = 250; // Increased from original 300
        
        // Floor - set to standard height with more floor space
        ctx.fillStyle = colors.lightGray;
        ctx.fillRect(0, floorY, this.canvas.width, this.canvas.height - floorY);
        
        // Draw floor grid for perspective
        this.drawFloorGrid(0, floorY, this.canvas.width, this.canvas.height - floorY);
        
        // Draw walls (slight perspective) - shorter wall height
        ctx.fillStyle = colors.white;
        this.draw3DWall(0, 0, this.canvas.width, floorY - 10, colors.white, ctx);
        
        // Wall skirting board
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(0, floorY - 10, this.canvas.width, 10);
        
        // Single window (positioned at a more realistic height - lower on wall)
        // Window frame
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(320, 80, 160, 100);
            
        // Window glass
        ctx.fillStyle = '#B0E0FF';
        ctx.fillRect(325, 85, 150, 90);
            
        // Window frame dividers
        ctx.strokeStyle = '#A0A0A0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(400, 85);
        ctx.lineTo(400, 175);
        ctx.stroke();
            
        ctx.beginPath();
        ctx.moveTo(325, 130);
        ctx.lineTo(475, 130);
        ctx.stroke();

        // Add more realistic view through window WITH TREE
        this.drawWindowViewWithTree(325, 85, 150, 90, ctx);
        
        // MOVED bulletin board away from doors to empty wall space
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(500, 100, 120, 80);
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(505, 105, 110, 70);
        
        // Add notices to bulletin board
        this.drawBulletinNotices(505, 105, 110, 70, ctx);
        
        // Draw door to sheriff's office
        this.drawDoorWithFrame(700, floorY - 120, 'right', "Sheriff's Office", ctx);
        
        // Door to office area
        this.drawDoorWithFrame(100, floorY - 120, 'left', "Office Area", ctx);
        
        // Add exit to downtown
        this.drawExitDoor(400, this.canvas.height - 30, "Exit to Downtown", ctx);
        
        // Add exit sign
        this.addExitSign(400, this.canvas.height - 60, "Downtown", ctx);
        
        // Add wall decorations
        this.drawWallDecorations(ctx);
        
        // Set up ambient animations for the scene
        this.setupAmbientAnimations('policeStation');
        
        // Update collision objects for this scene
        this.updateCollisionObjects();
    };

    // New method to draw window view with a tree
    drawWindowViewWithTree = (x, y, width, height, ctx) => {
        ctx = ctx || this.ctx;
        
        // Sky background
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(x, y, width, height);
        
        // Draw buildings in distance
        ctx.fillStyle = '#555555';
        for (let i = 0; i < 4; i++) {
            const buildingHeight = 20 + Math.sin(i + this.animationFrame * 0.1) * 5;
            ctx.fillRect(x + 5 + i * 25, y + height * 0.7 - buildingHeight, 15, buildingHeight);
        }
        
        // Add tree in foreground
        // Tree trunk
        ctx.fillStyle = '#8B4513'; // Brown trunk
        ctx.fillRect(x + width/2 - 7, y + height*0.5, 14, height*0.5);
        
        // Tree leaves/foliage (three levels for more detail)
        ctx.fillStyle = '#228B22'; // Forest green
        // Bottom foliage - widest
        ctx.beginPath();
        ctx.moveTo(x + width/2, y + height*0.5);
        ctx.lineTo(x + width/2 - 35, y + height*0.65);
        ctx.lineTo(x + width/2 + 35, y + height*0.65);
        ctx.closePath();
        ctx.fill();
        
        // Middle foliage
        ctx.beginPath();
        ctx.moveTo(x + width/2, y + height*0.3);
        ctx.lineTo(x + width/2 - 30, y + height*0.5);
        ctx.lineTo(x + width/2 + 30, y + height*0.5);
        ctx.closePath();
        ctx.fill();
        
        // Top foliage
        ctx.beginPath();
        ctx.moveTo(x + width/2, y + height*0.1);
        ctx.lineTo(x + width/2 - 25, y + height*0.35);
        ctx.lineTo(x + width/2 + 25, y + height*0.35);
        ctx.closePath();
        ctx.fill();
        
        // Animate clouds
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 20 + (this.animationFrame % 150), y + 30, 10, 0, Math.PI * 2);
        ctx.arc(x + 35 + (this.animationFrame % 150), y + 25, 12, 0, Math.PI * 2);
        ctx.arc(x + 50 + (this.animationFrame % 150), y + 30, 10, 0, Math.PI * 2);
        ctx.fill();
    };

    drawOfficeArea = (ctx) => {
        const colors = this.colors;
        ctx = ctx || this.ctx; // Use provided context or default to main context
        
        // Draw walls and floor
        this.drawFloorGrid(0, 300, this.canvas.width, 150);
        this.draw3DWall(0, 0, this.canvas.width, 300, colors.blue, ctx);
        
        // Floor
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 300, this.canvas.width, 150);
        
        // Wall details
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(0, 290, this.canvas.width, 10);
        
        // Multiple desks for detectives
        for (let i = 0; i < 4; i++) {
            this.draw3DDesk(100 + i * 150, 320, 120, 70, ctx);
            
            // Add computers, papers, etc on desks
            ctx.fillStyle = colors.darkGray;
            ctx.fillRect(120 + i * 150, 310, 40, 30);
            ctx.fillStyle = colors.white;
            ctx.fillRect(180 + i * 150, 315, 20, 25);
        }
        
        // Filing cabinets along the wall
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = colors.lightGray;
            ctx.fillRect(50 + i * 100, 100, 80, 150);
            
            for (let j = 0; j < 3; j++) {
                ctx.fillStyle = colors.darkGray;
                ctx.fillRect(60 + i * 100, 110 + j * 45, 60, 5);
            }
        }
        
        // Exit door
        this.drawDoorWithFrame(400, 200, 'right', "Main Lobby", ctx);
        
        // Coffee machine in corner
        ctx.fillStyle = colors.black;
        ctx.fillRect(700, 230, 50, 70);
        ctx.fillStyle = colors.red;
        ctx.fillRect(715, 250, 20, 10);
        ctx.fillStyle = colors.brightBlue;
        ctx.fillRect(710, 270, 30, 10);
        
        // Update collision objects
        this.updateCollisionObjects();
    };

    drawDowntown = (ctx) => {
        ctx = ctx || this.ctx; // Use provided context or default to main context
        
        // Use the stored color palette for consistency
        const colors = this.colors;
        
        // Sky
        ctx.fillStyle = colors.blue;
        ctx.fillRect(0, 0, this.canvas.width, 150);

        // Street
        ctx.fillStyle = colors.darkGray;
        ctx.fillRect(0, 300, this.canvas.width, 150);

        // Sidewalk
        ctx.fillStyle = colors.lightGray;
        ctx.fillRect(0, 280, this.canvas.width, 20);

        // Buildings
        for (let i = 0; i < 3; i++) {
            // Building body
            ctx.fillStyle = i % 2 === 0 ? colors.brown : colors.red;
            ctx.fillRect(i * 250, 100, 200, 180);
            
            // Windows
            ctx.fillStyle = colors.brightCyan;
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 2; k++) {
                    ctx.fillRect(i * 250 + 30 + j * 60, 120 + k * 60, 40, 40);
                }
            }
            
            // Door
            ctx.fillStyle = colors.darkGray;
            ctx.fillRect(i * 250 + 80, 220, 40, 60);
        }

        // Alley
        ctx.fillStyle = colors.black;
        ctx.fillRect(200, 100, 50, 180);

        // Police officer (pixel style)
        this.drawPixelCharacter(150, 350, colors.blue, colors.yellow);

        // Crime scene (for investigation)
        ctx.fillStyle = colors.yellow;
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(400 + i * 20, 290, 10, 5);
        }
        
        // Return to station sign
        ctx.fillStyle = colors.red;
        ctx.fillRect(350, 430, 100, 20);
        ctx.fillStyle = colors.white;
        ctx.fillText('TO PARK', 370, 445);
        
        // Arrow indicators for keyboard navigation
        this.drawArrowIndicator('up', 'Station');
        this.drawArrowIndicator('right', 'Park');
        this.drawArrowIndicator('left', 'Station');
        this.drawArrowIndicator('down', 'Park');
    };

    drawPark = (ctx) => {
        ctx = ctx || this.ctx; // Use provided context or default to main context
        
        // Use the stored color palette for consistency
        const colors = this.colors;
        
        // Sky
        ctx.fillStyle = colors.brightBlue;
        ctx.fillRect(0, 0, this.canvas.width, 300);

        // Grass
        ctx.fillStyle = colors.green;
        ctx.fillRect(0, 300, this.canvas.width, 150);

        // Pathway
        ctx.fillStyle = colors.brown;
        ctx.fillRect(100, 300, 600, 40);

        // Trees
        for (let i = 0; i < 3; i++) {
            // Tree trunk
            ctx.fillStyle = colors.brown;
            ctx.fillRect(50 + i * 250, 200, 30, 100);
            
            // Tree leaves
            ctx.fillStyle = colors.brightGreen;
            ctx.fillRect(20 + i * 250, 150, 90, 60);
        }

        // Benches
        ctx.fillStyle = colors.brown;
        ctx.fillRect(150, 320, 80, 10);
        ctx.fillRect(150, 330, 10, 20);
        ctx.fillRect(220, 330, 10, 20);
        
        ctx.fillRect(500, 320, 80, 10);
        ctx.fillRect(500, 330, 10, 20);
        ctx.fillRect(570, 330, 10, 20);

        // Fountain
        ctx.fillStyle = colors.darkGray;
        ctx.fillRect(350, 200, 100, 100);
        ctx.fillStyle = colors.brightCyan;
        ctx.fillRect(360, 210, 80, 80);

        // Police officer (pixel style)
        this.drawPixelCharacter(400, 350, colors.blue, colors.yellow);
        
        // Return sign
        ctx.fillStyle = colors.red;
        ctx.fillRect(350, 430, 100, 20);
        ctx.fillStyle = colors.white;
        ctx.fillText('TO STATION', 355, 445);
        
        // Arrow indicators for keyboard navigation
        this.drawArrowIndicator('up', 'Downtown');
        this.drawArrowIndicator('left', 'Downtown');
    };

    getCharacterSprite = (uniformColor, badgeColor, facing, isWalking, isNPC, isFemale) => {
        const key = `${uniformColor}_${badgeColor}_${facing}_${isWalking}_${isNPC}_${isFemale}`;
        if (!this.spriteCache.has(key)) {
            const spriteCanvas = document.createElement('canvas');
            spriteCanvas.width = 32;
            spriteCanvas.height = 48;
            const spriteCtx = spriteCanvas.getContext('2d');
            this.drawPixelCharacterToContext(spriteCtx, 16, 48, uniformColor, badgeColor, facing, isWalking, isNPC, isFemale);
            this.spriteCache.set(key, spriteCanvas);
        }
        return this.spriteCache.get(key);
    };

    drawPixelCharacterToContext = (ctx, x, y, uniformColor, badgeColor, facing = 'down', isWalking = false, isNPC = false, isFemale = false) => {
        const pixels = 4;
        const drawPixel = (px, py, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(
                Math.floor(x + px * pixels), 
                Math.floor(y + py * pixels), 
                pixels, 
                pixels
            );
        };

        // Removed shadow drawing code

        let xOffset = -16;
        let yOffset = -48;

        // Police hat
        const hatPixels = [
            [0,0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1]
        ];
        
        hatPixels.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset - 2, '#000033'); // Dark blue hat
                }
            });
        });
        
        // Hat badge
        drawPixel(xOffset + 3, yOffset - 2, '#FFD700'); // Gold badge

        // Head with gender-specific hairstyle
        if (facing === 'left' || facing === 'right') {
            // Profile view head
            const headPixels = [
                [0,0,1,1,1,0],
                [0,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [0,1,1,1,1,0]
            ];
            
            if (isFemale) {
                // Add hair for female characters
                const hairPixels = [
                    [0,1,1,1,0,0],
                    [1,1,1,1,1,0]
                ];
                hairPixels.forEach((row, py) => {
                    row.forEach((pixel, px) => {
                        if (pixel) {
                            const finalPx = facing === 'left' ? px : row.length - 1 - px;
                            drawPixel(finalPx + xOffset - 1, py + yOffset, '#663300'); // Brown hair
                        }
                    });
                });
            }
            
            headPixels.forEach((row, py) => {
                row.forEach((pixel, px) => {
                    if (pixel) {
                        const finalPx = facing === 'left' ? px : row.length - 1 - px;
                        drawPixel(finalPx + xOffset, py + yOffset, '#FFD8B1');
                    }
                });
            });
        } else {
            // Front/back view head
            const headPixels = [
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0]
            ];
            
            if (isFemale) {
                // Add hair for female characters
                const hairPixels = [
                    [0,1,1,1,1,1,1,0],
                    [1,1,1,1,1,1,1,1]
                ];
                hairPixels.forEach((row, py) => {
                    row.forEach((pixel, px) => {
                        if (pixel) {
                            drawPixel(px + xOffset, py + yOffset - 1, '#663300');
                        }
                    });
                });
            }
            
            headPixels.forEach((row, py) => {
                row.forEach((pixel, px) => {
                    if (pixel) drawPixel(px + xOffset, py + yOffset, '#FFD8B1');
                });
            });
        }

        // Body
        const bodyPixels = [
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0]
        ];

        bodyPixels.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset + 6, uniformColor);
                    if (py === 1 && px === 2) {
                        drawPixel(px + xOffset, py + yOffset + 6, badgeColor);
                    }
                }
            });
        });

        // Legs (walking animation)
        const walkCycle = isNPC ? this.animationFrame % 4 : this.playerWalkCycle % 4;
        const legFrame = isWalking ? walkCycle : 0;
        const legFrames = [
            [ // Frame 0 - Standing
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0]
            ],
            [ // Frame 1 - Walking
                [0,0,1,1,0,0,1,1],
                [0,1,1,0,0,0,1,0],
                [1,1,0,0,0,0,0,0]
            ],
            [ // Frame 2 - Standing
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0]
            ],
            [ // Frame 3 - Walking opposite
                [1,1,0,0,1,1,0,0],
                [0,1,0,0,0,1,1,0],
                [0,0,0,0,0,0,1,1]
            ]
        ];

        legFrames[legFrame].forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset + 11, '#000033');
                }
            });
        });

        // Face details
        if (facing === 'down' || facing === facing) {
            drawPixel(xOffset + 2, yOffset + 3, '#000000'); // Left eye
            drawPixel(xOffset + 5, yOffset + 3, '#000000'); // Right eye
            drawPixel(xOffset + 3, yOffset + 4, '#000000'); // Mouth
            drawPixel(xOffset + 4, yOffset + 4, '#000000');
        } else if (facing === 'left') {
            drawPixel(xOffset + 2, yOffset + 3, '#000000'); // Left eye
            drawPixel(xOffset + 2, yOffset + 4, '#000000'); // Mouth
        } else if (facing === 'right') {
            drawPixel(xOffset + 4, yOffset + 3, '#000000'); // Right eye
            drawPixel(xOffset + 4, yOffset + 4, '#000000'); // Mouth
        }
    };

    drawPixelCharacter = (x, y, bodyColor, badgeColor = '#FFD700', facing = 'down', walking = false, isNPC = false, isFemale = false) => {
        const ctx = this.offscreenCtx || this.ctx;
        const frame = Math.floor(this.animationFrame / 10) % 2;
        const legOffset = walking ? (frame === 0 ? -3 : 3) : 0;
        
        // Make characters 20% larger
        const scale = 1.2;
        
        // Set up shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + 20, 12 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Use natural skin tone instead of yellow
        const skinColor = '#E6B89C';
        
        // Draw police uniform (proper color)
        const uniformColor = isNPC ? '#1A3C78' : '#0A2050'; // Darker blue for police uniforms
        const pantColor = '#1E2C4D'; // Dark blue for pants
        
        // Draw legs
        ctx.fillStyle = pantColor;
        if (facing === 'left' || facing === 'right') {
            ctx.fillRect(x - 5 * scale, y, 4 * scale, 20 * scale); // Left leg
            ctx.fillRect(x + (5 - 4) * scale, y + legOffset, 4 * scale, 20 * scale - legOffset); // Right leg with offset while walking
        } else {
            ctx.fillRect(x - 5 * scale, y + legOffset, 4 * scale, 20 * scale - legOffset); // Left leg with offset while walking
            ctx.fillRect(x + 1 * scale, y, 4 * scale, 20 * scale); // Right leg
        }
        
        // Draw police belt
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 8 * scale, y - 2, 16 * scale, 3);
        
        // Draw body/torso (uniform)
        ctx.fillStyle = uniformColor;
        ctx.fillRect(x - 8 * scale, y - 15 * scale, 16 * scale, 14 * scale); // Torso
        
        // Draw collar (lighter blue)
        ctx.fillStyle = '#3A5C98';
        ctx.fillRect(x - 6 * scale, y - 15 * scale, 12 * scale, 3 * scale);
        
        // Draw police badge ON THE UNIFORM CHEST (fixed position relative to body)
        const badgeColorToUse = badgeColor || '#FFD700';
        ctx.fillStyle = badgeColorToUse;
        
        if (facing === 'left') {
            ctx.fillRect(x - 5 * scale, y - 10 * scale, 4 * scale, 4 * scale); // Badge on left side of chest
        } else if (facing === 'right') {
            ctx.fillRect(x + 1 * scale, y - 10 * scale, 4 * scale, 4 * scale); // Badge on right side of chest
        } else {
            ctx.fillRect(x - 5 * scale, y - 10 * scale, 4 * scale, 4 * scale); // Badge on chest
        }
        
        // Draw arms with uniform color
        ctx.fillStyle = uniformColor;
        if (facing === 'left') {
            ctx.fillRect(x - 10 * scale, y - 15 * scale, 5 * scale, 15 * scale);  // Left arm on left side
        } else if (facing === 'right') {
            ctx.fillRect(x + 5 * scale, y - 15 * scale, 5 * scale, 15 * scale);   // Left arm on right side
        } else {
            ctx.fillRect(x - 12 * scale, y - 12 * scale, 5 * scale, 15 * scale);  // Left arm
            ctx.fillRect(x + 7 * scale, y - 12 * scale, 5 * scale, 15 * scale);   // Right arm
        }

        // Draw hands with skin color
        ctx.fillStyle = skinColor;
        if (facing === 'left') {
            ctx.fillRect(x - 10 * scale, y - 5 * scale, 5 * scale, 5 * scale);  // Left hand
        } else if (facing === 'right') {
            ctx.fillRect(x + 5 * scale, y - 5 * scale, 5 * scale, 5 * scale);   // Right hand
        } else {
            ctx.fillRect(x - 12 * scale, y - 3 * scale, 5 * scale, 6 * scale);  // Left hand
            ctx.fillRect(x + 7 * scale, y - 3 * scale, 5 * scale, 6 * scale);   // Right hand
        }
        
        // Draw head with natural skin tone instead of yellow
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(x, y - 25 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw police hat
        ctx.fillStyle = '#141E33'; // Dark blue hat
        ctx.fillRect(x - 9 * scale, y - 34 * scale, 18 * scale, 6 * scale); // Hat brim
        ctx.fillRect(x - 7 * scale, y - 40 * scale, 14 * scale, 6 * scale); // Hat top
        
        // Hat badge
        ctx.fillStyle = '#FFD700'; // Gold badge
        ctx.fillRect(x - 3 * scale, y - 34 * scale, 6 * scale, 3 * scale);
        
        // Draw hair (different styles based on gender)
        // Using a dark brown for hair color as default instead of badge color for hair
        ctx.fillStyle = '#663300';
        if (isFemale) {
            // Female hair style
            if (facing === 'left' || facing === 'right') {
                // Profile view with hair visible 
                const hairSide = facing === 'left' ? x - 10 * scale : x + 10 * scale;
                ctx.beginPath();
                ctx.arc(x, y - 25 * scale, 10 * scale, Math.PI * 0.3, Math.PI * 1.7, facing === 'right');
                ctx.fill();
                
                // Hair bun or ponytail
                ctx.beginPath();
                ctx.arc(hairSide, y - 28 * scale, 5 * scale, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Front or back view
                ctx.beginPath();
                ctx.arc(x, y - 25 * scale, 10 * scale, Math.PI, Math.PI * 2);
                ctx.fill();
                
                // Add visible hair on sides
                ctx.fillRect(x - 10 * scale, y - 30 * scale, 2 * scale, 12 * scale);
                ctx.fillRect(x + 8 * scale, y - 30 * scale, 2 * scale, 12 * scale);
            }
        } else {
            // Male hair style (short)
            ctx.beginPath();
            ctx.arc(x, y - 30 * scale, 8 * scale, 0, Math.PI);
            ctx.fill();
        }
        
        // Draw face details
        ctx.fillStyle = this.colors.black;
        
        // Different face expressions based on facing direction
        if (facing === 'down') {
            // Eyes
            ctx.fillRect(x - 4 * scale, y - 28 * scale, 2 * scale, 2 * scale);
            ctx.fillRect(x + 2 * scale, y - 28 * scale, 2 * scale, 2 * scale);
            // Mouth
            ctx.fillRect(x - 2 * scale, y - 22 * scale, 4 * scale, 1 * scale);
        } else if (facing === 'up') {
            // Back of head, no face details
        } else if (facing === 'left') {
            // Profile facing left
            ctx.fillRect(x - 4 * scale, y - 28 * scale, 2 * scale, 2 * scale); // One eye
            ctx.fillRect(x - 6 * scale, y - 22 * scale, 3 * scale, 1 * scale); // Mouth
        } else if (facing === 'right') {
            // Profile facing right
            ctx.fillRect(x + 2 * scale, y - 28 * scale, 2 * scale, 2 * scale); // One eye
            ctx.fillRect(x + 3 * scale, y - 22 * scale, 3 * scale, 1 * scale); // Mouth
        }
    };

    drawSheriffsOffice = (ctx) => {
        ctx = ctx || this.ctx; // Use provided context or default to main context
        
        const colors = this.colors;
        
        // Draw walls (dark wood paneling)
        ctx.fillStyle = colors.brown;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Floor
        ctx.fillStyle = colors.darkGray;
        ctx.fillRect(0, 300, this.canvas.width, 150);
        
        // Sheriff's desk (bigger, more ornate)
        ctx.fillStyle = '#663300'; // Darker wood
        ctx.fillRect(350, 150, 250, 100);
        
        // Chair behind desk
        ctx.fillStyle = colors.black;
        ctx.fillRect(450, 260, 50, 60);
        
        // Computer
        ctx.fillStyle = colors.darkGray;
        ctx.fillRect(400, 160, 60, 40);
        ctx.fillStyle = colors.brightCyan;
        ctx.fillRect(405, 165, 50, 30);
        
        // Window
        ctx.fillStyle = colors.brightBlue;
        ctx.fillRect(600, 50, 150, 100);
        ctx.strokeStyle = colors.black;
        ctx.lineWidth = 2;
        ctx.strokeRect(600, 50, 150, 100);
        ctx.beginPath();
        ctx.moveTo(675, 50);
        ctx.lineTo(675, 150);
        ctx.stroke();
        
        // Filing cabinet
        ctx.fillStyle = colors.lightGray;
        ctx.fillRect(50, 150, 70, 120);
        ctx.fillStyle = colors.black;
        ctx.fillRect(85, 180, 20, 5);
        ctx.fillRect(85, 210, 20, 5);
        ctx.fillRect(85, 240, 20, 5);
        
        // Door
        ctx.fillStyle = colors.brown;
        ctx.fillRect(100, 320, 60, 120);
        ctx.fillStyle = colors.yellow;
        ctx.fillRect(145, 380, 10, 10);
        
        // Name plate
        ctx.fillStyle = colors.black;
        ctx.fillRect(420, 130, 100, 15);
        ctx.fillStyle = colors.white;
        ctx.font = '12px monospace';
        ctx.fillText('SHERIFF', 445, 142);
        
        // Sign
        ctx.fillStyle = colors.brown;
        ctx.fillRect(10, 50, 150, 40);
        ctx.fillStyle = colors.yellow;
        ctx.font = '16px monospace';
        ctx.fillText('SHERIFF\'S OFFICE', 15, 75);

        // Navigation arrows
        this.drawArrowIndicator('down', 'Station');
        this.drawArrowIndicator('right', 'Briefing');
    };

    drawBriefingRoom = (ctx) => {
        ctx = ctx || this.ctx; // Use provided context or default to main context
        
        const colors = this.colors;
        
        // Walls
        ctx.fillStyle = colors.blue;
        ctx.fillRect(0, 0, this.canvas.width, 300);
        
        // Floor
        ctx.fillStyle = colors.darkGray;
        ctx.fillRect(0, 300, this.canvas.width, 150);
        
        // Long table
        ctx.fillStyle = colors.brown;
        ctx.fillRect(150, 180, 500, 120);
        
        // Chairs around the table
        for (let i = 0; i < 6; i++) {
            // Chairs on one side
            ctx.fillStyle = colors.darkGray;
            ctx.fillRect(170 + i * 80, 140, 40, 40);
            
            // Chairs on the other side
            ctx.fillStyle = colors.darkGray;
            ctx.fillRect(170 + i * 80, 300, 40, 40);
        }
        
        // Projector screen
        ctx.fillStyle = colors.white;
        ctx.fillRect(350, 30, 200, 100);
        ctx.strokeStyle = colors.black;
        ctx.lineWidth = 2;
        ctx.strokeRect(350, 30, 200, 100);
        
        // Case photos on the wall
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors.white;
            ctx.fillRect(50 + i * 120, 60, 80, 60);
            ctx.strokeStyle = colors.black;
            ctx.lineWidth = 1;
            ctx.strokeRect(50 + i * 120, 60, 80, 60);
        }
        
        // Door
        ctx.fillStyle = colors.brown;
        ctx.fillRect(100, 320, 60, 120);
        ctx.fillStyle = colors.yellow;
        ctx.fillRect(145, 380, 10, 10);
        
        // Coffee machine
        ctx.fillStyle = colors.black;
        ctx.fillRect(700, 200, 50, 80);
        ctx.fillStyle = colors.red;
        ctx.fillRect(715, 220, 20, 10);
        
        // Sign
        ctx.fillStyle = colors.brown;
        ctx.fillRect(10, 50, 180, 40);
        ctx.fillStyle = colors.yellow;
        ctx.font = '16px monospace';
        ctx.fillText('BRIEFING ROOM', 25, 75);
        
        // Navigation arrows
        this.drawArrowIndicator('down', 'Station');
        this.drawArrowIndicator('left', 'Sheriff');
    };

    checkCollision = (x, y) => {
        // Check desk collisions first
        const desks = this.collisionObjects.filter(obj => obj.type === 'desk');
        for (const desk of desks) {
            if (x >= desk.x && x <= desk.x + desk.width &&
                y >= desk.y && y <= desk.y + desk.height) {
                return desk;
            }
        }

        // Then check doors
        const doors = this.collisionObjects.filter(obj => obj.type === 'door');
        for (const door of doors) {
            if (x >= door.x && x <= door.x + door.width &&
                y >= door.y && y <= door.y + door.height) {
                return door;
            }
        }

        // Finally check room boundaries
        const boundaries = this.roomBoundaries[this.currentScene];
        if (boundaries) {
            for (const wall of boundaries.walls) {
                if (x >= wall.x && x <= wall.x + wall.width &&
                    y >= wall.y && y <= wall.y + wall.height) {
                    return { type: 'wall' };
                }
            }
        }

        return null;
    };

    processInteraction = (hitObject) => {
        if (!this.activeCommand) {
            this.showDialog("Select an action first (Look, Talk, Use, Take, Move)");
            return;
        }
        
        // Special handling for doors
        if (hitObject.type === 'door' && this.activeCommand === 'use') {
            // Get target scene from door properties with proper null checking
            const targetScene = hitObject.target || 
                (hitObject.id && hitObject.id.includes('Door') ? 
                hitObject.id.replace('Door', '').toLowerCase() : 'policeStation');
                
            // Safe string manipulation with null check
            const displayName = targetScene ? 
                targetScene.charAt(0).toUpperCase() + targetScene.slice(1).replace(/([A-Z])/g, ' $1').trim() : 
                "another room";
                
            this.showDialog(`Entering ${displayName}...`);
            
            // Transition to new scene after a brief delay
            setTimeout(() => {
                this.currentScene = targetScene;
                this.loadScene(targetScene);
            }, 500);
            
            return;
        }
        
        // Handle standard interactions
        const interaction = hitObject.interactions && hitObject.interactions[this.activeCommand];
        if (interaction) {
            this.showDialog(interaction);
            
            // Handle special interactions
            if (this.activeCommand === 'take' && hitObject.id === 'caseFile') {
                game.addToInventory('caseFile');
                game.completeStage('review');
                this.updateInventoryUI();
                this.updateCaseInfo();
            } else if (this.activeCommand === 'take' && hitObject.id === 'evidence') {
                game.addToInventory('tool');
                game.collectEvidence('tool');
                game.completeStage('evidence');
                this.updateInventoryUI();
                this.updateCaseInfo();
            } else if (this.activeCommand === 'talk' && hitObject.id === 'witness') {
                game.completeStage('interview');
                this.updateCaseInfo();
            } else if (this.activeCommand === 'talk' && hitObject.id === 'suspect') {
                game.completeStage('suspect');
                this.updateCaseInfo();
            } else if (this.activeCommand === 'use' && hitObject.id === 'shopDoor') {
                game.completeStage('downtown');
                this.updateCaseInfo();
            }
            
            // Check if case is solved
            if (game.checkCaseSolved()) {
                setTimeout(() => {
                    this.showDialog("Congratulations! You've solved the case!");
                }, 3000);
            }
        } else {
            this.showDialog(`You can't ${this.activeCommand} that.`);
            soundManager.playSound('error');
        }
    };

    updateInventoryUI = () => {
        try {
            // Clear existing inventory display
            this.inventoryPanel.innerHTML = '';
            
            // Add each inventory item
            game.gameState.inventory.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.innerText = item.substring(0, 2).toUpperCase();
                itemElement.title = item;
                itemElement.addEventListener('click', () => {
                    this.showDialog(`Selected item: ${item}`);
                    soundManager.playSound('click');
                });
                this.inventoryPanel.appendChild(itemElement);
            });
        } catch (error) {
            console.error("Error updating inventory UI:", error);
        }
    };

    updateCaseInfo = () => {
        try {
            if (!game.currentCase) return;
            
            let caseHTML = `<h3>${game.currentCase.title}</h3>`;
            caseHTML += '<p>Case stages:</p>';
            caseHTML += '<ul>';
            
            game.currentCase.stages.forEach(stage => {
                caseHTML += `<li>${stage.description} ${stage.completed ? '✓' : ''}</li>`;
            });
            
            caseHTML += '</ul>';
            
            this.caseInfoPanel.innerHTML = caseHTML;
        } catch (error) {
            console.error("Error updating case info:", error);
        }
    };

    showDialog = (text) => {
        if (!text) return;
        
        // Find dialog box if not already cached
        if (!this.dialogBox) {
            this.dialogBox = document.getElementById('dialogBox');
        }
        
        // If dialog box is found, set the text
        if (this.dialogBox) {
            this.dialogBox.innerText = text;
        } else {
            // Fallback to console if no dialog box element exists
            console.log(`Dialog: ${text}`);
        }
    };

    loadScene = (sceneId) => {
        try {
            // Validate scene ID
            if (!sceneId) {
                console.error('No scene ID provided');
                sceneId = 'policeStation';
            }

            console.log(`Loading scene: ${sceneId}`);

            // Stop current background music and animations
            if (window.soundManager) {
                this.stopBackgroundMusic();
            }

            // Reset all state
            this.clear();
            this.collisionObjects = [];
            
            // Initialize NPCs array for this scene if it doesn't exist
            if (!this.npcs[sceneId]) {
                this.npcs[sceneId] = [];
            }
            
            // Reset ambient animations
            Object.keys(this.ambientAnimations).forEach(key => {
                this.ambientAnimations[key].active = false;
            });

            // Update current scene
            this.currentScene = sceneId;
            
            // Set default player position for new scene
            const defaultY = this.floorLevel.min + 50;
            this.playerPosition = { x: 400, y: defaultY };
            
            // Reset movement state
            this.isWalking = false;
            this.walkTarget = null;
            
            // Setup scene components in order
            this.setupAmbientAnimations(this.currentScene);
            this.updateCollisionObjects();
            this.initializeNPCsForScene(sceneId);
            
            // Draw the new scene
            requestAnimationFrame(() => {
                this.drawCurrentScene();
                
                // Start scene music after scene is drawn
                if (window.soundManager) {
                    this.startBackgroundMusic();
                }
            });
            
            console.log(`Scene loaded successfully: ${this.currentScene}`);
        } catch (error) {
            console.error("Error loading scene:", error);
            console.error("Stack trace:", error.stack);
            this.showDialog("Error loading scene. Please try again.");
        }
    };

    initializeNPCsForScene = (sceneId) => {
        // Clear existing NPCs for this scene
        this.npcs[sceneId] = [];
        
        switch(sceneId) {
            case 'policeStation':
                // Receptionist at desk
                this.npcs[sceneId].push({
                    x: 435,
                    y: this.floorLevel.min + 75,
                    type: 'officer',
                    name: 'Officer Jenny',
                    isReceptionist: true,
                    isFemale: true,
                    isWorking: true,
                    patrolPoints: [{x: 435, y: this.floorLevel.min + 75}],
                    currentPatrolPoint: 0,
                    facing: 'left',
                    waitTime: 60,
                    conversationChance: 0.02,
                    dialogue: "Welcome to the station. How can I help you?",
                    conversationTime: 2,
                    stayAtDesk: true
                });

                // Patrolling officer
                this.npcs[sceneId].push({
                    x: 200,
                    y: this.floorLevel.min + 120,
                    type: 'officer',
                    name: 'Officer Johnson',
                    patrolPoints: [
                        {x: 200, y: this.floorLevel.min + 120},
                        {x: 600, y: this.floorLevel.min + 120},
                        {x: 400, y: this.floorLevel.min + 110}
                    ],
                    currentPatrolPoint: 0,
                    facing: 'right',
                    waitTimes: [2, 2, 15]
                });
                break;

            case 'downtown':
                // Beat cop
                this.npcs[sceneId].push({
                    x: 150,
                    y: 350,
                    type: 'officer',
                    name: 'Officer Parker',
                    patrolPoints: [
                        {x: 150, y: 350},
                        {x: 300, y: 350},
                        {x: 450, y: 350}
                    ],
                    currentPatrolPoint: 0,
                    facing: 'right'
                });

                // Witness
                this.npcs[sceneId].push({
                    x: 600,
                    y: 320,
                    type: 'civilian',
                    name: 'Witness',
                    patrolPoints: [
                        {x: 600, y: 320},
                        {x: 550, y: 340},
                        {x: 630, y: 350}
                    ],
                    currentPatrolPoint: 0,
                    facing: 'left',
                    isFemale: true,
                    dialogue: "I saw someone suspicious last night."
                });
                break;

            case 'officeArea':
                // Detective at desk
                this.npcs[sceneId].push({
                    x: 250,
                    y: 350,
                    type: 'detective',
                    name: 'Detective Williams',
                    patrolPoints: [
                        {x: 250, y: 350},
                        {x: 400, y: 350}
                    ],
                    currentPatrolPoint: 0,
                    facing: 'right',
                    dialogue: "Looking into that burglary case."
                });
                break;
        }
    };

    updateNPCs = (deltaTime = 1/60) => {
        const currentSceneNPCs = this.npcs[this.currentScene];
        if (!currentSceneNPCs) return;

        currentSceneNPCs.forEach(npc => {
            // Skip update if NPC is in conversation or waiting
            if (npc.conversationTime > 0) {
                npc.conversationTime -= deltaTime;
                npc.isWalking = false;
                return;
            }

            if (npc.waitTime > 0) {
                npc.waitTime -= deltaTime;
                npc.isWalking = false;
                return;
            }

            // Special handling for receptionist
            if (npc.stayAtDesk) {
                npc.isWalking = false;
                npc.facing = 'left';
                if (Math.random() < (npc.conversationChance || 0.005)) {
                    npc.conversationTime = 3;
                    npc.dialogue = this.getRandomWorkingDialogue();
                }
                return;
            }

            // Regular NPC movement
            const target = npc.patrolPoints[npc.currentPatrolPoint];
            if (!target) return;

            const dx = target.x - npc.x;
            const dy = target.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) {
                // Reached waypoint
                if (npc.waitTimes && npc.waitTimes[npc.currentPatrolPoint]) {
                    npc.waitTime = npc.waitTimes[npc.currentPatrolPoint];
                } else {
                    npc.waitTime = 1 + Math.random() * 2;
                }
                npc.currentPatrolPoint = (npc.currentPatrolPoint + 1) % npc.patrolPoints.length;
                npc.isWalking = false;

                // Random chance to start conversation
                if (Math.random() < 0.3) {
                    npc.conversationTime = 2;
                    npc.dialogue = this.getRandomDialogue(npc.type);
                }
            } else {
                // Move towards target
                const speed = 1;
                npc.x += (dx / distance) * speed;
                npc.y += (dy / distance) * speed;
                npc.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
                npc.isWalking = true;
            }

            // Keep NPCs within floor bounds
            npc.y = Math.max(this.floorLevel.min + 50, Math.min(npc.y, this.floorLevel.max));

            // Check for conversations with nearby NPCs
            this.checkNPCConversations(npc, currentSceneNPCs);
        });
    };

    drawRoomBoundaries = () => {
        const boundaries = this.roomBoundaries[this.currentScene];
        if (!boundaries) return;
        
        this.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        this.ctx.lineWidth = 2;
        
        // Draw wall boundaries
        boundaries.walls.forEach(wall => {
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Draw door boundaries
        this.ctx.strokeStyle = 'rgba(0,255,0,0.5)';
        boundaries.doors.forEach(door => {
            this.ctx.strokeRect(door.x, door.y, door.width, door.height);
        });
    };
    
    drawExitDoor = (x, y, label, ctx) => {
        ctx = ctx || this.ctx;
        
        // Door frame with exit sign above
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x - 40, y - 5, 80, 35);
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 35, y, 70, 30);
        
        // Exit sign
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.fillRect(x - 30, y - 25, 60, 20);
        
        // Exit text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.fillText('EXIT', x - 20, y - 10);
        
        // Add to interactive elements
        this.collisionObjects.push({
            x: x - 35,
            y: y,
            width: 70,
            height: 30,
            type: 'door',
            id: 'exitDoor',
            target: 'downtown',
            interactions: {
                look: "The exit door leading downtown.",
                use: "You head downtown to investigate.",
                talk: "It's a door. It doesn't talk back."
            }
        });
    };
    
    addExitSign = (x, y, destination, ctx) => {
        ctx = ctx || this.ctx;
        
        if (!destination || typeof x !== 'number' || typeof y !== 'number') {
            console.warn('Invalid parameters for exit sign');
            return;
        }

        const ARROW_SIZE = 15;
        const TEXT_OFFSET = 25;
        
        // Arrow pointing down
        ctx.fillStyle = this.colors.yellow;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - ARROW_SIZE, y - ARROW_SIZE * 1.33);
        ctx.lineTo(x + ARROW_SIZE, y - ARROW_SIZE * 1.33);
        ctx.closePath();
        ctx.fill();
        
        // Destination text
        ctx.fillStyle = this.colors.white;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(destination, x, y - TEXT_OFFSET);
        ctx.textAlign = 'left'; // Reset to default
    };

    // Memoized color adjustment for better performance
    #colorCache = new Map();
    
    adjustColor = (color, amount) => {
        const cacheKey = `${color}_${amount}`;
        if (this.#colorCache.has(cacheKey)) {
            return this.#colorCache.get(cacheKey);
        }

        try {
            const hex = color.replace('#', '');
            const adjust = (value) => {
                const adjusted = Math.max(0, Math.min(255, parseInt(value, 16) + amount));
                return adjusted.toString(16).padStart(2, '0');
            };

            const r = adjust(hex.substring(0, 2));
            const g = adjust(hex.substring(2, 4));
            const b = adjust(hex.substring(4, 6));
            
            const result = `#${r}${g}${b}`;
            this.#colorCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.warn('Error adjusting color:', error);
            return color; // Return original color if adjustment fails
        }
    };

    startBackgroundMusic = () => {
        const sceneMusic = this.currentScene?.music || 'station_theme';
        window.soundManager.playBackgroundMusic(sceneMusic);
    };

    stopBackgroundMusic = () => {
        window.soundManager.stopBackgroundMusic();
    };

    // Optimized color handling
    getCachedColor = (r, g, b, a = 1) => {
        const key = `${r},${g},${b},${a}`;
        if (!this.colorCache.has(key)) {
            this.colorCache.set(key, `rgba(${r},${g},${b},${a})`);
        }
        return this.colorCache.get(key);
    };

    draw = (ctx) => {
        // Batch similar draw operations
        const drawBatch = new Map();
        
        for (const obj of this.gameObjects) {
            const type = obj.constructor.name;
            if (!drawBatch.has(type)) {
                drawBatch.set(type, []);
            }
            drawBatch.get(type).push(obj);
        }
        
        // Draw batched objects
        for (const [type, objects] of drawBatch) {
            ctx.save();
            // Set common properties for this type
            for (const obj of objects) {
                obj.draw(ctx);
            }
            ctx.restore();
        }
    };

    // Optimized pixel operations using TypedArrays
    createPixelBuffer = () => {
        const buffer = new ArrayBuffer(this.canvas.width * this.canvas.height * 4);
        return new Uint8ClampedArray(buffer);
    };

    setPixel = (buffer, x, y, r, g, b, a = 255) => {
        const index = (y * this.canvas.width + x) * 4;
        buffer[index] = r;
        buffer[index + 1] = g;
        buffer[index + 2] = b;
        buffer[index + 3] = a;
    };

    updateCanvas = (buffer) => {
        const imageData = new ImageData(buffer, this.canvas.width, this.canvas.height);
        this.offscreenCtx.putImageData(imageData, 0, 0);
    };

    renderScene = () => {
        // Draw background and base elements first
        // ...existing code...

        // Draw wall items with proper z-indexing and spacing
        const wallItems = this.currentScene.wallItems;
        if (wallItems) {
            wallItems.sort((a, b) => a.zIndex - b.zIndex).forEach(item => {
                // ...existing code...
            });
        }
    };

    drawOfficeChair = (x, y, facing = 'left', ctx) => {
        ctx = ctx || this.ctx;
        
        // Make chair bigger to match desk scale
        const scale = 1.2;
        
        // Chair base (darker gray)
        ctx.fillStyle = '#333333';
        ctx.fillRect(x - 10 * scale, y, 20 * scale, 5 * scale);
        
        // Chair wheels
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.arc(x - 10 * scale, y + 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 10 * scale, y + 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Chair post
        ctx.fillStyle = '#444444';
        ctx.fillRect(x - 2 * scale, y - 15 * scale, 4 * scale, 15 * scale);
        
        // Chair seat
        ctx.fillStyle = '#1E3F7A'; // Dark blue for police department chairs
        ctx.fillRect(x - 10 * scale, y - 25 * scale, 20 * scale, 10 * scale);
        
        // Chair back
        if (facing === 'left') {
            ctx.fillRect(x - 15 * scale, y - 45 * scale, 5 * scale, 25 * scale);
        } else {
            ctx.fillRect(x + 10 * scale, y - 45 * scale, 5 * scale, 25 * scale);
        }
        
        // Chair arms
        ctx.fillStyle = '#333333';
        if (facing === 'left') {
            ctx.fillRect(x - 15 * scale, y - 25 * scale, 3 * scale, 10 * scale);
        } else {
            ctx.fillRect(x + 12 * scale, y - 25 * scale, 3 * scale, 10 * scale);
        }
    };

    // Method to check for NPC conversations
    checkNPCConversations = (npc, allNpcs) => {
        // Don't start conversations if already talking
        if (npc.conversationTime > 0 || npc.waitTime > 0) return;
        
        // Find nearby NPCs to talk to
        const nearbyNpcs = allNpcs.filter(otherNpc => {
            if (otherNpc === npc) return false;
            if (otherNpc.conversationTime > 0) return false;
            
            // Check if they're close enough
            const dx = otherNpc.x - npc.x;
            const dy = otherNpc.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance < 60; // Close enough to talk
        });
        
        // If we found a nearby NPC and it's relatively random (10% chance)
        if (nearbyNpcs.length > 0 && Math.random() < 0.1) {
            const talkingPartner = nearbyNpcs[0];
            
            // Start conversation for both NPCs
            npc.conversationTime = 3 + Math.random() * 2;
            npc.dialogue = this.getRandomDialogue(npc.type);
            npc.isWalking = false;
            
            // Setup the other NPC to respond
            talkingPartner.conversationTime = 3 + Math.random() * 2;
            talkingPartner.dialogue = this.getRandomResponse(talkingPartner.type);
            talkingPartner.isWalking = false;
            
            // Turn to face each other
            if (npc.x < talkingPartner.x) {
                npc.facing = 'right';
                talkingPartner.facing = 'left';
            } else {
                npc.facing = 'left';
                talkingPartner.facing = 'right';
            }
        }
    };
    
    // Random dialogue based on NPC type
    getRandomDialogue = (npcType) => {
        const dialogues = {
            officer: [
                "Any leads on that case?",
                "Quiet day today.",
                "Did you see the game?",
                "Coffee's fresh.",
                "Your shift ending soon?"
            ],
            detective: [
                "This case doesn't add up.",
                "I've got a hunch about this.",
                "Witness statements are inconsistent.",
                "Need to check the evidence again.",
                "Been working this case all night."
            ],
            sergeant: [
                "I need those reports ASAP.",
                "What's the status update?",
                "Keep me informed.",
                "Good work on that case.",
                "Meeting in 10 minutes."
            ],
            civilian: [
                "I saw everything!",
                "It happened so fast...",
                "Can I go home now?",
                "I'm just waiting for someone.",
                "Is the detective available?"
            ]
        };
        
        // Default to officer dialogue if type not found
        const typeDialogues = dialogues[npcType] || dialogues.officer;
        return typeDialogues[Math.floor(Math.random() * typeDialogues.length)];
    };
    
    // Random responses
    getRandomResponse = (npcType) => {
        const responses = [
            "I hear you.",
            "Good point.",
            "That's interesting.",
            "Really?",
            "I'll look into that.",
            "That's what I thought.",
            "Let me check on that.",
            "Keep me posted."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    };
    
    // Draw conversation bubble with text
    drawConversationBubble = (x, y, text, ctx) => {
        if (!text) return; // Skip if no text to show
        
        ctx = ctx || this.offscreenCtx || this.ctx;
        
        // Set up text properties
        const padding = 10;
        const pointerHeight = 10;
        ctx.font = '12px Arial';
        
        // Get text dimensions
        const textWidth = ctx.measureText(text).width;
        const bubbleWidth = Math.max(textWidth + padding * 2, 60);
        const bubbleHeight = 25;
        
        // Draw bubble background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Main bubble
        this.drawRoundedRect(
            ctx,
            x - bubbleWidth / 2, 
            y - bubbleHeight - pointerHeight,
            bubbleWidth,
            bubbleHeight,
            6
        );
        
        // Bubble pointer
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8, y - pointerHeight);
        ctx.lineTo(x + 8, y - pointerHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw a border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        
        // Border for main bubble
        ctx.beginPath();
        ctx.roundRect(
            x - bubbleWidth / 2, 
            y - bubbleHeight - pointerHeight,
            bubbleWidth,
            bubbleHeight,
            6
        );
        ctx.stroke();
        
        // Border for pointer
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8, y - pointerHeight);
        ctx.lineTo(x + 8, y - pointerHeight);
        ctx.closePath();
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y - bubbleHeight/2 - pointerHeight);
        ctx.textAlign = 'left'; // Reset to default
        ctx.textBaseline = 'alphabetic'; // Reset to default
    };
    
    // Helper method for drawing rounded rectangles
    drawRoundedRect = (ctx, x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    };

    // Random dialogue for receptionist working at desk
    getRandomWorkingDialogue = () => {
        const workingDialogues = [
            "Filing these reports...",
            "Updating the system...",
            "Processing this paperwork.",
            "Checking these records.",
            "Scheduling interviews.",
            "Updating the duty roster.",
            "Entering case data.",
            "Need to finish this form."
        ];
        return workingDialogues[Math.floor(Math.random() * workingDialogues.length)];
    };

    setupAmbientAnimations = (scene) => {
        // Reset all animations
        Object.keys(this.ambientAnimations).forEach(key => {
            this.ambientAnimations[key].active = false;
        });
        
        switch(scene) {
            case 'policeStation':
                // Typing animation for receptionist
                this.ambientAnimations.typingNPC.x = 400;
                this.ambientAnimations.typingNPC.y = this.floorLevel.min - 8;
                this.ambientAnimations.typingNPC.active = true;
                break;
                
            case 'officeArea':
                // Coffee machine steam
                this.ambientAnimations.coffeeSteam.x = 725;
                this.ambientAnimations.coffeeSteam.y = 230;
                this.ambientAnimations.coffeeSteam.active = true;
                break;
                
            case 'briefingRoom':
                // Coffee machine steam
                this.ambientAnimations.coffeeSteam.x = 715;
                this.ambientAnimations.coffeeSteam.y = 210;
                this.ambientAnimations.coffeeSteam.active = true;
                break;
        }
    };

    updateCollisionObjects = () => {
        this.collisionObjects = [];
        
        switch(this.currentScene) {
            case 'policeStation':
                // Reception desk
                this.collisionObjects.push({
                    x: 400, y: 320, width: 150, height: 80,
                    type: 'desk',
                    id: 'receptionDesk',
                    interactions: {
                        look: "The reception desk. Officer Jenny usually sits here.",
                        use: "You check the sign-in sheet.",
                        take: "You can't take the desk with you, detective."
                    }
                });

                // Add desk collision for the chair area
                this.collisionObjects.push({
                    x: 500, y: 320, width: 60, height: 80,
                    type: 'desk',
                    id: 'receptionChairArea',
                    interactions: {
                        look: "Officer Jenny's chair and workspace.",
                        use: "That's Officer Jenny's workspace.",
                        take: "You can't take Officer Jenny's chair."
                    }
                });
                
                // Sheriff's office door
                this.collisionObjects.push({
                    x: 700, y: 180, width: 60, height: 120,
                    type: 'door',
                    id: 'sheriffsOfficeDoor',
                    target: 'sheriffsOffice',
                    interactions: {
                        look: "The Sheriff's office. The door is slightly ajar.",
                        use: "You enter the Sheriff's office.",
                        talk: "There's no one at the door to talk to."
                    }
                });
                
                // Briefing room door
                this.collisionObjects.push({
                    x: 100, y: 180, width: 60, height: 120,
                    type: 'door',
                    id: 'briefingRoomDoor',
                    target: 'briefingRoom',
                    interactions: {
                        look: "The door to the briefing room.",
                        use: "You enter the briefing room.",
                        talk: "There's no one at the door to talk to."
                    }
                });
                
                // Exit to downtown
                this.collisionObjects.push({
                    x: 365, y: 520, width: 70, height: 30,
                    type: 'door',
                    id: 'exitDoor',
                    target: 'downtown',
                    interactions: {
                        look: "The exit door leading downtown.",
                        use: "You head downtown to investigate.",
                        talk: "It's a door. It doesn't talk back."
                    }
                });

                // Bulletin board
                this.collisionObjects.push({
                    x: 500, y: 100, width: 120, height: 80,
                    type: 'object',
                    id: 'bulletinBoard',
                    interactions: {
                        look: "A bulletin board with various notices and wanted posters.",
                        use: "You scan the bulletins for any relevant information.",
                        take: "The bulletin board is mounted to the wall."
                    }
                });
                break;

            case 'sheriffsOffice':
                // Sheriff's desk
                this.collisionObjects.push({
                    x: 350, y: 150, width: 250, height: 100,
                    type: 'desk',
                    id: 'sheriffsDesk',
                    interactions: {
                        look: "The Sheriff's desk. Much larger and tidier than yours.",
                        use: "Best not to disturb the Sheriff's desk.",
                        take: "That would be a career-limiting move."
                    }
                });

                // Exit door
                this.collisionObjects.push({
                    x: 100, y: 320, width: 60, height: 120,
                    type: 'door',
                    id: 'exitDoor',
                    target: 'policeStation',
                    interactions: {
                        look: "Door leading back to the main station.",
                        use: "You head back to the main station area.",
                        take: "You can't take the door."
                    }
                });
                break;

            case 'briefingRoom':
                // Conference table
                this.collisionObjects.push({
                    x: 150, y: 180, width: 500, height: 120,
                    type: 'desk',
                    id: 'conferenceTable',
                    interactions: {
                        look: "The briefing room's conference table.",
                        use: "You review some notes on the table.",
                        take: "It's bolted to the floor."
                    }
                });

                // Exit door
                this.collisionObjects.push({
                    x: 100, y: 320, width: 60, height: 120,
                    type: 'door',
                    id: 'exitDoor',
                    target: 'policeStation',
                    interactions: {
                        look: "Door leading back to the main station.",
                        use: "You head back to the main station area.",
                        take: "You can't take the door."
                    }
                });
                break;
                
            case 'downtown':
                // Shop entrance
                this.collisionObjects.push({
                    x: 400, y: 220, width: 40, height: 60,
                    type: 'door',
                    id: 'shopDoor',
                    interactions: {
                        look: "The electronics shop entrance. Signs of forced entry are visible.",
                        use: "You examine the break-in point carefully.",
                        take: "You can't take the door."
                    }
                });

                // Return to station
                this.collisionObjects.push({
                    x: 350, y: 520, width: 100, height: 30,
                    type: 'door',
                    id: 'stationDoor',
                    target: 'policeStation',
                    interactions: {
                        look: "The way back to the police station.",
                        use: "You head back to the station.",
                        take: "You can't take the door."
                    }
                });
                break;
        }
    };

    drawFloorGrid = (x, y, width, height) => {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;

        // Draw horizontal lines with perspective
        for (let i = 0; i <= height; i += 20) {
            ctx.beginPath();
            // Calculate perspective vanishing point
            const vanishX = this.canvas.width / 2;
            const vanishY = y - 100;
            const perspectiveX1 = x + (x - vanishX) * (i / height);
            const perspectiveX2 = (x + width) + ((x + width) - vanishX) * (i / height);
            ctx.moveTo(perspectiveX1, y + i);
            ctx.lineTo(perspectiveX2, y + i);
            ctx.stroke();
        }

        // Draw vertical lines with perspective
        for (let i = 0; i <= width; i += 40) {
            ctx.beginPath();
            const vanishY = y - 100;
            const startX = x + i;
            const endX = x + i + (this.canvas.width / 2 - (x + i)) * 0.8;
            const endY = y + height;
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    };

    draw3DWall = (x, y, width, height, color, ctx) => {
        ctx = ctx || this.ctx;
        
        // Calculate perspective points
        const vanishX = this.canvas.width / 2;
        const vanishY = y - 100;
        const perspectiveDepth = 0.2; // Controls how much perspective effect to apply
        
        // Base wall color
        ctx.fillStyle = color;
        
        // Draw main wall face
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        
        // Add shading to create depth
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // Add subtle vertical gradient for more depth
        const vGradient = ctx.createLinearGradient(x, y, x, y + height);
        vGradient.addColorStop(0, 'rgba(255,255,255,0.1)');
        vGradient.addColorStop(1, 'rgba(0,0,0,0.1)');
        
        ctx.fillStyle = vGradient;
        ctx.fillRect(x, y, width, height);
    };

    drawBulletinNotices = (x, y, width, height, ctx) => {
        ctx = ctx || this.ctx;
        const notices = [
            { title: "WANTED", color: "#FF9999" },
            { title: "MISSING", color: "#99FF99" },
            { title: "NOTICE", color: "#FFFFFF" },
            { title: "APB", color: "#FFFF99" }
        ];

        // Draw multiple notices on the bulletin board
        notices.forEach((notice, i) => {
            const noticeWidth = 45;
            const noticeHeight = 30;
            const margin = 5;
            const xPos = x + (i % 2) * (noticeWidth + margin);
            const yPos = y + Math.floor(i / 2) * (noticeHeight + margin);

            // Notice paper background
            ctx.fillStyle = notice.color;
            ctx.fillRect(xPos, yPos, noticeWidth, noticeHeight);

            // Notice text
            ctx.fillStyle = '#000000';
            ctx.font = '8px monospace';
            ctx.fillText(notice.title, xPos + 5, yPos + 15);
            
            // Add some "text" lines
            ctx.fillStyle = '#666666';
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(xPos + 5, yPos + 20 + j * 4, 35, 1);
            }
        });
    };

    draw3DDesk = (x, y, width, height, ctx) => {
        ctx = ctx || this.ctx;
        
        // Desk top
        ctx.fillStyle = '#8B4513'; // Wood brown
        ctx.fillRect(x, y, width, height);
        
        // Desk front panel with shadow
        ctx.fillStyle = '#734A29'; // Darker brown
        ctx.fillRect(x, y + height, width, 10);
        
        // Left leg
        ctx.fillStyle = '#5C3A1F'; // Even darker brown
        ctx.fillRect(x + 10, y + height + 10, 20, 30);
        
        // Right leg
        ctx.fillRect(x + width - 30, y + height + 10, 20, 30);
        
        // Add wood grain texture
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, 'rgba(139, 69, 19, 0)');
        gradient.addColorStop(0.5, 'rgba(139, 69, 19, 0.1)');
        gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
    };

    drawDeskItems = (x, y, width, height, ctx) => {
        ctx = ctx || this.ctx;
        
        // Computer monitor
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + width - 60, y - 30, 40, 30);
        ctx.fillStyle = '#66CCFF';
        ctx.fillRect(x + width - 55, y - 25, 30, 20);
        
        // Keyboard
        ctx.fillStyle = '#111111';
        ctx.fillRect(x + width - 50, y + 5, 25, 10);
        
        // Papers/files
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 20, y + 10, 30, 25);
        ctx.fillRect(x + 25, y + 5, 30, 25);
        
        // Coffee mug
        ctx.fillStyle = '#CC6600';
        ctx.fillRect(x + width - 90, y + 15, 10, 12);
    };

    drawDoorWithFrame = (x, y, facing, label, ctx) => {
        ctx = ctx || this.ctx;
        
        // Door frame
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x - 5, y, 70, 120);
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y + 5, 60, 110);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        if (facing === 'left') {
            ctx.fillRect(x + 45, y + 60, 10, 10);
        } else {
            ctx.fillRect(x + 5, y + 60, 10, 10);
        }
        
        // Door label
        if (label) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + 30, y - 10);
            ctx.textAlign = 'left'; // Reset to default
        }
    };

    drawWallDecorations = (ctx) => {
        ctx = ctx || this.ctx;
        const colors = this.colors;
        
        // Police department seal moved to right side
        ctx.fillStyle = colors.darkBlue;
        ctx.beginPath();
        ctx.arc(650, 100, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Decorative border ring
        ctx.strokeStyle = colors.yellow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(650, 100, 42, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner seal
        ctx.fillStyle = colors.yellow;
        ctx.beginPath();
        ctx.arc(650, 100, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text "POLICE" curving along the top of seal
        ctx.fillStyle = colors.white;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add star in center
        ctx.fillStyle = colors.darkBlue;
        ctx.beginPath();
        this.drawStar(650, 100, 5, 15, 7);
        ctx.fill();
        
        // Wall clock remains at original position
        // ...existing code...

        // Wall clock
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.arc(600, 50, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.black;
        ctx.lineWidth = 2;
        
        // Clock hands
        const time = new Date();
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        
        // Hour hand
        ctx.save();
        ctx.translate(600, 50);
        ctx.rotate(hours * (Math.PI/6) + minutes * (Math.PI/360));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);
        ctx.stroke();
        ctx.restore();
        
        // Minute hand
        ctx.save();
        ctx.translate(600, 50);
        ctx.rotate(minutes * (Math.PI/30));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -15);
        ctx.stroke();
        ctx.restore();
        
        // Motivational poster
        ctx.fillStyle = colors.black;
        ctx.fillRect(100, 50, 100, 80);
        ctx.fillStyle = colors.white;
        ctx.fillRect(105, 55, 90, 70);
        ctx.font = '10px monospace';
        ctx.fillStyle = colors.black;
        ctx.fillText("JUSTICE", 125, 90);
        ctx.fillText("SERVES ALL", 120, 105);
    };

    drawAmbientAnimations = () => {
        const ctx = this.offscreenCtx || this.ctx;
        
        // Draw typing animation
        if (this.ambientAnimations.typingNPC.active) {
            const { x, y } = this.ambientAnimations.typingNPC;
            
            // Animate hands typing
            const frame = Math.floor(this.animationFrame / 5) % 2;
            ctx.fillStyle = '#FFD8B1'; // Skin tone
            
            if (frame === 0) {
                // Hands up
                ctx.fillRect(x + 45, y + 5, 4, 4);
                ctx.fillRect(x + 55, y + 5, 4, 4);
            } else {
                // Hands down
                ctx.fillRect(x + 45, y + 8, 4, 4);
                ctx.fillRect(x + 55, y + 8, 4, 4);
            }
        }

        // Draw coffee steam animation
        if (this.ambientAnimations.coffeeSteam.active) {
            const { x, y } = this.ambientAnimations.coffeeSteam;
            
            // Create steam particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 3; i++) {
                const offset = Math.sin((this.animationFrame + i * 10) * 0.1) * 3;
                const yOffset = ((this.animationFrame + i * 20) % 30);
                
                ctx.beginPath();
                ctx.arc(
                    x + offset,
                    y - yOffset,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    };

    // Draw a star shape with the specified number of points
    drawStar = (x, y, points, outerRadius, innerRadius) => {
        const ctx = this.offscreenCtx || this.ctx;
        let step = Math.PI / points;
        
        ctx.beginPath();
        
        // Draw the star points
        for (let i = 0; i < points * 2; i++) {
            let radius = i % 2 === 0 ? outerRadius : innerRadius;
            let angle = i * step;
            
            let xPos = x + radius * Math.cos(angle - Math.PI / 2);
            let yPos = y + radius * Math.sin(angle - Math.PI / 2);
            
            if (i === 0) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }
        
        ctx.closePath();
    };

    drawWallDecorations = (ctx) => {
        ctx = ctx || this.ctx;
        const colors = this.colors;
        
        // Police department seal moved to right side
        ctx.fillStyle = colors.darkBlue;
        ctx.beginPath();
        ctx.arc(650, 100, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Decorative border ring
        ctx.strokeStyle = colors.yellow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(650, 100, 42, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner seal
        ctx.fillStyle = colors.yellow;
        ctx.beginPath();
        ctx.arc(650, 100, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text "POLICE" curving along the top of seal
        ctx.fillStyle = colors.white;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add star in center
        ctx.fillStyle = colors.darkBlue;
        ctx.beginPath();
        this.drawStar(650, 100, 5, 15, 7);
        ctx.fill();
        
        // Wall clock remains at original position
        // ...existing code...

        // Wall clock
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.arc(600, 50, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.black;
        ctx.lineWidth = 2;
        
        // Clock hands
        const time = new Date();
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        
        // Hour hand
        ctx.save();
        ctx.translate(600, 50);
        ctx.rotate(hours * (Math.PI/6) + minutes * (Math.PI/360));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -10);
        ctx.stroke();
        ctx.restore();
        
        // Minute hand
        ctx.save();
        ctx.translate(600, 50);
        ctx.rotate(minutes * (Math.PI/30));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -15);
        ctx.stroke();
        ctx.restore();
        
        // Motivational poster
        ctx.fillStyle = colors.black;
        ctx.fillRect(100, 50, 100, 80);
        ctx.fillStyle = colors.white;
        ctx.fillRect(105, 55, 90, 70);
        ctx.font = '10px monospace';
        ctx.fillStyle = colors.black;
        ctx.fillText("JUSTICE", 125, 90);
        ctx.fillText("SERVES ALL", 120, 105);
    };

    drawAmbientAnimations = () => {
        const ctx = this.offscreenCtx || this.ctx;
        
        // Draw typing animation
        if (this.ambientAnimations.typingNPC.active) {
            const { x, y } = this.ambientAnimations.typingNPC;
            
            // Animate hands typing
            const frame = Math.floor(this.animationFrame / 5) % 2;
            ctx.fillStyle = '#FFD8B1'; // Skin tone
            
            if (frame === 0) {
                // Hands up
                ctx.fillRect(x + 45, y + 5, 4, 4);
                ctx.fillRect(x + 55, y + 5, 4, 4);
            } else {
                // Hands down
                ctx.fillRect(x + 45, y + 8, 4, 4);
                ctx.fillRect(x + 55, y + 8, 4, 4);
            }
        }

        // Draw coffee steam animation
        if (this.ambientAnimations.coffeeSteam.active) {
            const { x, y } = this.ambientAnimations.coffeeSteam;
            
            // Create steam particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 3; i++) {
                const offset = Math.sin((this.animationFrame + i * 10) * 0.1) * 3;
                const yOffset = ((this.animationFrame + i * 20) % 30);
                
                ctx.beginPath();
                ctx.arc(
                    x + offset,
                    y - yOffset,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    };

    setupCommandShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if input fields are focused
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case 'l':
                    this.setActiveCommand('look');
                    break;
                case 't':
                    this.setActiveCommand('talk');
                    break;
                case 'u':
                    this.setActiveCommand('use');
                    break;
                case 'g':
                    this.setActiveCommand('take'); // g for "get" item
                    break;
                case 'm':
                    this.setActiveCommand('move');
                    break;
                case 'i':
                    this.toggleInventory();
                    break;
                case 'p':
                    this.toggleMinimap();
                    break;
                case 'f12':
                    this.toggleDebugMode();
                    break;
                case 'f5':
                    this.quickSaveGame();
                    break;
                case 'f9':
                    this.quickLoadGame();
                    break;
            }
        });
    }
    
    setActiveCommand(command) {
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.action === command) {
                btn.classList.add('active');
            }
        });
        this.activeCommand = command;
        soundManager.playSound('click');
        this.updateCursor();
        
        // Show feedback
        this.showDialog(`Command: ${command}`);
    }
    
    toggleInventory() {
        const inventoryPanel = document.getElementById('inventoryPanel');
        if (inventoryPanel) {
            const isVisible = inventoryPanel.style.display !== 'none';
            inventoryPanel.style.display = isVisible ? 'none' : 'block';
            soundManager.playSound('click');
        }
    }
    
    toggleMinimap() {
        this.showMinimap = !this.showMinimap;
        soundManager.playSound('click');
        this.showDialog(this.showMinimap ? 'Minimap enabled' : 'Minimap disabled');
    }
    
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log(`Debug mode: ${this.debugMode ? 'enabled' : 'disabled'}`);
        this.showDialog(`Debug mode: ${this.debugMode ? 'enabled' : 'disabled'}`);
    }
    
    saveGame(slotName = this.currentSaveSlot) {
        try {
            // Create save data object
            const saveData = {
                playerPosition: this.playerPosition,
                playerFacing: this.playerFacing,
                currentScene: this.currentScene,
                inventory: window.GAME_DATA ? window.GAME_DATA.inventory : [],
                gameState: window.game ? window.game.gameState : {},
                timestamp: Date.now()
            };
            
            // Store in memory
            this.savedGames[slotName] = saveData;
            
            // Store in localStorage (with error handling)
            try {
                localStorage.setItem(`pqsave_${slotName}`, JSON.stringify(saveData));
            } catch (storageError) {
                console.warn('Could not save to localStorage:', storageError);
            }
            
            this.showDialog(`Game saved to slot: ${slotName}`);
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            this.showDialog('Failed to save game');
            return false;
        }
    }
    
    loadGame(slotName = this.currentSaveSlot) {
        try {
            // Try to load from memory first
            let saveData = this.savedGames[slotName];
            
            // If not in memory, try localStorage
            if (!saveData) {
                const savedString = localStorage.getItem(`pqsave_${slotName}`);
                if (savedString) {
                    saveData = JSON.parse(savedString);
                    this.savedGames[slotName] = saveData; // Cache it
                }
            }
            
            if (!saveData) {
                this.showDialog(`No saved game found in slot: ${slotName}`);
                return false;
            }
            
            // Restore game state
            this.playerPosition = saveData.playerPosition;
            this.playerFacing = saveData.playerFacing;
            
            // Only change scene if it's different
            if (this.currentScene !== saveData.currentScene) {
                this.currentScene = saveData.currentScene;
                this.loadScene(this.currentScene);
            }
            
            // Restore inventory and game state if available
            if (window.GAME_DATA) {
                window.GAME_DATA.inventory = saveData.inventory || [];
            }
            
            if (window.game && saveData.gameState) {
                window.game.gameState = saveData.gameState;
                
                // Update UI if needed
                if (typeof this.updateInventoryUI === 'function') {
                    this.updateInventoryUI();
                }
                if (typeof this.updateCaseInfo === 'function') {
                    this.updateCaseInfo();
                }
            }
            
            this.showDialog(`Game loaded from slot: ${slotName}`);
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            this.showDialog('Failed to load game');
            return false;
        }
    }
    
    quickSaveGame() {
        this.saveGame('quicksave');
        soundManager.playSound('click');
    }
    
    quickLoadGame() {
        if (this.loadGame('quicksave')) {
            soundManager.playSound('success');
        } else {
            soundManager.playSound('error');
        }
    }
    
    // Check if it's time to autosave
    checkAutosave() {
        const now = Date.now();
        if (now - this.lastAutoSave > this.autoSaveInterval) {
            this.saveGame('autosave');
            this.lastAutoSave = now;
        }
    }
    
    updateFPS(deltaTime) {
        this.fpsValues.push(1000 / deltaTime);
        if (this.fpsValues.length > 60) {
            this.fpsValues.shift();
        }
        
        // Update FPS display every 500ms
        const now = Date.now();
        if (now - this.lastFpsUpdate > 500) {
            const sum = this.fpsValues.reduce((a, b) => a + b, 0);
            this.currentFPS = Math.round(sum / this.fpsValues.length);
            this.lastFpsUpdate = now;
        }
    }
    
    drawDebugInfo(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 120);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.currentFPS}`, 20, 30);
        ctx.fillText(`Scene: ${this.currentScene}`, 20, 50);
        ctx.fillText(`Position: ${Math.round(this.playerPosition.x)},${Math.round(this.playerPosition.y)}`, 20, 70);
        ctx.fillText(`NPCs: ${this.npcs[this.currentScene]?.length || 0}`, 20, 90);
        ctx.fillText(`Collisions: ${this.collisionObjects.length}`, 20, 110);
    }
    
    drawMinimap() {
        const ctx = this.offscreenCtx;
        const mapSize = this.minimapSize;
        const { x, y } = this.minimapPosition;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, mapSize, mapSize);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, mapSize, mapSize);
        
        // Scale factors
        const scaleX = mapSize / this.canvas.width;
        const scaleY = mapSize / this.canvas.height;
        
        // Draw room shape
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(x, y + mapSize * 0.5, mapSize, mapSize * 0.5);
        
        // Draw doors
        const doors = this.collisionObjects.filter(obj => obj.type === 'door');
        doors.forEach(door => {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(
                x + door.x * scaleX,
                y + door.y * scaleY,
                door.width * scaleX,
                door.height * scaleY
            );
        });
        
        // Draw NPCs
        if (this.npcs[this.currentScene]) {
            this.npcs[this.currentScene].forEach(npc => {
                ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(
                    x + npc.x * scaleX, 
                    y + npc.y * scaleY, 
                    3, 0, Math.PI * 2
                );
                ctx.fill();
            });
        }
        
        // Draw player position
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(
            x + this.playerPosition.x * scaleX, 
            y + this.playerPosition.y * scaleY, 
            4, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw facing direction
        ctx.beginPath();
        ctx.moveTo(x + this.playerPosition.x * scaleX, y + this.playerPosition.y * scaleY);
        let dirX = 0, dirY = 0;
        switch(this.playerFacing) {
            case 'up': dirY = -8; break;
            case 'right': dirX = 8; break;
            case 'down': dirY = 8; break;
            case 'left': dirX = -8; break;
        }
        ctx.lineTo(
            x + this.playerPosition.x * scaleX + dirX, 
            y + this.playerPosition.y * scaleY + dirY
        );
        ctx.stroke();
        
        // Draw legend
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(`${this.currentScene}`, x + 5, y + 15);
    }
}

// Add functionality to handle interactions with hotspots
function handleInteraction(hotspot, inventory) {
    if (hotspot.interaction === 'use' && hotspot.requiredItem) {
        if (inventory.includes(hotspot.requiredItem)) {
            console.log(hotspot.result);
            return hotspot.result;
        } else {
            console.log('You need a ' + hotspot.requiredItem + ' to interact with this.');
            return null;
        }
    } else {
        console.log(hotspot.result);
        return hotspot.result;
    }
}

// Add functionality to manage inventory
function addToInventory(item) {
    if (!window.GAME_DATA.inventory.includes(item)) {
        window.GAME_DATA.inventory.push(item);
        console.log(item + ' added to inventory.');
    } else {
        console.log(item + ' is already in your inventory.');
    }
}

// Export the new functions
window.GameEngine = {
    ...window.GameEngine,
    handleInteraction,
    addToInventory
};

// Make GameEngine available in the global scope
window.GameEngine = GameEngine;