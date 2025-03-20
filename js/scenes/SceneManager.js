class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.scenes = new Map();
        this.transitions = new Map();
    }

    loadScene(sceneId) {
        if (!this.scenes.has(sceneId)) {
            console.error(`Scene ${sceneId} not found`);
            return;
        }

        const scene = this.scenes.get(sceneId);
        this.currentScene = scene;
        
        if (window.soundManager) {
            window.soundManager.playBackgroundMusic(scene.music);
        }

        if (window.gameEngine) {
            window.gameEngine.loadScene(sceneId);
        }
    }

    addScene(sceneId, sceneData) {
        this.scenes.set(sceneId, sceneData);
    }

    addTransition(fromScene, toScene, condition) {
        if (!this.transitions.has(fromScene)) {
            this.transitions.set(fromScene, new Map());
        }
        this.transitions.get(fromScene).set(toScene, condition);
    }

    getCurrentScene() {
        return this.currentScene;
    }
}

window.SceneManager = SceneManager;
