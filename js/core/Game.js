class Game {
    constructor() {
        this.engine = null;
        this.soundManager = null;
        this.dialogManager = null;
        this.sceneManager = null;
        this.gameState = {
            inventory: new Set(),
            currentCase: null // Will be initialized after GAME_DATA is available
        };
        this.currentScene = 'policeStation';
        
        // Initialize the game state if GAME_DATA is available
        if (window.GAME_DATA) {
            this.gameState.currentCase = window.GAME_DATA.cases.case1;
        }
        
        // Prevent duplicate event listeners
        this._boundHandlers = new Map();
    }

    async initGame() {
        console.log('Initializing game...');
        
        try {
            // Check for required dependencies
            if (typeof GAME_DATA === 'undefined') {
                throw new Error('Game data not available');
            }
            
            // Initialize game state with data
            this.gameState.currentCase = GAME_DATA.cases.case1;
            
            // Create UI managers first
            this.dialogManager = new DialogManager();
            if (window.SceneManager) {
                this.sceneManager = new SceneManager(this);
            }
            
            // Initialize sound manager safely
            if (window.SoundManager) {
                this.soundManager = window.soundManager || new SoundManager();
                window.soundManager = this.soundManager;
                await this.soundManager.initialize();
            } else {
                console.warn('SoundManager not available');
            }

            // Initialize game engine
            if (window.GameEngine) {
                this.engine = new GameEngine();
                window.gameEngine = this.engine;
            } else {
                throw new Error('GameEngine not available');
            }
            
            // Setup UI elements and interactions after engine is ready
            this.setupUI();
            
            console.log('Game engine ready, starting game...');
            this.startGame();
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showErrorMessage(`Game initialization failed: ${error.message}`);
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
    
    // Centralize dialog showing through DialogManager
    showDialog(text) {
        if (this.dialogManager) {
            this.dialogManager.show(text);
        } else {
            // Fallback
            const dialogBox = document.getElementById('dialog-box');
            if (dialogBox && text) {
                dialogBox.innerText = text;
                dialogBox.style.display = 'block';
                
                setTimeout(() => {
                    dialogBox.style.display = 'none';
                }, 5000);
            }
        }
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

    // Add proper cleanup
    destroy() {
        // Stop and remove all subsystems
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
        
        // Remove event listeners
        this._boundHandlers.forEach((handler, event) => {
            document.removeEventListener(event, handler);
        });
        
        // Clear game state
        this.gameState.inventory.clear();
    }
    
    // Show user-friendly error message
    showErrorMessage(message) {
        // Create error overlay if needed
        const errorBox = document.getElementById('error-message') || 
                         this.createErrorElement();
        
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }
    
    createErrorElement() {
        const errorBox = document.createElement('div');
        errorBox.id = 'error-message';
        errorBox.style.cssText = 'position:absolute;top:10px;left:10px;right:10px;background:rgba(255,0,0,0.8);color:white;padding:10px;z-index:1000;';
        document.body.appendChild(errorBox);
        return errorBox;
    }
}

// Make Game class globally available
window.Game = Game;

// Then handle DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    
    // Ensure GAME_DATA is defined before creating game
    if (typeof GAME_DATA === 'undefined') {
        console.error("GAME_DATA is not defined. Make sure GameData.js is loaded first.");
        return;
    }
    
    try {
        const game = new Game();
        window.game = game; // Make game instance globally available
        game.initGame().catch(error => {
            console.error("Game initialization failed:", error);
        });
    } catch (error) {
        console.error("Failed to create game instance:", error);
    }
});

// Improved error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error(`Error: ${msg}\nURL: ${url}\nLine: ${lineNo}\nColumn: ${columnNo}\nError object: ${JSON.stringify(error)}`);
    
    // Show user-friendly error
    if (window.game) {
        window.game.showErrorMessage(`Something went wrong. Please refresh the page.`);
    }
    
    return false;
};