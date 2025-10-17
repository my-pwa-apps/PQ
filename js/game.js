// Remove the import statement as the engine is defined as a global class
// import GameEngine from './engine.js'; <- This line causes the error

const GAME_DATA = {
    scenes: {
        policeStation: {
            background: '',
            music: 'station_theme',
            // Enhance collision objects with better coverage
            collisionObjects: [
                // Reception desk
                { type: 'rect', x: 350, y: 280, width: 160, height: 60 },
                // File cabinets
                { type: 'rect', x: 50, y: 200, width: 30, height: 80 },
                { type: 'rect', x: 80, y: 200, width: 30, height: 80 },
                { type: 'rect', x: 720, y: 200, width: 30, height: 80 },
                // Detective desks
                { type: 'rect', x: 200, y: 320, width: 100, height: 60 },
                { type: 'rect', x: 500, y: 350, width: 100, height: 60 },
                // Walls - make them thicker and properly positioned
                { type: 'rect', x: 400, y: 10, width: 800, height: 20 },    // Top wall
                { type: 'rect', x: 10, y: 300, width: 20, height: 600 },    // Left wall
                { type: 'rect', x: 790, y: 300, width: 20, height: 600 },   // Right wall
                { type: 'rect', x: 400, y: 590, width: 800, height: 20 },   // Bottom wall except for door
                // Water cooler
                { type: 'rect', x: 730, y: 280, width: 24, height: 25 },
                // Plants
                { type: 'circle', x: 50, y: 270, radius: 15 },
                { type: 'circle', x: 750, y: 350, radius: 15 },
                // Coffee machine
                { type: 'rect', x: 680, y: 150, width: 30, height: 40 },
                // Add collision for all NPCs in the room
                { type: 'circle', x: 400, y: 280, radius: 20 }, // Receptionist
                { type: 'circle', x: 600, y: 320, radius: 20 }  // Sergeant
            ],
            hotspots: [
                {
                    id: 'receptionDesk',
                    x: 400,  // Aligned with visual desk position
                    y: 320,  // Matches floor level
                    width: 150, // Matches desk width
                    height: 70, // Matches desk depth
                    interactions: {
                        look: "The reception desk. Officer Jenny is working diligently.",
                        use: "You check in at the reception desk.",
                        take: "You can't take the desk with you, detective."
                    }
                },
                {
                    id: 'desk',
                    x: 100,
                    y: 200,
                    width: 150,
                    height: 80,
                    interactions: {
                        look: "Your desk. Several case files are waiting for your review.",
                        use: "You sit down at your desk and review the active cases.",
                        take: "You can't take the desk with you, detective."
                    }
                },
                {
                    id: 'evidenceLocker',
                    x: 700,
                    y: 100,
                    width: 80,
                    height: 180,
                    interactions: {
                        look: "The evidence locker. All pieces of evidence must be properly logged.",
                        use: "You need a key to open the evidence locker.",
                        take: "The evidence locker is securely bolted to the wall."
                    }
                },
                {
                    id: 'sergeant',
                    x: 400,
                    y: 300,
                    width: 40,
                    height: 70,
                    interactions: {
                        look: "Sergeant Dooley. Your supervisor and a veteran of the force.",
                        talk: "\"Good morning, detective. We've got multiple cases that need attention. The downtown burglaries should be your top priority.\"",
                        use: "I don't think the sergeant would appreciate that."
                    }
                },
                {
                    id: 'caseFile',
                    x: 200,
                    y: 320,
                    width: 30,
                    height: 20,
                    interactions: {
                        look: "Case file for the downtown burglaries. Contains witness statements and initial findings.",
                        use: "You open the case file and begin reviewing the details.",
                        take: "You add the case file to your inventory."
                    },
                    readable: "CASE FILE #2347\n\nSuspect: Unknown\n\nDescription: Series of burglaries targeting electronics stores downtown. All break-ins occurred between 1-3 AM. Security cameras disabled in all incidents.\n\nEvidence: Shoe print found at latest scene matches size 11 men's boot.\n\nWitnesses: Store owner across the street reported seeing tall individual in dark clothing near the scene around 2 AM."
                },
                {
                    id: 'sheriffsOfficeDoor',
                    x: 700,  // Updated to match new door position
                    y: 180,  // Updated to match wall height
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "The Sheriff's office. The door is slightly ajar.",
                        use: "You enter the Sheriff's office.",
                        talk: "There's no one at the door to talk to."
                    },
                    targetScene: 'sheriffsOffice',
                    targetX: 250,
                    targetY: 400
                },
                {
                    id: 'briefingRoomDoor',
                    x: 100,  // Updated to match new door position
                    y: 180,  // Updated to match wall height
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "The door to the briefing room.",
                        use: "You enter the briefing room.",
                        talk: "There's no one at the door to talk to."
                    },
                    targetScene: 'briefingRoom',
                    targetX: 400,
                    targetY: 450
                },
                {
                    id: 'exitDoor',
                    x: 365,
                    y: 520,  // Moved down to match new floor level
                    width: 70,
                    height: 30,
                    interactions: {
                        look: "The exit door leading downtown.",
                        use: "You head downtown to investigate.",
                        talk: "It's a door. It doesn't talk back."
                    },
                    targetScene: 'downtown',
                    targetX: 400,
                    targetY: 500
                }
            ]
        },
        downtown: {
            background: '',
            music: 'downtown_theme',
            collisionObjects: [
                // Buildings
                { type: 'rect', x: 300, y: 200, width: 140, height: 80 },  // Electronics store
                { type: 'rect', x: 500, y: 200, width: 140, height: 80 },  // Cafe
                // Lamp posts
                { type: 'circle', x: 100, y: 280, radius: 5 },
                { type: 'circle', x: 400, y: 280, radius: 5 },
                { type: 'circle', x: 700, y: 280, radius: 5 },
                // Fire hydrant
                { type: 'circle', x: 150, y: 280, radius: 10 },
                // Police car
                { type: 'rect', x: 600, y: 320, width: 60, height: 25 }
            ],
            hotspots: [
                {
                    id: 'alley',
                    x: 200,
                    y: 100,
                    width: 50,
                    height: 180,
                    interactions: {
                        look: "A dark alley between two buildings. Looks like a potential entry point for the burglar.",
                        use: "You search the alley carefully and find some footprints.",
                        take: "You can't take the alley with you."
                    }
                },
                {
                    id: 'shopDoor',
                    x: 400,
                    y: 220,
                    width: 40,
                    height: 60,
                    interactions: {
                        look: "The door to the electronics shop. It shows signs of forced entry.",
                        use: "You examine the lock and find scratch marks, evidence of a break-in.",
                        take: "You can't take the door with you."
                    }
                },
                {
                    id: 'witness',
                    x: 150,
                    y: 300,
                    width: 40,
                    height: 70,
                    interactions: {
                        look: "A local shopkeeper who witnessed suspicious activity last night.",
                        talk: "\"Officer, I saw someone hanging around that alley at around 2 AM. Tall person, wearing dark clothes and a cap.\"",
                        use: "That would be inappropriate, detective."
                    }
                },
                {
                    id: 'evidence',
                    x: 400,
                    y: 290,
                    width: 90,
                    height: 10,
                    interactions: {
                        look: "Yellow police tape marking a potential evidence area.",
                        use: "You carefully search the marked area and find a dropped tool that could have been used in the break-in.",
                        take: "You collect the evidence and bag it properly."
                    }
                },
                {
                    id: 'exitDoor',
                    x: 400,
                    y: 550,
                    width: 100, 
                    height: 40,
                    interactions: {
                        look: "The exit leading back to the police station.",
                        use: "You head back to the police station.",
                        talk: "It's a door. It doesn't talk back."
                    },
                    targetScene: 'policeStation',
                    targetX: 400,
                    targetY: 450
                }
            ]
        },
        park: {
            background: '',
            music: 'park_theme',
            hotspots: [
                {
                    id: 'bench',
                    x: 150,
                    y: 320,
                    width: 80,
                    height: 30,
                    interactions: {
                        look: "A park bench. There's a discarded newspaper on it.",
                        use: "You sit down and read the newspaper, which mentions the recent string of burglaries.",
                        take: "You take the newspaper. It might contain relevant information."
                    }
                },
                {
                    id: 'fountain',
                    x: 350,
                    y: 200,
                    width: 100,
                    height: 100,
                    interactions: {
                        look: "A decorative fountain in the center of the park.",
                        use: "You check around the fountain and notice something glinting in the water.",
                        take: "You reach in and retrieve a key that might fit the evidence locker."
                    }
                },
                {
                    id: 'suspect',
                    x: 400,
                    y: 300,
                    width: 40,
                    height: 70,
                    interactions: {
                        look: "A suspicious individual matching the witness description.",
                        talk: "\"I don't know what you're talking about, officer. I was home all night.\"",
                        use: "With proper probable cause, you could search the suspect."
                    }
                }
            ]
        },
        sheriffsOffice: {
            background: '',
            music: 'station_theme',
            collisionObjects: [
                // Sheriff's desk
                { type: 'rect', x: 350, y: 150, width: 250, height: 100 },
                // Filing cabinet
                { type: 'rect', x: 50, y: 150, width: 70, height: 120 },
                // Walls
                { type: 'rect', x: 400, y: 20, width: 800, height: 40 },   // Top wall
                { type: 'rect', x: 20, y: 300, width: 40, height: 600 },   // Left wall
                { type: 'rect', x: 780, y: 300, width: 40, height: 600 }   // Right wall
            ],
            hotspots: [
                {
                    id: 'sheriffsDesk',
                    x: 350,
                    y: 150,
                    width: 250,
                    height: 100,
                    interactions: {
                        look: "The Sheriff's desk. It's much larger and tidier than your own.",
                        use: "You shouldn't rummage through the Sheriff's things without permission.",
                        take: "You can't take the Sheriff's desk."
                    }
                },
                {
                    id: 'sheriff',
                    x: 450,
                    y: 260,
                    width: 50,
                    height: 60,
                    interactions: {
                        look: "Sheriff Johnson. A stern but fair leader with 30 years on the force.",
                        talk: "\"Detective, I need you to wrap up this burglary case ASAP. The mayor's breathing down my neck about these break-ins.\"",
                        use: "I don't think the Sheriff would appreciate that."
                    }
                },
                {
                    id: 'filingCabinet',
                    x: 50,
                    y: 150,
                    width: 70,
                    height: 120,
                    interactions: {
                        look: "A filing cabinet containing old case files. Some date back decades.",
                        use: "You find an old case file that might have similarities to your current burglary investigation.",
                        take: "You can't take the entire filing cabinet, but you could take specific files."
                    }
                },
                {
                    id: 'oldCaseFile',
                    x: 85,
                    y: 180,
                    width: 20,
                    height: 15,
                    interactions: {
                        look: "A case file from 1985 about a series of electronics store burglaries.",
                        use: "You review the file and notice the burglar used the same entry technique as your current case.",
                        take: "You take the file to compare with your current case."
                    },
                    readable: "COLD CASE FILE #8547 (1985)\n\nSuspect: James 'Slim Jim' Morrison (never caught)\n\nDescription: Series of 7 burglaries targeting electronics stores. Suspect disabled security systems by cutting power to the buildings before entry.\n\nM.O.: Always entered through back door or roof access. Targeted high-end electronics that were easy to carry and resell.\n\nSuspect was believed to have inside knowledge of the stores' security systems."
                },
                {
                    id: 'exitDoor',
                    x: 100,
                    y: 320,
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "Door leading back to the main station.",
                        use: "You head back to the main station area.",
                        take: "You can't take the door."
                    },
                    targetScene: 'policeStation',
                    targetX: 650,
                    targetY: 200
                }
            ]
        },
        briefingRoom: {
            background: '',
            music: 'station_theme',
            collisionObjects: [
                // Conference table
                { type: 'rect', x: 150, y: 180, width: 500, height: 120 },
                // Projector screen
                { type: 'rect', x: 350, y: 30, width: 200, height: 5 },
                // Coffee machine
                { type: 'rect', x: 700, y: 200, width: 50, height: 80 },
                // Walls
                { type: 'rect', x: 400, y: 20, width: 800, height: 40 },   // Top wall
                { type: 'rect', x: 20, y: 300, width: 40, height: 600 },   // Left wall
                { type: 'rect', x: 780, y: 300, width: 40, height: 600 }   // Right wall
            ],
            hotspots: [
                {
                    id: 'conferenceTable',
                    x: 150,
                    y: 180,
                    width: 500,
                    height: 120,
                    interactions: {
                        look: "The large conference table where daily briefings are held.",
                        use: "You sit at the table and review some notes.",
                        take: "You can't take the conference table."
                    }
                },
                {
                    id: 'projectorScreen',
                    x: 350,
                    y: 30,
                    width: 200,
                    height: 100,
                    interactions: {
                        look: "A projector screen displaying information about recent crimes in the area.",
                        use: "You examine the crime statistics more closely.",
                        take: "You can't take the projector screen."
                    }
                },
                {
                    id: 'casePhotos',
                    x: 50,
                    y: 60,
                    width: 320,
                    height: 60,
                    interactions: {
                        look: "Photos from various crime scenes posted on the wall.",
                        use: "You examine the photos and notice a pattern in the burglary scenes.",
                        take: "These need to stay here for the briefing."
                    }
                },
                {
                    id: 'coffeeMachine',
                    x: 700,
                    y: 200,
                    width: 50,
                    height: 80,
                    interactions: {
                        look: "The department coffee machine. It's seen better days, but still makes a decent cup.",
                        use: "You pour yourself a cup of coffee. You feel more alert now.",
                        take: "The other officers would hunt you down if you took the coffee machine."
                    }
                },
                {
                    id: 'exitDoor',
                    x: 100,
                    y: 320,
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "Door leading back to the main station.",
                        use: "You head back to the main station area.",
                        take: "You can't take the door."
                    },
                    targetScene: 'policeStation',
                    targetX: 100,
                    targetY: 200
                }
            ]
        }
    },
    cases: {
        case1: {
            title: "The Downtown Burglar",
            description: "A series of break-ins has occurred in downtown electronic stores. The perpetrator seems to be targeting high-end equipment and leaving almost no evidence behind.",
            stages: [
                {
                    id: "review",
                    description: "Review case files at the station",
                    completed: false
                },
                {
                    id: "downtown",
                    description: "Investigate the latest crime scene downtown",
                    completed: false
                },
                {
                    id: "interview",
                    description: "Interview witnesses about suspicious activities",
                    completed: false
                },
                {
                    id: "evidence",
                    description: "Collect physical evidence from the scene",
                    completed: false
                },
                {
                    id: "suspect",
                    description: "Locate and question the primary suspect",
                    completed: false
                }
            ],
            evidence: [],
            suspects: [
                {
                    name: "John Dawson",
                    description: "Local with prior breaking and entering charges",
                    alibi: "Claims to have been at home during the time of the latest break-in"
                },
                {
                    name: "Marcus Reilly",
                    description: "Electronic store employee who recently quit",
                    alibi: "Says he was at a bar until 1 AM, but no witnesses after that"
                }
            ]
        },
        case2: {
            title: "Missing Evidence",
            description: "Crucial evidence from several cases has gone missing from the evidence locker. Internal investigation required.",
            stages: [
                {
                    id: "check_logs",
                    description: "Check the evidence locker sign-in logs",
                    completed: false
                }
                // More stages can be added
            ],
            evidence: [],
            suspects: []
        }
    }
};

