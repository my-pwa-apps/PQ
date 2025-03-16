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
        // Scene loading logic
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
