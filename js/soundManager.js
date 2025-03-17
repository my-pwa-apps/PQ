class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
        this.buffers = new Map();
        this.gainNodes = new Map();
        this.lastPlayTime = new Map();
        
        // Add rate limiting to prevent sound spam
        this.playbackThrottle = 50; // ms between same sound replay
        
        // Master volume control
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
    }

    async loadSound(id, url) {
        if (this.buffers.has(id)) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.buffers.set(id, audioBuffer);
        } catch (error) {
            console.error(`Error loading sound ${id}:`, error);
        }
    }

    play(id, volume = 1.0, loop = false) {
        const buffer = this.buffers.get(id);
        if (!buffer) return null;

        // Rate limiting check
        const now = performance.now();
        const lastPlay = this.lastPlayTime.get(id) || 0;
        if (now - lastPlay < this.playbackThrottle) return null;
        
        this.lastPlayTime.set(id, now);

        // Create and configure source
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;

        // Create and configure gain node
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Store references
        this.sounds.set(source, {
            id,
            gainNode,
            startTime: this.context.currentTime
        });
        
        // Start playback
        source.start(0);
        
        // Cleanup when finished
        source.onended = () => {
            this.sounds.delete(source);
            gainNode.disconnect();
        };

        return source;
    }

    stop(source) {
        if (source && this.sounds.has(source)) {
            const { gainNode } = this.sounds.get(source);
            
            // Fade out to prevent clicks
            const fadeTime = 0.1;
            const currentTime = this.context.currentTime;
            gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime);
            
            // Stop after fade
            setTimeout(() => {
                source.stop();
                this.sounds.delete(source);
                gainNode.disconnect();
            }, fadeTime * 1000);
        }
    }

    stopAll() {
        for (const [source] of this.sounds) {
            this.stop(source);
        }
    }

    setMasterVolume(volume) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    setVolume(source, volume) {
        if (source && this.sounds.has(source)) {
            const { gainNode } = this.sounds.get(source);
            gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    resume() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}

// Initialize sound manager
window.soundManager = new SoundManager();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = window.soundManager;
    manager.initMobileAudio();
});
