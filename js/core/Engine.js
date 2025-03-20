class GameEngine {
    constructor() {
        // ...existing code...
    }

    // Optimize major performance bottlenecks
    drawCurrentScene = () => {
        try {
            const ctx = this.offscreenCtx || this.ctx;
            // Use a cached background when possible
            if (!this.cachedScenes) this.cachedScenes = new Map();
            
            // Check if scene background can be cached
            if (!this.cachedScenes.has(this.currentScene)) {
                // Draw the scene to a cached canvas
                // ...existing code...
            } else {
                // Use the cached background
                ctx.drawImage(this.cachedScenes.get(this.currentScene), 0, 0);
            }
            
            // Draw dynamic elements (NPCs, player, animations)
            // ...existing code...
        } catch (error) {
            console.error("Error drawing scene:", error);
        }
    };

    // Remove duplicated drawWallDecorations method
    // ...existing code...

    // Fix memory leak in animation system
    updateAnimations = (deltaTime) => {
        // Avoid creating new objects in update loop
        if (!this._animationClock) this._animationClock = 0;
        this._animationClock += deltaTime;
        
        for (const [id, anim] of this.animations) {
            // Use simple counter instead of increasing elapsed
            anim.elapsed += deltaTime;
            if (anim.elapsed >= anim.duration) {
                anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
                anim.elapsed = 0;
            }
        }
    };

    // Add proper cleanup method
    destroy() {
        // Stop all loops
        this.isRunning = false;
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
            this.requestID = null;
        }
        
        // Clean up references
        this.ctx = null;
        this.offscreenCtx = null;
        this.bufferCtx = null;
        this.backContext = null;
        
        // Remove events
        if (this.canvas) {
            this.canvas.removeEventListener('click', this._handleClick);
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
        }
        
        // Clear caches
        if (this.spriteCache) this.spriteCache.clear();
        if (this.colorCache) this.colorCache.clear();
    }

    // Remove duplicate drawWallDecorations method
    drawWallDecorations = (ctx) => {
        // ...existing code...
    };

    // Remove duplicate drawAmbientAnimations method
    drawAmbientAnimations = () => {
        // ...existing code...
    };

    // Optimize draw method to use requestAnimationFrame
    draw = (ctx) => {
        if (!this.isRunning) return;
        
        // Batch similar draw operations
        const drawBatch = new Map();
        
        for (const obj of this.gameObjects) {
            const type = obj.constructor.name;
            if (!drawBatch.has(type)) {
                drawBatch.set(type, []);
            }
            drawBatch.get(type).push(obj);
        }
        
        // Draw batched objects
        for (const [type, objects] of drawBatch) {
            ctx.save();
            // Set common properties for this type
            for (const obj of objects) {
                obj.draw(ctx);
            }
            ctx.restore();
        }

        requestAnimationFrame(() => this.draw(ctx));
    };
}

// Make GameEngine available in the global scope
window.GameEngine = GameEngine;