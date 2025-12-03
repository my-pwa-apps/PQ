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
        
        // Sierra AGI/SCI 16-color EGA/VGA palette - AUTHENTIC + Enhanced
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
            
            // Enhanced color aliases for better aesthetics
            skinTone: '#FFCC99',
            skinShadow: '#CC9966',
            policeBlue: '#000088',
            policeBlueLight: '#3333AA',
            badgeGold: '#FFD700',
            badgeGoldDark: '#B8860B',
            woodDark: '#5C4033',
            woodLight: '#8B6914',
            floorTile: '#C0C0C0',
            floorTileDark: '#909090',
            wallBeige: '#D2B48C',
            wallBeigeDark: '#A0826D',
            skyBlue: '#87CEEB',
            grassGreen: '#228B22',
            grassLight: '#32CD32'
        };
        
        // Enhanced dither patterns for better texture
        this.ditherPatterns = {
            light: [[1, 0], [0, 1]],
            medium: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
            dense: [[1, 1, 0], [1, 0, 1], [0, 1, 1]],
            checker: [[1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1]],
            diagonal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            noise: [[1, 0, 1, 0], [0, 0, 1, 1], [1, 1, 0, 0], [0, 1, 0, 1]]
        };
        
        // Animation state
        this.animFrame = 0;
        this.timeOfDay = 'day';
    }

    clearScreen() {
        this.ctx.fillStyle = this.sierraPalette.black;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // --- Primitive Drawing Helpers ---

    drawRect(x, y, w, h, color) {
        if (!color) return;
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

    drawEllipse(x, y, radiusX, radiusY, fillColor, strokeColor = null) {
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.stroke();
        }
    }

    drawDitheredRect(x, y, w, h, color1, color2, patternName = 'light') {
        const pattern = this.ditherPatterns[patternName] || this.ditherPatterns.light;
        const patternH = pattern.length;
        const patternW = pattern[0].length;

        this.ctx.fillStyle = color2;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));

        this.ctx.fillStyle = color1;
        for (let py = 0; py < h; py += 2) {
            for (let px = 0; px < w; px += 2) {
                const patX = Math.floor(px / 2) % patternW;
                const patY = Math.floor(py / 2) % patternH;
                const p = pattern[patY];
                
                if (p && p[patX] === 1) {
                    this.ctx.fillRect(Math.floor(x) + px, Math.floor(y) + py, 2, 2);
                }
            }
        }
    }

    drawText(text, x, y, color, size = 12) {
        this.ctx.font = `${size}px 'Courier New', monospace`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    // --- Scene Rendering ---

    // Alias for backward compatibility
    drawScene(sceneId) {
        this.drawSceneBackground(sceneId);
    }

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
                    { y: 310, draw: () => this.drawReceptionDesk() },
                    { y: 350, draw: () => this.drawPlant(130, 350) },
                    { y: 350, draw: () => this.drawPlant(670, 350) },
                    { y: 320, draw: () => this.drawWaterCooler(720, 320) }
                ];
            case 'policeStation_briefing':
            case 'briefingRoom':
                let props = [{ y: 280, draw: () => this.drawPodium() }];
                for(let row = 0; row < 3; row++) {
                    for(let col = 0; col < 6; col++) {
                        let cx = 150 + col * 85;
                        let cy = 380 + row * 65;
                        props.push({ y: cy, draw: () => this.drawChair(cx, cy) });
                    }
                }
                return props;
            case 'park':
            case 'city_park':
                return [
                    { y: 480, draw: () => this.drawParkBench(500, 480) }
                ];
            default:
                return [];
        }
    }

    // ==================== SCENE BACKGROUNDS ====================

    drawPoliceStationLobbyBackground() {
        // Enhanced back wall with texture
        this.drawRect(0, 0, 800, 300, this.sierraPalette.wallBeige);
        this.drawDitheredRect(0, 0, 800, 300, this.sierraPalette.wallBeigeDark, this.sierraPalette.wallBeige, 'checker');
        
        // Wainscoting
        this.drawRect(0, 200, 800, 50, this.sierraPalette.woodDark);
        this.drawLine(0, 200, 800, 200, this.sierraPalette.black, 2);
        this.drawLine(0, 250, 800, 250, this.sierraPalette.black, 2);
        for (let x = 50; x < 800; x += 100) {
            this.drawLine(x, 200, x, 250, this.sierraPalette.brown, 1);
        }
        
        // Side walls
        this.drawDitheredRect(0, 0, 80, 300, this.sierraPalette.wallBeigeDark, this.sierraPalette.wallBeige, 'diagonal');
        this.drawDitheredRect(720, 0, 80, 300, this.sierraPalette.wallBeigeDark, this.sierraPalette.wallBeige, 'diagonal');
        
        // Tiled floor
        this.drawRect(0, 300, 800, 300, this.sierraPalette.floorTile);
        this.drawDitheredRect(0, 300, 800, 300, this.sierraPalette.floorTileDark, this.sierraPalette.floorTile, 'checker');
        
        // Floor perspective
        for (let x = 0; x < 800; x += 80) {
            this.drawLine(x, 300, x + 40, 600, this.sierraPalette.darkGray, 1);
        }
        for (let y = 300; y < 600; y += 50) {
            this.drawLine(0, y, 800, y, this.sierraPalette.darkGray, 1);
        }
        
        // Briefing Room Door
        this.drawRect(115, 80, 90, 170, this.sierraPalette.woodDark);
        this.drawRect(120, 85, 80, 160, this.sierraPalette.woodLight);
        this.drawRect(125, 90, 70, 70, this.sierraPalette.darkRed);
        this.drawRect(125, 165, 70, 70, this.sierraPalette.darkRed);
        this.drawCircle(185, 170, 5, this.sierraPalette.badgeGold);
        this.drawRect(120, 60, 80, 18, this.sierraPalette.darkBlue);
        this.drawText("BRIEFING", 130, 75, this.sierraPalette.white, 11);

        // Evidence Room Door
        this.drawRect(595, 80, 90, 170, this.sierraPalette.woodDark);
        this.drawRect(600, 85, 80, 160, this.sierraPalette.woodLight);
        this.drawRect(605, 90, 70, 70, this.sierraPalette.darkRed);
        this.drawRect(605, 165, 70, 70, this.sierraPalette.darkRed);
        this.drawCircle(615, 170, 5, this.sierraPalette.badgeGold);
        this.drawRect(600, 60, 80, 18, this.sierraPalette.darkBlue);
        this.drawText("EVIDENCE", 607, 75, this.sierraPalette.white, 11);

        // Bulletin Board
        this.drawRect(445, 90, 110, 90, this.sierraPalette.woodDark);
        this.drawRect(450, 95, 100, 80, '#8B4513');
        this.drawDitheredRect(450, 95, 100, 80, '#A0522D', '#8B4513', 'noise');
        this.drawRect(455, 100, 28, 35, this.sierraPalette.white);
        this.drawRect(488, 105, 32, 28, this.sierraPalette.yellow);
        this.drawRect(525, 98, 22, 38, this.sierraPalette.white);
        this.drawCircle(469, 102, 3, this.sierraPalette.red);
        this.drawCircle(504, 107, 3, this.sierraPalette.blue);
        
        // Department seal
        this.drawCircle(400, 55, 45, this.sierraPalette.darkBlue);
        this.drawCircle(400, 55, 40, this.sierraPalette.blue);
        this.drawCircle(400, 55, 30, this.sierraPalette.badgeGold);
        this.drawText("LPD", 383, 60, this.sierraPalette.darkBlue, 16);
        
        // Banner
        this.drawRect(250, 15, 300, 28, this.sierraPalette.darkBlue);
        this.drawText("LYTTON POLICE DEPARTMENT", 263, 35, this.sierraPalette.white, 14);
        
        // Flags
        this.drawRect(25, 25, 45, 30, this.sierraPalette.red);
        for (let i = 0; i < 6; i++) {
            this.drawRect(25, 25 + i * 5, 45, 2, i % 2 === 0 ? this.sierraPalette.red : this.sierraPalette.white);
        }
        this.drawRect(25, 25, 18, 15, this.sierraPalette.darkBlue);
        this.drawRect(22, 25, 3, 50, this.sierraPalette.badgeGold);
        
        this.drawRect(730, 25, 45, 30, this.sierraPalette.white);
        this.drawRect(730, 48, 45, 7, this.sierraPalette.red);
        this.drawRect(775, 25, 3, 50, this.sierraPalette.badgeGold);
        
        // Ceiling lights
        this.drawRect(180, 3, 120, 12, this.sierraPalette.white);
        this.drawRect(500, 3, 120, 12, this.sierraPalette.white);
        
        // Clock
        this.drawCircle(350, 130, 18, this.sierraPalette.white, this.sierraPalette.black);
        this.drawLine(350, 130, 350, 120, this.sierraPalette.black, 2);
        this.drawLine(350, 130, 360, 135, this.sierraPalette.black, 1);
    }

    drawBriefingRoomBackground() {
        // Dark blue walls
        this.drawRect(0, 0, 800, 280, '#1a1a4e');
        this.drawDitheredRect(0, 0, 800, 280, '#2a2a5e', '#1a1a4e', 'diagonal');
        
        this.drawDitheredRect(0, 0, 60, 280, '#151545', '#1a1a4e', 'light');
        this.drawDitheredRect(740, 0, 60, 280, '#151545', '#1a1a4e', 'light');
        
        // Floor
        this.drawRect(0, 280, 800, 320, '#4a4a4a');
        this.drawDitheredRect(0, 280, 800, 320, '#3a3a3a', '#4a4a4a', 'checker');
        
        for (let y = 280; y < 600; y += 40) {
            this.drawLine(0, y, 800, y, '#333333', 1);
        }
        
        // Blackboard
        this.drawRect(145, 25, 510, 190, this.sierraPalette.woodDark);
        this.drawRect(150, 30, 500, 180, '#1a2a1a');
        this.drawRect(150, 210, 500, 15, this.sierraPalette.woodLight);
        this.drawText("DAILY BRIEFING - 0800 HRS", 180, 60, '#CCCCCC', 14);
        this.drawText("1. PATROL ASSIGNMENTS", 180, 100, this.sierraPalette.white, 12);
        this.drawText("2. BOLO: WHITE SEDAN - 2BTF123", 180, 120, this.sierraPalette.yellow, 12);
        this.drawText("3. DEATH ANGEL CASE - ONGOING", 180, 140, this.sierraPalette.red, 12);
        this.drawText("4. BE CAREFUL OUT THERE", 180, 170, this.sierraPalette.white, 14);
        
        // Flag
        this.drawRect(30, 30, 50, 35, this.sierraPalette.red);
        for (let i = 0; i < 7; i++) {
            this.drawRect(30, 30 + i * 5, 50, 2, i % 2 === 0 ? this.sierraPalette.red : this.sierraPalette.white);
        }
        this.drawRect(30, 30, 20, 17, this.sierraPalette.darkBlue);
        this.drawRect(25, 30, 5, 80, this.sierraPalette.badgeGold);
        
        // Podium
        this.drawRect(350, 230, 100, 50, this.sierraPalette.woodDark);
        this.drawRect(355, 235, 90, 40, this.sierraPalette.woodLight);
        this.drawCircle(400, 255, 12, this.sierraPalette.badgeGold);
        
        // Exit sign
        this.drawRect(720, 40, 60, 25, this.sierraPalette.red);
        this.drawText("EXIT", 730, 58, this.sierraPalette.white, 12);
        
        // Ceiling lights
        for (let x = 150; x < 700; x += 200) {
            this.drawRect(x, 5, 100, 15, this.sierraPalette.white);
        }
    }

    drawEvidenceRoomBackground() {
        this.drawRect(0, 0, 800, 300, '#3a3a3a');
        this.drawDitheredRect(0, 0, 800, 300, '#2a2a2a', '#3a3a3a', 'noise');
        
        this.drawRect(0, 300, 800, 300, '#5a5a5a');
        this.drawDitheredRect(0, 300, 800, 300, '#4a4a4a', '#5a5a5a', 'checker');
        
        // Evidence cages
        for(let x = 50; x < 750; x += 140) {
            this.drawRect(x, 80, 110, 180, '#2a2a2a');
            this.drawRect(x + 5, 85, 100, 170, this.sierraPalette.darkBlue);
            for(let i = 0; i < 100; i += 15) {
                this.drawLine(x + 5 + i, 85, x + 5 + i, 255, '#4a4a6a', 1);
            }
            for(let i = 0; i < 170; i += 20) {
                this.drawLine(x + 5, 85 + i, x + 105, 85 + i, '#4a4a6a', 1);
            }
            this.drawRect(x + 15, 100, 30, 25, this.sierraPalette.brown);
            this.drawRect(x + 55, 95, 40, 30, '#8B4513');
        }
        
        // Counter
        this.drawRect(0, 350, 800, 250, this.sierraPalette.woodDark);
        this.drawRect(0, 350, 800, 20, this.sierraPalette.woodLight);
        
        // Service window
        this.drawRect(300, 120, 200, 130, '#2a2a2a');
        this.drawRect(310, 130, 180, 110, '#1a1a3a');
        
        // Bell
        this.drawCircle(400, 340, 15, this.sierraPalette.badgeGold);
        this.drawText("RING FOR SERVICE", 340, 320, this.sierraPalette.white, 10);
        
        // Sign
        this.drawRect(320, 50, 160, 30, this.sierraPalette.darkBlue);
        this.drawText("EVIDENCE ROOM", 340, 72, this.sierraPalette.white, 14);
    }

    drawDowntownStreetBackground() {
        // Sky
        this.drawRect(0, 0, 800, 100, this.sierraPalette.skyBlue);
        this.drawDitheredRect(0, 100, 800, 50, this.sierraPalette.cyan, this.sierraPalette.skyBlue, 'light');
        
        // Clouds
        this.drawCircle(100, 40, 25, this.sierraPalette.white);
        this.drawCircle(130, 35, 20, this.sierraPalette.white);
        this.drawCircle(600, 50, 30, this.sierraPalette.white);
        this.drawCircle(640, 45, 22, this.sierraPalette.white);
        
        // Distant buildings
        this.drawRect(0, 80, 800, 70, '#666699');
        
        // Building 1 - Hardware Store
        this.drawRect(20, 40, 160, 160, '#8B4513');
        this.drawDitheredRect(20, 40, 160, 160, '#A0522D', '#8B4513', 'checker');
        this.drawRect(60, 140, 80, 60, this.sierraPalette.darkGray);
        this.drawRect(65, 145, 70, 50, this.sierraPalette.black);
        this.drawRect(30, 60, 50, 60, '#87CEEB');
        this.drawRect(120, 60, 50, 60, '#87CEEB');
        this.drawRect(30, 55, 140, 8, this.sierraPalette.darkRed);
        this.drawText("HARDWARE", 55, 48, this.sierraPalette.white, 12);
        
        // Building 2 - Police Station
        this.drawRect(200, 20, 200, 180, '#C0C0C0');
        this.drawRect(200, 20, 200, 25, this.sierraPalette.darkBlue);
        this.drawRect(250, 130, 100, 70, this.sierraPalette.darkBlue);
        this.drawRect(260, 140, 80, 55, this.sierraPalette.black);
        for (let wx = 210; wx < 390; wx += 45) {
            for (let wy = 50; wy < 120; wy += 35) {
                this.drawRect(wx, wy, 35, 25, '#87CEEB');
            }
        }
        this.drawText("POLICE", 268, 38, this.sierraPalette.white, 14);
        this.drawCircle(300, 100, 22, this.sierraPalette.badgeGold);
        this.drawCircle(300, 100, 17, this.sierraPalette.darkBlue);
        
        // Building 3 - Carol's Coffee
        this.drawRect(420, 50, 180, 150, this.sierraPalette.darkRed);
        this.drawRect(460, 140, 60, 60, this.sierraPalette.brown);
        this.drawRect(540, 70, 50, 80, '#87CEEB');
        this.drawRect(430, 70, 50, 50, '#87CEEB');
        this.drawRect(420, 42, 180, 12, this.sierraPalette.yellow);
        this.drawText("CAROL'S COFFEE", 445, 55, this.sierraPalette.black, 11);
        
        // Building 4 - Office
        this.drawRect(620, 30, 160, 170, '#D3D3D3');
        for (let wx = 630; wx < 770; wx += 35) {
            for (let wy = 40; wy < 180; wy += 30) {
                this.drawRect(wx, wy, 25, 20, '#4169E1');
            }
        }
        
        // Sidewalk
        this.drawRect(0, 200, 800, 60, '#C0C0C0');
        this.drawDitheredRect(0, 200, 800, 60, '#A9A9A9', '#C0C0C0', 'checker');
        this.drawLine(0, 200, 800, 200, this.sierraPalette.darkGray, 2);
        
        // Curb
        this.drawRect(0, 255, 800, 8, '#808080');
        
        // Street
        this.drawRect(0, 263, 800, 340, '#333333');
        this.drawDitheredRect(0, 263, 800, 340, '#2F2F2F', '#333333', 'noise');
        
        // Road markings
        for(let x = 50; x < 800; x += 120) {
            this.drawRect(x, 420, 60, 8, this.sierraPalette.yellow);
        }
        
        // Crosswalk
        for(let i = 0; i < 8; i++) {
            this.drawRect(350 + i * 15, 263, 10, 60, this.sierraPalette.white);
        }
        
        // Lamp posts
        this.drawRect(95, 180, 8, 80, '#333333');
        this.drawCircle(99, 172, 10, this.sierraPalette.yellow);
        this.drawRect(395, 180, 8, 80, '#333333');
        this.drawCircle(399, 172, 10, this.sierraPalette.yellow);
        this.drawRect(695, 180, 8, 80, '#333333');
        this.drawCircle(699, 172, 10, this.sierraPalette.yellow);
        
        // Fire hydrant
        this.drawRect(145, 225, 18, 35, this.sierraPalette.red);
        this.drawRect(140, 220, 28, 10, this.sierraPalette.red);
        
        // Parked cars
        this.drawCar(50, 380, this.sierraPalette.darkBlue);
        this.drawCar(650, 380, this.sierraPalette.darkRed);
    }

    drawParkBackground() {
        // Sky
        this.drawRect(0, 0, 800, 150, this.sierraPalette.skyBlue);
        this.drawDitheredRect(0, 130, 800, 30, this.sierraPalette.cyan, this.sierraPalette.skyBlue, 'light');
        
        // Clouds
        this.drawCircle(150, 50, 30, this.sierraPalette.white);
        this.drawCircle(180, 45, 25, this.sierraPalette.white);
        this.drawCircle(500, 70, 35, this.sierraPalette.white);
        this.drawCircle(540, 65, 28, this.sierraPalette.white);
        this.drawCircle(700, 40, 25, this.sierraPalette.white);
        
        // Distant tree line
        for (let x = 0; x < 800; x += 35) {
            this.drawCircle(x + 17, 150, 22, this.sierraPalette.darkGreen);
        }
        
        // Grass
        this.drawRect(0, 160, 800, 440, this.sierraPalette.grassGreen);
        this.drawDitheredRect(0, 160, 800, 440, this.sierraPalette.grassLight, this.sierraPalette.grassGreen, 'light');
        
        // Path
        this.drawPolygon([
            {x: 300, y: 600}, {x: 500, y: 600},
            {x: 430, y: 400}, {x: 370, y: 400}
        ], '#C4A35A');
        this.drawPolygon([
            {x: 370, y: 400}, {x: 430, y: 400},
            {x: 450, y: 300}, {x: 350, y: 300}
        ], '#C4A35A');
        this.drawPolygon([
            {x: 350, y: 300}, {x: 450, y: 300},
            {x: 420, y: 200}, {x: 380, y: 200}
        ], '#C4A35A');
        
        // Pond
        this.drawPolygon([
            {x: 550, y: 350}, {x: 700, y: 330}, {x: 750, y: 400},
            {x: 720, y: 450}, {x: 580, y: 440}, {x: 530, y: 390}
        ], '#4682B4');
        this.drawPolygon([
            {x: 560, y: 360}, {x: 680, y: 345}, {x: 720, y: 400},
            {x: 690, y: 430}, {x: 590, y: 420}, {x: 550, y: 385}
        ], '#5F9EA0');
        
        // Trees
        this.drawTree(100, 280);
        this.drawTree(180, 380);
        this.drawTree(680, 280);
        this.drawTree(750, 350);
        
        // Flower beds
        this.drawFlowerBed(50, 480, 80, 40);
        this.drawFlowerBed(200, 530, 60, 30);
        
        // Picnic table
        this.drawRect(80, 400, 60, 30, this.sierraPalette.woodDark);
        this.drawRect(75, 380, 70, 8, this.sierraPalette.woodLight);
        this.drawRect(75, 430, 70, 8, this.sierraPalette.woodLight);
        
        // Lamp post
        this.drawRect(397, 220, 6, 100, '#333333');
        this.drawCircle(400, 210, 8, this.sierraPalette.yellow);
        
        // Birds
        this.drawBird(300, 100);
        this.drawBird(350, 80);
        this.drawBird(600, 110);
        
        // Ducks
        this.drawDuck(620, 360);
        this.drawDuck(650, 380);
    }

    drawDefaultScene() {
        this.drawRect(0, 0, 800, 300, this.sierraPalette.cyan);
        this.drawRect(0, 300, 800, 300, this.sierraPalette.lightGray);
        this.drawText("LYTTON, CA", 350, 100, this.sierraPalette.black, 20);
    }

    // ==================== PROP DRAWING ====================

    drawReceptionDesk() {
        this.drawRect(280, 290, 240, 60, this.sierraPalette.woodDark);
        this.drawRect(285, 295, 230, 50, this.sierraPalette.woodLight);
        this.drawRect(275, 285, 250, 10, this.sierraPalette.woodDark);
        this.drawRect(290, 305, 50, 35, '#5a3a2a');
        this.drawRect(360, 305, 50, 35, '#5a3a2a');
        this.drawRect(430, 305, 50, 35, '#5a3a2a');
        this.drawRect(490, 290, 20, 10, this.sierraPalette.black);
        this.drawRect(320, 288, 60, 8, this.sierraPalette.badgeGold);
    }

    drawPlant(x, y) {
        this.drawRect(x - 15, y - 10, 30, 25, '#8B4513');
        this.drawRect(x - 18, y - 10, 36, 8, '#A0522D');
        this.drawRect(x - 12, y - 8, 24, 5, '#3D2817');
        this.drawCircle(x, y - 25, 18, this.sierraPalette.green);
        this.drawCircle(x - 12, y - 35, 14, this.sierraPalette.darkGreen);
        this.drawCircle(x + 12, y - 35, 14, this.sierraPalette.darkGreen);
        this.drawCircle(x, y - 40, 12, this.sierraPalette.green);
    }

    drawWaterCooler(x, y) {
        this.drawRect(x - 12, y + 20, 24, 40, this.sierraPalette.lightGray);
        this.drawRect(x - 8, y - 20, 16, 40, '#87CEEB');
        this.drawRect(x - 10, y - 25, 20, 8, this.sierraPalette.darkBlue);
        this.drawRect(x - 10, y + 25, 8, 8, this.sierraPalette.blue);
        this.drawRect(x + 2, y + 25, 8, 8, this.sierraPalette.red);
    }

    drawPodium() {
        this.drawRect(340, 235, 120, 55, this.sierraPalette.woodDark);
        this.drawRect(345, 240, 110, 45, this.sierraPalette.woodLight);
        this.drawCircle(400, 262, 15, this.sierraPalette.badgeGold);
        this.drawCircle(400, 262, 10, this.sierraPalette.darkBlue);
    }

    drawChair(x, y) {
        this.drawRect(x, y - 30, 40, 35, this.sierraPalette.woodDark);
        this.drawRect(x + 3, y - 27, 34, 28, this.sierraPalette.darkRed);
        this.drawRect(x - 2, y, 44, 8, this.sierraPalette.woodDark);
        this.drawRect(x, y + 8, 5, 15, this.sierraPalette.black);
        this.drawRect(x + 35, y + 8, 5, 15, this.sierraPalette.black);
    }

    drawParkBench(x, y) {
        this.drawRect(x, y - 30, 90, 30, this.sierraPalette.woodDark);
        for (let i = 0; i < 5; i++) {
            this.drawRect(x + 5 + i * 17, y - 28, 12, 25, this.sierraPalette.woodLight);
        }
        this.drawRect(x - 5, y, 100, 12, this.sierraPalette.woodLight);
        this.drawRect(x, y + 12, 8, 20, this.sierraPalette.black);
        this.drawRect(x + 82, y + 12, 8, 20, this.sierraPalette.black);
    }

    drawTree(x, y) {
        this.drawRect(x - 12, y, 24, 70, this.sierraPalette.woodDark);
        this.drawRect(x - 8, y + 10, 16, 50, '#5C4033');
        this.drawCircle(x, y - 30, 45, this.sierraPalette.darkGreen);
        this.drawCircle(x - 25, y - 15, 35, this.sierraPalette.darkGreen);
        this.drawCircle(x + 25, y - 15, 35, this.sierraPalette.darkGreen);
        this.drawCircle(x, y - 50, 35, this.sierraPalette.green);
        this.drawCircle(x - 20, y - 40, 25, this.sierraPalette.green);
        this.drawCircle(x + 20, y - 40, 25, this.sierraPalette.green);
    }

    drawFlowerBed(x, y, w, h) {
        this.drawRect(x - 3, y - 3, w + 6, h + 6, '#3D2817');
        this.drawRect(x, y, w, h, '#5C4033');
        const colors = [this.sierraPalette.red, this.sierraPalette.yellow, this.sierraPalette.magenta, this.sierraPalette.white, '#FF69B4'];
        for (let fx = x + 8; fx < x + w - 8; fx += 14) {
            for (let fy = y + 6; fy < y + h - 6; fy += 12) {
                const color = colors[Math.floor((fx + fy) % colors.length)];
                this.drawCircle(fx, fy, 5, color);
                this.drawCircle(fx, fy, 2, this.sierraPalette.yellow);
            }
        }
    }

    drawBird(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y + 5);
        this.ctx.quadraticCurveTo(x, y - 3, x + 10, y + 5);
        this.ctx.strokeStyle = this.sierraPalette.black;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawDuck(x, y) {
        this.drawEllipse(x, y, 12, 8, this.sierraPalette.white);
        this.drawCircle(x + 10, y - 5, 6, this.sierraPalette.white);
        this.drawRect(x + 14, y - 5, 6, 3, this.sierraPalette.yellow);
        this.drawCircle(x + 12, y - 6, 1, this.sierraPalette.black);
    }

    drawCar(x, y, color) {
        this.drawRect(x, y, 100, 35, color);
        this.drawRect(x + 15, y - 15, 70, 20, color);
        this.drawRect(x + 20, y - 12, 25, 15, '#87CEEB');
        this.drawRect(x + 50, y - 12, 30, 15, '#87CEEB');
        this.drawCircle(x + 20, y + 35, 12, this.sierraPalette.black);
        this.drawCircle(x + 20, y + 35, 6, this.sierraPalette.darkGray);
        this.drawCircle(x + 80, y + 35, 12, this.sierraPalette.black);
        this.drawCircle(x + 80, y + 35, 6, this.sierraPalette.darkGray);
        this.drawRect(x, y + 5, 5, 10, this.sierraPalette.yellow);
        this.drawRect(x + 95, y + 5, 5, 10, this.sierraPalette.red);
    }

    // ==================== CHARACTER RENDERING ====================

    drawCharacterWithScale(x, y, spriteName, facing, action, scale) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        
        const colors = this.getCharacterColors(spriteName);
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        if (facing === 'down' || facing === 'up') {
            this.drawFrontBackCharacter(colors, facing, action);
        } else {
            this.drawSideCharacter(colors, facing, action);
        }

        this.ctx.restore();
    }

    getCharacterColors(name) {
        let colors = {
            skin: this.sierraPalette.skinTone,
            skinShadow: this.sierraPalette.skinShadow,
            shirt: this.sierraPalette.white,
            pants: this.sierraPalette.blue,
            hair: this.sierraPalette.brown,
            shoes: this.sierraPalette.black
        };

        if (name.includes('sonny') || name.includes('officer') || name.includes('cop')) {
            colors.shirt = this.sierraPalette.policeBlue;
            colors.pants = this.sierraPalette.darkBlue;
        } else if (name.includes('jenny')) {
            colors.shirt = this.sierraPalette.policeBlue;
            colors.pants = this.sierraPalette.darkBlue;
            colors.hair = this.sierraPalette.yellow;
        } else if (name.includes('sergeant')) {
            colors.shirt = this.sierraPalette.policeBlue;
            colors.pants = this.sierraPalette.darkBlue;
            colors.hair = this.sierraPalette.darkGray;
        } else if (name.includes('criminal') || name.includes('suspect')) {
            colors.shirt = this.sierraPalette.darkGray;
            colors.pants = this.sierraPalette.black;
        } else if (name.includes('civilian')) {
            const civilianColors = [
                { shirt: this.sierraPalette.red, pants: this.sierraPalette.darkBlue },
                { shirt: this.sierraPalette.green, pants: this.sierraPalette.brown },
                { shirt: this.sierraPalette.yellow, pants: this.sierraPalette.darkGray },
                { shirt: this.sierraPalette.white, pants: this.sierraPalette.darkBlue }
            ];
            const idx = Math.abs(name.charCodeAt(name.length - 1)) % civilianColors.length;
            colors.shirt = civilianColors[idx].shirt;
            colors.pants = civilianColors[idx].pants;
        }

        return colors;
    }

    drawFrontBackCharacter(colors, facing, action) {
        const isBack = facing === 'up';
        
        // Legs
        const legOffset = action === 'walking' ? Math.sin(Date.now() / 100) * 3 : 0;
        this.drawRect(-10 + legOffset, -22, 8, 22, colors.pants);
        this.drawRect(2 - legOffset, -22, 8, 22, colors.pants);
        
        // Shoes
        this.drawRect(-11 + legOffset, -2, 10, 4, colors.shoes);
        this.drawRect(1 - legOffset, -2, 10, 4, colors.shoes);
        
        // Torso
        this.drawRect(-12, -52, 24, 32, colors.shirt);
        this.drawRect(-12, -52, 6, 32, this.sierraPalette.policeBlueLight || colors.shirt);
        
        // Badge
        if (!isBack) {
            this.drawRect(4, -48, 6, 8, this.sierraPalette.badgeGold);
        }
        
        // Belt
        this.drawRect(-12, -22, 24, 4, this.sierraPalette.black);
        this.drawRect(-2, -23, 4, 6, this.sierraPalette.badgeGold);
        
        // Head
        this.drawRect(-9, -68, 18, 18, colors.skin);
        this.drawRect(-9, -68, 4, 18, colors.skinShadow);
        
        // Hair
        if (isBack) {
            this.drawRect(-10, -70, 20, 18, colors.hair);
        } else {
            this.drawRect(-10, -72, 20, 8, colors.hair);
            this.drawRect(-5, -62, 3, 3, this.sierraPalette.black);
            this.drawRect(2, -62, 3, 3, this.sierraPalette.black);
        }

        // Arms
        const armOffset = action === 'walking' ? Math.sin(Date.now() / 100) * 2 : 0;
        this.drawRect(-17, -50, 5, 26, colors.shirt);
        this.drawRect(-17, -26 + armOffset, 5, 6, colors.skin);
        this.drawRect(12, -50, 5, 26, colors.shirt);
        this.drawRect(12, -26 - armOffset, 5, 6, colors.skin);
    }

    drawSideCharacter(colors, facing, action) {
        const isRight = facing === 'right';
        const dir = isRight ? 1 : -1;
        
        // Legs
        const legOffset = action === 'walking' ? Math.sin(Date.now() / 100) * 5 : 0;
        this.drawRect(-4 - legOffset * dir, -22, 8, 22, colors.pants);
        this.drawRect(-5 - legOffset * dir, -2, 10, 4, colors.shoes);
        this.drawRect(-4 + legOffset * dir, -22, 8, 22, colors.pants);
        this.drawRect(-5 + legOffset * dir, -2, 10, 4, colors.shoes);
        
        // Torso
        this.drawRect(-8, -52, 16, 32, colors.shirt);
        
        // Belt
        this.drawRect(-8, -22, 16, 4, this.sierraPalette.black);
        
        // Head
        this.drawRect(-6, -68, 12, 18, colors.skin);
        
        // Hair
        this.drawRect(-7, -72, 14, 10, colors.hair);
        
        // Eye
        this.drawRect(isRight ? 3 : -6, -62, 3, 3, this.sierraPalette.black);
        
        // Arm
        const armOffset = action === 'walking' ? Math.sin(Date.now() / 100) * 4 : 0;
        this.drawRect(-3 + armOffset * dir, -50, 6, 26, colors.shirt);
        this.drawRect(-3 + armOffset * dir, -26, 6, 6, colors.skin);
    }

    // ==================== DEBUG VISUALIZATION ====================

    drawHotspot(hotspot, isHighlighted = false) {
        const alpha = isHighlighted ? 0.5 : 0.3;
        this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        this.ctx.fillRect(hotspot.x, hotspot.y, hotspot.width || 40, hotspot.height || 40);
        
        this.ctx.strokeStyle = isHighlighted ? '#FFFF00' : '#AAAA00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(hotspot.x, hotspot.y, hotspot.width || 40, hotspot.height || 40);
        
        // Draw hotspot label
        if (hotspot.id) {
            this.ctx.font = '10px Courier New';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(hotspot.id, hotspot.x + 2, hotspot.y + 12);
        }
    }

    drawCollisionObject(obj, color = 'rgba(255, 0, 0, 0.3)') {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 1;
        
        if (obj.type === 'rect') {
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.type === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Draw label if present
        if (obj.label) {
            this.ctx.font = '9px Courier New';
            this.ctx.fillStyle = '#FFFFFF';
            const labelX = obj.type === 'rect' ? obj.x : obj.x - 20;
            const labelY = obj.type === 'rect' ? obj.y + 10 : obj.y;
            this.ctx.fillText(obj.label, labelX, labelY);
        }
    }

    drawWalkableArea(walkablePath, color = 'rgba(0, 255, 0, 0.2)') {
        if (!walkablePath || walkablePath.length < 3) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(walkablePath[0].x, walkablePath[0].y);
        for (let i = 1; i < walkablePath.length; i++) {
            this.ctx.lineTo(walkablePath[i].x, walkablePath[i].y);
        }
        this.ctx.closePath();
        
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawNPCDebug(npc) {
        // Draw NPC bounding box
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(npc.x - 20, npc.y - 70, 40, 70);
        
        // Draw NPC name
        this.ctx.font = '10px Courier New';
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.fillText(npc.name || npc.id, npc.x - 20, npc.y - 75);
        
        // Draw position coordinates
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillText(`(${Math.round(npc.x)}, ${Math.round(npc.y)})`, npc.x - 20, npc.y + 15);
    }
}

// Export
window.SierraGraphics = SierraGraphics;
