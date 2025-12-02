/**
 * Enhanced Scene Definitions for Police Quest
 * Multiple detailed scenes with proper collision, hotspots, and Sierra-style content
 * 
 * IMPORTANT: In Sierra games, the screen is divided:
 * - Y=0 to ~250: Sky/Background (NOT walkable)
 * - Y=250: Horizon line (where floor meets wall)
 * - Y=250 to 600: Floor area (walkable)
 * 
 * Walkable polygons define WHERE you CAN walk (floor only).
 * Collision objects define obstacles WITHIN the walkable area.
 */

const ENHANCED_SCENES = {
    // ==================== POLICE STATION SCENES ====================
    
    policeStation_lobby: {
        id: "policeStation_lobby",
        name: "Police Station - Main Lobby",
        type: "interior",
        music: "station_theme",
        
        // Sierra-style walkable floor polygon
        // Floor starts at Y=300 (below the reception desk/wall area)
        // The polygon defines the ALLOWED walking area
        walkablePath: [
            { x: 100, y: 300 },  // Top-left corner of floor
            { x: 700, y: 300 },  // Top-right corner of floor  
            { x: 700, y: 580 },  // Bottom-right
            { x: 100, y: 580 }   // Bottom-left
        ],

        // Collision objects WITHIN the walkable area
        collisionObjects: [
            // Plants block movement
            { type: 'circle', x: 120, y: 340, radius: 25, label: "plant_1" },
            { type: 'circle', x: 680, y: 340, radius: 25, label: "plant_2" }
        ],
        
        hotspots: [
            {
                id: 'reception_desk',
                x: 300,
                y: 220,
                width: 200,
                height: 80,
                cursor: 'examine',
                interactions: {
                    look: "The reception desk. Officer Jenny Patterson handles front desk duties.",
                    talk: "TALK_TO_JENNY"
                },
                npc: "officer_jenny"
            },
            {
                id: 'briefing_room_door',
                x: 120,
                y: 150,
                width: 80,
                height: 100,
                cursor: 'door',
                interactions: {
                    look: "Door to the briefing room.",
                    use: "ENTER_BRIEFING_ROOM"
                },
                targetScene: 'policeStation_briefing',
                targetX: 400,
                targetY: 450
            },
            {
                id: 'evidence_room_door',
                x: 600,
                y: 150,
                width: 80,
                height: 100,
                cursor: 'door',
                interactions: {
                    look: "Evidence Room. Secured access only.",
                    use: "CHECK_EVIDENCE_ACCESS"
                },
                targetScene: 'policeStation_evidence',
                targetX: 400,
                targetY: 350
            },
            {
                id: 'bulletin_board',
                x: 450,
                y: 100,
                width: 100,
                height: 60,
                cursor: 'examine',
                interactions: {
                    look: "The bulletin board is covered in memos you've already read."
                }
            }
        ],
        
        // NPCs must be placed ON the floor (Y >= 300)
        npcs: [
            { id: 'jenny', name: 'officer_jenny', x: 400, y: 310, facing: 'down', sprite: 'jenny' },
            { id: 'cop_bg', name: 'officer_male', x: 200, y: 400, facing: 'right', sprite: 'officer_male', isWalking: false }
        ]
    },

    policeStation_briefing: {
        id: "policeStation_briefing",
        name: "Briefing Room",
        type: "interior",
        
        // Floor area only (below the podium/blackboard)
        walkablePath: [
            { x: 50, y: 320 },   // Top-left of floor
            { x: 750, y: 320 },  // Top-right of floor
            { x: 750, y: 580 },  // Bottom-right
            { x: 50, y: 580 }    // Bottom-left
        ],

        collisionObjects: [
            // Chairs are obstacles - player walks BETWEEN rows
            { type: 'rect', x: 150, y: 350, width: 500, height: 25, label: "row_1" },
            { type: 'rect', x: 150, y: 420, width: 500, height: 25, label: "row_2" },
            { type: 'rect', x: 150, y: 490, width: 500, height: 25, label: "row_3" }
        ],
        
        hotspots: [
            {
                id: 'podium',
                x: 350,
                y: 200,
                width: 100,
                height: 80,
                interactions: {
                    look: "The sergeant's podium."
                }
            },
            {
                id: 'exit_door',
                x: 750,
                y: 350,
                width: 50,
                height: 100,
                interactions: {
                    use: "EXIT_BRIEFING"
                },
                targetScene: 'policeStation_lobby',
                targetX: 200,
                targetY: 400
            }
        ],
        
        // NPCs sit in the chairs (their Y should match chair rows)
        npcs: [
            { id: 'sergeant', name: 'sergeant_dooley', x: 400, y: 320, facing: 'down', sprite: 'sergeant' },
            { id: 'cop1', name: 'officer_male', x: 200, y: 365, facing: 'up', sprite: 'officer_male' },
            { id: 'cop2', name: 'officer_female', x: 350, y: 365, facing: 'up', sprite: 'officer_female' },
            { id: 'cop3', name: 'officer_male', x: 500, y: 365, facing: 'up', sprite: 'officer_male' }
        ]
    },

    policeStation_evidence: {
        id: "policeStation_evidence",
        name: "Evidence Room",
        type: "interior",
        
        // Player can only walk in front of the counter
        walkablePath: [
            { x: 50, y: 300 },
            { x: 750, y: 300 },
            { x: 750, y: 380 },  // Counter blocks further movement
            { x: 50, y: 380 }
        ],

        collisionObjects: [],
        
        hotspots: [
            {
                id: 'counter',
                x: 0,
                y: 400,
                width: 800,
                height: 200,
                interactions: {
                    look: "The evidence counter. You need to ring the bell for service."
                }
            },
            {
                id: 'exit_door',
                x: 50,
                y: 300,
                width: 50,
                height: 80,
                interactions: {
                    use: "EXIT_EVIDENCE"
                },
                targetScene: 'policeStation_lobby',
                targetX: 600,
                targetY: 400
            }
        ],
        npcs: []
    },

    downtown_street: {
        id: "downtown_street",
        name: "Lytton Downtown",
        type: "exterior",
        
        // Sidewalk is the walkable area (below the buildings)
        // Buildings end at Y=200, sidewalk is Y=250-600
        walkablePath: [
            { x: 20, y: 250 },   // Top-left (start of sidewalk)
            { x: 780, y: 250 },  // Top-right
            { x: 780, y: 580 },  // Bottom-right
            { x: 20, y: 580 }    // Bottom-left
        ],

        collisionObjects: [
            // Lamp posts
            { type: 'circle', x: 100, y: 270, radius: 10, label: "lamp_1" },
            { type: 'circle', x: 400, y: 270, radius: 10, label: "lamp_2" },
            { type: 'circle', x: 700, y: 270, radius: 10, label: "lamp_3" },
            // Fire hydrant
            { type: 'circle', x: 150, y: 280, radius: 12, label: "hydrant" }
        ],
        
        hotspots: [
            {
                id: 'police_station_entrance',
                x: 250,
                y: 150,
                width: 200,
                height: 100,
                interactions: {
                    use: "ENTER_STATION"
                },
                targetScene: 'policeStation_lobby',
                targetX: 400,
                targetY: 500
            }
        ],
        
        // Civilians walk on the sidewalk
        npcs: [
            { id: 'civilian1', name: 'civilian_male', x: 600, y: 300, facing: 'left', sprite: 'civilian_male', isWalking: true, patrol: true },
            { id: 'civilian3', name: 'civilian_female', x: 200, y: 350, facing: 'right', sprite: 'civilian_female', isWalking: true, patrol: true }
        ]
    },

    park: {
        id: "park",
        name: "City Park",
        type: "exterior",
        
        // Park grass area (more open than indoor scenes)
        walkablePath: [
            { x: 20, y: 220 },   // Top-left (just below tree line)
            { x: 780, y: 220 },  // Top-right
            { x: 780, y: 580 },  // Bottom-right
            { x: 20, y: 580 }    // Bottom-left
        ],

        collisionObjects: [
            // Tree trunks block movement
            { type: 'circle', x: 100, y: 240, radius: 15, label: "tree_1" },
            { type: 'circle', x: 600, y: 260, radius: 15, label: "tree_2" },
            { type: 'circle', x: 300, y: 230, radius: 15, label: "tree_3" },
            // Bench
            { type: 'rect', x: 500, y: 400, width: 100, height: 30, label: "bench" }
        ],
        
        hotspots: [
            {
                id: 'bench',
                x: 500,
                y: 400,
                width: 100,
                height: 30,
                interactions: {
                    look: "A park bench. Good for feeding pigeons.",
                    use: "SIT_BENCH"
                }
            }
        ],
        
        npcs: [
            { id: 'civilian2', name: 'civilian_female', x: 400, y: 350, facing: 'right', sprite: 'civilian_female', isWalking: true, patrol: true },
            { id: 'civilian4', name: 'civilian_male', x: 650, y: 450, facing: 'left', sprite: 'civilian_male', isWalking: true, patrol: true }
        ]
    }
};

// Export
window.ENHANCED_SCENES = ENHANCED_SCENES;
