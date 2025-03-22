/**
 * SoundManager.js
 * Audio management system for Police Quest
 * Uses Web Audio API for sound generation and playback
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
            
            // Generate sound effects using Web Audio API
            await this.generateSoundEffects();
            
            // Load music tracks (still using audio files for music)
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
     * Generate all sound effects using Web Audio API
     * This replaces loading WAV files with programmatic sound generation
     */
    async generateSoundEffects() {
        try {
            // Define the sound effects to generate
            const soundsToGenerate = [
                'click', 'typing', 'door', 'success', 'error', 'radio', 'footstep'
            ];
            
            // Generate each sound effect
            const generatePromises = soundsToGenerate.map(name => {
                return this.generateSound(name);
            });
            
            // Wait for all sounds to be generated
            await Promise.all(generatePromises);
            return true;
        } catch (error) {
            this.logError("Error generating sound effects:", error);
            return false;
        }
    }
    
    /**
     * Generate a single sound effect using Web Audio API
     * @param {string} name - Name of the sound to generate
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateSound(name) {
        if (!this.audioContext) return Promise.reject('Audio context not initialized');
        
        try {
            let audioBuffer;
            
            switch (name) {
                case 'click':
                    audioBuffer = await this.generateClickSound();
                    break;
                case 'typing':
                    audioBuffer = await this.generateTypingSound();
                    break;
                case 'door':
                    audioBuffer = await this.generateDoorSound();
                    break;
                case 'success':
                    audioBuffer = await this.generateSuccessSound();
                    break;
                case 'error':
                    audioBuffer = await this.generateErrorSound();
                    break;
                case 'radio':
                    audioBuffer = await this.generateRadioSound();
                    break;
                case 'footstep':
                    audioBuffer = await this.generateFootstepSound();
                    break;
                default:
                    audioBuffer = this.createSilentBuffer(0.5);
                    break;
            }
            
            this.sounds.set(name, audioBuffer);
            this.log(`Generated sound: ${name}`);
            return audioBuffer;
        } catch (error) {
            this.logError(`Error generating sound "${name}":`, error);
            
            // Create a silent buffer as fallback
            const fallbackBuffer = this.createSilentBuffer(0.5);
            this.sounds.set(name, fallbackBuffer);
            
            return fallbackBuffer;
        }
    }
    
    /**
     * Generate a click sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateClickSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a short click sound
        for (let i = 0; i < buffer.length; i++) {
            if (i < 0.01 * sampleRate) {
                // Quick attack
                data[i] = 0.8 * Math.sin(i * 0.3) * Math.exp(-i / (0.01 * sampleRate));
            } else {
                // Fast decay
                data[i] = 0.2 * Math.sin(i * 0.3) * Math.exp(-i / (0.03 * sampleRate));
            }
        }
        
        return buffer;
    }
    
    /**
     * Generate a typing sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateTypingSound() {
        const duration = 0.05;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a short tap sound resembling keyboard typing
        for (let i = 0; i < buffer.length; i++) {
            // Mix of high and low frequencies
            const noise = Math.random() * 2 - 1;
            const decay = Math.exp(-i / (0.02 * sampleRate));
            
            data[i] = 0.6 * noise * decay;
        }
        
        return buffer;
    }
    
    /**
     * Generate a door sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateDoorSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a creaking door sound
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 100 + 50 * Math.sin(t * 10);
            const noise = Math.random() * 0.2;
            
            // Generate creak with frequency modulation
            if (t < 0.3) {
                // Door opening
                data[i] = (0.5 * Math.sin(2 * Math.PI * frequency * t) + noise) * 
                           Math.min(1, t * 10) * Math.exp(-t / 0.3);
            } else {
                // Door closing
                data[i] = (0.3 * Math.sin(2 * Math.PI * (frequency - 30) * t) + noise) * 
                           Math.exp(-(t - 0.3) / 0.2);
            }
        }
        
        return buffer;
    }
    
    /**
     * Generate a success sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateSuccessSound() {
        const duration = 0.6;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a melodic success sound (ascending arpeggio)
        const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 notes
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            // Play each note in sequence
            for (let j = 0; j < frequencies.length; j++) {
                const startTime = j * 0.12;
                const noteLength = 0.15;
                
                if (t >= startTime && t < startTime + noteLength) {
                    const freq = frequencies[j];
                    // Envelope for each note
                    const envelope = Math.min(1, (t - startTime) * 30) * 
                                    Math.max(0, 1 - ((t - startTime) / noteLength) * 2);
                    sample += 0.3 * Math.sin(2 * Math.PI * freq * t) * envelope;
                }
            }
            
            data[i] = sample;
        }
        
        return buffer;
    }
    
    /**
     * Generate an error sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateErrorSound() {
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a descending buzz sound for errors
        const baseFreq = 400;
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Decreasing frequency with wobble
            const freq = baseFreq - (t * 100) + 30 * Math.sin(t * 30);
            // Add some noise for harshness
            const noise = Math.random() * 0.1;
            const envelope = Math.min(1, t * 10) * Math.exp(-t / 0.2);
            
            data[i] = (0.3 * Math.sin(2 * Math.PI * freq * t) + noise) * envelope;
        }
        
        return buffer;
    }
    
    /**
     * Generate a radio sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateRadioSound() {
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a staticky radio sound with voice effect
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Static noise
            const staticNoise = Math.random() * 0.5 - 0.25;
            // Voice-like modulation
            const voiceTone = 0.2 * Math.sin(2 * Math.PI * 240 * t) * 
                              Math.sin(2 * Math.PI * 3 * t); 
            // Radio beep
            const beep = (t > 0.2 && t < 0.3) ? 0.15 * Math.sin(2 * Math.PI * 800 * t) : 0;
            // Combine with envelope
            const envelope = Math.min(1, t * 5) * Math.exp(-t / 0.6);
            
            data[i] = (staticNoise + voiceTone + beep) * envelope;
        }
        
        return buffer;
    }
    
    /**
     * Generate a footstep sound using Web Audio API
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateFootstepSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a footstep sound
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Low frequency thump with noise
            const thump = 0.3 * Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t / 0.05);
            // Shoe friction sound (white noise with envelope)
            const friction = (Math.random() * 2 - 1) * 0.1 * Math.exp(-t / 0.1);
            
            data[i] = thump + (t > 0.05 ? friction : 0);
        }
        
        return buffer;
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
     * Helper to convert time-domain data to frequency-domain data
     * @param {Float32Array} timeData - Time domain data
     * @returns {Float32Array} Frequency domain data
     */
    timeToFrequency(timeData) {
        // Simple FFT implementation for sound generation
        const len = timeData.length;
        const freqData = new Float32Array(len);
        
        for (let k = 0; k < len; k++) {
            let real = 0;
            let imag = 0;
            
            for (let n = 0; n < len; n++) {
                const phi = (2 * Math.PI * k * n) / len;
                real += timeData[n] * Math.cos(phi);
                imag -= timeData[n] * Math.sin(phi);
            }
            
            real /= len;
            imag /= len;
            
            freqData[k] = Math.sqrt(real * real + imag * imag);
        }
        
        return freqData;
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
     * Handle user interaction to start audio (for browsers that require it)
     */
    handleUserInteraction() {
        if (!this.audioContext) return;
        
        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this.log('Audio context resumed after user interaction');
            });
        }
        
        // Make sure mobile audio is enabled
        this.initMobileAudio();
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
