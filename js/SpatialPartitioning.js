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
        
        // Create grid with cell maps (using Maps for O(1) lookup and removal)
        this.grid = new Array(this.cols * this.rows);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Map();
        }
        
        // Keep track of entity cell positions for fast updates
        this.entityCells = new Map();
        
        // Stats for optimization analysis
        this.stats = {
            lastCellCount: 0,
            objectCount: 0,
            queryCount: 0,
            collisionChecks: 0
        };
    }
    
    /**
     * Get cell index from world coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number|null} Cell index or null if out of bounds
     */
    getCellIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return null;
        }
        
        return row * this.cols + col;
    }
    
    /**
     * Get grid cell for the given coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Map|null} Cell Map or null if out of bounds
     */
    getCell(x, y) {
        const index = this.getCellIndex(x, y);
        return index !== null ? this.grid[index] : null;
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
        for (const index of cellIndices) {
            if (index !== null && index < this.grid.length) {
                this.grid[index].set(entity.id, entity);
            }
        }
        
        // Store which cells this entity is in for fast updates
        this.entityCells.set(entity.id, cellIndices);
        
        // Update stats
        this.stats.objectCount++;
        this.stats.lastCellCount = Math.max(this.stats.lastCellCount, cellIndices.length);
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
            for (const index of cellIndices) {
                if (index !== null && index < this.grid.length) {
                    this.grid[index].delete(id);
                }
            }
            
            // Remove from tracking
            this.entityCells.delete(id);
            this.stats.objectCount--;
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
     * Get array of cell indices that an AABB overlaps
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of bounds
     * @param {number} height - Height of bounds
     * @returns {number[]} Array of cell indices
     */
    getCellsForBounds(x, y, width, height) {
        const startCol = Math.max(0, Math.floor(x / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor((x + width) / this.cellSize));
        
        const startRow = Math.max(0, Math.floor(y / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor((y + height) / this.cellSize));
        
        const indices = [];
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                indices.push(row * this.cols + col);
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
                const index = row * this.cols + col;
                
                // Add all entities from this cell
                const cell = this.grid[index];
                if (cell) {
                    for (const entity of cell.values()) {
                        nearby.add(entity);
                    }
                }
            }
        }
        
        return nearby;
    }
    
    /**
     * Get all potential collisions for the given entity
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
        
        for (const index of cellIndices) {
            if (index === null || index >= this.grid.length) continue;
            
            const cell = this.grid[index];
            for (const otherEntity of cell.values()) {
                // Skip self
                if (otherEntity.id === entity.id) continue;
                
                // Only add each entity once
                if (!uniqueEntities.has(otherEntity.id)) {
                    uniqueEntities.add(otherEntity.id);
                    potentialCollisions.push(otherEntity);
                }
            }
        }
        
        this.stats.collisionChecks += potentialCollisions.length;
        return potentialCollisions;
    }
    
    /**
     * Clear the grid
     */
    clear() {
        // Clear all cells
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i].clear();
        }
        
        // Clear tracking
        this.entityCells.clear();
        
        // Reset stats
        this.stats.objectCount = 0;
        this.stats.queryCount = 0;
        this.stats.collisionChecks = 0;
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
            stats: { ...this.stats }
        };
    }
    
    /**
     * Render grid for debugging
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderDebug(ctx) {
        // Draw grid cells
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                const cell = this.grid[index];
                
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
        }
        
        // Draw stats
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace';
        ctx.fillText(`Objects: ${this.stats.objectCount}`, 10, 20);
        ctx.fillText(`Queries: ${this.stats.queryCount}`, 10, 35);
        ctx.fillText(`Checks: ${this.stats.collisionChecks}`, 10, 50);
    }
}

// Export the class
window.SpatialPartition = SpatialPartition;
