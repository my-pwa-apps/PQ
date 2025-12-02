class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        // Default to enhanced scene if available
        this.currentScene = (window.ENHANCED_SCENES && window.ENHANCED_SCENES.policeStation_lobby) ? 'policeStation_lobby' : 'policeStation';
        this.isRunning = false;
        this.debugMode = false;

        // Player starts on the floor, near the bottom of the walkable area
        this.playerPosition = { x: 400, y: 480 };
        this.playerFacing = 'up';
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
        
        // Interaction system
        this.pendingInteraction = null;
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
            this.setupUI(); // Initialize UI listeners
            
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
                
                // Calculate next position with perspective-aware speed
                // Characters move slower when further away (smaller on screen)
                const baseSpeed = 4;
                const perspectiveSpeed = baseSpeed * this.getPerspectiveScale(this.playerPosition.y);
                const nextX = this.playerPosition.x + dirX * perspectiveSpeed;
                const nextY = this.playerPosition.y + dirY * perspectiveSpeed;
                
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
                } else {
                    // Collision detected!
                    // If we have a pending interaction, check if we are close enough
                    if (this.pendingInteraction) {
                        const { type, target, action } = this.pendingInteraction;
                        const targetX = target.x || target.position?.x || 0;
                        const targetY = target.y || target.position?.y || 0;
                        
                        const dist = Math.sqrt((this.playerPosition.x - targetX) ** 2 + 
                                             (this.playerPosition.y - targetY) ** 2);
                        
                        // Allow interaction if we're close enough, even if we hit a wall
                        // Use a slightly larger buffer for collision stops
                        if (dist <= this.interactionDistance + 20) { 
                            this.isWalking = false;
                            this.targetX = undefined;
                            this.targetY = undefined;
                            
                            if (type === 'npc') {
                                this.interactWithNPC(target);
                            } else if (type === 'hotspot') {
                                this.processHotspotInteraction(target, action);
                            }
                            this.pendingInteraction = null;
                        }
                    }
                    
                    if (this.debugMode) {
                        console.log("Collision detected, cannot move to", nextX, nextY);
                    }
                }
            } else {
                // Reached the target
                this.isWalking = false;
                this.targetX = undefined;
                this.targetY = undefined;
                
                // Handle pending interaction if any
                if (this.pendingInteraction) {
                    const { type, target, action } = this.pendingInteraction;
                    // Check distance again to be sure
                    const dist = Math.sqrt((this.playerPosition.x - (target.x || target.position?.x)) ** 2 + 
                                         (this.playerPosition.y - (target.y || target.position?.y)) ** 2);
                                         
                    if (dist <= this.interactionDistance + 10) { // Small buffer
                        if (type === 'npc') {
                            this.interactWithNPC(target);
                        } else if (type === 'hotspot') {
                            this.processHotspotInteraction(target, action);
                        }
                    }
                    this.pendingInteraction = null;
                }
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
    
    renderWithSierraGraphics() {
        // 1. Draw the scene background (Walls, Floor)
        if (this.sierraGraphics.drawSceneBackground) {
            this.sierraGraphics.drawSceneBackground(this.currentScene);
        } else {
            this.sierraGraphics.drawScene(this.currentScene);
        }
        
        // 2. Collect all drawable entities for Depth Sorting
        let drawables = [];

        // A. Scene Props (Furniture, Plants, etc.)
        if (this.sierraGraphics.getSceneProps) {
            const props = this.sierraGraphics.getSceneProps(this.currentScene);
            props.forEach(prop => {
                drawables.push({
                    type: 'prop',
                    y: prop.y,
                    draw: prop.draw
                });
            });
        }
        
        // B. NPCs
        let npcsToDraw = [];
        if (this.npcs[this.currentScene]) {
            npcsToDraw = this.npcs[this.currentScene];
        } else {
            npcsToDraw = Object.values(this.npcs);
        }
        
        npcsToDraw.forEach(npc => {
            drawables.push({
                type: 'npc',
                x: npc.x || npc.position?.x || 0,
                y: npc.y || npc.position?.y || 0,
                sprite: npc.sprite || npc.name || 'officer_male',
                facing: npc.facing,
                action: npc.isWalking ? 'walking' : 'standing'
            });
        });
        
        // C. Player
        drawables.push({
            type: 'player',
            x: this.playerPosition.x,
            y: this.playerPosition.y,
            sprite: 'sonny',
            facing: this.playerFacing,
            action: this.isWalking ? 'walking' : 'standing'
        });
        
        // 3. Sort by Y position (Painter's Algorithm)
        // Objects further up (smaller Y) are drawn first (behind)
        drawables.sort((a, b) => a.y - b.y);
        
        // 4. Draw all entities in sorted order
        drawables.forEach(entity => {
            if (entity.type === 'prop') {
                // Draw prop (no scaling needed as props are usually fixed size/perspective)
                if (entity.draw) entity.draw();
            } else {
                // Draw Character with perspective scaling
                const scale = this.getPerspectiveScale(entity.y);
                this.sierraGraphics.drawCharacterWithScale(
                    entity.x,
                    entity.y,
                    entity.sprite,
                    entity.facing,
                    entity.action,
                    scale
                );
            }
        });

        // 5. Draw Hotspots (Debug only usually, or if needed)
        let hotspots = [];
        if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[this.currentScene]) {
            hotspots = window.ENHANCED_SCENES[this.currentScene].hotspots || [];
        }
        for (const hotspot of hotspots) {
            this.sierraGraphics.drawHotspot(hotspot);
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
        // Use the centralized SierraGraphics system for all scene rendering
        if (this.sierraGraphics) {
            this.sierraGraphics.drawScene(this.currentScene);
        } else {
            console.error("SierraGraphics not initialized!");
        }

        // NPCs and Player are drawn by render() method which calls sierraGraphics.drawCharacterWithScale
        // But we might need to ensure they are drawn ON TOP of the scene.
        // The render() method (lines ~450) clears screen, draws scene (via drawCurrentScene), then draws entities.
        // So we don't need to call drawNPCs/drawPlayer here if render() handles it.
        // Let's check render() again.
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
        
        // Check if scene exists in ENHANCED_SCENES or GAME_DATA
        let sceneData = null;
        if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[sceneId]) {
            sceneData = window.ENHANCED_SCENES[sceneId];
        } else if (window.GAME_DATA && window.GAME_DATA.scenes && window.GAME_DATA.scenes[sceneId]) {
            sceneData = window.GAME_DATA.scenes[sceneId];
        }
        
        if (!sceneData) {
            console.error(`Scene '${sceneId}' not found. Available scenes:`, 
                window.ENHANCED_SCENES ? Object.keys(window.ENHANCED_SCENES) : 'No enhanced scenes');
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
                // Avoid infinite recursion if sceneManager calls back to engine
                if (!window.sceneManager.loadingScene) {
                    window.sceneManager.loadScene(sceneId);
                }
            }
            
            // Play scene music if available
            const sceneMusic = sceneData.music;
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
        // Initialize NPCs object if not exists
        if (!this.npcs) {
            this.npcs = {};
        }
        
        // Clear existing NPCs
        this.npcs = {};
        
        // Check ENHANCED_SCENES first
        if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[sceneId] && window.ENHANCED_SCENES[sceneId].npcs) {
            const sceneNpcs = window.ENHANCED_SCENES[sceneId].npcs;
            for (const npc of sceneNpcs) {
                this.npcs[npc.id] = {
                    ...npc,
                    isWalking: npc.patrol || false,
                    animationFrame: 0,
                    lastAnimationTime: 0,
                    scene: sceneId
                };
                console.log(`Loaded Enhanced NPC: ${npc.name} in scene ${sceneId}`);
            }
            return;
        }
        
        // Fallback to GAME_DATA
        if (window.GAME_DATA?.npcs) {
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
    updateNPCs(deltaTime = 1/60) {
        if (!this.npcs) return;
        
        // Handle both flat map (from loadSceneNPCs) and scene-based map (legacy)
        let npcsToUpdate = [];
        if (this.npcs[this.currentScene]) {
            npcsToUpdate = this.npcs[this.currentScene];
        } else {
            npcsToUpdate = Object.values(this.npcs);
        }
        
        for (const npc of npcsToUpdate) {
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

    setupUI() {
        const buttons = document.querySelectorAll('.cmd-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                buttons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked
                btn.classList.add('active');
                // Set action
                this.activeAction = btn.dataset.action;
                console.log('Action set to:', this.activeAction);
            });
        });
        // Set default
        this.activeAction = 'walk'; 
    }

    handleInteraction(x, y) {
        // Reset walking state when user clicks
        this.isWalking = false;
        this.pendingInteraction = null;
        
        // Check for interaction with NPCs
        // Handle both flat map and scene-based map
        let npcsInScene = [];
        if (this.npcs) {
            if (this.npcs[this.currentScene]) {
                npcsInScene = this.npcs[this.currentScene];
            } else {
                npcsInScene = Object.values(this.npcs);
            }
        }
        
        for (const npc of npcsInScene) {
            // Simple hit testing for NPCs
            const npcX = npc.x || npc.position?.x || 0;
            const npcY = npc.y || npc.position?.y || 0;
            const dx = Math.abs(x - npcX);
            const dy = Math.abs(y - npcY);
            
            if (dx < 30 && dy < 50) {
                // Player clicked on an NPC
                const playerDistance = Math.sqrt((this.playerPosition.x - npcX) ** 2 + 
                                                 (this.playerPosition.y - npcY) ** 2);
                
                if (playerDistance < this.interactionDistance) {
                    this.interactWithNPC(npc);
                } else {
                    // Move to NPC then interact
                    this.movePlayerToPoint(npcX, npcY);
                    this.pendingInteraction = { type: 'npc', target: npc };
                }
                return;
            }
        }
        
        // Check for hotspots from ENHANCED_SCENES or GAME_DATA
        let hotspots = [];
        if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[this.currentScene]) {
            hotspots = window.ENHANCED_SCENES[this.currentScene].hotspots || [];
        } else if (window.GAME_DATA && window.GAME_DATA.scenes && window.GAME_DATA.scenes[this.currentScene]) {
            hotspots = window.GAME_DATA.scenes[this.currentScene].hotspots || [];
        }
            
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
                console.log(`Clicked on hotspot: ${hotspot.id || hotspot.name} at (${hotspotX},${hotspotY})`);
                
                // Check if player is close enough to interact
                const playerDistance = Math.sqrt((this.playerPosition.x - hotspotX) ** 2 + 
                                                (this.playerPosition.y - hotspotY) ** 2);
                
                const action = this.activeAction || window.game?.activeAction || 'use';

                if (playerDistance <= this.interactionDistance) {
                    console.log(`Interacting with hotspot: ${hotspot.id || hotspot.name}, distance: ${playerDistance}`);
                    
                    // Process the interaction
                    if (this.processHotspotInteraction) {
                        this.processHotspotInteraction(hotspot, action);
                    } else {
                        console.warn("processHotspotInteraction not defined");
                    }
                } else {
                    // Move to hotspot then interact
                    this.movePlayerToPoint(hotspotX, hotspotY);
                    this.pendingInteraction = { type: 'hotspot', target: hotspot, action: action };
                }
                
                return; // Stop processing after finding a hotspot
            }
        }
        
        // If player clicked on empty space, move there
        this.movePlayerToPoint(x, y);
    }

    movePlayerToPoint(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isWalking = true;
    }

    toggleInventory() {
        const panel = document.getElementById('inventory-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleProcedurePanel() {
        const panel = document.getElementById('procedure-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    cancelCurrentAction() {
        this.isWalking = false;
        this.targetX = undefined;
        this.targetY = undefined;
        this.pendingInteraction = null;
        if (this.policeGameplay) {
            this.policeGameplay.cancelCurrentProcedure();
        }
    }

    updateCursorStyle() {
        // Simple cursor update based on what's under the mouse
        if (this.lastMouseX && this.lastMouseY) {
            // Check for interactables
            // This is a simplified check, ideally we'd reuse the hit testing logic
            this.canvas.style.cursor = 'default';
            
            // Check NPCs
            if (this.npcs) {
                const npcsInScene = this.npcs[this.currentScene] || Object.values(this.npcs);
                for (const npc of npcsInScene) {
                    const dx = Math.abs(this.lastMouseX - (npc.x || npc.position?.x || 0));
                    const dy = Math.abs(this.lastMouseY - (npc.y || npc.position?.y || 0));
                    if (dx < 30 && dy < 50) {
                        this.canvas.style.cursor = 'pointer';
                        return;
                    }
                }
            }
            
            // Check hotspots
            let hotspots = [];
            if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[this.currentScene]) {
                hotspots = window.ENHANCED_SCENES[this.currentScene].hotspots || [];
            } else if (window.GAME_DATA && window.GAME_DATA.scenes && window.GAME_DATA.scenes[this.currentScene]) {
                hotspots = window.GAME_DATA.scenes[this.currentScene].hotspots || [];
            }
            
            for (const hotspot of hotspots) {
                const hx = hotspot.x;
                const hy = hotspot.y;
                const hw = hotspot.width || 20;
                const hh = hotspot.height || 20;
                
                if (this.lastMouseX >= hx - hw/2 && 
                    this.lastMouseX <= hx + hw/2 && 
                    this.lastMouseY >= hy - hh/2 && 
                    this.lastMouseY <= hy + hh/2) {
                    this.canvas.style.cursor = 'pointer';
                    return;
                }
            }
        }
    }

    showMessage(text) {
        if (!text) return;
        console.log("Game message:", text);
        
        // Try to use dialog manager if available
        if (window.dialogManager && typeof window.dialogManager.showDialog === 'function') {
            window.dialogManager.showDialog(text);
        } else {
            // Fallback to simple dialog
            this.createSimpleDialog(text);
        }
    }

    createSimpleDialog(text) {
        let dialogBox = document.getElementById('simple-dialog');
        if (!dialogBox) {
            dialogBox = document.createElement('div');
            dialogBox.id = 'simple-dialog';
            dialogBox.style.position = 'absolute';
            dialogBox.style.bottom = '120px';
            dialogBox.style.left = '50%';
            dialogBox.style.transform = 'translateX(-50%)';
            // Sierra AGI Style: White background, black text, double border
            dialogBox.style.backgroundColor = '#FFFFFF';
            dialogBox.style.color = '#000000';
            dialogBox.style.border = '4px double #000000';
            dialogBox.style.padding = '15px 20px';
            dialogBox.style.maxWidth = '80%';
            dialogBox.style.fontFamily = "'Courier New', monospace";
            dialogBox.style.fontWeight = "bold";
            dialogBox.style.zIndex = '900';
            dialogBox.style.boxShadow = '4px 4px 0px #000000';
            document.body.appendChild(dialogBox);
        }
        dialogBox.textContent = text;
        dialogBox.style.display = 'block';
        setTimeout(() => { dialogBox.style.display = 'none'; }, 5000);
    }

    processHotspotInteraction(hotspot, action) {
        console.log(`Processing hotspot interaction: ${hotspot.id}, action: ${action}`);
        
        // Handle NPC redirection
        if (hotspot.npc) {
            // Find the NPC object
            let npc = null;
            if (this.npcs[this.currentScene]) {
                // Check if it's an array or object
                if (Array.isArray(this.npcs[this.currentScene])) {
                    npc = this.npcs[this.currentScene].find(n => n.id === hotspot.npc);
                } else {
                    npc = this.npcs[this.currentScene][hotspot.npc];
                }
            } else if (this.npcs[hotspot.npc]) {
                npc = this.npcs[hotspot.npc];
            }
            
            if (npc) {
                this.interactWithNPC(npc);
                return true;
            }
        }

        // Handle inventory items
        if (action === 'take' && hotspot.interactions?.take?.includes("inventory")) {
            this.addToInventory(hotspot.id);
            return true;
        }
        
        // Handle readable items
        if (action === 'look' && (hotspot.readable || hotspot.content)) {
            this.showDocument(hotspot.content || hotspot.readable);
            return true;
        }
        
        // Handle standard interactions
        if (hotspot.interactions && hotspot.interactions[action]) {
            const message = hotspot.interactions[action];
            // Check if it's a special command (ALL CAPS with underscores)
            if (message.match(/^[A-Z_]+$/)) {
                // Handle special commands
                if (message.includes('TALK')) {
                    // Try to find associated NPC
                    if (hotspot.npc) {
                        // Already handled above, but just in case
                        const npc = this.npcs[this.currentScene]?.find?.(n => n.id === hotspot.npc);
                        if (npc) this.interactWithNPC(npc);
                    }
                } else if (message.includes('ENTER') || message.includes('LEAVE') || message.includes('RETURN')) {
                    // Scene transition
                    if (hotspot.targetScene) {
                        this.loadScene(hotspot.targetScene);
                        if (hotspot.targetX && hotspot.targetY) {
                            this.playerPosition.x = hotspot.targetX;
                            this.playerPosition.y = hotspot.targetY;
                        }
                    }
                }
            } else {
                this.showMessage(message);
            }
        }
        
        // Handle scene transitions (fallback)
        if ((action === 'use' || action === 'move') && (hotspot.targetScene || hotspot.id.toLowerCase().includes('door'))) {
            if (hotspot.targetScene) {
                this.loadScene(hotspot.targetScene);
                if (hotspot.targetX && hotspot.targetY) {
                    this.playerPosition.x = hotspot.targetX;
                    this.playerPosition.y = hotspot.targetY;
                }
            }
        }
    }

    addToInventory(itemId) {
        if (!itemId) return;
        if (this.inventory.includes(itemId)) {
            this.showMessage(`You already have the ${itemId}.`);
            return;
        }
        this.inventory.push(itemId);
        this.showMessage(`Added ${itemId} to inventory.`);
    }

    showDocument(text) {
        // Simple document viewer
        alert(text); // Fallback for now
    }

    interactWithNPC(npc) {
        console.log(`Interacting with NPC: ${npc.name}`);
        
        // Face towards the NPC
        const npcX = npc.x || npc.position?.x;
        const npcY = npc.y || npc.position?.y;
        
        if (this.playerPosition.x < npcX) {
            this.playerFacing = 'right';
        } else if (this.playerPosition.x > npcX) {
            this.playerFacing = 'left';
        } else if (this.playerPosition.y < npcY) {
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
    }
    
    handleNPCDialog(npc, dialogData = null) {
        if (dialogData) {
            // Use the provided dialog data
            if (this.dialogManager && this.dialogManager.showCustomDialog) {
                this.dialogManager.showCustomDialog(dialogData.text, dialogData.responses, (selectedOption) => {
                    // Handle the response
                    if (this.policeStory && selectedOption.text) {
                        // Derive key from npc.name
                        const key = npc.name.toLowerCase().replace(/ /g, '_');
                        const nextDialog = this.policeStory.handleCharacterDialog(key, selectedOption.text);
                        if (nextDialog) {
                            this.handleNPCDialog(npc, nextDialog);
                        }
                    }
                });
            } else if (this.dialogManager) {
                this.dialogManager.showDialog(dialogData.text, npc.name);
            } else {
                this.showMessage(`${npc.name}: ${dialogData.text}`);
            }
        } else {
            // Fallback to default dialog
            const defaultText = npc.dialog || "Hello officer.";
            if (this.dialogManager) {
                this.dialogManager.showDialog(defaultText);
            } else {
                this.showMessage(`${npc.name}: ${defaultText}`);
            }
        }
    }
    
    checkCollisionAtPoint(x, y) {
        // 1. Check if point is inside the walkable polygon (Priority 1)
        // In Sierra games, you are constrained to the walkable area (control lines)
        const walkablePoly = this.getWalkableArea();
        if (walkablePoly && walkablePoly.length > 0) {
            const isInWalkable = this.isPointInWalkableArea(x, y, walkablePoly);
            if (!isInWalkable) {
                if (this.debugMode) {
                    console.log(`Outside walkable area at (${x.toFixed(0)}, ${y.toFixed(0)}). Poly bounds: Y=${walkablePoly[0]?.y}-${walkablePoly[2]?.y}`);
                }
                return true; // Collision (outside walkable area)
            }
        } else {
            // Fallback boundary check if no polygon defined
            if (x < 20 || x > 780 || y < 200 || y > 580) {
                return true;
            }
        }

        // 2. Check against specific collision objects (Priority 2)
        // These are dynamic obstacles inside the walkable area
        const objects = this.getSceneCollisionObjects();
        
        for (const obj of objects) {
            if (obj.type === 'rect') {
                if (x >= obj.x && x <= obj.x + obj.width &&
                    y >= obj.y && y <= obj.y + obj.height) {
                    return true;
                }
            } else if (obj.type === 'circle') {
                const dx = x - obj.x;
                const dy = y - obj.y;
                if (dx * dx + dy * dy <= obj.radius * obj.radius) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    getWalkableArea() {
        // Check ENHANCED_SCENES first for precise polygon data
        if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[this.currentScene]) {
            if (window.ENHANCED_SCENES[this.currentScene].walkablePath) {
                const path = window.ENHANCED_SCENES[this.currentScene].walkablePath;
                if (this.debugMode) {
                    console.log(`Using ENHANCED_SCENES walkablePath for ${this.currentScene}:`, path);
                }
                return path;
            }
        }

        // Fallback to hardcoded defaults if not found
        const sceneWalkables = {
            'policeStation': [
                { x: 50, y: 380 },   // Top-left of floor
                { x: 750, y: 380 },  // Top-right of floor
                { x: 780, y: 580 },  // Bottom-right
                { x: 20, y: 580 }    // Bottom-left
            ],
            'policeStation_lobby': [
                { x: 50, y: 380 },
                { x: 750, y: 380 },
                { x: 780, y: 580 },
                { x: 20, y: 580 }
            ],
            'downtown': [
                { x: 20, y: 320 },   // Sidewalk starts higher
                { x: 780, y: 320 },
                { x: 780, y: 580 },
                { x: 20, y: 580 }
            ],
            'downtown_main': [
                { x: 20, y: 320 },
                { x: 780, y: 320 },
                { x: 780, y: 580 },
                { x: 20, y: 580 }
            ],
            'park': [
                { x: 20, y: 280 },   // Park has more open space
                { x: 780, y: 280 },
                { x: 780, y: 580 },
                { x: 20, y: 580 }
            ],
            'city_park': [
                { x: 20, y: 280 },
                { x: 780, y: 280 },
                { x: 780, y: 580 },
                { x: 20, y: 580 }
            ],
            'policeStation_briefing': [
                { x: 100, y: 400 },
                { x: 700, y: 400 },
                { x: 700, y: 580 },
                { x: 100, y: 580 }
            ]
        };
        
        return sceneWalkables[this.currentScene] || sceneWalkables['policeStation'];
    }
    
    isPointInWalkableArea(x, y, polygon) {
        // Ray-casting algorithm to check if point is inside polygon
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    checkNPCCollision(npc, x, y) {
        // Check against scene collision objects
        if (this.checkCollisionAtPoint(x, y)) {
            return true;
        }
        
        // Check against other NPCs
        const npcs = this.npcs[this.currentScene] || Object.values(this.npcs);
        for (const otherNPC of npcs) {
            if (otherNPC === npc) continue;
            
            const dx = x - (otherNPC.x || otherNPC.position?.x || 0);
            const dy = y - (otherNPC.y || otherNPC.position?.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 30) { // NPC collision radius
                return true;
            }
        }
        
        // Check against player
        const dx = x - this.playerPosition.x;
        const dy = y - this.playerPosition.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
            return true;
        }
        
        return false;
    }

    getSceneCollisionObjects() {
        let objects = [];
        
        // Get objects from ENHANCED_SCENES
        if (window.ENHANCED_SCENES && window.ENHANCED_SCENES[this.currentScene]) {
            if (window.ENHANCED_SCENES[this.currentScene].collisionObjects) {
                objects = objects.concat(window.ENHANCED_SCENES[this.currentScene].collisionObjects);
            }
        } 
        // Fallback to GAME_DATA
        else if (window.GAME_DATA && window.GAME_DATA.scenes && window.GAME_DATA.scenes[this.currentScene]) {
            const sceneData = window.GAME_DATA.scenes[this.currentScene];
            
            // Handle collisionObjects (legacy format)
            if (sceneData.collisionObjects) {
                objects = objects.concat(sceneData.collisionObjects);
            }
            
            // Handle collisionZones (GameData format: x1, y1, x2, y2)
            if (sceneData.collisionZones) {
                const zones = sceneData.collisionZones.map(zone => ({
                    type: 'rect',
                    x: zone.x1,
                    y: zone.y1,
                    width: zone.x2 - zone.x1,
                    height: zone.y2 - zone.y1
                }));
                objects = objects.concat(zones);
            }
        }
        
        return objects;
    }
    
    // Sierra-style perspective scaling based on Y position
    // Characters at the top of the walkable area (far away) are smaller
    // Characters at the bottom (close to camera) are larger
    getPerspectiveScale(y) {
        // Define the perspective range
        const horizonY = 340;  // Where the floor meets the wall (vanishing point)
        const foregroundY = 580; // Bottom of screen (closest to camera)
        
        // Clamp Y to valid range
        const clampedY = Math.max(horizonY, Math.min(foregroundY, y));
        
        // Calculate scale: 0.5 at horizon, 1.2 at foreground
        const minScale = 0.5;
        const maxScale = 1.2;
        const t = (clampedY - horizonY) / (foregroundY - horizonY);
        
        return minScale + (maxScale - minScale) * t;
    }
    
    initAudioSystem() {
        if (window.SoundManager) {
            this.soundManager = new window.SoundManager();
            this.soundManager.initialize().catch(e => console.warn("Audio init failed", e));
        }
    }

    initializeLighting() {
        this.lightSources = [];
        // Add default lighting based on scene
        if (this.currentScene === 'downtown' || this.currentScene === 'park') {
            // Night time lighting
            this.ambientLight = 0.3;
        } else {
            // Indoor lighting
            this.ambientLight = 0.9;
        }
    }

    initializeWeatherEffects() {
        this.weatherEffects.clear();
        // Add rain if needed
        if (this.currentScene === 'downtown' && Math.random() > 0.7) {
            this.weatherEffects.set('rain', { intensity: 0.5 });
        }
    }

    initDialogSystem() {
        if (window.DialogManager) {
            this.dialogManager = new window.DialogManager(this);
        }
    }

    updateLighting(deltaTime) {
        // Dynamic lighting updates
        if (this.lightSources.length > 0) {
            this.lightSources.forEach(light => {
                if (light.flicker) {
                    light.intensity = light.baseIntensity + (Math.random() - 0.5) * 0.1;
                }
            });
        }
    }

    updateScreenEffects(deltaTime) {
        // Screen shake decay
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;

            if (this.screenShake.duration <= 0) {
                this.screenShake.intensity = 0;
            }
        }
        
        // Screen flash decay
        if (this.screenFlash.duration > 0) {
            this.screenFlash.duration -= deltaTime;
            this.screenFlash.intensity = Math.max(0, this.screenFlash.intensity - deltaTime * 2);
        }
        
        // Transition update
        if (this.transition.active) {
            this.transition.progress += deltaTime * 2; // 0.5s transition
            if (this.transition.progress >= 1) {
                this.transition.active = false;
                this.transition.progress = 0;
            }
        }
    }

    updatePoliceUI() {
        // Update UI elements related to police gameplay
        if (this.policeGameplay) {
            // Update score if available
            if (this.policeGameplay.score !== undefined) {
                const scoreEl = document.getElementById('score-value');
                if (scoreEl) scoreEl.textContent = this.policeGameplay.score;
            }
        }
        
        // Update sound status
        const soundEl = document.getElementById('sound-status');
        if (soundEl && this.soundManager) {
            soundEl.textContent = this.soundManager.muted ? "OFF" : "ON";
        }
    }
    
    playSceneAudio(sceneId) {
        if (this.soundManager) {
            // Logic to play scene specific audio
        }
    }
    
    debugDrawCollisions() {
        const objects = this.getSceneCollisionObjects();
        this.ctx.save();
        
        // Draw collision objects in red
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        
        for (const obj of objects) {
            if (obj.type === 'rect') {
                this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            } else if (obj.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // Draw walkable area in green
        const walkable = this.getWalkableArea();
        if (walkable && walkable.length > 0) {
            this.ctx.strokeStyle = 'lime';
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(walkable[0].x, walkable[0].y);
            for (let i = 1; i < walkable.length; i++) {
                this.ctx.lineTo(walkable[i].x, walkable[i].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Draw horizon line
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 340);
        this.ctx.lineTo(800, 340);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw perspective scale info
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Player Y: ${Math.round(this.playerPosition.y)} | Scale: ${this.getPerspectiveScale(this.playerPosition.y).toFixed(2)}`, 10, 20);
        
        this.ctx.restore();
    }
}

// Export GameEngine to window
window.GameEngine = GameEngine;
