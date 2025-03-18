const GAME_DATA = {
    scenes: {
        policeStation: {
            background: '',
            music: 'station_theme',
            hotspots: [
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
                    y: 220,
                    width: 30,
                    height: 20,
                    interactions: {
                        look: "Case file for the downtown burglaries. Contains witness statements and initial findings.",
                        use: "You open the case file and begin reviewing the details.",
                        take: "You add the case file to your inventory."
                    }
                },
                {
                    id: 'sheriffsOfficeDoor',
                    x: 50,
                    y: 100,
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "The Sheriff's office. The door is slightly ajar.",
                        use: "You enter the Sheriff's office.",
                        talk: "There's no one at the door to talk to.",
                        take: "You can't take a door."
                    }
                },
                {
                    id: 'briefingRoomDoor',
                    x: 600,
                    y: 100, 
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "The door to the briefing room. Daily meetings are held here.",
                        use: "You enter the briefing room.",
                        talk: "There's no one at the door to talk to.",
                        take: "You can't take a door."
                    }
                }
            ]
        },
        downtown: {
            background: '',
            music: 'downtown_theme',
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
                    height: 5,
                    interactions: {
                        look: "A case file from 1985 about a series of electronics store burglaries.",
                        use: "You review the file and notice the burglar used the same entry technique as your current case.",
                        take: "You take the file to compare with your current case."
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
                    }
                }
            ]
        },
        briefingRoom: {
            background: '',
            music: 'station_theme',
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
                    }
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

class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill().map(() => new Set());
    }

    getCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
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
                for (const obj of cell) {
                    nearby.add(obj);
                }
            }
        }
        return nearby;
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
}

class Game {
    constructor() {
        this.gameState = {
            inventory: new Set(),
            currentCase: null,
            evidence: new Set(),
            completedStages: new Set(),
            flags: new Map()
        };
        
        // Use WeakMap for NPC state to allow garbage collection
        this.npcState = new WeakMap();
        
        // Cache DOM elements
        this.domElements = new Map();
        
        // Performance optimization for frequent checks
        this.lastInteractionTime = 0;
        this.interactionCooldown = 300; // ms
        
        // Initialize game data
        this.initializeGameData();

        this.spatialGrid = new SpatialGrid(this.width, this.height, 64);
        this.setupObjectPools();

        // Sprite cache
        this.spriteCache = new Map();
        
        // Spatial partitioning grid
        this.grid = {
            cellSize: 32,
            cells: new Map(),
            dirty: true
        };
        
        this.objectPool = new ObjectPool();
        this.init();

        // Object pooling
        this.objectPools = new Map();
        
        // Spatial partitioning
        this.gridSize = 64; // Size of each grid cell
        this.spatialGrid = new Map();

        // Performance monitoring
        this.lastUpdateTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 1000;

        // Define static item positions to prevent movement
        this.staticItems = {
            desk: {
                items: [
                    { x: 420, y: 330, type: 'computer' },
                    { x: 460, y: 325, type: 'phone' },
                    { x: 500, y: 330, type: 'papers' }
                ],
                bounds: { x: 400, y: 320, width: 150, height: 80 }
            },
            wall: {
                items: [
                    { x: 280, y: 50, type: 'board', width: 120, height: 80, zIndex: 1 },
                    { x: 450, y: 40, type: 'badge', width: 60, height: 60, zIndex: 2 },
                    { x: 600, y: 50, type: 'clock', width: 50, height: 50, zIndex: 1 }
                ]
            }
        };

        // Fixed NPC patrol routes that avoid desk
        this.npcRoutes = {
            policeStation: [
                {
                    points: [
                        {x: 200, y: 350},
                        {x: 300, y: 350},
                        {x: 300, y: 400}
                    ],
                    avoidAreas: [this.staticItems.desk.bounds]
                },
                {
                    points: [
                        {x: 500, y: 350},
                        {x: 600, y: 350},
                        {x: 600, y: 400}
                    ],
                    avoidAreas: [this.staticItems.desk.bounds]
                }
            ]
        };
    }

    init() {
        this.setupSpriteCache();
        this.initializeGrid();
    }

    setupSpriteCache() {
        // Pre-render common sprites to off-screen canvases
        const commonSprites = ['player', 'wall', 'floor', 'item'];
        for (const sprite of commonSprites) {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            this.drawSprite(ctx, sprite, 0, 0);
            this.spriteCache.set(sprite, canvas);
        }
    }

