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
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 800 * dpr;
        this.canvas.height = 600 * dpr;
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.width = '800px';
        this.canvas.style.height = '600px';
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
        });

        document.addEventListener('keydown', (e) => {
            const directions = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
            if (directions[e.key]) {
                this.handleMovement(directions[e.key]);
            }
        });
    }

    // Add init method to properly initialize the engine
    async init() {
        try {
            this.setupCanvas();
            this.setupBufferCanvas();
            this.setupEventListeners();
            
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
        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime);
            this.render();
            this.lastFrameTime = timestamp;
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime = 1 / 60) {
        if (this.isWalking) {
            this.playerWalkCycle = (this.playerWalkCycle + 1) % 4;
        }
        this.updateNPCs(deltaTime);
        this.animationFrame++;
    }

    render() {
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCurrentScene();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
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
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(0, 250, this.canvas.width, this.canvas.height - 250);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, this.canvas.width, 240);
    }

    drawDowntown() {
        const ctx = this.offscreenCtx;
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
        ctx.fillStyle = uniformColor;
        ctx.fillRect(x - 10, y - 30, 20, 30);
        ctx.fillStyle = badgeColor;
        ctx.fillRect(x - 3, y - 25, 6, 6);
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
        }
    }

    // Add a loadScene method to handle scene changes
    loadScene(sceneId) {
        console.log(`Loading scene: ${sceneId}`);
        this.currentScene = sceneId;
        return true;
    }

    // Add missing updateNPCs function
    updateNPCs(deltaTime = 1/60) {
        if (!this.npcs || !this.npcs[this.currentScene]) return;
        
        const currentSceneNPCs = this.npcs[this.currentScene];
        
        for (const npc of currentSceneNPCs) {
            // Update NPC animation state
            if (npc.isWalking) {
                // Simple animation for walking
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
                        npc.x += (dx / distance) * speed;
                        npc.y += (dy / distance) * speed;
                        npc.facing = Math.abs(dx) > Math.abs(dy) ? 
                            (dx > 0 ? 'right' : 'left') : 
                            (dy > 0 ? 'down' : 'up');
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
}

// Export globally
window.GameEngine = GameEngine;