// Utility classes - optimized and streamlined
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.grid = new Array(this.cols * this.rows).fill().map(() => new Set());
    }

    getCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
        return this.grid[row * this.cols + col];
    }

    insert(obj) {
        const cell = this.getCell(obj.x, obj.y);
        if (cell) cell.add(obj);
    }

    getNearbyObjects(x, y, radius = 1) {
        const nearby = new Set();
        const startCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
        const startRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = this.grid[row * this.cols + col];
                cell.forEach(obj => nearby.add(obj));
            }
        }
        return nearby;
    }
    
    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i].clear();
        }
    }
}

class ObjectPool {
    constructor(createFn, initialSize = 50) {
        this.createFn = createFn;
        this.pool = new Array(initialSize).fill(null).map(() => ({
            obj: this.createFn(),
            active: false
        }));
    }

    acquire() {
        let poolItem = this.pool.find(item => !item.active);
        if (!poolItem) {
            poolItem = { obj: this.createFn(), active: false };
            this.pool.push(poolItem);
        }
        poolItem.active = true;
        return poolItem.obj;
    }

    release(obj) {
        const poolItem = this.pool.find(item => item.obj === obj);
        if (poolItem) {
            poolItem.active = false;
        }
    }
    
    reset() {
        this.pool.forEach(item => {
            item.active = false;
        });
    }
}

