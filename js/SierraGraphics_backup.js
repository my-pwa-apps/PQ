/**
 * Sierra-style Graphics System for Police Quest
 * Authentic Police Quest 1 (AGI/VGA era) graphics rendering
 */
class SierraGraphics {    constructor(canvas, ctx) {
        console.log("SierraGraphics constructor called with:", canvas, ctx);
        this.canvas = canvas;
        this.ctx = ctx;
        
        if (!this.canvas || !this.ctx) {
            console.error("SierraGraphics: Invalid canvas or context provided", { canvas, ctx });
            throw new Error("SierraGraphics requires valid canvas and context");
        }
        
        // Sierra AGI/VGA color palette - authentic Police Quest 1 colors
        this.sierraPalette = {
            // Primary colors from Sierra AGI
            black: '#000000',
            darkBlue: '#0000AA',
            darkGreen: '#00AA00',
            darkCyan: '#00AAAA',
            darkRed: '#AA0000',
            darkMagenta: '#AA00AA',
            brown: '#AA5500',
            lightGray: '#AAAAAA',
            darkGray: '#555555',
            blue: '#5555FF',
            green: '#55FF55',
            cyan: '#55FFFF',
            red: '#FF5555',
            magenta: '#FF55FF',
            yellow: '#FFFF55',
            white: '#FFFFFF',
            
            // Police Quest specific colors
            policeBlue: '#0000AA',
            policeCarBlue: '#000055',
            badgeGold: '#FFFF55',
            streetGray: '#AAAAAA',
            buildingTan: '#AA5500',
            grassGreen: '#00AA00',
            skinTone: '#FFAA55'
        };
        
        // Authentic Sierra font style
        this.fontStyle = {
            family: 'monospace',
            size: 14,
            weight: 'normal'
        };
        
        // Sierra-style dithering patterns
        this.ditherPatterns = {
            light: [[1, 0], [0, 1]],
            medium: [[1, 1, 0, 0], [1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 1]],
            heavy: [[1, 0], [1, 1]]
        };
        
        // Initialize drawing state
        this.currentFillStyle = this.sierraPalette.black;
        this.currentStrokeStyle = this.sierraPalette.white;
        this.currentFont = this.getSierraFont();
    }
    
    getSierraFont() {
        return `${this.fontStyle.weight} ${this.fontStyle.size}px ${this.fontStyle.family}`;
    }
    
    // Authentic Sierra-style character drawing - Main method
    drawCharacter(x, y, characterName = 'officer', facing = 'down', action = 'standing') {
        // Determine character appearance based on name
        let uniformColor = this.sierraPalette.policeBlue;
        let badgeColor = this.sierraPalette.badgeGold;
        let isWalking = action === 'walking';
        let isFemale = false;
        let isNPC = characterName !== 'sonny';
        
        // Character-specific colors
        switch(characterName.toLowerCase()) {
            case 'sonny':
            case 'bonds':
                uniformColor = this.sierraPalette.policeBlue;
                break;
            case 'jenny':
                uniformColor = this.sierraPalette.policeBlue;
                isFemale = true;
                break;
            case 'sergeant':
            case 'dooley':
                uniformColor = this.sierraPalette.darkBlue;
                break;
            default:
                uniformColor = this.sierraPalette.policeBlue;
        }
        
        this.drawSierraCharacter(x, y, uniformColor, badgeColor, facing, isWalking, isNPC, isFemale);
    }
    
