/**
 * ENHANCED Sierra-style Graphics System for Police Quest
 * Authentic Police Quest 1-3 (AGI/SCI era) graphics rendering
 * Centralized drawing logic for all scenes and characters
 */
class SierraGraphics {
    constructor(canvas, ctx) {
        console.log("Enhanced SierraGraphics constructor called");
        this.canvas = canvas;
        this.ctx = ctx;
        
        if (!this.canvas || !this.ctx) {
            console.error("SierraGraphics: Invalid canvas or context provided");
            throw new Error("SierraGraphics requires valid canvas and context");
        }
        
        // Sierra AGI/SCI 16-color EGA/VGA palette - AUTHENTIC
        this.sierraPalette = {
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
            
            // Aliases
            skinTone: '#FFAA55', // Adjusted for better look
            policeBlue: '#0000AA',
            badgeGold: '#FFFF55'
        };
        
        // Dither patterns
        this.ditherPatterns = {
            light: [[1, 0], [0, 1]],
            medium: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
            dense: [[1, 1, 0], [1, 0, 1], [0, 1, 1]]
        };
    }

    clearScreen() {
        this.ctx.fillStyle = this.sierraPalette.black;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // --- Primitive Drawing Helpers ---

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }

    drawLine(x1, y1, x2, y2, color, width = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
        this.ctx.lineTo(Math.floor(x2), Math.floor(y2));
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    drawPolygon(points, fillColor, strokeColor = null) {
        if (points.length < 3) return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.stroke();
        }
    }

