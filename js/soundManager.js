class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.currentMusic = null;
        this.isMuted = false;
        this.initialized = false;
        // Create the initialization promise
        this.initPromise = Promise.resolve();
    }

    async initialize() {
        if (!this.initialized) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        }
    }

    async loadSound(id, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(id, audioBuffer);
            return true;
        } catch (error) {
            console.error(`Failed to load sound ${id}:`, error);
            return false;
        }
    }

    async playSound(id) {
        if (!this.initialized || this.isMuted) return;
        
        try {
            const buffer = this.sounds.get(id);
            if (!buffer) {
                console.warn(`Sound ${id} not found`);
                return;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        } catch (error) {
            console.error(`Error playing sound ${id}:`, error);
        }
    }

    async playMusic(id) {
        if (!this.initialized || this.isMuted) return;
        
        try {
            // Stop current music if playing
            if (this.currentMusic) {
                this.currentMusic.stop();
                this.currentMusic = null;
            }

            const buffer = this.sounds.get(id);
            if (!buffer) {
                console.warn(`Music ${id} not found`);
                return;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.loop = true;
            source.start(0);
            this.currentMusic = source;
        } catch (error) {
            console.error(`Error playing music ${id}:`, error);
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.stop();
            } catch (error) {
                console.error('Error stopping music:', error);
            }
            this.currentMusic = null;
        }
    }
    
    // Add alias method for compatibility with engine.js
    stopBackgroundMusic() {
        return this.stopMusic();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        }
        return this.isMuted;
    }

    // Initialize on first user interaction
    handleUserInteraction() {
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        } else if (!this.initialized) {
            this.initialize();
        }
    }

    // Initialize audio specifically for mobile
    async initMobileAudio() {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

// Initialize sound manager
window.soundManager = new SoundManager();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    const manager = window.soundManager;
    await manager.initialize();
    await manager.initMobileAudio();
});

// Add event listeners for user interaction
document.addEventListener('click', () => {
    if (window.soundManager) {
        window.soundManager.handleUserInteraction();
    }
}, { once: true });

document.addEventListener('keydown', () => {
    if (window.soundManager) {
        window.soundManager.handleUserInteraction();
    }
}, { once: true });
