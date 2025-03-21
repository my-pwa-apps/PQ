/**
 * CaseInfoUI.ts
 * Sierra-style Police Quest case information interface
 */
export class CaseInfoUI {
    private element: HTMLElement;
    private titleElement: HTMLElement;
    private contentElement: HTMLElement;
    private closeButton: HTMLElement;
    private isVisible: boolean = false;
    
    constructor() {
        // Create Sierra-style case info panel
        this.element = document.createElement('div');
        this.element.id = 'case-info';
        this.element.style.display = 'none';
        
        // Create title in Sierra-style heading
        this.titleElement = document.createElement('div');
        this.titleElement.id = 'case-info-title';
        this.element.appendChild(this.titleElement);
        
        // Create content area with Sierra formatting
        this.contentElement = document.createElement('div');
        this.contentElement.id = 'case-info-content';
        this.element.appendChild(this.contentElement);
        
        // Add Sierra-style close button
        this.closeButton = document.createElement('button');
        this.closeButton.id = 'case-info-close';
        this.closeButton.textContent = 'CLOSE';
        this.closeButton.addEventListener('click', () => this.hide());
        this.element.appendChild(this.closeButton);
        
        // Add to document
        document.body.appendChild(this.element);
    }
    
    /**
     * Show case information in Sierra style
     * @param title - Case title/number in Sierra PQ style
     * @param content - Case information text
     */
    public show(title: string, content: string): void {
        // Format title in Sierra PQ style
        this.titleElement.textContent = title.toUpperCase();
        
        // Format content with Sierra-style paragraph spacing and highlighting
        const formattedContent = this.formatSierraText(content);
        this.contentElement.innerHTML = formattedContent;
        
        // Show with Sierra-style animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.95)';
        this.element.style.display = 'block';
        
        // Allow CSS transition to work
        setTimeout(() => {
            this.element.style.opacity = '1';
            this.element.style.transform = 'scale(1)';
        }, 10);
        
        this.isVisible = true;
        
        // Add escape key handler to close (Sierra standard)
        document.addEventListener('keydown', this.handleEscapeKey);
    }
    
    /**
     * Hide case information with Sierra-style transition
     */
    public hide(): void {
        if (!this.isVisible) return;
        
        // Sierra-style fade out animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.95)';
        
        // Hide after animation completes
        setTimeout(() => {
            this.element.style.display = 'none';
            this.isVisible = false;
        }, 300); // Match transition time in CSS
        
        // Remove escape key handler
        document.removeEventListener('keydown', this.handleEscapeKey);
    }
    
    /**
     * Update case info content
     * @param content - New case information text
     */
    public updateContent(content: string): void {
        if (!this.isVisible) return;
        
        // Format content with Sierra-style paragraph spacing and highlighting
        const formattedContent = this.formatSierraText(content);
        
        // Sierra-style content update animation
        this.contentElement.style.opacity = '0';
        setTimeout(() => {
            this.contentElement.innerHTML = formattedContent;
            this.contentElement.style.opacity = '1';
        }, 300);
    }
    
    /**
     * Format text with Sierra-style highlighting and spacing
     */
    private formatSierraText(text: string): string {
        // Add Sierra-style paragraph spacing
        text = text.replace(/\n\n/g, '<br><br>');
        text = text.replace(/\n/g, '<br>');
        
        // Sierra-style highlighting for important text
        text = text.replace(/\*([^*]+)\*/g, '<span class="sierra-highlight" style="color: #FFFF00;">$1</span>');
        
        // Format Sierra-style heading text
        text = text.replace(/##([^#]+)##/g, '<div class="sierra-section-title" style="color: #55AAFF; margin: 10px 0; font-weight: bold; text-decoration: underline;">$1</div>');
        
        // Format evidence items in Sierra style
        text = text.replace(/- ([^:]+):/g, '<div class="sierra-evidence-item" style="color: #FFFF00; margin: 5px 0;">• $1:</div>');
        
        return text;
    }
    
    /**
     * Handle escape key press (Sierra standard)
     */
    private handleEscapeKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.hide();
        }
    }
    
    /**
     * Clean up resources
     */
    public dispose(): void {
        document.removeEventListener('keydown', this.handleEscapeKey);
        
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Export a singleton instance for easy access
export const caseInfoUI = new CaseInfoUI();
