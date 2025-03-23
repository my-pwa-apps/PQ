/**
 * Debug utilities for Police Quest
 */
class GameDebugger {
    constructor() {
        this.active = false;
        this.showCollisions = false;
        this.showHotspots = false;
        this.logInteractions = false;
    }
    
    /**
     * Initialize the debugger
     */
    init() {
        // Create debug UI
        this.createDebugPanel();
        
        // Register keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        console.log("Game debugger initialized");
    }
    
    /**
     * Create debug panel UI
     */
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.position = 'fixed';
        panel.style.top = '10px';
        panel.style.right = '10px';
        panel.style.background = 'rgba(0,0,0,0.7)';
        panel.style.color = 'white';
        panel.style.padding = '10px';
        panel.style.borderRadius = '5px';
        panel.style.fontFamily = 'monospace';
        panel.style.fontSize = '12px';
        panel.style.zIndex = '1000';
        panel.style.display = 'none';
        
        // Add controls
        panel.innerHTML = `
            <h3>Debug Controls</h3>
            <div>
                <label><input type="checkbox" id="debug-collisions"> Show Collisions</label>
            </div>
            <div>
                <label><input type="checkbox" id="debug-hotspots"> Show Hotspots</label>
            </div>
            <div>
                <label><input type="checkbox" id="debug-interactions"> Log Interactions</label>
            </div>
            <div>
                <button id="debug-test-doors">Test Doors</button>
            </div>
            <div>
                <button id="debug-reload-scene">Reload Scene</button>
            </div>
            <div class="debug-info">
                <div id="debug-position">Position: x=0, y=0</div>
                <div id="debug-scene">Scene: none</div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add event listeners
        document.getElementById('debug-collisions').addEventListener('change', (e) => {
            this.showCollisions = e.target.checked;
            if (window.gameEngine) {
                window.gameEngine.debugMode = e.target.checked;
            }
        });
        
        document.getElementById('debug-hotspots').addEventListener('change', (e) => {
            this.showHotspots = e.target.checked;
            this.toggleHotspotDisplay(e.target.checked);
        });
        
        document.getElementById('debug-interactions').addEventListener('change', (e) => {
            this.logInteractions = e.target.checked;
        });
        
        document.getElementById('debug-test-doors').addEventListener('click', () => {
            this.testDoors();
        });
        
        document.getElementById('debug-reload-scene').addEventListener('click', () => {
            this.reloadCurrentScene();
        });
        
        // Start update loop for debug info
        setInterval(() => this.updateDebugInfo(), 100);
        
        this.panel = panel;
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown(event) {
        // Alt+D to toggle debug panel
        if (event.key === 'd' && event.altKey) {
            this.toggleDebugPanel();
        }
        
        // Alt+C to toggle collision visualization
        if (event.key === 'c' && event.altKey) {
            this.showCollisions = !this.showCollisions;
            if (window.gameEngine) {
                window.gameEngine.debugMode = this.showCollisions;
            }
            const checkbox = document.getElementById('debug-collisions');
            if (checkbox) checkbox.checked = this.showCollisions;
        }
    }
    
    /**
     * Toggle debug panel visibility
     */
    toggleDebugPanel() {
        this.active = !this.active;
        if (this.panel) {
            this.panel.style.display = this.active ? 'block' : 'none';
        }
    }
    
    /**
     * Update debug information display
     */
    updateDebugInfo() {
        if (!this.active || !window.gameEngine) return;
        
        const positionElem = document.getElementById('debug-position');
        const sceneElem = document.getElementById('debug-scene');
        
        if (positionElem && window.gameEngine.playerPosition) {
            const pos = window.gameEngine.playerPosition;
            positionElem.textContent = `Position: x=${Math.round(pos.x)}, y=${Math.round(pos.y)}`;
        }
        
        if (sceneElem && window.gameEngine.currentScene) {
            sceneElem.textContent = `Scene: ${window.gameEngine.currentScene}`;
        }
    }
    
    /**
     * Test all doors in the current scene
     */
    testDoors() {
        if (!window.gameEngine || !window.GAME_DATA) return;
        
        const scene = window.gameEngine.currentScene;
        const sceneData = window.GAME_DATA.scenes[scene];
        
        if (!sceneData || !sceneData.hotspots) {
            console.log("No hotspots found in current scene");
            return;
        }
        
        // Find all door hotspots
        const doors = sceneData.hotspots.filter(h => h.id.toLowerCase().includes('door'));
        console.log(`Found ${doors.length} doors in scene ${scene}:`, doors);
        
        // Test each door
        doors.forEach(door => {
            console.log(`Testing door: ${door.id}`);
            console.log(`Door data:`, door);
            
            if (door.targetScene) {
                console.log(`Target scene: ${door.targetScene}`);
            } else {
                console.log("No target scene defined for this door");
            }
        });
    }
    
    /**
     * Toggle hotspot visualization
     */
    toggleHotspotDisplay(show) {
        if (!window.gameEngine || !window.GAME_DATA) return;
        
        // Remove existing hotspot markers
        document.querySelectorAll('.debug-hotspot-marker').forEach(el => el.remove());
        
        if (!show) return;
        
        const scene = window.gameEngine.currentScene;
        const sceneData = window.GAME_DATA.scenes[scene];
        
        if (!sceneData || !sceneData.hotspots) return;
        
        // Create markers for all hotspots
        sceneData.hotspots.forEach(hotspot => {
            const marker = document.createElement('div');
            marker.className = 'debug-hotspot-marker';
            marker.style.position = 'absolute';
            marker.style.left = `${hotspot.x - hotspot.width/2}px`;
            marker.style.top = `${hotspot.y - hotspot.height/2}px`;
            marker.style.width = `${hotspot.width}px`;
            marker.style.height = `${hotspot.height}px`;
            marker.style.border = hotspot.id.includes('door') ? '2px solid red' : '2px solid blue';
            marker.style.backgroundColor = 'rgba(255,255,0,0.2)';
            marker.style.pointerEvents = 'none'; // Don't interfere with clicks
            marker.style.zIndex = '999';
            
            // Add label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.top = '-20px';
            label.style.left = '0';
            label.style.backgroundColor = 'black';
            label.style.color = 'white';
            label.style.padding = '2px 5px';
            label.style.fontSize = '10px';
            label.style.whiteSpace = 'nowrap';
            label.textContent = hotspot.id;
            marker.appendChild(label);
            
            document.body.appendChild(marker);
        });
    }
    
    /**
     * Reload the current scene
     */
    reloadCurrentScene() {
        if (!window.gameEngine) return;
        
        const currentScene = window.gameEngine.currentScene;
        console.log(`Reloading scene: ${currentScene}`);
        
        window.gameEngine.loadScene(currentScene);
    }
}

// Initialize the debugger when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameDebugger = new GameDebugger();
    window.gameDebugger.init();
    
    // Add global console commands for debugging
    window.debugGame = () => {
        window.gameDebugger.toggleDebugPanel();
    };
    
    window.testDoor = (doorId) => {
        if (!window.gameEngine) return console.error("Game engine not initialized");
        
        const scene = window.gameEngine.currentScene;
        const sceneData = window.GAME_DATA?.scenes?.[scene];
        
        if (!sceneData || !sceneData.hotspots) {
            return console.error("No hotspots in current scene");
        }
        
        const door = sceneData.hotspots.find(h => h.id === doorId);
        if (!door) {
            return console.error(`Door "${doorId}" not found in scene ${scene}`);
        }
        
        console.log(`Testing door: ${doorId}`, door);
        window.gameEngine.processHotspotInteraction(door, 'use');
    };
});

// Add toggle debug command to document
window.toggleDebug = () => {
    if (window.gameDebugger) {
        window.gameDebugger.toggleDebugPanel();
    }
};
