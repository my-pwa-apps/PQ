/**
 * Enhanced Scene Definitions for Police Quest
 * Multiple detailed scenes with proper collision, hotspots, and Sierra-style content
 * 
 * IMPORTANT: In Sierra games, the screen is divided:
 * - Y=0 to ~300: Sky/Background (NOT walkable)
 * - Y=300: Floor line (where floor meets wall)
 * - Y=300 to 600: Floor area (walkable)
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
        ambience: "office_hum",
        description: "The main lobby of the Lytton Police Department. The smell of coffee and duty permeates the air.",
        
        // Sierra-style walkable floor polygon - FLOOR ONLY (Y >= 300)
        walkablePath: [
            { x: 80, y: 300 },   // Top-left corner of floor
            { x: 720, y: 300 },  // Top-right corner of floor  
            { x: 720, y: 580 },  // Bottom-right
            { x: 80, y: 580 }    // Bottom-left
        ],

        // Collision objects WITHIN the walkable area
        collisionObjects: [
            // Reception desk blocks center
            { type: 'rect', x: 270, y: 280, width: 260, height: 80, label: "reception_desk" },
            // Plants near doors
            { type: 'circle', x: 130, y: 350, radius: 20, label: "plant_left" },
            { type: 'circle', x: 670, y: 350, radius: 20, label: "plant_right" },
            // Water cooler
            { type: 'rect', x: 705, y: 310, width: 30, height: 50, label: "water_cooler" }
        ],
        
        hotspots: [
            {
                id: 'reception_desk',
                x: 270,
                y: 280,
                width: 260,
                height: 80,
                cursor: 'examine',
                interactions: {
                    look: "The reception desk is staffed by Officer Jenny Patterson. A phone, some forms, and a cup of coffee sit on the desk.",
                    talk: "TALK_TO_JENNY",
                    use: "You lean on the counter. Jenny looks up expectantly."
                },
                npc: "officer_jenny"
            },
            {
                id: 'briefing_room_door',
                x: 115,
                y: 80,
                width: 90,
                height: 170,
                cursor: 'door',
                interactions: {
                    look: "A solid wooden door with a brass plate reading 'BRIEFING ROOM'. Morning briefings are held here at 0800.",
                    use: "ENTER_BRIEFING_ROOM"
                },
                targetScene: 'policeStation_briefing',
                targetX: 400,
                targetY: 500
            },
            {
                id: 'evidence_room_door',
                x: 595,
                y: 80,
                width: 90,
                height: 170,
                cursor: 'door',
                interactions: {
                    look: "The Evidence Room door. A sign reads 'AUTHORIZED PERSONNEL ONLY'. All evidence must be logged.",
                    use: "CHECK_EVIDENCE_ACCESS"
                },
                targetScene: 'policeStation_evidence',
                targetX: 400,
                targetY: 340
            },
            {
                id: 'bulletin_board',
                x: 445,
                y: 90,
                width: 110,
                height: 90,
                cursor: 'examine',
                interactions: {
                    look: "The bulletin board is covered with memos, wanted posters, and department notices. One poster catches your eye - 'DEATH ANGEL: WANTED FOR QUESTIONING'.",
                    use: "You scan the board for relevant information about current cases."
                }
            },
            {
                id: 'department_seal',
                x: 355,
                y: 10,
                width: 90,
                height: 90,
                cursor: 'examine',
                interactions: {
                    look: "The seal of the Lytton Police Department. 'To Protect and Serve' - a duty you take seriously."
                }
            },
            {
                id: 'clock',
                x: 332,
                y: 112,
                width: 36,
                height: 36,
                cursor: 'examine',
                interactions: {
                    look: "The wall clock reads 8:15 AM. Your shift started at 0800."
                }
            },
            {
                id: 'water_cooler',
                x: 705,
                y: 300,
                width: 35,
                height: 70,
                cursor: 'use',
                interactions: {
                    look: "A water cooler. Staying hydrated on the job is important.",
                    use: "You take a refreshing drink of cold water."
                }
            },
            {
                id: 'exit_to_street',
                x: 350,
                y: 570,
                width: 100,
                height: 30,
                cursor: 'exit',
                interactions: {
                    look: "The main entrance to the police station.",
                    use: "ENTER_DOWNTOWN"
                },
                targetScene: 'downtown_street',
                targetX: 300,
                targetY: 270
            }
        ],
        
        // NPCs placed ON the floor (Y >= 300)
        npcs: [
            { 
                id: 'jenny', 
                name: 'Officer Jenny Patterson', 
                x: 400, 
                y: 310, 
                facing: 'down', 
                sprite: 'jenny',
                dialog: "Good morning, Officer Bonds. Sergeant Dooley wants to see everyone in the briefing room.",
                isClickable: true
            },
            { 
                id: 'cop_bg', 
                name: 'Officer Williams', 
                x: 200, 
                y: 420, 
                facing: 'right', 
                sprite: 'officer_male', 
                isWalking: false,
                dialog: "Hey Sonny. Busy day ahead - we've got a BOLO on a white sedan connected to that Death Angel case.",
                isClickable: true
            }
        ],
        
        // Story triggers for this scene
        storyTriggers: {
            onEnter: "CHECK_BRIEFING_TIME",
            onFirstVisit: "INTRO_STATION"
        }
    },

    policeStation_briefing: {
        id: "policeStation_briefing",
        name: "Briefing Room",
        type: "interior",
        music: "tense_theme",
        description: "The briefing room where officers receive their daily assignments and case updates.",
        
        // Floor area only (Y >= 280)
        walkablePath: [
            { x: 60, y: 320 },
            { x: 740, y: 320 },
            { x: 740, y: 580 },
            { x: 60, y: 580 }
        ],

        collisionObjects: [
            // Chair rows
            { type: 'rect', x: 140, y: 370, width: 520, height: 30, label: "chair_row_1" },
            { type: 'rect', x: 140, y: 435, width: 520, height: 30, label: "chair_row_2" },
            { type: 'rect', x: 140, y: 500, width: 520, height: 30, label: "chair_row_3" },
            // Podium
            { type: 'rect', x: 340, y: 225, width: 120, height: 60, label: "podium" }
        ],
        
        hotspots: [
            {
                id: 'blackboard',
                x: 145,
                y: 25,
                width: 510,
                height: 200,
                cursor: 'examine',
                interactions: {
                    look: "The blackboard shows today's briefing:\n- BOLO: White sedan, plate 2BTF123\n- Death Angel case: All units alert\n- Patrol assignments posted\nThe words 'BE CAREFUL OUT THERE' are underlined twice."
                }
            },
            {
                id: 'podium',
                x: 340,
                y: 225,
                width: 120,
                height: 60,
                cursor: 'examine',
                interactions: {
                    look: "The sergeant's podium bears the Lytton PD emblem. Many important announcements have been made from here."
                }
            },
            {
                id: 'exit_door',
                x: 720,
                y: 320,
                width: 40,
                height: 100,
                cursor: 'door',
                interactions: {
                    use: "EXIT_BRIEFING"
                },
                targetScene: 'policeStation_lobby',
                targetX: 180,
                targetY: 400
            },
            {
                id: 'flag',
                x: 25,
                y: 30,
                width: 55,
                height: 80,
                cursor: 'examine',
                interactions: {
                    look: "The American flag stands proudly at the front of the room, a reminder of what you're sworn to protect."
                }
            }
        ],
        
        npcs: [
            { 
                id: 'sergeant', 
                name: 'Sergeant Dooley', 
                x: 400, 
                y: 320, 
                facing: 'down', 
                sprite: 'sergeant',
                dialog: "Listen up! We've got a serious situation. The Death Angel has struck again. I want everyone on high alert. Report anything suspicious immediately.",
                isClickable: true
            },
            { 
                id: 'cop1', 
                name: 'Officer Martinez', 
                x: 200, 
                y: 385, 
                facing: 'up', 
                sprite: 'officer_male',
                dialog: "Third victim this month. We need to catch this guy before he strikes again.",
                isClickable: true
            },
            { 
                id: 'cop2', 
                name: 'Officer Chen', 
                x: 350, 
                y: 385, 
                facing: 'up', 
                sprite: 'officer_female',
                dialog: "I heard the feds might get involved if we don't make progress soon.",
                isClickable: true
            },
            { 
                id: 'cop3', 
                name: 'Officer Thompson', 
                x: 500, 
                y: 385, 
                facing: 'up', 
                sprite: 'officer_male',
                dialog: "Watch your backs out there. This perp is dangerous.",
                isClickable: true
            }
        ],
        
        storyTriggers: {
            onEnter: "BRIEFING_START",
            onFirstVisit: "DEATH_ANGEL_INTRO"
        }
    },

    policeStation_evidence: {
        id: "policeStation_evidence",
        name: "Evidence Room",
        type: "interior",
        music: "ambient",
        description: "The evidence room where all case materials are securely stored and catalogued.",
        
        // Narrow walkable area in front of counter
        walkablePath: [
            { x: 50, y: 300 },
            { x: 750, y: 300 },
            { x: 750, y: 370 },
            { x: 50, y: 370 }
        ],

        collisionObjects: [],
        
        hotspots: [
            {
                id: 'counter',
                x: 0,
                y: 350,
                width: 800,
                height: 250,
                cursor: 'examine',
                interactions: {
                    look: "The evidence counter. A small bell sits on the surface with a sign: 'RING FOR SERVICE'.",
                    use: "RING_BELL"
                }
            },
            {
                id: 'evidence_cages',
                x: 50,
                y: 80,
                width: 700,
                height: 180,
                cursor: 'examine',
                interactions: {
                    look: "Rows of wire mesh cages hold evidence boxes. Each is carefully labeled with case numbers and dates. You notice a box marked 'DEATH ANGEL - ACTIVE'."
                }
            },
            {
                id: 'service_window',
                x: 300,
                y: 120,
                width: 200,
                height: 130,
                cursor: 'talk',
                interactions: {
                    look: "The service window is currently unattended.",
                    talk: "Nobody responds. The evidence clerk must be in the back."
                }
            },
            {
                id: 'exit_door',
                x: 50,
                y: 300,
                width: 50,
                height: 70,
                cursor: 'door',
                interactions: {
                    use: "EXIT_EVIDENCE"
                },
                targetScene: 'policeStation_lobby',
                targetX: 620,
                targetY: 400
            }
        ],
        
        npcs: [],
        
        storyTriggers: {
            onEnter: "CHECK_EVIDENCE_ACCESS"
        }
    },

    downtown_street: {
        id: "downtown_street",
        name: "Downtown Lytton - Main Street",
        type: "exterior",
        music: "downtown_theme",
        ambience: "city_traffic",
        description: "The main commercial street of downtown Lytton. Traffic flows steadily and pedestrians go about their business.",
        
        // Sidewalk area (Y >= 260)
        walkablePath: [
            { x: 20, y: 260 },
            { x: 780, y: 260 },
            { x: 780, y: 580 },
            { x: 20, y: 580 }
        ],

        collisionObjects: [
            // Lamp posts
            { type: 'rect', x: 91, y: 180, width: 16, height: 80, label: "lamp_1" },
            { type: 'rect', x: 391, y: 180, width: 16, height: 80, label: "lamp_2" },
            { type: 'rect', x: 691, y: 180, width: 16, height: 80, label: "lamp_3" },
            // Fire hydrant
            { type: 'rect', x: 140, y: 220, width: 25, height: 40, label: "hydrant" }
        ],
        
        hotspots: [
            {
                id: 'police_station_entrance',
                x: 200,
                y: 20,
                width: 200,
                height: 200,
                cursor: 'door',
                interactions: {
                    look: "The Lytton Police Department. Your home away from home.",
                    use: "ENTER_STATION"
                },
                targetScene: 'policeStation_lobby',
                targetX: 400,
                targetY: 550
            },
            {
                id: 'hardware_store',
                x: 20,
                y: 40,
                width: 160,
                height: 160,
                cursor: 'examine',
                interactions: {
                    look: "Johnson's Hardware Store. They've been in business since 1952.",
                    use: "The store is closed for the morning."
                }
            },
            {
                id: 'carols_coffee',
                x: 420,
                y: 42,
                width: 180,
                height: 158,
                cursor: 'examine',
                interactions: {
                    look: "Carol's Coffee Shop. Best coffee in Lytton, and Carol always has her ear to the ground for local gossip.",
                    use: "ENTER_CAROLS"
                }
            },
            {
                id: 'office_building',
                x: 620,
                y: 30,
                width: 160,
                height: 170,
                cursor: 'examine',
                interactions: {
                    look: "The Lytton Professional Building. Lawyers, accountants, and a dentist office."
                }
            },
            {
                id: 'fire_hydrant',
                x: 140,
                y: 220,
                width: 28,
                height: 45,
                cursor: 'examine',
                interactions: {
                    look: "A red fire hydrant. Recently painted and well-maintained."
                }
            },
            {
                id: 'crosswalk',
                x: 350,
                y: 263,
                width: 120,
                height: 60,
                cursor: 'walk',
                interactions: {
                    look: "A marked crosswalk. Always use crosswalks - even when you're a cop.",
                    use: "You wait for the signal before crossing."
                }
            },
            {
                id: 'parked_car_blue',
                x: 50,
                y: 380,
                width: 100,
                height: 50,
                cursor: 'examine',
                interactions: {
                    look: "A blue sedan. Legally parked."
                }
            },
            {
                id: 'to_park',
                x: 750,
                y: 300,
                width: 50,
                height: 280,
                cursor: 'exit',
                interactions: {
                    look: "The road continues east toward City Park.",
                    use: "GOTO_PARK"
                },
                targetScene: 'park',
                targetX: 50,
                targetY: 400
            }
        ],
        
        npcs: [
            { 
                id: 'civilian1', 
                name: 'Business Man', 
                x: 600, 
                y: 300, 
                facing: 'left', 
                sprite: 'civilian_male', 
                isWalking: true, 
                patrol: true,
                patrolPath: [{x: 600, y: 300}, {x: 200, y: 300}],
                dialog: "Officer. *nods and hurries past*",
                isClickable: true
            },
            { 
                id: 'civilian2', 
                name: 'Jogger', 
                x: 150, 
                y: 350, 
                facing: 'right', 
                sprite: 'civilian_female', 
                isWalking: true, 
                patrol: true,
                patrolPath: [{x: 150, y: 350}, {x: 700, y: 350}],
                dialog: "Beautiful morning for a run! Stay safe, officer!",
                isClickable: true
            }
        ],
        
        storyTriggers: {
            onEnter: "CHECK_PATROL_STATUS"
        }
    },

    park: {
        id: "park",
        name: "Lytton City Park",
        type: "exterior",
        music: "peaceful_theme",
        ambience: "birds_nature",
        description: "A peaceful city park with walking paths, a pond, and shady trees. Popular with joggers and families.",
        
        // Open grass area (Y >= 220)
        walkablePath: [
            { x: 20, y: 220 },
            { x: 780, y: 220 },
            { x: 780, y: 580 },
            { x: 20, y: 580 }
        ],

        collisionObjects: [
            // Tree trunks
            { type: 'circle', x: 100, y: 280, radius: 18, label: "tree_1" },
            { type: 'circle', x: 180, y: 380, radius: 18, label: "tree_2" },
            { type: 'circle', x: 680, y: 280, radius: 18, label: "tree_3" },
            { type: 'circle', x: 750, y: 350, radius: 18, label: "tree_4" },
            // Pond area
            { type: 'rect', x: 520, y: 320, width: 240, height: 140, label: "pond" },
            // Bench
            { type: 'rect', x: 495, y: 475, width: 100, height: 35, label: "bench" },
            // Picnic table
            { type: 'rect', x: 70, y: 395, width: 70, height: 45, label: "picnic_table" }
        ],
        
        hotspots: [
            {
                id: 'pond',
                x: 520,
                y: 320,
                width: 240,
                height: 140,
                cursor: 'examine',
                interactions: {
                    look: "A small pond with ducks swimming peacefully. The water is clear and you can see fish below the surface.",
                    use: "You watch the ducks for a moment. It's calming."
                }
            },
            {
                id: 'bench',
                x: 495,
                y: 450,
                width: 100,
                height: 60,
                cursor: 'use',
                interactions: {
                    look: "A wooden park bench with a good view of the pond.",
                    use: "SIT_BENCH"
                }
            },
            {
                id: 'flower_bed_1',
                x: 47,
                y: 477,
                width: 86,
                height: 46,
                cursor: 'examine',
                interactions: {
                    look: "A well-maintained flower bed. Red roses, yellow daisies, and purple petunias create a colorful display."
                }
            },
            {
                id: 'picnic_table',
                x: 70,
                y: 395,
                width: 70,
                height: 45,
                cursor: 'examine',
                interactions: {
                    look: "A wooden picnic table. Families often have lunch here on weekends."
                }
            },
            {
                id: 'path',
                x: 340,
                y: 200,
                width: 120,
                height: 400,
                cursor: 'walk',
                interactions: {
                    look: "A well-worn dirt path winds through the park."
                }
            },
            {
                id: 'to_downtown',
                x: 0,
                y: 300,
                width: 30,
                height: 280,
                cursor: 'exit',
                interactions: {
                    look: "The path leads back to downtown.",
                    use: "GOTO_DOWNTOWN"
                },
                targetScene: 'downtown_street',
                targetX: 720,
                targetY: 400
            }
        ],
        
        npcs: [
            { 
                id: 'jogger', 
                name: 'Female Jogger', 
                x: 300, 
                y: 280, 
                facing: 'right', 
                sprite: 'civilian_female', 
                isWalking: true, 
                patrol: true,
                patrolPath: [{x: 300, y: 280}, {x: 500, y: 280}, {x: 500, y: 500}, {x: 300, y: 500}],
                dialog: "Nice day for a jog! *keeps running*",
                isClickable: true
            },
            { 
                id: 'old_man', 
                name: 'Elderly Man', 
                x: 550, 
                y: 490, 
                facing: 'up', 
                sprite: 'civilian_male', 
                isWalking: false,
                dialog: "Beautiful park, isn't it? I come here every morning to feed the ducks. Say, you're a police officer - have you heard about those terrible murders?",
                isClickable: true
            }
        ],
        
        storyTriggers: {
            onEnter: "CHECK_PARK_EVENTS"
        }
    }
};

// Export
window.ENHANCED_SCENES = ENHANCED_SCENES;
