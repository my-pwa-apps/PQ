/**
 * SpatialPartitioning.js
 * Optimized spatial partitioning system for collision detection in Police Quest
 */

class SpatialPartition {
    /**
     * Create a spatial partitioning system
     * @param {number} width - Total width of the world
     * @param {number} height - Total height of the world
     * @param {number} cellSize - Size of each grid cell
     */
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        
        // Create grid with more efficient sparse structure
        // Only allocate cells when needed
        this.grid = new Map();
        
        // Keep track of entity cell positions for fast updates
        this.entityCells = new Map();
        
        // Stats for optimization analysis
        this.stats = {
            lastCellCount: 0,
            objectCount: 0,
            queryCount: 0,
            collisionChecks: 0,
            cellCount: 0
        };
        
        // Caching recent query results for similar positions
        this.queryCache = new Map();
        this.queryCacheMaxSize = 20;
        this.queryCacheLifetime = 5; // frames
    }
    
    /**
     * Get cell key from world coordinates
     * @param {number} col - Grid column
     * @param {number} row - Grid row
     * @returns {string} Cell key
     */
    getCellKey(col, row) {
        return `${col},${row}`;
    }
    
    /**
     * Get or create cell at the specified position
     * @param {number} col - Grid column
     * @param {number} row - Grid row
     * @returns {Map|null} Cell Map or null if out of bounds
     */
    getOrCreateCell(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return null;
        }
        
        const key = this.getCellKey(col, row);
        if (!this.grid.has(key)) {
            this.grid.set(key, new Map());
            this.stats.cellCount++;
        }
        
        return this.grid.get(key);
    }
    
    /**
     * Get cell from world coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Map|null} Cell Map or null if out of bounds
     */
    getCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return null;
        }
        
        const key = this.getCellKey(col, row);
        return this.grid.get(key);
    }
    
    /**
     * Insert entity into the grid
     * @param {object} entity - Entity to insert
     */
    insert(entity) {
        if (!entity.id || !entity.getBounds) {
            console.warn("Entity must have id and getBounds() method");
            return;
        }
        
        // Get entity bounds
        const bounds = entity.getBounds();
        
        // Get grid cells that this entity overlaps
        const cellIndices = this.getCellsForBounds(
            bounds.x, 
            bounds.y, 
            bounds.width, 
            bounds.height
        );
        
        // Add entity to each overlapping cell
        for (const {col, row} of cellIndices) {
            const cell = this.getOrCreateCell(col, row);
            if (cell) {
                cell.set(entity.id, entity);
            }
        }
        
        // Store which cells this entity is in for fast updates
        this.entityCells.set(entity.id, cellIndices);
        
        // Update stats
        this.stats.objectCount++;
        this.stats.lastCellCount = Math.max(this.stats.lastCellCount, cellIndices.length);
        
        // Invalidate query cache when adding new entities
        this.queryCache.clear();
    }
    
    /**
     * Remove entity from the grid
     * @param {object|string} entityOrId - Entity or entity ID to remove
     */
    remove(entityOrId) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        
        if (!id) return;
        
        // Get cells where entity exists
        const cellIndices = this.entityCells.get(id);
        
        if (cellIndices) {
            // Remove from all cells
            for (const {col, row} of cellIndices) {
                const key = this.getCellKey(col, row);
                const cell = this.grid.get(key);
                if (cell) {
                    cell.delete(id);
                    
                    // Remove empty cells to save memory
                    if (cell.size === 0) {
                        this.grid.delete(key);
                        this.stats.cellCount--;
                    }
                }
            }
            
            // Remove from tracking
            this.entityCells.delete(id);
            this.stats.objectCount--;
            
            // Invalidate query cache
            this.queryCache.clear();
        }
    }
    
    /**
     * Update entity position in the grid
     * @param {object} entity - Entity to update
     */
    update(entity) {
        if (!entity.id || !entity.getBounds) return;
        
        // Remove from old position
        this.remove(entity);
        
        // Add to new position
        this.insert(entity);
    }
    
    /**
     * Get array of cell positions that an AABB overlaps
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of bounds
     * @param {number} height - Height of bounds
     * @returns {Array<{col: number, row: number}>} Array of cell positions
     */
    getCellsForBounds(x, y, width, height) {
        const startCol = Math.max(0, Math.floor(x / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor((x + width) / this.cellSize));
        
        const startRow = Math.max(0, Math.floor(y / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor((y + height) / this.cellSize));
        
        const indices = [];
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                indices.push({col, row});
            }
        }
        
        return indices;
    }
    
    /**
     * Get all entities near a point within given radius
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} [radius=0] - Search radius (0 means only the cell containing the point)
     * @returns {Set<object>} Set of entities
     */
    getNearbyEntities(x, y, radius = 0) {
        this.stats.queryCount++;
        
        // Check cache first if radius is 0 (most common case)
        const cacheKey = radius === 0 ? `${Math.floor(x)},${Math.floor(y)}` : null;
        if (cacheKey && this.queryCache.has(cacheKey)) {
            const cachedResult = this.queryCache.get(cacheKey);
            if (cachedResult.lifetime > 0) {
                cachedResult.lifetime--;
                return cachedResult.entities;
            } else {
                this.queryCache.delete(cacheKey);
            }
        }
        
        // Calculate grid cells to check based on radius
        const cellRadius = Math.ceil(radius / this.cellSize);
        const startCol = Math.max(0, Math.floor(x / this.cellSize) - cellRadius);
        const endCol = Math.min(this.cols - 1, Math.floor(x / this.cellSize) + cellRadius);
        
        const startRow = Math.max(0, Math.floor(y / this.cellSize) - cellRadius);
        const endRow = Math.min(this.rows - 1, Math.floor(y / this.cellSize) + cellRadius);
        
        const nearby = new Set();
        
        // Check all cells in the area
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const key = this.getCellKey(col, row);
                const cell = this.grid.get(key);
                
                // Add all entities from this cell
                if (cell) {
                    for (const entity of cell.values()) {
                        nearby.add(entity);
                    }
                }
            }
        }
        
        // Cache the result for frequently queried positions
        if (cacheKey && nearby.size > 0) {
            // Maintain cache size limit
            if (this.queryCache.size >= this.queryCacheMaxSize) {
                // Remove oldest or expired entry
                let oldestKey = null;
                for (const [key, value] of this.queryCache.entries()) {
                    if (value.lifetime <= 0) {
                        this.queryCache.delete(key);
                        oldestKey = null;
                        break;
                    }
                    if (!oldestKey || value.timestamp < this.queryCache.get(oldestKey).timestamp) {
                        oldestKey = key;
                    }
                }
                
                if (oldestKey) {
                    this.queryCache.delete(oldestKey);
                }
            }
            
            this.queryCache.set(cacheKey, {
                entities: nearby,
                timestamp: performance.now(),
                lifetime: this.queryCacheLifetime
            });
        }
        
        return nearby;
    }
    
    /**
     * Get all potential collisions for the given entity with broad-phase filtering
     * @param {object} entity - Entity to check
     * @returns {object[]} Array of entities that might collide
     */
    getPotentialCollisions(entity) {
        if (!entity.getBounds) return [];
        
        const bounds = entity.getBounds();
        const potentialCollisions = [];
        
        // Get all entities in cells that overlap with this entity
        const cellIndices = this.getCellsForBounds(
            bounds.x, 
            bounds.y, 
            bounds.width, 
            bounds.height
        );
        
        // Use Set to avoid duplicate entities
        const uniqueEntities = new Set();
        
        for (const {col, row} of cellIndices) {
            const key = this.getCellKey(col, row);
            const cell = this.grid.get(key);
            
            if (!cell) continue;
            
            for (const otherEntity of cell.values()) {
                // Skip self
                if (otherEntity.id === entity.id) continue;
                
                // Only add each entity once
                if (!uniqueEntities.has(otherEntity.id)) {
                    uniqueEntities.add(otherEntity.id);
                    
                    // Perform AABB test as early broad-phase filter
                    if (this.testAABBCollision(bounds, otherEntity.getBounds())) {
                        potentialCollisions.push(otherEntity);
                    }
                }
            }
        }
        
        this.stats.collisionChecks += uniqueEntities.size;
        return potentialCollisions;
    }
    
    /**
     * Test if two AABBs collide
     * @param {object} a - First AABB with x, y, width, height
     * @param {object} b - Second AABB with x, y, width, height
     * @returns {boolean} True if colliding
     */
    testAABBCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    
    /**
     * Clear the grid
     */
    clear() {
        // Clear all cells
        this.grid.clear();
        
        // Clear tracking
        this.entityCells.clear();
        this.queryCache.clear();
        
        // Reset stats
        this.stats.objectCount = 0;
        this.stats.queryCount = 0;
        this.stats.collisionChecks = 0;
        this.stats.cellCount = 0;
    }
    
    /**
     * Get debug info for rendering
     * @returns {object} Grid debug info
     */
    getDebugInfo() {
        return {
            cols: this.cols,
            rows: this.rows,
            cellSize: this.cellSize,
            objectCount: this.stats.objectCount,
            cellCount: this.stats.cellCount,
            memoryUsage: this.grid.size * 40 + this.entityCells.size * 80, // Rough estimate in bytes
            stats: { ...this.stats }
        };
    }
    
    /**
     * Render grid for debugging
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderDebug(ctx) {
        // Only render cells that actually contain objects
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
        
        for (const [key, cell] of this.grid.entries()) {
            const [col, row] = key.split(',').map(Number);
            
            const x = col * this.cellSize;
            const y = row * this.cellSize;
            
            // Draw cell outline
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            
            // Highlight cells with objects
            if (cell.size > 0) {
                ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.1 + cell.size * 0.05, 0.5)})`;
                ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Show count
                ctx.fillStyle = 'black';
                ctx.font = '10px Arial';
                ctx.fillText(cell.size.toString(), x + 5, y + 15);
            }
        }
        
        // Draw stats
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace';
        ctx.fillText(`Objects: ${this.stats.objectCount}`, 10, 20);
        ctx.fillText(`Cells: ${this.stats.cellCount}`, 10, 35);
        ctx.fillText(`Queries: ${this.stats.queryCount}`, 10, 50);
        ctx.fillText(`Checks: ${this.stats.collisionChecks}`, 10, 65);
    }
}

// Export the class
window.SpatialPartition = SpatialPartition;