// Game class with improved consistency and optimization
class Game {
    constructor() {
        this.engine = null;
        this.soundManager = null;
        this.score = 0;
        
        // Consistently use arrays for inventory
        this.gameState = {
            inventory: [],
            currentCase: GAME_DATA.cases.case1 // Start with first case
        };
        this.currentScene = 'policeStation';
        
        // Use object pooling where appropriate
        this.particlePool = null;
        this.spatialGrid = null;
        
        // Dialog element caching for better performance
        this.dialogBox = null;
        
        // Performance optimization
        this.lastFrameTime = 0;
        this.frameCount = 0;

        // Add error boundary
        this.errorBoundary = {
            hasError: false,
            error: null,
            errorInfo: null
        };
        
        // Add state management optimization
        this.state = {
            currentScene: 'policeStation',
            inventory: [],
            flags: new Map(),
            dirty: new Set()
        };
        
        // Add performance monitoring
        this.metrics = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        // Add resource management
        this.loadedAssets = new Map();
        this.pendingAssets = new Set();
        
        // Add cleanup registry
        this.cleanupTasks = new Set();

        // Add UI elements container
        this.uiContainer = null;
        this.loadingScreen = null;
        this.errorScreen = null;
    }

    async initEngine() {
        try {
            if (!window.GameEngine) {
                throw new Error('GameEngine not found');
            }
            this.engine = new window.GameEngine(); // Ensure GameEngine is accessed from the global scope
            await this.engine.init();
            return true;
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
            return false;
        }
    }

