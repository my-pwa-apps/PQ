class PoliceBadge {
    private position: { x: number; y: number };
    private parentCharacter: any;
    private scale: number = 1.2;

    constructor(character: any) {
        this.parentCharacter = character;
        this.updatePosition();
    }

    updatePosition() {
        if (!this.parentCharacter) return;
        
        const charPos = this.parentCharacter.getPosition();
        const facing = this.parentCharacter.getFacing();
        
        // Badge position is relative to character position and facing direction
        // These offsets match the drawPixelCharacter badge positioning
        if (facing === 'left') {
            this.position = {
                x: charPos.x - 5 * this.scale,
                y: charPos.y - 10 * this.scale
            };
        } else if (facing === 'right') {
            this.position = {
                x: charPos.x + 1 * this.scale,
                y: charPos.y - 10 * this.scale
            };
        } else {
            this.position = {
                x: charPos.x - 5 * this.scale,
                y: charPos.y - 10 * this.scale
            };
        }
    }

    getPosition() {
        return this.position;
    }

    setScale(scale: number) {
        this.scale = scale;
        this.updatePosition();
    }
}