    // Authentic Sierra-style character drawing - Core implementation
    drawSierraCharacter(x, y, uniformColor, badgeColor, facing = 'down', isWalking = false, isNPC = false, isFemale = false) {
        const ctx = this.ctx;
        ctx.save();
        
        // Character dimensions (authentic Sierra pixel art style)
        const charWidth = 16;
        const charHeight = 24;
        
        // Calculate character position
        const charX = x - charWidth / 2;
        const charY = y - charHeight;
        
        // Draw character using authentic Sierra block colors
        ctx.fillStyle = this.sierraPalette.skinTone;
        
        // Head
        this.drawPixelRect(charX + 6, charY, 4, 4);
        
        // Body/Uniform
        ctx.fillStyle = uniformColor;
        this.drawPixelRect(charX + 5, charY + 4, 6, 8);
        
        // Badge (if police officer)
        if (badgeColor && badgeColor !== uniformColor) {
            ctx.fillStyle = badgeColor;
            this.drawPixelRect(charX + 6, charY + 5, 2, 1);
        }
        
        // Arms
        ctx.fillStyle = uniformColor;
        this.drawPixelRect(charX + 3, charY + 5, 2, 6);
        this.drawPixelRect(charX + 11, charY + 5, 2, 6);
        
        // Hands
        ctx.fillStyle = this.sierraPalette.skinTone;
        this.drawPixelRect(charX + 3, charY + 11, 2, 2);
        this.drawPixelRect(charX + 11, charY + 11, 2, 2);
        
        // Pants/Belt
        ctx.fillStyle = this.sierraPalette.darkBlue;
        this.drawPixelRect(charX + 5, charY + 12, 6, 6);
        
        // Belt
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(charX + 5, charY + 12, 6, 1);
        
        // Legs
        ctx.fillStyle = this.sierraPalette.darkBlue;
        this.drawPixelRect(charX + 5, charY + 18, 2, 4);
        this.drawPixelRect(charX + 9, charY + 18, 2, 4);
        
        // Feet/Shoes
        ctx.fillStyle = this.sierraPalette.black;
        this.drawPixelRect(charX + 4, charY + 22, 3, 2);
        this.drawPixelRect(charX + 9, charY + 22, 3, 2);
        
        // Walking animation (simple leg offset)
        if (isWalking) {
            const walkOffset = Math.floor(Date.now() / 200) % 2;
            if (walkOffset === 1) {
                this.drawPixelRect(charX + 5, charY + 20, 2, 2);
                this.drawPixelRect(charX + 9, charY + 16, 2, 2);
            }
        }
        
        ctx.restore();
    }
    
    // Clear screen with Sierra-style background
    clearScreen() {
        this.ctx.fillStyle = this.sierraPalette.black;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Helper method to draw pixel-perfect rectangles
    drawPixelRect(x, y, width, height) {
        this.ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
    }
    
    // Draw Sierra-style text with authentic appearance
    drawSierraText(text, x, y, color = this.sierraPalette.white, backgroundColor = null) {
        const ctx = this.ctx;
        ctx.save();
        
        ctx.font = this.currentFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Background box if specified (Sierra text boxes)
        if (backgroundColor) {
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = this.fontStyle.size + 4;
            
            ctx.fillStyle = backgroundColor;
            this.drawPixelRect(x - 2, y - 2, textWidth + 4, textHeight);
            
            // Border
            ctx.strokeStyle = this.sierraPalette.lightGray;
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 2, y - 2, textWidth + 4, textHeight);
        }
        
        // Text
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }
    
    // Draw Sierra-style buildings
    drawSierraBuilding(x, y, width, height, color = this.sierraPalette.buildingTan, windowColor = this.sierraPalette.darkBlue) {
        const ctx = this.ctx;
        
        // Building body
        ctx.fillStyle = color;
        this.drawPixelRect(x, y, width, height);
        
        // Building outline
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Windows (Sierra style grid pattern)
        const windowWidth = 8;
        const windowHeight = 6;
        const windowSpacingX = 16;
        const windowSpacingY = 12;
        
        ctx.fillStyle = windowColor;
        for (let wx = x + 8; wx < x + width - windowWidth; wx += windowSpacingX) {
            for (let wy = y + 8; wy < y + height - windowHeight; wy += windowSpacingY) {
                this.drawPixelRect(wx, wy, windowWidth, windowHeight);
            }
        }
    }
    
