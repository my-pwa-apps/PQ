class SoundManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.sounds = new Map();
        this.musicPatterns = new Map();
        this.currentMusic = '';
        this.audioCtx = null;
        this.musicInterval = null;
        this.activeOscillators = [];
    }

    initAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    }

    generateSound(frequency, duration, type = 'square', volume = 0.3) {
        const audioCtx = this.initAudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
        
        // Track active oscillators for cleanup
        this.activeOscillators.push({ oscillator, gainNode });
        
        // Remove from tracking once completed
        setTimeout(() => {
            const index = this.activeOscillators.findIndex(item => item.oscillator === oscillator);
            if (index !== -1) this.activeOscillators.splice(index, 1);
            oscillator.disconnect();
            gainNode.disconnect();
        }, duration * 1000);
        
        return { oscillator, gainNode };
    }

    // Create a melody that plays as background music
    playMusic(key) {
        if (this.currentMusic === key) return;
        this.stopMusic();
        this.currentMusic = key;
        
        const audioCtx = this.initAudioContext();
        let noteIndex = 0;
        
        // Define different music patterns
        const patterns = {
            'station_theme': [
                { note: 220, duration: 0.2 },
                { note: 277.18, duration: 0.2 },
                { note: 329.63, duration: 0.3 },
                { note: 220, duration: 0.2 },
                { note: 277.18, duration: 0.2 },
                { note: 329.63, duration: 0.3 },
                { note: 440, duration: 0.4 },
                { note: 329.63, duration: 0.4 }
            ],
            'downtown_theme': [
                { note: 196, duration: 0.3 },
                { note: 220, duration: 0.3 },
                { note: 246.94, duration: 0.3 },
                { note: 261.63, duration: 0.5 },
                { note: 246.94, duration: 0.3 },
                { note: 220, duration: 0.3 },
                { note: 196, duration: 0.5 }
            ],
            'park_theme': [
                { note: 392, duration: 0.2 },
                { note: 440, duration: 0.2 },
                { note: 493.88, duration: 0.4 },
                { note: 392, duration: 0.2 },
                { note: 440, duration: 0.2 },
                { note: 329.63, duration: 0.4 }
            ],
            'case_start': [
                { note: 523.25, duration: 0.2 },
                { note: 587.33, duration: 0.2 },
                { note: 659.25, duration: 0.3 },
                { note: 698.46, duration: 0.4 },
                { note: 783.99, duration: 0.6 }
            ]
        };
        
        // Play pattern in loop
        if (patterns[key]) {
            this.musicInterval = setInterval(() => {
                if (audioCtx.state === 'suspended') {
                    // Try to resume audio context if it was suspended
                    audioCtx.resume();
                    return;
                }
                const note = patterns[key][noteIndex];
                this.generateSound(note.note, note.duration, 'square', 0.1);
                noteIndex = (noteIndex + 1) % patterns[key].length;
            }, 500);
        }
    }

    playSound(key) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound();
        }
    }

    loadSound(key, frequency, duration, type) {
        this.sounds.set(key, () => this.generateSound(frequency, duration, type));
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        
        // Clean up any active oscillators
        this.activeOscillators.forEach(({ oscillator, gainNode }) => {
            try {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            } catch (e) {
                // Ignore errors from already stopped oscillators
            }
        });
        this.activeOscillators = [];
        
        this.currentMusic = '';
    }
    
    // Call this when game is paused or page is unloaded
    cleanup() {
        this.stopMusic();
        if (this.audioCtx) {
            this.audioCtx.close().catch(e => console.error("Error closing audio context:", e));
            this.audioCtx = null;
        }
    }
}

const soundManager = new SoundManager();

// Load sounds
soundManager.loadSound('click', 880, 0.1, 'square');
soundManager.loadSound('pickup', 660, 0.2, 'triangle');
soundManager.loadSound('error', 220, 0.3, 'sawtooth');
soundManager.loadSound('evidence', 440, 0.5, 'triangle');
soundManager.loadSound('success', 880, 0.1, 'sine');

// Cleanup sounds when page unloads
window.addEventListener('beforeunload', () => {
    soundManager.cleanup();
});
