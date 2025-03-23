/**
 * Debug utilities for Police Quest
 * Provides tools for visualizing and testing game mechanics
 */
class GameDebugger {
    constructor() {
        this.active = false;
        this.showCollisions = false;
        this.showHotspots = false;
        this.showPaths = false;
        this.logInteractions = false;
        this.logPerformance = false;
        this.fpsCounter = null;
        
        // Performance monitoring
        this.perfStats = {
            fps: 0,
            frameTime: 0,
            frameCount: 0,
            lastTime: performance.now()
        };
    }
    
    /**
     * Initialize the debugger
     */
    init() {
        // Create debug UI
        this.createDebugPanel();
        
        // Register keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Set up performance monitoring
        if (this.logPerformance) {
            this.startPerformanceMonitoring();
        }
        
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
        panel.style.maxHeight = '80vh';
        panel.style.overflowY = 'auto';
        
        // Add controls
        panel.innerHTML = `
            <h3>Debug Controls</h3>
            <div style="margin-bottom: 10px;">
                <button id="debug-toggle-ui" class="debug-btn">Hide UI</button>
            </div>
            <div>
                <label><input type="checkbox" id="debug-collisions"> Show Collisions</label>
            </div>
            <div>
                <label><input type="checkbox" id="debug-hotspots"> Show Hotspots</label>
            </div>
            <div>
                <label><input type="checkbox" id="debug-paths"> Show Paths</label>
            </div>
            <div>
                <label><input type="checkbox" id="debug-interactions"> Log Interactions</label>
            </div>
            <div>
                <label><input type="checkbox" id="debug-performance"> Performance Stats</label>
            </div>
            <div style="margin-top: 10px;">
                <button id="debug-test-doors" class="debug-btn">Test Doors</button>
                <button id="debug-reload-scene" class="debug-btn">Reload Scene</button>
                <button id="debug-test-transitions" class="debug-btn">Test All Transitions</button>
            </div>
            <div>
                <button id="debug-test-collisions" class="debug-btn">Validate Collisions</button>
                <button id="debug-check-consistency" class="debug-btn">Check Data Consistency</button>
            </div>
            <div style="margin-top: 10px;">
                <select id="debug-goto-scene">
                    <option value="">Go to Scene...</option>
                </select>
            </div>
            <div class="debug-info" style="margin-top: 10px; border-top: 1px solid #555; padding-top: 10px;">
                <div id="debug-position">Position: x=0, y=0</div>
                <div id="debug-scene">Scene: none</div>
                <div id="debug-fps">FPS: 0</div>
            </div>
            <div id="debug-console" style="margin-top: 10px; border-top: 1px solid #555; padding-top: 10px; max-height: 200px; overflow-y: auto;">
                <div style="font-weight: bold;">Debug Console:</div>
            </div>
            <style>
                .debug-btn {
                    background: #444;
                    color: white;
                    border: 1px solid #666;
                    padding: 3px 8px;
                    margin: 2px;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .debug-btn:hover {
                    background: #555;
                }
                #debug-goto-scene {
                    background: #444;
                    color: white;
                    border: 1px solid #666;
                    padding: 3px;
                    width: 100%;
                }
            </style>
        `;
        
        document.body.appendChild(panel);
        
        // Add event listeners
        document.getElementById('debug-toggle-ui').addEventListener('click', (e) => {
            const gameUI = document.getElementById('ui-container');
            if (gameUI) {
                if (gameUI.style.display === 'none') {
                    gameUI.style.display = '';
                    e.target.textContent = 'Hide UI';
                } else {
                    gameUI.style.display = 'none';
                    e.target.textContent = 'Show UI';
                }
            }
        });
        
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
        
        document.getElementById('debug-paths').addEventListener('change', (e) => {
            this.showPaths = e.target.checked;
            if (window.gameEngine) {
                window.gameEngine.drawPaths = e.target.checked;
            }
        });
        
        document.getElementById('debug-interactions').addEventListener('change', (e) => {
            this.logInteractions = e.target.checked;
        });
        
        document.getElementById('debug-performance').addEventListener('change', (e) => {
            this.logPerformance = e.target.checked;
            if (e.target.checked) {
                this.startPerformanceMonitoring();
            } else {
                this.stopPerformanceMonitoring();
            }
        });
        
        document.getElementById('debug-test-doors').addEventListener('click', () => {
            this.testDoors();
        });
        
        document.getElementById('debug-reload-scene').addEventListener('click', () => {
            this.reloadCurrentScene();
        });
        
        document.getElementById('debug-test-transitions').addEventListener('click', () => {
            this.testAllTransitions();
        });
        
        document.getElementById('debug-test-collisions').addEventListener('click', () => {
            this.validateCollisions();
        });
        
        document.getElementById('debug-check-consistency').addEventListener('click', () => {
            this.checkDataConsistency();
        });
        
        // Populate scene dropdown
        const sceneSelect = document.getElementById('debug-goto-scene');
        sceneSelect.addEventListener('change', (e) => {
            const scene = e.target.value;
            if (scene && window.gameEngine) {
                window.gameEngine.loadScene(scene);
            }
        });
        
        // Populate scenes from GAME_DATA if available
        if (window.GAME_DATA && window.GAME_DATA.scenes) {
            const scenes = Object.keys(window.GAME_DATA.scenes);
            scenes.forEach(scene => {
                const option = document.createElement('option');
                option.value = scene;
                option.textContent = scene;
                sceneSelect.appendChild(option);
            });
        }
        
        // Start update loop for debug info
        setInterval(() => this.updateDebugInfo(), 100);
        
        this.panel = panel;
        this.logEntry("Debug panel initialized");
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
        
        // Alt+H to toggle hotspot visualization
        if (event.key === 'h' && event.altKey) {
            this.showHotspots = !this.showHotspots;
            this.toggleHotspotDisplay(this.showHotspots);
            const checkbox = document.getElementById('debug-hotspots');
            if (checkbox) checkbox.checked = this.showHotspots;
        }
        
        // Alt+P to toggle performance monitoring
        if (event.key === 'p' && event.altKey) {
            this.logPerformance = !this.logPerformance;
            if (this.logPerformance) {
                this.startPerformanceMonitoring();
            } else {
                this.stopPerformanceMonitoring();
            }
            const checkbox = document.getElementById('debug-performance');
            if (checkbox) checkbox.checked = this.logPerformance;
        }
        
        // Alt+R to reload current scene
        if (event.key === 'r' && event.altKey) {
            this.reloadCurrentScene();
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
        
        // If debug panel is active, also activate debugging mode
        if (window.gameEngine) {
            window.gameEngine.debugMode = this.active;
        }
    }
    
    /**
     * Update debug information display
     */
    updateDebugInfo() {
        if (!this.active || !window.gameEngine) return;
        
        const positionElem = document.getElementById('debug-position');
        const sceneElem = document.getElementById('debug-scene');
        const fpsElem = document.getElementById('debug-fps');
        
        if (positionElem && window.gameEngine.playerPosition) {
            const pos = window.gameEngine.playerPosition;
            positionElem.textContent = `Position: x=${Math.round(pos.x)}, y=${Math.round(pos.y)}`;
        }
        
        if (sceneElem && window.gameEngine.currentScene) {
            sceneElem.textContent = `Scene: ${window.gameEngine.currentScene}`;
        }
        
        if (fpsElem && this.perfStats) {
            fpsElem.textContent = `FPS: ${this.perfStats.fps} (${this.perfStats.frameTime.toFixed(2)}ms)`;
        }
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.perfMonitorId) return;
        
        this.perfStats.lastTime = performance.now();
        this.perfStats.frameCount = 0;
        
        // Create FPS counter if needed
        if (!this.fpsCounter) {
            this.fpsCounter = document.createElement('div');
            this.fpsCounter.id = 'fps-counter';
            this.fpsCounter.style.position = 'fixed';
            this.fpsCounter.style.top = '5px';
            this.fpsCounter.style.left = '5px';
            this.fpsCounter.style.background = 'rgba(0,0,0,0.5)';
            this.fpsCounter.style.color = 'white';
            this.fpsCounter.style.padding = '5px';
            this.fpsCounter.style.borderRadius = '3px';
            this.fpsCounter.style.fontFamily = 'monospace';
            this.fpsCounter.style.fontSize = '12px';
            this.fpsCounter.style.zIndex = '1000';
            document.body.appendChild(this.fpsCounter);
        }
        
        this.fpsCounter.style.display = 'block';
        
        // Request animation frame for performance measurement
        let lastFrameTime = performance.now();
        
        const measurePerformance = (timestamp) => {
            // Update frame count
            this.perfStats.frameCount++;
            
            // Calculate frame time
            const frameTime = timestamp - lastFrameTime;
            lastFrameTime = timestamp;
            this.perfStats.frameTime = frameTime;
            
            // Update FPS counter every second
            const elapsed = timestamp - this.perfStats.lastTime;
            if (elapsed >= 1000) {
                this.perfStats.fps = Math.round((this.perfStats.frameCount * 1000) / elapsed);
                this.perfStats.frameCount = 0;
                this.perfStats.lastTime = timestamp;
                
                if (this.fpsCounter) {
                    this.fpsCounter.textContent = `FPS: ${this.perfStats.fps} (${this.perfStats.frameTime.toFixed(1)}ms)`;
                    
                    // Color coding based on performance
                    if (this.perfStats.fps > 50) {
                        this.fpsCounter.style.color = '#8f8';
                    } else if (this.perfStats.fps > 30) {
                        this.fpsCounter.style.color = '#ff8';
                    } else {
                        this.fpsCounter.style.color = '#f88';
                    }
                }
            }
            
            if (this.logPerformance) {
                this.perfMonitorId = requestAnimationFrame(measurePerformance);
            }
        };
        
        this.perfMonitorId = requestAnimationFrame(measurePerformance);
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.perfMonitorId) {
            cancelAnimationFrame(this.perfMonitorId);
            this.perfMonitorId = null;
        }
        