    initializeGrid() {
        this.grid.cells.clear();
        this.updateSpatialGrid();
    }

    initializeGameData() {
        this.cases = [{
            id: 'case1',
            title: 'The Missing Evidence',
            description: 'Important evidence has gone missing from the evidence locker.',
            stages: [
                { id: 'review', description: 'Review case file', completed: false },
                { id: 'interview', description: 'Interview witnesses', completed: false },
                { id: 'evidence', description: 'Collect evidence', completed: false },
                { id: 'downtown', description: 'Investigate downtown', completed: false },
                { id: 'suspect', description: 'Question suspect', completed: false }
            ],
            requiredEvidence: ['tool', 'document', 'photo']
        }];
        
        this.currentCase = this.cases[0];
        this.gameState.currentCase = this.currentCase;
    }

    setupObjectPools() {
        // Example pool for particles or other frequently created objects
        this.particlePool = new ObjectPool(() => ({
            x: 0, y: 0, velocityX: 0, velocityY: 0, life: 0
        }));
    }

    addToInventory(item) {
        if (!item) return false;
        
        // Throttle inventory updates
        const now = performance.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) return false;
        
        this.lastInteractionTime = now;
        this.gameState.inventory.add(item);
        this.updateUI();
        return true;
    }

    removeFromInventory(item) {
        const result = this.gameState.inventory.delete(item);
        if (result) this.updateUI();
        return result;
    }

    collectEvidence(evidence) {
        if (!evidence) return false;
        this.gameState.evidence.add(evidence);
        return true;
    }

    completeStage(stageId) {
        const stage = this.currentCase.stages.find(s => s.id === stageId);
        if (stage && !stage.completed) {
            stage.completed = true;
            this.gameState.completedStages.add(stageId);
            this.checkCaseSolved();
            return true;
        }
        return false;
    }

    checkCaseSolved() {
        if (!this.currentCase) return false;
        
        // Check if all required evidence is collected
        const hasAllEvidence = this.currentCase.requiredEvidence.every(
            evidence => this.gameState.evidence.has(evidence)
        );
        
        // Check if all stages are completed
        const allStagesCompleted = this.currentCase.stages.every(
            stage => stage.completed
        );
        
        return hasAllEvidence && allStagesCompleted;
    }

    // Optimized UI updates using requestAnimationFrame
    updateUI() {
        if (this.updatePending) return;
        
        this.updatePending = true;
        requestAnimationFrame(() => {
            this.updatePending = false;
            this.updateInventoryUI();
            this.updateCaseInfo();
        });
    }

    updateInventoryUI() {
        const inventoryPanel = this.getDomElement('inventory-panel');
        if (!inventoryPanel) return;
        
        const fragment = document.createDocumentFragment();
        this.gameState.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.textContent = item.substring(0, 2).toUpperCase();
            itemElement.title = item;
            fragment.appendChild(itemElement);
        });
        
        inventoryPanel.innerHTML = '';
        inventoryPanel.appendChild(fragment);
    }

    updateCaseInfo() {
        const caseInfoPanel = this.getDomElement('case-info');
        if (!caseInfoPanel || !this.currentCase) return;
        
        const fragment = document.createDocumentFragment();
        
        const title = document.createElement('h3');
        title.textContent = this.currentCase.title;
        fragment.appendChild(title);
        
        const stagesList = document.createElement('ul');
        this.currentCase.stages.forEach(stage => {
            const li = document.createElement('li');
            li.textContent = `${stage.description} ${stage.completed ? '✓' : ''}`;
            stagesList.appendChild(li);
        });
        fragment.appendChild(stagesList);
        
        caseInfoPanel.innerHTML = '';
        caseInfoPanel.appendChild(fragment);
    }

    // Cache DOM elements for better performance
    getDomElement(id) {
        if (!this.domElements.has(id)) {
            const element = document.getElementById(id);
            if (element) {
                this.domElements.set(id, element);
            }
        }
        return this.domElements.get(id);
    }

    // Save/Load game state
    saveGame() {
        try {
            const saveData = {
                inventory: Array.from(this.gameState.inventory),
                evidence: Array.from(this.gameState.evidence),
                completedStages: Array.from(this.gameState.completedStages),
                flags: Object.fromEntries(this.gameState.flags),
                currentCaseId: this.currentCase?.id
            };
            
            localStorage.setItem('gameState', JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem('gameState'));
            if (!saveData) return false;
            
            this.gameState.inventory = new Set(saveData.inventory);
            this.gameState.evidence = new Set(saveData.evidence);
            this.gameState.completedStages = new Set(saveData.completedStages);
            this.gameState.flags = new Map(Object.entries(saveData.flags));
            
            if (saveData.currentCaseId) {
                this.currentCase = this.cases.find(c => c.id === saveData.currentCaseId);
                this.gameState.currentCase = this.currentCase;
            }
            
            this.updateUI();
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            return false;
        }
    }

    // Object pooling methods
    getFromPool(type) {
        if (!this.objectPools.has(type)) {
            this.objectPools.set(type, []);
        }
        
        const pool = this.objectPools.get(type);
        return pool.pop() || this.createObject(type);
    }

    returnToPool(obj) {
        const type = obj.constructor.name;
        if (!this.objectPools.has(type)) {
            this.objectPools.set(type, []);
        }
        
        obj.reset();
        this.objectPools.get(type).push(obj);
    }

    // Spatial partitioning methods
    getGridCell(x, y) {
        return `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
    }

    updateSpatialGrid() {
        this.spatialGrid.clear();
        
        for (const obj of this.gameObjects) {
            const cell = this.getGridCell(obj.x, obj.y);
            if (!this.spatialGrid.has(cell)) {
                this.spatialGrid.set(cell, new Set());
            }
            this.spatialGrid.get(cell).add(obj);
        }
    }

    getNearbyObjects(x, y, radius = this.gridSize) {
        const nearby = new Set();
        const startCell = this.getGridCell(x - radius, y - radius);
        const endCell = this.getGridCell(x + radius, y + radius);
        
        for (let gridX = startCell[0]; gridX <= endCell[0]; gridX++) {
            for (let gridY = startCell[1]; gridY <= endCell[1]; gridY++) {
                const cell = `${gridX},${gridY}`;
                if (this.spatialGrid.has(cell)) {
                    for (const obj of this.spatialGrid.get(cell)) {
                        nearby.add(obj);
                    }
                }
            }
        }
        
        return nearby;
    }

    update(deltaTime) {
        // Update game objects
        for (const obj of this.gameObjects) {
            obj.update(deltaTime);
        }
        
        // Update spatial grid
        this.updateSpatialGrid();
        
        // Optimized collision detection using spatial partitioning
        for (const obj of this.gameObjects) {
            if (obj.checkCollisions) {
                const nearby = this.getNearbyObjects(obj.x, obj.y);
                for (const other of nearby) {
                    if (obj !== other && this.checkCollision(obj, other)) {
                        obj.onCollision(other);
                    }
                }
            }
        }
        
        // Clean up destroyed objects and return them to pool
        this.gameObjects = this.gameObjects.filter(obj => {
            if (obj.destroyed) {
                this.returnToPool(obj);
                return false;
            }
            return true;
        });

        // Performance monitoring
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastUpdateTime >= this.fpsUpdateInterval) {
            const fps = (this.frameCount * 1000) / (currentTime - this.lastUpdateTime);
            console.log(`FPS: ${Math.round(fps)}`);
            this.frameCount = 0;
            this.lastUpdateTime = currentTime;
        }
    }

    checkCollision(obj1, obj2) {
        // Basic AABB collision detection
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj2.height > obj2.y;
    }

    drawSprite(ctx, spriteName, x, y) {
        const cachedSprite = this.spriteCache.get(spriteName);
        if (cachedSprite) {
            ctx.drawImage(cachedSprite, x, y);
        } else {
            // Fallback to original sprite drawing
            // ...existing sprite drawing code...
        }
    }

    // Update NPC movement to respect boundaries and fixed paths
    updateNPCs() {
        if (!this.currentScene || !this.npcRoutes[this.currentScene]) return;
        
        this.npcs[this.currentScene].forEach((npc, index) => {
            const route = this.npcRoutes[this.currentScene][index % this.npcRoutes[this.currentScene].length];
            if (!route) return;

            const currentTarget = route.points[npc.currentPatrolPoint];
            if (!currentTarget) return;

            const dx = currentTarget.x - npc.x;
            const dy = currentTarget.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if NPC would collide with desk or other static items
            const nextX = npc.x + (dx / distance) * 2;
            const nextY = npc.y + (dy / distance) * 2;

            let collision = false;
            route.avoidAreas.forEach(area => {
                if (nextX >= area.x && nextX <= area.x + area.width &&
                    nextY >= area.y && nextY <= area.y + area.height) {
                    collision = true;
                }
            });

            if (!collision) {
                if (distance < 2) {
                    // Move to next patrol point
                    npc.currentPatrolPoint = (npc.currentPatrolPoint + 1) % route.points.length;
                } else {
                    // Move towards current target
                    npc.x = nextX;
                    npc.y = nextY;
                }
            }
        });
    }

    // Ensure static items remain fixed
    drawStaticItems(scene) {
        if (scene === 'policeStation') {
            // Draw desk items in fixed positions
            this.staticItems.desk.items.forEach(item => {
                switch(item.type) {
                    case 'computer':
                        this.drawComputer(item.x, item.y);
                        break;
                    case 'phone':
                        this.drawPhone(item.x, item.y);
                        break;
                    case 'papers':
                        this.drawPapers(item.x, item.y);
                        break;
                }
            });

            // Draw wall items with proper z-indexing
            this.staticItems.wall.items
                .sort((a, b) => a.zIndex - b.zIndex)
                .forEach(item => {
                    switch(item.type) {
                        case 'board':
                            this.drawBulletinBoard(item.x, item.y, item.width, item.height);
                            break;
                        case 'badge':
                            this.drawPoliceBadge(item.x, item.y, item.width, item.height);
                            break;
                        case 'clock':
                            this.drawWallClock(item.x, item.y, item.width, item.height);
                            break;
                    }
                });
        }
    }

    initPoliceStation() {
        // Define fixed positions for desk items
        this.staticItems.desk = {
            items: [
                { type: 'computer', x: 320, y: 180, fixed: true },
                { type: 'papers', x: 280, y: 185, fixed: true },
                { type: 'phone', x: 370, y: 185, fixed: true },
                { type: 'coffee', x: 400, y: 185, fixed: true }
            ]
        };

        // Define NPC paths that avoid the desk area
        this.npcs.policeStation = [
            {
                id: 'officer1',
                x: 100,
                y: 250,
                path: [
                    { x: 100, y: 250 },
                    { x: 200, y: 250 },
                    { x: 200, y: 300 },
                    { x: 100, y: 300 }
                ],
                speed: 1
            },
            {
                id: 'receptionist',
                isReceptionist: true,
                x: 320,
                y: 200,
                facing: 'south',
                fixed: true
            }
        ];

        // Set desk area as no-walk zone
        this.noWalkZones.push({
            x: 260,
            y: 170,
            width: 200,
            height: 80
        });
    }

    moveNPCAlongPath(npc) {
        if (!npc.path || npc.fixed) return;
        
        // Move NPC along defined path while avoiding no-walk zones
        const currentPoint = npc.path[npc.currentPathIndex || 0];
        const dx = currentPoint.x - npc.x;
        const dy = currentPoint.y - npc.y;
        
        if (Math.abs(dx) < npc.speed && Math.abs(dy) < npc.speed) {
            npc.currentPathIndex = ((npc.currentPathIndex || 0) + 1) % npc.path.length;
        } else {
            const angle = Math.atan2(dy, dx);
            npc.x += Math.cos(angle) * npc.speed;
            npc.y += Math.sin(angle) * npc.speed;
        }
    }
}

// Export game instance
window.game = new Game();

// Add load/save keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+S to save game
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        game.saveGame();
        if (engine && engine.showDialog) {
            engine.showDialog("Game saved successfully!");
        }
    }
    
    // Ctrl+L to load game
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        if (game.loadGame()) {
            if (engine && engine.showDialog) {
                engine.showDialog("Game loaded successfully!");
            }
        }
    }
    
    // Ctrl+N for new game
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (confirm("Start a new game? All progress will be lost.")) {
            game.resetGame();
        }
    }
});

// Use window.engine instead of direct engine reference
window.addEventListener('DOMContentLoaded', () => {
    if (typeof window.engine === 'undefined') {
        throw new Error('GameEngine must be initialized before game setup');
    }
    // Your game.js initialization code here
});
