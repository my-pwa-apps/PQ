/**
 * Engine Loader
 * This script ensures GameEngine initializes correctly by patching problematic methods
 */
(function() {
    // Wait for DOMContentLoaded to ensure the engine.js script has loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Engine loader: Patching GameEngine initialization...');
        
        // Check if GameEngine exists in the global scope
        if (typeof window.GameEngine === 'function') {
            console.log('Engine loader: GameEngine class found, applying patches...');
            
            // Save the original prototype
            const originalProto = window.GameEngine.prototype;
            
            // Override the init method to fix the initialization issue
            const originalInit = originalProto.init;
            originalProto.init = function() {
                console.log('Engine loader: Using patched init method...');
                
                // Ensure colors are initialized before any other initialization
                if (!this.colors) {
                    console.log('Engine loader: Setting up color palette directly...');
                    this.colors = {
                        black: '#000000',
                        blue: '#0000AA',
                        green: '#00AA00',
                        cyan: '#00AAAA',
                        red: '#AA0000',
                        magenta: '#AA00AA',
                        brown: '#AA5500',
                        lightGray: '#AAAAAA',
                        darkGray: '#555555',
                        brightBlue: '#5555FF',
                        brightGreen: '#55FF55',
                        brightCyan: '#55FFFF',
                        brightRed: '#FF5555',
                        brightMagenta: '#FF55FF',
                        yellow: '#FFFF55',
                        white: '#FFFFFF',
                        skin: '#FFD8B1',
                        darkBlue: '#000066'
                    };
                }
                
                try {
                    if (this.initialized) return;
                    console.log('Engine loader: Continuing with rest of initialization...');
                    
                    // Setup core components
                    this.setupCanvas();
                    this.setupBufferCanvas();
                    this.setupEventListeners();
                    
                    // Set initial game state
                    this.keyboardEnabled = true;
                    this.isRunning = true;
                    this.lastFrameTime = performance.now();
                    this.accumulator = 0;
                    this.frameInterval = 1000 / 60;
                    
                    this.initialized = true;
                    console.log('Engine loader: Game engine initialized successfully');
                    
                    // Load initial scene and start game loop
                    this.loadScene(this.currentScene);
                    this.startGameLoop();
                    
                    // Dispatch initialization event
                    document.dispatchEvent(new Event('gameEngineInitialized'));
                } catch (error) {
                    console.error('Engine loader: Failed to initialize game engine:', error);
                    throw error;
                }
            };
            
            console.log('Engine loader: GameEngine successfully patched.');
        } else {
            console.error('Engine loader: GameEngine not found in global scope!');
        }
    });
})();
