// Remove the import statement as the engine is defined as a global class
// import GameEngine from './engine.js'; <- This line causes the error

const GAME_DATA = {
    scenes: {
        policeStation: {
            background: '',
            music: 'station_theme',
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
                    x: 700,  // Updated to match new door position
                    y: 180,  // Updated to match wall height
                    width: 60,
                    height: 120,
                    interactions: {
                        look: "The Sheriff's office. The door is slightly ajar.",
                        use: "You enter the Sheriff's office.",
                        talk: "There's no one at the door to talk to."
                    }
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
                    }
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
        this.currentScene = 'officeArea';
        
        // Use object pooling where appropriate
        this.particlePool = null;
        this.spatialGrid = null;
        
        // Dialog element caching for better performance
        this.dialogBox = null;
        
        // Performance optimization
        this.lastFrameTime = 0;
        this.frameCount = 0;
    }

    async initGame() {
        console.log('Initializing game...');
        
        try {
            // Initialize sound first and wait for it
            this.soundManager = new SoundManager();
            await this.soundManager.initialize();
            window.soundManager = this.soundManager;

            // Initialize game engine - using global GameEngine class
            // Wait to make sure the GameEngine class is available
            if (typeof window.GameEngine === 'undefined') {
                console.error('GameEngine not found! Make sure engine.js is loaded before game.js');
                throw new Error('GameEngine not found');
            }
            
            this.engine = new window.GameEngine();
            window.gameEngine = this.engine;
            
            // Initialize utility components if needed
            this.spatialGrid = new SpatialGrid(800, 600, 100);
            this.particlePool = new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 }), 100);
            
            // Cache DOM elements
            this.dialogBox = document.getElementById('dialog-box');
            this.caseInfoPanel = document.getElementById('case-info');
            this.inventoryPanel = document.getElementById('inventory-panel');
            
            // Setup UI elements
            this.setupUI();
            
            console.log('Game engine ready, starting game...');
            this.startGame();
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        }
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

// Export the process interaction function
window.Game = {
    ...window.Game,
    processInteraction
};

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    try {
        const game = new Game();
        game.initGame();
        window.game = game; // Make game instance globally available
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});

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
