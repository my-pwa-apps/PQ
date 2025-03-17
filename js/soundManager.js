class SoundManager {
    constructor() {
        this.masterVolume = 0.7;
        this.soundEnabled = true;
        this.audioContext = null;
        this.gainNode = null;
        this.backgroundMusic = null;
        this.audioContextInitialized = false;
        
        // Try to initialize audio context with error handling
        this.initAudioContext();
    }

    initAudioContext() {
        if (this.audioContextInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API not supported');
            }
            
            this.audioContext = new AudioContext();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
            this.audioContextInitialized = true;

            // Resume audio context if suspended (autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        } catch (error) {
            console.warn('Failed to initialize Web Audio API:', error);
            this.soundEnabled = false;
        }
    }

    async playSound(name, volume = 1.0) {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            // Ensure audio context is running
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const soundConfig = this.getSoundConfig(name);
            if (!soundConfig) {
                console.warn(`Unknown sound: ${name}`);
                return;
            }

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume * this.masterVolume;
            gainNode.connect(this.audioContext.destination);

            const oscillator = this.audioContext.createOscillator();
            oscillator.type = soundConfig.type;
            oscillator.frequency.setValueAtTime(soundConfig.frequency, this.audioContext.currentTime);
            
            // Create new envelope generator for each sound
            if (soundConfig.frequencyEnvelope) {
                this.applyFrequencyEnvelope(oscillator, soundConfig.frequencyEnvelope);
            }

            // Apply filter with error handling
            if (soundConfig.filter) {
                try {
                    const filter = this.createFilter(soundConfig.filter);
                    oscillator.connect(filter);
                    filter.connect(gainNode);
                } catch (filterError) {
                    console.warn('Filter creation failed, falling back to direct connection:', filterError);
                    oscillator.connect(gainNode);
                }
            } else {
                oscillator.connect(gainNode);
            }

            // Apply volume envelope with smoothing
            this.applyVolumeEnvelope(gainNode, volume, soundConfig.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + soundConfig.duration);

            // Cleanup with error handling
            oscillator.onended = () => {
                try {
                    oscillator.disconnect();
                    gainNode.disconnect();
                } catch (cleanupError) {
                    console.warn('Error during sound cleanup:', cleanupError);
                }
            };

            return oscillator;
        } catch (error) {
            console.error(`Error playing sound ${name}:`, error);
            return null;
        }
    }

    createFilter(filterConfig) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = filterConfig.type;
        filter.frequency.value = filterConfig.frequency;
        filter.Q.value = filterConfig.Q || 1;
        return filter;
    }

    applyFrequencyEnvelope(oscillator, envelope) {
        const now = this.audioContext.currentTime;
        envelope.forEach(([time, freq]) => {
            oscillator.frequency.linearRampToValueAtTime(freq, now + time);
        });
    }

    applyVolumeEnvelope(gainNode, volume, duration) {
        const now = this.audioContext.currentTime;
        const attackTime = Math.min(0.01, duration * 0.1);
        const releaseTime = Math.min(0.05, duration * 0.2);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(volume, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

    getSoundConfig(name) {
        const configs = {
            click: {
                type: 'square',
                frequency: 800,
                duration: 0.1,
                filter: {
                    type: 'lowpass',
                    frequency: 2000,
                    Q: 1
                }
            },
            error: {
                type: 'sawtooth',
                frequency: 200,
                frequencyEnvelope: [
                    [0, 200],
                    [0.1, 150]
                ],
                duration: 0.2,
                filter: {
                    type: 'lowpass',
                    frequency: 1000,
                    Q: 5
                }
            },
            footsteps: {
                type: 'triangle',
                frequency: 100,
                frequencyEnvelope: [
                    [0, 100],
                    [0.05, 80]
                ],
                duration: 0.1,
                filter: {
                    type: 'bandpass',
                    frequency: 400,
                    Q: 2
                }
            },
            door: {
                type: 'sine',
                frequency: 100,
                frequencyEnvelope: [
                    [0, 150],
                    [0.3, 50]
                ],
                duration: 0.4,
                filter: {
                    type: 'lowpass',
                    frequency: 500,
                    Q: 1
                }
            }
        };

        return configs[name];
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

    // Handle mobile audio unlocking
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

    // Generate background music programmatically
    async playBackgroundMusic() {
        if (!this.soundEnabled || !this.audioContext) return;

        const musicGain = this.audioContext.createGain();
        musicGain.gain.value = 0.2 * this.masterVolume;
        musicGain.connect(this.audioContext.destination);

        // Create a simple ambient pad sound
        const frequencies = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4
        const oscillators = frequencies.map(freq => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const oscGain = this.audioContext.createGain();
            oscGain.gain.value = 0.1;
            
            osc.connect(oscGain);
            oscGain.connect(musicGain);
            
            return { oscillator: osc, gain: oscGain };
        });

        // Add subtle modulation
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // 0.2 Hz modulation

        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.1;
        lfo.connect(lfoGain);

        oscillators.forEach(({ gain }) => {
            lfoGain.connect(gain.gain);
        });

        // Start all oscillators
        lfo.start();
        oscillators.forEach(({ oscillator }) => oscillator.start());

        return {
            stop: () => {
                lfo.stop();
                lfo.disconnect();
                oscillators.forEach(({ oscillator, gain }) => {
                    oscillator.stop();
                    oscillator.disconnect();
                    gain.disconnect();
                });
                musicGain.disconnect();
            }
        };
    }
}

// Initialize sound manager
window.soundManager = new SoundManager();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = window.soundManager;
    manager.initMobileAudio();
});
