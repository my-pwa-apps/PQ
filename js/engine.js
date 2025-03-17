class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.inventory = new Set();
        this.activeCommand = null;
        this.currentScene = null;
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
        // Initialize the game
        try {
            this.setupEventListeners();
            soundManager.loadSound('click', 880, 0.1, 'square');
            soundManager.loadSound('pickup', 660, 0.2, 'triangle');
            soundManager.loadSound('error', 220, 0.3, 'sawtooth');
            soundManager.loadSound('evidence', 440, 0.5, 'triangle');
            soundManager.loadSound('success', 880, 0.1, 'sine');
            
            this.showDialog("Welcome to Digital Precinct! It's Monday morning at the Lytton Police Department. The sergeant has assigned you to investigate a series of downtown burglaries.");
            this.loadScene('policeStation');
            
            // Initialize game with first case
            game.startCase('case1');
            this.updateCaseInfo();
            
            // Start animation loop
            this.startGameLoop();
            
            // Handle resuming audio context on user interaction
            const resumeAudio = () => {
                const audioCtx = soundManager.audioCtx;
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            
            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        } catch (error) {
            console.error("Game initialization error:", error);
            this.showDialog("Error initializing game. Please refresh the page.");
        }
    }

    startGameLoop() {
        // Use requestAnimationFrame for smoother rendering
        const loop = (timestamp) => {
            // Limit to ~30fps for retro feel and performance
            if (timestamp - this.lastFrameTime > 33) { // ~30fps
                this.update();
                this.render();
                this.lastFrameTime = timestamp;
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
        
        // Draw appropriate scene
        switch (game.gameState.currentLocation) {
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
        
        // Draw player at current position
        this.drawPixelCharacter(
            this.playerPosition.x, 
            this.playerPosition.y, 
            this.colors.blue, 
            this.colors.yellow
        );
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
                    this.handleMovement('up');
                    break;
                case 'ArrowDown':
                    this.handleMovement('down');
                    break;
                case 'ArrowLeft':
                    this.handleMovement('left');
                    break;
                case 'ArrowRight':
                    this.handleMovement('right');
                    break;
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
        // Modified to handle walking
        if (this.activeCommand === 'move') {
            // Start walking to clicked position
            this.walkTarget = { x, y };
            this.isWalking = true;
            return;
        }
        
        // For other commands, check if player is close enough to the object
        const hitObject = this.checkCollision(x, y);
        if (hitObject) {
            // Calculate distance from player to object
            const objectCenterX = hitObject.x + (hitObject.width / 2);
            const objectCenterY = hitObject.y + (hitObject.height / 2);
            const dx = objectCenterX - this.playerPosition.x;
            const dy = objectCenterY - this.playerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If player is close enough, interact immediately
            if (distance < 100) { // Within 100px
                soundManager.playSound('click');
                this.processInteraction(hitObject);
            } else {
                // Otherwise, walk to the object first
                this.walkTarget = { 
                    x: objectCenterX - (dx > 0 ? 50 : -50), // Stand to the left or right
                    y: objectCenterY + 20 // Stand a bit in front
                };
                this.isWalking = true;
                
                // We'll check for interaction once we reach the target
            }
        } else if (this.activeCommand !== 'move') {
            soundManager.playSound('error');
            this.showDialog("There's nothing there to " + this.activeCommand);
        }
    }

    handleMovement(direction) {
        // Map each location to possible destinations in each direction
        const navigationMap = {
            'policeStation': {
                'down': 'downtown',
                'right': 'downtown',
                'up': 'sheriffsOffice',
                'left': 'briefingRoom'
            },
            'downtown': {
                'up': 'policeStation',
                'down': 'park',
                'left': 'policeStation',
                'right': 'park'
            },
            'park': {
                'up': 'downtown',
                'left': 'downtown'
            },
            'sheriffsOffice': {
                'down': 'policeStation',
                'right': 'briefingRoom'
            },
            'briefingRoom': {
                'down': 'policeStation',
                'left': 'sheriffsOffice'
            }
        };

        const currentLocation = game.gameState.currentLocation;
        const possibleDestinations = navigationMap[currentLocation];
        
        if (possibleDestinations && possibleDestinations[direction]) {
            const newLocation = possibleDestinations[direction];
            soundManager.playSound('click');
            
            // Show appropriate message for the transition
            let message = "";
            switch(newLocation) {
                case 'policeStation':
                    message = "You return to the police station.";
                    break;
                case 'downtown':
                    message = "You head downtown to investigate.";
                    break;
                case 'park':
                    message = "You go to the city park to follow up on a lead.";
                    break;
                case 'sheriffsOffice':
                    message = "You enter the Sheriff's office.";
                    break;
                case 'briefingRoom':
                    message = "You enter the briefing room.";
                    break;
            }
            
            this.showDialog(message);
            game.changeLocation(newLocation);
        }
    }

    drawPoliceStation() {
        // Use the stored color palette for consistency
        const colors = this.colors;
        
        // Draw background wall
        this.ctx.fillStyle = colors.blue;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw floor
        this.ctx.fillStyle = colors.darkGray;
        this.ctx.fillRect(0, 300, this.canvas.width, 150);

        // Draw desks
        for (let i = 0; i < 3; i++) {
            // Desk
            this.ctx.fillStyle = colors.brown;
            this.ctx.fillRect(100 + i * 200, 200, 150, 80);
            
            // Computer on desk
            this.ctx.fillStyle = colors.darkGray;
            this.ctx.fillRect(120 + i * 200, 210, 60, 40);
            this.ctx.fillStyle = colors.brightCyan;
            this.ctx.fillRect(125 + i * 200, 215, 50, 30);
            
            // Chair
            this.ctx.fillStyle = colors.darkGray;
            this.ctx.fillRect(130 + i * 200, 290, 40, 50);
            
            // Papers
            this.ctx.fillStyle = colors.white;
            this.ctx.fillRect(200 + i * 200, 220, 30, 20);
        }

        // Evidence locker
        this.ctx.fillStyle = colors.lightGray;
        this.ctx.fillRect(700, 100, 80, 180);
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(720, 150, 40, 5);
        this.ctx.fillRect(720, 180, 40, 5);
        this.ctx.fillRect(720, 210, 40, 5);

        // Police officer (pixel style)
        this.drawPixelCharacter(400, 350, colors.blue, colors.yellow);

        // Sign
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(10, 50, 150, 40);
        this.ctx.fillStyle = colors.yellow;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('POLICE STATION', 20, 75);
        
        // Exit sign
        this.ctx.fillStyle = colors.red;
        this.ctx.fillRect(350, 430, 100, 20);
        this.ctx.fillStyle = colors.white;
        this.ctx.fillText('EXIT', 385, 445);
        
        // Arrow indicators for keyboard navigation
        this.drawArrowIndicator('right', 'Downtown');
        this.drawArrowIndicator('down', 'Downtown');
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

    drawPixelCharacter(x, y, uniformColor, badgeColor) {
        // Head
        this.ctx.fillStyle = '#FFD8B1';
        this.ctx.fillRect(x, y - 50, 20, 20);
        
        // Body
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(x - 5, y - 30, 30, 30);
        
        // Badge
        this.ctx.fillStyle = badgeColor;
        this.ctx.fillRect(x + 5, y - 25, 10, 5);
        
        // Arms
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(x - 15, y - 25, 10, 20);
        this.ctx.fillRect(x + 25, y - 25, 10, 20);
        
        // Legs
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x, y, 10, 20);
        this.ctx.fillRect(x + 10, y, 10, 20);
    }

    drawArrowIndicator(direction, destination) {
        const colors = {
            arrow: '#FFFF55', // Yellow
            text: '#FFFFFF'   // White
        };
        
        this.ctx.fillStyle = colors.arrow;
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        
        let x, y, arrowPath;
        
        switch(direction) {
            case 'up':
                x = this.canvas.width / 2;
                y = 25;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - 10, y + 15);
                this.ctx.lineTo(x + 10, y + 15);
                this.ctx.closePath();
                break;
            case 'down':
                x = this.canvas.width / 2;
                y = this.canvas.height - 25;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - 10, y - 15);
                this.ctx.lineTo(x + 10, y - 15);
                this.ctx.closePath();
                break;
            case 'left':
                x = 25;
                y = this.canvas.height / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + 15, y - 10);
                this.ctx.lineTo(x + 15, y + 10);
                this.ctx.closePath();
                break;
            case 'right':
                x = this.canvas.width - 25;
                y = this.canvas.height / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - 15, y - 10);
                this.ctx.lineTo(x - 15, y + 10);
                this.ctx.closePath();
                break;
        }
        
        this.ctx.fill();
        this.ctx.stroke();
        
        // Add destination text
        this.ctx.fillStyle = colors.text;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        
        switch(direction) {
            case 'up':
                this.ctx.fillText(destination, x, y - 5);
                break;
            case 'down':
                this.ctx.fillText(destination, x, y + 25);
                break;
            case 'left':
                this.ctx.fillText(destination, x + 20, y - 15);
                break;
            case 'right':
                this.ctx.fillText(destination, x - 20, y - 15);
                break;
        }
    }

    loadScene(sceneId) {
        try {
            this.currentScene = GAME_DATA.scenes[sceneId];
            if (!this.currentScene) {
                console.error("Scene not found:", sceneId);
                return;
            }
            
            // Clear canvas before drawing new scene
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            switch (sceneId) {
                case 'policeStation':
                    this.playerPosition = { x: 400, y: 350 };
                    this.drawPoliceStation();
                    break;
                case 'downtown':
                    this.playerPosition = { x: 150, y: 350 };
                    this.drawDowntown();
                    break;
                case 'park':
                    this.playerPosition = { x: 400, y: 350 };
                    this.drawPark();
                    break;
                case 'sheriffsOffice':
                    this.playerPosition = { x: 400, y: 350 };
                    this.drawSheriffsOffice();
                    break;
                case 'briefingRoom':
                    this.playerPosition = { x: 400, y: 350 };
                    this.drawBriefingRoom();
                    break;
                default:
                    console.error("Unknown scene:", sceneId);
                    return;
            }
            soundManager.playMusic(this.currentScene.music);
        } catch (error) {
            console.error("Error loading scene:", error);
        }
        
        // Draw scene with player
        this.drawCurrentScene();
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
        if (!this.currentScene) return null;
        return this.currentScene.hotspots.find(hotspot =>
            x >= hotspot.x && x <= hotspot.x + hotspot.width &&
            y >= hotspot.y && y <= hotspot.y + hotspot.height
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
}

// Initialize game after window loads
const engine = new GameEngine();
window.addEventListener('load', () => engine.init());
