class SoundManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.sounds = new Map();
        this.currentMusic = '';
    }

    generateSound(frequency, duration, type = 'sine') {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    }

    playMusic(key) {
        if (this.currentMusic === key) return;
        this.currentMusic = key;
        // Generate a simple background music tone
        this.generateSound(440, 2, 'square');
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
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
        this.currentMusic = '';
    }
}

const soundManager = new SoundManager();

// Load sounds
soundManager.loadSound('click', 880, 0.1, 'square');
soundManager.loadSound('pickup', 660, 0.2, 'triangle');
