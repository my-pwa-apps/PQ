class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.currentMusic = null;
        this.isMuted = false;
    }

    async initialize() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async loadSound(id, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(id, audioBuffer);
        } catch (error) {
            console.error(`Failed to load sound ${id}:`, error);
        }
    }

    playSound(id) {
        if (this.isMuted) return;
        const buffer = this.sounds.get(id);
        if (!buffer) return;
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.currentMusic) {
            this.currentMusic.stop();
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
