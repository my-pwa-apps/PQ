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

    // --- Scene Rendering ---

    drawScene(sceneId) {
        this.clearScreen();
        
        // Draw horizon line for debug/reference (optional)
        // this.drawLine(0, 250, 800, 250, this.sierraPalette.darkGray);

        switch (sceneId) {
            case 'policeStation_lobby':
            case 'policeStation':
                this.drawPoliceStationLobby();
                break;
            case 'policeStation_briefing':
            case 'briefingRoom':
                this.drawBriefingRoom();
                break;
            case 'policeStation_evidence':
                this.drawEvidenceRoom();
                break;
            case 'downtown_street':
            case 'downtown':
            case 'downtown_main':
                this.drawDowntownStreet();
                break;
            case 'park':
            case 'city_park':
                this.drawPark();
                break;
            default:
                console.warn(`Unknown scene ID: ${sceneId}, drawing default grid`);
                this.drawDefaultScene();
        }
    }

    drawDefaultScene() {
        this.drawRect(0, 0, 800, 600, this.sierraPalette.darkBlue);
        this.drawRect(0, 300, 800, 300, this.sierraPalette.darkGray);
        for(let i=0; i<800; i+=50) {
            this.drawLine(i, 300, i-200, 600, this.sierraPalette.lightGray);
        }
    }

    // --- Specific Scenes ---

    drawPoliceStationLobby() {
        // Walls
        this.drawRect(0, 0, 800, 250, this.sierraPalette.cyan); // Back wall
        this.drawRect(0, 0, 100, 600, this.sierraPalette.darkCyan); // Left wall
        this.drawRect(700, 0, 100, 600, this.sierraPalette.darkCyan); // Right wall
        
        // Floor
        this.drawRect(0, 250, 800, 350, this.sierraPalette.lightGray);
        
        // Baseboards
        this.drawLine(100, 250, 700, 250, this.sierraPalette.black, 2);
        
        // Doors
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

        // Reception Desk
        this.drawRect(300, 220, 200, 80, this.sierraPalette.brown);
        this.drawRect(310, 230, 180, 60, this.sierraPalette.darkRed); // Detail
        
        // Plants
        this.drawPlant(50, 350);
        this.drawPlant(750, 350);
        
        // Bulletin Board
        this.drawRect(450, 100, 100, 60, this.sierraPalette.brown);
        this.drawRect(455, 105, 90, 50, this.sierraPalette.white); // Papers
        
        // Logo/Sign
        this.drawText("LYTTON POLICE DEPARTMENT", 280, 50, this.sierraPalette.darkBlue, 16);
    }

    drawBriefingRoom() {
        // Walls
        this.drawRect(0, 0, 800, 250, this.sierraPalette.blue);
        
        // Floor
        this.drawRect(0, 250, 800, 350, this.sierraPalette.darkGray);
        
        // Podium
        this.drawRect(350, 200, 100, 80, this.sierraPalette.brown);
        
        // Chairs (Rows)
        for(let y=350; y<550; y+=60) {
            for(let x=150; x<650; x+=80) {
                this.drawChairBack(x, y);
            }
        }
        
        // Blackboard
        this.drawRect(200, 50, 400, 120, this.sierraPalette.black);
        this.drawRect(190, 40, 420, 140, null, this.sierraPalette.brown); // Frame
        this.drawText("BRIEFING: 0800", 220, 80, this.sierraPalette.white, 12);
        this.drawText("- BE CAREFUL OUT THERE", 220, 110, this.sierraPalette.white, 12);
    }

    drawEvidenceRoom() {
        // Walls
        this.drawRect(0, 0, 800, 250, this.sierraPalette.darkGray);
        
        // Floor
        this.drawRect(0, 250, 800, 350, this.sierraPalette.lightGray);
        
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

    drawDowntownStreet() {
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
        this.drawRect(0, 200, 800, 50, this.sierraPalette.lightGray);
        this.drawLine(0, 200, 800, 200, this.sierraPalette.darkGray);
        
        // Road
        this.drawRect(0, 250, 800, 350, this.sierraPalette.darkGray);
        
        // Road markings
        for(let x=0; x<800; x+=100) {
            this.drawRect(x, 400, 50, 10, this.sierraPalette.yellow);
        }
    }

    drawPark() {
        // Sky
        this.drawRect(0, 0, 800, 200, this.sierraPalette.cyan);
        
        // Grass
        this.drawRect(0, 200, 800, 400, this.sierraPalette.green);
        
        // Trees
        this.drawTree(100, 200);
        this.drawTree(600, 220);
        this.drawTree(300, 180);
        
        // Path
        this.drawPolygon([
            {x: 350, y: 600}, {x: 450, y: 600},
            {x: 420, y: 200}, {x: 380, y: 200}
        ], this.sierraPalette.brown);
        
        // Bench
        this.drawRect(500, 400, 100, 30, this.sierraPalette.brown);
        this.drawRect(500, 370, 100, 30, this.sierraPalette.darkRed); // Back
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
