/**
 * SoundManager.js
 * Audio management system for Police Quest
 * Handles background music and sound effects
 */
class SoundManager {
    constructor() {
        // Main audio context
        this.audioContext = null;
        
        // Sound collections
        this.sounds = new Map();
        this.music = new Map();
        
        // Current state
        this.currentMusic = null;
        this.musicVolume = 0.4;
        this.sfxVolume = 0.6;
        this.isMuted = false;
        
        // Track what's currently playing
        this.activeSounds = new Map();
        this.activeMusicSource = null;
        
        // Settings
        this.maxConcurrentSounds = 8;
        
        // Mobile audio unlock status
        this.mobileAudioEnabled = false;
        
        // Debug flag
        this.debug = false;
    }

    /**
     * Initialize the sound system
     * @returns {Promise} Resolves when initialization is complete
     */
    async initialize() {
        try {
            // Create audio context using the standard Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                this.logError("Web Audio API not supported in this browser.");
                return false;
            }
            
            this.audioContext = new AudioContext();
            
            // Create main gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Set initial volumes
            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            
            // Connect everything
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Load sound effects
            await this.loadSoundEffects();
            
            // Load music tracks
            await this.loadMusicTracks();
            
            // Set up mobile audio unlocking
            this.setupMobileAudio();
            
            this.log("Sound system initialized successfully");
            return true;
        } catch (error) {
            this.logError("Failed to initialize sound system:", error);
            return false;
        }
    }
    
    /**
     * Set up special handling for mobile audio
     * This addresses the mobile browser restrictions on audio playback
     */
    setupMobileAudio() {
        // Function to unlock audio on mobile devices
        const unlockAudio = () => {
            if (this.mobileAudioEnabled) return;
            
            // Create and play a silent buffer to unlock audio on mobile
            if (this.audioContext) {
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                
                // Play the source (using both the new promise and older approach for compatibility)
                if (source.start) {
                    source.start(0);
                } else if (source.noteOn) {
                    source.noteOn(0);
                }
                
                // Resume audio context (needed for newer browsers)
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                this.mobileAudioEnabled = true;
                this.log("Mobile audio unlocked");
            }
            
            // Remove the event listeners once audio is unlocked
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('touchend', unlockAudio);
            document.removeEventListener('click', unlockAudio);
        };
        
        // Add event listeners to unlock audio
        document.addEventListener('touchstart', unlockAudio, false);
        document.addEventListener('touchend', unlockAudio, false);
        document.addEventListener('click', unlockAudio, false);
    }
    
    /**
     * Explicit method to initialize mobile audio
     * Can be called manually if needed
     */
    initMobileAudio() {
        if (!this.mobileAudioEnabled && this.audioContext) {
            // Create and play a silent buffer
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            
            if (source.start) {
                source.start(0);
            } else if (source.noteOn) {
                source.noteOn(0);
            }
            
            // Resume audio context
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.mobileAudioEnabled = true;
            this.log("Mobile audio explicitly initialized");
        }
    }

    /**
     * Load all sound effects
     */
    async loadSoundEffects() {
        try {
            const soundEffects = [
                { name: 'click', url: 'sounds/click.wav' },
                { name: 'typing', url: 'sounds/typing.wav' },
                { name: 'door', url: 'sounds/door.wav' },
                { name: 'success', url: 'sounds/success.wav' },
                { name: 'error', url: 'sounds/error.wav' },
                { name: 'radio', url: 'sounds/radio.wav' },
                { name: 'footstep', url: 'sounds/footstep.wav' }
            ];
            
            // Load each sound effect
            const loadPromises = soundEffects.map(sound => {
                return this.loadSound(sound.name, sound.url);
            });
            
            // Wait for all sounds to load
            await Promise.all(loadPromises);
            return true;
        } catch (error) {
            this.logError("Error loading sound effects:", error);
            return false;
        }
    }
    
    /**
     * Load all music tracks
     */
    async loadMusicTracks() {
        try {
            const musicTracks = [
                { name: 'station_theme', url: 'music/station_theme.mp3' },
                { name: 'downtown_theme', url: 'music/downtown_theme.mp3' },
                { name: 'park_theme', url: 'music/park_theme.mp3' },
                { name: 'suspense', url: 'music/suspense.mp3' },
                { name: 'action', url: 'music/action.mp3' }
            ];
            
            // Load each music track
            const loadPromises = musicTracks.map(track => {
                return this.loadMusic(track.name, track.url);
            });
            
            // Wait for all music to load
            await Promise.all(loadPromises);
            return true;
        } catch (error) {
            this.logError("Error loading music tracks:", error);
            return false;
        }
    }
    
    /**
     * Load a single sound effect
     * @param {string} name - Identifier for the sound
     * @param {string} url - URL to the sound file
     * @returns {Promise} Resolves when the sound is loaded
     */
    async loadSound(name, url) {
        if (!this.audioContext) return Promise.reject('Audio context not initialized');
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch sound: ${response.status} ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, audioBuffer);
            this.log(`Loaded sound: ${name}`);
            return audioBuffer;
        } catch (error) {
            this.logError(`Error loading sound "${name}" from ${url}:`, error);
            
            // Create a silent buffer as fallback
            const fallbackBuffer = this.createSilentBuffer(0.5);
            this.sounds.set(name, fallbackBuffer);
            
            // Don't reject - allow the game to continue with a silent sound
            return fallbackBuffer;
        }
    }
    
    /**
     * Load a single music track
     * @param {string} name - Identifier for the music track
     * @param {string} url - URL to the music file
     * @returns {Promise} Resolves when the music is loaded
     */
    async loadMusic(name, url) {
        if (!this.audioContext) return Promise.reject('Audio context not initialized');
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch music: ${response.status} ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.decodeAudioData(arrayBuffer);
            
            this.music.set(name, audioBuffer);
            this.log(`Loaded music track: ${name}`);
            return audioBuffer;
        } catch (error) {
            this.logError(`Error loading music "${name}" from ${url}:`, error);
            
            // Create a silent buffer as fallback
            const fallbackBuffer = this.createSilentBuffer(30);  // 30 seconds of silence
            this.music.set(name, fallbackBuffer);
            
            return fallbackBuffer;
        }
    }
    
    /**
     * Utility to create a silent audio buffer
     * @param {number} duration - Duration in seconds
     * @returns {AudioBuffer} Silent audio buffer
     */
    createSilentBuffer(duration = 1) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(
            2,  // stereo
            sampleRate * duration,
            sampleRate
        );
        
        // Both channels remain silent (all zeros)
        return buffer;
    }
    
    /**
     * Helper for decoding audio data with proper Promise handling
     * @param {ArrayBuffer} arrayBuffer - Audio data to decode
     * @returns {Promise<AudioBuffer>} Decoded audio buffer
     */
    decodeAudioData(arrayBuffer) {
        return new Promise((resolve, reject) => {
            if (!this.audioContext) {
                reject(new Error('Audio context not initialized'));
                return;
            }
            
            // Handle both callback and Promise-based APIs
            const decodeSuccess = (buffer) => resolve(buffer);
            const decodeError = (err) => reject(err || new Error('Decoding error'));
            
            // Try the newer Promise version first
            const decodePromise = this.audioContext.decodeAudioData(arrayBuffer, decodeSuccess, decodeError);
            
            // If the function returns a Promise (newer browsers), handle it
            if (decodePromise && decodePromise instanceof Promise) {
                decodePromise.catch(reject);
            }
        });
    }

    /**
     * Play a sound effect
     * @param {string} name - Name of the sound to play
     * @param {number} [volume=1] - Volume scale (0-1)
     * @param {number} [pan=0] - Stereo pan (-1 to 1)
     * @returns {object|null} Sound control object or null if failed
     */
    playSound(name, volume = 1, pan = 0) {
        if (!this.audioContext || this.isMuted) return null;
        
        try {
            // Ensure the audio context is running
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Get the audio buffer
            const buffer = this.sounds.get(name);
            if (!buffer) {
                this.logError(`Sound "${name}" not found.`);
                return null;
            }
            
            // Limit concurrent sounds
            if (this.activeSounds.size >= this.maxConcurrentSounds) {
                // Find and stop the oldest sound
                const oldestSound = Array.from(this.activeSounds.entries())[0];
                if (oldestSound) {
                    this.stopSound(oldestSound[0]);
                }
            }
            
            // Create source node
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = Math.min(1, Math.max(0, volume)) * this.sfxVolume;
            
            // Create stereo panner if needed
            let outputNode = gainNode;
            if (pan !== 0 && this.audioContext.createStereoPanner) {
                const pannerNode = this.audioContext.createStereoPanner();
                pannerNode.pan.value = Math.min(1, Math.max(-1, pan));
                source.connect(pannerNode);
                pannerNode.connect(gainNode);
                outputNode = pannerNode;
            } else {
                source.connect(gainNode);
            }
            
            // Connect to the effects channel
            gainNode.connect(this.sfxGain);
            
            // Generate a unique ID for this sound instance
            const id = `${name}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            // Start the sound
            source.start(0);
            
            // Store reference to active sound
            this.activeSounds.set(id, { source, gainNode, name, startTime: this.audioContext.currentTime });
            
            // Remove from active sounds when done
            source.onended = () => {
                this.activeSounds.delete(id);
            };
            
            // Return control object
            return {
                id,
                stop: () => this.stopSound(id),
                setVolume: (vol) => {
                    const sound = this.activeSounds.get(id);
                    if (sound && sound.gainNode) {
                        sound.gainNode.gain.value = Math.min(1, Math.max(0, vol)) * this.sfxVolume;
                    }
                }
            };
        } catch (error) {
            this.logError(`Error playing sound "${name}":`, error);
            return null;
        }
    }
    
    /**
     * Stop a specific sound instance
     * @param {string} id - ID of the sound instance to stop
     */
    stopSound(id) {
        const sound = this.activeSounds.get(id);
        if (sound && sound.source) {
            try {
                sound.source.stop();
            } catch (error) {
                // Already stopped or ended
            }
            this.activeSounds.delete(id);
        }
    }
    
    /**
     * Stop all currently playing sounds
     */
    stopAllSounds() {
        for (const id of this.activeSounds.keys()) {
            this.stopSound(id);
        }
    }

    /**
     * Play background music
     * @param {string} name - Name of the music track
     * @param {boolean} [loop=true] - Whether the music should loop
     * @param {number} [fadeInTime=1] - Fade-in time in seconds
     */
    playBackgroundMusic(name, loop = true, fadeInTime = 1) {
        if (!this.audioContext) return;
        
        try {
            // First stop any current music
            this.stopBackgroundMusic(fadeInTime > 0 ? fadeInTime / 2 : 0);
            
            // Ensure the audio context is running
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Get the music buffer
            const buffer = this.music.get(name);
            if (!buffer) {
                this.logError(`Music track "${name}" not found.`);
                return;
            }
            
            // Create source node
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = loop;
            
            // Create gain node for fade-in
            const gainNode = this.audioContext.createGain();
            
            // Start with zero volume for fade-in
            if (fadeInTime > 0) {
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    this.musicVolume, 
                    this.audioContext.currentTime + fadeInTime
                );
            } else {
                gainNode.gain.value = this.musicVolume;
            }
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.musicGain);
            
            // Start the music
            source.start(0);
            
            // Store reference to active music
            this.activeMusicSource = { source, gainNode, name };
            this.currentMusic = name;
            
            this.log(`Playing music: ${name}`);
        } catch (error) {
            this.logError(`Error playing music "${name}":`, error);
        }
    }
    
    /**
     * Stop currently playing background music
     * @param {number} [fadeOutTime=1] - Fade-out time in seconds
     */
    stopBackgroundMusic(fadeOutTime = 1) {
        if (!this.activeMusicSource || !this.activeMusicSource.source || !this.activeMusicSource.gainNode) {
            this.currentMusic = null;
            this.activeMusicSource = null;
            return;
        }
        
        try {
            const { source, gainNode } = this.activeMusicSource;
            
            if (fadeOutTime > 0) {
                // Capture current time
                const now = this.audioContext.currentTime;
                
                // Schedule a fade-out
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(0, now + fadeOutTime);
                
                // Stop the source after fade-out
                source.stop(now + fadeOutTime + 0.01);
            } else {
                // Stop immediately
                source.stop();
            }
            
            // Clear the reference
            this.currentMusic = null;
            this.activeMusicSource = null;
            
            this.log('Background music stopped');
        } catch (error) {
            this.logError('Error stopping background music:', error);
            
            // Make sure we clear the reference even if there's an error
            this.currentMusic = null;
            this.activeMusicSource = null;
        }
    }
    
    /**
     * Pause currently playing background music
     */
    pauseBackgroundMusic() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
            this.log('Background music paused');
        }
    }
    
    /**
     * Resume paused background music
     */
    resumeBackgroundMusic() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            this.log('Background music resumed');
        }
    }

    /**
     * Set the master volume
     * @param {number} volume - Master volume level (0-1)
     */
    setMasterVolume(volume) {
        if (!this.audioContext || !this.masterGain) return;
        
        const safeVolume = Math.min(1, Math.max(0, volume));
        this.masterGain.gain.value = safeVolume;
    }
    
    /**
     * Set the music volume
     * @param {number} volume - Music volume level (0-1)
     */
    setMusicVolume(volume) {
        if (!this.audioContext || !this.musicGain) return;
        
        const safeVolume = Math.min(1, Math.max(0, volume));
        this.musicVolume = safeVolume;
        this.musicGain.gain.value = safeVolume;
    }
    
    /**
     * Set the sound effects volume
     * @param {number} volume - SFX volume level (0-1)
     */
    setSfxVolume(volume) {
        if (!this.audioContext || !this.sfxGain) return;
        
        const safeVolume = Math.min(1, Math.max(0, volume));
        this.sfxVolume = safeVolume;
        this.sfxGain.gain.value = safeVolume;
    }
    
    /**
     * Mute all audio
     */
    mute() {
        if (this.isMuted) return;
        
        if (this.masterGain) {
            // Store current values before muting
            this.preMuteVolume = this.masterGain.gain.value;
            this.masterGain.gain.value = 0;
        }
        
        this.isMuted = true;
    }
    
    /**
     * Unmute audio
     */
    unmute() {
        if (!this.isMuted) return;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.preMuteVolume || 1;
        }
        
        this.isMuted = false;
    }
    
    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
        return this.isMuted;
    }
    
    /**
     * Check if a sound is currently playing
     * @param {string} name - Name of the sound
     * @returns {boolean} True if the sound is playing
     */
    isSoundPlaying(name) {
        for (const sound of this.activeSounds.values()) {
            if (sound.name === name) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if any sound is playing
     * @returns {boolean} True if any sound is playing
     */
    isAnySoundPlaying() {
        return this.activeSounds.size > 0;
    }
    
    /**
     * Get the current background music track name
     * @returns {string|null} Name of the current track or null
     */
    getCurrentMusicTrack() {
        return this.currentMusic;
    }
    
    /**
     * Clean up and release resources
     */
    dispose() {
        try {
            // Stop all sounds
            this.stopAllSounds();
            this.stopBackgroundMusic(0);
            
            // Close audio context
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            
            // Clear all references
            this.sounds.clear();
            this.music.clear();
            this.activeSounds.clear();
            this.activeMusicSource = null;
            this.currentMusic = null;
            
            this.log('Sound manager disposed');
        } catch (error) {
            this.logError('Error disposing sound manager:', error);
        }
    }
    
    /**
     * Log a message if debug mode is on
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (this.debug) {
            console.log('[SoundManager]', ...args);
        }
    }
    
    /**
     * Log an error
     * @param {...any} args - Arguments to log
     */
    logError(...args) {
        console.error('[SoundManager]', ...args);
    }
}

// Create global instance
window.soundManager = window.soundManager || new SoundManager();

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
