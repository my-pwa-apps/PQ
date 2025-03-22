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
        
        // Cache for note frequencies to avoid recalculation
        this.noteFrequencyCache = new Map();

        // Defer AudioContext creation until user interaction
        this._audioContextPromise = null;
    }
    
    /**
     * Initialize the sound system
     * @returns {Promise<boolean>} Promise that resolves to success status
     */
    async initialize() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn("Web Audio API not supported in this browser");
                return false;
            }

            // Create AudioContext on initialization but in suspended state
            this.audioContext = new AudioContext();
            
            // Create audio nodes
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            // Set up interaction handlers
            this.setupInteractionHandlers();
            
            return true;
        } catch (error) {
            console.error("Failed to initialize sound system:", error);
            return false;
        }
    }

    /**
     * Set up handlers for user interaction
     */
    setupInteractionHandlers() {
        const initAudio = async () => {
            if (!this.audioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                
                // Create audio graph
                this.masterGain = this.audioContext.createGain();
                this.masterGain.connect(this.audioContext.destination);
                
                this.musicGain = this.audioContext.createGain();
                this.musicGain.gain.value = this.musicVolume;
                this.musicGain.connect(this.masterGain);
                
                this.sfxGain = this.audioContext.createGain();
                this.sfxGain.gain.value = this.sfxVolume;
                this.sfxGain.connect(this.masterGain);
                
                // Resolve the initialization promise
                if (this._resolveAudioContext) {
                    this._resolveAudioContext(true);
                }
                
                // Pregenerate sounds after context is ready
                await this.pregenerateCommonSounds();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.mobileAudioEnabled = true;
            this.log("Audio context initialized by user interaction");
        };

        // Remove previous listeners
        const handlers = ['click', 'touchstart', 'keydown'];
        handlers.forEach(event => {
            document.removeEventListener(event, this.handleUserInteraction);
        });

        // Add new interaction handler
        this.handleUserInteraction = async () => {
            await initAudio();
            // Remove handlers after successful initialization
            handlers.forEach(event => {
                document.removeEventListener(event, this.handleUserInteraction);
            });
        };

        // Add listeners
        handlers.forEach(event => {
            document.addEventListener(event, this.handleUserInteraction, { once: true });
        });
    }
    
    /**
     * Pre-generate common sound effects for better performance
     */
    async pregenerateCommonSounds() {
        const commonSounds = ['click', 'typing', 'door', 'success', 'error'];
        const promises = commonSounds.map(sound => this.generateSound(sound));
        await Promise.all(promises);
    }
    
    /**
     * Log debug messages if debug mode is enabled
     * @param {string} message - Debug message
     */
    log(message) {
        if (this.debug) {
            console.log(`[SoundManager] ${message}`);
        }
    }
    
    /**
     * Log errors
     * @param {string} message - Error message
     * @param {Error} [error] - Optional error object
     */
    logError(message, error) {
        console.error(`[SoundManager] ${message}`, error || '');
    }
    
    /**
     * Handle user interaction to enable audio on mobile
     */
    handleUserInteraction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this.mobileAudioEnabled = true;
                this.log("Audio context resumed by user interaction");
            });
        }
    }
    
    /**
     * Initialize audio for mobile devices
     */
    async initMobileAudio() {
        // Create a short silent buffer
        const silentBuffer = this.createSilentBuffer(0.1);
        
        // Play the silent buffer to unlock audio
        const source = this.audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        
        // Set the flag
        this.mobileAudioEnabled = true;
        this.log("Mobile audio initialized");
    }
    
    /**
     * Create a silent audio buffer
     * @param {number} duration - Duration in seconds
     * @returns {AudioBuffer} Silent audio buffer
     */
    createSilentBuffer(duration) {
        if (!this.audioContext) return null;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        return buffer;
    }
    
    /**
     * Generate a single sound effect using Web Audio API
     * @param {string} name - Name of the sound to generate
     * @returns {Promise<AudioBuffer>} The generated sound buffer
     */
    async generateSound(name) {
        if (!this.audioContext) return Promise.reject('Audio context not initialized');

        // Use cached sound if available
        if (this.sounds.has(name)) {
            return this.sounds.get(name);
        }

        try {
            let buffer;
            // Use a more efficient approach with a generator method map
            const generators = {
                'click': this.generateClickSound.bind(this),
                'typing': this.generateTypingSound.bind(this),
                'door': this.generateDoorSound.bind(this),
                'success': this.generateSuccessSound.bind(this),
                'error': this.generateErrorSound.bind(this),
                'radio': this.generateRadioSound.bind(this),
                'footstep': this.generateFootstepSound.bind(this)
            };
            
            const generator = generators[name];
            if (generator) {
                buffer = await generator();
            } else {
                buffer = this.createSilentBuffer(0.5);
            }
            
            this.sounds.set(name, buffer);
            return buffer;
        } catch (error) {
            this.logError(`Error generating sound "${name}":`, error);
            return this.createSilentBuffer(0.5);
        }
    }
    
    /**
     * Generate a click sound
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateClickSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            // Sharp attack, quick decay
            const t = i / sampleRate;
            data[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-15 * t);
        }
        
        return buffer;
    }
    
    /**
     * Generate a typing sound
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateTypingSound() {
        const duration = 0.05;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Mix of frequencies for a mechanical sound
            data[i] = (
                Math.sin(2 * Math.PI * 2000 * t) * 0.3 + 
                Math.sin(2 * Math.PI * 3000 * t) * 0.2
            ) * Math.exp(-30 * t);
        }
        
        return buffer;
    }
    
    /**
     * Generate a door sound
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateDoorSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Low frequency swoosh with a creak
            const creak = Math.sin(2 * Math.PI * (300 + Math.sin(t * 20) * 100) * t) * Math.exp(-5 * t);
            const thud = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-20 * (t - 0.2) * (t - 0.2));
            
            data[i] = (t < 0.2 ? creak * 0.5 : thud * 0.6);
        }
        
        return buffer;
    }
    
    /**
     * Generate a success sound
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateSuccessSound() {
        const duration = 0.6;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a major triad arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        const noteLength = duration / notes.length;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const noteIndex = Math.min(Math.floor(t / noteLength), notes.length - 1);
            const noteT = t - noteIndex * noteLength;
            const freq = notes[noteIndex];
            
            data[i] = Math.sin(2 * Math.PI * freq * noteT) * 
                      Math.exp(-5 * noteT) * 0.5;
        }
        
        return buffer;
    }
    
    /**
     * Generate an error sound
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateErrorSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Start high, go low - descending minor second
            const f1 = 400;
            const f2 = 350; 
            const freq = f1 - (f1 - f2) * Math.min(t * 4, 1);
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * 
                      Math.exp(-3 * t) * 0.5;
        }
        
        return buffer;
    }
    
    /**
     * Generate a radio sound (static + voice effects)
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateRadioSound() {
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate radio static with voice-like modulation
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            
            // Static noise base
            let noise = (Math.random() * 2 - 1) * 0.15;
            
            // Voice-like modulation
            const voiceEnvelope = Math.sin(2 * Math.PI * 2.5 * t) * 0.5 + 0.5;
            const voice = Math.sin(2 * Math.PI * 300 * t) * 0.3 + 
                         Math.sin(2 * Math.PI * 400 * t) * 0.2;
            
            // Mix static and voice
            data[i] = noise * (1 - voiceEnvelope * 0.8) + voice * voiceEnvelope * 0.7;
        }
        
        return buffer;
    }
    
    /**
     * Generate a footstep sound
     * @returns {Promise<AudioBuffer>} Generated sound buffer
     */
    async generateFootstepSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Start with a thud, then add some texture
            const thud = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-15 * t);
            const texture = (Math.random() * 2 - 1) * Math.exp(-30 * t) * 0.2;
            
            data[i] = thud * 0.7 + texture * 0.3;
        }
        
        return buffer;
    }
    
    /**
     * Generate a musical loop for background music
     * @param {string} name - Name of the music track
     * @param {object} options - Music generation options
     * @returns {Promise<AudioBuffer>} Generated music buffer
     */
    async generateMusicLoop(name, options = {}) {
        if (!this.audioContext) return Promise.reject('Audio context not initialized');
        
        // Use cached music if available
        if (this.music.has(name)) {
            return this.music.get(name);
        }
        
        try {
            const {
                duration = 8.0, 
                bpm = 100,
                baseNote = 'A3',
                progression = ['I', 'IV', 'V', 'I'],
                style = 'ambient'
            } = options;
            
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
            const leftData = buffer.getChannelData(0);
            const rightData = buffer.getChannelData(1);
            
            // Generate music based on style
            if (style === 'ambient') {
                this.generateAmbientLoop(leftData, rightData, sampleRate, options);
            } else if (style === 'action') {
                this.generateActionLoop(leftData, rightData, sampleRate, options);
            } else {
                this.generateSimpleLoop(leftData, rightData, sampleRate, options);
            }
            
            this.music.set(name, buffer);
            return buffer;
        } catch (error) {
            this.logError(`Error generating music "${name}":`, error);
            return this.createSilentBuffer(4.0);
        }
    }
    
    /**
     * Generate an ambient style music loop
     * @param {Float32Array} leftData - Left channel data array 
     * @param {Float32Array} rightData - Right channel data array
     * @param {number} sampleRate - Audio sample rate
     * @param {object} options - Generation options
     */
    generateAmbientLoop(leftData, rightData, sampleRate, options) {
        const duration = leftData.length / sampleRate;
        const baseFreq = this.getNoteFrequency(options.baseNote || 'A2');
        
        // Create pads and drones
        for (let i = 0; i < leftData.length; i++) {
            const t = i / sampleRate;
            const phaseL = Math.sin(2 * Math.PI * 0.05 * t);
            const phaseR = Math.sin(2 * Math.PI * 0.05 * t + 1.5);
            
            // Layered harmonics with slow modulation
            const harmonic1 = Math.sin(2 * Math.PI * baseFreq * t + phaseL * 0.1) * 0.15;
            const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t + phaseR * 0.1) * 0.1;
            const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.05;
            
            // Slight stereo variation
            leftData[i] = harmonic1 + harmonic2 * 0.7 + harmonic3;
            rightData[i] = harmonic1 * 0.7 + harmonic2 + harmonic3 * 1.2;
        }
        
        // Apply gentle envelope
        const fadeIn = 0.5; // seconds
        const fadeOut = 1.0; // seconds
        
        for (let i = 0; i < leftData.length; i++) {
            const t = i / sampleRate;
            let envelope = 1;
            
            if (t < fadeIn) {
                envelope = t / fadeIn;
            } else if (t > duration - fadeOut) {
                envelope = (duration - t) / fadeOut;
            }
            
            leftData[i] *= envelope;
            rightData[i] *= envelope;
        }
    }
    
    /**
     * Generate an action style music loop with rhythm
     * @param {Float32Array} leftData - Left channel data array 
     * @param {Float32Array} rightData - Right channel data array
     * @param {number} sampleRate - Audio sample rate
     * @param {object} options - Generation options
     */
    generateActionLoop(leftData, rightData, sampleRate, options) {
        const duration = leftData.length / sampleRate;
        const bpm = options.bpm || 120;
        const beatDuration = 60 / bpm;
        const baseFreq = this.getNoteFrequency(options.baseNote || 'E3');
        
        // Create driving rhythm with bassline
        for (let i = 0; i < leftData.length; i++) {
            const t = i / sampleRate;
            const beatPosition = (t % beatDuration) / beatDuration;
            
            // Bass drum on beats 1 and 3
            const bassDrum = (beatPosition < 0.1) ? 
                Math.sin(2 * Math.PI * 60 * beatPosition * 10) * Math.exp(-20 * beatPosition) * 0.3 : 0;
            
            // Snare on beats 2 and 4
            const beatNumber = Math.floor((t % (beatDuration * 4)) / beatDuration);
            const snare = (beatNumber === 1 || beatNumber === 3) && beatPosition < 0.1 ? 
                ((Math.random() * 2 - 1) * Math.exp(-20 * beatPosition)) * 0.2 : 0;
            
            // Simple bassline
            const bassNote = baseFreq * (1 + Math.floor(t / (beatDuration * 2)) % 3 * 0.2);
            const bass = Math.sin(2 * Math.PI * bassNote * t) * 0.15 * 
                         (1 - Math.min(1, beatPosition * 4));
            
            leftData[i] = bassDrum + snare * 0.7 + bass;
            rightData[i] = bassDrum * 0.7 + snare + bass * 0.8;
        }
        
        // Apply envelope
        for (let i = 0; i < leftData.length; i++) {
            const t = i / sampleRate;
            let envelope = 1;
            
            if (t < 0.1) {
                envelope = t / 0.1;
            } else if (t > duration - 0.2) {
                envelope = (duration - t) / 0.2;
            }
            
            leftData[i] *= envelope;
            rightData[i] *= envelope;
        }
    }
    
    /**
     * Generate a simple music loop
     * @param {Float32Array} leftData - Left channel data array 
     * @param {Float32Array} rightData - Right channel data array
     * @param {number} sampleRate - Audio sample rate
     * @param {object} options - Generation options
     */
    generateSimpleLoop(leftData, rightData, sampleRate, options) {
        const duration = leftData.length / sampleRate;
        const baseFreq = this.getNoteFrequency(options.baseNote || 'C4');
        
        // Simple melody
        for (let i = 0; i < leftData.length; i++) {
            const t = i / sampleRate;
            leftData[i] = Math.sin(2 * Math.PI * baseFreq * t) * 0.2;
            rightData[i] = Math.sin(2 * Math.PI * baseFreq * t * 1.005) * 0.2; // Slight detuning for stereo
        }
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
            const buffer = this.sounds.get(name);
            if (!buffer) {
                // Attempt to generate the sound if not found
                this.generateSound(name).then(newBuffer => {
                    if (newBuffer) {
                        this.playFromBuffer(newBuffer, name, volume, pan);
                    }
                });
                return null;
            }

            return this.playFromBuffer(buffer, name, volume, pan);
        } catch (error) {
            this.logError(`Error playing sound "${name}":`, error);
            return null;
        }
    }
    
    /**
     * Play sound from a buffer - extracted for reuse
     * @param {AudioBuffer} buffer - Audio buffer to play
     * @param {string} name - Name for tracking
     * @param {number} volume - Volume level 
     * @param {number} pan - Pan position
     * @returns {object} Sound control object
     */
    playFromBuffer(buffer, name, volume = 1, pan = 0) {
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
        if (pan !== 0 && this.audioContext.createStereoPanner) {
            const pannerNode = this.audioContext.createStereoPanner();
            pannerNode.pan.value = Math.min(1, Math.max(-1, pan));
            source.connect(pannerNode);
            pannerNode.connect(gainNode);
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
        this.activeSounds.set(id, { 
            source, 
            gainNode, 
            name, 
            startTime: this.audioContext.currentTime 
        });
        
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
    }
    
    /**
     * Stop a specific sound by ID
     * @param {string} id - Sound ID to stop
     * @returns {boolean} Success status
     */
    stopSound(id) {
        const sound = this.activeSounds.get(id);
        if (!sound) return false;
        
        try {
            sound.source.stop();
        } catch (error) {
            // Source might have already stopped
        }
        
        this.activeSounds.delete(id);
        return true;
    }
    
    /**
     * Play background music by name
     * @param {string} name - Music name
     * @param {object} options - Music options
     * @returns {Promise<boolean>} Success status
     */
    async playBackgroundMusic(name, options = {}) {
        if (!this.audioContext || this.isMuted) return false;
        
        try {
            // Stop current music
            this.stopBackgroundMusic();
            
            // Get or generate the music buffer
            let buffer = this.music.get(name);
            
            if (!buffer) {
                buffer = await this.generateMusicLoop(name, options);
            }
            
            if (!buffer) return false;
            
            // Create source node
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            // Connect to music channel
            source.connect(this.musicGain);
            
            // Start music
            source.start(0);
            
            // Store reference
            this.activeMusicSource = source;
            this.currentMusic = name;
            
            return true;
        } catch (error) {
            this.logError(`Error playing music "${name}":`, error);
            return false;
        }
    }
    
    /**
     * Stop currently playing background music
     */
    stopBackgroundMusic() {
        if (!this.activeMusicSource) return;
        
        try {
            this.activeMusicSource.stop();
        } catch (error) {
            // Music might have already stopped
        }
        
        this.activeMusicSource = null;
        this.currentMusic = null;
    }
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        if (!this.audioContext || !this.masterGain) return;
        
        const safeVolume = Math.min(1, Math.max(0, volume));
        this.masterGain.gain.value = safeVolume;
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        if (!this.audioContext || !this.musicGain) return;
        
        this.musicVolume = Math.min(1, Math.max(0, volume));
        this.musicGain.gain.value = this.musicVolume;
    }
    
    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        if (!this.audioContext || !this.sfxGain) return;
        
        this.sfxVolume = Math.min(1, Math.max(0, volume));
        this.sfxGain.gain.value = this.sfxVolume;
        
        // Update volumes of all active sounds
        for (const sound of this.activeSounds.values()) {
            if (sound.gainNode) {
                // Preserve individual sound volume scaling
                const ratio = sound.gainNode.gain.value / this.sfxVolume;
                sound.gainNode.gain.value = ratio * this.sfxVolume;
            }
        }
    }
    
    /**
     * Mute or unmute all audio
     * @param {boolean} mute - Whether to mute
     */
    setMute(mute) {
        this.isMuted = mute;
        
        if (this.audioContext && this.masterGain) {
            this.masterGain.gain.value = mute ? 0 : 1;
        }
    }
    
    /**
     * Get frequency for a note name or return the input if already numeric
     * @param {string|number} note - Note name (e.g., 'A4') or frequency
     * @returns {number|number[]} Frequency in Hz or array of frequencies for chords
     */
    getNoteFrequency(note) {
        // Handle numeric frequency
        if (typeof note === 'number') return note;
        
        // Use cached value if available
        if (this.noteFrequencyCache.has(note)) {
            return this.noteFrequencyCache.get(note);
        }
        
        // Handle note strings (e.g., 'A4', 'C#3')
        const noteMap = {
            'C0': 16.35, 'C#0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'E0': 20.60, 'F0': 21.83,
            'F#0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'B0': 30.87,
            'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65,
            'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
            'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
            'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
            'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
            'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
            'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
            'C7': 2093.00, 'C#7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'E7': 2637.02, 'F7': 2793.83,
            'F#7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'A7': 3520.00, 'A#7': 3729.31, 'B7': 3951.07,
            'C8': 4186.01,
            // Common chords for convenience
            'Cmaj': [261.63, 329.63, 392.00],     // C E G
            'Fmaj': [349.23, 440.00, 523.25],     // F A C
            'Gmaj': [392.00, 493.88, 587.33],     // G B D
            'Amin': [220.00, 261.63, 329.63],     // A C E
            'Emin': [164.81, 196.00, 246.94]      // E G B
        };
        
        // For chord notation, return array of frequencies
        if (Array.isArray(noteMap[note])) {
            this.noteFrequencyCache.set(note, noteMap[note]);
            return noteMap[note];
        }
        
        // For single notes
        const freq = noteMap[note] || 0;
        this.noteFrequencyCache.set(note, freq);
        return freq;
    }
    
    /**
     * Optimize audio processing using AudioWorklet when available
     */
    setupAudioProcessing() {
        // Check if AudioWorklet is supported
        if (this.audioContext && 'audioWorklet' in this.audioContext) {
            // Register a simple worklet for better performance
            const workletCode = `
                class AudioProcessor extends AudioWorkletProcessor {
                    process(inputs, outputs) {
                        // Simple pass-through processor
                        for (let i = 0; i < outputs.length; i++) {
                            for (let channel = 0; channel < outputs[i].length; channel++) {
                                for (let sample = 0; sample < outputs[i][channel].length; sample++) {
                                    outputs[i][channel][sample] = inputs[0][channel][sample] || 0;
                                }
                            }
                        }
                        return true;
                    }
                }
                registerProcessor('audio-processor', AudioProcessor);
            `;
            
            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            this.audioContext.audioWorklet.addModule(url).then(() => {
                this.log('AudioWorklet registered for better audio performance');
                URL.revokeObjectURL(url);
            }).catch(err => {
                this.logError('Failed to load AudioWorklet:', err);
            });
        }
    }
}

// Initialize when document is ready with proper error handling
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.soundManager = window.soundManager || new SoundManager();
        const manager = window.soundManager;
        await manager.initialize();
        await manager.initMobileAudio();
    } catch (err) {
        console.error("Error initializing sound manager:", err);
    }
});

// Add event listeners for user interaction with error handling
const userInteractionHandler = () => {
    try {
        if (window.soundManager) {
            window.soundManager.handleUserInteraction();
        }
    } catch (err) {
        console.error("Error handling user interaction:", err);
    }
};

document.addEventListener('click', userInteractionHandler, { once: true });
document.addEventListener('keydown', userInteractionHandler, { once: true });
document.addEventListener('touchstart', userInteractionHandler, { once: true });

// Initialize with proper error handling
if (typeof window !== 'undefined') {
    window.SoundManager = SoundManager;
}
