class DialogManager {
    constructor() {
        this.dialogElement = document.getElementById('dialog-box');
        this.dialogTextElement = document.getElementById('dialog-text');
        
        if (!this.dialogElement || !this.dialogTextElement) {
            console.error('Dialog elements not found in the DOM');
            return;
        }
        
        // Simple initialization without animations
        this.initDialog();
    }
    
    initDialog() {
        // Set initial text without complex animations
        if (this.dialogTextElement) {
            this.dialogTextElement.textContent = 'Welcome to Police Quest. Use the command buttons to interact with the game world.';
        }
        
        // Make dialog visible
        if (this.dialogElement) {
            this.dialogElement.style.display = 'block';
        }
    }
    
    showDialog(text) {
        if (!this.dialogElement || !this.dialogTextElement) return;
        
        // Simple text setting without animations
        this.dialogTextElement.textContent = text;
        this.dialogElement.style.display = 'block';
    }
}

// Initialize the dialog manager when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Wrap in try-catch to prevent any errors
    try {
        window.dialogManager = new DialogManager();
    } catch (e) {
        console.error('Failed to initialize DialogManager:', e);
    }
});
