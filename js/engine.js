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
        this.bgMusic = document.getElementById('bgMusic');
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
                }
            ]
        };
        this.floorLevel = 450; // Base floor level for characters
        this.canvas.style.cursor = 'pointer'; // Set default cursor
        this.animationFrame = 0;
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
        this.game.init(); // Initialize game state
        this.setupEventListeners();
        this.drawCurrentScene();
        this.startGameLoop();
    }

    startGameLoop() {
        const loop = (timestamp) => {
            // Update animation frame every 200ms
            if (timestamp - this.lastFrameTime > 200) {
                this.animationFrame = (this.animationFrame + 1) % 8;
                this.updateNPCs();
                this.lastFrameTime = timestamp;
                this.drawCurrentScene();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
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
    
    render() {
        if (this.isWalking) {
            // Only redraw when walking
            this.drawCurrentScene();
        }
    }
    
    drawCurrentScene() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
        }
        
        // Draw NPCs for current scene
        if (this.npcs[this.currentScene]) {
            this.npcs[this.currentScene].forEach(npc => {
                this.drawPixelCharacter(npc.x, npc.y, 
                    npc.type === 'sergeant' ? this.colors.brightBlue : this.colors.blue,
                    this.colors.yellow, npc.facing, true);
            });
        }

        // Draw player at current position
        this.drawPixelCharacter(
            this.playerPosition.x, 
            this.playerPosition.y, 
            this.colors.blue, 
            this.colors.yellow
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
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Change cursor if hovering over interactive element
            if (this.checkCollision(x, y)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.updateCursor(); // Use action-specific cursor
            }
        });
    }

    updateCursor() {
        switch(this.activeCommand) {
            case 'look':
                this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA1klEQVR4nO2WMQ7CMAxFv1MxcAPYGNgZuAgTN+AW3KUbF+lWNjbE1MFWo1RFrarUTuqEgT9ZsqXI/rJjOwaEEP+GBWABeJ3E5ZXvJXfd2U1KIJyCJsFO7eq65ztT+a7KqUPNw+MIDAEcY0YWZwDPFHcpgLJ0+gvAzoGDmOLZWwzUNqsDqp8qngKKr0AZu0rcIKQQtN9KyAYt7YKc8gwF6NvJWm+WxWKRztKNBBQP72cgJqCbSEWQnYCusO/hTmsoQGtQAvrdeHTvJEWw6Nug95R/UwkhfIUX0RFsX/v/i5YAAAAASUVORK5CYII=) 16 16, auto';
                break;
            case 'talk':
                this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB3klEQVR4nO2WTUsCURSGH7cfoMVQBC1atAraFLTpB7RqF7SKoHZFQUS0KKJVUVFEq/6BiyCi3xD9hKB2RREEl+ddOMIw3pk7jqm04YXLzD33fS73nHPPHAghhBBCwDRwBPQBVyvCBWAZKPgMvAmsA0MO/fPAAXAFXGqsABPAA/AC7OkioLJaCXj/KZyt/z2gF7gEaoEJbbsGGoFGY7BGfBFA7LIOYD/g2wvAnPZNA6+6rRtDRCtHFcKeXj9xmQwxDOwBcaN/E/gCjoF5oCrgOd0ahdtQBGxpx5kPp+vAFJAD9oFmY1sWAbeBCDRZbo5YHKgB9o2+OnV+zi5lZSDttLVQ/BAWEyjfdsz5+44vfzM2/v1MBGT3A7Ab8P0scGa077D/AVMNGL9HJWpAzPj/RXnwmI3/dgJTGs4rw3HOyGTx/SciEJiGxKe/wOKrjKHmQZMt9aR0jQIwqPcVaVvzJNBAkQ3z/JbScJ5S3IrYZSkjm5X0LvZqtM4z1AHXlmWLGTVvXqsGHH2s0/vfVrZ2iYBlYNOI0E9gQJ/bsqwHb/U5pwukNUMWjLoALkd6gXutjDdAr0tGJIxS2qPLVtc1MOJwXF+hkroPZA2nsZpsEmiJ+iCFEEKIPOIPzEq2zeiJoVwAAAAASUVORK5CYII=) 16 16, auto';
                break;
            case 'use':
                this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABDUlEQVR4nO2WQQ6CMBBFP5poPIE3UG/gETyJnsQzeAPuBJFdb6AbZKIJS0Imk06LLPiTJoQO818708wAiqIoCqcCcAVwBjACsEt5CjAHcPDsWwKYCnM96VmY47KmotQATgDaEXMzcUxVcbHWUBXbXg4ATLIw1Mg7Jq6jwXG0J8Z1pLl7Z94tUcErTB1/j6HG2EBXG5mLMYHfA5haLkZAjFOz1UJxJxQNSe/AVojj8PhOf84YgJmXwngRxIQ3ISVL+iMZ+CckXoNcaU5+C4YyESXA1Y+Jytj3gnlNrOWUHg2+Esfe2QI4+kZJyWmiTOQqYS6Q+K6QQm4MKQO5MaQM5MaQM5AbQ8qAoiiKwvEEBlT+e/++RgUAAAAASUVORK5CYII=) 16 16, auto';
                break;
            case 'take':
                this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABJklEQVR4nO2WMU4DMRBFP0QpECdA3AAJJMQFqKlpKJcoOMgegpaajiNwAHouQEVJh0TF3yArZWXNeL2btViJJyWKPfP1z9jjXUNRFEVRIjoCsARwC+DqgHUP4BXAHYBTWzgH8A7gA8DTAcsvADsAv1pPmrykOQPwCeAKwLkdnSxDyXab+xLAHYAtgIUrvMlw3ULMQDFYcC7CFRGYJNU5cWiMcyoEWMTlLjfJdRFgQGbOvujEkTW5NpDB6sirR54oAnPmJM8pddvdA9TwrO822JliRRuSQYZumMgMOIqFyoAitQEJ17OMHA0YkBfVjBkYWc2tMTCzmqMV8WetOwDPDW9a/YRGJ9aoHuT9l0j36KAX0e2wfQg14Rk7VVgCeNbLSFGUfvIHRthP0UJZCiMAAAAASUVORK5CYII=) 16 16, auto';
                break;
            case 'move':
                this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAzElEQVR4nO2WQQ6DMAwExyA+wuP6zP6q9NT36JWXcEDbA5Eqm9oJNFHFSLlE9sx6HRlCCCGEkM7MAWwAHACsHwYV1URdQpwK1FBaHSMppEBhrcOtCY3/k2RxcrTbnhGFRMB0dAxSRvTdClRV0VGWtas4mshbfhRnI2jcyThLgEPhtooTOBpTD0reywQmHVDvlTQRJ0xG0WDNACS4uMzPfgTB0GhG8iuQGV/vUnpfRs6evi7jbnyOa1/n4jJCSAAkWBFCCCHeDG9njnl1F+NSSQAAAABJRU5ErkJggg==) 16 16, auto';
                break;
            default:
                this.canvas.style.cursor = 'default';
        }
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

        // Boundary checks
        this.playerPosition.x = Math.max(50, Math.min(this.playerPosition.x, this.canvas.width - 50));
        this.playerPosition.y = Math.max(300, Math.min(this.playerPosition.y, this.floorLevel));

        // Check for collisions
        if (this.checkCollision(this.playerPosition.x, this.playerPosition.y)) {
            this.playerPosition.x = oldX;
            this.playerPosition.y = oldY;
        }

        this.drawCurrentScene();
    }

    drawPoliceStation() {
        const colors = this.colors;
        
        // Draw 3D perspective floor grid
        this.drawFloorGrid(0, 300, this.canvas.width, 150);
        
        // Draw walls with perspective
        this.draw3DWall(0, 0, this.canvas.width, 300, colors.blue);
        
        // Draw desks at proper height
        for (let i = 0; i < 3; i++) {
            this.draw3DDesk(100 + i * 200, 320, 150, 80);
        }
        
        // Update NPC positions to proper floor level
        if (this.npcs.policeStation) {
            this.npcs.policeStation.forEach(npc => {
                npc.y = Math.min(npc.y, this.floorLevel);
            });
        }
        
        // Draw evidence locker
        this.draw3DLocker(700, 100, 80, 180);
        
        // Draw doors
        this.drawDoor(50, 100, 'left', 'Sheriff\'s Office');
        this.drawDoor(600, 100, 'right', 'Briefing Room');
    }

    // Helper functions for 3D rendering
    drawFloorGrid(x, y, width, height) {
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

    draw3DWall(x, y, width, height, color) {
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

    draw3DDesk(x, y, width, height) {
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

    drawDoor(x, y, direction, label) {
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

    // Helper function to darken/lighten colors
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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

    drawPixelCharacter(x, y, uniformColor, badgeColor, facing = 'down', isWalking = false) {
        // More pixelated character style with 3D depth
        const pixels = 4; // Size of each pixel for chunky look
        
        // Helper function to draw a chunky pixel
        const drawPixel = (px, py, color) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                Math.floor(x + px * pixels), 
                Math.floor(y + py * pixels), 
                pixels, 
                pixels
            );
        };

        // Define character shape in pixel array
        const characterPixels = {
            head: [
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1]
            ],
            body: [
                [0,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,0,0]
            ],
            legs: {
                stand: [
                    [0,0,1,1,1,1,0,0],
                    [0,0,1,1,1,1,0,0],
                    [0,0,1,1,1,1,0,0],
                    [0,0,1,1,1,1,0,0]
                ],
                walk1: [
                    [0,1,1,0,0,1,1,0],
                    [1,1,0,0,0,0,1,1],
                    [1,0,0,0,0,0,0,1],
                    [1,0,0,0,0,0,0,1]
                ],
                walk2: [
                    [0,0,1,1,1,1,0,0],
                    [0,1,1,0,0,1,1,0],
                    [1,1,0,0,0,0,1,1],
                    [1,0,0,0,0,0,0,1]
                ]
            }
        };

        // Draw shadow (for 3D effect)
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 12 * pixels, 12 * pixels, 4 * pixels, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw character based on facing direction
        let xOffset = -16;
        let yOffset = -48;

        // Draw head
        characterPixels.head.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    if (facing === 'left' && px > 4) return; // Skip right side for left profile
                    if (facing === 'right' && px < 3) return; // Skip left side for right profile
                    drawPixel(px + xOffset, py + yOffset, '#FFD8B1');
                }
            });
        });

        // Draw uniform
        characterPixels.body.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset + 6, uniformColor);
                    // Add badge detail
                    if (py === 1 && px === 2) {
                        drawPixel(px + xOffset, py + yOffset + 6, badgeColor);
                    }
                }
            });
        });

        // Draw legs with walking animation
        const walkFrame = Math.floor(this.animationFrame / 2); // 0-3 animation frames
        const legs = isWalking ? 
            (walkFrame % 2 === 0 ? characterPixels.legs.walk1 : characterPixels.legs.walk2) 
            : characterPixels.legs.stand;
        
        legs.forEach((row, py) => {
            row.forEach((pixel, px) => {
                if (pixel) {
                    drawPixel(px + xOffset, py + yOffset + 11, '#000033');
                }
            });
        });

        // Face details based on direction
        if (facing === 'down' || facing === facing) {
            // Eyes
            drawPixel(xOffset + 2, yOffset + 3, '#000000');
            drawPixel(xOffset + 5, yOffset + 3, '#000000');
            // Mouth
            drawPixel(xOffset + 3, yOffset + 4, '#000000');
            drawPixel(xOffset + 4, yOffset + 4, '#000000');
        } else if (facing === 'left') {
            drawPixel(xOffset + 2, yOffset + 3, '#000000'); // Left eye
            drawPixel(xOffset + 2, yOffset + 4, '#000000'); // Mouth
        } else if (facing === 'right') {
            drawPixel(xOffset + 5, yOffset + 3, '#000000'); // Right eye
            drawPixel(xOffset + 5, yOffset + 4, '#000000'); // Mouth
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
        // Define interactive areas
        const interactiveAreas = [
            // Desks
            ...Array(3).fill().map((_, i) => ({
                x: 100 + i * 200,
                y: 320,
                width: 150,
                height: 80,
                type: 'desk',
                interactions: GAME_DATA.scenes.policeStation.hotspots.find(h => h.id === 'desk')?.interactions
            })),
            // Evidence locker
            {
                x: 700,
                y: 100,
                width: 80,
                height: 180,
                type: 'locker',
                interactions: GAME_DATA.scenes.policeStation.hotspots.find(h => h.id === 'evidenceLocker')?.interactions
            },
            // Doors
            {
                x: 50,
                y: 100,
                width: 60,
                height: 120,
                type: 'door',
                interactions: GAME_DATA.scenes.policeStation.hotspots.find(h => h.id === 'sheriffsOfficeDoor')?.interactions
            },
            {
                x: 600,
                y: 100,
                width: 60,
                height: 120,
                type: 'door',
                interactions: GAME_DATA.scenes.policeStation.hotspots.find(h => h.id === 'briefingRoomDoor')?.interactions
            }
        ];

        return interactiveAreas.find(area => 
            x >= area.x && 
            x <= area.x + area.width && 
            y >= area.y && 
            y <= area.y + area.height
        );
    }

    processInteraction(hitObject) {
        if (!this.activeCommand) {
            this.showDialog("Select an action first (Look, Talk, Use, Take, Move)");
            return;
        }
        
        const interaction = hitObject.interactions[this.activeCommand];
        
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
            
            // Handle room transitions
            if (this.activeCommand === 'use') {
                // Room transitions
                switch (hitObject.id) {
                    case 'sheriffsOfficeDoor':
                        game.changeLocation('sheriffsOffice');
                        break;
                    case 'briefingRoomDoor':
                        game.changeLocation('briefingRoom');
                        break;
                    case 'exitDoor':
                        if (game.gameState.currentLocation === 'sheriffsOffice' || 
                            game.gameState.currentLocation === 'briefingRoom') {
                            game.changeLocation('policeStation');
                        }
                        break;
                }
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
            // Update current scene directly
            this.currentScene = sceneId;
            
            // Reset player position based on scene
            switch (sceneId) {
                case 'policeStation':
                    this.playerPosition = { x: 400, y: 350 };
                    break;
                case 'downtown':
                    this.playerPosition = { x: 150, y: 350 };
                    break;
                case 'park':
                    this.playerPosition = { x: 400, y: 350 };
                    break;
                case 'sheriffsOffice':
                    this.playerPosition = { x: 400, y: 350 };
                    break;
                case 'briefingRoom':
                    this.playerPosition = { x: 400, y: 350 };
                    break;
                default:
                    console.warn('Unknown scene:', sceneId);
                    this.playerPosition = { x: 400, y: 350 };
            }
            
            // Reset walking state
            this.isWalking = false;
            this.walkTarget = null;
            
            // Draw the new scene
            this.drawCurrentScene();
            
        } catch (error) {
            console.error("Error loading scene:", error);
            this.showDialog("Error loading scene. Please try again.");
        }
    }

    // Add method to update collision objects based on current scene
    updateCollisionObjects() {
        this.collisionObjects = [];
        
        switch(this.currentScene) {
            case 'policeStation':
                this.collisionObjects = [
                    { x: 100, y: 200, width: 150, height: 80, type: 'desk' },
                    { x: 700, y: 100, width: 80, height: 180, type: 'locker' }
                ];
                break;
            // Add other scenes as needed
        }
    }

    draw3DLocker(x, y, width, height) {
        const ctx = this.ctx;
        
        // Locker front
        ctx.fillStyle = this.colors.lightGray;
        ctx.fillRect(x, y, width, height);
        
        // Locker side (for 3D effect)
        ctx.fillStyle = this.adjustColor(this.colors.lightGray, -30);
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width + 20, y + 20);
        ctx.lineTo(x + width + 20, y + height + 20);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        
        // Locker door details
        ctx.fillStyle = this.colors.darkGray;
        ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        
        // Handle
        ctx.fillStyle = this.colors.yellow;
        ctx.fillRect(x + width - 15, y + height/2 - 10, 8, 20);
        
        // Lock
        ctx.fillStyle = this.colors.black;
        ctx.fillRect(x + width - 15, y + height/2 - 30, 8, 8);
    }

    updateNPCs() {
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
            } else {
                // Move towards current target
                const speed = 2;
                npc.x += (dx / distance) * speed;
                npc.y += (dy / distance) * speed;
                
                // Update facing direction
                npc.facing = dx > 0 ? 'right' : 'left';
            }
        });
    }
}

// Move initialization to after DOM is loaded and ensure global reference
window.engine = new GameEngine();
window.addEventListener('DOMContentLoaded', () => {
    window.engine.init();
});
