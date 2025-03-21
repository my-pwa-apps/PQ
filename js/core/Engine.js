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
        this.currentScene = 'officeArea'; // Changed from policeStation to officeArea
        this.isRunning = false;
        this.initialized = false;
        this.spriteCache = new Map();
        this.colorCache = new Map();
        this.ambientAnimations = {
            coffeeSteam: { active: false, x: 0, y: 0 },
            typingNPC: { active: false, x: 0, y: 0 }
        };
        
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
            white: '#FFFFFF'
        };
    }

    // Adding the missing setupEventListeners method
    setupEventListeners() {
        console.log("Setting up event listeners");
        
        // Command buttons
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cmd-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeCommand = btn.dataset.action;
                if (window.soundManager) {
                    window.soundManager.playSound('click');
                }
                this.updateCursor();
            });
        });

        // Canvas click with throttling
        let lastClickTime = 0;
        this._handleClick = (e) => {
            // Throttle clicks to prevent double-clicks or spam
            const now = Date.now();
            if (now - lastClickTime < 300) return; // 300ms debounce
            lastClickTime = now;

            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width / (window.devicePixelRatio || 1));
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height / (window.devicePixelRatio || 1));
            
            // First check for door interactions
            if (this.collisionObjects) {
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
            }
            
            // Otherwise handle movement or other interactions
            if (this.handleInteraction) {
                this.handleInteraction(x, y);
            } else {
                console.warn("handleInteraction method not defined");
            }
        };
        this.canvas.addEventListener('click', this._handleClick);

        // Keyboard navigation
        let keyLastPressed = 0;
        this._handleKeyDown = (e) => {
            if (!this.keyboardEnabled) return;
            
            // Throttle key presses
            const now = Date.now();
            if (now - keyLastPressed < 200) return; // 200ms debounce
            keyLastPressed = now;
            
            if (this.handleMovement) {
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
            } else {
                console.warn("handleMovement method not defined");
            }
        };
        document.addEventListener('keydown', this._handleKeyDown);

        // Improved mouse interaction
        this._handleMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Change cursor if hovering over interactive element
            if (this.checkCollision && this.checkCollision(x, y)) {
                this.canvas.style.cursor = 'pointer';
            } else if (this.updateCursor) {
                this.updateCursor(); // Use action-specific cursor
            } else {
                this.canvas.style.cursor = 'default';
            }
        };
        this.canvas.addEventListener('mousemove', this._handleMouseMove);
    }

    // Adding the missing updateCursor method
    updateCursor() {
        const cursorStyle = this.activeCommand ? 'pointer' : 'default';
        this.canvas.style.cursor = cursorStyle;
    }

    // Adding a stub for handleInteraction if it's referenced but not fully implemented
    handleInteraction(x, y) {
        if (!this.activeCommand) {
            console.log("No action selected");
            return;
        }

        console.log(`Handling interaction at (${x}, ${y}) with action: ${this.activeCommand}`);
        
        // Handle movement command
        if (this.activeCommand === 'move') {
            console.log(`Moving player to ${x}, ${y}`);
            this.walkTarget = { x, y };
            this.isWalking = true;
            return;
        }
        
        // Check for collisions with interactive objects
        if (this.checkCollision) {
            const clickedObject = this.checkCollision(x, y);
            if (clickedObject && this.processInteraction) {
                this.processInteraction(clickedObject);
            } else {
                console.log(`No interactive object at ${x}, ${y}`);
            }
        }
    }

    // Adding a stub for checkCollision
    checkCollision(x, y) {
        // This is a stub implementation
        if (!this.collisionObjects || !Array.isArray(this.collisionObjects)) {
            return null;
        }
        
        // Check static objects (doors, desks, etc)
        for (const obj of this.collisionObjects) {
            if (x >= obj.x && x <= obj.x + (obj.width || 50) &&
                y >= obj.y && y <= obj.y + (obj.height || 50)) {
                return obj;
            }
        }
        
        return null;
    }

    // Add this method to show dialog messages to the player
    showDialog(text) {
        if (!text) return;
        
        // First try using any existing dialog system
        if (window.game && window.game.showDialog) {
            window.game.showDialog(text);
            return;
        }
        
        // Fallback: check for dialog box in DOM
        const dialogBox = document.getElementById('dialog-text') || document.getElementById('dialog-box');
        if (dialogBox) {
            dialogBox.innerText = text;
            
            // Make sure it's visible
            const dialogContainer = dialogBox.parentElement;
            if (dialogContainer && dialogContainer.style) {
                dialogContainer.style.display = 'block';
            }
            
            // Auto-hide after a delay
            setTimeout(() => {
                if (dialogContainer && dialogContainer.style) {
                    dialogContainer.style.display = 'block'; // Keep it visible
                }
            }, 3000);
            
            return;
        }
        
        // Last resort - show in console
        console.log("DIALOG: " + text);
    }

    // Update processInteraction method to show dialog messages
    processInteraction(object) {
        console.log("Processing interaction with:", object);
        
        if (!object || !this.activeCommand) {
            return;
        }
        
        // Handle NPC interactions
        if (object.type === 'npc' || (object.id && this.findNPC(object.id))) {
            const npc = object.type === 'npc' ? object : this.findNPC(object.id);
            
            if (npc && npc.interactions && npc.interactions[this.activeCommand]) {
                const message = npc.interactions[this.activeCommand];
                this.showDialog(message);
                
                // Make NPC face the player
                if (npc.x && npc.y) {
                    // Calculate direction based on player position
                    const dx = this.playerPosition.x - npc.x;
                    const dy = this.playerPosition.y - npc.y;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        npc.facing = dx > 0 ? 'right' : 'left';
                    } else {
                        npc.facing = dy > 0 ? 'down' : 'up';
                    }
                    
                    // Make NPC "speak" briefly
                    npc.speaking = message;
                    
                    // Clear speech bubble after a delay
                    setTimeout(() => {
                        if (npc) npc.speaking = null;
                        this.drawCurrentScene();
                    }, 5000);
                }
                
                return;
            }
        }
        
        // Handle basic interaction logic for objects
        if (object.interactions && object.interactions[this.activeCommand]) {
            const message = object.interactions[this.activeCommand];
            console.log(message);
            this.showDialog(message);
            
            // Special handling for doors
            if (object.type === 'door' && this.activeCommand === 'use' && object.target) {
                console.log(`Transitioning to ${object.target}`);
                this.currentScene = object.target;
                
                // Load the new scene if the method exists
                if (this.loadScene) {
                    setTimeout(() => this.loadScene(object.target), 500);
                }
            }
        } else {
            const message = `Cannot ${this.activeCommand} that.`;
            console.log(message);
            this.showDialog(message);
        }
    }

    // Optimize major performance bottlenecks
    drawCurrentScene() {
        try {
            const ctx = this.offscreenCtx || this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Use our new 3D scene renderer
            this._draw3DScene(ctx, this.currentScene);
            
            // Get current scene data from GameData if available
            const sceneData = window.GAME_DATA?.scenes?.[this.currentScene];
            if (sceneData) {
                // Draw hotspots if they exist in the scene data
                if (sceneData.hotspots && this.debugMode) {
                    this._drawHotspots(ctx, sceneData.hotspots);
                }
            }
            
            // Draw NPCs if they exist for this scene
            if (this.npcs && this.npcs[this.currentScene]) {
                this._drawNPCs(ctx);
            }
            
            // Draw player character
            this._drawPlayer(ctx);
            
            // Draw ambient animations
            if (this.drawAmbientAnimations) {
                this.drawAmbientAnimations();
            }
            
            // Draw UI elements or overlays
            if (this._drawUI) {
                this._drawUI(ctx);
            }
            
        } catch (error) {
            console.error("Error drawing scene:", error);
            
            // Last resort fallback - draw something rather than nothing
            try {
                const ctx = this.offscreenCtx || this.ctx;
                ctx.fillStyle = '#333333';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                ctx.fillStyle = '#FF0000';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("Error rendering scene", this.canvas.width / 2, this.canvas.height / 2);
            } catch (finalError) {
                console.error("Critical rendering error:", finalError);
            }
        }
    }

    // Add helper method for drawing fallback scenes
    _drawFallbackScene(ctx, sceneId) {
        switch (sceneId) {
            case 'officeArea':
                // Office area background - blue walls with wood floor
                ctx.fillStyle = '#27408B'; // Royal blue for walls
                ctx.fillRect(0, 0, this.canvas.width, 300);
                
                ctx.fillStyle = '#8B4513'; // Brown wood floor
                ctx.fillRect(0, 300, this.canvas.width, this.canvas.height - 300);
                
                // Draw multiple desks
                for (let i = 0; i < 4; i++) {
                    // Desk
                    ctx.fillStyle = '#A0522D'; // Sienna brown for desks
                    ctx.fillRect(100 + i * 160, 320, 120, 60);
                    
                    // Computer on desk
                    ctx.fillStyle = '#2F4F4F'; // Dark slate gray
                    ctx.fillRect(120 + i * 160, 310, 40, 30);
                    
                    // Screen
                    ctx.fillStyle = '#87CEEB'; // Sky blue
                    ctx.fillRect(125 + i * 160, 315, 30, 20);
                    
                    // Chair
                    ctx.fillStyle = '#000000'; // Black
                    ctx.fillRect(140 + i * 160, 390, 40, 40);
                }
                
                // Filing cabinets along the wall
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = '#708090'; // Slate gray
                    ctx.fillRect(50 + i * 100, 100, 70, 150);
                    
                    // Drawer handles
                    ctx.fillStyle = '#C0C0C0'; // Silver
                    for (let j = 0; j < 3; j++) {
                        ctx.fillRect(95 + i * 100, 120 + j * 40, 15, 5);
                    }
                }
                
                // Coffee machine in corner
                ctx.fillStyle = '#000000'; // Black
                ctx.fillRect(700, 230, 50, 70);
                ctx.fillStyle = '#FF0000'; // Red
                ctx.fillRect(715, 250, 20, 10);
                ctx.fillStyle = '#4682B4'; // Steel blue
                ctx.fillRect(710, 270, 30, 10);
                
                // Door to main lobby
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.fillRect(400, 200, 80, 100);
                ctx.fillStyle = '#FFD700'; // Gold handle
                ctx.fillRect(460, 250, 10, 10);
                
                // Sign on wall
                ctx.fillStyle = '#FFFFFF'; 
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("DETECTIVE OFFICE", this.canvas.width / 2, 50);
                break;
                
            case 'policeStation':
                // Police Station - simplified version
                ctx.fillStyle = '#87CEEB'; // Sky blue
                ctx.fillRect(0, 0, this.canvas.width, 300);
                
                ctx.fillStyle = '#8B4513'; // Wood brown
                ctx.fillRect(0, 300, this.canvas.width, this.canvas.height - 300);
                
                // Building
                ctx.fillStyle = '#D3D3D3'; // Light gray
                ctx.fillRect(150, 100, 500, 200);
                
                // Door
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.fillRect(350, 200, 100, 100);
                
                // Windows
                ctx.fillStyle = '#ADD8E6'; // Light blue
                ctx.fillRect(200, 150, 80, 80);
                ctx.fillRect(500, 150, 80, 80);
                
                // Sign
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("POLICE STATION", 400, 80);
                break;
                
            case 'downtown':
                // Downtown - simplified version
                ctx.fillStyle = '#87CEEB'; // Sky blue
                ctx.fillRect(0, 0, this.canvas.width, 200);
                
                ctx.fillStyle = '#708090'; // Slate gray for street
                ctx.fillRect(0, 400, this.canvas.width, this.canvas.height - 400);
                
                // Buildings
                for (let i = 0; i < 4; i++) {
                    const height = 150 + Math.random() * 100;
                    ctx.fillStyle = i % 2 ? '#A0A0A0' : '#808080';
                    ctx.fillRect(i * 200, 200, 180, height);
                    
                    // Windows
                    ctx.fillStyle = '#FFFF00'; // Yellow windows 
                    for (let j = 0; j < 3; j++) {
                        for (let k = 0; k < 4; k++) {
                            if (Math.random() > 0.3) { // Some windows are dark
                                ctx.fillRect(i * 200 + 20 + j * 50, 220 + k * 40, 30, 20);
                            }
                        }
                    }
                }
                
                // Street markings
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(0, 450);
                ctx.lineTo(this.canvas.width, 450);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.setLineDash([20, 20]);
                ctx.moveTo(0, 500);
                ctx.lineTo(this.canvas.width, 500);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            default:
                // Default scene
                const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#4B6CB7');
                gradient.addColorStop(1, '#182848');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Grid pattern
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                
                // Draw grid lines
                for (let i = 0; i < this.canvas.width; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, this.canvas.height);
                    ctx.stroke();
                }
                
                for (let i = 0; i < this.canvas.height; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(this.canvas.width, i);
                    ctx.stroke();
                }
                
                // Display scene name
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Scene: ${sceneId || "Unknown"}`, this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    // Add helper method for drawing hotspots
    _drawHotspots(ctx, hotspots) {
        if (!hotspots || !Array.isArray(hotspots)) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        
        hotspots.forEach(hotspot => {
            if (hotspot.x !== undefined && hotspot.y !== undefined) {
                const width = hotspot.width || 50;
                const height = hotspot.height || 50;
                
                ctx.strokeRect(hotspot.x, hotspot.y, width, height);
                
                // Add label
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(hotspot.x, hotspot.y - 20, Math.min(width, 200), 20);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(hotspot.name || "Hotspot", hotspot.x + 5, hotspot.y - 5);
            }
        });
        
        ctx.restore();
    }

    // Add helper method for drawing NPCs
    _drawNPCs(ctx) {
        const npcs = this.npcs[this.currentScene];
        if (!npcs || !Array.isArray(npcs)) return;
        
        // Sort NPCs by y position for correct depth
        const sortedNPCs = [...npcs].sort((a, b) => a.y - b.y);
        
        sortedNPCs.forEach(npc => {
            if (!npc) return;
            
            // Draw human-like NPC instead of simple circle
            this._drawHumanCharacter(ctx, npc.x, npc.y, npc.facing || 'down', npc.type || 'civilian', npc.color);
            
            // Draw name label
            if (npc.name) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(npc.x - 40, npc.y - 50, 80, 20);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, npc.x, npc.y - 35);
            }
            
            // Draw speech bubble if NPC is talking
            if (npc.speaking) {
                this._drawSpeechBubble(ctx, npc.x, npc.y - 60, npc.speaking);
            }
        });
    }

    // Add helper method for drawing the player character
    _drawPlayer(ctx) {
        if (!this.playerPosition) return;
        
        // Use human character renderer for player too
        this._drawHumanCharacter(ctx, this.playerPosition.x, this.playerPosition.y, this.playerFacing, 'detective');
    }

    // Add helper method for drawing UI elements
    _drawUI(ctx) {
        // Currently empty - would contain HUD elements, cursor, etc.
    }

    // Fix memory leak in animation system
    updateAnimations = (deltaTime) => {
        // Avoid creating new objects in update loop
        if (!this._animationClock) this._animationClock = 0;
        this._animationClock += deltaTime;
        
        for (const [id, anim] of this.animations) {
            // Use simple counter instead of increasing elapsed
            anim.elapsed += deltaTime;
            if (anim.elapsed >= anim.duration) {
                anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
                anim.elapsed = 0;
            }
        }
    };

    // Add proper cleanup method
    destroy() {
        // Stop all loops
        this.isRunning = false;
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
            this.requestID = null;
        }
        
        // Clean up references
        this.ctx = null;
        this.offscreenCtx = null;
        this.bufferCtx = null;
        this.backContext = null;
        
        // Remove events
        if (this.canvas) {
            this.canvas.removeEventListener('click', this._handleClick);
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
        }
        
        // Clear caches
        if (this.spriteCache) this.spriteCache.clear();
        if (this.colorCache) this.colorCache.clear();
    }

    // Remove duplicate drawWallDecorations method
    drawWallDecorations = (ctx) => {
        // ...existing code...
    };

    // Remove duplicate drawAmbientAnimations method
    drawAmbientAnimations = () => {
        // ...existing code...
    };

    // Optimize draw method to use requestAnimationFrame
    draw = (ctx) => {
        if (!this.isRunning) return;
        
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

        requestAnimationFrame(() => this.draw(ctx));
    };

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
        this.accumulator += deltaTime;
        
        // Update animation frame counter
        this.animationFrame++;

        while (this.accumulator >= this.frameInterval) {
            // Update game state with proper delta time
            this.update(this.frameInterval / 1000);
            this.accumulator -= this.frameInterval;
        }

        // Render to offscreen canvas
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCurrentScene();

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

    // Additional methods for handling interactions
    handleInteraction(hotspot, inventory) {
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

    // Add to inventory functionality
    addToInventory(item) {
        if (!window.GAME_DATA.inventory) {
            window.GAME_DATA.inventory = [];
        }
        
        if (!window.GAME_DATA.inventory.includes(item)) {
            window.GAME_DATA.inventory.push(item);
            console.log(item + ' added to inventory.');
        } else {
            console.log(item + ' is already in your inventory.');
        }
    }
    
    // Adding the missing loadScene method
    loadScene(sceneId) {
        try {
            // Validate scene ID
            if (!sceneId) {
                console.error('No scene ID provided');
                sceneId = 'policeStation'; // Default scene as fallback
            }

            console.log(`Loading scene: ${sceneId}`);

            // Stop current background music and animations
            if (window.soundManager) {
                if (this.stopBackgroundMusic) {
                    this.stopBackgroundMusic();
                } else if (window.soundManager.stopBackgroundMusic) {
                    window.soundManager.stopBackgroundMusic();
                }
            }

            // Reset all state
            if (this.clear) {
                this.clear();
            } else {
                // Fallback if clear method isn't defined
                if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (this.offscreenCtx) this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
            }
            
            this.collisionObjects = [];
            
            // Initialize NPCs array for this scene if it doesn't exist
            if (!this.npcs[sceneId]) {
                this.npcs[sceneId] = [];
            }
            
            // Reset ambient animations if they exist
            if (this.ambientAnimations) {
                Object.keys(this.ambientAnimations).forEach(key => {
                    this.ambientAnimations[key].active = false;
                });
            }

            // Update current scene
            this.currentScene = sceneId;
            
            // Set default player position for new scene
            const defaultY = this.floorLevel ? this.floorLevel.min + 50 : 350;
            this.playerPosition = { x: 400, y: defaultY };
            
            // Reset movement state
            this.isWalking = false;
            this.walkTarget = null;
            
            // Setup scene components if the methods exist
            if (this.setupAmbientAnimations) {
                this.setupAmbientAnimations(this.currentScene);
            }
            
            if (this.updateCollisionObjects) {
                this.updateCollisionObjects();
            }
            
            if (this.initializeNPCsForScene) {
                this.initializeNPCsForScene(sceneId);
            }
            
            // Draw the new scene
            requestAnimationFrame(() => {
                if (this.drawCurrentScene) {
                    this.drawCurrentScene();
                }
                
                // Start scene music after scene is drawn
                if (window.soundManager && this.startBackgroundMusic) {
                    this.startBackgroundMusic();
                }
            });
            
            console.log(`Scene loaded successfully: ${this.currentScene}`);
        } catch (error) {
            console.error("Error loading scene:", error);
            console.error("Stack trace:", error.stack);
            if (this.showDialog) {
                this.showDialog("Error loading scene. Please try again.");
            }
        }
    }

    // Add the clear method that's referenced in loadScene
    clear() {
        // Clear all canvas contexts if they exist
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.bufferCtx) this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        if (this.backContext) this.backContext.clearRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        if (this.offscreenCtx) this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    // Add a stub update method needed for the game loop
    update(deltaTime = 1/60) {
        // Reduce logging - only log occasionally for debug purposes
        if (Math.random() < 0.01) { // Log only 1% of the time
            console.log("Game state update running");
        }
        
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
                if (this.checkCollision) {
                    const hitObject = this.checkCollision(this.playerPosition.x, this.playerPosition.y);
                    if (hitObject && this.processInteraction) {
                        this.processInteraction(hitObject);
                    }
                }
            } else {
                // Move player towards target
                const speed = 5; // pixels per frame
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
        
        // Update NPCs if the method exists
        if (this.updateNPCs) {
            this.updateNPCs(deltaTime);
        }
    }

    handleMovement(direction) {
        if (!direction || !this.playerPosition) return;
        
        console.log(`Moving player ${direction}`);
        
        // Store original position to revert if collision occurs
        const oldX = this.playerPosition.x;
        const oldY = this.playerPosition.y;
        
        // Set facing direction
        this.playerFacing = direction;
        this.isWalking = true;
        
        // Calculate new position based on direction
        const moveSpeed = 10;
        switch (direction) {
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
        
        // Check if new position is within bounds
        const minX = 20;
        const maxX = this.canvas.width / (window.devicePixelRatio || 1) - 20;
        const minY = this.floorLevel ? this.floorLevel.min : 300;
        const maxY = this.floorLevel ? this.floorLevel.max : 450;
        
        // Keep player within bounds
        this.playerPosition.x = Math.max(minX, Math.min(this.playerPosition.x, maxX));
        this.playerPosition.y = Math.max(minY, Math.min(this.playerPosition.y, maxY));
        
        // Check for collisions
        if (this.checkCollision) {
            const collision = this.checkCollision(this.playerPosition.x, this.playerPosition.y);
            if (collision) {
                // If there's a collision with a solid object, revert movement
                if (collision.solid) {
                    this.playerPosition.x = oldX;
                    this.playerPosition.y = oldY;
                }
                
                // Check if we should interact with the object
                if (this.activeCommand === 'use' && this.processInteraction) {
                    this.processInteraction(collision);
                }
            }
        }
        
        // Update the scene
        this.drawCurrentScene();
        
        // Reset walking state after a short delay
        setTimeout(() => {
            this.isWalking = false;
            this.drawCurrentScene();
        }, 100);
    }

    updateCollisionObjects() {
        // Clear existing collision objects
        this.collisionObjects = [];
        
        // Add scene-specific objects
        switch(this.currentScene) {
            case 'officeArea':
                // Detective desks
                for (let i = 0; i < 4; i++) {
                    this.collisionObjects.push({
                        x: 100 + i * 160, 
                        y: 320, 
                        width: 120, 
                        height: 60,
                        type: 'desk',
                        id: 'detectiveDesk' + (i+1),
                        solid: true,
                        interactions: {
                            look: `Detective desk ${i+1}. Papers are neatly organized with case files.`,
                            talk: "Talking to a desk won't help solve cases.",
                            use: i === 0 ? "You search through the papers and find the case file on the downtown burglaries." : "Nothing of interest on this desk.",
                            take: "The desk belongs to the police department."
                        }
                    });
                }
                
                // Filing cabinets
                for (let i = 0; i < 3; i++) {
                    this.collisionObjects.push({
                        x: 50 + i * 100, 
                        y: 100, 
                        width: 70, 
                        height: 150,
                        type: 'object',
                        id: 'filingCabinet' + (i+1),
                        solid: true,
                        interactions: {
                            look: "A filing cabinet containing various case records.",
                            use: i === 1 ? "You find some interesting records about previous similar burglaries." : "Just routine case files, nothing relevant to your current investigation.",
                            take: "The filing cabinet is too heavy and belongs to the department."
                        }
                    });
                }
                
                // Coffee machine
                this.collisionObjects.push({
                    x: 700, 
                    y: 230, 
                    width: 50, 
                    height: 70,
                    type: 'object',
                    id: 'coffeeMachine',
                    interactions: {
                        look: "An office coffee machine. Keeps detectives running.",
                        use: "You make yourself a cup of coffee. The caffeine helps you focus.",
                        take: "The coffee machine is department property and too hot to carry."
                    }
                });
                
                // Door to main lobby
                this.collisionObjects.push({
                    x: 400, 
                    y: 200, 
                    width: 80, 
                    height: 100,
                    type: 'door',
                    id: 'lobbyDoor',
                    target: 'policeStation',
                    interactions: {
                        look: "Door leading to the main lobby of the police station.",
                        use: "You head to the police station lobby.",
                        talk: "It's a door. It doesn't respond."
                    }
                });
                break;
                
            case 'policeStation':
                // Reception desk
                this.collisionObjects.push({
                    x: 350, 
                    y: 320, 
                    width: 150, 
                    height: 50,
                    type: 'desk',
                    id: 'receptionDesk',
                    solid: true,
                    interactions: {
                        look: "A standard police station reception desk.",
                        talk: "There's no one at the desk at the moment.",
                        use: "There's a visitor log on the desk.",
                        take: "You can't take the desk."
                    }
                });
                
                // Exit door
                this.collisionObjects.push({
                    x: 350, 
                    y: 200, 
                    width: 100, 
                    height: 100,
                    type: 'door',
                    id: 'exitDoor',
                    target: 'downtown',
                    interactions: {
                        look: "The exit door leading downtown.",
                        use: "You head outside to downtown.",
                        talk: "It's a door. It doesn't talk back."
                    }
                });
                
                // Office Area door
                this.collisionObjects.push({
                    x: 100, 
                    y: 200, 
                    width: 80, 
                    height: 100,
                    type: 'door',
                    id: 'officeAreaDoor',
                    target: 'officeArea',
                    interactions: {
                        look: "Door to the detective office area.",
                        use: "You head to the detective office area.",
                        talk: "It's a door. It doesn't respond."
                    }
                });
                
                // Notice board
                this.collisionObjects.push({
                    x: 600, 
                    y: 150, 
                    width: 100, 
                    height: 80,
                    type: 'object',
                    id: 'noticeBoard',
                    interactions: {
                        look: "A notice board with various wanted posters and police announcements.",
                        use: "You scan through the notices and see that there have been several electronics store break-ins this month.",
                        take: "The notice board is mounted to the wall."
                    }
                });
                
                // Office chair
                this.collisionObjects.push({
                    x: 300, 
                    y: 350, 
                    width: 40, 
                    height: 40,
                    type: 'object',
                    id: 'chair',
                    interactions: {
                        look: "An office chair for the receptionist.",
                        use: "You shouldn't sit on this chair. It belongs to the receptionist.",
                        take: "The chair won't fit in your pocket."
                    }
                });
                break;
                
            case 'downtown':
                // Electronics store
                this.collisionObjects.push({
                    x: 200, 
                    y: 300, 
                    width: 180, 
                    height: 100,
                    type: 'building',
                    id: 'electronicsStore',
                    interactions: {
                        look: "An electronics store. The window appears to be broken.",
                        use: "You examine the broken window more closely. There are tool marks on the window frame indicating forced entry.",
                        talk: "The store is closed due to the burglary investigation."
                    }
                });
                
                // Return to police station
                this.collisionObjects.push({
                    x: 400, 
                    y: 500, 
                    width: 100, 
                    height: 50,
                    type: 'door',
                    id: 'stationDoor',
                    target: 'policeStation',
                    interactions: {
                        look: "The way back to the police station.",
                        use: "You head back to the police station.",
                        talk: "It's a door. It doesn't talk back."
                    }
                });
                
                // Evidence - Footprint
                this.collisionObjects.push({
                    x: 250, 
                    y: 400, 
                    width: 30, 
                    height: 20,
                    type: 'evidence',
                    id: 'footprint',
                    interactions: {
                        look: "A partial footprint in the dirt. Size 11, appears to be from a work boot.",
                        use: "You take a photo of the footprint for evidence.",
                        take: "You make a plaster cast of the footprint and add it to your evidence collection."
                    }
                });
                
                // Evidence - Tool marks
                this.collisionObjects.push({
                    x: 230, 
                    y: 350, 
                    width: 20, 
                    height: 40,
                    type: 'evidence',
                    id: 'toolMarks',
                    interactions: {
                        look: "There are distinctive tool marks on the window frame, likely from a crowbar.",
                        use: "You take close-up photos of the tool marks for evidence.",
                        take: "You can't take the tool marks, but you've documented them as evidence."
                    }
                });
                break;
                
            default:
                console.log(`No collision objects defined for scene: ${this.currentScene}`);
        }
        
        console.log(`Created ${this.collisionObjects.length} collision objects for scene ${this.currentScene}`);
    }

    // Add this after the class definition but before the window.GameEngine assignment
    // Helper function for robust image loading
    _tryLoadImage(path) {
        // First try the path as-is
        const img = new Image();
        
        return new Promise((resolve, reject) => {
            // Set up timeout to fail gracefully after 5 seconds
            const timeoutId = setTimeout(() => {
                console.warn(`Image load timed out: ${path}`);
                reject(new Error('Image load timed out'));
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeoutId);
                console.warn(`Failed to load image: ${path}, will use fallback.`);
                reject(new Error(`Failed to load image: ${path}`));
            };
            
            // Try to load the image
            img.src = path;
        });
    }

    // Add these new methods for 3D rendering to the GameEngine class
    _draw3DScene(ctx, sceneId) {
        // This is our new Sierra-style 3D scene renderer
        switch(sceneId) {
            case 'officeArea':
                this._draw3DOfficeScene(ctx);
                break;
            case 'policeStation':
                this._draw3DPoliceStationScene(ctx);
                break;
            case 'downtown':
                this._draw3DDowntownScene(ctx);
                break;
            default:
                // Fall back to 2D rendering for unsupported scenes
                this._drawFallbackScene(ctx, sceneId);
        }
    }

    _draw3DOfficeScene(ctx) {
        // Clear the canvas first
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ceiling (upper part)
        const ceilingGradient = ctx.createLinearGradient(0, 0, 0, 150);
        ceilingGradient.addColorStop(0, '#1E3B70');
        ceilingGradient.addColorStop(1, '#27408B');
        ctx.fillStyle = ceilingGradient;
        ctx.fillRect(0, 0, this.canvas.width, 150);
        
        // Draw perspective walls with vanishing point
        this._drawWallsWithPerspective(ctx, '#2E4D8E', '#27408B');
        
        // Draw floor with perspective grid
        this._drawFloorWithGrid(ctx, '#8B4513', '#5E2F0D', 300);
        
        // Draw desks in perspective
        this._drawDesksInPerspective(ctx);
        
        // Draw filing cabinets with shadows
        this._drawFilingCabinets(ctx);
        
        // Draw door with proper perspective
        this._drawPerspectiveDoor(ctx, 400, 200, 80, 100, '#8B4513');
        
        // Draw office window with view
        this._drawOfficeWindow(ctx, 550, 100, 150, 120);
        
        // Draw office sign
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("DETECTIVE OFFICE", this.canvas.width / 2, 50);
    }

    _draw3DPoliceStationScene(ctx) {
        // Clear the canvas first
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient for exterior view through windows
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 200);
        skyGradient.addColorStop(0, '#6CA0F6');
        skyGradient.addColorStop(1, '#87CEEB');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, 200);
        
        // Draw perspective walls
        this._drawWallsWithPerspective(ctx, '#E8E8E8', '#D0D0D0');
        
        // Draw floor with perspective grid
        this._drawFloorWithGrid(ctx, '#8B4513', '#5E2F0D', 300);
        
        // Draw reception desk with perspective
        this._drawReceptionDesk(ctx);
        
        // Draw exit door with proper perspective
        this._drawPerspectiveDoor(ctx, 350, 200, 100, 100, '#8B4513');
        
        // Draw door to office area
        this._drawPerspectiveDoor(ctx, 100, 200, 80, 100, '#8B4513');
        
        // Draw notice board
        this._drawNoticeBoard(ctx, 600, 150, 100, 80);
        
        // Draw police station sign
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("POLICE STATION", this.canvas.width / 2, 50);
    }

    _draw3DDowntownScene(ctx) {
        // Clear the canvas first
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 250);
        skyGradient.addColorStop(0, '#1E90FF');
        skyGradient.addColorStop(1, '#87CEEB');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, 250);
        
        // Draw buildings with perspective
        this._drawPerspectiveBuildings(ctx);
        
        // Draw street with perspective
        this._drawPerspectiveStreet(ctx);
        
        // Draw street lamps
        this._drawStreetLamps(ctx);
        
        // Draw electronics store (crime scene)
        this._drawElectronicsStore(ctx);
    }

    _drawWallsWithPerspective(ctx, topColor, bottomColor) {
        // Left wall with perspective
        const leftWallGradient = ctx.createLinearGradient(0, 150, 0, 300);
        leftWallGradient.addColorStop(0, topColor);
        leftWallGradient.addColorStop(1, bottomColor);
        ctx.fillStyle = leftWallGradient;
        
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(100, 180);  // Perspective point
        ctx.lineTo(100, 300);
        ctx.lineTo(0, 300);
        ctx.closePath();
        ctx.fill();
        
        // Right wall with perspective
        const rightWallGradient = ctx.createLinearGradient(this.canvas.width, 150, this.canvas.width, 300);
        rightWallGradient.addColorStop(0, topColor);
        rightWallGradient.addColorStop(1, bottomColor);
        ctx.fillStyle = rightWallGradient;
        
        ctx.beginPath();
        ctx.moveTo(this.canvas.width, 150);
        ctx.lineTo(this.canvas.width - 100, 180);  // Perspective point
        ctx.lineTo(this.canvas.width - 100, 300);
        ctx.lineTo(this.canvas.width, 300);
        ctx.closePath();
        ctx.fill();
        
        // Back wall with gradient
        const backWallGradient = ctx.createLinearGradient(0, 150, 0, 300);
        backWallGradient.addColorStop(0, topColor);
        backWallGradient.addColorStop(1, bottomColor);
        ctx.fillStyle = backWallGradient;
        
        ctx.beginPath();
        ctx.moveTo(100, 180);
        ctx.lineTo(this.canvas.width - 100, 180);
        ctx.lineTo(this.canvas.width - 100, 300);
        ctx.lineTo(100, 300);
        ctx.closePath();
        ctx.fill();
    }

    _drawFloorWithGrid(ctx, floorColor, gridColor, floorY) {
        // Main floor
        ctx.fillStyle = floorColor;
        ctx.fillRect(0, floorY, this.canvas.width, this.canvas.height - floorY);
        
        // Draw perspective grid
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        // Vanishing point
        const vanishingX = this.canvas.width / 2;
        const vanishingY = 250; // Slightly below middle
        
        // Horizontal grid lines
        for (let y = floorY; y <= this.canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Perspective lines coming from vanishing point
        for (let x = 0; x <= this.canvas.width; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, floorY);
            ctx.lineTo(vanishingX, vanishingY);
            ctx.stroke();
        }
    }

    _drawDesksInPerspective(ctx) {
        // Draw 4 desks in perspective
        for (let i = 0; i < 4; i++) {
            // Adjust desk position based on perspective
            const x = 120 + i * 150;
            const y = 320 + (i * 10); // Farther desks appear higher
            const width = 120 - (i * 5); // Farther desks appear smaller
            const depth = 60 - (i * 3);
            
            // Desk top
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(x, y, width, depth);
            
            // Desk front panel
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(x, y + depth);
            ctx.lineTo(x + width, y + depth);
            ctx.lineTo(x + width, y + depth + 30);
            ctx.lineTo(x, y + depth + 30);
            ctx.closePath();
            ctx.fill();
            
            // Draw computer on desk
            this._drawComputerOnDesk(ctx, x + 20, y - 20, 50 - (i * 2), 30 - (i * 1));
            
            // Draw papers or files
            ctx.fillStyle = '#F5F5F5';
            ctx.fillRect(x + 80, y + 10, 30 - (i * 1), 40 - (i * 2));
            
            // Draw chair
            this._drawOfficeChair(ctx, x + 40, y + 70, 40 - (i * 2));
        }
    }

    _drawComputerOnDesk(ctx, x, y, width, height) {
        // Monitor
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(x, y, width, height);
        
        // Screen
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        
        // Computer base
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(x + 10, y + height, width - 20, 10);
        
        // Keyboard
        ctx.fillStyle = '#4F4F4F';
        ctx.fillRect(x + 5, y + height + 12, width, 8);
    }

    _drawOfficeChair(ctx, x, y, size) {
        // Chair base
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, size, size);
        
        // Chair back
        ctx.fillStyle = '#0F0F0F';
        ctx.fillRect(x + 5, y - 30, size - 10, 30);
    }

    _drawFilingCabinets(ctx) {
        for (let i = 0; i < 3; i++) {
            const x = 50 + i * 100;
            const y = 100;
            const width = 70;
            const height = 150;
            
            // Cabinet body
            ctx.fillStyle = '#708090';
            ctx.fillRect(x, y, width, height);
            
            // Drawer lines
            ctx.strokeStyle = '#505050';
            ctx.lineWidth = 2;
            for (let j = 1; j < 4; j++) {
                const drawerY = y + (height / 4) * j;
                ctx.beginPath();
                ctx.moveTo(x, drawerY);
                ctx.lineTo(x + width, drawerY);
                ctx.stroke();
            }
            
            // Drawer handles
            ctx.fillStyle = '#C0C0C0';
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(x + width - 20, y + 20 + j * 40, 15, 5);
            }
            
            // Add shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(x + width, y + 5, 10, height);
        }
    }

    _drawPerspectiveDoor(ctx, x, y, width, height, color) {
        // Door frame
        ctx.fillStyle = '#5E3A1A';
        ctx.fillRect(x - 5, y - 5, width + 10, height + 5);
        
        // Door
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + width - 20, y + height/2, 10, 10);
        
        // Add 3D effect
        ctx.strokeStyle = '#5E3A1A';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Add shadow
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
    }

    _drawOfficeWindow(ctx, x, y, width, height) {
        // Window frame
        ctx.fillStyle = '#5E3A1A';
        ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
        
        // Window glass with city view
        const windowGradient = ctx.createLinearGradient(0, y, 0, y + height);
        windowGradient.addColorStop(0, '#87CEEB');
        windowGradient.addColorStop(0.6, '#B0E0E6');
        windowGradient.addColorStop(1, '#4682B4');
        ctx.fillStyle = windowGradient;
        ctx.fillRect(x, y, width, height);
        
        // City skyline silhouette
        ctx.fillStyle = '#191970';
        ctx.beginPath();
        // Draw a simplified city skyline
        ctx.moveTo(x, y + height);
        ctx.lineTo(x, y + height - 30);
        ctx.lineTo(x + 20, y + height - 40);
        ctx.lineTo(x + 30, y + height - 70);
        ctx.lineTo(x + 40, y + height - 60);
        ctx.lineTo(x + 60, y + height - 90);
        ctx.lineTo(x + 80, y + height - 70);
        ctx.lineTo(x + 100, y + height - 100);
        ctx.lineTo(x + 120, y + height - 60);
        ctx.lineTo(x + 140, y + height - 80);
        ctx.lineTo(x + width, y + height - 40);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        
        // Window dividers
        ctx.strokeStyle = '#5E3A1A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Horizontal divider
        ctx.moveTo(x, y + height/2);
        ctx.lineTo(x + width, y + height/2);
        // Vertical divider
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2, y + height);
        ctx.stroke();
        
        // Reflection effect
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + width - 10, y + 10);
        ctx.lineTo(x + width - 30, y + 40);
        ctx.lineTo(x + 30, y + 40);
        ctx.closePath();
        ctx.fill();
    }

    _drawReceptionDesk(ctx) {
        // Main desk surface
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(300, 320);
        ctx.lineTo(500, 320);
        ctx.lineTo(520, 340);
        ctx.lineTo(280, 340);
        ctx.closePath();
        ctx.fill();
        
        // Front panel
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(280, 340);
        ctx.lineTo(520, 340);
        ctx.lineTo(520, 380);
        ctx.lineTo(280, 380);
        ctx.closePath();
        ctx.fill();
        
        // Desktop items
        // Computer
        this._drawComputerOnDesk(ctx, 350, 300, 50, 30);
        
        // Papers
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(430, 325, 40, 10);
        
        // Desk sign
        ctx.fillStyle = '#F0E68C';
        ctx.fillRect(400, 310, 70, 15);
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("RECEPTION", 435, 322);
    }

    _drawNoticeBoard(ctx, x, y, width, height) {
        // Notice board background
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, width, height);
        
        // Cork board
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        
        // Notices (random colored papers)
        const colors = ['#FFFF99', '#99FFFF', '#FF99FF', '#99FF99'];
        const papers = [
            {x: x + 10, y: y + 10, w: 30, h: 20, color: colors[0]},
            {x: x + 45, y: y + 15, w: 30, h: 25, color: colors[1]},
            {x: x + 15, y: y + 40, w: 35, h: 20, color: colors[2]},
            {x: x + 55, y: y + 50, w: 25, h: 15, color: colors[3]}
        ];
        
        papers.forEach(paper => {
            ctx.fillStyle = paper.color;
            ctx.fillRect(paper.x, paper.y, paper.w, paper.h);
            
            // Add lines to simulate text
            ctx.fillStyle = '#333333';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(paper.x + 3, paper.y + 5 + (i * 5), paper.w - 6, 1);
            }
        });
        
        // Pushpins
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x + 10 + 15, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(x + 45 + 15, y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawPerspectiveBuildings(ctx) {
        // Vanishing point for perspective
        const vanishingX = this.canvas.width / 2;
        const vanishingY = 180;
        
        // Draw several buildings in perspective
        const buildings = [
            {x: 0, width: 200, height: 250, color: '#A0A0A0'},
            {x: 200, width: 180, height: 220, color: '#909090'},
            {x: 380, width: 230, height: 270, color: '#808080'},
            {x: 610, width: 190, height: 240, color: '#707070'}
        ];
        
        buildings.forEach(building => {
            // Calculate perspective adjustment
            const distFromCenter = Math.abs(building.x + building.width/2 - vanishingX);
            const perspFactor = 0.5 - (distFromCenter / this.canvas.width) * 0.3;
            const topY = 250 - building.height * perspFactor;
            
            // Building body
            ctx.fillStyle = building.color;
            ctx.beginPath();
            ctx.moveTo(building.x, 400);
            ctx.lineTo(building.x, topY);
            ctx.lineTo(building.x + building.width, topY);
            ctx.lineTo(building.x + building.width, 400);
            ctx.closePath();
            ctx.fill();
            
            // Windows
            ctx.fillStyle = '#FFFF77';
            const windowRows = 6;
            const windowCols = 5;
            const windowWidth = building.width / (windowCols + 1);
            const windowHeight = (400 - topY) / (windowRows + 1);
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    // Some windows are dark (random)
                    if (Math.random() > 0.3) {
                        const windowX = building.x + (col + 1) * windowWidth;
                        const windowY = topY + (row + 1) * windowHeight;
                        ctx.fillRect(windowX, windowY, windowWidth * 0.6, windowHeight * 0.7);
                    }
                }
            }
        });
        
        // Electronics store (highlighted)
        this._drawElectronicsStore(ctx);
    }

    _drawElectronicsStore(ctx) {
        // Electronics store is highlighted with different color
        ctx.fillStyle = '#4A6F8A';
        ctx.fillRect(200, 300, 180, 100);
        
        // Store sign
        ctx.fillStyle = '#30D5C8';
        ctx.fillRect(220, 310, 140, 25);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("ELECTRONICS", 290, 328);
        
        // Broken window
        ctx.fillStyle = '#000000';
        ctx.fillRect(230, 350, 120, 40);
        
        // Broken glass effect
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        
        // Draw random broken glass lines
        for (let i = 0; i < 8; i++) {
            const startX = 230 + Math.random() * 120;
            const startY = 350 + Math.random() * 40;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + (Math.random() - 0.5) * 40, startY + (Math.random() - 0.5) * 30);
            ctx.stroke();
        }
        
        // Crime scene tape
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(190, 380);
        ctx.lineTo(390, 380);
        ctx.stroke();
        
        // Stripes on tape
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        for (let x = 195; x < 390; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, 378);
            ctx.lineTo(x + 5, 382);
            ctx.stroke();
        }
    }

    _drawPerspectiveStreet(ctx) {
        // Street pavement
        const streetGradient = ctx.createLinearGradient(0, 400, 0, this.canvas.height);
        streetGradient.addColorStop(0, '#555555');
        streetGradient.addColorStop(1, '#333333');
        ctx.fillStyle = streetGradient;
        ctx.fillRect(0, 400, this.canvas.width, this.canvas.height - 400);
        
        // Sidewalk
        ctx.fillStyle = '#999999';
        ctx.fillRect(0, 400, this.canvas.width, 20);
        
        // Street center line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.setLineDash([40, 20]);
        ctx.beginPath();
        ctx.moveTo(0, 450);
        ctx.lineTo(this.canvas.width, 450);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Add some street texture
        ctx.fillStyle = '#444444';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.canvas.width;
            const y = 420 + Math.random() * (this.canvas.height - 420);
            const size = 2 + Math.random() * 5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawStreetLamps(ctx) {
        // Draw a few street lamps
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 300;
            
            // Lamp post
            ctx.fillStyle = '#333333';
            ctx.fillRect(x - 3, 400, 6, -100);
            
            // Lamp head
            ctx.fillStyle = '#555555';
            ctx.fillRect(x - 15, 300, 30, 15);
            
            // Light
            ctx.fillStyle = '#FFFFAA';
            ctx.beginPath();
            ctx.arc(x, 310, 8, 0, Math.PI, true);
            ctx.closePath();
            ctx.fill();
            
            // Light effect
            const glowGradient = ctx.createRadialGradient(x, 310, 0, x, 310, 40);
            glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
            glowGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, 310, 40, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add new method to draw human characters
    _drawHumanCharacter(ctx, x, y, facing = 'down', characterType = 'civilian', customColor = null) {
        // Create a more detailed human character with proper proportions
        ctx.save();
        
        // Different character types have different colors/uniforms
        let skinColor = '#FFD8B1';
        let hairColor = '#8B4513';
        let shirtColor = customColor || '#3333FF';
        let pantsColor = '#000080';
        
        if (characterType === 'detective') {
            shirtColor = '#8B4513'; // Brown coat
            pantsColor = '#000000'; // Black pants
        } else if (characterType === 'officer') {
            shirtColor = '#000080'; // Navy blue uniform
            pantsColor = '#000044'; // Darker blue pants
        } else if (characterType === 'civilian') {
            // Random civilian clothes if no custom color provided
            if (!customColor) {
                const colors = ['#CC0000', '#00CC00', '#0000CC', '#CCCC00', '#CC00CC'];
                shirtColor = colors[Math.floor(Math.random() * colors.length)];
            }
        }
        
        // Animation offset based on walk cycle
        const walkCycle = this.animationFrame % 20;
        const walkOffset = (walkCycle < 10) ? Math.sin(walkCycle * Math.PI / 10) * 2 : 0;
        
        // Base body positions - adjusted based on facing direction
        let headY = y - 35;
        let bodyY = y - 20;
        let legsY = y;
        
        switch(facing) {
            case 'up':
                // Draw back view
                // Legs
                ctx.fillStyle = pantsColor;
                ctx.fillRect(x - 8, legsY, 6, 20);
                ctx.fillRect(x + 2, legsY, 6, 20);
                
                // Body/shirt (back)
                ctx.fillStyle = shirtColor;
                ctx.fillRect(x - 12, bodyY, 24, 20);
                
                // Head (back)
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(x, headY, 10, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'down':
                // Draw front view
                // Legs
                ctx.fillStyle = pantsColor;
                ctx.fillRect(x - 8, legsY, 6, 20);
                ctx.fillRect(x + 2, legsY, 6, 20);
                
                // Body/shirt
                ctx.fillStyle = shirtColor;
                ctx.fillRect(x - 12, bodyY, 24, 20);
                
                // Head
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.arc(x, headY, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Hair
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(x, headY - 5, 10, Math.PI, Math.PI * 2);
                ctx.fill();
                
                // Face
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(x - 3, headY, 1, 0, Math.PI * 2); // Left eye
                ctx.arc(x + 3, headY, 1, 0, Math.PI * 2); // Right eye
                ctx.fill();
                
                // Detective badge or feature for detective characters
                if (characterType === 'detective') {
                    ctx.fillStyle = '#FFD700'; // Gold
                    ctx.beginPath();
                    ctx.arc(x, bodyY + 5, 3, 0, Math.PI * 2); // Badge
                    ctx.fill();
                }
                break;
                
            case 'left':
                // Draw left profile
                // Leg
                ctx.fillStyle = pantsColor;
                ctx.fillRect(x - 5, legsY, 10, 20);
                
                // Body/shirt
                ctx.fillStyle = shirtColor;
                ctx.fillRect(x - 10, bodyY, 20, 20);
                
                // Head
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.arc(x - 2, headY, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Hair
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(x - 2, headY - 3, 9, Math.PI, Math.PI * 2);
                ctx.fill();
                
                // Face
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(x - 6, headY, 1, 0, Math.PI * 2); // Left eye
                ctx.fill();
                
                // Arm
                ctx.fillStyle = shirtColor;
                ctx.fillRect(x - 12, bodyY + 5, 5, 15);
                break;
                
            case 'right':
                // Draw right profile
                // Leg
                ctx.fillStyle = pantsColor;
                ctx.fillRect(x - 5, legsY, 10, 20);
                
                // Body/shirt
                ctx.fillStyle = shirtColor;
                ctx.fillRect(x - 10, bodyY, 20, 20);
                
                // Head
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.arc(x + 2, headY, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Hair
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(x + 2, headY - 3, 9, Math.PI, Math.PI * 2);
                ctx.fill();
                
                // Face
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(x + 6, headY, 1, 0, Math.PI * 2); // Right eye
                ctx.fill();
                
                // Arm
                ctx.fillStyle = shirtColor;
                ctx.fillRect(x + 7, bodyY + 5, 5, 15);
                break;
        }
        
        // Add shadow under character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + 20, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Add speech bubble drawing method
    _drawSpeechBubble(ctx, x, y, text) {
        const bubblePadding = 10;
        const maxWidth = 150;
        
        // Measure text
        ctx.font = '12px Arial';
        
        // Calculate bubble dimensions
        const lines = this._wrapText(text, maxWidth);
        const lineHeight = 16;
        const bubbleWidth = Math.min(maxWidth, this._getMaxLineWidth(lines, ctx)) + bubblePadding * 2;
        const bubbleHeight = lineHeight * lines.length + bubblePadding * 2;
        
        // Draw bubble
        const bubbleX = x - bubbleWidth / 2;
        const bubbleY = y - bubbleHeight - 10;
        
        // Main bubble
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        this._drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Pointer
        ctx.beginPath();
        ctx.moveTo(x, bubbleY + bubbleHeight);
        ctx.lineTo(x - 10, bubbleY + bubbleHeight - 5);
        ctx.lineTo(x + 10, bubbleY + bubbleHeight - 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        lines.forEach((line, i) => {
            ctx.fillText(line, bubbleX + bubblePadding, bubbleY + bubblePadding + i * lineHeight);
        });
    }

    // Helper method to wrap text
    _wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + ' ' + word).width;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }

    // Helper method to get max line width
    _getMaxLineWidth(lines, ctx) {
        let maxWidth = 0;
        
        lines.forEach(line => {
            const lineWidth = ctx.measureText(line).width;
            maxWidth = Math.max(maxWidth, lineWidth);
        });
        
        return maxWidth;
    }

    // Helper method to draw rounded rectangles
    _drawRoundedRect(ctx, x, y, width, height, radius) {
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
    }

    // Add NPC initialization method
    initializeNPCsForScene(sceneId) {
        console.log(`Initializing NPCs for scene: ${sceneId}`);
        
        // Clear existing NPCs for this scene
        if (!this.npcs[sceneId]) {
            this.npcs[sceneId] = [];
        } else {
            this.npcs[sceneId] = [];
        }
        
        // Add scene-specific NPCs
        switch(sceneId) {
            case 'officeArea':
                // Add Detective Johnson at his desk
                this.npcs[sceneId].push({
                    id: 'johnson',
                    name: 'Det. Johnson',
                    x: 240,
                    y: 380,
                    facing: 'down',
                    type: 'detective',
                    color: '#8B4513',
                    interactions: {
                        look: "Detective Johnson, your partner on this burglary case.",
                        talk: "Johnson: \"I've been looking at the downtown burglaries. The electronics store was hit last night. We should check it out.\"",
                        use: "You can't use your colleague!"
                    }
                });
                
                // Add Officer Rodriguez
                this.npcs[sceneId].push({
                    id: 'rodriguez',
                    name: 'Officer Rodriguez',
                    x: 600,
                    y: 350,
                    facing: 'left',
                    type: 'officer',
                    color: '#000080',
                    interactions: {
                        look: "Officer Rodriguez from patrol division.",
                        talk: "Rodriguez: \"Captain wants to see you about the downtown burglaries. The electronics store was hit last night.\"",
                        use: "You can't use a fellow officer."
                    }
                });
                
                // Add Coffee-drinking officer
                this.npcs[sceneId].push({
                    id: 'coffeeOfficer',
                    name: 'Officer Miller',
                    x: 720,
                    y: 280,
                    facing: 'left',
                    type: 'officer',
                    interactions: {
                        look: "Officer Miller is taking a coffee break.",
                        talk: "Miller: \"This coffee is terrible, but it keeps me awake on night shifts.\"",
                        use: "You can't use Officer Miller."
                    }
                });
                break;
                
            case 'policeStation':
                // Add receptionist
                this.npcs[sceneId].push({
                    id: 'receptionist',
                    name: 'Receptionist',
                    x: 400,
                    y: 310,
                    facing: 'down',
                    type: 'civilian',
                    color: '#FF69B4',
                    interactions: {
                        look: "The station receptionist.",
                        talk: "\"Good morning, Detective. The Captain wants you to check out that electronics store burglary downtown.\"",
                        use: "It would be inappropriate to use the receptionist."
                    }
                });
                
                // Add Captain
                this.npcs[sceneId].push({
                    id: 'captain',
                    name: 'Captain Richards',
                    x: 150,
                    y: 350,
                    facing: 'right',
                    type: 'officer',
                    color: '#000080',
                    interactions: {
                        look: "Captain Richards, your superior officer.",
                        talk: "Captain: \"Detective, I need you to investigate the electronics store burglary downtown immediately. It seems connected to those other break-ins this month.\"",
                        use: "You can't use your Captain!"
                    }
                });
                
                // Add Officer by door
                this.npcs[sceneId].push({
                    id: 'doorOfficer',
                    name: 'Officer Thompson',
                    x: 350,
                    y: 180,
                    facing: 'down',
                    type: 'officer',
                    interactions: {
                        look: "Officer Thompson is guarding the entrance.",
                        talk: "Thompson: \"Morning, Detective. Heading out to investigate that electronics store burglary?\"",
                        use: "You can't use Officer Thompson."
                    }
                });
                break;
                
            case 'downtown':
                // Add suspicious character
                this.npcs[sceneId].push({
                    id: 'suspiciousGuy',
                    name: '???',
                    x: 600,
                    y: 350,
                    facing: 'left',
                    type: 'civilian',
                    color: '#555555',
                    interactions: {
                        look: "A suspicious looking man watching the electronics store.",
                        talk: "\"I didn't see nothing. And I definitely wasn't here last night. You can't prove I was.\"",
                        use: "You try to search the suspicious person but don't have probable cause."
                    }
                });
                
                // Add witness
                this.npcs[sceneId].push({
                    id: 'witness',
                    name: 'Store Owner',
                    x: 230,
                    y: 320,
                    facing: 'right',
                    type: 'civilian',
                    color: '#8A2BE2',
                    interactions: {
                        look: "The owner of the electronics store.",
                        talk: "Store Owner: \"They took all my high-end smartphones and laptops! This is the third store on this street to get hit this month. Are you going to catch these thieves?\"",
                        use: "The store owner doesn't appreciate being 'used'."
                    }
                });
                
                // Add officer investigating
                this.npcs[sceneId].push({
                    id: 'forensicOfficer',
                    name: 'Forensic Tech',
                    x: 270,
                    y: 380,
                    facing: 'up',
                    type: 'officer',
                    color: '#006400',
                    interactions: {
                        look: "A forensic technician collecting evidence.",
                        talk: "Tech: \"I found some shoe prints and tool marks. Looks like the same perp as the other burglaries. I'll have a full report this afternoon.\"",
                        use: "The forensic tech is busy working."
                    }
                });
                break;
                
            default:
                console.log(`No NPCs defined for scene: ${sceneId}`);
        }
        
        console.log(`Added ${this.npcs[sceneId].length} NPCs to scene ${sceneId}`);
    }

    // Helper method to find NPC by ID
    findNPC(id) {
        if (!id || !this.currentScene || !this.npcs[this.currentScene]) {
            return null;
        }
        
        return this.npcs[this.currentScene].find(npc => npc.id === id);
    }

    // Update the checkCollision method to include NPCs
    checkCollision(x, y) {
        // Check static objects first
        if (this.collisionObjects && Array.isArray(this.collisionObjects)) {
            for (const obj of this.collisionObjects) {
                if (x >= obj.x && x <= obj.x + (obj.width || 50) &&
                    y >= obj.y && y <= obj.y + (obj.height || 50)) {
                    return obj;
                }
            }
        }
        
        // Then check NPCs
        if (this.npcs && this.npcs[this.currentScene]) {
            for (const npc of this.npcs[this.currentScene]) {
                // Use a circular collision area for NPCs
                const dx = npc.x - x;
                const dy = npc.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {  // 30 pixel radius for interaction
                    return npc;
                }
            }
        }
        
        return null;
    }

    // Add NPC animation and update logic
    updateNPCs(deltaTime) {
        if (!this.npcs || !this.npcs[this.currentScene]) {
            return;
        }
        
        for (const npc of this.npcs[this.currentScene]) {
            // Update NPC animations or behaviors here
            if (npc.walking) {
                // Handle NPC walking logic
                if (npc.walkTarget) {
                    const dx = npc.walkTarget.x - npc.x;
                    const dy = npc.walkTarget.y - npc.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If we've reached the target (or close enough), stop walking
                    if (distance < 5) {
                        npc.walking = false;
                        npc.walkTarget = null;
                    } else {
                        // Move NPC towards target
                        const speed = 2; // pixels per frame
                        const moveX = (dx / distance) * speed;
                        const moveY = (dy / distance) * speed;
                        npc.x += moveX;
                        npc.y += moveY;
                        
                        // Update NPC facing based on movement direction
                        if (Math.abs(dx) > Math.abs(dy)) {
                            npc.facing = dx > 0 ? 'right' : 'left';
                        } else {
                            npc.facing = dy > 0 ? 'down' : 'up';
                        }
                    }
                }
            }
            
            // Random idle animations occasionally
            if (!npc.walking && Math.random() < 0.002) {
                // Random direction change
                const directions = ['up', 'down', 'left', 'right'];
                npc.facing = directions[Math.floor(Math.random() * directions.length)];
            }
        }
    }
}

window.GameEngine = GameEngine;