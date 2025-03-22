class GameEngine {
    constructor() {
        this.isRunning = false;
        this.requestID = null;
        this.collisionObjects = [];
        this.animations = new Map();
        this.colorCache = new Map();
        this.spriteCache = new Map();
        this.npcs = {};
        this.ambientAnimations = {};
        this.currentScene = null;
        this.playerPosition = { x: 0, y: 0 };
        this.debugMode = false;
    }

    init() {
        if (this.initialized) return;
        console.log('Initializing game engine...');
        this.setupCanvas();
        this.setupBufferCanvas();
        this.setupColorPalette();
        this.setupEventListeners();
        this.initialized = true;
        console.log('Game engine initialized successfully');
    }

    setupCanvas() {
        console.log("Setting up canvas");
        const dpr = window.devicePixelRatio || 1;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800 * dpr;
        this.canvas.height = 600 * dpr;
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
    }

    setupBufferCanvas() {
        console.log("Setting up buffer canvas");
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.canvas.width;
        this.bufferCanvas.height = this.canvas.height;
        this.bufferCtx = this.bufferCanvas.getContext('2d', { alpha: false });
    }

    setupEventListeners() {
        console.log("Setting up event listeners");
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd') this.handleMovement('right');
            if (e.key === 'a') this.handleMovement('left');
        });
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.handleInteraction(x, y);
        });
    }

    handleInteraction(x, y) {
        const collision = this.checkCollision(x, y);
        if (collision) {
            console.log(`Interacted with: ${collision.id}`);
        } else {
            console.log("No interaction detected.");
        }
    }

    checkCollision(x, y) {
        return this.collisionObjects.find(obj =>
            x >= obj.x && x <= obj.x + obj.width &&
            y >= obj.y && y <= obj.y + obj.height
        );
    }

    drawCurrentScene() {
        try {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this._draw3DScene(ctx, this.currentScene);
            this._drawUI(ctx);
        } catch (error) {
            console.error("Error drawing scene:", error);
            this._drawFallbackScene(this.ctx, this.currentScene);
        }
    }

    _draw3DScene(ctx, sceneId) {
        switch (sceneId) {
            case 'policeStation':
                this._draw3DPoliceStationScene(ctx);
                break;
            case 'downtown':
                this._draw3DDowntownScene(ctx);
                break;
            default:
                console.warn(`Unknown scene: ${sceneId}`);
        }
    }

    _draw3DPoliceStationScene(ctx) {
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, this.canvas.width, 300);
        ctx.fillStyle = '#8B4513'; // Floor
        ctx.fillRect(0, 300, this.canvas.width, 300);
    }

    _drawUI(ctx) {
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${window.game?.score || 0}`, 10, 20);
    }

    destroy() {
        console.log("Destroying game engine...");
        this.isRunning = false;
        if (this.requestID) cancelAnimationFrame(this.requestID);
        this.ctx = null;
        this.bufferCtx = null;
        this.collisionObjects = [];
        this.animations.clear();
        this.colorCache.clear();
        this.spriteCache.clear();
    }
}

window.GameEngine = GameEngine;