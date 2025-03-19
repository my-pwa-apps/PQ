class TextBalloon {
    private id: string;
    private text: string;
    private isVisible: boolean = false;
    private element: HTMLElement | null = null;
    private static zIndex: number = 9000; // Increased base z-index to ensure always on top

    constructor(id: string, text: string = '') {
        this.id = id;
        this.text = text;
        this.createBalloonElement();
    }

    private createBalloonElement() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.id = this.id;
            this.element.className = 'text-balloon';
            this.element.style.position = 'absolute';
            this.element.style.display = 'none';
            this.element.style.padding = '8px';
            this.element.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.element.style.border = '1px solid #333';
            this.element.style.borderRadius = '8px';
            this.element.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicking
            document.body.appendChild(this.element);
        }
    }

    show(x: number, y: number, text?: string) {
        if (!this.element) return;
        
        if (text) {
            this.text = text;
        }
        
        this.element.textContent = this.text;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.display = 'block';
        this.element.style.zIndex = (++TextBalloon.zIndex).toString(); // Increment z-index for each new balloon
        this.isVisible = true;
        
        // Add drop shadow and make text more visible
        this.element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        this.element.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.isVisible = false;
        }
    }

    updatePosition(x: number, y: number) {
        if (!this.element || !this.isVisible) return;
        
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    getText(): string {
        return this.text;
    }

    isShowing(): boolean {
        return this.isVisible;
    }
}
