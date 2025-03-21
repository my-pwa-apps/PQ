/**
 * Jenny.ts
 * Character implementation in the classic Sierra Police Quest style
 */
import { textBalloon } from '../UI/TextBalloon';

export class Jenny {
    private element: HTMLElement;
    private characterSprite: HTMLImageElement;
    private currentAnimation: string = 'idle';
    private facingDirection: 'left' | 'right' | 'up' | 'down' = 'down';
    private animationFrame: number = 0;
    private isMoving: boolean = false;
    private position: { x: number, y: number } = { x: 0, y: 0 };
    private destination: { x: number, y: number } | null = null;
    private moveSpeed: number = 2; // Sierra-style pixel movement speed
    private animationInterval: number | null = null;
    
    // Sierra-style character animations for 4 directions
    private animations: {
        [key: string]: {
            frames: string[],
            frameRate: number
        }
    } = {
        idleDown: {
            frames: ['jenny_idle_down_1.png'],
            frameRate: 0
        },
        idleUp: {
            frames: ['jenny_idle_up_1.png'],
            frameRate: 0
        },
        idleLeft: {
            frames: ['jenny_idle_left_1.png'],
            frameRate: 0
        },
        idleRight: {
            frames: ['jenny_idle_right_1.png'],
            frameRate: 0
        },
        walkDown: {
            frames: [
                'jenny_walk_down_1.png', 
                'jenny_walk_down_2.png', 
                'jenny_walk_down_3.png',
                'jenny_walk_down_4.png'
            ],
            frameRate: 150 // Sierra-style animation speed
        },
        walkUp: {
            frames: [
                'jenny_walk_up_1.png', 
                'jenny_walk_up_2.png', 
                'jenny_walk_up_3.png',
                'jenny_walk_up_4.png'
            ],
            frameRate: 150
        },
        walkLeft: {
            frames: [
                'jenny_walk_left_1.png', 
                'jenny_walk_left_2.png', 
                'jenny_walk_left_3.png',
                'jenny_walk_left_4.png'
            ],
            frameRate: 150
        },
        walkRight: {
            frames: [
                'jenny_walk_right_1.png', 
                'jenny_walk_right_2.png', 
                'jenny_walk_right_3.png',
                'jenny_walk_right_4.png'
            ],
            frameRate: 150
        }
    };

    constructor(containerId: string, startX: number, startY: number) {
        // Create character container with Sierra styling
        this.element = document.createElement('div');
        this.element.className = 'sierra-character';
        this.element.style.width = '32px'; // Classic Sierra character width
        this.element.style.height = '64px'; // Classic Sierra character height
        
        // Create sprite element in Sierra style
        this.characterSprite = document.createElement('img');
        this.characterSprite.style.width = '100%';
        this.characterSprite.style.height = '100%';
        this.characterSprite.style.imageRendering = 'pixelated'; // Classic Sierra pixelated look
        
        this.element.appendChild(this.characterSprite);
        
        // Set starting position in Sierra coordinate system
        this.setPosition(startX, startY);
        
        // Add to game container
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(this.element);
        }
        