    // Draw Sierra-style police car
    drawSierraPoliceCar(x, y) {
        const ctx = this.ctx;
        const carWidth = 48;
        const carHeight = 24;
        
        // Car body
        ctx.fillStyle = this.sierraPalette.policeCarBlue;
        this.drawPixelRect(x, y, carWidth, carHeight);
        
        // Car windows
        ctx.fillStyle = this.sierraPalette.darkCyan;
        this.drawPixelRect(x + 8, y + 4, carWidth - 16, 8);
        
        // Police markings
        ctx.fillStyle = this.sierraPalette.white;
        this.drawPixelRect(x + 4, y + 16, 8, 4);
        this.drawPixelRect(x + carWidth - 12, y + 16, 8, 4);
        
        // "POLICE" text
        ctx.fillStyle = this.sierraPalette.white;
        ctx.font = '8px monospace';
        ctx.fillText('POLICE', x + 12, y + 17);
        
        // Wheels
        ctx.fillStyle = this.sierraPalette.black;
        this.drawPixelRect(x + 4, y + 20, 6, 4);
        this.drawPixelRect(x + carWidth - 10, y + 20, 6, 4);
        
        // Emergency lights
        ctx.fillStyle = this.sierraPalette.red;
        this.drawPixelRect(x + 8, y - 2, 4, 2);
        ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(x + carWidth - 12, y - 2, 4, 2);
    }
    
    // Draw Sierra-style command interface
    drawCommandInterface(commands, selectedCommand = null) {
        const ctx = this.ctx;
        const interfaceY = this.canvas.height - 80;
        const buttonWidth = 60;
        const buttonHeight = 20;
        const buttonSpacing = 10;
        
        // Interface background
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(0, interfaceY, this.canvas.width, 80);
        
        // Border
        ctx.strokeStyle = this.sierraPalette.lightGray;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, interfaceY, this.canvas.width, 80);
        
