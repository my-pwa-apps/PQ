class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.inventory = new Set();
        this.activeCommand = null;
        this.currentScene = null;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 450;
        this.ctx.imageSmoothingEnabled = false;
    }

    init() {
        this.setupEventListeners();
        soundManager.loadSound('click', 'assets/audio/click.mp3');
        soundManager.loadSound('pickup', 'assets/audio/pickup.mp3');
        this.loadScene('policeStation');
    }

    setupEventListeners() {
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeCommand = btn.dataset.action;
                this.updateCursor();
            });
        });

        this.canvas.addEventListener('click', (e) => {
            this.handleInteraction(e.offsetX, e.offsetY);
        });
    }

    updateCursor() {
        this.canvas.style.cursor = this.activeCommand ? 'crosshair' : 'default';
    }

    handleInteraction(x, y) {
        const hitObject = this.checkCollision(x, y);
        if (hitObject) {
            this.processInteraction(hitObject);
        }
    }

    loadScene(sceneId) {
        const scene = GAME_DATA.scenes[sceneId];
        const img = new Image();
        img.src = scene.background;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
        soundManager.playMusic(scene.music);
        this.currentScene = scene;
    }

    checkCollision(x, y) {
        if (!this.currentScene) return null;
        return this.currentScene.hotspots.find(hotspot =>
            x >= hotspot.x && x <= hotspot.x + hotspot.width &&
            y >= hotspot.y && y <= hotspot.y + hotspot.height
        );
    }

    processInteraction(hitObject) {
        if (!this.activeCommand) return;
        const interaction = hitObject.interactions[this.activeCommand];
        if (interaction) {
            this.showDialog(interaction);
            if (this.activeCommand === 'take') {
                this.inventory.add(hitObject.id);
                soundManager.playSound('pickup');
            }
        }
    }

    update() {
        // Game update logic
    }

    render() {
        // Rendering logic
    }

    showDialog(text) {
        this.dialogBox.innerText = text;
    }
}

const engine = new GameEngine();
window.addEventListener('load', () => engine.init());