    drawCircle(x, y, radius, fillColor, strokeColor = null) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.stroke();
        }
    }

    drawDitheredRect(x, y, w, h, color1, color2, pattern = 'light') {
        // Draw base color
        this.drawRect(x, y, w, h, color1);
        
        // Draw dither pattern
        const p = this.ditherPatterns[pattern] || this.ditherPatterns.light;
        const pHeight = p.length;
        const pWidth = p[0].length;
        
        this.ctx.fillStyle = color2;
        
        // Optimization: Create a small canvas pattern instead of drawing thousands of rects
        // But for authentic pixel feel, we can just loop (canvas is fast enough for this resolution)
        for (let py = 0; py < h; py += 2) {
            for (let px = 0; px < w; px += 2) {
                const patY = (Math.floor(y) + py) % pHeight;
                const patX = (Math.floor(x) + px) % pWidth;
                
                if (p[patY][patX] === 1) {
                    this.ctx.fillRect(Math.floor(x) + px, Math.floor(y) + py, 2, 2);
                }
            }
        }
    }

    // --- Scene Rendering ---

    drawSceneBackground(sceneId) {
        this.clearScreen();
        
        switch (sceneId) {
            case 'policeStation_lobby':
            case 'policeStation':
                this.drawPoliceStationLobbyBackground();
                break;
            case 'policeStation_briefing':
            case 'briefingRoom':
                this.drawBriefingRoomBackground();
                break;
            case 'policeStation_evidence':
                this.drawEvidenceRoomBackground();
                break;
            case 'downtown_street':
            case 'downtown':
            case 'downtown_main':
                this.drawDowntownStreetBackground();
                break;
            case 'park':
            case 'city_park':
                this.drawParkBackground();
                break;
            default:
                this.drawDefaultScene();
        }
    }

    getSceneProps(sceneId) {
        switch (sceneId) {
            case 'policeStation_lobby':
            case 'policeStation':
                return [
                    { y: 300, draw: () => this.drawReceptionDesk() },
                    { y: 350, draw: () => this.drawPlant(50, 350) },
                    { y: 350, draw: () => this.drawPlant(750, 350) }
                ];
            case 'policeStation_briefing':
            case 'briefingRoom':
                let props = [{ y: 280, draw: () => this.drawPodium() }];
                // Add chairs
                for(let y=350; y<550; y+=60) {
                    for(let x=150; x<650; x+=80) {
                        // Capture x and y for the closure
                        let cx = x, cy = y; 
                        props.push({ y: cy, draw: () => this.drawChairBack(cx, cy) });
                    }
                }
                return props;
            case 'park':
            case 'city_park':
                return [
                    { y: 200, draw: () => this.drawTree(100, 200) },
                    { y: 220, draw: () => this.drawTree(600, 220) },
                    { y: 180, draw: () => this.drawTree(300, 180) },
                    { y: 400, draw: () => this.drawParkBench() }
                ];
            default:
                return [];
        }
    }

    // --- Specific Scenes (Backgrounds) ---

    drawPoliceStationLobbyBackground() {
        // Walls
        this.drawRect(0, 0, 800, 250, this.sierraPalette.cyan); // Back wall
        this.drawDitheredRect(0, 0, 100, 600, this.sierraPalette.darkCyan, this.sierraPalette.cyan, 'light'); // Left wall
        this.drawDitheredRect(700, 0, 100, 600, this.sierraPalette.darkCyan, this.sierraPalette.cyan, 'light'); // Right wall
        
        // Floor
        this.drawDitheredRect(0, 250, 800, 350, this.sierraPalette.lightGray, this.sierraPalette.white, 'light');
        
        // Baseboards
        this.drawLine(100, 250, 700, 250, this.sierraPalette.black, 2);
        
        // Doors (Background because they are on the wall)
        // Briefing Room (Left)
        this.drawRect(120, 150, 80, 100, this.sierraPalette.brown);
        this.drawRect(125, 155, 70, 95, this.sierraPalette.darkRed); // Inset
        this.drawCircle(190, 200, 3, this.sierraPalette.yellow); // Knob
        this.drawText("BRIEFING", 130, 140, this.sierraPalette.black, 10);

        // Evidence Room (Right)
        this.drawRect(600, 150, 80, 100, this.sierraPalette.brown);
        this.drawRect(605, 155, 70, 95, this.sierraPalette.darkRed);
        this.drawCircle(610, 200, 3, this.sierraPalette.yellow);
        this.drawText("EVIDENCE", 610, 140, this.sierraPalette.black, 10);

        // Bulletin Board (Background)
        this.drawRect(450, 100, 100, 60, this.sierraPalette.brown);
        this.drawRect(455, 105, 90, 50, this.sierraPalette.white); // Papers
        
        // Logo/Sign
        this.drawText("LYTTON POLICE DEPARTMENT", 280, 50, this.sierraPalette.darkBlue, 16);
    }

    drawBriefingRoomBackground() {
        // Walls
        this.drawRect(0, 0, 800, 250, this.sierraPalette.blue);
        
        // Floor
        this.drawDitheredRect(0, 250, 800, 350, this.sierraPalette.darkGray, this.sierraPalette.lightGray, 'medium');
        
        // Blackboard (Background)
        this.drawRect(200, 50, 400, 120, this.sierraPalette.black);
        this.drawRect(190, 40, 420, 140, null, this.sierraPalette.brown); // Frame
        this.drawText("BRIEFING: 0800", 220, 80, this.sierraPalette.white, 12);
        this.drawText("- BE CAREFUL OUT THERE", 220, 110, this.sierraPalette.white, 12);
    }

    drawEvidenceRoomBackground() {
        this.drawEvidenceRoom(); // Keep as is for now, or split if needed
    }

    drawDowntownStreetBackground() {
        this.drawDowntownStreet(); // Keep as is
    }

    drawParkBackground() {
        // Sky
        this.drawRect(0, 0, 800, 200, this.sierraPalette.cyan);
        
        // Grass
        this.drawDitheredRect(0, 200, 800, 400, this.sierraPalette.green, this.sierraPalette.darkGreen, 'light');
        
        // Path
        this.drawPolygon([
            {x: 350, y: 600}, {x: 450, y: 600},
            {x: 420, y: 200}, {x: 380, y: 200}
        ], this.sierraPalette.brown);
    }

    // --- Prop Drawing Helpers ---

    drawReceptionDesk() {
        this.drawRect(300, 220, 200, 80, this.sierraPalette.brown);
        this.drawRect(310, 230, 180, 60, this.sierraPalette.darkRed); // Detail
    }

    drawPodium() {
        this.drawRect(350, 200, 100, 80, this.sierraPalette.brown);
    }

    drawParkBench() {
        this.drawRect(500, 400, 100, 30, this.sierraPalette.brown);
        this.drawRect(500, 370, 100, 30, this.sierraPalette.darkRed); // Back
    }

    drawEvidenceRoom() {
        // Walls
        this.drawRect(0, 0, 800, 250, this.sierraPalette.darkGray);
        
        // Floor
        this.drawDitheredRect(0, 250, 800, 350, this.sierraPalette.lightGray, this.sierraPalette.white, 'light');
        
        // Cages/Shelves
        for(let x=50; x<750; x+=150) {
            this.drawRect(x, 100, 100, 150, this.sierraPalette.darkBlue);
            // Grid lines
            for(let i=0; i<100; i+=20) this.drawLine(x+i, 100, x+i, 250, this.sierraPalette.white);
            for(let i=0; i<150; i+=30) this.drawLine(x, 100+i, x+100, 100+i, this.sierraPalette.white);
        }
        
        // Counter
        this.drawRect(0, 400, 800, 200, this.sierraPalette.brown);
    }

    drawDowntownStreetBackground() {
        // Sky
        this.drawRect(0, 0, 800, 200, this.sierraPalette.cyan);
        
        // Buildings (Background)
        this.drawRect(50, 50, 150, 150, this.sierraPalette.brown); // Building 1
        this.drawRect(250, 20, 200, 180, this.sierraPalette.lightGray); // Building 2
        this.drawRect(500, 60, 180, 140, this.sierraPalette.darkRed); // Building 3
        
        // Windows
        this.drawRect(70, 70, 30, 40, this.sierraPalette.black);
        this.drawRect(130, 70, 30, 40, this.sierraPalette.black);
        
        // Sidewalk
        this.drawDitheredRect(0, 200, 800, 50, this.sierraPalette.lightGray, this.sierraPalette.white, 'light');
        this.drawLine(0, 200, 800, 200, this.sierraPalette.darkGray);
        
        // Road
        this.drawDitheredRect(0, 250, 800, 350, this.sierraPalette.darkGray, this.sierraPalette.black, 'medium');
        
        // Road markings
        for(let x=0; x<800; x+=100) {
            this.drawRect(x, 400, 50, 10, this.sierraPalette.yellow);
        }
    }

    drawParkBackground() {
        // Sky
        this.drawRect(0, 0, 800, 200, this.sierraPalette.cyan);
        
        // Grass
        this.drawDitheredRect(0, 200, 800, 400, this.sierraPalette.green, this.sierraPalette.darkGreen, 'light');
        
        // Path
        this.drawPolygon([
            {x: 350, y: 600}, {x: 450, y: 600},
            {x: 420, y: 200}, {x: 380, y: 200}
        ], this.sierraPalette.brown);
    }

    // --- Object Helpers ---

    drawHotspot(hotspot) {
        // Hotspots are generally invisible interaction zones
        // But if we wanted to debug them:
        // this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        // this.ctx.strokeRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
    }

    drawPlant(x, y) {
        this.drawRect(x-10, y-20, 20, 20, this.sierraPalette.brown); // Pot
        this.drawCircle(x, y-30, 15, this.sierraPalette.green); // Leaves
        this.drawCircle(x-10, y-40, 10, this.sierraPalette.green);
        this.drawCircle(x+10, y-40, 10, this.sierraPalette.green);
    }

    drawChairBack(x, y) {
        this.drawRect(x, y, 40, 40, this.sierraPalette.brown);
        this.drawRect(x+5, y+5, 30, 30, this.sierraPalette.darkRed); // Cushion
    }

    drawTree(x, y) {
        this.drawRect(x-10, y, 20, 60, this.sierraPalette.brown); // Trunk
        this.drawCircle(x, y-20, 40, this.sierraPalette.darkGreen); // Foliage
        this.drawCircle(x-20, y-10, 30, this.sierraPalette.darkGreen);
        this.drawCircle(x+20, y-10, 30, this.sierraPalette.darkGreen);
    }

    drawText(text, x, y, color, size=12) {
        this.ctx.font = `${size}px 'Courier New', monospace`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    // --- Character Rendering ---

    drawCharacterWithScale(x, y, spriteName, facing, action, scale) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        
        // Draw from feet up (0,0 is feet)
        
        const colors = this.getCharacterColors(spriteName);
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Body based on facing
        if (facing === 'down' || facing === 'up') {
            this.drawFrontBackCharacter(colors, facing, action);
        } else {
            this.drawSideCharacter(colors, facing, action);
        }

        this.ctx.restore();
    }

    getCharacterColors(name) {
        // Default to Sonny
        let colors = {
            skin: this.sierraPalette.skinTone,
            shirt: this.sierraPalette.white,
            pants: this.sierraPalette.blue,
            hair: this.sierraPalette.brown,
            shoes: this.sierraPalette.black
        };

        if (name.includes('sonny') || name.includes('officer')) {
            colors.shirt = this.sierraPalette.policeBlue;
            colors.pants = this.sierraPalette.darkBlue;
        } else if (name.includes('jenny')) {
            colors.shirt = this.sierraPalette.policeBlue;
            colors.pants = this.sierraPalette.darkBlue;
            colors.hair = this.sierraPalette.yellow; // Blonde
        } else if (name.includes('criminal')) {
            colors.shirt = this.sierraPalette.darkGray;
            colors.pants = this.sierraPalette.black;
        }

        return colors;
    }

    drawFrontBackCharacter(colors, facing, action) {
        const isBack = facing === 'up';
        
        // Legs
        this.drawRect(-10, -20, 8, 20, colors.pants);
        this.drawRect(2, -20, 8, 20, colors.pants);
        
        // Torso
        this.drawRect(-12, -50, 24, 30, colors.shirt);
        
        // Head
        this.drawRect(-8, -66, 16, 16, colors.skin);
        
        // Hair
        this.drawRect(-9, -68, 18, 6, colors.hair);
        if (isBack) {
            this.drawRect(-9, -68, 18, 16, colors.hair);
        }

        // Arms
        this.drawRect(-16, -48, 4, 25, colors.skin);
        this.drawRect(12, -48, 4, 25, colors.skin);
    }

    drawSideCharacter(colors, facing, action) {
        const isRight = facing === 'right';
        const dir = isRight ? 1 : -1;
        
        this.ctx.scale(dir, 1); // Flip if left

        // Legs (walking animation could go here)
        if (action === 'walking') {
             // Simple walk cycle simulation
             const time = Date.now() / 200;
             const legOffset = Math.sin(time) * 5;
             this.drawRect(-5 + legOffset, -20, 8, 20, colors.pants);
             this.drawRect(-5 - legOffset, -20, 8, 20, colors.pants);
        } else {
            this.drawRect(-5, -20, 10, 20, colors.pants);
        }

        // Torso
        this.drawRect(-6, -50, 12, 30, colors.shirt);

        // Head
        this.drawRect(-6, -66, 12, 16, colors.skin);
        
        // Hair
        this.drawRect(-7, -68, 14, 6, colors.hair);
        this.drawRect(-7, -68, 4, 16, colors.hair); // Back of head hair

        // Arm
        this.drawRect(-2, -48, 4, 25, colors.skin);
        
        // Nose (profile)
        this.drawRect(6, -60, 2, 4, colors.skin);
    }
}

// Export for use in other files
window.SierraGraphics = SierraGraphics;
