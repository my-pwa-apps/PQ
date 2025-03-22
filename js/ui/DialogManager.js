/**
 * DialogManager.js
 * Sierra-style dialogue system for Police Quest
 */
if (typeof window.DialogManager === 'undefined') {
    class DialogManager {
        constructor() {
            // Cache DOM elements for better performance
            this.dialogElement = document.getElementById('dialog-text');
            this.dialogContainer = document.getElementById('dialog-box');
            this.optionsContainer = document.createElement('div');
            this.optionsContainer.id = 'dialog-options';
            
            // Only append options container if dialog container exists
            if (this.dialogContainer) {
                this.dialogContainer.appendChild(this.optionsContainer);
            }
            
            // Dialog state management
            this.currentDialogQueue = [];
            this.typingSpeed = 30; // ms per character, Sierra-style typing speed
            this.isTyping = false;
            this.currentTimeout = null;
            this.parser = null;
            this.currentDialogTree = null;
            this.currentDialogId = null;
            this.lastInteractionTime = 0;
            
            // Performance optimizations
            this.domFragment = document.createDocumentFragment();
            this.eventListeners = [];
            this.dialogOptionsCache = new Map(); // Cache dialog options
            this.textWidthCache = new Map(); // Cache text width measurements
            this.charBatchSize = 3; // Batch character updates for better performance
            
            // Initialize components
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
            
            // Create parser input if it doesn't exist (lazily)
            this.setupParserInput();
        }
        
        /**
         * Set up parser input field only when needed
         */
        setupParserInput() {
            if (document.querySelector('.parser-input')) return;
            
            // Defer DOM manipulation until idle
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => this.createParserInput());
            } else {
                setTimeout(() => this.createParserInput(), 100);
            }
        }
        
        /**
         * Create parser input field
         */
        createParserInput() {
            const uiContainer = document.getElementById('ui-container');
            
            if (uiContainer) {
                const parserInput = document.createElement('input');
                parserInput.type = 'text';
                parserInput.className = 'parser-input';
                parserInput.placeholder = 'Enter command: (e.g., "look badge" or "talk to officer")';
                
                // Store reference to event listener for potential cleanup
                const parseCommandHandler = (e) => {
                    if (e.key === 'Enter') {
                        this.parseCommand(e.target.value);
                        e.target.value = '';
                    }
                };
                
                parserInput.addEventListener('keydown', parseCommandHandler);
                this.eventListeners.push({ element: parserInput, type: 'keydown', handler: parseCommandHandler });
                
                // Add it to the UI container
                uiContainer.appendChild(parserInput);
            }
        }

        createDialogClickListener() {
            // Allow clicking on dialog to advance text, Sierra style
            if (this.dialogContainer) {
                const dialogClickHandler = () => {
                    // Prevent click spam
                    const now = performance.now();
                    if (now - this.lastInteractionTime < 300) return;
                    this.lastInteractionTime = now;
                    
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
                };
                
                this.dialogContainer.addEventListener('click', dialogClickHandler);
                this.eventListeners.push({ element: this.dialogContainer, type: 'click', handler: dialogClickHandler });
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
            this.handleNodeActions(node);
        }
        
        /**
         * Handle any actions specified in the dialog node
         * @param {object} node - Dialog node
         */
        handleNodeActions(node) {
            // Use requestAnimationFrame to defer non-critical processing
            requestAnimationFrame(() => {
                if (node.addEvidence && window.gameEngine) {
                    window.gameEngine.addEvidence(node.addEvidence);
                }
                
                if (node.action && window.gameEngine) {
                    window.gameEngine.handleDialogAction(node.action);
                }
            });
        }
        
        /**
         * Display dialog options for player to choose from
         * @param {Array} optionIndices - Array of indices pointing to dialog nodes that are options
         */
        showDialogOptions(optionIndices) {
            // Clear previous options
            this.optionsContainer.innerHTML = '';
            
            // Check if we have cached options for this dialog
            const cacheKey = optionIndices.join(',');
            if (this.dialogOptionsCache.has(cacheKey)) {
                this.optionsContainer.appendChild(
                    this.dialogOptionsCache.get(cacheKey).cloneNode(true)
                );
                
                // Re-attach event handlers (clone doesn't preserve them)
                this.attachDialogOptionHandlers(cacheKey);
                return;
            }
            
            // Create options in a document fragment for better performance
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'dialog-options-container';
            
            // Map of event handlers for options
            const handlers = new Map();
            
            // Add each option
            optionIndices.forEach(optionIndex => {
                const option = this.currentDialogTree[optionIndex];
                if (!option) return;
                
                const optionButton = document.createElement('button');
                optionButton.className = 'dialog-option';
                optionButton.textContent = option.text;
                optionButton.dataset.index = optionIndex;
                
                // Store the option's next node to avoid closure issues
                const nextNode = option.next;
                
                // Add click handler
                const optionClickHandler = () => {
                    // Hide options
                    this.optionsContainer.innerHTML = '';
                    
                    // Show the chosen option as player text
                    this.showDialog(`YOU: ${option.text}`);
                    
                    // Go to the next node in this option path
                    this.waitForDialogCompletion(() => {
                        this.showDialogNode(nextNode);
                    });
                };
                
                // Store handler for later attachment
                handlers.set(optionIndex.toString(), optionClickHandler);
                
                optionsDiv.appendChild(optionButton);
            });
            
            // Store in cache
            this.dialogOptionsCache.set(cacheKey, optionsDiv.cloneNode(true));
            this.dialogOptionsCache.set(cacheKey + '_handlers', handlers);
            
            // Append to container
            this.optionsContainer.appendChild(optionsDiv);
            
            // Attach handlers
            this.attachDialogOptionHandlers(cacheKey);
        }
        
        /**
         * Attach event handlers to dialog options
         * @param {string} cacheKey - Cache key for these options
         */
        attachDialogOptionHandlers(cacheKey) {
            // Get handlers from cache
            const handlers = this.dialogOptionsCache.get(cacheKey + '_handlers');
            if (!handlers) return;
            
            // Attach handlers to buttons
            const buttons = this.optionsContainer.querySelectorAll('.dialog-option');
            buttons.forEach(button => {
                const index = button.dataset.index;
                if (handlers.has(index)) {
                    button.addEventListener('click', handlers.get(index));
                }
            });
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
                // Defer to next frame to ensure UI update completes first
                requestAnimationFrame(() => {
                    window.gameEngine.dialogEnded();
                });
            }
        }
        
        /**
         * Wait for the current dialog text to finish typing before calling the callback
         */
        waitForDialogCompletion(callback) {
            if (this.isTyping) {
                // Check again in a bit - use shorter interval for better responsiveness
                setTimeout(() => this.waitForDialogCompletion(callback), 100);
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
                
                // Focus the dialog for keyboard accessibility
                this.dialogContainer.setAttribute('tabindex', '0');
                this.dialogContainer.focus();
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
            
            // Sierra-style typing effect - optimized with character batching
            const typeNextChar = () => {
                if (charIndex < text.length) {
                    // Calculate how many characters to add this frame (batch updates)
                    const charsToAdd = Math.min(this.charBatchSize, text.length - charIndex);
                    const textToAdd = text.substring(charIndex, charIndex + charsToAdd);
                    this.dialogElement.textContent += textToAdd;
                    charIndex += charsToAdd;
                    
                    // Play typing sound every few characters for authentic feel
                    if (window.soundManager && charIndex % 6 === 0) {
                        window.soundManager.playSound('typing', 0.2);
                    }
                    
                    // Schedule next character(s) batch - adjust timing for longer texts
                    const speedAdjust = text.length > 100 ? 0.7 : 1;
                    this.currentTimeout = setTimeout(
                        typeNextChar, 
                        this.typingSpeed * speedAdjust
                    );
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
            
            try {
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
            } catch (error) {
                console.error("Error parsing command:", error);
                this.showDialog("Sorry, I couldn't process that command.");
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
                targetObject = engine.collisionObjects.find(obj => 
                    obj.id === noun || obj.type === noun || 
                    (obj.aliases && obj.aliases.includes(noun))
                );
            }
            
            // Check NPCs if no static object found
            if (!targetObject && engine.npcs && engine.npcs[engine.currentScene]) {
                targetObject = engine.npcs[engine.currentScene].find(npc => 
                    npc.id === noun || 
                    (npc.name && npc.name.toLowerCase().includes(noun)) ||
                    (npc.aliases && npc.aliases.includes(noun))
                );
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
            if (!targetObject && (verb === 'use' || verb === 'look')) {
                this.checkInventoryItem(verb, noun, preposition, secondNoun);
                return;
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
         * Check inventory for the specified item
         */
        checkInventoryItem(verb, noun, preposition, secondNoun) {
            if (!window.GAME_DATA || !window.GAME_DATA.inventory) return false;
            
            // Handle inventory consistently whether it's an array or a set
            let inventoryItems = Array.isArray(window.GAME_DATA.inventory) 
                ? window.GAME_DATA.inventory 
                : Array.from(window.GAME_DATA.inventory);
                
            const inventoryItem = inventoryItems.find(item => {
                if (typeof item === 'string') {
                    return item.toLowerCase().includes(noun);
                } else if (item.id) {
                    return item.id.toLowerCase() === noun ||
                           (item.aliases && item.aliases.includes(noun));
                }
                return false;
            });
            
            if (inventoryItem) {
                const engine = window.gameEngine || window.engine;
                const itemName = typeof inventoryItem === 'string' ? inventoryItem : inventoryItem.name || inventoryItem.id;
                
                if (verb === 'look') {
                    // Show description
                    const description = typeof inventoryItem === 'object' && inventoryItem.description
                        ? inventoryItem.description
                        : `It's a ${itemName}.`;
                    
                    this.showDialog(description);
                    return true;
                } else if (verb === 'use') {
                    this.showDialog(`You are holding the ${itemName}.`);
                    
                    // If there's a second noun, try to use the item on that object
                    if (secondNoun && engine) {
                        this.useItemOn(inventoryItem, secondNoun);
                    } else if (preposition && !secondNoun) {
                        this.showDialog(`What do you want to use the ${itemName} on?`);
                    }
                    
                    return true;
                }
            }
            
            return false;
        }
        
        /**
         * Use an inventory item on another object
         */
        useItemOn(item, targetNoun) {
            const engine = window.gameEngine || window.engine;
            if (!engine) return;
            
            // Find the second object
            let secondObject = null;
            
            if (engine.collisionObjects) {
                secondObject = engine.collisionObjects.find(obj => 
                    obj.id === targetNoun || obj.type === targetNoun ||
                    (obj.aliases && obj.aliases.includes(targetNoun))
                );
            }
            
            // Check NPCs if no static object found
            if (!secondObject && engine.npcs && engine.npcs[engine.currentScene]) {
                secondObject = engine.npcs[engine.currentScene].find(npc => 
                    npc.id === targetNoun || 
                    (npc.name && npc.name.toLowerCase().includes(targetNoun)) ||
                    (npc.aliases && npc.aliases.includes(targetNoun))
                );
            }
            
            const itemName = typeof item === 'string' ? item : item.name || item.id;
            
            if (secondObject) {
                if (engine.processInteraction) {
                    engine.processInteraction(secondObject, { item });
                } else {
                    this.showDialog(`You use the ${itemName} on that.`);
                }
            } else {
                this.showDialog(`You don't see a ${targetNoun} here.`);
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
            
            // Handle inventory consistently whether it's an array or a set
            let inventoryItems = Array.isArray(window.GAME_DATA.inventory) 
                ? window.GAME_DATA.inventory 
                : Array.from(window.GAME_DATA.inventory);
                
            if (inventoryItems.length === 0) {
                this.showDialog("You are not carrying anything.");
                return;
            }
            
            // Format inventory items Sierra-style
            let inventoryText = "You are carrying:\n";
            inventoryItems.forEach(item => {
                const itemName = typeof item === 'string' ? item : item.name || item.id;
                inventoryText += `- ${itemName}\n`;
            });
            
            this.showDialog(inventoryText);
            
            // Also update the inventory panel if it exists
            requestAnimationFrame(() => this.updateInventoryPanel());
        }

        /**
         * Update the inventory panel with current items
         */
        updateInventoryPanel() {
            const inventoryPanel = document.getElementById('inventory-items');
            if (!inventoryPanel) return;
            
            // Clear existing items
            inventoryPanel.innerHTML = '';
            
            // Use document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Add each inventory item
            if (window.GAME_DATA && window.GAME_DATA.inventory) {
                // Handle inventory consistently whether it's an array or a set
                let inventoryItems = Array.isArray(window.GAME_DATA.inventory) 
                    ? window.GAME_DATA.inventory 
                    : Array.from(window.GAME_DATA.inventory);
                    
                inventoryItems.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'inventory-item';
                    
                    const itemName = typeof item === 'string' ? item : item.name || item.id;
                    itemElement.textContent = itemName;
                    itemElement.dataset.item = typeof item === 'string' ? item : item.id;
                    
                    // Add click handler for item
                    const itemClickHandler = () => {
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
                        const description = typeof item === 'object' && item.description
                            ? item.description
                            : `Examining: ${itemName}`;
                            
                        this.showDialog(description);
                    };
                    
                    itemElement.addEventListener('click', itemClickHandler);
                    this.eventListeners.push({ element: itemElement, type: 'click', handler: itemClickHandler });
                    
                    fragment.appendChild(itemElement);
                });
            }
            
            // Append all items at once
            inventoryPanel.appendChild(fragment);
        }
        
        /**
         * Clean up resources - remove event listeners
         */
        dispose() {
            // Clear any pending timeouts
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }
            
            // Remove all registered event listeners
            this.eventListeners.forEach(({ element, type, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(type, handler);
                }
            });
            
            // Clear the event listeners array
            this.eventListeners = [];
            
            // Clear dialog options cache
            this.dialogOptionsCache.clear();
            
            // Clear text width cache
            this.textWidthCache.clear();
            
            // Clear current dialog state
            this.currentDialogQueue = [];
            this.currentDialogTree = null;
            this.isTyping = false;
            
            console.log("DialogManager disposed");
        }
    }

    // Expose to global scope
    window.DialogManager = DialogManager;
}

// Create global instance with lazy initialization
Object.defineProperty(window, 'dialogManager', {
    get: function() {
        if (!this._dialogManager) {
            this._dialogManager = new DialogManager();
        }
        return this._dialogManager;
    }
});

// Make console error safer
window.dialogManagerError = function(message) {
    console.error(`[DialogManager] ${message}`);
};
