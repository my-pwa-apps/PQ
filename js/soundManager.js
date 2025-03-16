class SoundManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.sounds = new Map();
        this.currentMusic = '';
    }

    async loadSound(key, url) {
        const audio = new Audio(url);
        this.sounds.set(key, audio);
    }

    playMusic(key) {
        if (this.currentMusic === key) return;
        this.currentMusic = key;
        this.bgMusic.src = `assets/audio/${key}.mp3`;
        this.bgMusic.play();
    }

    playSound(key) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
        this.currentMusic = '';
    }
}

const soundManager = new SoundManager();
