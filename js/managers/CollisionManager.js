class CollisionManager {
    constructor(game) {
        this.game = game;
    }

    isWalkable(x, y) {
        const currentScene = this.game.currentScene;
        const walkableAreas = window.GAME_DATA.scenes[currentScene].walkableAreas;
        
        // Check if position is within any walkable area
        return walkableAreas.some(area => {
            return x >= area.x1 && x <= area.x2 && 
                   y >= area.y1 && y <= area.y2;
        });
    }

    checkCollision(x, y) {
        const currentScene = this.game.currentScene;
        const collisionZones = window.GAME_DATA.scenes[currentScene].collisionZones;
        
        // Check if position intersects with any collision zone
        return collisionZones.some(zone => {
            return x >= zone.x1 && x <= zone.x2 && 
                   y >= zone.y1 && y <= zone.y2;
        });
    }
}
