/**
 * DialogManager.js - Compatibility wrapper
 * This file ensures backward compatibility with code that might be using
 * this version of the DialogManager. It delegates to the main implementation
 * in js/ui/DialogManager.js
 */

// Make sure we don't redefine the class if it's already defined in ui/DialogManager.js
if (typeof window.DialogManager === 'undefined') {
    console.warn('Main DialogManager not loaded. Loading compatibility version.');
    
    class DialogManager {
        constructor(game) {
            this.game = game;
            this.currentDialog = null;
            this.currentIndex = 0;
            console.log('Using compatibility DialogManager');
        }

        show(dialogId) {
            console.log(`Showing dialog: ${dialogId}`);
            // Try to use the main DialogManager if it exists
            if (window.dialogManager && typeof window.dialogManager.startDialog === 'function') {
                return window.dialogManager.startDialog(dialogId);
            }
            
            // Fallback implementation
            const dialog = window.GAME_DATA?.dialogs?.[dialogId];
            if (!dialog) {
                console.error(`Dialog ${dialogId} not found`);
                return false;
            }
            this.currentDialog = dialog;
            this.currentIndex = 0;
            return this.displayCurrentDialog();
        }

        displayCurrentDialog() {
            if (!this.currentDialog || !this.currentDialog[this.currentIndex]) {
                return false;
            }
            const entry = this.currentDialog[this.currentIndex];
            console.log("Showing dialog:", entry.text);
            
            // Try to use the main DialogManager if it exists
            if (window.dialogManager && typeof window.dialogManager.showDialog === 'function') {
                return window.dialogManager.showDialog(entry.text);
            }
            
            // Very simple fallback
            alert(entry.text);
            return true;
        }
    }

    // Make it available globally but don't override the main implementation
    if (!window.DialogManager) {
        window.DialogManager = DialogManager;
    }
}

// Ensure backward compatibility with code that expects this module pattern
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DialogManager;
}
