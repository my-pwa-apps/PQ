class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        this.currentScene = 'policeStation';
        this.isRunning = false;
        this.debugMode = false;

        this.playerPosition = { x: 400, y: 350 };
        this.playerFacing = 'down';
        this.isWalking = false;
        this.playerWalkCycle = 0;

        this.animationFrame = 0;
        this.lastFrameTime = performance.now();
        this.frameInterval = 1000 / 60;

        this.npcs = {};
        this.collisionObjects = [];
        this.colors = {
            black: '#000000',
            white: '#FFFFFF',
            blue: '#0000AA',
            yellow: '#FFFF55',
            skin: '#FFD8B1'
        };

        // Add assets map for loading and storing game assets
        this.assets = new Map();
        this.loadingAssets = new Set();

        this.currentScene = 'policeStation';
        this.debugMode = false;

        // Add collision system properties
        this.collisionObjects = [];
        this.playerCollisionRadius = 20; // Player collision radius
        this.interactionDistance = 50; // Distance at which player can interact with objects

        // Add inventory system
        this.inventory = [];
        
        // Enhanced graphics systems
        this.particleSystem = null;
        this.backgroundLayers = new Map();
        this.lightingEffects = [];
        this.weatherEffects = new Map();
        
        // Performance optimization
        this.frameCounter = 0;
        this.skipFrames = 0;
        this.lastMousePosition = { x: 0, y: 0 };
        
        // Enhanced visual effects
        this.screenShake = { intensity: 0, duration: 0 };
        this.screenFlash = { color: '#FFFFFF', intensity: 0, duration: 0 };
        this.transition = { active: false, progress: 0, type: 'fade' };
        
        // Lighting system
        this.ambientLight = 0.8;
        this.lightSources = [];
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 800 * dpr;
        this.canvas.height = 600 * dpr;
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.width = '800px';
        this.canvas.style.height = '600px';
        
        // Add cursor style to ensure it's visible
        this.canvas.style.cursor = 'pointer';
    }

    setupBufferCanvas() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false });
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleInteraction(x, y);
        });        document.addEventListener('keydown', (e) => {
            const directions = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
            if (directions[e.key]) {
                this.handleMovement(directions[e.key]);
                return;
            }
            
            // Police-specific keyboard shortcuts
            switch(e.key.toLowerCase()) {
                case 'r':
                    // Radio shortcut
                    if (this.policeGameplay) {
                        this.policeGameplay.useRadio();
                    }
                    break;
                case 'b':
                    // Badge shortcut  
                    if (this.policeGameplay) {
                        this.policeGameplay.showBadge();
                    }
                    break;
                case 'h':
                    // Handcuffs shortcut
                    if (this.policeGameplay) {
                        this.policeGameplay.useHandcuffs();
                    }
                    break;
                case 'w':
                    // Weapon/service revolver shortcut
                    if (this.policeGameplay) {
                        this.policeGameplay.drawWeapon();
                    }
                    break;
                case 'i':
                    // Inventory toggle
                    this.toggleInventory();
                    break;
                case 'p':
                    // Procedure panel toggle
                    this.toggleProcedurePanel();
                    break;
                case 'escape':
                    // Cancel current action
                    this.cancelCurrentAction();
                    break;
            }
        });
        
        // Track mouse position for cursor updates
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.lastMouseX = e.clientX - rect.left;            this.lastMouseY = e.clientY - rect.top;
            
            // Update cursor immediately
            this.updateCursorStyle();
        });
    }

    // Add init method to properly initialize the engine
    async init() {
        try {
            this.setupCanvas();
            this.setupBufferCanvas();
            this.setupEventListeners();
            this.setupNPCs(); // Call the NPC setup
            
            // Initialize enhanced graphics systems - with error handling
            if (window.ParticleSystem) {
                this.particleSystem = new window.ParticleSystem(this.canvas, this.offscreenCtx);
            } else {
                console.warn("ParticleSystem not available, skipping particle effects");
            }
              // Initialize Sierra Graphics System with offscreen canvas for proper rendering
            if (window.SierraGraphics) {
                this.sierraGraphics = new window.SierraGraphics(this.offscreenCanvas, this.offscreenCtx);
                console.log("Sierra Graphics System initialized");
            } else {
                console.warn("SierraGraphics not available, using standard graphics");
            }
            
            // Initialize Police Gameplay System
            if (window.PoliceGameplay) {
                this.policeGameplay = new window.PoliceGameplay(this);
                console.log("Police Gameplay System initialized");
            } else {
                console.warn("PoliceGameplay not available, using standard gameplay");
            }
              // Initialize Police Story System
            if (window.PoliceStory) {
                this.policeStory = new window.PoliceStory(this);
                console.log("Police Story System initialized");
            } else {
                console.warn("PoliceStory not available, using standard story");
            }
            
            // Initialize audio system
            this.initAudioSystem();
            
            this.initializeLighting();
            this.initializeWeatherEffects();
            
            // Initialize dialog system early
            this.initDialogSystem();
            
            // Initialize game state
            this.loadScene(this.currentScene);
            
            // Start the game loop
            this.startGameLoop();
            
            console.log("Game engine initialized successfully");
            return true;
        } catch (error) {
            console.error("Failed to initialize game engine:", error);
            return false;
        }
    }

    startGameLoop() {
        this.isRunning = true;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    stopGameLoop() {
        this.isRunning = false;
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastFrameTime;
        
        // Target 30 FPS for better performance while maintaining smooth gameplay
        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime / 1000); // Convert to seconds
            this.render();
            this.lastFrameTime = timestamp;
            
            // Update screen effects
            if (this.screenShake.duration > 0 || this.screenFlash.duration > 0 || this.transition.active) {
                this.updateScreenEffects(deltaTime / 1000);
            }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime = 1 / 60) {
        // Handle player movement toward target if walking
        if (this.isWalking && this.targetX !== undefined && this.targetY !== undefined) {
            // Calculate direction vector
            const dx = this.targetX - this.playerPosition.x;
            const dy = this.targetY - this.playerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only move if we're not already at the target
            if (distance > 5) {
                // Normalized direction
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                // Calculate next position
                const speed = 5;
                const nextX = this.playerPosition.x + dirX * speed;
                const nextY = this.playerPosition.y + dirY * speed;
                
                // Update player facing based on movement direction
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.playerFacing = dx > 0 ? 'right' : 'left';
                } else {
                    this.playerFacing = dy > 0 ? 'down' : 'up';
                }
                
                // Check for collision before moving
                if (!this.checkCollisionAtPoint(nextX, nextY)) {
                    this.playerPosition.x = nextX;
                    this.playerPosition.y = nextY;
                    
                    // Update walk cycle
                    this.playerWalkCycle = (this.playerWalkCycle + 1) % 8;
                    
                    // Create dust particles when walking
                    if (this.particleSystem && this.frameCounter % 10 === 0) {
                        this.particleSystem.createDustEffect(nextX, nextY + 15);
                    }
                } else if (this.debugMode) {
                    console.log("Collision detected, cannot move to", nextX, nextY);
                }
            } else {
                // Reached the target
                this.isWalking = false;
                this.targetX = undefined;
                this.targetY = undefined;
            }
        }
          // Update cursor style based on mouse position
        this.updateCursorStyle();
        
        this.updateNPCs(deltaTime);
        
        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
        
        // Update police gameplay systems
        if (this.policeGameplay) {
            this.policeGameplay.update(deltaTime);
        }
        
        // Update story system
        if (this.policeStory) {
            this.policeStory.update(deltaTime);
        }
        
        // Update UI elements
        this.updatePoliceUI();
        
        // Update screen effects
        this.updateScreenEffects(deltaTime);
        
        // Update lighting effects
        this.updateLighting(deltaTime);
        
        this.animationFrame++;
        this.frameCounter++;
    }    render() {
        // Apply screen shake effect
        let shakeX = 0, shakeY = 0;
        if (this.screenShake.intensity > 0) {
            shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
            shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
        }
        
        this.offscreenCtx.save();
        this.offscreenCtx.translate(shakeX, shakeY);
          this.offscreenCtx.clearRect(-shakeX, -shakeY, this.canvas.width, this.canvas.height);
          // Use Sierra Graphics for authentic Police Quest experience
        if (this.sierraGraphics) {
            this.renderWithSierraGraphics();
        } else {
            this.drawCurrentScene();
        }
        
        // Render particle system
        if (this.particleSystem) {
            this.particleSystem.render();
        }
        
        // Apply lighting effects
        this.renderLighting();
        
        this.offscreenCtx.restore();
        
        // Copy to main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        // Apply screen flash effect
        if (this.screenFlash.intensity > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.screenFlash.intensity;
            this.ctx.fillStyle = this.screenFlash.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        
        // Apply scene transition effect
        if (this.transition.active) {
            this.renderTransition();
        }
        
        // Draw collision visualization in debug mode
        if (this.debugMode) {
            this.debugDrawCollisions();
        }
    }
    
    renderLighting() {
        // Disable lighting overlay for now - it was making the screen too dark
        // Only render in special scenes or debug mode
        if (this.debugMode && this.lightSources.length > 0) {
            // Create lighting overlay
            this.offscreenCtx.save();
            this.offscreenCtx.globalCompositeOperation = 'multiply';
            this.offscreenCtx.fillStyle = `rgba(0, 0, 0, ${1 - this.ambientLight})`;
            this.offscreenCtx.fillRect(0, 0, 800, 600);
            
            // Add light sources
            this.offscreenCtx.globalCompositeOperation = 'screen';
            for (const light of this.lightSources) {
                const gradient = this.offscreenCtx.createRadialGradient(
                    light.x, light.y, 0,
                    light.x, light.y, light.radius
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.offscreenCtx.fillStyle = gradient;
                this.offscreenCtx.fillRect(
                    light.x - light.radius, light.y - light.radius,
                    light.radius * 2, light.radius * 2
                );
            }
            
            this.offscreenCtx.restore();
        }
    }
    
    renderTransition() {
        this.ctx.save();
        if (this.transition.type === 'fade') {
            this.ctx.globalAlpha = this.transition.progress;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (this.transition.type === 'slide') {
            const offset = this.transition.progress * this.canvas.width;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, offset, this.canvas.height);
        }
        this.ctx.restore();
    }

    drawCurrentScene() {
        switch (this.currentScene) {
            case 'policeStation':
                this.drawPoliceStation();
                break;
            case 'downtown':
                this.drawDowntown();
                break;
            case 'park':
                this.drawPark();
                break;
            case 'sheriffsOffice':
                this.drawSheriffsOffice();
                break;
            case 'briefingRoom':
                this.drawBriefingRoom();
                break;
            default:
                console.warn('Unknown scene:', this.currentScene);
        }

        this.drawNPCs();
        this.drawPlayer();
    }

    drawPoliceStation() {
        const ctx = this.offscreenCtx;
        
        // Sierra-style color palette
        const colors = {
            wallBlue: '#5A81AC',
            wallTrim: '#385D8A',
            floor: '#997755',
            floorTiles: '#8B6844',
            furnitureWood: '#6E4D2A',
            officeBackground: '#AABBCC',
            deskColor: '#7E5539',
            cabinetGray: '#778899',
            computerScreen: '#000066',
            computerMonitor: '#444444',
            doorFrame: '#5D4037',
            doorColor: '#8D6E63',
            noticeBoardBg: '#F5F5DC',
            noticeBoardFrame: '#8B4513'
        };
        
        // Background wall
        ctx.fillStyle = colors.wallBlue;
        ctx.fillRect(0, 0, this.canvas.width, 250);
        
        // Floor
        ctx.fillStyle = colors.floor;
        ctx.fillRect(0, 250, this.canvas.width, this.canvas.height - 250);
        
        // Floor tiles
        for (let x = 0; x < this.canvas.width; x += 40) {
            for (let y = 250; y < this.canvas.height; y += 40) {
                if ((Math.floor(x/40) + Math.floor(y/40)) % 2 === 0) {
                    ctx.fillStyle = colors.floorTiles;
                    ctx.fillRect(x, y, 40, 40);
                }
            }
        }
        
        // Wall trim
        ctx.fillStyle = colors.wallTrim;
        ctx.fillRect(0, 240, this.canvas.width, 10);
        
        // Main reception desk
        this.drawReceptionDesk(ctx, 350, 280, colors);
        
        // Office doors
        this.drawDoor(ctx, 100, 150, colors, "BRIEFING ROOM");
        this.drawDoor(ctx, 650, 150, colors, "SHERIFF'S OFFICE");
        
        // Exit door
        this.drawDoor(ctx, 400, 530, colors, "EXIT", true);
        
        // File cabinets
        this.drawFileCabinet(ctx, 50, 200, colors);
        this.drawFileCabinet(ctx, 80, 200, colors);
        this.drawFileCabinet(ctx, 720, 200, colors);
        
        // Notice board
        this.drawNoticeBoard(ctx, 500, 100, 140, 90, colors);
        
        // Detective desks
        this.drawDetectiveDesk(ctx, 200, 320, colors, true);  // Computer on
        this.drawDetectiveDesk(ctx, 500, 350, colors, false); // Computer off
        
        // Add some chairs
        this.drawOfficeChair(ctx, 200, 360, colors);
        this.drawOfficeChair(ctx, 500, 390, colors);
        this.drawOfficeChair(ctx, 400, 300, colors);
        
        // Add water cooler and plants for atmosphere
        this.drawWaterCooler(ctx, 730, 280, colors);
        this.drawOfficePlant(ctx, 50, 270, colors);
        this.drawOfficePlant(ctx, 750, 350, colors);
        
        // Add coffee machine - classic Police Quest element
        this.drawCoffeeMachine(ctx, 680, 150, colors);
    }

    drawReceptionDesk(ctx, x, y, colors) {
        // Main desk body
        ctx.fillStyle = colors.deskColor;
        ctx.fillRect(x - 80, y, 160, 60);
        
        // Desk front panel
        ctx.fillStyle = colors.deskColor;
        ctx.fillRect(x - 80, y + 30, 160, 30);
        
        // Desktop items
        this.drawComputer(ctx, x - 50, y - 10, colors, true);
        
        // Counter top edge
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 80, y, 160, 5);
        
        // Reception sign
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(x - 40, y - 20, 80, 15);
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RECEPTION', x, y - 8);
    }

    drawDetectiveDesk(ctx, x, y, colors, computerOn) {
        // Desk top
        ctx.fillStyle = colors.deskColor;
        ctx.fillRect(x - 50, y, 100, 60);
        
        // Desk legs
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 45, y + 60, 10, 20);
        ctx.fillRect(x + 35, y + 60, 10, 20);
        
        // Computer
        this.drawComputer(ctx, x, y - 10, colors, computerOn);
        
        // Papers and folders
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 40, y + 15, 30, 20);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 15, y + 20, 25, 15);
        
        // Coffee mug
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 30, y + 10, 7, 8);
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(x - 29, y + 7, 5, 3);
    }

    drawComputer(ctx, x, y, colors, isOn) {
        // Monitor
        ctx.fillStyle = colors.computerMonitor;
        ctx.fillRect(x - 15, y, 30, 25);
        
        // Screen
        ctx.fillStyle = isOn ? '#00AA00' : colors.computerScreen;
        ctx.fillRect(x - 12, y + 3, 24, 18);
        
        // Screen content (if on)
        if (isOn) {
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(x - 10, y + 5, 20, 2);
            ctx.fillRect(x - 10, y + 9, 15, 2);
            ctx.fillRect(x - 10, y + 13, 18, 2);
            ctx.fillRect(x - 10, y + 17, 12, 2);
        }
        
        // Keyboard
        ctx.fillStyle = '#555555';
        ctx.fillRect(x - 20, y + 27, 40, 12);
    }

    drawDoor(ctx, x, y, colors, label, isExit = false) {
        const width = isExit ? 80 : 60;
        const height = isExit ? 40 : 120;
        
        // Door frame
        ctx.fillStyle = colors.doorFrame;
        ctx.fillRect(x - width/2 - 5, y - (isExit ? 0 : 5), width + 10, height + 5);
        
        // Door
        ctx.fillStyle = colors.doorColor;
        ctx.fillRect(x - width/2, y, width, height);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(isExit ? (x + width/4) : (x + width/4), 
                     isExit ? (y + height/2) : (y + height/2), 5, 5);
        
        // Door label
        if (label) {
            ctx.fillStyle = isExit ? '#FF0000' : '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, isExit ? (y + height + 15) : (y - 10));
        }
    }

    drawFileCabinet(ctx, x, y, colors) {
        // Cabinet body
        ctx.fillStyle = colors.cabinetGray;
        ctx.fillRect(x, y, 25, 80);
        
        // Drawers
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 1, y + 5, 23, 20);
        ctx.fillRect(x + 1, y + 30, 23, 20);
        ctx.fillRect(x + 1, y + 55, 23, 20);
        
        // Drawer handles
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(x + 10, y + 15, 5, 3);
        ctx.fillRect(x + 10, y + 40, 5, 3);
        ctx.fillRect(x + 10, y + 65, 5, 3);
    }

    drawNoticeBoard(ctx, x, y, width, height, colors) {
        // Board background
        ctx.fillStyle = colors.noticeBoardBg;
        ctx.fillRect(x, y, width, height);
        
        // Board frame
        ctx.fillStyle = colors.noticeBoardFrame;
        ctx.fillRect(x - 3, y - 3, width + 6, 3);
        ctx.fillRect(x - 3, y + height, width + 6, 3);
        ctx.fillRect(x - 3, y, 3, height);
        ctx.fillRect(x + width, y, 3, height);
        
        // Notices - small colored papers
        ctx.fillStyle = '#FFFF99'; // yellow note
        ctx.fillRect(x + 10, y + 10, 30, 20);
        
        ctx.fillStyle = '#ADD8E6'; // blue note
        ctx.fillRect(x + 50, y + 15, 35, 25);
        
        ctx.fillStyle = '#FFC0CB'; // pink note
        ctx.fillRect(x + 20, y + 45, 40, 20);
        
        ctx.fillStyle = '#98FB98'; // green note
        ctx.fillRect(x + 70, y + 50, 30, 25);
        
        // Thumbtacks
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x + 15, y + 12, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(x + 55, y + 18, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(x + 25, y + 47, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF00FF';
        ctx.beginPath();
        ctx.arc(x + 75, y + 52, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawOfficeChair(ctx, x, y, colors) {
        // Chair seat
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 12, y, 24, 8);
        
        // Chair back
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 10, y - 15, 20, 15);
        
        // Chair legs
        ctx.fillStyle = '#444444';
        ctx.fillRect(x - 10, y + 8, 3, 12);
        ctx.fillRect(x + 7, y + 8, 3, 12);
    }

    drawWaterCooler(ctx, x, y, colors) {
        // Water bottle
        ctx.fillStyle = '#ADD8E6';
        ctx.fillRect(x - 10, y - 30, 20, 30);
        
        // Water level
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x - 8, y - 25, 16, 20);
        
        // Dispenser
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 12, y, 24, 25);
        
        // Spigot
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(x - 2, y + 10, 4, 5);
    }

    drawOfficePlant(ctx, x, y, colors) {
        // Pot
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 10, y, 20, 15);
        
        // Plant
        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x - 15, y);
        ctx.lineTo(x + 15, y);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.lineTo(x - 12, y - 15);
        ctx.lineTo(x + 12, y - 15);
        ctx.closePath();
        ctx.fill();
    }

    drawCoffeeMachine(ctx, x, y, colors) {
        // Machine body
        ctx.fillStyle = '#333333';
        ctx.fillRect(x - 15, y, 30, 40);
        
        // Coffee pot
        ctx.fillStyle = '#777777';
        ctx.fillRect(x - 10, y + 10, 20, 25);
        
        // Coffee
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 8, y + 20, 16, 13);
        
        // Buttons
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(x + 8, y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDowntown() {
        const ctx = this.offscreenCtx;
        
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 150);
        skyGradient.addColorStop(0, '#4B79A1');
        skyGradient.addColorStop(1, '#79A1C1');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, 150);
        
        // Buildings in background
        this.drawDowntownBuildings(ctx);
        
        // Street
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 300, this.canvas.width, this.canvas.height - 300);
        
        // Sidewalk
        ctx.fillStyle = '#999999';
        ctx.fillRect(0, 280, this.canvas.width, 20);
        
        // Sidewalk lines
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 1;
        for (let x = 40; x < this.canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 280);
            ctx.lineTo(x, 300);
            ctx.stroke();
        }
        
        // Road markings
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 10]);
        ctx.beginPath();
        ctx.moveTo(0, 350);
        ctx.lineTo(this.canvas.width, 350);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Alley
        ctx.fillStyle = '#333333';
        ctx.fillRect(200, 150, 50, 130);
        
        // Store fronts
        this.drawElectronicsStore(ctx, 300, 200);
        this.drawCafeStorefront(ctx, 500, 200);
        
        // Lamp posts
        this.drawLampPost(ctx, 100, 280);
        this.drawLampPost(ctx, 400, 280);
        this.drawLampPost(ctx, 700, 280);
        
        // Fire hydrant
        this.drawFireHydrant(ctx, 150, 280);
        
        // Crime scene
        this.drawCrimeScene(ctx, 350, 290);
        
        // Parked police car
        this.drawPoliceCar(ctx, 600, 320);
    }

    drawDowntownBuildings(ctx) {
        // Background buildings
        for (let i = 0; i < 10; i++) {
            const buildingX = i * 80;
            const buildingHeight = 100 + Math.sin(i * 0.7) * 30;
            const buildingWidth = 80;
            
            ctx.fillStyle = i % 2 === 0 ? '#8596A6' : '#6E7A8A';
            ctx.fillRect(buildingX, 150 - buildingHeight, buildingWidth, buildingHeight);
            
            // Windows
            ctx.fillStyle = '#FFDB58';
            const windowRows = Math.floor(buildingHeight / 20);
            const windowCols = Math.floor(buildingWidth / 15);
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    // Don't draw windows on all positions
                    if (Math.random() > 0.3) {
                        ctx.fillRect(
                            buildingX + col * 15 + 3, 
                            150 - buildingHeight + row * 20 + 3, 
                            9, 12
                        );
                    }
                }
            }
        }
    }

    drawElectronicsStore(ctx, x, y) {
        // Store front
        ctx.fillStyle = '#6D6875';
        ctx.fillRect(x - 70, y, 140, 80);
        
        // Window
        ctx.fillStyle = '#A7C6DA';
        ctx.fillRect(x - 60, y + 10, 120, 50);
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 15, y + 30, 30, 50);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 8, y + 50, 5, 5);
        
        // Store name
        ctx.fillStyle = '#FFD700';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ELECTRONICS', x, y + 25);
        
        // Crime scene tape
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x - 60, y + 70, 120, 5);
        
        // Electronic items in window
        ctx.fillStyle = '#333333';
        ctx.fillRect(x - 50, y + 30, 20, 15); // TV
        ctx.fillRect(x - 20, y + 35, 15, 10); // Radio
        ctx.fillRect(x + 10, y + 30, 10, 20); // Computer
        ctx.fillRect(x + 30, y + 40, 20, 5);  // Stereo
    }

    drawCrimeScene(ctx, x, y) {
        // Police tape
        ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x - 40 + i*20, y - 10, 15, 3);
        }
        
        // Evidence markers
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 5);
        ctx.lineTo(x - 5, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 5);
        ctx.lineTo(x + 25, y - 5);
        ctx.lineTo(x + 30, y + 5);
        ctx.fill();
    }

    drawPoliceCar(ctx, x, y) {
        // Car body
        ctx.fillStyle = '#000066';
        ctx.fillRect(x - 30, y - 15, 60, 15);
        
        // Car top
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 20, y - 25, 40, 10);
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x - 15, y - 23, 30, 8);
        
        // Wheels
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 20, y, 10, 10);
        ctx.fillRect(x + 10, y, 10, 10);
        
        // Light bar
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x - 15, y - 30, 10, 5);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(x + 5, y - 30, 10, 5);
    }

    drawLampPost(ctx, x, y) {
        // Post
        ctx.fillStyle = '#333333';
        ctx.fillRect(x - 2, y - 70, 4, 70);
        
        // Light fixture
        ctx.fillStyle = '#444444';
        ctx.fillRect(x - 8, y - 85, 16, 15);
        
        // Light
        ctx.fillStyle = '#FFFF77';
        ctx.fillRect(x - 6, y - 83, 12, 10);
    }

    drawFireHydrant(ctx, x, y) {
        // Main body
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x - 5, y - 15, 10, 15);
        
        // Top cap
        ctx.fillStyle = '#AA0000';
        ctx.fillRect(x - 6, y - 20, 12, 5);
        
        // Side nozzles
        ctx.fillStyle = '#880000';
        ctx.fillRect(x - 10, y - 10, 5, 5);
        ctx.fillRect(x + 5, y - 10, 5, 5);
    }

    drawPark(ctx) {
        // Sky background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 200);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#ADD8E6');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, 200);
        
        // Grass
        ctx.fillStyle = '#5D8C3F';
        ctx.fillRect(0, 200, this.canvas.width, this.canvas.height - 200);
        
        // Path through park
        ctx.fillStyle = '#C2B280';
        ctx.fillRect(50, 250, this.canvas.width - 100, 80);
        
        // Path border
        ctx.strokeStyle = '#9B7653';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 250, this.canvas.width - 100, 80);
        
        // Trees
        this.drawTree(ctx, 100, 200, 40, 80);
        this.drawTree(ctx, 300, 150, 50, 100);
        this.drawTree(ctx, 600, 180, 45, 90);
        this.drawTree(ctx, 750, 220, 35, 70);
        
        // Park benches
        this.drawBench(ctx, 200, 300);
        this.drawBench(ctx, 500, 280);
        
        // Fountain in center
        this.drawFountain(ctx, 400, 180);
        
        // Bushes
        this.drawBush(ctx, 150, 350, 40);
        this.drawBush(ctx, 650, 330, 30);
        this.drawBush(ctx, 700, 350, 25);
    }

    drawTree(ctx, x, y, width, height) {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - width/6, y, width/3, height);
        
        // Tree foliage (layered for more depth)
        ctx.fillStyle = '#097969'; // Dark green
        ctx.beginPath();
        ctx.ellipse(x, y - height*0.2, width/2, height/3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#228B22'; // Medium green
        ctx.beginPath();
        ctx.ellipse(x, y - height*0.4, width/2.2, height/3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#32CD32'; // Light green
        ctx.beginPath();
        ctx.ellipse(x, y - height*0.6, width/2.5, height/4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBench(ctx, x, y) {
        // Bench seat
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 30, y - 10, 60, 5);
        
        // Bench back
        ctx.fillRect(x - 30, y - 30, 60, 3);
        
        // Bench supports
        for (let i = -25; i <= 25; i += 25) {
            ctx.fillRect(x + i, y - 30, 3, 30);
        }
        
        // Bench legs
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 25, y - 5, 5, 15);
        ctx.fillRect(x + 20, y - 5, 5, 15);
    }

    drawFountain(ctx, x, y) {
        // Fountain base
        ctx.fillStyle = '#AAAAAA';
        ctx.beginPath();
        ctx.ellipse(x, y + 30, 80, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Fountain pool
        ctx.fillStyle = '#40B0D0';
        ctx.beginPath();
        ctx.ellipse(x, y + 30, 70, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Fountain center pillar
        ctx.fillStyle = '#CCCCCC';
        ctx.beginPath();
        ctx.ellipse(x, y + 25, 15, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Fountain water spray
        if (this.animationFrame % 20 < 10) {
            ctx.fillStyle = '#80C0FF';
            ctx.beginPath();
            ctx.ellipse(x, y, 10, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Water droplets
            for (let i = 0; i < 8; i++) {
                const angle = Math.PI * 2 * (i / 8);
                const dx = Math.cos(angle) * 20;
                const dy = Math.sin(angle) * 10 - 10;
                
                ctx.beginPath();
                ctx.ellipse(x + dx, y + dy, 3, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = '#80C0FF';
            ctx.beginPath();
            ctx.ellipse(x, y - 5, 8, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBush(ctx, x, y, size) {
        ctx.fillStyle = '#097969';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bush highlights
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(x - size/3, y - size/4, size/2, size/3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(x + size/4, y - size/6, size/3, size/4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawNPCs() {
        const npcs = this.npcs[this.currentScene] || [];
        npcs.forEach(npc => {
            this.drawPixelCharacter(npc.x, npc.y, npc.uniformColor, npc.badgeColor, npc.facing, npc.isWalking, true, npc.isFemale);
        });
    }

    drawPlayer() {
        this.drawPixelCharacter(this.playerPosition.x, this.playerPosition.y, '#0000AA', '#FFD700', this.playerFacing, this.isWalking);
    }

    drawPixelCharacter(x, y, uniformColor, badgeColor, facing = 'down', isWalking = false, isNPC = false, isFemale = false) {
        const ctx = this.offscreenCtx;
        
        // Sierra-style character drawing with fewer pixels for authentic look
        const pixelSize = 2; // Use larger pixels for Sierra style
        
        // Draw shadow under character
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.ellipse(x, y + 3, 12, 4, 0, 0, Math.PI * 2);
        
        // Calculate walk cycle offset
        const walkOffset = isWalking ? ((this.animationFrame % 12) < 6 ? 1 : -1) : 0;
        
        // Body positioning variables based on facing direction
        const facingOffsetX = facing === 'left' ? -2 : (facing === 'right' ? 2 : 0);
        
        // Draw legs
        ctx.fillStyle = this.colors.blue;
        
        if (isWalking) {
            // Left leg with walking animation
            ctx.fillRect(x - 6, y - 16, 5, 16 + (facing === 'left' ? walkOffset : -walkOffset));
            
            // Right leg with walking animation
            ctx.fillRect(x + 1, y - 16, 5, 16 + (facing === 'right' ? walkOffset : -walkOffset));
        } else {
            // Standing pose
            ctx.fillRect(x - 6, y - 16, 5, 16);
            ctx.fillRect(x + 1, y - 16, 5, 16);
        }
        
        // Draw torso (Sierra-style police uniform)
        ctx.fillStyle = uniformColor || this.colors.blue;
        ctx.fillRect(x - 7, y - 32, 14, 16);
        
        // Draw arms based on facing
        if (facing === 'left') {
            // Left side view, one arm visible
            ctx.fillRect(x - 9, y - 32, 3, 14 + (isWalking ? walkOffset : 0));
        } else if (facing === 'right') {
            // Right side view, one arm visible
            ctx.fillRect(x + 6, y - 32, 3, 14 + (isWalking ? walkOffset : 0));
        } else {
            // Front/back view, both arms
            ctx.fillRect(x - 10, y - 32, 3, 14 + (isWalking ? walkOffset : 0));
            ctx.fillRect(x + 7, y - 32, 3, 14 + (isWalking ? -walkOffset : 0));
        }
        
        // Draw badge
        if (facing !== 'back') {
            ctx.fillStyle = badgeColor || this.colors.yellow;
            ctx.fillRect(x + (facing === 'left' ? -5 : 1), y - 28, 4, 4);
        }
        
        // Draw head
        ctx.fillStyle = this.colors.skin;
        if (facing === 'back') {
            ctx.fillRect(x - 5, y - 42, 10, 10);
        } else {
            ctx.fillRect(x - 5 + facingOffsetX, y - 42, 10, 10);
        }
        
        // Draw face features if not facing back
        if (facing !== 'back') {
            // Eyes
            ctx.fillStyle = '#000000';
            if (facing === 'left') {
                ctx.fillRect(x - 3, y - 38, 2, 2);
            } else if (facing === 'right') {
                ctx.fillRect(x + 1, y - 38, 2, 2);
            } else {
                // Front facing eyes
                ctx.fillRect(x - 3, y - 38, 2, 2);
                ctx.fillRect(x + 1, y - 38, 2, 2);
            }
        }
        
        // Hair based on gender and facing
        ctx.fillStyle = isFemale ? '#8B4513' : '#222222';
        if (facing === 'back') {
            ctx.fillRect(x - 5, y - 44, 10, 4);
        } else {
            if (isFemale) {
                // Female hairstyle
                ctx.fillRect(x - 6 + facingOffsetX, y - 45, 12, 3);
                ctx.fillRect(x - 7 + facingOffsetX, y - 42, 3, 8);
                ctx.fillRect(x + 4 + facingOffsetX, y - 42, 3, 8);
            } else {
                // Male hairstyle
                ctx.fillRect(x - 5 + facingOffsetX, y - 46, 10, 4);
            }
        }
        
        // Sierra-style detailing for police officers
        if (!isNPC) {
            // Belt
            ctx.fillStyle = '#000000';
            ctx.fillRect(x - 7, y - 18, 14, 2);
            
            // Collar
            ctx.fillStyle = '#000055';
            ctx.fillRect(x - 4, y - 32, 8, 2);
        }
    }

    handleMovement(direction) {
        const speed = 5;
        switch (direction) {
            case 'up': this.playerPosition.y -= speed; break;
            case 'down':
                this.playerPosition.y += speed;
                break;
            case 'left':
                this.playerPosition.x -= speed;
                break;
            case 'right':
                this.playerPosition.x += speed;
                break;
        }
        this.playerFacing = direction;
        this.isWalking = true;
    }

    stopGameLoop() {
        this.isRunning = false;
    }

    checkAutosave() {
        const now = Date.now();
        if (now - this.lastAutoSave >= this.autoSaveInterval) {
            this.saveGame();
            this.lastAutoSave = now;
        }
    }

    saveGame(slot = 'autosave') {
        localStorage.setItem(`save_${slot}`, JSON.stringify(this.gameState));
    }

    loadGame(slot = 'autosave') {
        const data = localStorage.getItem(`save_${slot}`);
        if (data) {
            this.gameState = JSON.parse(data);
        }    }

    // Add a loadScene method to handle scene changes
    loadScene(sceneId) {
        if (!sceneId || typeof sceneId !== 'string') {
            console.error('Invalid scene ID provided to loadScene:', sceneId);
            return false;
        }
        
        console.log(`Loading scene: ${sceneId}`);
        
        // Check if scene exists in GAME_DATA
        if (!window.GAME_DATA?.scenes?.[sceneId]) {
            console.error(`Scene '${sceneId}' not found in GAME_DATA. Available scenes:`, 
                window.GAME_DATA?.scenes ? Object.keys(window.GAME_DATA.scenes) : 'No scenes data');
            return false;
        }
        
        try {
            // Update current scene
            this.currentScene = sceneId;
            
            // Play scene-appropriate music
            this.playSceneAudio(sceneId);
            
            // Reset any scene-specific state
            this.isWalking = false;
            this.targetX = undefined;
            this.targetY = undefined;
            
            // Update game state if needed
            if (window.game) {
                window.game.currentScene = sceneId;
            }
            
            // Notify any scene manager if available
            if (window.sceneManager && typeof window.sceneManager.loadScene === 'function') {
                window.sceneManager.loadScene(sceneId);
            }
            
            // Play scene music if available
            const sceneMusic = window.GAME_DATA.scenes[sceneId].music;
            if (sceneMusic && window.soundManager) {
                window.soundManager.playBackgroundMusic(sceneMusic);
            }
            
            // Load NPCs for this scene
            this.loadSceneNPCs(sceneId);
            
            console.log(`Scene ${sceneId} loaded successfully`);
            return true;
        } catch (error) {
            console.error(`Error loading scene ${sceneId}:`, error);
            return false;
        }
    }

    // Load NPCs for the current scene
    loadSceneNPCs(sceneId) {
        if (!window.GAME_DATA?.npcs) {
            console.log('No NPC data available');
            return;
        }
        
        // Initialize NPCs object if not exists
        if (!this.npcs) {
            this.npcs = {};
        }
        
        // Clear existing NPCs
        this.npcs = {};
        
        // Load NPCs for this scene
        for (const npcId in window.GAME_DATA.npcs) {
            const npcData = window.GAME_DATA.npcs[npcId];
            if (npcData.scene === sceneId) {
                this.npcs[npcId] = {
                    ...npcData,
                    isWalking: false,
                    animationFrame: 0,
                    lastAnimationTime: 0
                };
                console.log(`Loaded NPC: ${npcData.name} in scene ${sceneId}`);
            }
        }
        
        console.log(`Loaded ${Object.keys(this.npcs).length} NPCs for scene ${sceneId}`);
    }
    
    // Handle NPC interactions
    handleNPCClick(npcId) {
        const npc = this.npcs[npcId];
        if (!npc || !npc.isClickable) {
            return;
        }
        
        // Face the player
        const playerX = this.player.x;
        const npcX = npc.position.x;
        
        if (playerX < npcX) {
            npc.facing = 'left';
        } else {
            npc.facing = 'right';
        }
        
        // Show dialogue
        if (npc.dialogues && npc.dialogues.greeting) {
            this.showDialog(npc.dialogues.greeting);
        }
        
        console.log(`Clicked on NPC: ${npc.name}`);
    }
    
    // Update NPCs (for animations, AI, etc.)
    updateNPCs(deltaTime) {
        if (!this.npcs) return;
        
        for (const npcId in this.npcs) {
            const npc = this.npcs[npcId];
            
            // Simple animation for animated NPCs
            if (npc.animated) {
                npc.lastAnimationTime += deltaTime;
                if (npc.lastAnimationTime > 500) { // 500ms per frame
                    npc.animationFrame = (npc.animationFrame + 1) % 2;
                    npc.lastAnimationTime = 0;
                }
            }
        }
    }

    // Add missing updateNPCs function
    updateNPCs(deltaTime = 1/60) {
        if (!this.npcs || !this.npcs[this.currentScene]) return;
        
        const currentSceneNPCs = this.npcs[this.currentScene];
        
        for (const npc of currentSceneNPCs) {
            // Update NPC animation state
            if (npc.isWalking) {
                npc.animationFrame = (npc.animationFrame || 0) + 1;
            }
            
            // Update NPC position if they're moving
            if (npc.isWalking && npc.patrolPoints && npc.patrolPoints.length > 0) {
                const target = npc.patrolPoints[npc.currentPatrolPoint || 0];
                if (target) {
                    const dx = target.x - npc.x;
                    const dy = target.y - npc.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 2) {
                        const speed = 0.5;
                        const nextX = npc.x + (dx / distance) * speed;
                        const nextY = npc.y + (dy / distance) * speed;
                        
                        // Add collision check for NPCs
                        if (!this.checkNPCCollision(npc, nextX, nextY)) {
                            npc.x = nextX;
                            npc.y = nextY;
                            npc.facing = Math.abs(dx) > Math.abs(dy) ? 
                                (dx > 0 ? 'right' : 'left') : 
                                (dy > 0 ? 'down' : 'up');
                        } else {
                            // If collision, try to find a new path or wait
                            npc.waitTime = 1;
                            // Try to move in only x or only y direction
                            const tryX = npc.x + (dx / distance) * speed;
                            if (!this.checkNPCCollision(npc, tryX, npc.y)) {
                                npc.x = tryX;
                            }
                            
                            const tryY = npc.y + (dy / distance) * speed;
                            if (!this.checkNPCCollision(npc, npc.x, tryY)) {
                                npc.y = tryY;
                            }
                        }
                    } else {
                        // Reached waypoint, move to next one
                        npc.currentPatrolPoint = (npc.currentPatrolPoint + 1) % npc.patrolPoints.length;
                        npc.isWalking = false;
                        npc.waitTime = 2; // Wait for 2 seconds before moving again
                    }
                }
            } else if (npc.waitTime > 0) {
                npc.waitTime -= deltaTime;
                if (npc.waitTime <= 0) {
                    npc.isWalking = true;
                }
            }
        }
    }

    // Add loadAsset method for preloading assets
    async loadAsset(id, url) {
        if (this.assets.has(id)) {
            return this.assets.get(id);
        }
        
        if (this.loadingAssets.has(id)) {
            // Wait for the asset to load if it's already being loaded
            return new Promise((resolve) => {
                const checkLoaded = setInterval(() => {
                    if (this.assets.has(id)) {
                        clearInterval(checkLoaded);
                        resolve(this.assets.get(id));
                    }
                }, 100);
            });
        }
        
        this.loadingAssets.add(id);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.assets.set(id, img);
                this.loadingAssets.delete(id);
                resolve(img);
            };
            
            img.onerror = () => {
                this.loadingAssets.delete(id);
                reject(new Error(`Failed to load asset: ${id} from ${url}`));
            };
            
            img.src = url;
        });
    }

    dispose() {
        this.stopGameLoop();
        this.canvas = null;
        this.ctx = null;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
    }

    // Initialize NPCs for different scenes
    setupNPCs() {
        // Police Station NPCs
        this.npcs.policeStation = [
            {
                id: 'receptionist',
                x: 400,
                y: 280,
                uniformColor: '#0000AA', // blue police uniform
                badgeColor: '#FFD700', // gold badge
                facing: 'down',
                isWalking: false,
                isFemale: true,
                name: 'Officer Jenny',
                dialogId: 'receptionist_dialog',
                patrolPoints: []
            },
            {
                id: 'sergeant',
                x: 600,
                y: 320,
                uniformColor: '#00008B', // dark blue for sergeant
                badgeColor: '#FFD700',
                facing: 'left',
                isWalking: false,
                isFemale: false,
                name: 'Sergeant Dooley',
                dialogId: 'sergeant_dialog',
                patrolPoints: []
            },
            {
                id: 'officer',
                x: 200,
                y: 350,
                uniformColor: '#0000AA',
                badgeColor: '#FFD700',
                facing: 'right',
                isWalking: true,
                isFemale: false,
                name: 'Officer Johnson',
                patrolPoints: [
                    { x: 200, y: 350 },
                    { x: 300, y: 350 },
                    { x: 300, y: 400 },
                    { x: 200, y: 400 }
                ],
                currentPatrolPoint: 0,
                waitTime: 0
            }
        ];
        
        // Downtown NPCs
        this.npcs.downtown = [
            {
                id: 'witness',
                x: 150,
                y: 300,
                uniformColor: '#A52A2A', // brown civilian clothes
                badgeColor: '#FFFFFF',
                facing: 'right',
                isWalking: false,
                isFemale: false,
                name: 'Store Owner',
                dialogId: 'witness_dialog'
            },
            {
                id: 'officer',
                x: 400,
                y: 350,
                uniformColor: '#0000AA',
                badgeColor: '#FFD700',
                facing: 'left',
                isWalking: true,
                isFemale: true,
                name: 'Officer Martinez',
                patrolPoints: [
                    { x: 350, y: 350 },
                    { x: 450, y: 350 }
                ]
            }
        ];
        
        // Park NPCs
        this.npcs.park = [
            {
                id: 'suspect',
                x: 400,
                y: 300,
                uniformColor: '#333333', // dark clothes
                badgeColor: '#333333',
                facing: 'down',
                isWalking: false,
                isFemale: false,
                name: 'Suspicious Person',
                dialogId: 'suspect_dialog'
            }
        ];
        
        // Sheriff's Office NPCs
        this.npcs.sheriffsOffice = [
            {
                id: 'sheriff',
                x: 400,
                y: 250,
                uniformColor: '#2F4F4F', // dark slate gray
                badgeColor: '#FFD700',
                facing: 'down',
                isWalking: false,
                isFemale: false,
                name: 'Sheriff Johnson'
            }
        ];
    }    handleInteraction(x, y) {
        // Reset walking state when user clicks
        this.isWalking = false;
        
        // Check for interaction with NPCs
        const npcsInScene = this.npcs[this.currentScene] || [];
        for (const npc of npcsInScene) {
            // Simple hit testing for NPCs
            const dx = Math.abs(x - npc.x);
            const dy = Math.abs(y - npc.y);
            
            // Check if player is close enough to interact with NPC
            const playerDistance = Math.sqrt((this.playerPosition.x - npc.x) ** 2 + 
                                             (this.playerPosition.y - npc.y) ** 2);
            
            if (dx < 30 && dy < 50 && playerDistance < this.interactionDistance) {
                // Player clicked on an NPC and is close enough
                console.log(`Interacting with NPC: ${npc.name}`);
                
                // Face towards the NPC
                if (this.playerPosition.x < npc.x) {
                    this.playerFacing = 'right';
                } else if (this.playerPosition.x > npc.x) {
                    this.playerFacing = 'left';
                } else if (this.playerPosition.y < npc.y) {
                    this.playerFacing = 'down';
                } else {
                    this.playerFacing = 'up';
                }
                
                // Check if this is a police-related interaction
                if (this.policeGameplay) {
                    const policeInteraction = this.policeGameplay.handleNPCInteraction(npc, this.playerPosition);
                    if (policeInteraction.handled) {
                        return;
                    }
                }
                
                // Handle story-related dialog
                if (this.policeStory) {
                    const storyDialog = this.policeStory.getDialogForNPC(npc.name, this.currentScene);
                    if (storyDialog) {
                        this.handleNPCDialog(npc, storyDialog);
                        return;
                    }
                }
                
                // Handle standard dialog
                this.handleNPCDialog(npc);
                return; // Stop processing after finding an NPC
            }
        }
        
        // Check for hotspots from GAME_DATA
        if (window.GAME_DATA && window.GAME_DATA.scenes && window.GAME_DATA.scenes[this.currentScene]) {
            const scene = window.GAME_DATA.scenes[this.currentScene];
            const hotspots = scene.hotspots || [];
            
            for (const hotspot of hotspots) {
                // Debug hotspot calculation
                const hotspotX = hotspot.x;
                const hotspotY = hotspot.y;
                const hotspotWidth = hotspot.width || 20;
                const hotspotHeight = hotspot.height || 20;
                
                // Check if click is within hotspot bounds
                if (x >= hotspotX - hotspotWidth/2 && 
                    x <= hotspotX + hotspotWidth/2 && 
                    y >= hotspotY - hotspotHeight/2 && 
                    y <= hotspotY + hotspotHeight/2) {
                    
                    // Debug output for clicked hotspot
                    console.log(`Clicked on hotspot: ${hotspot.id} at (${hotspotX},${hotspotY})`);
                    
                    // Check if player is close enough to interact
                    const playerDistance = Math.sqrt((this.playerPosition.x - hotspotX) ** 2 + 
                                                    (this.playerPosition.y - hotspotY) ** 2);
                    
                    if (playerDistance <= this.interactionDistance) {
                        console.log(`Interacting with hotspot: ${hotspot.id}, distance: ${playerDistance}`);
                        
                        // Handle hotspot interaction based on current action (default to 'look')
                        const action = window.game?.activeAction || 'use';  // Default to 'use' for doors
                        const response = hotspot.interactions?.[action] || `You can't ${action} that.`;
                        
                        // For doors, use 'use' action regardless of selected action
                        const effectiveAction = hotspot.id.toLowerCase().includes('door') ? 'use' : action;
                        
                        // Show the response message
                        this.showMessage(response);
                        
                        // Handle special interactions
                        this.processHotspotInteraction(hotspot, effectiveAction);
                        
                        return; // Stop processing after finding a hotspot
                    } else {
                        // Player is too far away
                        console.log(`Too far from hotspot: ${hotspot.id}, distance: ${playerDistance}`);
                        this.showMessage("I need to get closer.");
                        
                        // Move player closer to the hotspot
                        const moveToX = hotspotX + (this.playerPosition.x < hotspotX ? -this.interactionDistance/2 : this.interactionDistance/2);
                        const moveToY = hotspotY + (this.playerPosition.y < hotspotY ? -this.interactionDistance/2 : this.interactionDistance/2);
                        
                        // Move player toward the object
                        this.movePlayerToPoint(moveToX, moveToY);
                        return;
                    }
                }
            }
        }
        
        // If player clicked on empty space, move there
        this.movePlayerToPoint(x, y);
    }

    showMessage(text) {
        if (!text) return;
        
        // Direct display if no dialog systems are available
        console.log("Game message:", text);
        
        try {
            // Try to use dialog manager if available
            if (window.dialogManager) {
                // First check if the dialog box elements exist
                const dialogBox = document.getElementById('dialog-box');
                const dialogText = document.getElementById('dialog-text');
                
                if (!dialogBox || !dialogText) {
                    // Create dialog elements if they don't exist
                    this.createSimpleDialog(text);
                    return;
                }
                
                // Check if showDialog function exists
                if (typeof window.dialogManager.showDialog === 'function') {
                    window.dialogManager.showDialog(text);
                } else if (typeof window.dialogManager.displayDialogText === 'function') {
                    // Try alternative method
                    window.dialogManager.displayDialogText(text);
                } else {
                    // Use simple DOM manipulation as fallback
                    this.createSimpleDialog(text);
                }
            } else if (window.game?.showDialog) {
                window.game.showDialog(text);
            } else {
                // Use simple DOM manipulation as fallback
                this.createSimpleDialog(text);
            }
        } catch (error) {
            console.error("Error showing message:", error);
            // Fallback to simple dialog
            this.createSimpleDialog(text);
        }
    }

    /**
     * Create a simple dialog box as fallback
     * @param {string} text - Text to display
     */
    createSimpleDialog(text) {
        let dialogBox = document.getElementById('simple-dialog');
        
        if (!dialogBox) {
            dialogBox = document.createElement('div');
            dialogBox.id = 'simple-dialog';
            dialogBox.style.position = 'absolute';
            dialogBox.style.bottom = '120px'; // Moved up to avoid buttons
            dialogBox.style.left = '50%';
            dialogBox.style.transform = 'translateX(-50%)';
            dialogBox.style.backgroundColor = 'rgba(0,0,0,0.7)';
            dialogBox.style.color = 'white';
            dialogBox.style.padding = '15px 20px';
            dialogBox.style.borderRadius = '5px';
            dialogBox.style.maxWidth = '80%';
            dialogBox.style.fontFamily = 'monospace';
            dialogBox.style.fontSize = '14px';
            dialogBox.style.zIndex = '900'; // Keep under command buttons
            document.body.appendChild(dialogBox);
        }
        
        dialogBox.textContent = text;
        dialogBox.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            dialogBox.style.display = 'none';
        }, 5000);
    }

    processHotspotInteraction(hotspot, action) {
        console.log(`Processing hotspot interaction: ${hotspot.id}, action: ${action}`);
        
        // Handle inventory items
        if (action === 'take' && hotspot.interactions?.take?.includes("inventory")) {
            console.log(`Adding ${hotspot.id} to inventory`);
            this.addToInventory(hotspot.id);
            return true;
        }
        
        // Handle readable items
        if (action === 'look' && hotspot.readable) {
            console.log(`Reading ${hotspot.id}`);
            this.showDocument(hotspot.readable);
            return true;
        }
        
        // Handle standard interactions
        if (hotspot.interactions && hotspot.interactions[action]) {
            const message = hotspot.interactions[action];
            console.log(`Showing interaction message: ${message}`);
            this.showMessage(message);
            return true;
        }
        
        // Handle scene transitions via doors - fixed implementation
        if (action === 'use' && hotspot.id.toLowerCase().includes('door')) {
            // Debug information
            console.log(`Door interaction with ${hotspot.id} in ${this.currentScene}`);
            console.log(`Door hotspot details:`, JSON.stringify(hotspot));
            
            // Validate target scene exists
            if (hotspot.targetScene && window.GAME_DATA?.scenes?.[hotspot.targetScene]) {
                console.log(`Valid target scene: ${hotspot.targetScene}`);
                
                // Get target position or use defaults
                const targetX = hotspot.targetX || 400;
                const targetY = hotspot.targetY || 350;
                
                // Load the target scene
                this.loadScene(hotspot.targetScene);
                
                // Position the player at the target location
                this.playerPosition.x = targetX;
                this.playerPosition.y = targetY;
                
                console.log(`Transitioned to ${hotspot.targetScene} at position (${targetX}, ${targetY})`);
                return true;
            } else {
                console.error(`Invalid target scene: ${hotspot.targetScene}`);
                this.showMessage("This door doesn't seem to go anywhere.");
            }
        }
        
        return false;
    }

    showDocument(text) {
        // Check if we have a custom document viewer
        const documentViewer = document.getElementById('document-viewer');
        
        if (documentViewer) {
            // Use the existing document viewer
            const content = document.getElementById('document-content');
            if (content) content.textContent = text;
            documentViewer.style.display = 'block';
            
            // Add close button functionality if not already set up
            const closeBtn = document.getElementById('document-close');
            if (closeBtn && !closeBtn.hasClickHandler) {
                closeBtn.addEventListener('click', () => {
                    documentViewer.style.display = 'none';
                });
                closeBtn.hasClickHandler = true;
            }
        } else {
            // Create a simple document viewer
            const viewer = document.createElement('div');
            viewer.id = 'document-viewer';
            viewer.style.position = 'absolute';
            viewer.style.left = '50%';
            viewer.style.top = '50%';
            viewer.style.transform = 'translate(-50%, -50%)';
            viewer.style.width = '60%';
            viewer.style.maxHeight = '70%';
            viewer.style.padding = '20px';
            viewer.style.backgroundColor = '#f5f5dc';  // Paper-like color
            viewer.style.border = '1px solid #8B4513';
            viewer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            viewer.style.overflow = 'auto';
            viewer.style.zIndex = '1000';
            viewer.style.fontFamily = 'monospace';
            
            // Create content area
            const content = document.createElement('div');
            content.id = 'document-content';
            content.textContent = text;
            content.style.margin = '10px 0';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.id = 'document-close';
            closeBtn.textContent = 'Close';
            closeBtn.style.display = 'block';
            closeBtn.style.margin = '10px auto';
            closeBtn.style.padding = '5px 15px';
            closeBtn.hasClickHandler = true;
            
            closeBtn.addEventListener('click', () => {
                viewer.style.display = 'none';
            });
            
            // Assemble document viewer
            viewer.appendChild(content);
            viewer.appendChild(closeBtn);
            
            // Add to document body
            document.body.appendChild(viewer);
        }
    }

    addToInventory(itemId) {
        if (!itemId) return false;
        
        // Check if item already exists in inventory
        if (this.inventory.includes(itemId)) {
            this.showMessage(`You already have the ${itemId}.`);
            return false;
        }
        
        // Add to engine's internal inventory
        this.inventory.push(itemId);
        
        // Update game's inventory if it exists
        if (window.game && window.game.gameState) {
            if (!Array.isArray(window.game.gameState.inventory)) {
                window.game.gameState.inventory = [];
            }
            window.game.gameState.inventory.push(itemId);
            
            // Update inventory UI if method exists
            if (typeof window.game.updateInventoryUI === 'function') {
                window.game.updateInventoryUI();
            }
        }
        
        // Also update GAME_DATA inventory if it exists
        if (window.GAME_DATA) {
            if (!Array.isArray(window.GAME_DATA.inventory)) {
                window.GAME_DATA.inventory = [];
            }
            if (!window.GAME_DATA.inventory.includes(itemId)) {
                window.GAME_DATA.inventory.push(itemId);
            }
        }
        
        this.showMessage(`Added ${itemId} to inventory.`);
        return true;
    }

    movePlayerToPoint(x, y) {
        // Calculate direction to target
        const dx = x - this.playerPosition.x;
        const dy = y - this.playerPosition.y;

        // Don't allow clicking on locations with collision objects
        if (this.checkCollisionAtPoint(x, y)) {
            console.log("Can't move there - obstacle in the way");
            this.showMessage("I can't walk there.");
            return;
        }
        
        // Set facing direction based on dominant axis
        if (Math.abs(dx) > Math.abs(dy)) {
            this.playerFacing = dx > 0 ? 'right' : 'left';
        } else {
            this.playerFacing = dy > 0 ? 'down' : 'up';
        }
        
        // Set walking state
        this.isWalking = true;
        
        // Move player to target over time (in update loop)
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * Check if there's a collision at the specified point
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean} True if there's a collision
     */
    checkCollisionAtPoint(x, y) {
        // Get collision objects for the current scene
        const collisionObjects = this.getSceneCollisionObjects();
        
        // Check each object for collision
        for (const obj of collisionObjects) {
            // Enhanced collision detection with debug info
            if (this.debugMode) {
                console.log(`Checking collision with object: ${JSON.stringify(obj)}`);
            }

            if (obj.type === 'rect') {
                // Rectangle collision
                const left = obj.x - obj.width / 2;
                const right = obj.x + obj.width / 2;
                const top = obj.y - obj.height / 2;
                const bottom = obj.y + obj.height / 2;
                
                if (x >= left && x <= right && y >= top && y <= bottom) {
                    if (this.debugMode) {
                        console.log(`Collision detected with rectangle at (${obj.x}, ${obj.y})`);
                    }
                    return true;
                }
            } else if (obj.type === 'circle') {
                // Circle collision
                const distX = x - obj.x;
                const distY = y - obj.y;
                const distance = Math.sqrt(distX * distX + distY * distY);
                
                if (distance <= obj.radius) {
                    if (this.debugMode) {
                        console.log(`Collision detected with circle at (${obj.x}, ${obj.y})`);
                    }
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Check if there's a collision along the path from current position to target
     * @param {number} nextX - Target X coordinate
     * @param {number} nextY - Target Y coordinate
     * @returns {boolean} True if there's a collision
     */
    checkCollisionAtPath(nextX, nextY) {
        // Current position
        const currentX = this.playerPosition.x;
        const currentY = this.playerPosition.y;
        
        // Check if target position has collision
        if (this.checkCollisionAtPoint(nextX, nextY)) {
            return true;
        }
        
        // Also check intermediate points along path for large movements
        const distance = Math.sqrt(
            Math.pow(nextX - currentX, 2) + 
            Math.pow(nextY - currentY, 2)
        );
        
        // Only check path for longer movements
        if (distance > 10) {
            const steps = Math.ceil(distance / 5); // Check every 5 pixels
            
            for (let i = 1; i < steps; i++) {
                const ratio = i / steps;
                const checkX = currentX + (nextX - currentX) * ratio;
                const checkY = currentY + (nextY - currentY) * ratio;
                
                if (this.checkCollisionAtPoint(checkX, checkY)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Get collision objects for the current scene
     * @returns {Array} Array of collision objects
     */
    getSceneCollisionObjects() {
        if (!window.GAME_DATA || !window.GAME_DATA.scenes) {
            console.warn("Game data not loaded");
            return [];
        }
        
        const scene = window.GAME_DATA.scenes[this.currentScene];
        
        if (!scene) {
            console.warn(`Scene ${this.currentScene} not found in game data`);
            return [];
        }
        
        return scene.collisionObjects || [];
    }

    /**
     * Handle dialog interactions with NPCs
     * @param {Object} npc - The NPC object to interact with
     */
    handleNPCDialog(npc) {
        if (!npc) return;
        
        if (npc.dialogId) {
            try {
                // Ensure dialog manager exists or create one
                if (!window._dialogManager && typeof DialogManager === 'function') {
                    this.debugMode && console.log("Creating new dialog manager instance");
                    window._dialogManager = new DialogManager();
                }
                
                // Use optional chaining for more concise null checks
                if (window.dialogManager?.startDialog) {
                    window.dialogManager.startDialog(npc.dialogId);
                } else {
                    // Fallback if dialog manager isn't available
                    this.showMessage(`${npc.name}: "Hello there!"`);
                    console.warn("Dialog manager not available - using fallback message");
                }
            } catch (err) {
                console.error(`Dialog error for NPC ${npc.name}:`, err);
                this.showMessage(`${npc.name} wants to speak but there was an error.`);
            }
        } else {
            // If no dialog system, use simple message
            const dialogText = npc.dialog || `${npc.name || 'This person'} has nothing to say right now.`;
            this.showMessage(dialogText);
        }
    }

    /**
     * Get scene data by name
     * @param {string} sceneName - Name of the scene
     * @returns {object} Scene data object
     */
    getSceneData(sceneName) {
        const scene = sceneName || this.currentScene;
        return window.GAME_DATA?.scenes?.[scene];
    }

    /**
     * Update cursor style based on what's under the mouse pointer
     */
    updateCursorStyle() {
        if (!this.canvas || this.lastMouseX === undefined || this.lastMouseY === undefined) return;
        
        // Default to pointer cursor
        let cursorStyle = 'pointer';
        
        // Check if mouse is over an interactive element
        const x = this.lastMouseX;
        const y = this.lastMouseY;
        
        // Check for NPCs under cursor
        const npcsInScene = this.npcs[this.currentScene] || [];
        let overInteractive = npcsInScene.some(npc => {
            const dx = Math.abs(x - npc.x);
            const dy = Math.abs(y - npc.y);
            return dx < 30 && dy < 50;
        });
        
        // Check for hotspots under cursor
        if (!overInteractive && window.GAME_DATA?.scenes?.[this.currentScene]?.hotspots) {
            const hotspots = window.GAME_DATA.scenes[this.currentScene].hotspots;
            overInteractive = hotspots.some(hotspot => {
                const hotspotWidth = hotspot.width || 20;
                const hotspotHeight = hotspot.height || 20;
                
                return x >= hotspot.x - hotspotWidth/2 && 
                       x <= hotspot.x + hotspotWidth/2 && 
                       y >= hotspot.y - hotspotHeight/2 && 
                       y <= hotspot.y + hotspotHeight/2;
            });
        }
        
        // Apply appropriate cursor
        this.canvas.style.cursor = overInteractive ? 'pointer' : 'default';
    }

    // Add method to initialize the dialog system specifically
    initDialogSystem() {
        try {
            // Ensure DialogManager is loaded
            if (typeof window.DialogManager === 'function' && !window._dialogManager) {
                console.log("Initializing dialog system...");
                window._dialogManager = new DialogManager();
                
                // Force access through the getter to ensure proper initialization
                const dm = window.dialogManager;
                console.log("Dialog system initialized:", dm ? "success" : "failed");
            }
        } catch (err) {
            console.error("Failed to initialize dialog system:", err);
        }
        return !!window._dialogManager;
    }

    // Add missing handleDialogAction method needed by DialogManager
    handleDialogAction(action) {
        if (!action) return;
        console.log(`Handling dialog action: ${action}`);
        
        // Handle special dialog actions like scene transitions or inventory changes
        if (action.startsWith('gotoScene:')) {
            const sceneName = action.split(':')[1];
            if (sceneName) {
                this.loadScene(sceneName);
            }
        } else if (action.startsWith('addItem:')) {
            const itemName = action.split(':')[1];
            if (itemName) {
                this.addToInventory(itemName);
            }
        }
    }

    // Add a collision check method for NPCs
    checkNPCCollision(npc, nextX, nextY) {
        const npcRadius = 15; // Smaller collision radius for NPCs
        
        // Get collision objects for current scene
        const sceneCollisions = this.getSceneCollisionObjects();
        
        // Check against scene objects
        for (const obj of sceneCollisions) {
            if (obj.type === 'rect') {
                // Calculate distances
                const halfWidth = obj.width / 2;
                const halfHeight = obj.height / 2;
                
                // Check overlap between NPC circle and rectangle
                if (nextX + npcRadius >= obj.x - halfWidth &&
                    nextX - npcRadius <= obj.x + halfWidth &&
                    nextY + npcRadius >= obj.y - halfHeight &&
                    nextY - npcRadius <= obj.y + halfHeight) {
                    return true; // Collision detected
                }
            } else if (obj.type === 'circle') {
                // Calculate distance between centers
                const distance = Math.sqrt((nextX - obj.x) ** 2 + (nextY - obj.y) ** 2);
                if (distance < obj.radius + npcRadius) {
                    return true; // Collision detected
                }
            }
        }
 
        // Check collisions with other NPCs to avoid overlapping
        for (const otherNPC of this.npcs[this.currentScene]) {
            if (otherNPC !== npc) {
                const distance = Math.sqrt((nextX - otherNPC.x) ** 2 + (nextY - otherNPC.y) ** 2);
                if (distance < npcRadius * 2) {
                    return true; // Collision with another NPC
                }
            }
        }
        
        // Check collision with player
        const playerDistance = Math.sqrt(
            (nextX - this.playerPosition.x) ** 2 + 
            (nextY - this.playerPosition.y) ** 2
        );
        if (playerDistance < npcRadius + this.playerCollisionRadius) {
            return true; // Collision with player
        }
        
        return false; // No collision
    }

    // Add method to ensure dialog system correctly handles dialog ended state
    dialogEnded() {
        console.log("Dialog ended, returning control to game");
        // Handle any post-dialog logic here
    }

    // Add improved debug method
    debugDrawCollisions() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const collisionObjects = this.getSceneCollisionObjects();
        
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2;
        
        for (const obj of collisionObjects) {
            if (obj.type === 'rect') {
                // Draw rectangle
                ctx.strokeStyle = 'red';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.fillRect(
                    obj.x - obj.width/2, 
                    obj.y - obj.height/2, 
                    obj.width, 
                    obj.height
                );
                ctx.strokeRect(
                    obj.x - obj.width/2, 
                    obj.y - obj.height/2, 
                    obj.width, 
                    obj.height
                );
            } else if (obj.type === 'circle') {
                // Draw circle
                ctx.strokeStyle = 'blue';
                ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(
                    obj.x, 
                    obj.y, 
                    obj.radius, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                ctx.stroke();
            }
        }
        
        // Draw player collision radius
        ctx.strokeStyle = 'green';
        ctx.beginPath();
        ctx.arc(
            this.playerPosition.x, 
            this.playerPosition.y, 
            this.playerCollisionRadius, 
            0, 
            Math.PI * 2
        );
        ctx.stroke();
        
        // Draw interaction radius
        ctx.strokeStyle = 'yellow';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
            this.playerPosition.x, 
            this.playerPosition.y, 
            this.interactionDistance, 
            0, 
            Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.restore();
    }

    initializeLighting() {
        // Add light sources for different scenes
        this.lightSources = [];
        
        // Police station lighting
        if (this.currentScene === 'policeStation') {
            this.lightSources.push(
                { x: 400, y: 200, radius: 150, intensity: 0.8, color: '#FFFFFF' }, // Ceiling lights
                { x: 680, y: 150, radius: 50, intensity: 0.6, color: '#FFE4B5' },   // Coffee machine light
                { x: 200, y: 320, radius: 80, intensity: 0.7, color: '#87CEEB' }    // Computer screen
            );
        }
    }
    
    initializeWeatherEffects() {
        // Initialize weather based on scene
        if (this.currentScene === 'downtown') {
            // Add subtle rain effect for downtown
            this.particleSystem.addRainEmitter();
        }
    }
    
    // Enhanced screen effects
    screenShakeEffect(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    screenFlashEffect(color, intensity, duration) {
        this.screenFlash.color = color;
        this.screenFlash.intensity = intensity;
        this.screenFlash.duration = duration;
    }
    
    startSceneTransition(type = 'fade') {
        this.transition.active = true;
        this.transition.progress = 0;
        this.transition.type = type;
    }

    updateScreenEffects(deltaTime) {
        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            if (this.screenShake.duration <= 0) {
                this.screenShake.intensity = 0;
            }
        }
        
        // Update screen flash
        if (this.screenFlash.duration > 0) {
            this.screenFlash.duration -= deltaTime;
            this.screenFlash.intensity = Math.max(0, this.screenFlash.intensity * 0.95);
            if (this.screenFlash.duration <= 0) {
                this.screenFlash.intensity = 0;
            }
        }
        
        // Update transitions
        if (this.transition.active) {
            this.transition.progress += deltaTime / 1000;
            if (this.transition.progress >= 1) {
                this.transition.active = false;
                this.transition.progress = 0;
            }
        }
    }
    
    updateLighting(deltaTime) {
        // Subtle lighting animation
        this.ambientLight = 0.8 + Math.sin(this.animationFrame * 0.01) * 0.05;
        
        // Animate light sources
        for (const light of this.lightSources) {
            if (light.flicker) {
                light.intensity = light.baseIntensity + Math.random() * 0.1 - 0.05;
            }
        }
    }
    
    applyScreenShake() {
        if (this.screenShake.intensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
            const shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
            this.ctx.translate(shakeX, shakeY);
        }
    }
    
    applyScreenFlash() {
        if (this.screenFlash.intensity > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.screenFlash.intensity;
            this.ctx.fillStyle = this.screenFlash.color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }    renderWithSierraGraphics() {
        try {
            // Clear with authentic Sierra background
            this.sierraGraphics.clearScreen();
            
            // Draw scene background with Sierra style
            switch (this.currentScene) {
                case 'policeStation':
                    if (this.sierraGraphics.drawPoliceStation) {
                        this.sierraGraphics.drawPoliceStation();
                    } else {
                        this.drawCurrentScene(); // Fallback
                    }
                    break;
                case 'downtown':
                    if (this.sierraGraphics.drawDowntown) {
                        this.sierraGraphics.drawDowntown();
                    } else {
                        this.drawCurrentScene(); // Fallback
                    }
                    break;
                case 'sheriffOffice':
                    if (this.sierraGraphics.drawSheriffOffice) {
                        this.sierraGraphics.drawSheriffOffice();
                    } else {
                        this.drawCurrentScene(); // Fallback
                    }
                    break;
                case 'briefingRoom':
                    if (this.sierraGraphics.drawBriefingRoom) {
                        this.sierraGraphics.drawBriefingRoom();
                    } else {
                        this.drawCurrentScene(); // Fallback
                    }
                    break;
                default:
                    this.drawCurrentScene(); // Fallback to original rendering
                    return;
            }
        } catch (error) {
            console.warn("SierraGraphics error, falling back to standard rendering:", error);
            this.drawCurrentScene();
            return;
        }
        
        // Draw NPCs with Sierra character style
        for (const npcId in this.npcs) {
            const npc = this.npcs[npcId];
            if (npc.scene === this.currentScene && npc.visible !== false) {
                this.sierraGraphics.drawCharacter(
                    npc.x || npc.position?.x || 0,
                    npc.y || npc.position?.y || 0,
                    npc.name,
                    npc.facing || 'down',
                    npc.action || 'standing'
                );
            }
        }
        
        // Draw player with Sierra character style
        this.sierraGraphics.drawCharacter(
            this.playerPosition.x,
            this.playerPosition.y,
            'sonny',
            this.playerFacing,
            this.isWalking ? 'walking' : 'standing'
        );
        
        // Draw hotspots and interactable objects
        this.drawSierraHotspots();
        
        // Draw UI elements
        this.renderSierraUI();
    }
    
    drawSierraHotspots() {
        // Draw hotspots for current scene
        const sceneData = this.getSceneData(this.currentScene);
        if (sceneData && sceneData.hotspots) {
            for (const hotspot of sceneData.hotspots) {
                if (hotspot.visible !== false) {
                    this.sierraGraphics.drawHotspot(hotspot);
                }
            }
        }
    }
    
    renderSierraUI() {
        // Draw Sierra-style command interface
        this.sierraGraphics.drawCommandInterface();
        
        // Draw inventory if open
        if (this.inventoryOpen) {
            this.sierraGraphics.drawInventory(this.inventory);
        }
        
        // Draw police procedures panel if applicable
        if (this.policeGameplay && this.policeGameplay.currentProcedure) {
            this.sierraGraphics.drawProcedurePanel(this.policeGameplay.currentProcedure);
        }
        
        // Draw case information panel
        if (this.policeStory && this.policeStory.currentCase) {
            this.sierraGraphics.drawCasePanel(this.policeStory.currentCase);
        }
        
        // Draw score display
        if (this.policeGameplay) {
            this.sierraGraphics.drawScoreDisplay(this.policeGameplay.score, this.policeGameplay.rank);
        }
    }
    
    // Police UI Update Methods
    updatePoliceUI() {
        this.updateProcedurePanel();
        this.updateScoreDisplay();
        this.updateCaseInfo();
    }
    
    updateProcedurePanel() {
        const procedurePanel = document.getElementById('procedure-panel');
        if (!procedurePanel || !this.policeGameplay) return;
        
        const currentProcedure = this.policeGameplay.currentProcedure;
        if (currentProcedure) {
            procedurePanel.style.display = 'block';
            const stepsList = procedurePanel.querySelector('.procedure-steps');
            if (stepsList) {
                stepsList.innerHTML = '';
                
                currentProcedure.steps.forEach((step, index) => {
                    const stepElement = document.createElement('li');
                    stepElement.className = step.completed ? 'step completed' : 'step pending';
                    stepElement.textContent = step.description;
                    
                    if (index === currentProcedure.currentStep) {
                        stepElement.classList.add('current');
                    }
                    
                    stepsList.appendChild(stepElement);
                });
            }
        } else {
            procedurePanel.style.display = 'none';
        }
    }
    
    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay && this.policeGameplay) {
            const score = this.policeGameplay.score;
            const rank = this.policeGameplay.rank;
            scoreDisplay.textContent = `Score: ${score} | Rank: ${rank}`;
        }
    }      updateCaseInfo() {
        const caseInfo = document.getElementById('case-info');
        if (!caseInfo) return;
        
        // Hide case info if police story system isn't available
        if (!this.policeStory) {
            caseInfo.style.display = 'none';
            return;
        }
        
        const currentCase = this.policeStory.currentCase;
        if (currentCase && currentCase.title) {
            caseInfo.style.display = 'block';
            caseInfo.classList.add('visible');
            
            // Build objectives list with better error handling
            let objectivesList = '';
            if (currentCase.objectives && Array.isArray(currentCase.objectives)) {
                objectivesList = currentCase.objectives.map(obj => {
                    if (obj && typeof obj === 'object') {
                        const status = obj.completed ? 'completed' : 'pending';
                        const description = obj.description || obj.text || 'Unknown objective';
                        return `<li class="${status}">• ${description}</li>`;
                    }
                    return `<li class="pending">• ${obj || 'Unknown objective'}</li>`;
                }).join('');
            } else {
                objectivesList = `
                    <li class="pending">• Begin patrol shift</li>
                    <li class="pending">• Conduct traffic stops</li>
                    <li class="pending">• Follow proper procedure</li>
                    <li class="pending">• Write accurate reports</li>
                `;
            }
            
            caseInfo.innerHTML = `
                <button id="case-info-close" type="button">×</button>
                <h3>Current Case</h3>
                <p><strong>${currentCase.title || 'Traffic Patrol'}</strong></p>
                <p>${currentCase.description || 'Begin your shift and patrol the streets of Lytton.'}</p>
                <div class="objectives">
                    <h4>Objectives:</h4>
                    <ul>${objectivesList}</ul>
                </div>
            `;
            
            // Add proper event listener after creating the button
            const closeBtn = caseInfo.querySelector('#case-info-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Close button clicked');
                    window.dismissCaseInfo(e);
                });
            }
        } else {
            // Show a default message instead of hiding completely
            caseInfo.style.display = 'block';
            caseInfo.classList.add('visible');
            caseInfo.innerHTML = `
                <button id="case-info-close" type="button">×</button>
                <h3>Police Officer Status</h3>
                <p><strong>Officer Sonny Bonds</strong></p>
                <p>Badge #2847 - Lytton Police Department</p>
                <p>On Patrol - Ready for assignment</p>
                <div class="objectives">
                    <h4>Current Objectives:</h4>
                    <ul>
                        <li class="pending">• Report for duty</li>
                        <li class="pending">• Begin traffic patrol</li>
                        <li class="pending">• Maintain law and order</li>
                    </ul>
                </div>
            `;
            
            // Add event listener for default case too
            const closeBtn = caseInfo.querySelector('#case-info-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Close button clicked (default case)');
                    window.dismissCaseInfo(e);
                });
            }
        }
    }

    showProcedureViolation(violation) {
        // Display procedure violation message
        const message = `PROCEDURE VIOLATION: ${violation}`;
        console.warn(message);
        
        // Show visual feedback
        this.screenFlash = {
            color: '#FF0000',
            intensity: 0.3,
            duration: 60
        };
        
        // Update score
        if (this.policeGameplay) {
            this.policeGameplay.addScore(-50); // Penalty for violation
        }
        
        // Play audio feedback
        this.playPoliceAudio('error');
    }
    
    showProcedureSuccess(procedure) {
        // Display procedure success message
        const message = `PROCEDURE COMPLETED: ${procedure}`;
        console.log(message);
        
        // Show positive visual feedback
        this.screenFlash = {
            color: '#00FF00',
            intensity: 0.2,
            duration: 30
        };
        
        // Award score
        if (this.policeGameplay) {
            this.policeGameplay.addScore(100);
        }        
        // Play audio feedback
        this.playPoliceAudio('success');
    }

    // Audio initialization method
    initAudioSystem() {
        if (window.soundManager) {
            this.soundManager = window.soundManager;
            console.log("Audio system initialized with SoundManager");
        } else {
            console.warn("SoundManager not available, audio disabled");
            this.soundManager = null;
        }
    }
    
    playSceneAudio(sceneName) {
        if (this.soundManager) {
            this.soundManager.playSceneMusic(sceneName);
        }
    }
    
    playPoliceAudio(audioType, data = null) {
        if (!this.soundManager) return;
        
        switch(audioType) {
            case 'radio':
                this.soundManager.playPoliceRadio(data);
                break;
            case 'siren':
                this.soundManager.playSirenSound();
                break;
            case 'arrest':
                this.soundManager.playArrestSound();
                break;
            case 'procedure_alert':
                this.soundManager.playProcedureAlert();
                break;
            case 'success':
                this.soundManager.playSuccessChime();
                break;
            case 'error':
                this.soundManager.playErrorBuzz();
                break;
            case 'gunshot':
                this.soundManager.playGunshot();
                break;
        }
   }    // Method to dismiss the case info overlay
    dismissCaseInfo() {
        const caseInfo = document.getElementById('case-info');
        if (caseInfo) {
            caseInfo.style.display = 'none';
        }
    }
}
    
// Export globally
window.GameEngine = GameEngine;

// Make dismissCaseInfo globally accessible
window.dismissCaseInfo = function(event) {
    console.log('dismissCaseInfo called');
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const caseInfo = document.getElementById('case-info');
    if (caseInfo) {
        console.log('Hiding case info panel');
        caseInfo.style.display = 'none';
        caseInfo.classList.remove('visible');
    } else {
        console.warn('case-info element not found');
    }
};

// Make toggleDebug globally accessible
window.toggleDebug = function() {
    if (window.gameEngine && typeof window.gameEngine.toggleDebugMode === 'function') {
        window.gameEngine.toggleDebugMode();
    } else {
        console.log('Debug toggle: gameEngine not ready or debug mode not available');
    }
};