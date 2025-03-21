/**
 * DialogManager.js
 * Sierra-style dialogue system for Police Quest
 */
class DialogManager {
    constructor() {
        this.dialogElement = document.getElementById('dialog-text');
        this.dialogContainer = document.getElementById('dialog-box');
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.id = 'dialog-options';
        this.dialogContainer.appendChild(this.optionsContainer);
        
        this.currentDialogQueue = [];
        this.typingSpeed = 30; // ms per character, Sierra-style typing speed
        this.isTyping = false;
        this.currentTimeout = null;
        this.parser = null;
        
        this.currentDialogTree = null;
        this.currentDialogId = null;
        
        this.initializeParser();
        this.createDialogClickListener();
    }

    initializeParser() {
        // Initialize text parser for Sierra-style commands
        this.parser = {
            verbs: ['look', 'talk', 'use', 'take', 'open', 'close', 'give', 'show', 'move', 'push', 'pull', 'inventory'],
            nouns: ['door', 'badge', 'gun', 'desk', 'computer', 'office', 'car', 'evidence', 'person', 'officer', 'suspect'],
            prepositions: ['to', 'with', 'on', 'in', 'under', 'behind', 'about']
        };
        
        // Create parser input if it doesn't exist
        if (!document.querySelector('.parser-input')) {
            const uiContainer = document.getElementById('ui-container');
            
            if (uiContainer) {
                const parserInput = document.createElement('input');
                parserInput.type = 'text';
                parserInput.className = 'parser-input';
                parserInput.placeholder = 'Enter command: (e.g., "look badge" or "talk to officer")';
                parserInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.parseCommand(e.target.value);
                        e.target.value = '';
                    }
                });
                
