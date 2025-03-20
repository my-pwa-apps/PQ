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
        
        // Placeholder for actual interaction logic
        if (this.activeCommand === 'move' && this.walkTarget) {
            this.walkTarget = { x, y };
            this.isWalking = true;
        }
        
        // Check for collisions if the method exists
        if (this.checkCollision) {
            const clickedObject = this.checkCollision(x, y);
            if (clickedObject && this.processInteraction) {
                this.processInteraction(clickedObject);
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

    // Adding a stub for processInteraction
    processInteraction(object) {
        console.log("Processing interaction with:", object);
        
        if (!object || !this.activeCommand) {
            return;
        }
        
        // Handle basic interaction logic
        if (object.interactions && object.interactions[this.activeCommand]) {
            console.log(object.interactions[this.activeCommand]);
            
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
            console.log(`Cannot ${this.activeCommand} that.`);
        }
    }

    // Optimize major performance bottlenecks
    drawCurrentScene() {
        try {
            const ctx = this.offscreenCtx || this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Get current scene data from GameData if available
            const sceneData = window.GAME_DATA?.scenes?.[this.currentScene];
            
            // Default background color if no scene data or background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (sceneData) {
                console.log(`Drawing scene: ${this.currentScene}`);
                
                // Draw background image if available in the scene data
                if (sceneData.background && typeof sceneData.background === 'string') {
                    // For image backgrounds
                    if (sceneData.background.endsWith('.png') || 
                        sceneData.background.endsWith('.jpg') || 
                        sceneData.background.endsWith('.jpeg')) {
                        
                        // Use a scene-specific image loading system
                        const imageKey = `${this.currentScene}_bg`;
                        
                        // Initialize image cache if needed
                        if (!this._backgroundImages) {
                            this._backgroundImages = new Map();
                        }
                        
                        // Try to get cached image or create a new one
                        let bgImage = this._backgroundImages.get(imageKey);
                        
                        if (!bgImage) {
                            // Image not yet loaded - create new image
                            bgImage = {
                                element: new Image(),
                                loaded: false,
                                failed: false,
                                path: sceneData.background
                            };
                            
                            // Store in cache
                            this._backgroundImages.set(imageKey, bgImage);
                            
                            // Set up image load handlers
                            bgImage.element.onload = () => {
                                console.log(`Background image loaded for ${this.currentScene}`);
                                bgImage.loaded = true;
                                this.drawCurrentScene(); // Redraw when image loads
                            };
                            
                            bgImage.element.onerror = (err) => {
                                console.error(`Failed to load background image for ${this.currentScene}:`, err);
                                bgImage.failed = true;
                                // No need to redraw, fallback already showing
                            };
                            
                            // Ensure path is absolute
                            let imagePath = bgImage.path;
                            if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                                // Try different relative paths
                                if (imagePath.startsWith('./')) {
                                    imagePath = imagePath.substring(2);
                                }
                            }
                            
                            // Apply the source path
                            bgImage.element.src = imagePath;
                            
                            // Draw fallback while loading
                            this._drawFallbackScene(ctx, this.currentScene);
                            return;
                        } 
                        else if (bgImage.loaded) {
                            // Image successfully loaded - draw it
                            try {
                                ctx.drawImage(bgImage.element, 0, 0, this.canvas.width, this.canvas.height);
                            } catch (imgError) {
                                console.error("Error drawing background image:", imgError);
                                this._drawFallbackScene(ctx, this.currentScene);
                            }
                        } 
                        else if (bgImage.failed) {
                            // Image previously failed - use fallback
                            this._drawFallbackScene(ctx, this.currentScene);
                        } 
                        else {
                            // Image still loading - use fallback
                            this._drawFallbackScene(ctx, this.currentScene);
                        }
                    } else {
                        // Not an image path (could be a color or other format)
                        this._drawFallbackScene(ctx, this.currentScene);
                    }
                } else {
                    // No background specified
                    this._drawFallbackScene(ctx, this.currentScene);
                }
                
                // Draw hotspots for debugging if enabled
                if (this.debugMode && sceneData.hotspots) {
                    this._drawHotspots(ctx, sceneData.hotspots);
                } else if (sceneData.hotspots) {
                    // Always draw hotspots for now during development
                    this._drawHotspots(ctx, sceneData.hotspots);
                }
            } else {
                console.warn(`No scene data found for ${this.currentScene}`);
                ctx.fillStyle = '#333333';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw error message
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Scene "${this.currentScene}" not found`, this.canvas.width / 2, this.canvas.height / 2);
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
            this._drawUI(ctx);
            
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
        // Stub implementation for updating game state
        console.log("Game state update called");
        
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
}

// Make GameEngine available in the global scope
window.GameEngine = GameEngine;