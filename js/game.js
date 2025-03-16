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

class Game {
    constructor(engine) {
        this.engine = engine;
        this.currentCase = null;
        this.evidence = new Set();
        this.gameState = {
            currentLocation: 'policeStation',
            solvedCases: 0,
            reputation: 0,
            inventory: []
        };
        // Performance optimization - cache frequently used data
        this.caseCache = new Map();
    }

    startCase(caseId) {
        // Check cache first
        if (this.caseCache.has(caseId)) {
            this.currentCase = this.caseCache.get(caseId);
        } else {
            // Create a deep copy to prevent modifying the original data
            this.currentCase = JSON.parse(JSON.stringify(GAME_DATA.cases[caseId]));
            this.caseCache.set(caseId, this.currentCase);
        }
        soundManager.playMusic('case_start');
        return this.currentCase;
    }

    collectEvidence(evidenceId) {
        if (!this.currentCase) return false;
        
        if (!this.currentCase.evidence.includes(evidenceId)) {
            this.currentCase.evidence.push(evidenceId);
            soundManager.playSound('evidence');
            // Save game state after collecting evidence
            this.saveGame();
            return true;
        }
        return false;
    }

    completeStage(stageId) {
        if (!this.currentCase) return false;
        
        const stage = this.currentCase.stages.find(s => s.id === stageId);
        if (stage && !stage.completed) {
            stage.completed = true;
            this.gameState.reputation += 10;
            soundManager.playSound('success');
            // Save game state after completing a stage
            this.saveGame();
            return true;
        }
        return false;
    }

    checkCaseSolved() {
        if (!this.currentCase) return false;
        
        const allStagesCompleted = this.currentCase.stages.every(stage => stage.completed);
        if (allStagesCompleted) {
            this.gameState.solvedCases++;
            // Save game after solving a case
            this.saveGame();
            return true;
        }
        return false;
    }

    changeLocation(sceneId) {
        this.gameState.currentLocation = sceneId;
        this.engine.loadScene(sceneId);
        // Save game state after location change
        this.saveGame();
    }

    addToInventory(itemId) {
        if (!this.gameState.inventory.includes(itemId)) {
            this.gameState.inventory.push(itemId);
            // Save game state after inventory update
            this.saveGame();
            return true;
        }
        return false;
    }

    // Save game state to localStorage
    saveGame() {
        try {
            const saveData = {
                gameState: this.gameState,
                currentCase: this.currentCase,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('digitalPrecinctSave', JSON.stringify(saveData));
            console.log("Game saved:", new Date().toLocaleTimeString());
        } catch (e) {
            console.error("Failed to save game:", e);
        }
    }

    // Load game state from localStorage
    loadGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem('digitalPrecinctSave'));
            if (saveData) {
                this.gameState = saveData.gameState;
                this.currentCase = saveData.currentCase;
                if (this.engine) {
                    this.engine.loadScene(this.gameState.currentLocation);
                    this.engine.updateInventoryUI();
                    this.engine.updateCaseInfo();
                    this.engine.showDialog("Game loaded from previous session.");
                }
                return true;
            }
        } catch (e) {
            console.error("Failed to load game:", e);
        }
        return false;
    }

    // Reset game to initial state
    resetGame() {
        this.gameState = {
            currentLocation: 'policeStation',
            solvedCases: 0,
            reputation: 0,
            inventory: []
        };
        this.currentCase = null;
        this.caseCache.clear();
        localStorage.removeItem('digitalPrecinctSave');
        if (this.engine) {
            this.engine.loadScene('policeStation');
            this.engine.updateInventoryUI();
            this.engine.showDialog("Starting a new game.");
            this.startCase('case1');
            this.engine.updateCaseInfo();
        }
    }
}

// Create game instance correctly
const game = new Game(); // Just define it first, but don't initialize with engine yet

// Wait for engine to be created and window to load before connecting objects
window.addEventListener('load', () => {
    // Connect game and engine after both are created
    game.engine = engine;
});

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
