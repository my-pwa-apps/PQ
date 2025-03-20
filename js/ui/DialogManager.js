class DialogManager {
    constructor() {
        this.dialogElement = document.getElementById('dialog-box');
        this.dialogTextElement = document.getElementById('dialog-text');
        this.isVisible = false;
        this.messageQueue = [];
        this.typingSpeed = 30; // ms per character
        this.isTyping = false;
        
        if (!this.dialogElement || !this.dialogTextElement) {
            console.error('Dialog elements not found in the DOM');
            return;
        }
        
        // Initialize with empty text
        this.showDialog('Welcome to Police Quest. Use the command buttons to interact with the game world.');
    }
    
    showDialog(text, duration = 5000) {
        if (!this.dialogElement || !this.dialogTextElement) return;
        
        // Add to queue
        this.messageQueue.push({
            text: text,
            duration: duration
        });
        
        // If not currently showing a message, show this one
        if (!this.isVisible && !this.isTyping) {
            this.processNextMessage();
        }
    }
    
    processNextMessage() {
        if (this.messageQueue.length === 0) {
            // If queue is empty, hide dialog
            this.hideDialog();
            return;
        }
        
        const message = this.messageQueue.shift();
        this.displayMessage(message.text, message.duration);
    }
    
    displayMessage(text, duration) {
        // Show the dialog element
        this.dialogElement.style.display = 'block';
        this.isVisible = true;
        
        // Type out the text
        this.typeText(text, () => {
            // When finished typing, set timeout to hide or show next message
            setTimeout(() => {
                this.processNextMessage();
            }, duration);
        });
    }
    
    typeText(text, callback) {
        this.isTyping = true;
        this.dialogTextElement.textContent = '';
        
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                this.dialogTextElement.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                this.isTyping = false;
                if (callback) callback();
            }
        }, this.typingSpeed);
    }
    
    hideDialog() {
        if (!this.dialogElement) return;
        
        // Don't hide if there are messages waiting
        if (this.messageQueue.length > 0) {
            this.processNextMessage();
            return;
        }
        
        // Hide with a fade effect
        this.dialogElement.style.opacity = '1';
        let opacity = 1;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            this.dialogElement.style.opacity = opacity.toString();
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                this.dialogElement.style.display = 'none';
                this.isVisible = false;
                this.dialogElement.style.opacity = '1'; // Reset for next time
            }
        }, 50);
    }
}

// Initialize the dialog manager when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.dialogManager = new DialogManager();
});
