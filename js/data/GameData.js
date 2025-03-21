// Define the game data in the global scope
window.GAME_DATA = {
    config: {
        defaultSceneBounds: { width: 800, height: 600 },
        defaultPlayerStart: { x: 400, y: 450 }
    },
    scenes: {
        policeStation: {
            background: 'images/police_station.png',
            music: 'station_theme',
            bounds: { width: 800, height: 600 },
            walkableAreas: [
                { x1: 100, y1: 400, x2: 700, y2: 500 }  // Main floor area
            ],
            collisionZones: [
                { x1: 0, y1: 0, x2: 800, y2: 380 },     // Upper wall
                { x1: 0, y1: 520, x2: 800, y2: 600 }    // Lower wall
            ],
            hotspots: [
                {
                    name: 'Desk',
                    description: 'A cluttered desk with various papers.',
                    interaction: 'search',
                    result: 'You found a key!'
                },
                {
                    name: 'Evidence Locker',
                    description: 'A locked evidence locker.',
                    interaction: 'use',
                    requiredItem: 'key',
                    result: 'You unlocked the evidence locker and found a file!'
                },
                {
                    name: 'Office Door',
                    description: 'Door to the detective office area.',
                    interaction: 'use',
                    target: 'officeArea',
                    result: 'You enter the detective office.'
                },
                {
                    name: 'Parking Lot Exit',
                    description: 'Exit to the station parking lot.',
                    interaction: 'use',
                    target: 'parkingLot',
                    result: 'You head out to the parking lot.'
                }
            ],
            defaultPosition: { x: 400, y: 450 },
            spawnPoints: {
                fromParking: { x: 700, y: 450 },
                fromOffice: { x: 200, y: 450 }
            }
        },
        downtown: {
            background: 'images/downtown.png',
            music: 'downtown_theme',
            bounds: { width: 800, height: 600 },
            walkableAreas: [
                { x1: 50, y1: 350, x2: 750, y2: 500 }   // Sidewalk area
            ],
            collisionZones: [
                { x1: 0, y1: 0, x2: 800, y2: 340 },     // Buildings
                { x1: 0, y1: 520, x2: 800, y2: 600 }    // Street
            ],
            hotspots: [
                {
                    name: 'Electronics Store',
                    description: 'A store with a broken window.',
                    interaction: 'inspect',
                    result: 'You found a piece of glass with fingerprints!'
                },
                {
                    name: 'Coffee Shop',
                    description: 'A small coffee shop where locals hang out.',
                    interaction: 'enter',
                    target: 'coffeeShop',
                    result: 'You enter the coffee shop.'
                },
                {
                    name: 'Back to Station',
                    description: 'Return to the police station.',
                    interaction: 'use',
                    target: 'policeStation',
                    result: 'You head back to the station.'
                }
            ],
            defaultPosition: { x: 400, y: 425 },
            spawnPoints: {
                fromStation: { x: 100, y: 425 },
                fromCoffee: { x: 600, y: 425 }
            }
        },
        officeArea: {
            background: 'images/office_area.png',
            music: 'office_theme',
            bounds: { width: 800, height: 600 },
            walkableAreas: [
                { x1: 150, y1: 380, x2: 650, y2: 520 }  // Office floor
            ],
            collisionZones: [
                { x1: 0, y1: 0, x2: 800, y2: 360 },     // Desks and walls
                { x1: 0, y1: 540, x2: 800, y2: 600 }    // Back wall
            ],
            hotspots: [
                {
                    name: 'Detective Desk',
                    description: 'A cluttered detective desk with case files.',
                    interaction: 'search',
                    result: 'You found a case file on the recent burglaries.'
                },
                {
                    name: 'Filing Cabinet',
                    description: 'A metal filing cabinet with various folders.',
                    interaction: 'search',
                    result: 'You find some interesting records about previous cases.'
                },
                {
                    name: 'Exit Door',
                    description: 'Door leading to the main lobby.',
                    interaction: 'use',
                    target: 'policeStation',
                    result: 'You head back to the main lobby.'
                },
                {
                    name: 'Captain\'s Office',
                    description: 'The office of your supervising Captain.',
                    interaction: 'use',
                    target: 'captainsOffice',
                    result: 'You enter the Captain\'s office.'
                }
            ]
        },
        parkingLot: {
            background: 'images/parking_lot.png',
            music: 'outdoor_theme',
            bounds: { width: 800, height: 600 },
            walkableAreas: [
                { x1: 50, y1: 300, x2: 750, y2: 550 }   // Parking area
            ],
            collisionZones: [
                { x1: 0, y1: 0, x2: 800, y2: 280 },     // Building
                { x1: 200, y1: 300, x2: 600, y2: 400 }  // Parked cars
            ],
            hotspots: [
                {
                    name: 'Police Car',
                    description: 'Your assigned patrol vehicle.',
                    interaction: 'use',
                    result: 'You get in your police car.',
                    specialAction: 'showDriveMenu'
                },
                {
                    name: 'Station Entrance',
                    description: 'The entrance back into the police station.',
                    interaction: 'use',
                    target: 'policeStation',
                    result: 'You head back into the station.'
                }
            ]
        },
        captainsOffice: {
            background: 'images/captains_office.png',
            music: 'office_theme',
            bounds: { width: 800, height: 600 },
            walkableAreas: [
                { x1: 200, y1: 350, x2: 600, y2: 500 }  // Office floor
            ],
            collisionZones: [
                { x1: 0, y1: 0, x2: 800, y2: 330 },     // Desk and furniture
                { x1: 0, y1: 520, x2: 800, y2: 600 }    // Back wall
            ],
            hotspots: [
                {
                    name: 'Captain',
                    description: 'Your supervisor, Captain Mitchell.',
                    interaction: 'talk',
                    dialogId: 'captainDialog',
                    result: 'You speak with the Captain about your case.'
                },
                {
                    name: 'Exit Door',
                    description: 'Door back to the detective office.',
                    interaction: 'use',
                    target: 'officeArea',
                    result: 'You leave the Captain\'s office.'
                }
            ]
        },
        coffeeShop: {
            background: 'images/coffee_shop.png',
            music: 'coffee_shop_theme',
            bounds: { width: 800, height: 600 },
            walkableAreas: [
                { x1: 100, y1: 350, x2: 700, y2: 500 }  // Shop floor
            ],
            collisionZones: [
                { x1: 0, y1: 0, x2: 800, y2: 330 },     // Counter and walls
                { x1: 50, y1: 350, x2: 200, y2: 450 },  // Tables
                { x1: 500, y1: 350, x2: 650, y2: 450 }  // More tables
            ],
            hotspots: [
                {
                    name: 'Barista',
                    description: 'The coffee shop employee who might have seen something.',
                    interaction: 'talk',
                    dialogId: 'baristaDialog',
                    result: 'You interview the barista about any suspicious activity.'
                },
                {
                    name: 'Suspicious Customer',
                    description: 'A nervous-looking person in the corner booth.',
                    interaction: 'talk',
                    dialogId: 'suspiciousPersonDialog',
                    result: 'You approach the suspicious individual for questioning.'
                },
                {
                    name: 'Exit',
                    description: 'Exit back to downtown.',
                    interaction: 'use',
                    target: 'downtown',
                    result: 'You leave the coffee shop.'
                }
            ]
        }
    },
    cases: {
        case1: {
            title: "The Downtown Burglar",
            description: "A series of break-ins has occurred in downtown electronic stores. The perpetrator seems to be targeting high-end equipment and leaving almost no evidence behind.",
            stages: [
                {
                    id: 'stage1',
                    objective: 'Inspect the electronics store.',
                    trigger: 'inspect',
                    target: 'Electronics Store',
                    nextStage: 'stage2',
                    completed: false
                },
                {
                    id: 'stage2',
                    objective: 'Analyze the fingerprints.',
                    trigger: 'analyze',
                    target: 'fingerprints',
                    nextStage: 'stage3',
                    completed: false
                },
                {
                    id: 'stage3',
                    objective: 'Interview witnesses at the coffee shop.',
                    trigger: 'talk',
                    target: 'Barista',
                    nextStage: 'stage4',
                    completed: false
                },
                {
                    id: 'stage4',
                    objective: 'Report findings to the Captain.',
                    trigger: 'talk',
                    target: 'Captain',
                    nextStage: null,
                    completed: false
                }
            ],
            evidence: ['fingerprints'],
            suspects: [
                {
                    name: 'John Doe',
                    description: 'A known burglar with a history of targeting electronics stores.'
                },
                {
                    name: 'Suspicious Customer',
                    description: 'Person seen near the electronics store on the night of the burglary.'
                }
            ]
        },
        case2: {
            title: "Missing Evidence",
            description: "Crucial evidence from several cases has gone missing from the evidence locker. Internal investigation required.",
            stages: [
                {
                    id: 'stage1',
                    objective: 'Search the evidence locker.',
                    trigger: 'search',
                    target: 'Evidence Locker',
                    nextStage: 'stage2',
                    completed: false
                },
                {
                    id: 'stage2',
                    objective: 'Check the security logs.',
                    trigger: 'inspect',
                    target: 'Security Log',
                    nextStage: 'stage3',
                    completed: false
                },
                {
                    id: 'stage3',
                    objective: 'Report findings to the Captain.',
                    trigger: 'talk',
                    target: 'Captain',
                    nextStage: null,
                    completed: false
                }
            ],
            evidence: ['missing files', 'security logs'],
            suspects: []
        }
    },
    dialogs: {
        categories: {
            investigation: ['captainDialog', 'baristaDialog'],
            suspects: ['suspiciousPersonDialog']
        },
        captainDialog: [
            { text: "How's the investigation going, Detective?", options: [1, 2, 3] },
            { text: "I'm making progress on the case.", next: 4 },
            { text: "I need more time to gather evidence.", next: 5 },
            { text: "I think I've solved it.", next: 6 },
            { text: "Good. Keep me updated on any developments.", next: null },
            { text: "Don't take too long. This case is a priority.", next: null },
            { text: "Excellent! Let me hear your theory.", next: 7 }
        ],
        baristaDialog: [
            { text: "Good morning, Officer. What can I help you with?", options: [1, 2, 3] },
            { text: "Did you see anything suspicious last night?", next: 4 },
            { text: "Do you know anything about the break-in across the street?", next: 5 },
            { text: "Have you seen this person before? [Show Photo]", next: 6 },
            { text: "Actually, I did see someone hanging around late. Suspicious character.", next: 7 },
            { text: "Yes, it was terrible! There was a person who came in here right before closing, very nervous.", next: 7 },
            { text: "Oh! That's the person who was here yesterday! They were acting strange.", next: 7 },
            { text: "They were wearing a dark hoodie and kept looking out the window at the electronics store. Left in a hurry too.", next: 8 },
            { text: "I can describe them to a sketch artist if that helps.", next: null, addEvidence: "witness description" }
        ],
        suspiciousPersonDialog: [
            { text: "What do you want? I'm just having coffee.", options: [1, 2, 3] },
            { text: "Just routine questions. Where were you last night?", next: 4 },
            { text: "You seem nervous. Something bothering you?", next: 5 },
            { text: "I need to see some identification.", next: 6 },
            { text: "At home. Watching TV. Why?", next: 7 },
            { text: "No! I'm fine. Just... in a hurry.", next: 8 },
            { text: "Do you have a warrant? I know my rights.", next: 9 },
            { text: "You can check with my roommate if you don't believe me.", next: null },
            { text: "Look, I need to go. I'm late for work.", next: 10, suspicious: true },
            { text: "Fine. Here's my ID. Can I go now?", next: null, addEvidence: "suspect ID" },
            { text: "[They suddenly get up and try to leave]", action: "attemptFlee" }
        ]
    },
    inventory: [],
    vehicleDestinations: [
        { name: "Downtown", target: "downtown" },
        { name: "Police Station", target: "policeStation" }
    ],
    settings: {
        defaultWalkSpeed: 3,
        dialogDisplayTime: 3000,
        musicVolume: 0.7,
        sfxVolume: 1.0
    }
};

try {
    Object.freeze(window.GAME_DATA);
    Object.freeze(window.GAME_DATA.config);
    Object.freeze(window.GAME_DATA.settings);
} catch (error) {
    console.error('Failed to initialize game data:', error);
}