    async initSoundSystem() {
        try {
            if (!window.SoundManager) {
                throw new Error('SoundManager not found');
            }
            this.soundManager = new window.SoundManager();
            await this.soundManager.initialize();
            return true;
        } catch (error) {
            console.error('Failed to initialize sound system:', error);
            return false;
        }
    }

    async initGame() {
        try {
            console.log('Initializing game...');
            
            this.showLoadingScreen();
            
            // Initialize engine first
            const engineInit = await this.initEngine();
            if (!engineInit) {
                throw new Error('Failed to initialize game engine');
            }

            // Then initialize other systems
            const [soundInit, assetsInit] = await Promise.all([
                this.initSoundSystem(),
                this.preloadAssets()
            ]);

            this.setupErrorHandlers();
            this.initializeGameState();
            this.startPerformanceMonitoring();
            
            console.log('Game initialized successfully');
            this.hideLoadingScreen();
            return true;
        } catch (error) {
            this.handleInitError(error);
            return false;
        }
    }

    handleInitError(error) {
        console.error('Failed to initialize game:', error);
        this.errorBoundary.hasError = true;
        this.errorBoundary.error = error;
        this.showErrorScreen(error);
    }

    // Add the missing setupErrorHandlers method
    setupErrorHandlers() {
        // Set up global error handler
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error || event.message);
            this.errorBoundary.hasError = true;
            this.errorBoundary.error = event.error || new Error(event.message);
            this.showErrorScreen(this.errorBoundary.error);
            return false;
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.errorBoundary.hasError = true;
            this.errorBoundary.error = event.reason;
            this.showErrorScreen(event.reason);
            return false;
        });

        // Set up engine error handlers if available
        if (this.engine) {
            this.engine.onError = (error) => {
                console.error('Engine error:', error);
                this.errorBoundary.hasError = true;
                this.errorBoundary.error = error;
                this.showErrorScreen(error);
            };
        }
    }

    // Add optimized asset preloading
    async preloadAssets() {
        // Since we're generating everything in code, we don't need to load external assets
        console.log('Using programmatically generated assets only');
        
        // If we need placeholder assets for the engine to work with, create them here
        if (this.engine) {
            try {
                // Create an empty canvas for each required asset
                const createCanvasAsset = (id, width = 64, height = 64) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw something basic to the canvas
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, 0, width, height);
                    ctx.fillStyle = '#888';
                    ctx.fillText(id, 5, height/2);
                    
                    // Convert to blob and return as data URL
                    return new Promise(resolve => {
                        canvas.toBlob(blob => {
                            const img = new Image();
                            const url = URL.createObjectURL(blob);
                            img.onload = () => {
                                this.engine.assets.set(id, img);
                                URL.revokeObjectURL(url);
                                resolve(img);
                            };
                            img.src = url;
                        });
                    });
                };
                
                // Create programmatically generated assets
                await Promise.all([
                    createCanvasAsset('player', 32, 48),
                    createCanvasAsset('ui_elements', 128, 128),
                    createCanvasAsset('background_main', 800, 600)
                ]);
            } catch (error) {
                console.warn('Error creating placeholder assets:', error);
            }
        }
        
        return true;
    }

    // Add state management optimization
    updateGameState(changes) {
        for (const [key, value] of Object.entries(changes)) {
            if (this.state[key] !== value) {
                this.state[key] = value;
                this.state.dirty.add(key);
            }
        }
        
        // Schedule UI update
        if (this.state.dirty.size > 0) {
            requestAnimationFrame(() => this.updateUI());
        }
    }

    // Add optimized UI updates
    updateUI() {
        if (this.state.dirty.size === 0) return;
        
        const updates = {
            currentScene: () => this.updateSceneUI(),
            inventory: () => this.updateInventoryUI(),
            flags: () => this.updateFlagsUI()
        };
        
        for (const key of this.state.dirty) {
            if (updates[key]) {
                updates[key]();
            }
        }
        
        this.state.dirty.clear();
    }

    // Add performance monitoring
    updatePerformanceMetrics(frameTime) {
        const now = performance.now();
        
        this.metrics.frameTime = frameTime;
        this.metrics.fps = 1000 / frameTime;
        
        if (this.engine?.debugMode) {
            console.log(
                `FPS: ${Math.round(this.metrics.fps)}, ` +
                `Frame: ${Math.round(this.metrics.frameTime)}ms, ` +
                `Update: ${Math.round(this.metrics.updateTime)}ms, ` +
                `Render: ${Math.round(this.metrics.renderTime)}ms`
            );
        }
    }

    // Add proper cleanup
    dispose() {
        // Stop game loop
        if (this.engine) {
            this.engine.stopGameLoop();
        }
        
        // Clear assets
        this.loadedAssets.clear();
        this.pendingAssets.clear();
        
        // Run cleanup tasks
        for (const task of this.cleanupTasks) {
            try {
                task();
            } catch (error) {
                console.error('Cleanup task error:', error);
            }
        }
        
        // Clear state
        this.state.dirty.clear();
        this.cleanupTasks.clear();
        
        console.log('Game disposed');
    }

    async initializeSound() {
        this.soundManager = new SoundManager();
        const success = await this.soundManager.initialize();
        window.soundManager = this.soundManager;
        return success;
    }

    async initializeEngine() {
        if (typeof window.GameEngine === 'undefined') {
            throw new Error('GameEngine not found');
        }
        
        this.engine = new window.GameEngine();
        window.gameEngine = this.engine;
        return true;
    }

    cacheUIElements() {
        this.dialogBox = document.getElementById('dialog-box');
        this.caseInfoPanel = document.getElementById('case-info');
        this.inventoryPanel = document.getElementById('inventory-panel');
        // Cache other frequently accessed elements
    }

    setupUI() {
        // Initialize UI panels
        this.updateCaseInfo();
        this.updateInventoryUI();
        this.showDialog("Welcome to Police Quest. You're a detective investigating a series of burglaries.");
        
        // Initialize performance monitoring
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        // Performance monitor
        if (this.engine.debugMode) {
            setInterval(() => this.updatePerformanceStats(), 1000);
        }
    }

    startGame() {
        if (!this.engine) {
            console.error('Game engine not initialized!');
            return;
        }

        console.log('Starting game...');
        
        // Initialize engine and load initial scene
        this.engine.init();
        
        // Set up initial case
        this.updateCaseInfo();
    }

    updateCaseInfo() {
        if (!this.caseInfoPanel || !this.gameState.currentCase) return;

        let caseHTML = `<h3>${this.gameState.currentCase.title}</h3>`;
        caseHTML += '<p>Case stages:</p>';
        caseHTML += '<ul>';
        
        this.gameState.currentCase.stages.forEach(stage => {
            caseHTML += `<li>${stage.description} ${stage.completed ? '✓' : ''}</li>`;
        });
        
        caseHTML += '</ul>';
        this.caseInfoPanel.innerHTML = caseHTML;
    }

    updateInventoryUI() {
        if (!this.inventoryPanel) return;
        
        // Clear existing inventory display
        this.inventoryPanel.innerHTML = '';
        
        // Create document fragment for batch DOM operations
        const fragment = document.createDocumentFragment();
        
        // Add each inventory item
        this.gameState.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerText = item.substring(0, 2).toUpperCase();
            itemElement.title = item;
            itemElement.addEventListener('click', () => {
                this.showDialog(`Selected item: ${item}`);
                if (this.soundManager) this.soundManager.playSound('click');
            });
            fragment.appendChild(itemElement);
        });
        
        // Add all items to DOM at once
        this.inventoryPanel.appendChild(fragment);
    }

    showDialog(text) {
        if (!this.dialogBox || !text) return;
        
        this.dialogBox.innerText = text;
        this.dialogBox.style.display = 'block';
        
        // Auto-hide dialog after 5 seconds
        setTimeout(() => {
            this.dialogBox.style.display = 'none';
        }, 5000);
    }

    checkCaseSolved() {
        if (!this.gameState.currentCase) return false;
        return this.gameState.currentCase.stages.every(stage => stage.completed);
    }

    completeStage(stageId) {
        if (!this.gameState.currentCase) return;
        const stage = this.gameState.currentCase.stages.find(s => s.id === stageId);
        if (stage) {
            stage.completed = true;
            this.updateCaseInfo();
        }
    }

    addToInventory(item) {
        if (!item) return;
        
        // Only add if it doesn't already exist
        if (!this.gameState.inventory.includes(item)) {
            this.gameState.inventory.push(item);
            this.updateInventoryUI();
        }
    }

    collectEvidence(evidence) {
        if (!evidence) return;
        
        if (!this.gameState.currentCase.evidence) {
            this.gameState.currentCase.evidence = [];
        }
        
        if (!this.gameState.currentCase.evidence.includes(evidence)) {
            this.gameState.currentCase.evidence.push(evidence);
        }
    }

    // Police procedure system
    policeProcedures = {
        arrestProtocol: {
            steps: [
                { id: "read_rights", description: "Read rights to suspect", completed: false },
                { id: "handcuff", description: "Properly handcuff the suspect", completed: false },
                { id: "search", description: "Search suspect for weapons or evidence", completed: false },
                { id: "document", description: "Document all evidence found", completed: false },
                { id: "transport", description: "Transport suspect to station", completed: false }
            ],
            active: false
        },
        trafficStop: {
            steps: [
                { id: "call_dispatch", description: "Call dispatch with location and plate", completed: false },
                { id: "approach_vehicle", description: "Approach vehicle from the rear", completed: false },
                { id: "request_documents", description: "Request license and registration", completed: false },
                { id: "verify_documents", description: "Verify documents with dispatch", completed: false }
            ],
            active: false
        },
        evidenceHandling: {
            steps: [
                { id: "wear_gloves", description: "Put on evidence handling gloves", completed: false },
                { id: "photograph", description: "Photograph evidence in place", completed: false },
                { id: "bag_tag", description: "Bag and tag evidence properly", completed: false },
                { id: "document_chain", description: "Document chain of custody", completed: false }
            ],
            active: false
        }
    };

    // Method to start a procedure
    startProcedure(procedureType) {
        if (!this.policeProcedures[procedureType]) return;
        
        this.policeProcedures[procedureType].active = true;
        this.policeProcedures[procedureType].steps.forEach(step => step.completed = false);
        this.updateProcedureUI(procedureType);
        this.showDialog(`You must follow proper ${procedureType.replace(/([A-Z])/g, ' $1').toLowerCase()} procedure.`);
    }

    // Method to complete a procedure step
    completeProcedureStep(procedureType, stepId) {
        if (!this.policeProcedures[procedureType] || !this.policeProcedures[procedureType].active) {
            return false;
        }
        
        const step = this.policeProcedures[procedureType].steps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
            this.updateProcedureUI(procedureType);
            this.showDialog(`Completed: ${step.description}`);
            
            // Check if all steps are complete
            if (this.policeProcedures[procedureType].steps.every(s => s.completed)) {
                this.completeProcedure(procedureType);
            }
            return true;
        }
        return false;
    }

    // Method to mark a procedure as complete
    completeProcedure(procedureType) {
        if (!this.policeProcedures[procedureType]) return;
        
        this.policeProcedures[procedureType].active = false;
        this.showDialog(`You have successfully completed the ${procedureType.replace(/([A-Z])/g, ' $1').toLowerCase()} procedure!`);
        
        // Award points or progress in the game
        this.addScore(50);
        
        // Clear the procedure UI
        const procedurePanel = document.getElementById('procedure-panel');
        if (procedurePanel) procedurePanel.style.display = 'none';
    }

    // Update the procedure UI
    updateProcedureUI(procedureType) {
        const procedurePanel = document.getElementById('procedure-panel');
        if (!procedurePanel) return;
        
        const procedure = this.policeProcedures[procedureType];
        if (!procedure || !procedure.active) {
            procedurePanel.style.display = 'none';
            return;
        }
        
        procedurePanel.style.display = 'block';
        
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        const titleElement = document.createElement('h3');
        titleElement.textContent = procedureType.replace(/([A-Z])/g, ' $1').trim() + ' Procedure';
        fragment.appendChild(titleElement);
        
        const stepsList = document.createElement('ul');
        stepsList.className = 'procedure-steps';
        
        procedure.steps.forEach(step => {
            const stepItem = document.createElement('li');
            stepItem.className = step.completed ? 'completed' : '';
            stepItem.textContent = step.description;
            stepsList.appendChild(stepItem);
        });
        
        fragment.appendChild(stepsList);
        
        // Clear and update in one operation
        procedurePanel.innerHTML = '';
        procedurePanel.appendChild(fragment);
    }

    // Validate if a player action follows procedure
    validateProcedureAction(action, procedureType, expectedStep) {
        if (!this.policeProcedures[procedureType] || !this.policeProcedures[procedureType].active) {
            return true; // No active procedure, so no validation needed
        }
        
        // Find the first uncompleted step
        const nextStep = this.policeProcedures[procedureType].steps.find(step => !step.completed);
        
        // If the action matches the expected next step
        if (nextStep && nextStep.id === expectedStep) {
            return true;
        }
        
        // Show error message for incorrect procedure
        this.showDialog("You need to follow proper police procedure!");
        return false;
    }

    // Add score tracking
    addScore(points) {
        this.score += points;
        this.updateScoreUI();
    }
    
    updateScoreUI() {
        const scoreElement = document.getElementById('score-display');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}`;
        }
    }
    
    // Performance monitoring
    updatePerformanceStats() {
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        const fps = Math.round((this.frameCount * 1000) / elapsed);
        
        console.log(`FPS: ${fps}, Objects: ${this.engine.collisionObjects?.length || 0}`);
        
        this.frameCount = 0;
        this.lastFrameTime = now;
    }
    
    // Scene transition with optimization
    changeScene(sceneName, playerX = 400, playerY = 350) {
        if (!this.engine || !GAME_DATA.scenes[sceneName]) return;
        
        // Save current scene state if needed
        // this.saveSceneState(this.currentScene);
        
        // Clear any existing objects
        this.spatialGrid.clear();
        
        // Reset object pools
        this.particlePool.reset();
        
        // Load new scene
        this.currentScene = sceneName;
        this.engine.loadScene(sceneName);
        
        // Position player
        this.engine.playerPosition = { x: playerX, y: playerY };
        
        // Update UI if needed
        this.updateCaseInfo();
    }
    
    // Resource cleanup
    dispose() {
        // Clear any references or timers
        this.engine = null;
        this.spatialGrid = null;
        this.particlePool = null;
        
        // Clear DOM references
        this.dialogBox = null;
        this.caseInfoPanel = null;
        this.inventoryPanel = null;
        
        console.log("Game resources disposed");
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        if (!this.loadingScreen) {
            this.loadingScreen = document.createElement('div');
            this.loadingScreen.className = 'loading-screen';
            this.loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="spinner"></div>
                    <div class="loading-text">Loading game...</div>
                </div>
            `;
            document.body.appendChild(this.loadingScreen);
            
            // Add CSS for loading screen
            const style = document.createElement('style');
            style.textContent = `
                .loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }
                .loading-content {
                    text-align: center;
                    color: white;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #333;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        this.loadingScreen.style.display = 'flex';
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }
    }

    /**
     * Show error screen
     * @param {Error|string} error - Error to display
     */
    showErrorScreen(error) {
        if (!this.errorScreen) {
            this.errorScreen = document.createElement('div');
            this.errorScreen.className = 'error-screen';
            this.errorScreen.innerHTML = `
                <div class="error-content">
                    <h2>Error</h2>
                    <div class="error-message"></div>
                    <button class="retry-button">Retry</button>
                </div>
            `;
            document.body.appendChild(this.errorScreen);
            
            // Add CSS for error screen
            const style = document.createElement('style');
            style.textContent = `
                .error-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .error-content {
                    background: #ff3333;
                    padding: 20px;
                    border-radius: 5px;
                    text-align: center;
                    color: white;
                    max-width: 80%;
                }
                .retry-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
            
            // Add retry handler
            const retryButton = this.errorScreen.querySelector('.retry-button');
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Update error message
        const messageElement = this.errorScreen.querySelector('.error-message');
        messageElement.textContent = error.message || error.toString();
        
        this.errorScreen.style.display = 'flex';
    }

    // Add the missing initializeGameState method
    initializeGameState() {
        // Initialize game state with default values
        this.gameState = this.gameState || {
            inventory: [],
            currentCase: GAME_DATA.cases.case1
        };
        
        // Initialize spatial grid for more efficient collision detection
        this.spatialGrid = new SpatialGrid(800, 600, 50);
        
        // Initialize object pool for particles or other frequently created objects
        this.particlePool = new ObjectPool(() => ({ x: 0, y: 0, active: false }));
        
        // Cache UI elements for better performance
        this.cacheUIElements();
    }

    // Add the missing startPerformanceMonitoring method
    startPerformanceMonitoring() {
        if (!this.engine?.debugMode) return;
        
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        // Set up performance monitoring interval
        setInterval(() => {
            const now = performance.now();
            const elapsed = now - this.lastFrameTime;
            this.metrics.fps = Math.round((this.frameCount * 1000) / elapsed);
            
            if (this.frameCount > 0) {
                console.log(`FPS: ${this.metrics.fps}, Objects: ${this.engine?.collisionObjects?.length || 0}`);
            }
            
            this.frameCount = 0;
            this.lastFrameTime = now;
        }, 1000);
    }
    
    // Initialize game when DOM is loaded
    static init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', Game._initInstance);
        } else {
            // DOM already loaded, initialize immediately
            Game._initInstance();
        }
    }
    
    // Private static method to avoid duplicate function creation
    static _initInstance() {
        console.log("DOM fully loaded");
        try {
            const game = new Game();
            game.initGame().then(() => {
                window.game = game;
            });
        } catch (error) {
            console.error("Failed to initialize game:", error);
        }
    }
}

