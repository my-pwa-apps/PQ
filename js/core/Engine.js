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
        
        // Handle basic interaction logic
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
            
            // Always draw the fallback scene first, immediately
            this._drawFallbackScene(ctx, this.currentScene);
            
            // Skip the image loading process since it's causing issues
            // Instead we'll rely on the fallback scenes for now
            
            // Get current scene data from GameData if available
            const sceneData = window.GAME_DATA?.scenes?.[this.currentScene];
            if (sceneData) {
                // Draw hotspots if they exist in the scene data
                if (sceneData.hotspots) {
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
            
            // Draw simple placeholder for NPCs
            ctx.fillStyle = npc.color || '#FF0000';
            ctx.beginPath();
            ctx.arc(npc.x, npc.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw name label
            if (npc.name) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(npc.x - 40, npc.y - 30, 80, 20);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, npc.x, npc.y - 15);
            }
        });
    }

    // Add helper method for drawing the player character
    _drawPlayer(ctx) {
        if (!this.playerPosition) return;
        
        // Draw player character (simplified)
        ctx.fillStyle = '#0000FF'; // Blue for player
        ctx.beginPath();
        ctx.arc(this.playerPosition.x, this.playerPosition.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        ctx.fillStyle = '#FFFFFF';
        
        const dirX = this.playerPosition.x;
        const dirY = this.playerPosition.y;
        const radius = 20;
        
        switch (this.playerFacing) {
            case 'up':
                ctx.beginPath();
                ctx.moveTo(dirX, dirY - radius);
                ctx.lineTo(dirX - 5, dirY - radius + 10);
                ctx.lineTo(dirX + 5, dirY - radius + 10);
                ctx.closePath();
                ctx.fill();
                break;
            case 'down':
                ctx.beginPath();
                ctx.moveTo(dirX, dirY + radius);
                ctx.lineTo(dirX - 5, dirY + radius - 10);
                ctx.lineTo(dirX + 5, dirY + radius - 10);
                ctx.closePath();
                ctx.fill();
                break;
            case 'left':
                ctx.beginPath();
                ctx.moveTo(dirX - radius, dirY);
                ctx.lineTo(dirX - radius + 10, dirY - 5);
                ctx.lineTo(dirX - radius + 10, dirY + 5);
                ctx.closePath();
                ctx.fill();
                break;
            case 'right':
                ctx.beginPath();
                ctx.moveTo(dirX + radius, dirY);
                ctx.lineTo(dirX + radius - 10, dirY - 5);
                ctx.lineTo(dirX + radius - 10, dirY + 5);
                ctx.closePath();
                ctx.fill();
                break;
        }
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
                        use: "You scan through the notices.",
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
                        use: "You examine the broken window more closely.",
                        talk: "The store is closed."
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
                
                // Suspicious person
                this.collisionObjects.push({
                    x: 600, 
                    y: 350, 
                    width: 40, 
                    height: 40,
                    type: 'npc',
                    id: 'witness',
                    interactions: {
                        look: "Someone who might have seen something suspicious.",
                        talk: "\"I saw someone breaking into that electronics store last night.\"",
                        use: "You can't use a person."
                    }
                });
                break;
                
            default:
                console.log(`No collision objects defined for scene: ${this.currentScene}`);
        }
        
        console.log(`Created ${this.collisionObjects.length} collision objects for scene ${this.currentScene}`);
    }
}

// Add this after the class definition but before the window.GameEngine assignment
// Helper function for robust image loading
GameEngine.prototype._tryLoadImage = function(path) {
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
};

// Make GameEngine available in the global scope
window.GameEngine = GameEngine;