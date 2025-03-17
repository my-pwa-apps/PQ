class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.masterVolume = 0.7;
        this.soundEnabled = true;
        this.audioContext = null;
        this.gainNode = null;
        this.bufferCache = new Map();
        
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    async loadSound(name, url) {
        if (this.bufferCache.has(url)) {
            this.sounds.set(name, this.bufferCache.get(url));
            return;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
            this.bufferCache.set(url, audioBuffer);
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    playSound(name, volume = 1.0, loop = false) {
        if (!this.soundEnabled || !this.audioContext) return;

        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`Sound not found: ${name}`);
            return;
        }

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = sound;
            source.loop = loop;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume * this.masterVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            
            // Cleanup when sound finishes
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };

            return source;
        } catch (error) {
            console.error(`Error playing sound ${name}:`, error);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.gainNode) {
            this.gainNode.gain.value = this.soundEnabled ? this.masterVolume : 0;
        }
    }

    // Add support for handling mobile audio unlocking
    initMobileAudio() {
        const unlockAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('click', unlockAudio);
        };
        
        document.addEventListener('touchstart', unlockAudio);
        document.addEventListener('click', unlockAudio);
    }
}

// Initialize sound manager and export as global
window.soundManager = new SoundManager();

// Load common sounds when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = window.soundManager;
    manager.loadSound('click', 'sounds/click.mp3');
    manager.loadSound('error', 'sounds/error.mp3');
    manager.loadSound('footsteps', 'sounds/footsteps.mp3');
    manager.loadSound('door', 'sounds/door.mp3');
    manager.initMobileAudio();
});
