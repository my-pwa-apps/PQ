/**
 * ParticleSystem.js
 * Advanced particle system for visual effects in Police Quest
 */
class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 100;
        this.emitters = new Map();
        
        // Particle pool for performance
        this.particlePool = [];
        this.poolSize = 200;
        this.initPool();
    }
    
    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.particlePool.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 1.0, maxLife: 1.0,
            size: 1, maxSize: 1,
            color: '#FFFFFF',
            alpha: 1.0,
            gravity: 0,
            active: false,
            type: 'basic'
        };
    }
    
    getParticle() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return this.createParticle(); // Fallback if pool is exhausted
    }
    
    releaseParticle(particle) {
        particle.active = false;
    }
    
    // Dust particles for walking
    createDustEffect(x, y) {
        for (let i = 0; i < 3; i++) {
            const particle = this.getParticle();
            particle.x = x + (Math.random() - 0.5) * 10;
            particle.y = y + (Math.random() - 0.5) * 5;
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = -Math.random() * 0.5;
            particle.life = particle.maxLife = 0.5 + Math.random() * 0.5;
            particle.size = particle.maxSize = 1 + Math.random() * 2;
            particle.color = '#8B7355';
            particle.alpha = 0.6;
            particle.gravity = 0.01;
            particle.type = 'dust';
            this.particles.push(particle);
        }
    }
    
    // Coffee steam effect
    createSteamEffect(x, y) {
        const particle = this.getParticle();
        particle.x = x + (Math.random() - 0.5) * 5;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 0.1;
        particle.vy = -0.5 - Math.random() * 0.5;
        particle.life = particle.maxLife = 2.0 + Math.random();
        particle.size = particle.maxSize = 2 + Math.random() * 3;
        particle.color = '#E0E0E0';
        particle.alpha = 0.4;
        particle.gravity = -0.005;
        particle.type = 'steam';
        this.particles.push(particle);
    }
    
    // Police car emergency lights
    createPoliceLight(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = this.getParticle();
            const angle = (i / 8) * Math.PI * 2;
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * 2;
            particle.vy = Math.sin(angle) * 2;
            particle.life = particle.maxLife = 0.3;
            particle.size = particle.maxSize = 3 + Math.random() * 2;
            particle.color = color;
            particle.alpha = 0.8;
            particle.gravity = 0;
            particle.type = 'light';
            this.particles.push(particle);
        }
    }
    
    // Evidence collection sparkle
    createSparkleEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            const particle = this.getParticle();
            const angle = (i / 12) * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = particle.maxLife = 1.0 + Math.random() * 0.5;
            particle.size = particle.maxSize = 2 + Math.random() * 2;
            particle.color = '#FFD700';
            particle.alpha = 1.0;
            particle.gravity = 0.01;
            particle.type = 'sparkle';
            this.particles.push(particle);
        }
    }
    
    // Rain effect for outdoor scenes
    addRainEmitter() {
        this.emitters.set('rain', {
            x: 0, y: 0, width: 800, height: 50,
            rate: 5, // particles per frame
            active: true,
            createParticle: () => {
                const particle = this.getParticle();
                particle.x = Math.random() * 800;
                particle.y = -10;
                particle.vx = -0.5 - Math.random() * 0.5;
                particle.vy = 3 + Math.random() * 2;
                particle.life = particle.maxLife = 3.0;
                particle.size = particle.maxSize = 1;
                particle.color = '#87CEEB';
                particle.alpha = 0.6;
                particle.gravity = 0.1;
                particle.type = 'rain';
                return particle;
            }
        });
    }
    
    update(deltaTime) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            
            // Update life
            particle.life -= deltaTime / 1000;
            
            // Update visual properties based on life
            const lifeRatio = particle.life / particle.maxLife;
            particle.alpha = Math.max(0, lifeRatio);
            
            if (particle.type === 'steam') {
                particle.size = particle.maxSize * (1 - lifeRatio * 0.5);
            } else if (particle.type === 'sparkle') {
                particle.size = particle.maxSize * (0.5 + lifeRatio * 0.5);
            }
            
            // Remove dead particles
            if (particle.life <= 0 || particle.y > 650) {
                this.releaseParticle(particle);
                this.particles.splice(i, 1);
            }
        }
        
        // Update emitters
        for (const [name, emitter] of this.emitters) {
            if (emitter.active) {
                for (let i = 0; i < emitter.rate; i++) {
                    if (this.particles.length < this.maxParticles) {
                        this.particles.push(emitter.createParticle());
                    }
                }
            }
        }
    }
    
    render() {
        this.ctx.save();
        
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'rain') {
                // Draw rain as lines
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = particle.size;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x + particle.vx * 3, particle.y + particle.vy * 3);
                this.ctx.stroke();
            } else if (particle.type === 'sparkle') {
                // Draw sparkles as stars
                this.drawStar(particle.x, particle.y, particle.size);
            } else {
                // Draw as circles
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    drawStar(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const radius = i % 2 === 0 ? size : size * 0.5;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    
    clear() {
        for (const particle of this.particles) {
            this.releaseParticle(particle);
        }
        this.particles.length = 0;
    }
    
    setEmitterActive(name, active) {
        const emitter = this.emitters.get(name);
        if (emitter) {
            emitter.active = active;
        }
    }
}

// Export ParticleSystem to window
window.ParticleSystem = ParticleSystem;
