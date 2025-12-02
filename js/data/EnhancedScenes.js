/**
 * Enhanced Scene Definitions for Police Quest
 * Multiple detailed scenes with proper collision, hotspots, and Sierra-style content
 */

const ENHANCED_SCENES = {
    // ==================== POLICE STATION SCENES ====================
    
    policeStation_lobby: {
        id: "policeStation_lobby",
        name: "Police Station - Main Lobby",
        type: "interior",
        music: "station_theme",
        
        // Define the exact walkable polygon (Sierra SCI style)
        // Points are defined clockwise or counter-clockwise
        walkablePath: [
            { x: 100, y: 600 }, // Bottom Left
            { x: 100, y: 250 }, // Top Left (Wall start)
            { x: 300, y: 250 }, // Desk Left
            { x: 300, y: 320 }, // Desk Front Left
            { x: 500, y: 320 }, // Desk Front Right
            { x: 500, y: 250 }, // Desk Right
            { x: 700, y: 250 }, // Top Right
            { x: 700, y: 600 }  // Bottom Right
        ],

        // Collision objects (blocking movement within walkable area)
        collisionObjects: [
            // Plants (Circular collision)
            { type: 'circle', x: 50, y: 350, radius: 20, label: "plant_1" },
            { type: 'circle', x: 750, y: 350, radius: 20, label: "plant_2" }
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
                targetX: 700,
                targetY: 400
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
                targetY: 400
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
        
        npcs: [
            { id: 'jenny', name: 'officer_jenny', x: 400, y: 240, facing: 'down', sprite: 'jenny' },
            { id: 'cop_bg', name: 'officer_male', x: 150, y: 280, facing: 'right', sprite: 'officer_male', isWalking: false }
        ]
    },

    policeStation_briefing: {
        id: "policeStation_briefing",
        name: "Briefing Room",
        type: "interior",
        
        walkablePath: [
            { x: 50, y: 600 },
            { x: 50, y: 250 },
            { x: 750, y: 250 },
            { x: 750, y: 600 }
        ],

        collisionObjects: [
            // Podium
            { type: 'rect', x: 350, y: 200, width: 100, height: 80, label: "podium" },
            // Chairs (Rows) - Make them solid obstacles
            { type: 'rect', x: 150, y: 350, width: 500, height: 30, label: "row_1" },
            { type: 'rect', x: 150, y: 410, width: 500, height: 30, label: "row_2" },
            { type: 'rect', x: 150, y: 470, width: 500, height: 30, label: "row_3" }
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
                y: 300,
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
        
        npcs: [
            { id: 'sergeant', name: 'sergeant_dooley', x: 400, y: 220, facing: 'down', sprite: 'sergeant' },
            { id: 'cop1', name: 'officer_male', x: 200, y: 380, facing: 'up', sprite: 'officer_male' },
            { id: 'cop2', name: 'officer_female', x: 300, y: 380, facing: 'up', sprite: 'officer_female' },
            { id: 'cop3', name: 'officer_male', x: 500, y: 380, facing: 'up', sprite: 'officer_male' }
        ]
    },

    policeStation_evidence: {
        id: "policeStation_evidence",
        name: "Evidence Room",
        type: "interior",
        
        walkablePath: [
            { x: 50, y: 600 },
            { x: 50, y: 250 },
            { x: 750, y: 250 },
            { x: 750, y: 600 }
        ],

        collisionObjects: [
            // Counter
            { type: 'rect', x: 0, y: 400, width: 800, height: 200, label: "counter" }
        ],
        
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
                height: 100,
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
        
        walkablePath: [
            { x: 0, y: 600 },
            { x: 0, y: 200 }, // Sidewalk level
            { x: 800, y: 200 },
            { x: 800, y: 600 }
        ],

        collisionObjects: [
            // Buildings (Visuals are at Y < 200, but let's block the top edge just in case)
            { type: 'rect', x: 0, y: 0, width: 800, height: 200, label: "buildings" }
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
        
        npcs: [
            { id: 'civilian1', name: 'civilian_male', x: 600, y: 230, facing: 'left', sprite: 'civilian_male', isWalking: true, patrol: true },
            { id: 'civilian3', name: 'civilian_female', x: 100, y: 240, facing: 'right', sprite: 'civilian_female', isWalking: true, patrol: true }
        ]
    },

    park: {
        id: "park",
        name: "City Park",
        type: "exterior",
        
        walkablePath: [
            { x: 0, y: 600 },
            { x: 0, y: 200 },
            { x: 800, y: 200 },
            { x: 800, y: 600 }
        ],

        collisionObjects: [
            // Trees
            { type: 'circle', x: 100, y: 200, radius: 20, label: "tree_1" },
            { type: 'circle', x: 600, y: 220, radius: 20, label: "tree_2" },
            { type: 'circle', x: 300, y: 180, radius: 20, label: "tree_3" },
            // Bench
            { type: 'rect', x: 500, y: 370, width: 100, height: 60, label: "bench" }
        ],
        
        hotspots: [
            {
                id: 'bench',
                x: 500,
                y: 370,
                width: 100,
                height: 60,
                interactions: {
                    look: "A park bench. Good for feeding pigeons.",
                    use: "SIT_BENCH"
                }
            }
        ],
        
        npcs: [
            { id: 'civilian2', name: 'civilian_female', x: 400, y: 300, facing: 'right', sprite: 'civilian_female', isWalking: true, patrol: true },
            { id: 'civilian4', name: 'civilian_male', x: 700, y: 400, facing: 'left', sprite: 'civilian_male', isWalking: true, patrol: true }
        ]
    }
};

// Export
window.ENHANCED_SCENES = ENHANCED_SCENES;
