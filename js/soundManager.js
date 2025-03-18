class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.currentMusic = null;
        this.isMuted = false;
        this.initialized = false;
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            // Wait for audio context to be created and ready
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            await this.audioContext.resume();
            
            // Pre-load common sounds
            await this.loadSound('click', 'audio/click.mp3');
            await this.loadSound('station_theme', 'audio/station_theme.mp3');
            await this.loadSound('downtown_theme', 'audio/downtown_theme.mp3');
            
            this.initialized = true;
            console.log('Sound Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Sound Manager:', error);
            // Don't block game loading on audio failure
            this.initialized = false;
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

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        }
        return this.isMuted;
    }
}

// Initialize sound manager
window.soundManager = new SoundManager();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = window.soundManager;
    manager.initPromise.then(() => {
        manager.initMobileAudio();
    });
});
