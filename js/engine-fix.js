/**
 * CRITICAL ENGINE FIX
 * This file MUST be included before engine.js to patch initialization issues
 */
(function() {
    console.log('🛠️ Engine fix: Installing critical patch...');
    
    // Define a safety color palette function for global use
    window.safeColorPalette = function() {
        return {
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
    };
    
    // Monitor when GameEngine becomes available
    const observer = new MutationObserver(function() {
        if (window.GameEngine) {
            observer.disconnect();
            patchGameEngine();
        }
    });
    
    // Check immediately in case GameEngine is already defined
    if (window.GameEngine) {
        patchGameEngine();
    } else {
        // If not, observe the window object for changes
        observer.observe(document, {
            childList: true, 
            subtree: true
        });
    }
    
    // Function to patch the GameEngine
    function patchGameEngine() {
        try {
            console.log('🛠️ Engine fix: GameEngine detected, applying patch...');
            
            // Store the original init method
            const originalInit = window.GameEngine.prototype.init;
            
            // Replace it with our safe version
            window.GameEngine.prototype.init = function() {
                try {
                    console.log('🛠️ Engine fix: Running patched init method...');
                    
                    // Ensure colors are properly set before anything else happens
                    if (!this.colors) {
                        console.log('🛠️ Engine fix: Setting up fallback color palette');
                        this.colors = window.safeColorPalette();
                    }
                    
                    // Make sure setupColorPalette always exists
                    if (typeof this.setupColorPalette !== 'function') {
                        console.log('🛠️ Engine fix: Adding missing setupColorPalette method');
                        this.setupColorPalette = function() {
                            return window.safeColorPalette();
                        };
                    }
                    
                    if (this.initialized) return;
                    
                    // Core initialization that doesn't rely on setupColorPalette
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
                    console.log('🛠️ Engine fix: Game engine safely initialized');
                    
                    // Continue with regular initialization
                    this.loadScene(this.currentScene);
                    this.startGameLoop();
                    
                    document.dispatchEvent(new Event('gameEngineInitialized'));
                } catch (error) {
                    console.error('🛠️ Engine fix: Error in patched init:', error);
                    throw error;
                }
            };
            
            console.log('🛠️ Engine fix: Patch successfully applied!');
        } catch (error) {
            console.error('🛠️ Engine fix: Failed to apply patch:', error);
        }
    }
})();
