class SoundManager {
    constructor() {
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn('WebAudio API is not supported in this browser. Game will continue without sound.');
            this.audioSupported = false;
            return;
        }
        this.audioSupported = true;

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
        this.buffers = new Map();
        this.gainNodes = new Map();
        this.lastPlayTime = new Map();
        this.activeGenerators = new Map(); // For tracking active procedural sounds
        this.backgroundMusic = null;
        this.currentBackgroundMusic = null;
        this.backgroundMusicVolume = 0.3;
        this.initialized = false;
        this.playbackThrottle = 50; // ms between same sound replay
        
        // Master volume control
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        
        // Background music volume control
        this.backgroundMusicGain = this.context.createGain();
        this.backgroundMusicGain.connect(this.masterGain);
        this.backgroundMusicGain.gain.value = 0.3;
        
        // Generate default procedural sounds
        this.generateSilentBuffer();

        // Generate common UI sounds
        this.generateUISound('click');
        this.generateUISound('error');
    }

    // Generate a silent buffer for fallbacks
    generateSilentBuffer() {
        const sampleRate = this.context.sampleRate;
        const buffer = this.context.createBuffer(2, sampleRate * 2, sampleRate);
        this.buffers.set('silent', buffer);
    }

    // Generate UI sound effects
    generateUISound(id) {
        const sampleRate = this.context.sampleRate;
        const duration = id === 'click' ? 0.1 : 0.3; // Short duration for UI sounds
        const buffer = this.context.createBuffer(2, sampleRate * duration, sampleRate);
        
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            if (id === 'click') {
                // Create a click sound
                sample = Math.sin(2 * Math.PI * 800 * time) * Math.exp(-15 * time);
            } else if (id === 'error') {
                // Create an error sound (lower tone)
                sample = Math.sin(2 * Math.PI * 300 * time) * Math.exp(-8 * time);
            }
            
            leftChannel[i] = sample;
            rightChannel[i] = sample;
        }
        
        this.buffers.set(id, buffer);
    }

    // Generate music procedurally based on the provided ID
    generateMusic(id) {
        const sampleRate = this.context.sampleRate;
        const duration = 5; // 5 seconds of audio
        const buffer = this.context.createBuffer(2, sampleRate * duration, sampleRate);
        
        // Generate audio data based on the id
        switch(id) {
            case 'station_theme':
                this.generateStationTheme(buffer);
                break;
            default:
                this.generateDefaultTheme(buffer, id);
                break;
        }
        
        return buffer;
    }
    
    // Generate police station theme
    generateStationTheme(buffer) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = this.context.sampleRate;
        
        // Simple ambient police station sounds (low hum and occasional beeps)
        const baseFreq = 120; // Base frequency for the hum
        
        for (let i = 0; i < buffer.length; i++) {
            // Create a low ambient hum
            const time = i / sampleRate;
            const hum = Math.sin(2 * Math.PI * baseFreq * time) * 0.1;
            
            // Add some random beeps every second
            const beep = (time % 1.0 > 0.95) ? 
                Math.sin(2 * Math.PI * 880 * time) * 0.05 * ((time % 1.0 - 0.95) * 20) : 
                0;
                
            // Add subtle white noise for ambience
            const noise = (Math.random() * 2 - 1) * 0.02;
            
            leftChannel[i] = hum + beep + noise;
            rightChannel[i] = hum + beep + noise;
        }
    }
    
    // Generate a default theme based on the ID string
    generateDefaultTheme(buffer, id) {
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        const sampleRate = this.context.sampleRate;
        
        // Use the ID string to seed a pseudo-random melody
        let seed = 0;
        for (let i = 0; i < id.length; i++) {
            seed += id.charCodeAt(i);
        }
        
        // Generate base frequency from the seed
        const baseFreq = 100 + (seed % 200);
        
        // Create a simple melody based on the seed
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const period = Math.floor(time * 2) % 8;
            
            // Change notes based on the period
            const noteFreq = baseFreq * [1, 1.2, 1.5, 0.8, 1, 1.2, 1.8, 1.5][period];
            
            // Create a tone with gentle fade in/out
            const envelope = 0.1 + 0.1 * Math.sin(Math.PI * (time % 0.5) / 0.5);
            const tone = Math.sin(2 * Math.PI * noteFreq * time) * envelope;
            
            // Add subtle noise
            const noise = (Math.random() * 2 - 1) * 0.02;
            
            leftChannel[i] = tone + noise;
            rightChannel[i] = tone + noise;
        }
    }

    // Load a pre-recorded sound (keeping for compatibility)
    async loadSound(id, url) {
        if (!this.audioSupported) return;
        if (this.buffers.has(id)) return;

        try {
            // Instead of loading from URL, generate procedurally
            console.log(`Generating procedural sound for ${id}`);
            const buffer = this.generateMusic(id);
            this.buffers.set(id, buffer);
        } catch (error) {
            console.error(`Error generating sound ${id}:`, error);
            // Fallback to silent buffer
            if (!this.buffers.has('silent')) {
                this.generateSilentBuffer();
            }
            this.buffers.set(id, this.buffers.get('silent'));
        }
    }

    // New function to match what engine.js is calling
    playSound(id, volume = 1.0) {
        return this.play(id, volume, false);
    }

    play(id, volume = 1.0, loop = false) {
        if (!this.audioSupported) return null;
        
        // If the sound doesn't exist yet, generate it
        if (!this.buffers.has(id)) {
            this.loadSound(id);
        }
        
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
            if (!source.loop) { // Only remove if not looping
                this.sounds.delete(source);
                gainNode.disconnect();
            }
        };

        return source;
    }

    async playBackgroundMusic(id = 'station_theme') {
        if (!this.audioSupported) return null;
        
        // Ensure the sound is generated
        if (!this.buffers.has(id)) {
            console.log(`Generating background music '${id}'...`);
            this.loadSound(id);
            if (!this.buffers.has(id)) {
                console.error(`Failed to generate background music '${id}'`);
                return null;
            }
        }

        // Stop any current background music
        if (this.currentBackgroundMusic) {
            this.stopBackgroundMusic();
        }

        // Create and play the background music
        const source = this.play(id, this.backgroundMusicVolume, true);
        if (source) {
            this.currentBackgroundMusic = source;
        }
        return source;
    }

    stopBackgroundMusic() {
        if (!this.audioSupported) return;
        if (this.currentBackgroundMusic) {
            this.currentBackgroundMusic.stop();
            this.currentBackgroundMusic = null;
        }
    }

    stop(source) {
        if (!this.audioSupported) return;
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
        if (!this.audioSupported) return;
        this.stopBackgroundMusic();
        for (const [source] of this.sounds) {
            this.stop(source);
        }
    }

    setMasterVolume(volume) {
        if (!this.audioSupported) return;
        this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    setVolume(source, volume) {
        if (!this.audioSupported) return;
        if (source && this.sounds.has(source)) {
            const { gainNode } = this.sounds.get(source);
            gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    setBackgroundMusicVolume(volume) {
        if (!this.audioSupported) return;
        this.backgroundMusicGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    resume() {
        if (!this.audioSupported) return;
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    initMobileAudio() {
        if (!this.audioSupported) return;
        // Resume audio context on user interaction
        const resumeAudio = () => {
            if (this.context.state === 'suspended') {
                this.context.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                });
            }
            document.removeEventListener('touchstart', resumeAudio);
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
        };
        
        document.addEventListener('touchstart', resumeAudio);
        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
    }
}

// Initialize sound manager
window.soundManager = new SoundManager();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = window.soundManager;
    manager.initMobileAudio();
});