                // Add it to the UI container
                uiContainer.appendChild(parserInput);
            }
        }
    }

    createDialogClickListener() {
        // Allow clicking on dialog to advance text, Sierra style
        if (this.dialogContainer) {
            this.dialogContainer.addEventListener('click', () => {
                if (this.isTyping) {
                    // Skip typing animation and show full text
                    if (this.currentTimeout) {
                        clearTimeout(this.currentTimeout);
                        this.currentTimeout = null;
                    }
                    
                    if (this.currentDialogQueue.length > 0 && this.dialogElement) {
                        this.dialogElement.textContent = this.currentDialogQueue[0];
                        this.currentDialogQueue.shift();
                        this.isTyping = false;
                        
                        // If there are more messages, continue after a short pause
                        if (this.currentDialogQueue.length > 0) {
                            setTimeout(() => this.showNextDialog(), 500);
                        }
                    }
                } else if (this.currentDialogQueue.length > 0) {
                    // Show next dialog in queue
                    this.showNextDialog();
                }
            });
        }
    }

    /**
     * Start a dialog tree conversation
     * @param {string} dialogId - The ID of the dialog tree in GAME_DATA
     */
    startDialog(dialogId) {
        if (!window.GAME_DATA || !window.GAME_DATA.dialogs || !window.GAME_DATA.dialogs[dialogId]) {
            this.showDialog("Error: Dialog not found.");
            return;
        }
        
        this.currentDialogTree = window.GAME_DATA.dialogs[dialogId];
        this.currentDialogId = dialogId;
        
        // Start with the first dialog entry
        this.showDialogNode(0);
    }
    
    /**
     * Display a specific node in the current dialog tree
     * @param {number} nodeIndex - Index of the dialog node to display
     */
    showDialogNode(nodeIndex) {
        if (!this.currentDialogTree || nodeIndex === null) {
            this.endDialog();
            return;
        }
        
        const node = this.currentDialogTree[nodeIndex];
        if (!node) {
            this.endDialog();
            return;
        }
        
        // Show the dialog text with Sierra-style typing effect
        this.showDialog(node.text, false);
        
        // If this node has options, display them after the text finishes
        if (node.options && Array.isArray(node.options)) {
            this.waitForDialogCompletion(() => {
                this.showDialogOptions(node.options);
            });
        } 
        // If this node has a 'next' property, automatically advance to that node
        else if (node.next !== null && node.next !== undefined) {
            this.waitForDialogCompletion(() => {
                // Pause briefly before showing the next node
                setTimeout(() => {
                    this.showDialogNode(node.next);
                }, 1000);
            });
        }
        
        // Handle any special actions or evidence collection
        if (node.addEvidence && window.gameEngine) {
            window.gameEngine.addEvidence(node.addEvidence);
        }
        
        if (node.action && window.gameEngine) {
            window.gameEngine.handleDialogAction(node.action);
        }
    }
    
    /**
     * Display dialog options for player to choose from
     * @param {Array} optionIndices - Array of indices pointing to dialog nodes that are options
     */
    showDialogOptions(optionIndices) {
        // Clear previous options
        this.optionsContainer.innerHTML = '';
        
        // Create a container for the options
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'dialog-options-container';
        
        // Add each option
        optionIndices.forEach(optionIndex => {
            const option = this.currentDialogTree[optionIndex];
            if (!option) return;
            
            const optionButton = document.createElement('button');
            optionButton.className = 'dialog-option';
            optionButton.textContent = option.text;
            
            // Add click handler
            optionButton.addEventListener('click', () => {
                // Hide options
                this.optionsContainer.innerHTML = '';
                
                // Show the chosen option as player text
                this.showDialog(`YOU: ${option.text}`);
                
                // Go to the next node in this option path
                this.waitForDialogCompletion(() => {
                    this.showDialogNode(option.next);
                });
            });
            
            optionsDiv.appendChild(optionButton);
        });
        
        this.optionsContainer.appendChild(optionsDiv);
    }
    
    /**
     * End the current dialog
     */
    endDialog() {
        this.currentDialogTree = null;
        this.currentDialogId = null;
        
        // Hide options
        this.optionsContainer.innerHTML = '';
        
        // Return control to the game
        if (window.gameEngine) {
            window.gameEngine.dialogEnded();
        }
    }
    
    /**
     * Wait for the current dialog text to finish typing before calling the callback
     */
    waitForDialogCompletion(callback) {
        if (this.isTyping) {
            // Check again in a bit
            setTimeout(() => this.waitForDialogCompletion(callback), 500);
        } else {
            callback();
        }
    }

    /**
     * Show dialog text with Sierra-style typewriter effect
     * @param {string} text - The dialog text to display
     * @param {boolean} queue - Whether to queue this dialog if one is already showing
     */
    showDialog(text, queue = true) {
        if (!text || !this.dialogElement) return;
        
        // Add to queue
        this.currentDialogQueue.push(text);
        
        // If we're not already showing text, start showing it
        if (!this.isTyping && this.currentDialogQueue.length === 1) {
            this.showNextDialog();
        }

        // Make sure the dialog container is visible
        if (this.dialogContainer) {
            this.dialogContainer.style.display = 'block';
        }
    }

    /**
     * Shows the next dialog in the queue with typewriter effect
     */
    showNextDialog() {
        if (this.currentDialogQueue.length === 0 || !this.dialogElement) return;
        
        const text = this.currentDialogQueue[0];
        this.isTyping = true;
        this.dialogElement.textContent = '';
        
        let charIndex = 0;
        
        // Sierra-style typing effect
        const typeNextChar = () => {
            if (charIndex < text.length) {
                this.dialogElement.textContent += text.charAt(charIndex);
                charIndex++;
                
                // Play typing sound every few characters for authentic feel
                if (charIndex % 3 === 0 && window.soundManager) {
                    window.soundManager.playSound('typing', 0.2);
                }
                
                // Schedule next character
                this.currentTimeout = setTimeout(typeNextChar, this.typingSpeed);
            } else {
                // Finished typing this message
                this.currentDialogQueue.shift();
                this.isTyping = false;
                
                // If there are more messages, continue after a pause
                if (this.currentDialogQueue.length > 0) {
                    setTimeout(() => this.showNextDialog(), 1500);
                }
            }
        };
        
        // Start typing
        typeNextChar();
    }

    /**
     * Clear the current dialog
     */
    clearDialog() {
        if (!this.dialogElement) return;
        
        this.dialogElement.textContent = '';
        this.currentDialogQueue = [];
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        this.isTyping = false;
        
        // Hide options
        this.optionsContainer.innerHTML = '';
    }

    /**
     * Parse a text command in Sierra adventure style
     * @param {string} command - The command text to parse
     */
    parseCommand(command) {
        if (!command) return;
        
        command = command.toLowerCase().trim();
        
        // Show the command in the dialog box first
        this.showDialog(`> ${command}`);
        
        // Special case for inventory
        if (command === 'inventory' || command === 'i') {
            this.showInventory();
            return;
        }
        
        // Standard command parsing (verb noun)
        const words = command.split(' ');
        let verb = null;
        let noun = null;
        let preposition = null;
        let secondNoun = null;
        
        // Parse the command
        for (const word of words) {
            if (!verb && this.parser.verbs.includes(word)) {
                verb = word;
            } else if (!noun && this.parser.nouns.includes(word)) {
                noun = word;
            } else if (!preposition && this.parser.prepositions.includes(word)) {
                preposition = word;
            } else if (noun && preposition && !secondNoun && this.parser.nouns.includes(word)) {
                secondNoun = word;
            }
        }
        
        // Handle the command
        if (verb) {
            if (noun) {
                // Full command with verb and noun
                this.handleCommand(verb, noun, preposition, secondNoun);
            } else {
                // Just a verb
                this.showDialog(`What do you want to ${verb}?`);
            }
        } else {
            // Could not parse
            this.showDialog("I don't understand that command.");
        }
    }

    /**
     * Handle a parsed command
     */
    handleCommand(verb, noun, preposition = null, secondNoun = null) {
        // Get game engine instance
        const engine = window.gameEngine || window.engine;
        if (!engine) {
            this.showDialog("Game engine not found.");
            return;
        }
        
        // Set the active command in the engine
        engine.activeCommand = verb;
        
        // Look for an object matching the noun
        let targetObject = null;
        
        if (engine.collisionObjects) {
            targetObject = engine.collisionObjects.find(obj => obj.id === noun || obj.type === noun);
        }
        
        // Check NPCs if no static object found
        if (!targetObject && engine.npcs && engine.npcs[engine.currentScene]) {
            targetObject = engine.npcs[engine.currentScene].find(npc => npc.id === noun || npc.name.toLowerCase().includes(noun));
        }
        
        // Special handler for "talk to" commands
        if (verb === 'talk' && preposition === 'to' && targetObject) {
            // Find if NPC has an associated dialog
            if (targetObject.dialogId) {
                this.startDialog(targetObject.dialogId);
                return;
            }
        }
        
        // Check inventory if applicable
        if (!targetObject && verb === 'use' && window.GAME_DATA && window.GAME_DATA.inventory) {
            const inventoryItem = window.GAME_DATA.inventory.find(item => item.toLowerCase().includes(noun));
            if (inventoryItem) {
                this.showDialog(`You are holding the ${inventoryItem}.`);
                
                // If there's a second noun, try to use the item on that object
                if (secondNoun) {
                    // Find the second object
                    let secondObject = null;
                    
                    if (engine.collisionObjects) {
                        secondObject = engine.collisionObjects.find(obj => obj.id === secondNoun || obj.type === secondNoun);
                    }
                    
                    // Check NPCs if no static object found
                    if (!secondObject && engine.npcs && engine.npcs[engine.currentScene]) {
                        secondObject = engine.npcs[engine.currentScene].find(npc => 
                            npc.id === secondNoun || npc.name.toLowerCase().includes(secondNoun));
                    }
                    
                    if (secondObject) {
                        if (engine.processInteraction) {
                            engine.processInteraction(secondObject, { item: inventoryItem });
                        } else {
                            this.showDialog(`You can't use the ${inventoryItem} on that.`);
                        }
                    } else {
                        this.showDialog(`You don't see a ${secondNoun} here.`);
                    }
                }
                
                return;
            }
        }
        
        if (targetObject) {
            // Process the interaction with the found object
            if (engine.processInteraction) {
                engine.processInteraction(targetObject);
            } else {
                this.showDialog(`You ${verb} the ${noun}.`);
            }
        } else {
            this.showDialog(`You don't see a ${noun} here.`);
        }
    }

    /**
     * Show the inventory in Sierra style
     */
    showInventory() {
        if (!window.GAME_DATA || !window.GAME_DATA.inventory) {
            this.showDialog("You are not carrying anything.");
            return;
        }
        
        if (window.GAME_DATA.inventory.length === 0) {
            this.showDialog("You are not carrying anything.");
            return;
        }
        
        // Format inventory items Sierra-style
        let inventoryText = "You are carrying:\n";
        window.GAME_DATA.inventory.forEach(item => {
            inventoryText += `- ${item}\n`;
        });
        
        this.showDialog(inventoryText);
        
        // Also update the inventory panel if it exists
        this.updateInventoryPanel();
    }

    /**
     * Update the inventory panel with current items
     */
    updateInventoryPanel() {
        const inventoryPanel = document.getElementById('inventory-items');
        if (!inventoryPanel) return;
        
        // Clear existing items
        inventoryPanel.innerHTML = '';
        
        // Add each inventory item
        if (window.GAME_DATA && window.GAME_DATA.inventory) {
            window.GAME_DATA.inventory.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.textContent = item;
                itemElement.dataset.item = item;
                
                // Add click handler for item
                itemElement.addEventListener('click', () => {
                    // Select the item
                    document.querySelectorAll('.inventory-item').forEach(el => {
                        el.classList.remove('selected');
                    });
                    itemElement.classList.add('selected');
                    
                    // Set the item as the active object
                    if (window.gameEngine) {
                        window.gameEngine.activeObject = item;
                    }
                    
                    // Show dialog about the item
                    this.showDialog(`Examining: ${item}`);
                });
                
                inventoryPanel.appendChild(itemElement);
            });
        }
    }
}

// Create global instance
window.dialogManager = new DialogManager();