// Process interaction function - optimized
function processInteraction(sceneName, hotspotName) {
    const scene = window.GAME_DATA?.scenes[sceneName];
    if (!scene) return false;
    
    const hotspot = scene.hotspots.find(h => h.name === hotspotName);
    if (!hotspot) {
        console.log('Hotspot not found.');
        return false;
    }

    const result = window.GameEngine.handleInteraction(hotspot, window.GAME_DATA.inventory);
    if (result && hotspot.interaction === 'search') {
        // Example: Add found item to inventory
        if (result.includes('key')) {
            window.GameEngine.addToInventory('key');
        }
    }
    
    return true;
}

// Global function for HTML onclick handlers
function dismissCaseInfo() {
    if (window.gameEngine) {
        window.gameEngine.dismissCaseInfo();
    }
}

// Global debug toggle function
function toggleDebug() {
    if (window.gameDebugger) {
        window.gameDebugger.toggleDebugPanel();
    }
}

// Export the process interaction function
window.Game = {
    ...window.Game,
    processInteraction
};

// Initialize game
Game.init();

// Enhanced error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    const errorDetails = {
        message: msg,
        url: url,
        line: lineNo,
        column: columnNo,
        stack: error?.stack || 'No stack trace'
    };
    
    console.error('Game error:', errorDetails);
    
    // Display user-friendly error message
    const dialogBox = document.getElementById('dialog-box');
    if (dialogBox) {
        dialogBox.innerText = "Sorry, an error occurred. Please try refreshing the page.";
        dialogBox.style.display = 'block';
    }
    
    return false;
};

// Add debugging code
window.debugCollisions = function() {
    if (window.gameEngine) {
        const collisions = window.gameEngine.getSceneCollisionObjects();
        console.log('Current scene collision objects:', collisions);
    }
};

// Add debugging code for door testing
window.testDoorTransition = function(doorId) {
    if (!window.gameEngine) {
        console.error('Game engine not initialized');
        return;
    }
    
    const scene = window.gameEngine.currentScene;
    const hotspots = window.GAME_DATA?.scenes?.[scene]?.hotspots || [];
    const doorHotspot = hotspots.find(h => h.id === doorId);
    
    if (doorHotspot) {
        console.log('Testing door:', doorHotspot);
        window.gameEngine.processHotspotInteraction(doorHotspot, 'use');
    } else {
        console.error(`Door with ID "${doorId}" not found in current scene`);
    }
};
