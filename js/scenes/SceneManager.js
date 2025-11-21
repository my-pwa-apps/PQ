class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.scenes = new Map();
        this.transitions = new Map();
        this.loadingScene = false;
        
        // Initialize with game data if available
        if (window.GAME_DATA && window.GAME_DATA.scenes) {
            this.initializeScenes();
        }
    }
    
    initializeScenes() {
        // Prefer Enhanced Scenes if available
        if (window.ENHANCED_SCENES) {
            console.log("Loading Enhanced Scenes...");
            for (const [sceneId, sceneData] of Object.entries(window.ENHANCED_SCENES)) {
                this.addScene(sceneId, sceneData);
            }
        } else if (window.GAME_DATA && window.GAME_DATA.scenes) {
            // Fallback to legacy scenes
            for (const [sceneId, sceneData] of Object.entries(window.GAME_DATA.scenes)) {
                this.addScene(sceneId, sceneData);
            }
        }
    }

    async loadScene(sceneId) {
        if (this.loadingScene) return; // Prevent multiple scene loads
        this.loadingScene = true;
        
        try {
            if (!this.scenes.has(sceneId)) {
                console.error(`Scene ${sceneId} not found`);
                this.loadingScene = false;
                return;
            }

            const scene = this.scenes.get(sceneId);
            this.currentScene = scene;
            
            // Play scene music
            if (window.soundManager && scene.music) {
                window.soundManager.playBackgroundMusic(scene.music);
            }

            // Update game engine
            if (window.gameEngine) {
                window.gameEngine.loadScene(sceneId);
            }
            
            // Update game state
            if (this.game) {
                this.game.currentScene = sceneId;
            }
            
            this.loadingScene = false;
        } catch (error) {
            console.error(`Error loading scene ${sceneId}:`, error);
            this.loadingScene = false;
        }
    }

    addScene(sceneId, sceneData) {
        this.scenes.set(sceneId, {...sceneData, id: sceneId});
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
    
    // Check if a transition is possible
    canTransition(fromScene, toScene) {
        if (!this.transitions.has(fromScene)) return false;
        const conditions = this.transitions.get(fromScene);
        
        if (!conditions.has(toScene)) return false;
        
        const condition = conditions.get(toScene);
        return typeof condition === 'function' ? condition() : !!condition;
    }
}

window.SceneManager = SceneManager;