        // Command buttons
        commands.forEach((command, index) => {
            const buttonX = 10 + index * (buttonWidth + buttonSpacing);
            const buttonY = interfaceY + 10;
            
            // Button background
            const isSelected = selectedCommand === command;
            ctx.fillStyle = isSelected ? this.sierraPalette.white : this.sierraPalette.lightGray;
            this.drawPixelRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Button border
            ctx.strokeStyle = this.sierraPalette.black;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Button text
            const textColor = isSelected ? this.sierraPalette.black : this.sierraPalette.black;
            this.drawSierraText(command.toUpperCase(), buttonX + 8, buttonY + 6, textColor);
        });
    }
    
    // Draw Sierra-style inventory display
    drawInventory(items, x, y, maxWidth = 200) {
        const ctx = this.ctx;
        const itemHeight = 16;
        const totalHeight = items.length * itemHeight + 20;
        
        // Inventory background
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(x, y, maxWidth, totalHeight);
        
        // Border
        ctx.strokeStyle = this.sierraPalette.white;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, maxWidth, totalHeight);
        
        // Title
        this.drawSierraText('INVENTORY', x + 8, y + 4, this.sierraPalette.white);
        
        // Items
        items.forEach((item, index) => {
            const itemY = y + 20 + index * itemHeight;
            const itemName = typeof item === 'string' ? item : item.name || item.id;
            this.drawSierraText(`• ${itemName.toUpperCase()}`, x + 8, itemY, this.sierraPalette.white);
        });
    }
    
    // Apply Sierra-style dithering for backgrounds
    applyDithering(x, y, width, height, pattern = 'light', color1, color2) {
        const ctx = this.ctx;
        const patternArray = this.ditherPatterns[pattern];
        
        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                const patternX = px % patternArray[0].length;
                const patternY = py % patternArray.length;
                const useColor1 = patternArray[patternY][patternX] === 1;
                
                ctx.fillStyle = useColor1 ? color1 : color2;
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
    }
    
    // Sierra-style scene transition effect
    drawTransitionEffect(progress, type = 'wipe') {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        if (type === 'wipe') {
            // Horizontal wipe effect
            const wipePosition = progress * width;
            ctx.fillStyle = this.sierraPalette.black;
            this.drawPixelRect(0, 0, wipePosition, height);
        } else if (type === 'iris') {
            // Iris effect (circular)
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
            const currentRadius = (1 - progress) * maxRadius;
            
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Scene drawing methods
    drawPoliceStation() {
        const ctx = this.ctx;
        
        // Clear with Sierra black background
        this.clearScreen();
        
        // Police station floor - classic Sierra tile pattern
        ctx.fillStyle = this.sierraPalette.lightGray;
        this.drawPixelRect(0, 400, 800, 200);
        
        // Floor tile lines for authentic look
        ctx.strokeStyle = this.sierraPalette.darkGray;
        ctx.lineWidth = 1;
        for (let x = 0; x < 800; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 400);
            ctx.lineTo(x, 600);
            ctx.stroke();
        }
        for (let y = 400; y < 600; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }
        
        // Police station walls
        ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(0, 0, 800, 380);
        
        // Reception desk - center of station
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(350, 280, 160, 60);
        
        // Desk details
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(355, 285, 150, 50);
        
        // File cabinets - left side
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(50, 200, 30, 80);
        this.drawPixelRect(80, 200, 30, 80);
        
        // File cabinets - right side
        this.drawPixelRect(720, 200, 30, 80);
        
        // Detective desks
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(200, 320, 100, 60);
        this.drawPixelRect(500, 350, 100, 60);
        
        // Police department sign
        this.drawSierraText("LYTTON POLICE DEPARTMENT", 250, 50, this.sierraPalette.white);
        
        // Water cooler
        ctx.fillStyle = this.sierraPalette.cyan;
        this.drawPixelRect(730, 280, 24, 25);
        
        // Coffee machine
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(680, 150, 30, 40);
        
        // Door to parking lot
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(750, 500, 50, 100);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.strokeRect(750, 500, 50, 100);
        
        // Evidence room door
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(50, 350, 40, 80);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.strokeRect(50, 350, 40, 80);
        
        // American flag
        ctx.fillStyle = this.sierraPalette.red;
        this.drawPixelRect(100, 100, 30, 20);
        ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(100, 100, 12, 8);
    }
    
    // Add missing methods that are called by engine
    drawHotspot(hotspot) {
        // Optionally draw hotspot indicators in debug mode
        if (window.gameEngine && window.gameEngine.debugMode) {
            this.ctx.save();
            this.ctx.strokeStyle = this.sierraPalette.yellow;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 4]);
            this.ctx.strokeRect(
                hotspot.x - (hotspot.width || 20) / 2,
                hotspot.y - (hotspot.height || 20) / 2,
                hotspot.width || 20,
                hotspot.height || 20
            );
            this.ctx.restore();
        }
    }
    
    drawCommandInterface() {
        // Command interface is handled by HTML/CSS
        // This method exists for compatibility
    }
    
    drawInventory(items) {
        // Inventory UI is handled by HTML/CSS
        // This method exists for compatibility
    }
    
    drawProcedurePanel(procedure) {
        // Procedure panel is handled by HTML/CSS
        // This method exists for compatibility
    }
    
    drawCasePanel(caseData) {
        // Case panel is handled by HTML/CSS
        // This method exists for compatibility
    }
    
    drawScoreDisplay(score, rank) {
        // Score display is handled by HTML/CSS
        // This method exists for compatibility
    }
    
    // Draw current scene with proper Sierra graphics
    drawScene(sceneName) {
        switch(sceneName) {
            case 'policeStation':
            case 'policeStation_lobby':
                this.drawPoliceStation();
                break;
            case 'downtown':
            case 'downtown_main':
                this.drawDowntown();
                break;
            case 'park':
            case 'city_park':
                this.drawPark();
                break;
            case 'sheriffsOffice':
                this.drawSheriffsOffice();
                break;
            case 'briefingRoom':
            case 'policeStation_briefing':
                this.drawBriefingRoom();
                break;
            default:
                // Draw a default scene
                this.clearScreen();
                this.drawSierraText(`Scene: ${sceneName}`, 300, 250, this.sierraPalette.white);
                this.drawSierraText("(Scene graphics not yet implemented)", 250, 280, this.sierraPalette.yellow);
        }
    }
    
    drawBriefingRoom() {
        this.clearScreen();
        
        // Floor
        this.ctx.fillStyle = this.sierraPalette.lightGray;
        this.drawPixelRect(0, 400, 800, 200);
        
        // Walls
        this.ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(0, 0, 800, 400);
        
        // Conference table
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(250, 250, 300, 150);
        
        // Podium
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(370, 150, 60, 40);
        
        // Whiteboard
        this.ctx.fillStyle = this.sierraPalette.white;
        this.drawPixelRect(300, 50, 200, 80);
        this.ctx.strokeStyle = this.sierraPalette.black;
        this.ctx.strokeRect(300, 50, 200, 80);
        
        this.drawSierraText("BRIEFING ROOM", 320, 20, this.sierraPalette.white);
    }
    
    drawSheriffsOffice() {
        this.clearScreen();
        
        // Floor
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(0, 400, 800, 200);
        
        // Walls
        this.ctx.fillStyle = this.sierraPalette.darkBlue;
        this.drawPixelRect(0, 0, 800, 400);
        
        // Sheriff's desk
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(300, 200, 200, 100);
        
        // Desk chair
        this.ctx.fillStyle = this.sierraPalette.black;
        this.drawPixelRect(385, 300, 30, 40);
        
        // Filing cabinet
        this.ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(100, 200, 60, 120);
        
        // American flag
        this.ctx.fillStyle = this.sierraPalette.red;
        this.drawPixelRect(650, 100, 40, 30);
        this.ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(650, 100, 16, 12);
        
        this.drawSierraText("SHERIFF'S OFFICE", 300, 20, this.sierraPalette.white);
    }
    
    drawPark() {
        this.clearScreen();
        
        // Sky
        this.ctx.fillStyle = this.sierraPalette.cyan;
        this.drawPixelRect(0, 0, 800, 300);
        
        // Grass
        this.ctx.fillStyle = this.sierraPalette.grassGreen;
        this.drawPixelRect(0, 300, 800, 300);
        
        // Path
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(300, 350, 200, 100);
        
        // Fountain
        this.ctx.fillStyle = this.sierraPalette.darkGray;
        this.ctx.beginPath();
        this.ctx.arc(400, 250, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = this.sierraPalette.cyan;
        this.ctx.beginPath();
        this.ctx.arc(400, 250, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Trees (simple sierra style)
        this.drawSierraTree(150, 200);
        this.drawSierraTree(650, 250);
        
        // Bench
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(520, 380, 60, 10);
        this.drawPixelRect(530, 370, 5, 20);
        this.drawPixelRect(565, 370, 5, 20);
    }
    
    drawSierraTree(x, y) {
        // Tree trunk
        this.ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(x - 5, y, 10, 40);
        
        // Foliage (triangle)
        this.ctx.fillStyle = this.sierraPalette.darkGreen;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 30);
        this.ctx.lineTo(x - 30, y + 10);
        this.ctx.lineTo(x + 30, y + 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Lighter foliage on top
        this.ctx.fillStyle = this.sierraPalette.green;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 40);
        this.ctx.lineTo(x - 20, y - 10);
        this.ctx.lineTo(x + 20, y - 10);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // Scene drawing methods
    drawPoliceStation() {
        const ctx = this.ctx;
        
        // Clear with Sierra black background
        this.clearScreen();
        
        // Police station floor - classic Sierra tile pattern
        ctx.fillStyle = this.sierraPalette.lightGray;
        this.drawPixelRect(0, 400, 800, 200);
        
        // Floor tile lines for authentic look
        ctx.strokeStyle = this.sierraPalette.darkGray;
        ctx.lineWidth = 1;
        for (let x = 0; x < 800; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 400);
            ctx.lineTo(x, 600);
            ctx.stroke();
        }
        for (let y = 400; y < 600; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }
        
        // Police station walls
        ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(0, 0, 800, 380);
        
        // Reception desk - center of station
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(350, 280, 160, 60);
        
        // Desk details
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(355, 285, 150, 50);
        
        // File cabinets - left side
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(50, 200, 30, 80);
        this.drawPixelRect(80, 200, 30, 80);
        
        // File cabinets - right side
        this.drawPixelRect(720, 200, 30, 80);
        
        // Detective desks
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(200, 320, 100, 60);
        this.drawPixelRect(500, 350, 100, 60);
        
        // Police department sign
        this.drawSierraText("LYTTON POLICE DEPARTMENT", 250, 50, this.sierraPalette.white);
        
        // Water cooler
        ctx.fillStyle = this.sierraPalette.cyan;
        this.drawPixelRect(730, 280, 24, 25);
        
        // Coffee machine
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(680, 150, 30, 40);
        
        // Door to parking lot
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(750, 500, 50, 100);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.strokeRect(750, 500, 50, 100);
        
        // Evidence room door
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(50, 350, 40, 80);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.strokeRect(50, 350, 40, 80);
        
        // American flag
        ctx.fillStyle = this.sierraPalette.red;
        this.drawPixelRect(100, 100, 30, 20);
        ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(100, 100, 12, 8);
    }
    
    // Authentic Police Quest Downtown scene
    drawDowntown() {
        const ctx = this.ctx;
        
        // Clear with Sierra background
        this.clearScreen();
        
        // Sky
        ctx.fillStyle = this.sierraPalette.cyan;
        this.drawPixelRect(0, 0, 800, 300);
        
        // Street
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(0, 500, 800, 100);
        
        // Street lines
        ctx.fillStyle = this.sierraPalette.yellow;
        this.drawPixelRect(390, 500, 20, 100);
        
        // Sidewalk
        ctx.fillStyle = this.sierraPalette.lightGray;
        this.drawPixelRect(0, 450, 800, 50);
        
        // Buildings - Electronics Store (crime scene)
        ctx.fillStyle = this.sierraPalette.buildingTan;
        this.drawPixelRect(200, 200, 150, 250);
        
        // Broken window with cracks
        ctx.fillStyle = this.sierraPalette.white;
        this.drawPixelRect(220, 250, 40, 60);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 2;
        // Draw crack lines
        ctx.beginPath();
        ctx.moveTo(230, 260);
        ctx.lineTo(250, 290);
        ctx.moveTo(245, 270);
        ctx.lineTo(235, 300);
        ctx.stroke();
        
        // Electronics Store sign
        this.drawSierraText("ELECTRONICS", 210, 220, this.sierraPalette.black);
        
        // Coffee shop
        ctx.fillStyle = this.sierraPalette.brown;
        this.drawPixelRect(400, 180, 120, 270);
        
        // Coffee shop window
        ctx.fillStyle = this.sierraPalette.white;
        this.drawPixelRect(420, 220, 80, 80);
        
        // Coffee shop sign
        this.drawSierraText("COFFEE", 420, 190, this.sierraPalette.white);
        
        // Other buildings for atmosphere
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(50, 150, 100, 300);
        
        ctx.fillStyle = this.sierraPalette.buildingTan;
        this.drawPixelRect(600, 160, 120, 290);
        
        // Police car parked nearby
        this.drawPoliceCar(100, 520);
        
        // Street lamp
        ctx.fillStyle = this.sierraPalette.darkGray;
        this.drawPixelRect(150, 420, 6, 80);
        ctx.fillStyle = this.sierraPalette.yellow;
        this.drawPixelRect(145, 410, 16, 16);
    }
    
    // Draw Police Car (authentic Sierra style)
    drawPoliceCar(x, y) {
        const ctx = this.ctx;
        
        // Car body
        ctx.fillStyle = this.sierraPalette.policeCarBlue;
        this.drawPixelRect(x, y, 60, 25);
        
        // Car windows
        ctx.fillStyle = this.sierraPalette.darkBlue;
        this.drawPixelRect(x + 5, y + 2, 50, 8);
        
        // Police light bar
        ctx.fillStyle = this.sierraPalette.red;
        this.drawPixelRect(x + 20, y - 3, 8, 3);
        ctx.fillStyle = this.sierraPalette.blue;
        this.drawPixelRect(x + 32, y - 3, 8, 3);
        
        // Wheels
        ctx.fillStyle = this.sierraPalette.black;
        this.drawPixelRect(x + 8, y + 20, 8, 8);
        this.drawPixelRect(x + 44, y + 20, 8, 8);
        
        // Police markings
        this.drawSierraText("POLICE", x + 5, y + 12, this.sierraPalette.white);
    }
}

// Export for use
window.SierraGraphics = SierraGraphics;
