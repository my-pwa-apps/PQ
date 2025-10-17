/**
 * ENHANCED Sierra-style Graphics System for Police Quest
 * Authentic Police Quest 1-3 (AGI/SCI era) graphics rendering
 * Much more detailed and accurate to original Sierra games
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
            // EGA/VGA 16-color standard
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
            
            // Police Quest specific aliases
            policeBlue: '#0000AA',
            policeCarBlue: '#00000AA',
            badgeGold: '#FFFF55',
            streetGray: '#555555',
            buildingTan: '#AA5500',
            grassGreen: '#00AA00',
            skinTone: '#AA5500'
        };
        
        // Sierra AGI dither patterns for texture
        this.ditherPatterns = {
            light: [[1, 0], [0, 1]],
            medium: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
            dense: [[1, 1, 0], [1, 0, 1], [0, 1, 1]],
            diagonal: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
        };
    }

    clearScreen() {
        this.ctx.fillStyle = this.sierraPalette.black;
        this.ctx.fillRect(0, 0, 800, 600);
    }

    drawPixelRect(x, y, width, height) {
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
    }

    drawSierraText(text, x, y, color = this.sierraPalette.white, size = 8) {
        this.ctx.save();
        this.ctx.font = `bold ${size}px 'Courier New', monospace`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y + size);
        this.ctx.restore();
    }

    applyDithering(x, y, width, height, pattern = 'light', color1, color2) {
        const patternArray = this.ditherPatterns[pattern];
        for (let py = 0; py < height; py += 2) {
            for (let px = 0; px < width; px += 2) {
                const patternX = (px / 2) % patternArray[0].length;
                const patternY = (py / 2) % patternArray.length;
                const useColor1 = patternArray[patternY][patternX] === 1;
                
                this.ctx.fillStyle = useColor1 ? color1 : color2;
                this.ctx.fillRect(x + px, y + py, 2, 2);
            }
        }
    }

    // ENHANCED Police Station - Much more detailed and authentic
    drawPoliceStation() {
        const ctx = this.ctx;
        this.clearScreen();
        
        // === PERSPECTIVE FLOOR - authentic Sierra style ===
        // Floor uses perspective grid that gets larger toward viewer
        ctx.fillStyle = this.sierraPalette.lightGray;
        ctx.fillRect(0, 340, 800, 260);
        
        // Floor tiles with proper perspective
        ctx.strokeStyle = this.sierraPalette.darkGray;
        ctx.lineWidth = 2;
        
        // Horizontal lines (getting further apart toward bottom)
        for (let i = 0; i < 6; i++) {
            const y = 340 + (i * i * 8) + (i * 15);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }
        
        // Vertical lines with perspective convergence
        const vanishingPoint = 400;
        for (let i = 0; i < 12; i++) {
            const x = i * 70;
            ctx.beginPath();
            ctx.moveTo(x, 340);
            ctx.lineTo(x + (vanishingPoint - x) * 0.3, 600);
            ctx.stroke();
        }
        
        // === BACK WALL - with depth and texture ===
        // Create gradient for wall depth
        const wallGradient = ctx.createLinearGradient(0, 0, 0, 340);
        wallGradient.addColorStop(0, this.sierraPalette.blue);
        wallGradient.addColorStop(0.7, this.sierraPalette.darkBlue);
        wallGradient.addColorStop(1, this.sierraPalette.darkCyan);
        ctx.fillStyle = wallGradient;
        ctx.fillRect(0, 0, 800, 340);
        
        // Wall texture with dithering
        this.applyDithering(0, 0, 800, 340, 'light', this.sierraPalette.blue, this.sierraPalette.darkBlue);
        
        // === CEILING ===
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(0, 0, 800, 40);
        
        // Ceiling tiles
        ctx.strokeStyle = this.sierraPalette.lightGray;
        for (let i = 0; i < 800; i += 80) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 40);
            ctx.stroke();
        }
        
        // === FLUORESCENT LIGHTS - detailed ===
        const lights = [150, 400, 650];
        for (const lx of lights) {
            // Light fixture housing
            ctx.fillStyle = this.sierraPalette.darkGray;
            ctx.fillRect(lx - 40, 35, 80, 8);
            
            // Light tubes
            ctx.fillStyle = this.sierraPalette.white;
            ctx.fillRect(lx - 35, 37, 70, 4);
            
            // Glow effect
            ctx.save();
            ctx.globalAlpha = 0.2;
            const lightGlow = ctx.createRadialGradient(lx, 43, 0, lx, 43, 100);
            lightGlow.addColorStop(0, this.sierraPalette.white);
            lightGlow.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = lightGlow;
            ctx.fillRect(lx - 100, 43, 200, 80);
            ctx.restore();
        }
        
        // === LYTTON PD SIGN - detailed emblem style ===
        // Sign background
        ctx.fillStyle = this.sierraPalette.yellow;
        ctx.fillRect(280, 50, 240, 50);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 3;
        ctx.strokeRect(280, 50, 240, 50);
        
        // Sign border decoration
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(285, 55, 230, 5);
        ctx.fillRect(285, 90, 230, 5);
        
        // Text
        this.drawSierraText("LYTTON POLICE", 300, 60, this.sierraPalette.black, 12);
        this.drawSierraText("DEPARTMENT", 305, 77, this.sierraPalette.black, 12);
        
        // Police badge emblems on sign
        this.drawBadgeDetailed(260, 65);
        this.drawBadgeDetailed(535, 65);
        
        // === RECEPTION DESK - 3D perspective ===
        const deskX = 280, deskY = 310, deskW = 240, deskH = 85;
        
        // Desk shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(deskX + 5, deskY + deskH + 2, deskW, 8);
        
        // Desk front face
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(deskX, deskY, deskW, deskH);
        
        // Wood grain texture
        this.applyDithering(deskX, deskY, deskW, deskH, 'diagonal', this.sierraPalette.brown, this.sierraPalette.buildingTan);
        
        // Desk top (perspective)
        ctx.fillStyle = this.sierraPalette.buildingTan;
        ctx.beginPath();
        ctx.moveTo(deskX, deskY);
        ctx.lineTo(deskX - 25, deskY - 15);
        ctx.lineTo(deskX + deskW - 25, deskY - 15);
        ctx.lineTo(deskX + deskW, deskY);
        ctx.closePath();
        ctx.fill();
        
        // Desk side (depth)
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.beginPath();
        ctx.moveTo(deskX + deskW, deskY);
        ctx.lineTo(deskX + deskW - 25, deskY - 15);
        ctx.lineTo(deskX + deskW - 25, deskY + deskH - 15);
        ctx.lineTo(deskX + deskW, deskY + deskH);
        ctx.closePath();
        ctx.fill();
        
        // Desk drawer panels
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 2;
        ctx.strokeRect(deskX + 20, deskY + 20, deskW - 40, 25);
        ctx.strokeRect(deskX + 20, deskY + 50, deskW - 40, 25);
        
        // Drawer handles
        ctx.fillStyle = this.sierraPalette.badgeGold;
        for (let i = 0; i < 2; i++) {
            const handleY = deskY + 32 + i * 30;
            ctx.fillRect(deskX + deskW / 2 - 10, handleY, 20, 4);
            
            // Handle screws
            ctx.fillStyle = this.sierraPalette.darkGray;
            ctx.fillRect(deskX + deskW / 2 - 9, handleY + 1, 2, 2);
            ctx.fillRect(deskX + deskW / 2 + 7, handleY + 1, 2, 2);
            ctx.fillStyle = this.sierraPalette.badgeGold;
        }
        
        // Desk items - Nameplate
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(deskX + 80, deskY - 10, 80, 10);
        this.drawSierraText("SGT. DOOLEY", deskX + 85, deskY - 7, this.sierraPalette.badgeGold, 6);
        
        // Desk phone - detailed
        ctx.fillStyle = this.sierraPalette.black;
        ctx.fillRect(deskX + 30, deskY + 5, 25, 18);
        ctx.fillRect(deskX + 33, deskY + 2, 19, 4); // handset
        ctx.fillStyle = this.sierraPalette.darkGray;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(deskX + 35 + j * 6, deskY + 9 + i * 5, 4, 3);
            }
        }
        
        // Papers and clipboard
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(deskX + 170, deskY + 8, 40, 50);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.strokeRect(deskX + 170, deskY + 8, 40, 50);
        
        // Text lines on paper
        ctx.fillStyle = this.sierraPalette.blue;
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(deskX + 175, deskY + 15 + i * 5, 30, 1);
        }
        
        // Coffee cup
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(deskX + 120, deskY + 10, 15, 12);
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(deskX + 121, deskY + 11, 13, 8);
        
        // === FILE CABINETS - highly detailed ===
        this.drawFileCabinetDetailed(60, 220, 50, 115);
        this.drawFileCabinetDetailed(115, 220, 50, 115);
        this.drawFileCabinetDetailed(690, 220, 50, 115);
        this.drawFileCabinetDetailed(745, 220, 50, 115);
        
        // === BULLETIN BOARD - with posted items ===
        // Cork board
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(560, 140, 140, 120);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 3;
        ctx.strokeRect(560, 140, 140, 120);
        
        // Cork texture
        this.applyDithering(565, 145, 130, 110, 'dense', this.sierraPalette.buildingTan, this.sierraPalette.brown);
        
        // Pinned documents
        const docs = [
            { x: 575, y: 155, w: 40, h: 35 },
            { x: 625, y: 150, w: 35, h: 40 },
            { x: 670, y: 160, w: 20, h: 25 },
            { x: 575, y: 200, w: 50, h: 40 },
            { x: 635, y: 205, w: 45, h: 35 }
        ];
        
        for (const doc of docs) {
            ctx.fillStyle = this.sierraPalette.white;
            ctx.fillRect(doc.x, doc.y, doc.w, doc.h);
            ctx.strokeStyle = this.sierraPalette.black;
            ctx.strokeRect(doc.x, doc.y, doc.w, doc.h);
            
            // Push pin
            ctx.fillStyle = this.sierraPalette.red;
            ctx.fillRect(doc.x + doc.w / 2 - 1, doc.y - 2, 3, 3);
            
            // Text lines
            ctx.fillStyle = this.sierraPalette.black;
            const lines = Math.floor(doc.h / 5) - 1;
            for (let i = 0; i < lines; i++) {
                ctx.fillRect(doc.x + 3, doc.y + 5 + i * 4, doc.w - 6, 1);
            }
        }
        
        // === WANTED POSTER - detailed ===
        ctx.fillStyle = this.sierraPalette.yellow;
        ctx.fillRect(160, 150, 90, 130);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 3;
        ctx.strokeRect(160, 150, 90, 130);
        
        this.drawSierraText("WANTED", 175, 160, this.sierraPalette.red, 10);
        
        // Mugshot photo
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(170, 180, 70, 70);
        
        // Criminal face (simplified)
        ctx.fillStyle = this.sierraPalette.skinTone;
        ctx.fillRect(185, 195, 40, 50);
        
        // Hair
        ctx.fillStyle = this.sierraPalette.black;
        ctx.fillRect(185, 195, 40, 12);
        
        // Eyes
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(193, 210, 8, 6);
        ctx.fillRect(213, 210, 8, 6);
        ctx.fillStyle = this.sierraPalette.black;
        ctx.fillRect(195, 212, 4, 4);
        ctx.fillRect(215, 212, 4, 4);
        
        // Nose and mouth
        ctx.fillRect(203, 220, 8, 8);
        ctx.fillStyle = this.sierraPalette.red;
        ctx.fillRect(198, 232, 18, 3);
        
        // Reward text
        this.drawSierraText("$10,000", 175, 255, this.sierraPalette.green, 8);
        this.drawSierraText("REWARD", 175, 268, this.sierraPalette.black, 7);
        
        // === AMERICAN FLAG - detailed ===
        const flagX = 100, flagY = 140;
        
        // Flag pole
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(flagX, flagY, 6, 140);
        
        // Pole finial (top ornament)
        ctx.fillStyle = this.sierraPalette.badgeGold;
        ctx.beginPath();
        ctx.arc(flagX + 3, flagY - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Flag fabric
        const flagW = 70, flagH = 50;
        
        // Stripes (13 stripes)
        for (let i = 0; i < 13; i++) {
            ctx.fillStyle = i % 2 === 0 ? this.sierraPalette.red : this.sierraPalette.white;
            ctx.fillRect(flagX + 8, flagY + 20 + i * (flagH / 13), flagW, flagH / 13);
        }
        
        // Union (blue field with stars)
        ctx.fillStyle = this.sierraPalette.darkBlue;
        ctx.fillRect(flagX + 8, flagY + 20, 28, 20);
        
        // Stars (simplified 5x4 pattern)
        ctx.fillStyle = this.sierraPalette.white;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                const sx = flagX + 12 + col * 5;
                const sy = flagY + 24 + row * 4;
                ctx.fillRect(sx, sy, 2, 2);
            }
        }
        
        // === WATER COOLER - highly detailed ===
        const coolerX = 710, coolerY = 250;
        
        // Base/dispenser unit
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(coolerX, coolerY + 50, 35, 35);
        
        // Base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(coolerX - 2, coolerY + 85, 39, 3);
        
        // Dispenser details
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(coolerX + 5, coolerY + 55, 10, 8); // cold tap
        ctx.fillRect(coolerX + 20, coolerY + 55, 10, 8); // hot tap
        
        // Tap labels
        ctx.fillStyle = this.sierraPalette.blue;
        ctx.fillRect(coolerX + 7, coolerY + 53, 6, 2);
        ctx.fillStyle = this.sierraPalette.red;
        ctx.fillRect(coolerX + 22, coolerY + 53, 6, 2);
        
        // Water bottle (5-gallon jug)
        ctx.fillStyle = this.sierraPalette.cyan;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.ellipse(coolerX + 17, coolerY + 25, 18, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Water bottle highlight (shine)
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(coolerX + 10, coolerY + 15, 6, 15);
        
        // Bottle neck
        ctx.fillStyle = this.sierraPalette.darkCyan;
        ctx.fillRect(coolerX + 12, coolerY + 10, 10, 15);
        
        // Bottle cap
        ctx.fillStyle = this.sierraPalette.blue;
        ctx.fillRect(coolerX + 10, coolerY + 8, 14, 4);
        
        // === COFFEE STATION - detailed ===
        const coffeeX = 620, coffeeY = 245;
        
        // Coffee maker machine
        ctx.fillStyle = this.sierraPalette.black;
        ctx.fillRect(coffeeX, coffeeY, 45, 60);
        
        // Machine top
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(coffeeX, coffeeY, 45, 12);
        
        // Control panel
        ctx.fillStyle = this.sierraPalette.red;
        ctx.fillRect(coffeeX + 15, coffeeY + 3, 6, 6);
        ctx.fillStyle = this.sierraPalette.green;
        ctx.fillRect(coffeeX + 24, coffeeY + 3, 6, 6);
        
        // Coffee pot
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(coffeeX + 8, coffeeY + 35, 25, 20);
        
        // Coffee in pot
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(coffeeX + 9, coffeeY + 43, 23, 10);
        
        // Pot highlight/shine
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(coffeeX + 11, coffeeY + 38, 4, 8);
        
        // Pot handle
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(coffeeX + 36, coffeeY + 45, 6, -Math.PI/2, Math.PI/2);
        ctx.stroke();
        
        // Coffee cups on counter
        ctx.fillStyle = this.sierraPalette.white;
        ctx.fillRect(coffeeX + 50, coffeeY + 50, 10, 10);
        ctx.fillRect(coffeeX + 62, coffeeY + 50, 10, 10);
        
        // === DOORS - detailed with proper depth ===
        
        // Exit door (right)
        const exitX = 745, exitY = 320;
        this.drawDoorDetailed(exitX, exitY, 55, 280, "EXIT", this.sierraPalette.red);
        
        // Evidence room door (left)
        const evidenceX = 0, evidenceY = 320;
        this.drawDoorDetailed(evidenceX, evidenceY, 55, 280, "EVIDENCE", this.sierraPalette.yellow);
        
        // === ADDITIONAL ATMOSPHERE ===
        
        // Trash bin
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(730, 430, 30, 35);
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.strokeRect(730, 430, 30, 35);
        
        // Plant
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(40, 440, 25, 30);
        ctx.fillStyle = this.sierraPalette.green;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const lx = 52 + Math.cos(angle) * 12;
            const ly = 445 + Math.sin(angle) * 10;
            ctx.beginPath();
            ctx.moveTo(52, 445);
            ctx.lineTo(lx, ly);
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.sierraPalette.green;
            ctx.stroke();
        }
    }
    
    // Helper: Draw detailed file cabinet with 3D perspective
    drawFileCabinetDetailed(x, y, w, h) {
        const ctx = this.ctx;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 5, y + h + 2, w, 6);
        
        // Cabinet front
        ctx.fillStyle = this.sierraPalette.darkGray;
        ctx.fillRect(x, y, w, h);
        
        // Cabinet top (perspective)
        ctx.fillStyle = this.sierraPalette.lightGray;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y - 10);
        ctx.lineTo(x + w - 10, y - 10);
        ctx.lineTo(x + w, y);
        ctx.closePath();
        ctx.fill();
        
        // Cabinet side (depth)
        ctx.fillStyle = this.sierraPalette.black;
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w - 10, y - 10);
        ctx.lineTo(x + w - 10, y + h - 10);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();
        
        // 4 drawer divisions
        const drawerH = h / 4;
        for (let i = 0; i < 4; i++) {
            const drawerY = y + i * drawerH;
            
            // Drawer panel
            ctx.strokeStyle = this.sierraPalette.black;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, drawerY + 4, w - 8, drawerH - 8);
            
            // Handle
            ctx.fillStyle = this.sierraPalette.badgeGold;
            ctx.fillRect(x + w/2 - 6, drawerY + drawerH/2 - 2, 12, 4);
            
            // Handle screws
            ctx.fillStyle = this.sierraPalette.black;
            ctx.fillRect(x + w/2 - 5, drawerY + drawerH/2 - 1, 1, 2);
            ctx.fillRect(x + w/2 + 4, drawerY + drawerH/2 - 1, 1, 2);
            
            // Label holder
            ctx.fillStyle = this.sierraPalette.yellow;
            ctx.fillRect(x + 10, drawerY + 8, w - 20, 8);
            ctx.strokeStyle = this.sierraPalette.black;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 10, drawerY + 8, w - 20, 8);
        }
    }
    
    // Helper: Draw detailed police badge
    drawBadgeDetailed(x, y) {
        const ctx = this.ctx;
        
        // Badge shape (7-pointed star)
        ctx.fillStyle = this.sierraPalette.badgeGold;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
            const angle = (i * Math.PI * 2) / 7 - Math.PI / 2;
            const radius = i % 2 === 0 ? 15 : 7;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Badge outline
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Badge center circle
        ctx.fillStyle = this.sierraPalette.blue;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Badge number
        ctx.fillStyle = this.sierraPalette.white;
        ctx.font = '8px monospace';
        ctx.fillText("PD", -5, 3);
        
        ctx.restore();
    }
    
    // Helper: Draw detailed door
    drawDoorDetailed(x, y, w, h, label, labelColor) {
        const ctx = this.ctx;
        
        // Door shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 3, y + 3, w, h);
        
        // Door body
        ctx.fillStyle = this.sierraPalette.brown;
        ctx.fillRect(x, y, w, h);
        
        // Wood grain
        this.applyDithering(x, y, w, h, 'diagonal', this.sierraPalette.brown, this.sierraPalette.buildingTan);
        
        // Door frame
        ctx.strokeStyle = this.sierraPalette.black;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, w, h);
        
        // Door panels (2 rectangular panels)
        ctx.strokeStyle = this.sierraPalette.darkGray;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 8, y + 20, w - 16, h/2 - 40);
        ctx.strokeRect(x + 8, y + h/2 + 10, w - 16, h/2 - 40);
        
        // Door handle
        ctx.fillStyle = this.sierraPalette.badgeGold;
        const handleY = y + h/2;
        ctx.fillRect(x + w - 15, handleY - 3, 10, 6);
        
        // Keyhole
        ctx.fillStyle = this.sierraPalette.black;
        ctx.beginPath();
        ctx.arc(x + w - 10, handleY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Door label
        if (label) {
            ctx.fillStyle = labelColor;
            ctx.fillRect(x + 5, y - 25, w - 10, 20);
            ctx.strokeStyle = this.sierraPalette.black;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 5, y - 25, w - 10, 20);
            this.drawSierraText(label, x + 8, y - 20, this.sierraPalette.black, 7);
        }
    }
    
    // Character drawing (keep existing functionality)
    drawCharacter(x, y, characterName = 'officer', facing = 'down', action = 'standing') {
        this.drawSierraCharacter(
            x, y,
            this.sierraPalette.policeBlue,
            this.sierraPalette.badgeGold,
            facing,
            action === 'walking',
            characterName !== 'sonny',
            false
        );
    }
    
    drawSierraCharacter(x, y, uniformColor, badgeColor, facing = 'down', isWalking = false, isNPC = false, isFemale = false) {
        const ctx = this.ctx;
        const charWidth = 24;
        const charHeight = 40;
        
        // Character shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.ellipse(x, y + charHeight - 2, charWidth / 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = this.sierraPalette.skinTone;
        this.drawPixelRect(x - 6, y, 12, 12);
        
        // Hair
        ctx.fillStyle = this.sierraPalette.black;
        this.drawPixelRect(x - 6, y, 12, 4);
        
        // Body (uniform)
        ctx.fillStyle = uniformColor;
        this.drawPixelRect(x - 8, y + 12, 16, 18);
        
        // Arms
        if (isWalking) {
            // Animated walking arms
            this.drawPixelRect(x - 12, y + 14, 4, 12);
            this.drawPixelRect(x + 8, y + 14, 4, 12);
        } else {
            this.drawPixelRect(x - 10, y + 14, 4, 14);
            this.drawPixelRect(x + 6, y + 14, 4, 14);
        }
        
        // Badge
        ctx.fillStyle = badgeColor;
        this.drawPixelRect(x - 2, y + 16, 4, 4);
        
        // Legs
        ctx.fillStyle = this.sierraPalette.darkBlue;
        if (isWalking) {
            // Animated walking legs
            this.drawPixelRect(x - 6, y + 30, 5, 10);
            this.drawPixelRect(x + 2, y + 30, 5, 10);
        } else {
            this.drawPixelRect(x - 6, y + 30, 5, 10);
            this.drawPixelRect(x + 1, y + 30, 5, 10);
        }
        
        // Shoes
        ctx.fillStyle = this.sierraPalette.black;
        this.drawPixelRect(x - 6, y + 38, 5, 2);
        this.drawPixelRect(x + 1, y + 38, 5, 2);
    }
    
    // Stub methods for compatibility
    drawHotspot(hotspot) {}
    drawCommandInterface() {}
    drawInventory(items) {}
    drawProcedurePanel(procedure) {}
    drawCasePanel(caseData) {}
    drawScoreDisplay(score, rank) {}
    
    drawScene(sceneName) {
        switch(sceneName) {
            case 'policeStation':
            case 'policeStation_lobby':
                this.drawPoliceStation();
                break;
            default:
                this.clearScreen();
                this.drawSierraText(`Scene: ${sceneName}`, 300, 250, this.sierraPalette.white);
                this.drawSierraText("(Scene not yet implemented)", 250, 280, this.sierraPalette.yellow);
        }
    }
    
    drawBriefingRoom() { this.clearScreen(); }
    drawSheriffsOffice() { this.clearScreen(); }
    drawPark() { this.clearScreen(); }
    drawDowntown() { this.clearScreen(); }
    drawSierraTree(x, y) {}
    drawPoliceCar(x, y) {}
}

// Export
window.SierraGraphics = SierraGraphics;