        if (this.fpsCounter) {
            this.fpsCounter.style.display = 'none';
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
            this.logEntry("No hotspots found in current scene", "warn");
            return;
        }
        
        // Find all door hotspots
        const doors = sceneData.hotspots.filter(h => h.id.toLowerCase().includes('door'));
        this.logEntry(`Found ${doors.length} doors in scene ${scene}`);
        
        // Test each door
        doors.forEach(door => {
            this.logEntry(`Testing door: ${door.id}`);
            
            if (door.targetScene) {
                this.logEntry(`Target scene: ${door.targetScene} at position (${door.targetX || 'default'}, ${door.targetY || 'default'})`, "info");
            } else {
                this.logEntry(`No target scene defined for door ${door.id}!`, "error");
            }
        });
    }
    
    /**
     * Test all scene transitions for consistency
     */
    testAllTransitions() {
        if (!window.GAME_DATA || !window.GAME_DATA.scenes) {
            this.logEntry("No game data available", "error");
            return;
        }
        
        const scenes = Object.keys(window.GAME_DATA.scenes);
        let errors = 0;
        
        this.logEntry(`Testing transitions between ${scenes.length} scenes...`);
        
        scenes.forEach(sceneName => {
            const scene = window.GAME_DATA.scenes[sceneName];
            
            if (!scene.hotspots) return;
            
            const doors = scene.hotspots.filter(h => h.id.toLowerCase().includes('door'));
            doors.forEach(door => {
                if (!door.targetScene) {
                    this.logEntry(`Error: Door "${door.id}" in scene "${sceneName}" has no target scene`, "error");
                    errors++;
                } else if (!scenes.includes(door.targetScene)) {
                    this.logEntry(`Error: Door "${door.id}" in scene "${sceneName}" points to non-existent scene "${door.targetScene}"`, "error");
                    errors++;
                }
            });
        });
        
        if (errors === 0) {
            this.logEntry("All scene transitions are valid!", "success");
        } else {
            this.logEntry(`Found ${errors} invalid scene transitions!`, "error");
        }
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
            marker.style.border = hotspot.id.toLowerCase().includes('door') ? '2px solid red' : '2px solid blue';
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
        
        // Also show collision objects if available
        if (sceneData.collisionObjects) {
            sceneData.collisionObjects.forEach((obj, index) => {
                const marker = document.createElement('div');
                marker.className = 'debug-hotspot-marker';
                marker.style.position = 'absolute';
                marker.style.zIndex = '998';
                marker.style.pointerEvents = 'none';
                
                if (obj.type === 'rect') {
                    marker.style.left = `${obj.x - obj.width/2}px`;
                    marker.style.top = `${obj.y - obj.height/2}px`;
                    marker.style.width = `${obj.width}px`;
                    marker.style.height = `${obj.height}px`;
                    marker.style.border = '2px dashed green';
                    marker.style.backgroundColor = 'rgba(0,255,0,0.1)';
                } else if (obj.type === 'circle') {
                    marker.style.left = `${obj.x - obj.radius}px`;
                    marker.style.top = `${obj.y - obj.radius}px`;
                    marker.style.width = `${obj.radius * 2}px`;
                    marker.style.height = `${obj.radius * 2}px`;
                    marker.style.border = '2px dashed green';
                    marker.style.borderRadius = '50%';
                    marker.style.backgroundColor = 'rgba(0,255,0,0.1)';
                }
                
                // Add label for collision object
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.top = '-20px';
                label.style.left = '0';
                label.style.backgroundColor = 'black';
                label.style.color = 'green';
                label.style.padding = '2px 5px';
                label.style.fontSize = '10px';
                label.textContent = `collision_${index}`;
                marker.appendChild(label);
                
                document.body.appendChild(marker);
            });
        }
    }
    
    /**
     * Validate collision setup
     */
    validateCollisions() {
        if (!window.gameEngine || !window.GAME_DATA) return;
        
        const scene = window.gameEngine.currentScene;
        const sceneData = window.GAME_DATA.scenes[scene];
        
        if (!sceneData) {
            this.logEntry("No scene data available", "error");
            return;
        }
        
        this.logEntry(`Validating collisions in scene "${scene}"...`);
        
        // Check if collision objects exist
        if (!sceneData.collisionObjects || sceneData.collisionObjects.length === 0) {
            this.logEntry("Warning: No collision objects defined in this scene", "warn");
        } else {
            this.logEntry(`Scene has ${sceneData.collisionObjects.length} collision objects`);
            
            // Check for common issues
            let warnings = 0;
            
            sceneData.collisionObjects.forEach((obj, index) => {
                // Check for missing properties
                if (!obj.type) {
                    this.logEntry(`Error: Collision object #${index} has no type!`, "error");
                    warnings++;
                }
                
                if (obj.type === 'rect') {
                    if (typeof obj.width !== 'number' || obj.width <= 0) {
                        this.logEntry(`Warning: Rectangle #${index} has invalid width: ${obj.width}`, "warn");
                        warnings++;
                    }
                    if (typeof obj.height !== 'number' || obj.height <= 0) {
                        this.logEntry(`Warning: Rectangle #${index} has invalid height: ${obj.height}`, "warn");
                        warnings++;
                    }
                }
                
                if (obj.type === 'circle') {
                    if (typeof obj.radius !== 'number' || obj.radius <= 0) {
                        this.logEntry(`Warning: Circle #${index} has invalid radius: ${obj.radius}`, "warn");
                        warnings++;
                    }
                }
                
                // Check for collision objects outside screen bounds
                if (obj.x < 0 || obj.x > 800 || obj.y < 0 || obj.y > 600) {
                    this.logEntry(`Warning: Collision object #${index} may be outside screen: (${obj.x}, ${obj.y})`, "warn");
                    warnings++;
                }
            });
            
            if (warnings === 0) {
                this.logEntry("All collision objects appear valid", "success");
            }
        }
        
        // Check for potential hotspot/collision misalignments
        if (sceneData.hotspots && sceneData.collisionObjects) {
            sceneData.hotspots.forEach(hotspot => {
                const hotspotBounds = {
                    left: hotspot.x - hotspot.width/2,
                    right: hotspot.x + hotspot.width/2,
                    top: hotspot.y - hotspot.height/2,
                    bottom: hotspot.y + hotspot.height/2
                };
                
                // Check if any hotspot overlaps with collision objects
                const overlaps = sceneData.collisionObjects.some(obj => {
                    if (obj.type === 'rect') {
                        const objBounds = {
                            left: obj.x - obj.width/2,
                            right: obj.x + obj.width/2,
                            top: obj.y - obj.height/2,
                            bottom: obj.y + obj.height/2
                        };
                        
                        return !(objBounds.left > hotspotBounds.right || 
                                objBounds.right < hotspotBounds.left || 
                                objBounds.top > hotspotBounds.bottom ||
                                objBounds.bottom < hotspotBounds.top);
                    }
                    
                    if (obj.type === 'circle') {
                        // Check if circle overlaps with rectangle
                        // This is a simplified check
                        const closestX = Math.max(hotspotBounds.left, Math.min(obj.x, hotspotBounds.right));
                        const closestY = Math.max(hotspotBounds.top, Math.min(obj.y, hotspotBounds.bottom));
                        
                        const distanceSquared = Math.pow(closestX - obj.x, 2) + Math.pow(closestY - obj.y, 2);
                        return distanceSquared < obj.radius * obj.radius;
                    }
                    
                    return false;
                });
                
                if (overlaps && hotspot.id.toLowerCase().includes('door')) {
                    this.logEntry(`Warning: Door hotspot "${hotspot.id}" overlaps with collision objects!`, "warn");
                    this.logEntry(`This may prevent the player from reaching the door.`, "info");
                }
            });
        }
    }
    
    /**
     * Check data consistency
     */
    checkDataConsistency() {
        if (!window.GAME_DATA) {
            this.logEntry("No game data available", "error");
            return;
        }
        
        this.logEntry("Checking game data consistency...");
        
        // Check scenes
        const scenes = window.GAME_DATA.scenes;
        if (!scenes || Object.keys(scenes).length === 0) {
            this.logEntry("Error: No scenes defined in GAME_DATA!", "error");
            return;
        }
        
        this.logEntry(`Found ${Object.keys(scenes).length} scenes`);
        
        // Check scene content
        Object.entries(scenes).forEach(([sceneName, scene]) => {
            this.logEntry(`Checking scene "${sceneName}"...`);
            
            // Check for missing properties
            if (!scene.hotspots || scene.hotspots.length === 0) {
                this.logEntry(`Warning: Scene "${sceneName}" has no hotspots`, "warn");
            } else {
                this.logEntry(`Scene has ${scene.hotspots.length} hotspots`);
                
                // Check hotspot properties
                scene.hotspots.forEach((hotspot, index) => {
                    if (!hotspot.id) {
                        this.logEntry(`Error: Hotspot #${index} in scene "${sceneName}" has no ID!`, "error");
                    }
                    
                    if (typeof hotspot.x !== 'number' || typeof hotspot.y !== 'number') {
                        this.logEntry(`Error: Hotspot "${hotspot.id}" has invalid position: (${hotspot.x}, ${hotspot.y})`, "error");
                    }
                    
                    if (typeof hotspot.width !== 'number' || hotspot.width <= 0 || 
                        typeof hotspot.height !== 'number' || hotspot.height <= 0) {
                        this.logEntry(`Warning: Hotspot "${hotspot.id}" has invalid dimensions: ${hotspot.width}x${hotspot.height}`, "warn");
                    }
                    
                    if (!hotspot.interactions || Object.keys(hotspot.interactions).length === 0) {
                        this.logEntry(`Warning: Hotspot "${hotspot.id}" has no interactions defined`, "warn");
                    }
                    
                    // Check doors
                    if (hotspot.id.toLowerCase().includes('door')) {
                        if (!hotspot.targetScene) {
                            this.logEntry(`Error: Door "${hotspot.id}" has no target scene!`, "error");
                        } else if (!scenes[hotspot.targetScene]) {
                            this.logEntry(`Error: Door "${hotspot.id}" points to non-existent scene "${hotspot.targetScene}"!`, "error");
                        }
                    }
                });
            }
            
            // Check collision objects
            if (!scene.collisionObjects || scene.collisionObjects.length === 0) {
                this.logEntry(`Warning: Scene "${sceneName}" has no collision objects`, "warn");
            }
        });
        
        this.logEntry("Data consistency check complete", "info");
    }
    
    /**
     * Reload the current scene
     */
    reloadCurrentScene() {
        if (!window.gameEngine) return;
        
        const currentScene = window.gameEngine.currentScene;
        this.logEntry(`Reloading scene: ${currentScene}`);
        
        window.gameEngine.loadScene(currentScene);
    }
    
    /**
     * Add log entry to debug console
     * @param {string} message - Message to log
     * @param {string} type - Log type (info, warn, error, success)
     */
    logEntry(message, type = "info") {
        const debugConsole = document.getElementById('debug-console');
        if (!debugConsole) return;
        
        const entry = document.createElement('div');
        entry.style.borderBottom = '1px dotted #444';
        entry.style.padding = '2px 0';
        entry.style.fontSize = '11px';
        
        // Set color based on type
        switch (type) {
            case "error":
                entry.style.color = '#ff8080';
                console.error(message);
                break;
            case "warn":
                entry.style.color = '#ffcf60';
                console.warn(message);
                break;
            case "success":
                entry.style.color = '#80ff80';
                console.log(message);
                break;
            default:
                entry.style.color = '#a0a0ff';
                console.log(message);
        }
        
        // Add timestamp and message
        const time = new Date().toLocaleTimeString();
        entry.innerHTML = `<span style="color:#888">[${time}]</span> ${message}`;
        
        // Add to console
        debugConsole.appendChild(entry);
        
        // Auto-scroll to bottom
        debugConsole.scrollTop = debugConsole.scrollHeight;
        
        // Limit entries
        while (debugConsole.childElementCount > 50) {
            debugConsole.removeChild(debugConsole.firstElementChild);
        }
    }
    
    /**
     * Calculate collision map coverage
     * Utility for analyzing how much of the scene is covered by collision objects
     */
    calculateCollisionCoverage() {
        if (!window.gameEngine || !window.GAME_DATA) return;
        
        const scene = window.gameEngine.currentScene;
        const sceneData = window.GAME_DATA.scenes[scene];
        
        if (!sceneData || !sceneData.collisionObjects) {
            this.logEntry("No collision objects to analyze", "warn");
            return;
        }
        
        // Create temporary canvas to visualize collisions
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Fill with black (non-colliding areas)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw collision objects in white
        ctx.fillStyle = 'white';
        sceneData.collisionObjects.forEach(obj => {
            if (obj.type === 'rect') {
                ctx.fillRect(
                    obj.x - obj.width/2,
                    obj.y - obj.height/2,
                    obj.width,
                    obj.height
                );
            } else if (obj.type === 'circle') {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Analyze the coverage
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let coveredPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            // Check if pixel is white (collision area)
            if (data[i] > 0) {
                coveredPixels++;
            }
        }
        
        const totalPixels = canvas.width * canvas.height;
        const coverage = (coveredPixels / totalPixels) * 100;
        
        this.logEntry(`Collision coverage: ${coverage.toFixed(2)}% of scene area`);
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
    
    // Additional debugging utilities
    window.getSceneData = (sceneName) => {
        const scene = sceneName || window.gameEngine?.currentScene;
        return window.GAME_DATA?.scenes?.[scene];
    };
    
    window.showAllHotspots = (show = true) => {
        if (window.gameDebugger) {
            window.gameDebugger.toggleHotspotDisplay(show);
        }
    };
    
    window.analyzeCollisions = () => {
        if (window.gameDebugger) {
            window.gameDebugger.calculateCollisionCoverage();
        }
    };
});

// Add toggle debug command to document
window.toggleDebug = () => {
    if (window.gameDebugger) {
        window.gameDebugger.toggleDebugPanel();
    }
};
