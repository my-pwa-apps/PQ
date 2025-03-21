/**
 * TextBalloon.ts
 * Sierra-style text balloon for character dialogue
 */
export class TextBalloon {
    private element: HTMLElement;
    private textElement: HTMLElement;
    private arrowElement: HTMLElement;
    private currentTimeout: number | null = null;
    
    constructor() {
        // Create main container
        this.element = document.createElement('div');
        this.element.id = 'sierra-text-balloon';
        this.element.style.display = 'none';
        
        // Create the arrow that points to the character
        this.arrowElement = document.createElement('div');
        this.arrowElement.id = 'sierra-text-balloon-arrow';
        this.element.appendChild(this.arrowElement);
        
        // Create text container with Sierra styling
        this.textElement = document.createElement('div');
        this.textElement.id = 'sierra-text-balloon-text';
        this.element.appendChild(this.textElement);
        
        // Apply Sierra-style styling
        this.applyStyles();
        
        // Add to document
        document.body.appendChild(this.element);
    }
    
    /**
     * Apply Sierra-style CSS to the text balloon
     */
    private applyStyles(): void {
        // Sierra text balloon container
        this.element.style.position = 'absolute';
        this.element.style.maxWidth = '300px';
        this.element.style.backgroundColor = '#000080'; // Sierra blue background
        this.element.style.border = '2px solid #FFFFFF'; // White border (Sierra style)
        this.element.style.borderRadius = '3px';
        this.element.style.padding = '10px';
        this.element.style.zIndex = '1000';
        this.element.style.transition = 'opacity 0.2s ease-in-out';
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'none'; // Don't interfere with clicks
        
        // Sierra-style arrow
        this.arrowElement.style.position = 'absolute';
        this.arrowElement.style.bottom = '-10px';
        this.arrowElement.style.left = '50%';
        this.arrowElement.style.marginLeft = '-10px';
        this.arrowElement.style.width = '0';
        this.arrowElement.style.height = '0';
        this.arrowElement.style.borderLeft = '10px solid transparent';
        this.arrowElement.style.borderRight = '10px solid transparent';
        this.arrowElement.style.borderTop = '10px solid #FFFFFF'; // White border arrow
        
        // Sierra-style text
        this.textElement.style.color = '#FFFFFF'; // Sierra white text
        this.textElement.style.fontFamily = "'Press Start 2P', 'Courier New', monospace"; // Sierra-like font
        this.textElement.style.fontSize = '14px';
        this.textElement.style.lineHeight = '1.5';
        this.textElement.style.textAlign = 'left';
        this.textElement.style.margin = '0';
    }
    
    /**
     * Show a text balloon above a character
     * @param targetElement - The character element to attach the balloon to
     * @param text - The text to display in Sierra style
     * @param duration - How long to show the text (ms)
     */
    public show(targetElement: HTMLElement, text: string, duration: number = 3000): void {
        // Clear any existing timeout
        if (this.currentTimeout !== null) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        // Set the text with Sierra-style typewriter effect
        this.textElement.textContent = '';
        this.element.style.display = 'block';
        
        // Position above the character in Sierra style
        const targetRect = targetElement.getBoundingClientRect();
        const balloonWidth = Math.min(300, Math.max(150, text.length * 8)); // Size based on text length
        
        this.element.style.width = `${balloonWidth}px`;
        
        // Position balloon above character's head (Sierra style)
        const left = targetRect.left + (targetRect.width / 2) - (balloonWidth / 2);
        const top = targetRect.top - 20 - this.element.offsetHeight;
        
        // Keep on screen (Sierra would do this)
        const finalLeft = Math.max(10, Math.min(left, window.innerWidth - balloonWidth - 10));
        const finalTop = Math.max(10, top);
        
        this.element.style.left = `${finalLeft}px`;
        this.element.style.top = `${finalTop}px`;
        
        // Position arrow to point at character
        const arrowLeft = Math.min(balloonWidth - 20, Math.max(10, (targetRect.left + targetRect.width / 2) - finalLeft));
        this.arrowElement.style.left = `${arrowLeft}px`;
        this.arrowElement.style.marginLeft = '0';
        
        // Sierra-style typing effect
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                this.textElement.textContent += text.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typeInterval);
                
                // Auto-hide after duration
                this.currentTimeout = window.setTimeout(() => {
                    this.hide();
                }, duration);
            }
        }, 30); // Sierra typing speed
        
        // Show with fade-in
        setTimeout(() => {
            this.element.style.opacity = '1';
        }, 10);
    }
    
    /**
     * Hide the text balloon with Sierra-style animation
     */
    public hide(): void {
        // Fade out
        this.element.style.opacity = '0';
        
        // Hide after transition
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 200);
        
        // Clear timeout
        if (this.currentTimeout !== null) {
            window.clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    }
    
    /**
     * Clean up resources
     */
    public dispose(): void {
        if (this.currentTimeout !== null) {
            window.clearTimeout(this.currentTimeout);
        }
        
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Export a singleton instance
export const textBalloon = new TextBalloon();