        // Start in idle state
        this.playAnimation('idleDown');
    }
    
    /**
     * Set character position in Sierra-style coordinate system
     */
    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        
        // Apply position with Sierra-style walking logic (feet at bottom of sprite)
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y - this.element.offsetHeight}px`;
        this.element.style.zIndex = `${Math.floor(y)}`; // Sierra-style depth sorting
    }
    
    /**
     * Make character walk to a destination point in Sierra style
     */
    public walkTo(x: number, y: number, onArrival?: () => void): void {
        this.destination = { x, y };
        this.isMoving = true;
        
        // Calculate direction for Sierra-style 4-direction movement
        this.updateFacingDirection();
        
        // Start Sierra-style walking animation
        this.playAnimation(`walk${this.facingDirection.charAt(0).toUpperCase() + this.facingDirection.slice(1)}`);
        
        // Start movement update loop
        if (this.animationInterval !== null) {
            window.clearInterval(this.animationInterval);
        }
        
        // Sierra style animation timer
        this.animationInterval = window.setInterval(() => {
            if (!this.isMoving) return;
            
            // Move character in Sierra-style grid movement
            const dx = this.destination!.x - this.position.x;
            const dy = this.destination!.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if arrived at destination (within Sierra-style step distance)
            if (distance <= this.moveSpeed) {
                this.setPosition(this.destination!.x, this.destination!.y);
                this.isMoving = false;
                this.destination = null;
                
                // Stop movement and return to idle
                this.playAnimation(`idle${this.facingDirection.charAt(0).toUpperCase() + this.facingDirection.slice(1)}`);
                
                if (this.animationInterval !== null) {
                    window.clearInterval(this.animationInterval);
                    this.animationInterval = null;
                }
                
                // Call arrival callback
                if (onArrival) onArrival();
                return;
            }
            
            // Sierra-style character movement - separate horizontal/vertical
            if (Math.abs(dx) > Math.abs(dy)) {
                // Move horizontally first (Sierra style)
                this.position.x += (dx > 0 ? this.moveSpeed : -this.moveSpeed);
                this.facingDirection = dx > 0 ? 'right' : 'left';
            } else {
                // Move vertically
                this.position.y += (dy > 0 ? this.moveSpeed : -this.moveSpeed);
                this.facingDirection = dy > 0 ? 'down' : 'up';
            }
            
            // Update Sierra animation based on direction
            this.playAnimation(`walk${this.facingDirection.charAt(0).toUpperCase() + this.facingDirection.slice(1)}`);
            
            // Update position
            this.setPosition(this.position.x, this.position.y);
        }, 33); // ~30fps like classic Sierra games
    }
    
    /**
     * Update which way character is facing in Sierra 4-direction style
     */
    private updateFacingDirection(): void {
        if (!this.destination) return;
        
        const dx = this.destination.x - this.position.x;
        const dy = this.destination.y - this.position.y;
        
        // Sierra-style direction priority
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement dominates
            this.facingDirection = dx > 0 ? 'right' : 'left';
        } else {
            // Vertical movement dominates
            this.facingDirection = dy > 0 ? 'down' : 'up';
        }
    }
    
    /**
     * Play Sierra-style character animation
     */
    private playAnimation(animationName: string): void {
        // Only change animation if it's different from current
        if (this.currentAnimation === animationName) {
            return;
        }
        
        this.currentAnimation = animationName;
        this.animationFrame = 0;
        
        // Get animation data
        const animation = this.animations[animationName];
        if (!animation) {
            console.error(`Animation not found: ${animationName}`);
            return;
        }
        
        // Update sprite with first frame
        this.updateSpriteFrame();
        
        // Start animation loop if animated
        if (animation.frameRate > 0 && animation.frames.length > 1) {
            if (this.animationInterval !== null) {
                window.clearInterval(this.animationInterval);
            }
            
            // Sierra style animation timing
            this.animationInterval = window.setInterval(() => {
                this.animationFrame = (this.animationFrame + 1) % animation.frames.length;
                this.updateSpriteFrame();
            }, animation.frameRate);
        }
    }
    
    /**
     * Update the sprite image with current animation frame
     */
    private updateSpriteFrame(): void {
        const animation = this.animations[this.currentAnimation];
        if (!animation) return;
        
        const frameImage = animation.frames[this.animationFrame];
        this.characterSprite.src = `./images/characters/${frameImage}`;
    }
    
    /**
     * Make character say something with Sierra-style text balloon
     */
    public say(text: string, duration: number = 3000): void {
        textBalloon.show(this.element, text, duration);
    }
    
    /**
     * Clean up resources
     */
    public dispose(): void {
        if (this.animationInterval !== null) {
            window.clearInterval(this.animationInterval);
        }
        
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
