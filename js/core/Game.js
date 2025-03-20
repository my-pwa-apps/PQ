class Game {
    constructor() {
        this.engine = null;
        this.soundManager = null;
        this.gameState = {
            inventory: new Set(),
            currentCase: null // Will be set after data loads
        };
        this.currentScene = 'policeStation';
        this.initialized = false;
        this.initializeGameState();
    }

    initializeGameState() {
        // If GAME_DATA isn't available yet, retry after a short delay
        if (typeof window.GAME_DATA === 'undefined') {
            console.warn("Game data not available yet. Retrying in 100ms...");
            setTimeout(() => this.initializeGameState(), 100);
            return;
        }

        console.log("Game data found, initializing game state");
        // Now we can safely access the game data
        this.gameState.currentCase = window.GAME_DATA.cases.case1;
        this.initialized = true;
    }

    async initGame() {
        console.log('Initializing game...');
        
        try {
            // Initialize sound first and wait for it
            this.soundManager = new SoundManager();
            await this.soundManager.initialize();
            window.soundManager = this.soundManager;

            // Initialize game engine
            this.engine = new GameEngine();
            window.gameEngine = this.engine;
            
            // Wait for game state to be initialized if it hasn't yet
            if (!this.initialized) {
                await new Promise(resolve => {
                    const checkInitialized = () => {
                        if (this.initialized) {
                            resolve();
                        } else {
                            setTimeout(checkInitialized, 100);
                        }
                    };
                    checkInitialized();
                });
            }
            
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
        const caseInfoPanel = document.getElementById('case-info');
        if (!caseInfoPanel || !this.gameState.currentCase) return;

        let caseHTML = `<h3>${this.gameState.currentCase.title}</h3>`;
        caseHTML += '<p>Case stages:</p>';
        caseHTML += '<ul>';
        
        this.gameState.currentCase.stages.forEach(stage => {
            caseHTML += `<li>${stage.description} ${stage.completed ? '✓' : ''}</li>`;
        });
        
        caseHTML += '</ul>';
        caseInfoPanel.innerHTML = caseHTML;
    }

    updateInventoryUI() {
        const inventoryPanel = document.getElementById('inventory-panel');
        if (!inventoryPanel) return;
        
        // Clear existing inventory display
        inventoryPanel.innerHTML = '';
        
        // Add each inventory item
        this.gameState.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerText = item.substring(0, 2).toUpperCase();
            itemElement.title = item;
            itemElement.addEventListener('click', () => {
                this.showDialog(`Selected item: ${item}`);
                this.soundManager?.playSound('click');
            });
            inventoryPanel.appendChild(itemElement);
        });
    }

    showDialog(text) {
        this.dialogManager.show(text);
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
        if (!this.gameState.inventory) {
            this.gameState.inventory = new Set();
        }
        this.gameState.inventory.add(item);
        this.updateInventoryUI();
    }

    collectEvidence(evidence) {
        if (!this.gameState.currentCase.evidence) {
            this.gameState.currentCase.evidence = [];
        }
        this.gameState.currentCase.evidence.push(evidence);
    }
}

// Then handle DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    const game = new Game();
    window.game = game; // Make game instance globally available

    // Only call initGame when we're sure the data is available
    if (typeof window.GAME_DATA !== 'undefined') {
        game.initGame();
    } else {
        console.log("Waiting for game data to load before initializing game...");
        const waitForGameData = setInterval(() => {
            if (typeof window.GAME_DATA !== 'undefined') {
                clearInterval(waitForGameData);
                game.initGame();
            }
        }, 100);
    }
});

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};