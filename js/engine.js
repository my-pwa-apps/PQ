// Add dependency check at the top
if (typeof Game === 'undefined') {
    throw new Error('Game class must be loaded before GameEngine');
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.inventory = new Set();
        this.activeCommand = null;
        this.currentScene = 'policeStation';
        this.dialogBox = document.getElementById('dialog-box');
        this.caseInfoPanel = document.getElementById('case-info');
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.keyboardEnabled = true;
        this.setupCanvas();
        this.isRendering = false;
        this.lastFrameTime = 0;
        this.colors = this.setupColorPalette();
        this.playerPosition = { x: 400, y: 350 }; // Default player position
        this.isWalking = false;
        this.walkTarget = null;
        this.game = new Game(); // Create game instance in constructor
        this.collisionObjects = []; // Add collision objects array
        this.npcs = {
            policeStation: [
                { 
                    x: 300, y: 350, 
                    type: 'officer', 
                    name: 'Officer Keith',
                    patrolPoints: [{x: 300, y: 350}, {x: 500, y: 350}, {x: 500, y: 400}],
                    currentPatrolPoint: 0,
                    facing: 'right'
                },
                { 
                    x: 500, y: 350, 
                    type: 'sergeant', 
                    name: 'Sergeant Dooley',
                    patrolPoints: [{x: 500, y: 350}, {x: 200, y: 350}, {x: 350, y: 400}],
                    currentPatrolPoint: 0,
                    facing: 'left'
                },
                {
                    x: 450, y: 340,
                    type: 'officer',
                    name: 'Officer Sarah',
                    patrolPoints: [{x: 450, y: 340}], // Stationary at desk
                    currentPatrolPoint: 0,
                    facing: 'down',
                    isFemale: true,
                    isReceptionist: true
                }
            ]
        };
        this.floorLevel = {min: 200, max: 430}; // Adjust floor level for more walking space
        this.canvas.style.cursor = 'pointer'; // Set default cursor
        this.animationFrame = 0;
        this.playerFacing = 'down';
        this.walkCycle = 0;
        this.roomBoundaries = {
            policeStation: {
                walls: [
                    {x: 0, y: 300, width: this.canvas.width, height: 10}, // North wall
                    {x: 0, y: 0, width: 10, height: 450}, // West wall
                    {x: 790, y: 0, width: 10, height: 450}, // East wall
                    {x: 0, y: 450, width: this.canvas.width, height: 10}, // South wall
                    {x: 380, y: 320, width: 190, height: 60} // Reception desk collision
                ],
                doors: [
                    {x: 50, y: 100, width: 60, height: 120, target: 'sheriffsOffice'}, // Sheriff's door
                    {x: 600, y: 100, width: 60, height: 120, target: 'briefingRoom'} // Briefing room door
                ]
            },
            // Add boundaries for other rooms here
        };
        this.playerWalkCycle = 0; // Separate player animation from NPCs
        this.ambientAnimations = {
            coffeeSteam: { x: 0, y: 0, active: false },
            typingNPC: { x: 0, y: 0, active: false },
            blinkingLights: { frame: 0 }
        };
        this.backgroundMusicPlayer = null;
        this.setupBufferCanvas();
        this.spriteCache = new Map();

        // Frame rate control
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        
        // Animation state
        this.animations = new Map();
        this.requestID = null;
        
        // Performance monitoring
        this.perfStats = {
            drawTime: 0,
            updateTime: 0,
            frameTime: 0
        };

        // Setup double buffering
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = this.canvas.width;
        this.backBuffer.height = this.canvas.height;
        this.backContext = this.backBuffer.getContext('2d');
        
        // Frame timing
        this.lastFrameTime = 0;
        this.frameTime = 1000 / 60; // Target 60 FPS
        this.accumulator = 0;
        
        // Performance monitoring
        this.fpsCounter = 0;
        this.fpsTimer = 0;
        this.currentFPS = 0;

        // Create offscreen canvas for double buffering
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // Frame timing
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.accumulator = 0;
        
        // Color cache for optimization
        this.colorCache = new Map();
        
        // Start game loop
        this.running = true;
        requestAnimationFrame(this.gameLoop.bind(this));

        // Initialize the engine
        this.init();
    }

    setupCanvas() {
        // Use device pixel ratio for better rendering on high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 800 * dpr;
        this.canvas.height = 450 * dpr;
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.width = '800px';
        this.canvas.style.height = '450px';
    }

    setupBufferCanvas() {
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.canvas.width;
        this.bufferCanvas.height = this.canvas.height;
        this.bufferCtx = this.bufferCanvas.getContext('2d');
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

    init() {
        // Remove game.init() call since initialization happens in constructor
        this.canvas.style.cursor = 'default'; // Ensure cursor is visible
        this.setupEventListeners();
        this.drawCurrentScene();
        this.startGameLoop();
        this.keyboardEnabled = true;
        
        // Start background music using Web Audio API
        if (window.soundManager) {
            this.startBackgroundMusic();
        }
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (!this.running) return;

        // Calculate delta time and maintain consistent frame rate
        const deltaTime = timestamp - this.lastFrameTime;
        this.accumulator += deltaTime;

        while (this.accumulator >= this.frameInterval) {
            // Update game state
            this.update(this.frameInterval / 1000);
            this.accumulator -= this.frameInterval;
        }

        // Render to offscreen canvas
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw(this.offscreenCtx);

        // Swap buffers
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);

        this.lastFrameTime = timestamp;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    stopGameLoop() {
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
            this.requestID = null;
        }
    }

    addAnimation(id, frames, duration) {
        this.animations.set(id, {
            frames,
            duration,
            currentFrame: 0,
            elapsed: 0
        });
    }

    updateAnimations(deltaTime) {
        for (const [id, anim] of this.animations) {
            anim.elapsed += deltaTime;
            if (anim.elapsed >= anim.duration) {
                anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
                anim.elapsed = 0;
            }
        }
    }

    update() {
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
                const hitObject = this.checkCollision(this.playerPosition.x, this.playerPosition.y);
                if (hitObject) {
                    this.processInteraction(hitObject);
                }
            } else {
                // Move player towards target
                const speed = 3; // pixels per frame
                const moveX = (dx / distance) * speed;
                const moveY = (dy / distance) * speed;
                this.playerPosition.x += moveX;
                this.playerPosition.y += moveY;
                
                // Redraw the scene with updated player position
                this.drawCurrentScene();
            }
        }
    }
    
    render(interpolation) {
        // Clear back buffer
        this.backContext.clearRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        
        // Draw game state to back buffer
        this.drawCurrentScene();
        
        // Draw debug info if enabled
        if (this.debugMode) {
            this.drawDebugInfo(this.backContext);
        }
        
        // Flip buffers
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.backBuffer, 0, 0);
    }

    drawDebugInfo(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.currentFPS}`, 10, 20);
        ctx.fillText(`Objects: ${this.game.gameObjects.length}`, 10, 40);
        ctx.fillText(`Draw calls: ${this.drawCallCount}`, 10, 60);
    }

    drawCurrentScene() {
        // Clear canvas
        this.bufferCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw scene based on current scene, not game state
        switch(this.currentScene) {
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
            case 'officeArea':
                this.drawOfficeArea();
                break;
            default:
                console.warn('Unknown scene:', this.currentScene);
                this.drawPoliceStation();
        }
        
        // Draw ambient animations
        this.drawAmbientAnimations();
        
        // Draw NPCs for current scene
        if (this.npcs[this.currentScene]) {
            this.npcs[this.currentScene].forEach(npc => {
                // Position NPCs properly on floor
                const yPosition = Math.max(this.floorLevel.min + 50, Math.min(npc.y, this.floorLevel.max));
                
                this.drawPixelCharacter(
                    npc.x, yPosition, 
                    npc.type === 'sergeant' ? this.colors.brightBlue : 
                    npc.type === 'detective' ? this.colors.red : this.colors.blue,
                    this.colors.yellow,
                    npc.facing,
                    true,
                    true
                );
            });
        }

        // Draw player at current position
        this.drawPixelCharacter(
            this.playerPosition.x, 
            this.playerPosition.y, 
            this.colors.blue, 
            this.colors.yellow,
            this.playerFacing,
            this.isWalking,
            false
        );

        this.updateCollisionObjects(); // Update collision objects when scene changes
    }

    setupEventListeners() {
        // Command buttons
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cmd-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeCommand = btn.dataset.action;
                soundManager.playSound('click');
                this.updateCursor();
            });
        });

        // Canvas click with throttling
        let lastClickTime = 0;
        this.canvas.addEventListener('click', (e) => {
            // Throttle clicks to prevent double-clicks or spam
            const now = Date.now();
            if (now - lastClickTime < 300) return; // 300ms debounce
            lastClickTime = now;

            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width / (window.devicePixelRatio || 1));
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height / (window.devicePixelRatio || 1));
            
            // First check for door interactions
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
            
            // Otherwise handle movement or other interactions
            this.handleInteraction(x, y);
        });

        // Keyboard navigation
        let keyLastPressed = 0;
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardEnabled) return;
            
            // Throttle key presses
            const now = Date.now();
            if (now - keyLastPressed < 200) return; // 200ms debounce
            keyLastPressed = now;
            
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
        });

        // Improved mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - (rect.top) * (this.canvas.height / rect.height));
            
            // Change cursor if hovering over interactive element
            if (this.checkCollision(x, y)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.updateCursor(); // Use action-specific cursor
            }
        });
    }

    updateCursor() {
        const cursorStyle = this.activeCommand ? 'pointer' : 'default';
        this.canvas.style.cursor = cursorStyle;
    }

    handleInteraction(x, y) {
        if (this.activeCommand === 'move') {
            // Move character to clicked location
            const rect = this.canvas.getBoundingClientRect();
            const targetX = (x - rect.left) * (this.canvas.width / rect.width);
            const targetY = (y - rect.top) * (this.canvas.height / rect.height);
            
            // Ensure target is within walkable area
            if (targetY >= 300 && targetY <= this.floorLevel) {
                this.walkTarget = { x: targetX, y: targetY };
                this.isWalking = true;
            }
            return;
        }

        // Check for clickable objects
        const clickedObject = this.checkCollision(x, y);
        if (clickedObject) {
            this.processInteraction(clickedObject);
        }
    }

    handleMovement(direction) {
        const moveSpeed = 5;
        const oldX = this.playerPosition.x;
        const oldY = this.playerPosition.y;

        this.playerFacing = direction;
        this.isWalking = true;
        this.playerWalkCycle = (this.playerWalkCycle + 1) % 4;

        switch(direction) {
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

        // Check all collisions
        const collision = this.checkCollision(this.playerPosition.x, this.playerPosition.y);
        if (collision) {
            if (collision.type === 'desk' || collision.type === 'wall') {
                // Revert movement if colliding with desk or wall
                this.playerPosition.x = oldX;
                this.playerPosition.y = oldY;
                return;
            } else if (collision.type === 'door' && this.activeCommand === 'use') {
                // Handle door transitions
                this.currentScene = collision.target;
                this.loadScene(collision.target);
                return;
            }
        }

        this.drawCurrentScene();
        
        setTimeout(() => {
            this.isWalking = false;
            this.drawCurrentScene();
        }, 100);
    }

    drawPoliceStation() {
        const colors = this.colors;
        
        // Draw floor first (expand floor area)
        this.ctx.fillStyle = '#8B4513'; // Brown wooden floor
        this.ctx.fillRect(0, this.floorLevel.min, this.canvas.width, 
                         this.canvas.height - this.floorLevel.min);
        
        // Add floor texture
        for (let i = 0; i < 30; i++) {
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.floorLevel.min + i * 10);
            this.ctx.lineTo(this.canvas.width, this.floorLevel.min + i * 10);
            this.ctx.stroke();
        }
        
        // Draw wall (reduced height)
        this.draw3DWall(0, 0, this.canvas.width, this.floorLevel.min, colors.blue);
        
        // Wall trim at floor junction
        this.ctx.fillStyle = '#4A4A4A';
        this.ctx.fillRect(0, this.floorLevel.min - 10, this.canvas.width, 10);
        
        // Windows (repositioned for lower wall)
        for (let i = 0; i < 2; i++) {
            // Window frame
            this.ctx.fillStyle = '#A0A0A0';
            this.ctx.fillRect(100 + i * 350, 50, 120, 100);
            
            // Window glass
            this.ctx.fillStyle = '#B0E0FF';
            this.ctx.fillRect(105 + i * 350, 55, 110, 90);
            
            // Window frame dividers
            this.ctx.strokeStyle = '#A0A0A0';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(160 + i * 350, 55);
            this.ctx.lineTo(160 + i * 350, 145);
            this.ctx.stroke();
            
            // Add animated view through window
            this.drawWindowView(105 + i * 350, 55, 110, 90);
        }
        
        // Bulletin board
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(280, 50, 120, 80);
        this.ctx.fillStyle = '#F5F5DC';
        this.ctx.fillRect(285, 55, 110, 70);
        
        // Add notices to bulletin board
        this.drawBulletinNotices(285, 55, 110, 70);
        
        // Reception desk (aligned with floor)
        this.draw3DDesk(400, this.floorLevel.min + 20, 150, 80);
        
        // Draw phones and computer on reception desk
        this.drawDeskItems(400, this.floorLevel.min + 20, 150, 80);
        
        // Add female officer at desk
        this.drawPixelCharacter(
            450, // Centered at desk
            this.floorLevel.min + 40, // Proper height for sitting
            this.colors.blue, // Police uniform
            this.colors.yellow, // Badge
            'down', // Facing forward
            false, // Not walking
            true, // Is NPC
            true // Is female
        );

        // Add sitting animation
        if (this.animationFrame % 4 === 0) {
            // Typing animation
            this.drawDeskItems(400, this.floorLevel.min + 15, 150, 80);
        }
        
        // Draw doors aligned with floor/wall
        this.drawDoorWithFrame(50, this.floorLevel.min - 120, 'left', "Sheriff's Office");
        this.drawDoorWithFrame(600, this.floorLevel.min - 120, 'right', "Briefing Room");
        this.drawDoorWithFrame(200, this.floorLevel.min - 120, 'left', "Office Area");
        
        // Add exit to downtown
        this.drawExitDoor(400, this.canvas.height - 30, "Exit to Downtown");
        
        // Add exit sign
        this.addExitSign(400, this.canvas.height - 60, "Downtown");
        
        // Add wall decorations
        this.drawWallDecorations();
        
        // Set up ambient animations
        this.setupAmbientAnimations('policeStation');
        
        // Update collision objects for this scene
        this.updateCollisionObjects();
    }
    
    // Add new room for desks
    drawOfficeArea() {
        const colors = this.colors;
        
        // Draw walls and floor
        this.drawFloorGrid(0, 300, this.canvas.width, 150);
        this.draw3DWall(0, 0, this.canvas.width, 300, colors.blue);
        
        // Floor
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 300, this.canvas.width, 150);
        
        // Wall details
        this.ctx.fillStyle = '#4A4A4A';
        this.ctx.fillRect(0, 290, this.canvas.width, 10);
        
        // Multiple desks for detectives
        for (let i = 0; i < 4; i++) {
            this.draw3DDesk(100 + i * 150, 320, 120, 70);
            
            // Add computers, papers, etc on desks
            this.ctx.fillStyle = colors.darkGray;
            this.ctx.fillRect(120 + i * 150, 310, 40, 30);
            this.ctx.fillStyle = colors.white;
            this.ctx.fillRect(180 + i * 150, 315, 20, 25);
        }
        
        // Filing cabinets along the wall
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = colors.lightGray;
            this.ctx.fillRect(50 + i * 100, 100, 80, 150);
            
            for (let j = 0; j < 3; j++) {
                this.ctx.fillStyle = colors.darkGray;
                this.ctx.fillRect(60 + i * 100, 110 + j * 45, 60, 5);
            }
        }
        
        // Exit door
        this.drawDoorWithFrame(400, 200, 'right', "Main Lobby");
        
        // Coffee machine in corner
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(700, 230, 50, 70);
        this.ctx.fillStyle = colors.red;
        this.ctx.fillRect(715, 250, 20, 10);
        this.ctx.fillStyle = colors.brightBlue;
        this.ctx.fillRect(710, 270, 30, 10);
        
        // Update collision objects
        this.updateCollisionObjects();
    }

    drawDowntown() {
        // Use the stored color palette for consistency
        const colors = this.colors;
        
        // Sky
        this.ctx.fillStyle = colors.blue;
        this.ctx.fillRect(0, 0, this.canvas.width, 150);

        // Street
        this.ctx.fillStyle = colors.darkGray;
        this.ctx.fillRect(0, 300, this.canvas.width, 150);

        // Sidewalk
        this.ctx.fillStyle = colors.lightGray;
        this.ctx.fillRect(0, 280, this.canvas.width, 20);

        // Buildings
        for (let i = 0; i < 3; i++) {
            // Building body
            this.ctx.fillStyle = i % 2 === 0 ? colors.brown : colors.red;
            this.ctx.fillRect(i * 250, 100, 200, 180);
            
            // Windows
            this.ctx.fillStyle = colors.brightCyan;
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 2; k++) {
                    this.ctx.fillRect(i * 250 + 30 + j * 60, 120 + k * 60, 40, 40);
                }
            }
            
            // Door
            this.ctx.fillStyle = colors.darkGray;
            this.ctx.fillRect(i * 250 + 80, 220, 40, 60);
        }

        // Alley
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(200, 100, 50, 180);

        // Police officer (pixel style)
        this.drawPixelCharacter(150, 350, colors.blue, colors.yellow);

        // Crime scene (for investigation)
        this.ctx.fillStyle = colors.yellow;
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(400 + i * 20, 290, 10, 5);
        }
        
        // Return to station sign
        this.ctx.fillStyle = colors.red;
        this.ctx.fillRect(350, 430, 100, 20);
        this.ctx.fillStyle = colors.white;
        this.ctx.fillText('TO PARK', 370, 445);
        
        // Arrow indicators for keyboard navigation
        this.drawArrowIndicator('up', 'Station');
        this.drawArrowIndicator('right', 'Park');
        this.drawArrowIndicator('left', 'Station');
        this.drawArrowIndicator('down', 'Park');
    }

    drawPark() {
        // Use the stored color palette for consistency
        const colors = this.colors;
        
        // Sky
        this.ctx.fillStyle = colors.brightBlue;
        this.ctx.fillRect(0, 0, this.canvas.width, 300);

        // Grass
        this.ctx.fillStyle = colors.green;
        this.ctx.fillRect(0, 300, this.canvas.width, 150);

        // Pathway
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(100, 300, 600, 40);

        // Trees
        for (let i = 0; i < 3; i++) {
            // Tree trunk
            this.ctx.fillStyle = colors.brown;
            this.ctx.fillRect(50 + i * 250, 200, 30, 100);
            
            // Tree leaves
            this.ctx.fillStyle = colors.brightGreen;
            this.ctx.fillRect(20 + i * 250, 150, 90, 60);
        }

        // Benches
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(150, 320, 80, 10);
        this.ctx.fillRect(150, 330, 10, 20);
        this.ctx.fillRect(220, 330, 10, 20);
        
        this.ctx.fillRect(500, 320, 80, 10);
        this.ctx.fillRect(500, 330, 10, 20);
        this.ctx.fillRect(570, 330, 10, 20);

        // Fountain
        this.ctx.fillStyle = colors.darkGray;
        this.ctx.fillRect(350, 200, 100, 100);
        this.ctx.fillStyle = colors.brightCyan;
        this.ctx.fillRect(360, 210, 80, 80);

        // Police officer (pixel style)
        this.drawPixelCharacter(400, 350, colors.blue, colors.yellow);
        
        // Return sign
        this.ctx.fillStyle = colors.red;
        this.ctx.fillRect(350, 430, 100, 20);
        this.ctx.fillStyle = colors.white;
        this.ctx.fillText('TO STATION', 355, 445);
        
        // Arrow indicators for keyboard navigation
        this.drawArrowIndicator('up', 'Downtown');
        this.drawArrowIndicator('left', 'Downtown');
    }

    getCharacterSprite(uniformColor, badgeColor, facing, isWalking, isNPC, isFemale) {
        const key = `${uniformColor}_${badgeColor}_${facing}_${isWalking}_${isNPC}_${isFemale}`;
        if (!this.spriteCache.has(key)) {
            const spriteCanvas = document.createElement('canvas');
            spriteCanvas.width = 32;
            spriteCanvas.height = 48;
            const spriteCtx = spriteCanvas.getContext('2d');
            this.drawPixelCharacterToContext(spriteCtx, 16, 48, uniformColor, badgeColor, facing, isWalking, isNPC, isFemale);
            this.spriteCache.set(key, spriteCanvas);
        }
        return this.spriteCache.get(key);
    }

    drawPixelCharacter(x, y, uniformColor, badgeColor, facing = 'down', isWalking = false, isNPC = false, isFemale = false) {
        const sprite = this.getCharacterSprite(uniformColor, badgeColor, facing, isWalking, isNPC, isFemale);
        this.bufferCtx.drawImage(sprite, Math.floor(x - 16), Math.floor(y - 48));
    }

    drawPixelCharacterToContext(ctx, x, y, uniformColor, badgeColor, facing = 'down', isWalking = false, isNPC = false, isFemale = false) {
        const pixels = 4;
        const drawPixel = (px, py, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(
                Math.floor(x + px * pixels), 
                Math.floor(y + py * pixels), 
                pixels, 
                pixels
            );
        };

        // Removed shadow drawing code

        let xOffset = -16;
        let yOffset = -48;

        // Police hat
        const hatPixels = [
            [0,0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1]
        ];
        
        hatPixels.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset - 2, '#000033'); // Dark blue hat
                }
            });
        });
        
        // Hat badge
        drawPixel(xOffset + 3, yOffset - 2, '#FFD700'); // Gold badge

        // Head with gender-specific hairstyle
        if (facing === 'left' || facing === 'right') {
            // Profile view head
            const headPixels = [
                [0,0,1,1,1,0],
                [0,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [0,1,1,1,1,0]
            ];
            
            if (isFemale) {
                // Add hair for female characters
                const hairPixels = [
                    [0,1,1,1,0,0],
                    [1,1,1,1,1,0]
                ];
                hairPixels.forEach((row, py) => {
                    row.forEach((pixel, px) => {
                        if (pixel) {
                            const finalPx = facing === 'left' ? px : row.length - 1 - px;
                            drawPixel(finalPx + xOffset - 1, py + yOffset, '#663300'); // Brown hair
                        }
                    });
                });
            }
            
            headPixels.forEach((row, py) => {
                row.forEach((pixel, px) => {
                    if (pixel) {
                        const finalPx = facing === 'left' ? px : row.length - 1 - px;
                        drawPixel(finalPx + xOffset, py + yOffset, '#FFD8B1');
                    }
                });
            });
        } else {
            // Front/back view head
            const headPixels = [
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0]
            ];
            
            if (isFemale) {
                // Add hair for female characters
                const hairPixels = [
                    [0,1,1,1,1,1,1,0],
                    [1,1,1,1,1,1,1,1]
                ];
                hairPixels.forEach((row, py) => {
                    row.forEach((pixel, px) => {
                        if (pixel) {
                            drawPixel(px + xOffset, py + yOffset - 1, '#663300');
                        }
                    });
                });
            }
            
            headPixels.forEach((row, py) => {
                row.forEach((pixel, px) => {
                    if (pixel) drawPixel(px + xOffset, py + yOffset, '#FFD8B1');
                });
            });
        }

        // Body
        const bodyPixels = [
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0]
        ];

        bodyPixels.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset + 6, uniformColor);
                    if (py === 1 && px === 2) {
                        drawPixel(px + xOffset, py + yOffset + 6, badgeColor);
                    }
                }
            });
        });

        // Legs (walking animation)
        const walkCycle = isNPC ? this.animationFrame % 4 : this.playerWalkCycle % 4;
        const legFrame = isWalking ? walkCycle : 0;
        const legFrames = [
            [ // Frame 0 - Standing
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0]
            ],
            [ // Frame 1 - Walking
                [0,0,1,1,0,0,1,1],
                [0,1,1,0,0,0,1,0],
                [1,1,0,0,0,0,0,0]
            ],
            [ // Frame 2 - Standing
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0],
                [0,0,1,1,1,1,0,0]
            ],
            [ // Frame 3 - Walking opposite
                [1,1,0,0,1,1,0,0],
                [0,1,0,0,0,1,1,0],
                [0,0,0,0,0,0,1,1]
            ]
        ];

        legFrames[legFrame].forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset + 11, '#000033');
                }
            });
        });

        // Face details
        if (facing === 'down' || facing === facing) {
            drawPixel(xOffset + 2, yOffset + 3, '#000000'); // Left eye
            drawPixel(xOffset + 5, yOffset + 3, '#000000'); // Right eye
            drawPixel(xOffset + 3, yOffset + 4, '#000000'); // Mouth
            drawPixel(xOffset + 4, yOffset + 4, '#000000');
        } else if (facing === 'left') {
            drawPixel(xOffset + 2, yOffset + 3, '#000000'); // Left eye
            drawPixel(xOffset + 2, yOffset + 4, '#000000'); // Mouth
        } else if (facing === 'right') {
            drawPixel(xOffset + 4, yOffset + 3, '#000000'); // Right eye
            drawPixel(xOffset + 4, yOffset + 4, '#000000'); // Mouth
        }
    }

    drawSheriffsOffice() {
        const colors = this.colors;
        
        // Draw walls (dark wood paneling)
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Floor
        this.ctx.fillStyle = colors.darkGray;
        this.ctx.fillRect(0, 300, this.canvas.width, 150);
        
        // Sheriff's desk (bigger, more ornate)
        this.ctx.fillStyle = '#663300'; // Darker wood
        this.ctx.fillRect(350, 150, 250, 100);
        
        // Chair behind desk
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(450, 260, 50, 60);
        
        // Computer
        this.ctx.fillStyle = colors.darkGray;
        this.ctx.fillRect(400, 160, 60, 40);
        this.ctx.fillStyle = colors.brightCyan;
        this.ctx.fillRect(405, 165, 50, 30);
        
        // Window
        this.ctx.fillStyle = colors.brightBlue;
        this.ctx.fillRect(600, 50, 150, 100);
        this.ctx.strokeStyle = colors.black;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(600, 50, 150, 100);
        this.ctx.beginPath();
        this.ctx.moveTo(675, 50);
        this.ctx.lineTo(675, 150);
        this.ctx.stroke();
        
        // Filing cabinet
        this.ctx.fillStyle = colors.lightGray;
        this.ctx.fillRect(50, 150, 70, 120);
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(85, 180, 20, 5);
        this.ctx.fillRect(85, 210, 20, 5);
        this.ctx.fillRect(85, 240, 20, 5);
        
        // Sheriff's badge on wall
        this.ctx.fillStyle = colors.yellow;
        this.ctx.beginPath();
        this.ctx.arc(200, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = colors.black;
        this.ctx.beginPath();
        this.ctx.arc(200, 100, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Door
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(100, 320, 60, 120);
        this.ctx.fillStyle = colors.yellow;
        this.ctx.fillRect(145, 380, 10, 10);
        
        // Name plate
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(420, 130, 100, 15);
        this.ctx.fillStyle = colors.white;
        this.ctx.font = '12px monospace';
        this.ctx.fillText('SHERIFF', 445, 142);
        
        // Sign
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(10, 50, 150, 40);
        this.ctx.fillStyle = colors.yellow;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('SHERIFF\'S OFFICE', 15, 75);

        // Navigation arrows
        this.drawArrowIndicator('down', 'Station');
        this.drawArrowIndicator('right', 'Briefing');
    }

    drawBriefingRoom() {
        const colors = this.colors;
        
        // Walls
        this.ctx.fillStyle = colors.blue;
        this.ctx.fillRect(0, 0, this.canvas.width, 300);
        
        // Floor
        this.ctx.fillStyle = colors.darkGray;
        this.ctx.fillRect(0, 300, this.canvas.width, 150);
        
        // Long table
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(150, 180, 500, 120);
        
        // Chairs around the table
        for (let i = 0; i < 6; i++) {
            // Chairs on one side
            this.ctx.fillStyle = colors.darkGray;
            this.ctx.fillRect(170 + i * 80, 140, 40, 40);
            
            // Chairs on the other side
            this.ctx.fillStyle = colors.darkGray;
            this.ctx.fillRect(170 + i * 80, 300, 40, 40);
        }
        
        // Projector screen
        this.ctx.fillStyle = colors.white;
        this.ctx.fillRect(350, 30, 200, 100);
        this.ctx.strokeStyle = colors.black;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(350, 30, 200, 100);
        
        // Case photos on the wall
        for (let i = 0; i < 4; i++) {
            this.ctx.fillStyle = colors.white;
            this.ctx.fillRect(50 + i * 120, 60, 80, 60);
            this.ctx.strokeStyle = colors.black;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(50 + i * 120, 60, 80, 60);
        }
        
        // Door
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(100, 320, 60, 120);
        this.ctx.fillStyle = colors.yellow;
        this.ctx.fillRect(145, 380, 10, 10);
        
        // Coffee machine
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(700, 200, 50, 80);
        this.ctx.fillStyle = colors.red;
        this.ctx.fillRect(715, 220, 20, 10);
        
        // Sign
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(10, 50, 180, 40);
        this.ctx.fillStyle = colors.yellow;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('BRIEFING ROOM', 25, 75);
        
        // Navigation arrows
        this.drawArrowIndicator('down', 'Station');
        this.drawArrowIndicator('left', 'Sheriff');
    }

    checkCollision(x, y) {
        // Check desk collisions first
        const desks = this.collisionObjects.filter(obj => obj.type === 'desk');
        for (const desk of desks) {
            if (x >= desk.x && x <= desk.x + desk.width &&
                y >= desk.y && y <= desk.y + desk.height) {
                return desk;
            }
        }

        // Then check doors
        const doors = this.collisionObjects.filter(obj => obj.type === 'door');
        for (const door of doors) {
            if (x >= door.x && x <= door.x + door.width &&
                y >= door.y && y <= door.y + door.height) {
                return door;
            }
        }

        // Finally check room boundaries
        const boundaries = this.roomBoundaries[this.currentScene];
        if (boundaries) {
            for (const wall of boundaries.walls) {
                if (x >= wall.x && x <= wall.x + wall.width &&
                    y >= wall.y && y <= wall.y + wall.height) {
                    return { type: 'wall' };
                }
            }
        }

        return null;
    }

    processInteraction(hitObject) {
        if (!this.activeCommand) {
            this.showDialog("Select an action first (Look, Talk, Use, Take, Move)");
            return;
        }
        
        // Special handling for doors
        if (hitObject.type === 'door' && this.activeCommand === 'use') {
            // Get target scene from door properties with proper null checking
            const targetScene = hitObject.target || 
                (hitObject.id && hitObject.id.includes('Door') ? 
                hitObject.id.replace('Door', '').toLowerCase() : 'policeStation');
                
            // Safe string manipulation with null check
            const displayName = targetScene ? 
                targetScene.charAt(0).toUpperCase() + targetScene.slice(1).replace(/([A-Z])/g, ' $1').trim() : 
                "another room";
                
            this.showDialog(`Entering ${displayName}...`);
            
            // Transition to new scene after a brief delay
            setTimeout(() => {
                this.currentScene = targetScene;
                this.loadScene(targetScene);
            }, 500);
            
            return;
        }
        
        // Handle standard interactions
        const interaction = hitObject.interactions && hitObject.interactions[this.activeCommand];
        if (interaction) {
            this.showDialog(interaction);
            
            // Handle special interactions
            if (this.activeCommand === 'take' && hitObject.id === 'caseFile') {
                game.addToInventory('caseFile');
                game.completeStage('review');
                this.updateInventoryUI();
                this.updateCaseInfo();
            } else if (this.activeCommand === 'take' && hitObject.id === 'evidence') {
                game.addToInventory('tool');
                game.collectEvidence('tool');
                game.completeStage('evidence');
                this.updateInventoryUI();
                this.updateCaseInfo();
            } else if (this.activeCommand === 'talk' && hitObject.id === 'witness') {
                game.completeStage('interview');
                this.updateCaseInfo();
            } else if (this.activeCommand === 'talk' && hitObject.id === 'suspect') {
                game.completeStage('suspect');
                this.updateCaseInfo();
            } else if (this.activeCommand === 'use' && hitObject.id === 'shopDoor') {
                game.completeStage('downtown');
                this.updateCaseInfo();
            }
            
            // Check if case is solved
            if (game.checkCaseSolved()) {
                setTimeout(() => {
                    this.showDialog("Congratulations! You've solved the case!");
                }, 3000);
            }
        } else {
            this.showDialog(`You can't ${this.activeCommand} that.`);
            soundManager.playSound('error');
        }
    }

    updateInventoryUI() {
        try {
            // Clear existing inventory display
            this.inventoryPanel.innerHTML = '';
            
            // Add each inventory item
            game.gameState.inventory.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.innerText = item.substring(0, 2).toUpperCase();
                itemElement.title = item;
                itemElement.addEventListener('click', () => {
                    this.showDialog(`Selected item: ${item}`);
                    soundManager.playSound('click');
                });
                this.inventoryPanel.appendChild(itemElement);
            });
        } catch (error) {
            console.error("Error updating inventory UI:", error);
        }
    }

    updateCaseInfo() {
        try {
            if (!game.currentCase) return;
            
            let caseHTML = `<h3>${game.currentCase.title}</h3>`;
            caseHTML += '<p>Case stages:</p>';
            caseHTML += '<ul>';
            
            game.currentCase.stages.forEach(stage => {
                caseHTML += `<li>${stage.description} ${stage.completed ? '✓' : ''}</li>`;
            });
            
            caseHTML += '</ul>';
            
            this.caseInfoPanel.innerHTML = caseHTML;
        } catch (error) {
            console.error("Error updating case info:", error);
        }
    }

    showDialog(text) {
        if (!text) return;
        this.dialogBox.innerText = text;
    }

    loadScene(sceneId) {
        try {
            // Stop current background music
            this.stopBackgroundMusic();
            
            console.log(`Loading scene: ${sceneId}`);
            // Update current scene
            this.currentScene = sceneId;
            
            // Reset collision objects for new scene
            this.collisionObjects = [];
            
            // Reset player position based on scene, ensuring they're on the floor
            switch(sceneId) {
                case 'policeStation':
                    this.playerPosition = { x: 400, y: this.floorLevel.min + 100 };
                    break;
                case 'downtown':
                    this.playerPosition = { x: 400, y: 350 };
                    break;
                case 'park':
                    this.playerPosition = { x: 400, y: 350 };
                    break;
                case 'sheriffsOffice':
                    this.playerPosition = { x: 200, y: this.floorLevel.min + 100 };
                    break;
                case 'briefingRoom':
                    this.playerPosition = { x: 200, y: this.floorLevel.min + 100 };
                    break;
                case 'officeArea':
                    this.playerPosition = { x: 400, y: this.floorLevel.min + 100 };
                    break;
                default:
                    console.warn('Unknown scene:', sceneId);
                    this.playerPosition = { x: 400, y: this.floorLevel.min + 100 };
            }
            
            // Setup ambient animations for new scene
            this.setupAmbientAnimations(sceneId);
            
            // Reset walking state
            this.isWalking = false;
            this.walkTarget = null;
            
            // Update NPCs for the new scene
            this.updateNPCsForScene(sceneId);
            
            // Draw the new scene
            this.drawCurrentScene();
            
            // Start new background music
            this.startBackgroundMusic();
            
            console.log(`Scene loaded: ${sceneId}`);
        } catch (error) {
            console.error("Error loading scene:", error);
            this.showDialog("Error loading scene. Please try again.");
        }
    }
    
    updateNPCsForScene(sceneId) {
        if (!this.npcs[sceneId]) {
            // ...existing code...
            
            // Add NPCs for the new office area
            if (sceneId === 'officeArea') {
                this.npcs[sceneId] = [
                    {
                        x: 250, y: 350,
                        type: 'detective',
                        name: 'Detective Johnson',
                        patrolPoints: [{x: 250, y: 350}, {x: 400, y: 350}, {x: 600, y: 350}],
                        currentPatrolPoint: 0,
                        facing: 'right'
                    },
                    {
                        x: 500, y: 320,
                        type: 'officer',
                        name: 'Officer Smith',
                        patrolPoints: [{x: 500, y: 320}, {x: 300, y: 320}, {x: 700, y: 380}],
                        currentPatrolPoint: 0,
                        facing: 'left'
                    }
                ];
            }
        }
    }

    // Add method to update collision objects based on current scene
    updateCollisionObjects() {
        this.collisionObjects = [];
        
        switch(this.currentScene) {
            case 'policeStation':
                // Reception desk
                this.collisionObjects.push({
                    x: 400, y: 320, width: 150, height: 80,
                    type: 'desk',
                    id: 'receptionDesk',
                    interactions: {
                        look: "The reception desk. Officer Jenny usually sits here.",
                        use: "You check the sign-in sheet.",
                        take: "You can't take the desk with you, detective."
                    }
                });
                
                // Sheriff's office door
                this.collisionObjects.push({
                    x: 50, y: 200, width: 60, height: 120,
                    type: 'door',
                    id: 'sheriffsOfficeDoor',
                    target: 'sheriffsOffice',
                    interactions: {
                        look: "The Sheriff's office. The door is slightly ajar.",
                        use: "You enter the Sheriff's office.",
                        talk: "There's no one at the door to talk to."
                    }
                });
                
                // Briefing room door
                this.collisionObjects.push({
                    x: 600, y: 200, width: 60, height: 120,
                    type: 'door',
                    id: 'briefingRoomDoor',
                    target: 'briefingRoom',
                    interactions: {
                        look: "The door to the briefing room.",
                        use: "You enter the briefing room.",
                        talk: "There's no one at the door to talk to."
                    }
                });
                
                // Office area door
                this.collisionObjects.push({
                    x: 200, y: 200, width: 60, height: 120,
                    type: 'door',
                    id: 'officeAreaDoor',
                    target: 'officeArea',
                    interactions: {
                        look: "The door to the detectives' office area.",
                        use: "You enter the office area.",
                        talk: "There's no one at the door to talk to."
                    }
                });
                
                // Downtown exit door
                this.collisionObjects.push({
                    x: 365, y: 420, width: 70, height: 30,
                    type: 'door',
                    id: 'exitDoor',
                    target: 'downtown',
                    interactions: {
                        look: "The exit door leading downtown.",
                        use: "You head downtown to investigate.",
                        talk: "It's a door. It doesn't talk back."
                    }
                });
                break;
                
            case 'officeArea':
                // Main lobby door
                this.collisionObjects.push({
                    x: 400, y: 200, width: 60, height: 120,
                    type: 'door',
                    id: 'mainLobbyDoor',
                    target: 'policeStation',
                    interactions: {
                        look: "The door back to the main lobby.",
                        use: "You return to the main lobby.",
                        talk: "There's no one at the door to talk to."
                    }
                });
                
                // Detective desks
                for (let i = 0; i < 4; i++) {
                    this.collisionObjects.push({
                        x: 100 + i * 150, y: 320, width: 120, height: 70,
                        type: 'desk',
                        id: `detectiveDesk${i+1}`,
                        interactions: {
                            look: `Detective desk ${i+1}. Files and paperwork are scattered across it.`,
                            use: "You sit down and review some case files.",
                            take: "The desk is bolted to the floor."
                        }
                    });
                }
                
                // Coffee machine
                this.collisionObjects.push({
                    x: 700, y: 230, width: 50, height: 70,
                    type: 'object',
                    id: 'coffeeMachine',
                    interactions: {
                        look: "The department's coffee machine. It's seen better days.",
                        use: "You pour yourself a cup of coffee.",
                        take: "The other detectives would hunt you down if you took this."
                    }
                });
                break;
                
            // ...existing code for other scenes...
        }
    }

    // Helper functions for 3D rendering
    drawFloorGrid = (x, y, width, height) => {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;

        // Draw horizontal lines with perspective
        for (let i = 0; i <= height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(x, y + i);
            // Calculate perspective vanishing point
            const vanishX = this.canvas.width / 2;
            const vanishY = y - 100;
            const perspectiveX1 = x + (x - vanishX) * (i / height);
            const perspectiveX2 = (x + width) + ((x + width) - vanishX) * (i / height);
            ctx.moveTo(perspectiveX1, y + i);
            ctx.lineTo(perspectiveX2, y + i);
            ctx.stroke();
        }

        // Draw vertical lines
        for (let i = 0; i <= width; i += 40) {
            ctx.beginPath();
            const perspectiveX = x + i;
            const vanishY = y - 100;
            ctx.moveTo(perspectiveX, y);
            ctx.lineTo(
                x + width/2 + (perspectiveX - (x + width/2)) * 0.7,
                y + height
            );
            ctx.stroke();
        }
    }

    draw3DWall = (x, y, width, height, color) => {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        
        // Main wall
        ctx.fillRect(x, y, width, height);
        
        // Add depth shading
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
    }

    draw3DDesk = (x, y, width, height) => {
        const ctx = this.ctx;
        
        // Desk top
        ctx.fillStyle = this.colors.brown;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - 20, y + height);
        ctx.lineTo(x - 20, y + height);
        ctx.closePath();
        ctx.fill();
        
        // Desk front
        ctx.fillStyle = this.adjustColor(this.colors.brown, -20);
        ctx.fillRect(x - 20, y + height, width, 20);
        
        // Desk side
        ctx.fillStyle = this.adjustColor(this.colors.brown, -40);
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width - 20, y + height);
        ctx.lineTo(x + width - 20, y + height + 20);
        ctx.lineTo(x + width, y + 20);
        ctx.closePath();
        ctx.fill();
    }

    drawDoor = (x, y, direction, label) => {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.brown;
        ctx.fillRect(x, y, 60, 120);
        ctx.fillStyle = this.colors.yellow;
        ctx.fillRect(direction === 'left' ? x + 45 : x + 5, y + 60, 10, 10);
        
        // Add door label
        ctx.fillStyle = this.colors.white;
        ctx.font = '12px monospace';
        ctx.fillText(label, x - 10, y - 5);
    }

    drawDoorWithFrame = (x, y, direction, label) => {
        const ctx = this.ctx;
        
        // Door frame with proper wall connection
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x - 5, y - 5, 70, 130);
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, 60, 120);
        
        // Make the door reach exactly to the floor
        ctx.fillRect(x, y, 60, this.floorLevel.min - y);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(direction === 'left' ? x + 45 : x + 5, y + 60, 10, 10);
        
        // Door sign
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(x + 10, y + 10, 40, 20);
        
        // Label text
        ctx.fillStyle = '#000000';
        ctx.font = '8px monospace';
        ctx.fillText(label.substring(0, 8), x + 12, y + 22);
    }
    
    drawWindowView = (x, y, width, height) => {
        // Animated view through window
        this.ctx.fillStyle = '#87CEEB'; // Sky blue
        this.ctx.fillRect(x, y, width, height * 0.6);
        
        // Draw buildings in distance
        this.ctx.fillStyle = '#555555';
        for (let i = 0; i < 5; i++) {
            const buildingHeight = 20 + Math.sin(i + this.animationFrame * 0.1) * 5;
            this.ctx.fillRect(x + 5 + i * 22, y + height * 0.6 - buildingHeight, 15, buildingHeight);
        }
        
        // Animate clouds
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x + 20 + (this.animationFrame % 50), y + 30, 10, 0, Math.PI * 2);
        this.ctx.arc(x + 35 + (this.animationFrame % 50), y + 25, 12, 0, Math.PI * 2);
        this.ctx.arc(x + 50 + (this.animationFrame % 50), y + 30, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawBulletinNotices = (x, y, width, height) => {
        // Add notices to bulletin board
        const ctx = this.ctx;
        const notices = [
            {color: '#FFFFFF', width: 30, height: 25},
            {color: '#FFFFCC', width: 40, height: 20},
            {color: '#CCFFFF', width: 25, height: 30}
        ];
        
        notices.forEach((notice, i) => {
            ctx.fillStyle = notice.color;
            ctx.fillRect(x + 5 + i * 35, y + 5 + (i % 2) * 30, notice.width, notice.height);
            
            // Add some lines of "text"
            ctx.fillStyle = '#000000';
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(x + 8 + i * 35, y + 10 + (i % 2) * 30 + j * 5, notice.width - 6, 1);
            }
        });
    }
    
    drawDeskItems = (x, y, width, height) => {
        const ctx = this.ctx;
        
        // Computer monitor
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + width/2 - 20, y - 30, 40, 30);
        ctx.fillStyle = '#00AAAA';
        ctx.fillRect(x + width/2 - 17, y - 27, 34, 24);
        
        // Keyboard
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + width/2 - 25, y - 5, 50, 15);
        
        // Phone
        ctx.fillStyle = '#222222';
        ctx.fillRect(x + 20, y + 20, 30, 15);
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 25, y + 5, 20, 15);
        
        // Papers
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 100, y + 15, 30, 20);
        ctx.fillRect(x + 105, y + 10, 30, 20);
    }
    
    drawWallDecorations = () => {
        const ctx = this.ctx;
        
        // Police badge emblem
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(400, 50);
        ctx.lineTo(430, 65);
        ctx.lineTo(430, 95);
        ctx.lineTo(400, 110);
        ctx.lineTo(370, 95);
        ctx.lineTo(370, 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#0000AA';
        ctx.beginPath();
        ctx.arc(400, 80, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Wall clock
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(650, 70, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        // Clock hands
        const time = new Date();
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        
        // Hour hand
        ctx.save();
        ctx.translate(650, 70);
        ctx.rotate(hours * Math.PI/6 + minutes * Math.PI/360);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -12);
        ctx.stroke();
        ctx.restore();
        
        // Minute hand
        ctx.save();
        ctx.translate(650, 70);
        ctx.rotate(minutes * Math.PI/30);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -18);
        ctx.stroke();
        ctx.restore();
    }
    
    drawAmbientAnimations = () => {
        if (!this.ambientAnimations) return;
        
        const ctx = this.ctx;
        const anim = this.ambientAnimations;
        
        // Coffee steam
        if (anim.coffeeSteam.active) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            for (let i = 0; i < 3; i++) {
                const offsetX = Math.sin((this.animationFrame + i * 5) * 0.2) * 3;
                const size = 3 + Math.sin(this.animationFrame * 0.3) * 2;
                ctx.beginPath();
                ctx.arc(
                    anim.coffeeSteam.x + offsetX, 
                    anim.coffeeSteam.y - i * 5 - this.animationFrame % 10, 
                    size, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Typing NPC animation
        if (anim.typingNPC.active) {
            // Typing hands animation on keyboard
            const typingOffset = this.animationFrame % 4 === 0 ? 2 : 0;
            ctx.fillStyle = '#FFD8B1'; // Skin color
            ctx.fillRect(anim.typingNPC.x, anim.typingNPC.y + typingOffset, 5, 5);
            ctx.fillRect(anim.typingNPC.x + 15, anim.typingNPC.y + typingOffset, 5, 5);
        }
        
        // Blinking lights
        if ((this.animationFrame % 50) < 5) {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(750, 50, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    setupAmbientAnimations = (scene) => {
        // Reset all animations
        this.ambientAnimations.coffeeSteam.active = false;
        this.ambientAnimations.typingNPC.active = false;
        
        switch(scene) {
            case 'policeStation':
                // No coffee in main lobby
                this.ambientAnimations.typingNPC.x = 400;
                this.ambientAnimations.typingNPC.y = this.floorLevel.min - 8;
                this.ambientAnimations.typingNPC.active = true;
                break;
                
            case 'officeArea':
                // Coffee machine steam
                this.ambientAnimations.coffeeSteam.x = 725;
                this.ambientAnimations.coffeeSteam.y = 230;
                this.ambientAnimations.coffeeSteam.active = true;
                break;
                
            case 'briefingRoom':
                // Projector light
                this.ambientAnimations.projectorLight = {
                    x: 350, y: 30, width: 200, height: 100,
                    active: true, frame: 0
                };
                break;
        }
    }

    updateNPCs = () => {
        const currentSceneNPCs = this.npcs[this.currentScene];
        if (!currentSceneNPCs) return;

        currentSceneNPCs.forEach(npc => {
            const target = npc.patrolPoints[npc.currentPatrolPoint];
            const dx = target.x - npc.x;
            const dy = target.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) {
                // Move to next patrol point
                npc.currentPatrolPoint = (npc.currentPatrolPoint + 1) % npc.patrolPoints.length;
                
                // Add idle animation or interaction at waypoints
                if (Math.random() > 0.7) {
                    npc.idleAction = {
                        type: Math.random() > 0.5 ? 'talk' : 'look',
                        duration: Math.floor(Math.random() * 3) + 2
                    };
                }
            } else {
                // Move towards current target
                const speed = 2;
                npc.x += (dx / distance) * speed;
                npc.y += (dy / distance) * speed;
                
                // Update facing direction
                npc.facing = dx > 0 ? 'right' : 'left';
                
                // Reset any idle action when moving
                npc.idleAction = null;
            }
            
            // Ensure NPCs stay on the floor
            npc.y = Math.max(this.floorLevel.min + 50, Math.min(npc.y, this.floorLevel.max));
        });
    }

    drawRoomBoundaries = () => {
        const boundaries = this.roomBoundaries[this.currentScene];
        if (!boundaries) return;
        
        this.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        this.ctx.lineWidth = 2;
        
        // Draw wall boundaries
        boundaries.walls.forEach(wall => {
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Draw door boundaries
        this.ctx.strokeStyle = 'rgba(0,255,0,0.5)';
        boundaries.doors.forEach(door => {
            this.ctx.strokeRect(door.x, door.y, door.width, door.height);
        });
    }
    
    drawExitDoor = (x, y, label) => {
        const ctx = this.ctx;
        
        // Door frame with exit sign above
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x - 40, y - 5, 80, 35);
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 35, y, 70, 30);
        
        // Exit sign
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.fillRect(x - 30, y - 25, 60, 20);
        
        // Exit text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.fillText('EXIT', x - 20, y - 10);
        
        // Add to interactive elements
        this.collisionObjects.push({
            x: x - 35,
            y: y,
            width: 70,
            height: 30,
            type: 'door',
            id: 'exitDoor',
            target: 'downtown',
            interactions: {
                look: "The exit door leading downtown.",
                use: "You head downtown to investigate.",
                talk: "It's a door. It doesn't talk back."
            }
        });
    }
    
    addExitSign = (x, y, destination) => {
        if (!destination || typeof x !== 'number' || typeof y !== 'number') {
            console.warn('Invalid parameters for exit sign');
            return;
        }

        const ctx = this.ctx;
        const ARROW_SIZE = 15;
        const TEXT_OFFSET = 25;
        
        // Arrow pointing down
        ctx.fillStyle = this.colors.yellow;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - ARROW_SIZE, y - ARROW_SIZE * 1.33);
        ctx.lineTo(x + ARROW_SIZE, y - ARROW_SIZE * 1.33);
        ctx.closePath();
        ctx.fill();
        
        // Destination text
        ctx.fillStyle = this.colors.white;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(destination, x, y - TEXT_OFFSET);
        ctx.textAlign = 'left'; // Reset to default
    }

    // Memoized color adjustment for better performance
    #colorCache = new Map();
    
    adjustColor = (color, amount) => {
        const cacheKey = `${color}_${amount}`;
        if (this.#colorCache.has(cacheKey)) {
            return this.#colorCache.get(cacheKey);
        }

        try {
            const hex = color.replace('#', '');
            const adjust = (value) => {
                const adjusted = Math.max(0, Math.min(255, parseInt(value, 16) + amount));
                return adjusted.toString(16).padStart(2, '0');
            };

            const r = adjust(hex.substring(0, 2));
            const g = adjust(hex.substring(2, 4));
            const b = adjust(hex.substring(4, 6));
            
            const result = `#${r}${g}${b}`;
            this.#colorCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.warn('Error adjusting color:', error);
            return color; // Return original color if adjustment fails
        }
    }

    startBackgroundMusic = () => {
        if (this.backgroundMusicPlayer) {
            this.backgroundMusicPlayer.stop();
        }
        this.backgroundMusicPlayer = window.soundManager.playBackgroundMusic();
    }

    stopBackgroundMusic = () => {
        if (this.backgroundMusicPlayer) {
            this.backgroundMusicPlayer.stop();
            this.backgroundMusicPlayer = null;
        }
    }

    // Optimized color handling
    getCachedColor(r, g, b, a = 1) {
        const key = `${r},${g},${b},${a}`;
        if (!this.colorCache.has(key)) {
            this.colorCache.set(key, `rgba(${r},${g},${b},${a})`);
        }
        return this.colorCache.get(key);
    }

    draw(ctx) {
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
    }

    // Optimized pixel operations using TypedArrays
    createPixelBuffer() {
        const buffer = new ArrayBuffer(this.canvas.width * this.canvas.height * 4);
        return new Uint8ClampedArray(buffer);
    }

    setPixel(buffer, x, y, r, g, b, a = 255) {
        const index = (y * this.canvas.width + x) * 4;
        buffer[index] = r;
        buffer[index + 1] = g;
        buffer[index + 2] = b;
        buffer[index + 3] = a;
    }

    updateCanvas(buffer) {
        const imageData = new ImageData(buffer, this.canvas.width, this.canvas.height);
        this.offscreenCtx.putImageData(imageData, 0, 0);
    }

    renderScene() {
        // Draw background and base elements first
        // ...existing code...

        // Draw wall items with proper z-indexing and spacing
        const wallItems = this.currentScene.wallItems;
        if (wallItems) {
            wallItems.sort((a, b) => a.zIndex - b.zIndex).forEach(item => {
                const spacing = 20; // Minimum spacing between wall items
                item.x = Math.max(item.x, item.lastX + spacing);
                this.drawSprite(item.type, item.x, item.y);
                item.lastX = item.x + item.width;
            });
        }

        // Draw desk items in fixed positions
        if (this.currentScene.id === 'policeStation') {
            this.staticItems.desk.items.forEach(item => {
                this.drawSprite(item.type, item.x, item.y);
            });

            // Draw female officer at desk
            const officerSarah = this.npcs.policeStation.find(npc => npc.isReceptionist);
            if (officerSarah) {
                this.drawCharacter(
                    officerSarah.x,
                    officerSarah.y,
                    'officer_female',
                    officerSarah.facing
                );
            }
        }

        // Draw other NPCs and interactive elements
        // ...existing code...
    }

    drawCharacter(x, y, type, facing) {
        const sprite = this.sprites[type]?.[facing] || this.sprites.default;
        this.ctx.drawImage(sprite, x, y);
    }
}

// Initialize engine after DOM is loaded and ensure global reference
window.engine = new GameEngine();
window.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize game engine
        window.engine.init();

        // Ensure sound manager is ready
        if (window.soundManager) {
            // Try to resume audio context (needed for some browsers)
            if (window.soundManager.audioContext && 
                window.soundManager.audioContext.state === 'suspended') {
                window.soundManager.audioContext.resume();
            }
        }

        // Start initial scene
        window.engine.loadScene('policeStation');
    } catch (error) {
        console.error('Error during game initialization:', error);
    }
});
