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
        ambience: "office_sounds",
        description: "The main lobby of Lytton Police Department. Officers bustle about their duties.",
        
        background: {
            render: "drawPoliceStationLobby",
            layers: ["floor", "walls", "furniture", "decorations"]
        },
        
        lighting: {
            ambient: 0.9,
            sources: [
                { x: 400, y: 100, radius: 150, intensity: 0.7, color: "#FFFF99" }, // Ceiling lights
                { x: 200, y: 200, radius: 100, intensity: 0.5, color: "#FFFF99" }
            ]
        },
        
        collisionObjects: [
            // Reception desk
            { type: 'rect', x: 350, y: 280, width: 160, height: 60, label: "reception_desk" },
            // Waiting chairs
            { type: 'rect', x: 150, y: 350, width: 100, height: 40, label: "waiting_chairs" },
            // File cabinets
            { type: 'rect', x: 50, y: 200, width: 30, height: 80, label: "file_cabinet_1" },
            { type: 'rect', x: 80, y: 200, width: 30, height: 80, label: "file_cabinet_2" },
            { type: 'rect', x: 720, y: 200, width: 30, height: 80, label: "file_cabinet_3" },
            // Walls
            { type: 'rect', x: 400, y: 10, width: 800, height: 20, label: "north_wall" },
            { type: 'rect', x: 10, y: 300, width: 20, height: 600, label: "west_wall" },
            { type: 'rect', x: 790, y: 300, width: 20, height: 600, label: "east_wall" },
            // Water cooler
            { type: 'circle', x: 730, y: 280, radius: 12, label: "water_cooler" },
            // Plants
            { type: 'circle', x: 50, y: 350, radius: 15, label: "plant_1" },
            { type: 'circle', x: 750, y: 350, radius: 15, label: "plant_2" }
        ],
        
        hotspots: [
            {
                id: 'reception_desk',
                x: 400,
                y: 300,
                width: 160,
                height: 70,
                cursor: 'examine',
                interactions: {
                    look: "The reception desk. Officer Jenny Patterson handles front desk duties with professional efficiency.",
                    use: "You approach the desk. Jenny looks up with a friendly smile.",
                    talk: "TALK_TO_JENNY",
                    take: "That's police property, Bonds. And it's bolted down anyway."
                },
                npc: "officer_jenny"
            },
            {
                id: 'briefing_room_door',
                x: 100,
                y: 180,
                width: 60,
                height: 120,
                cursor: 'door',
                interactions: {
                    look: "Door to the briefing room. Morning briefings are held here at 0800 hours.",
                    use: "ENTER_BRIEFING_ROOM",
                    talk: "The door doesn't respond. (Doors rarely do.)",
                    take: "The door is attached to the building. Removing it would be... problematic."
                },
                targetScene: 'policeStation_briefing',
                targetX: 700,
                targetY: 400,
                locked: false,
                sierraHumor: "You try to take the door. After a moment of tugging, you realize your error and feel slightly foolish."
            },
            {
                id: 'evidence_room_door',
                x: 700,
                y: 180,
                width: 60,
                height: 120,
                cursor: 'door',
                interactions: {
                    look: "Evidence Room. Secured access only. A keypad lock guards the entrance.",
                    use: "CHECK_EVIDENCE_ACCESS",
                    talk: "You knock. No answer. The evidence isn't very talkative today.",
                    take: "The door is locked tight. That's kind of the point of evidence security."
                },
                targetScene: 'policeStation_evidence',
                targetX: 400,
                targetY: 400,
                locked: true,
                requires: ["evidence_room_code"],
                lockMessage: "The evidence room requires a 4-digit access code. You don't have clearance yet."
            },
            {
                id: 'exit_to_downtown',
                x: 400,
                y: 550,
                width: 80,
                height: 40,
                cursor: 'exit',
                interactions: {
                    look: "Exit to downtown Lytton. Fresh air and crime await.",
                    use: "LEAVE_STATION",
                    talk: "You could talk to the exit sign, but people would stare.",
                    take: "The exit sign is government property. Also, you have no use for it."
                },
                targetScene: 'downtown_main',
                targetX: 400,
                targetY: 100
            },
            {
                id: 'coffee_machine',
                x: 680,
                y: 170,
                width: 40,
                height: 50,
                cursor: 'use',
                interactions: {
                    look: "The station coffee machine. It's seen better days. And better coffee.",
                    use: "USE_COFFEE_MACHINE",
                    talk: "You whisper sweet nothings to the coffee machine. It gurgles in response.",
                    take: "The coffee machine weighs about 50 pounds and is plugged in. Pass."
                },
                usable: true,
                item: "coffee_cup",
                sierraHumor: "The coffee is thick enough to stand a spoon in. You're pretty sure it's developing sentience."
            },
            {
                id: 'notice_board',
                x: 500,
                y: 100,
                width: 140,
                height: 90,
                cursor: 'examine',
                interactions: {
                    look: "The department notice board. Wanted posters, memos, and safety reminders.",
                    use: "EXAMINE_NOTICE_BOARD",
                    talk: "The notices stare back at you silently. They're not much for conversation.",
                    take: "Taking police notices would be tampering with official documents. Bad idea."
                },
                readable: true,
                content: "NOTICE BOARD:\n\n• WANTED: Suspect in electronics thefts. 6' tall, dark clothing.\n• MEMO: All officers must complete firearm recertification by Friday.\n• SAFETY: Remember to wear your vest. This message brought to you by officers who didn't.\n• FOR SALE: 1985 Dodge, runs good, $2000 OBO - see Officer Martinez"
            },
            {
                id: 'water_cooler',
                x: 730,
                y: 280,
                width: 30,
                height: 40,
                cursor: 'use',
                interactions: {
                    look: "The station water cooler. Cool, refreshing water. Unlike the coffee.",
                    use: "DRINK_WATER",
                    talk: "You engage the water cooler in conversation. It bubbles thoughtfully.",
                    take: "You can't take the whole cooler. You could use a cup though."
                },
                usable: true,
                consumable: true
            }
        ],
        
        npcs: [
            {
                id: "officer_jenny",
                name: "Officer Jenny Patterson",
                x: 400,
                y: 280,
                facing: "down",
                sprite: "jenny",
                role: "receptionist",
                importance: "critical",
                interactive: true,
                patrol: false
            },
            {
                id: "officer_walking",
                name: "Officer Rodriguez",
                x: 200,
                y: 400,
                facing: "right",
                sprite: "officer_male",
                role: "patrol",
                importance: "background",
                interactive: false,
                patrol: true,
                patrolPath: [
                    { x: 200, y: 400 },
                    { x: 600, y: 400 },
                    { x: 600, y: 300 },
                    { x: 200, y: 300 }
                ]
            }
        ],
        
        sierraDeaths: [
            {
                id: "improper_uniform",
                trigger: "enter_without_uniform",
                message: "You attempt to enter the station in civilian clothes.\n\nSergeant Dooley spots you immediately.\n\n'BONDS! Is this amateur hour? Get into uniform before you step foot in my station again!'\n\nYour shift is over before it begins.\n\n=== GAME OVER ===\n\nRemember: Proper uniform, proper officer!"
            }
        ],
        
        secrets: [
            {
                id: "hidden_donut",
                trigger: "examine_plant_repeatedly",
                message: "Behind the plant, you discover a hidden box of donuts!\n\n+10 points for exceptional detective work!\n\n(Or possibly just being hungry.)",
                reward: "donuts",
                points: 10
            }
        ]
    },
    
    policeStation_briefing: {
        id: "policeStation_briefing",
        name: "Police Station - Briefing Room",
        type: "interior",
        music: "station_theme",
        description: "The briefing room. Morning roll call and case assignments happen here.",
        
        lighting: {
            ambient: 0.95,
            sources: [
                { x: 400, y: 150, radius: 200, intensity: 0.8, color: "#FFFFFF" }
            ]
        },
        
        collisionObjects: [
            // Conference table
            { type: 'rect', x: 250, y: 250, width: 300, height: 150, label: "conference_table" },
            // Chairs
            { type: 'rect', x: 200, y: 240, width: 40, height: 40, label: "chair_1" },
            { type: 'rect', x: 200, y: 350, width: 40, height: 40, label: "chair_2" },
            { type: 'rect', x: 560, y: 240, width: 40, height: 40, label: "chair_3" },
            { type: 'rect', x: 560, y: 350, width: 40, height: 40, label: "chair_4" },
            // Podium
            { type: 'rect', x: 400, y: 150, width: 60, height: 40, label: "podium" },
            // Whiteboard
            { type: 'rect', x: 400, y: 50, width: 200, height: 80, label: "whiteboard" }
        ],
        
        hotspots: [
            {
                id: 'conference_table',
                x: 400,
                y: 325,
                width: 300,
                height: 150,
                interactions: {
                    look: "The briefing room table. Countless case files have been reviewed here.",
                    use: "You sit at the table and review some notes.",
                    take: "The table is far too heavy. And you have nowhere to put it."
                }
            },
            {
                id: 'whiteboard',
                x: 400,
                y: 90,
                width: 200,
                height: 80,
                interactions: {
                    look: "READ_WHITEBOARD",
                    use: "You could write on it, but you don't have a marker.",
                    take: "The whiteboard is mounted to the wall. Stealing it seems unwise."
                },
                readable: true,
                content: "CURRENT CASES:\n\n1. Electronics Store Burglaries (x3)\n   - TechWorld, CompuCenter, Digital Den\n   - High-end components stolen\n   - Professional operation\n\n2. Traffic Enforcement\n   - Speed trap, Highway 1\n   - DUI checkpoints Friday night\n\n3. Vandalism Reports\n   - City Park area\n   - Graffiti and property damage"
            },
            {
                id: 'podium',
                x: 400,
                y: 170,
                width: 60,
                height: 40,
                interactions: {
                    look: "Sergeant Dooley's podium. Many lectures have been delivered from this spot.",
                    use: "You step up to the podium and pretend to give a briefing. Your audience of empty chairs is not impressed.",
                    talk: "You could give a speech, but nobody's here to listen.",
                    take: "That's Sergeant Dooley's podium. Touch it and face his wrath."
                }
            },
            {
                id: 'exit_door',
                x: 100,
                y: 400,
                width: 60,
                height: 100,
                interactions: {
                    look: "Door back to the main lobby.",
                    use: "RETURN_TO_LOBBY"
                },
                targetScene: 'policeStation_lobby',
                targetX: 150,
                targetY: 250
            }
        ],
        
        npcs: [
            {
                id: "sergeant_dooley",
                name: "Sergeant Dooley",
                x: 400,
                y: 180,
                facing: "down",
                sprite: "sergeant",
                role: "supervisor",
                importance: "critical",
                interactive: true,
                patrol: false
            }
        ]
    },
    
    policeStation_evidence: {
        id: "policeStation_evidence",
        name: "Police Station - Evidence Room",
        type: "interior",
        music: "station_theme",
        description: "The evidence storage room. Secured and climate controlled.",
        
        lighting: {
            ambient: 0.85,
            sources: [
                { x: 400, y: 200, radius: 150, intensity: 0.7, color: "#CCCCFF" }
            ]
        },
        
        collisionObjects: [
            // Evidence lockers
            { type: 'rect', x: 100, y: 150, width: 80, height: 200, label: "locker_a" },
            { type: 'rect', x: 200, y: 150, width: 80, height: 200, label: "locker_b" },
            { type: 'rect', x: 520, y: 150, width: 80, height: 200, label: "locker_c" },
            { type: 'rect', x: 620, y: 150, width: 80, height: 200, label: "locker_d" },
            // Work table
            { type: 'rect', x: 350, y: 350, width: 150, height: 80, label: "work_table" }
        ],
        
        hotspots: [
            {
                id: 'evidence_locker_current',
                x: 140,
                y: 250,
                width: 80,
                height: 200,
                interactions: {
                    look: "Current case evidence locker. Requires authorization to access.",
                    use: "EXAMINE_CURRENT_EVIDENCE",
                    take: "Evidence must be signed out following proper chain of custody."
                },
                secured: true,
                requires: ["detective_badge"]
            },
            {
                id: 'work_table',
                x: 425,
                y: 390,
                width: 150,
                height: 80,
                interactions: {
                    look: "Evidence examination table. Various tools and magnifying equipment.",
                    use: "EXAMINE_EVIDENCE_HERE",
                    take: "The table is quite stationary. As tables tend to be."
                }
            },
            {
                id: 'exit_door',
                x: 400,
                y: 550,
                width: 60,
                height: 40,
                interactions: {
                    look: "Secure exit from evidence room.",
                    use: "LEAVE_EVIDENCE_ROOM"
                },
                targetScene: 'policeStation_lobby',
                targetX: 700,
                targetY: 250
            }
        ]
    },
    
    // ==================== DOWNTOWN SCENES ====================
    
    downtown_main: {
        id: "downtown_main",
        name: "Downtown Lytton - Main Street",
        type: "exterior",
        music: "downtown_theme",
        ambience: "city_sounds",
        description: "Downtown Lytton's main commercial district. Various shops and businesses line the street.",
        
        lighting: {
            ambient: 0.95,
            timeDependent: true
        },
        
        collisionObjects: [
            // Buildings
            { type: 'rect', x: 150, y: 100, width: 120, height: 200, label: "techworld_building" },
            { type: 'rect', x: 350, y: 100, width: 100, height: 200, label: "cafe_building" },
            { type: 'rect', x: 550, y: 100, width: 140, height: 200, label: "bank_building" },
            // Street furniture
            { type: 'circle', x: 100, y: 350, radius: 8, label: "lamp_post_1" },
            { type: 'circle', x: 400, y: 350, radius: 8, label: "lamp_post_2" },
            { type: 'circle', x: 700, y: 350, radius: 8, label: "lamp_post_3" },
            { type: 'circle', x: 250, y: 360, radius: 12, label: "fire_hydrant" },
            // Parked vehicles
            { type: 'rect', x: 600, y: 380, width: 60, height: 30, label: "parked_car" }
        ],
        
        hotspots: [
            {
                id: 'techworld_entrance',
                x: 210,
                y: 250,
                width: 60,
                height: 80,
                interactions: {
                    look: "TechWorld Electronics. Scene of a recent break-in. Yellow police tape marks the entrance.",
                    use: "ENTER_TECHWORLD",
                    talk: "The building doesn't respond. Buildings rarely do."
                },
                targetScene: 'techworld_interior',
                targetX: 400,
                targetY: 450,
                crimeScene: true
            },
            {
                id: 'crime_scene_tape',
                x: 210,
                y: 280,
                width: 80,
                height: 20,
                interactions: {
                    look: "Police crime scene tape. 'DO NOT CROSS' it warns.",
                    use: "You duck under the tape. You're a cop, you're allowed.",
                    take: "You could take it, but why? Do you collect crime scene tape?"
                },
                evidenceMarker: true
            },
            {
                id: 'alleyway',
                x: 300,
                y: 200,
                width: 40,
                height: 150,
                interactions: {
                    look: "A dark alley between buildings. Perfect for suspicious activity.",
                    use: "INVESTIGATE_ALLEY",
                    take: "You can't take an entire alley. Physics won't allow it."
                },
                targetScene: 'downtown_alley',
                targetX: 400,
                targetY: 500
            },
            {
                id: 'patrol_car',
                x: 600,
                y: 395,
                width: 60,
                height: 30,
                interactions: {
                    look: "Unit 15 - your patrol car. Ready for duty.",
                    use: "ENTER_PATROL_CAR",
                    talk: "You try talking to your car. It doesn't answer. (It needs an oil change though.)"
                },
                vehicle: true,
                usable: true
            },
            {
                id: 'witness_location',
                x: 450,
                y: 350,
                width: 40,
                height: 60,
                interactions: {
                    look: "A nervous-looking shopkeeper stands here.",
                    talk: "INTERVIEW_WITNESS",
                    use: "You can't 'use' people, Bonds. Try talking to them."
                },
                npc: "witness_martinez"
            },
            {
                id: 'return_to_station',
                x: 400,
                y: 50,
                width: 100,
                height: 40,
                interactions: {
                    look: "Path back to the police station.",
                    use: "RETURN_TO_STATION"
                },
                targetScene: 'policeStation_lobby',
                targetX: 400,
                targetY: 500
            }
        ],
        
        npcs: [
            {
                id: "witness_martinez",
                name: "Carlos Martinez",
                x: 180,
                y: 320,
                facing: "down",
                sprite: "civilian_male",
                role: "witness",
                importance: "high",
                interactive: true,
                patrol: false,
                emotional_state: "nervous"
            },
            {
                id: "pedestrian_1",
                name: "Pedestrian",
                x: 500,
                y: 380,
                facing: "left",
                sprite: "civilian_female",
                role: "background",
                importance: "low",
                interactive: false,
                patrol: true,
                patrolPath: [
                    { x: 500, y: 380 },
                    { x: 200, y: 380 }
                ]
            }
        ]
    },
    
    downtown_alley: {
        id: "downtown_alley",
        name: "Downtown Alley",
        type: "exterior",
        music: "suspense_theme",
        description: "A narrow alley behind the shops. Dumpsters and shadows.",
        
        lighting: {
            ambient: 0.6,
            sources: [
                { x: 100, y: 100, radius: 80, intensity: 0.4, color: "#FFAA00" }
            ]
        },
        
        collisionObjects: [
            { type: 'rect', x: 50, y: 300, width: 80, height: 60, label: "dumpster_1" },
            { type: 'rect', x: 650, y: 280, width: 80, height: 60, label: "dumpster_2" },
            { type: 'rect', x: 200, y: 150, width: 100, height: 40, label: "crates" }
        ],
        
        hotspots: [
            {
                id: 'footprint_evidence',
                x: 350,
                y: 380,
                width: 30,
                height: 40,
                interactions: {
                    look: "EXAMINE_FOOTPRINT",
                    use: "COLLECT_FOOTPRINT",
                    take: "COLLECT_FOOTPRINT_CAST"
                },
                evidence: true,
                evidenceId: "boot_print",
                collectible: true
            },
            {
                id: 'suspicious_van',
                x: 500,
                y: 350,
                width: 80,
                height: 60,
                interactions: {
                    look: "A dark van parked in the alley. Matches witness description.",
                    use: "EXAMINE_VAN",
                    take: "You can't just take someone's van, Bonds. Even suspicious ones."
                },
                evidence: true,
                searchable: true
            },
            {
                id: 'pry_marks',
                x: 250,
                y: 250,
                width: 40,
                height: 80,
                interactions: {
                    look: "Fresh pry marks on the back door of TechWorld. Recent.",
                    use: "PHOTOGRAPH_EVIDENCE",
                    take: "You can't take pry marks. But you can document them."
                },
                evidence: true,
                photographable: true
            },
            {
                id: 'exit_alley',
                x: 400,
                y: 550,
                width: 80,
                height: 40,
                interactions: {
                    look: "Exit back to Main Street.",
                    use: "LEAVE_ALLEY"
                },
                targetScene: 'downtown_main',
                targetX: 300,
                targetY: 280
            }
        ]
    },
    
    techworld_interior: {
        id: "techworld_interior",
        name: "TechWorld Electronics - Interior",
        type: "interior",
        music: "investigation_theme",
        description: "Inside the burglarized electronics store. Emptied display cases and signs of forced entry.",
        
        lighting: {
            ambient: 0.8,
            flickering: true
        },
        
        collisionObjects: [
            { type: 'rect', x: 150, y: 200, width: 100, height: 80, label: "display_case_1" },
            { type: 'rect', x: 300, y: 200, width: 100, height: 80, label: "display_case_2" },
            { type: 'rect', x: 550, y: 200, width: 100, height: 80, label: "display_case_3" },
            { type: 'rect', x: 400, y: 400, width: 80, height: 60, label: "checkout_counter" }
        ],
        
        hotspots: [
            {
                id: 'empty_display_case',
                x: 200,
                y: 240,
                width: 100,
                height: 80,
                interactions: {
                    look: "Empty display case. High-end graphics cards were stolen from here.",
                    use: "EXAMINE_DISPLAY_CASE",
                    take: "The case is empty. That's the problem."
                },
                evidence: true
            },
            {
                id: 'security_camera',
                x: 700,
                y: 100,
                width: 30,
                height: 40,
                interactions: {
                    look: "Security camera. Wires have been cut. Professional work.",
                    use: "EXAMINE_CAMERA",
                    take: "The camera is mounted to the ceiling. Leave it be."
                },
                evidence: true,
                evidenceId: "cut_camera_wires"
            },
            {
                id: 'broken_lock',
                x: 100,
                y: 450,
                width: 40,
                height: 60,
                interactions: {
                    look: "Back door with forced lock. Point of entry.",
                    use: "EXAMINE_LOCK_DAMAGE",
                    take: "COLLECT_LOCK_EVIDENCE"
                },
                evidence: true,
                evidenceId: "forced_lock"
            },
            {
                id: 'exit_store',
                x: 400,
                y: 550,
                width: 80,
                height: 40,
                interactions: {
                    look: "Exit to Main Street.",
                    use: "LEAVE_STORE"
                },
                targetScene: 'downtown_main',
                targetX: 210,
                targetY: 320
            }
        ],
        
        npcs: [
            {
                id: "owner_martinez",
                name: "Carlos Martinez",
                x: 450,
                y: 420,
                facing: "left",
                sprite: "civilian_male",
                role: "victim",
                importance: "high",
                interactive: true,
                emotional_state: "distressed"
            }
        ]
    },
    
    // ==================== Additional Scenes ====================
    
    city_park: {
        id: "city_park",
        name: "Lytton City Park",
        type: "exterior",
        music: "park_theme",
        description: "A peaceful city park. Or it would be, if not for the recent vandalism.",
        
        // ... (continued with park details)
    },
    
    suspects_apartment: {
        id: "suspects_apartment",
        name: "Suspect's Apartment",
        type: "interior",
        music: "suspense_theme",
        description: "The suspect's apartment. Time to search for evidence."
    },
    
    warehouse_district: {
        id: "warehouse_district",
        name: "Warehouse District",
        type: "exterior",
        music: "danger_theme",
        description: "Industrial warehouse area. Perfect place to fence stolen goods."
    },
    
    courthouse: {
        id: "courthouse",
        name: "Lytton County Courthouse",
        type: "interior",
        music: "serious_theme",
        description: "The courthouse. Where justice is served (ideally)."
    }
};

// Export for game engine
window.ENHANCED_SCENES = ENHANCED_SCENES;
