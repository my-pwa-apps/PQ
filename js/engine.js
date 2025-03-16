class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.inventory = new Set();
        this.activeCommand = null;
        this.currentScene = null;
        this.bgMusic = document.getElementById('bgMusic');
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
        document.body.addEventListener('click', () => {
            if (this.bgMusic.paused) {
                this.bgMusic.play().catch(error => console.error('Failed to play background music:', error));
            }
        }, { once: true });
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

    drawPoliceStation() {
        this.ctx.fillStyle = '#000080'; // Dark blue background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF'; // White desk
        this.ctx.fillRect(100, 200, 80, 60);
        this.ctx.fillStyle = '#808080'; // Gray evidence locker
        this.ctx.fillRect(300, 150, 50, 100);
        // Add more details
        this.ctx.fillStyle = '#FFD700'; // Yellow badge
        this.ctx.fillRect(110, 210, 20, 20);
        this.ctx.fillStyle = '#000000'; // Black text
        this.ctx.fillText('Police Station', 10, 20);
    }

    drawDowntown() {
        this.ctx.fillStyle = '#404040'; // Dark gray background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#000000'; // Black alley
        this.ctx.fillRect(200, 300, 100, 150);
        this.ctx.fillStyle = '#A52A2A'; // Brown shop
        this.ctx.fillRect(400, 200, 80, 100);
        // Add more details
        this.ctx.fillStyle = '#FFFFFF'; // White windows
        this.ctx.fillRect(410, 210, 20, 20);
        this.ctx.fillRect(450, 210, 20, 20);
        this.ctx.fillStyle = '#000000'; // Black text
        this.ctx.fillText('Downtown', 10, 20);
    }

    drawPark() {
        this.ctx.fillStyle = '#008000'; // Green background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#654321'; // Brown bench
        this.ctx.fillRect(150, 250, 100, 50);
        this.ctx.fillStyle = '#00FFFF'; // Cyan fountain
        this.ctx.fillRect(350, 150, 120, 100);
        // Add more details
        this.ctx.fillStyle = '#FFFFFF'; // White water
        this.ctx.fillRect(360, 160, 100, 80);
        this.ctx.fillStyle = '#000000'; // Black text
        this.ctx.fillText('Park', 10, 20);
    }

    loadScene(sceneId) {
        this.currentScene = GAME_DATA.scenes[sceneId];
        switch (sceneId) {
            case 'policeStation':
                this.drawPoliceStation();
                break;
            case 'downtown':
                this.drawDowntown();
                break;
            case 'park':
                this.drawPark();
                break;
        }
        soundManager.playMusic(this.currentScene.music);
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
