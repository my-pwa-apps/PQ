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
        this.debug = false
