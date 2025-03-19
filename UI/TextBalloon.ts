interface TextBalloonOptions {
    backgroundColor: string;
    borderColor: string;
    padding: string;
    borderRadius: string;
    boxShadow: string;
    textShadow: string;
}

class TextBalloon {
    private id: string;
    private text: string;
    private isVisible: boolean = false;
    private element: HTMLElement | null = null;
    private static zIndex: number = 9000; // Increased base z-index to ensure always on top
    private options: TextBalloonOptions;

    constructor(id: string, text: string = '', options: Partial<TextBalloonOptions> = {}) {
        this.id = id;
        this.text = text;
        this.options = {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#333',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            ...options
        };
        // Element is created lazily when needed
    }

    private createBalloonElement() {
        if (this.element) return;
        
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'text-balloon';
        this.element.style.position = 'absolute';
        this.element.style.display = 'none';
        this.element.style.padding = this.options.padding;
        this.element.style.backgroundColor = this.options.backgroundColor;
        this.element.style.border = `1px solid ${this.options.borderColor}`;
        this.element.style.borderRadius = this.options.borderRadius;
        this.element.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicking
        this.element.style.boxShadow = this.options.boxShadow;
        this.element.style.textShadow = this.options.textShadow;
        document.body.appendChild(this.element);
    }

    setText(text: string): void {
        this.text = text;
        if (this.element && this.isVisible) {
            this.element.textContent = this.text;
        }
    }

    show(x: number, y: number, text?: string, offsetX: number = 0, offsetY: number = 0) {
        this.createBalloonElement(); // Lazy creation
        if (!this.element) return;
        
        if (text !== undefined) {
            this.text = text;
        }
        
        this.element.textContent = this.text;
        this.updatePosition(x + offsetX, y + offsetY);
        this.element.style.display = 'block';
        this.element.style.zIndex = (++TextBalloon.zIndex).toString();
        this.isVisible = true;
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.isVisible = false;
        }
    }

    updatePosition(x: number, y: number) {
        if (!this.element) this.createBalloonElement();
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
    
    destroy(): void {
        if (this.element) {
            document.body.removeChild(this.element);
            this.element = null;
            this.isVisible = false;
        }
    }
    
    updateOptions(options: Partial<TextBalloonOptions>): void {
        this.options = { ...this.options, ...options };
        if (this.element) {
            this.element.style.backgroundColor = this.options.backgroundColor;
            this.element.style.border = `1px solid ${this.options.borderColor}`;
            this.element.style.padding = this.options.padding;
            this.element.style.borderRadius = this.options.borderRadius;
            this.element.style.boxShadow = this.options.boxShadow;
            this.element.style.textShadow = this.options.textShadow;
        }
    }
}

export { TextBalloon, TextBalloonOptions };
