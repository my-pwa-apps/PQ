// Define the game data in the global scope
window.GAME_DATA = {
    scenes: {
        policeStation: {
            background: 'images/police_station.png',
            music: 'station_theme',
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
            ]
        },
        downtown: {
            background: 'images/downtown.png',
            music: 'downtown_theme',
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
            ]
        },
        officeArea: {
            background: 'images/office_area.png',
            music: 'office_theme',
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
    ]
};

console.log("Game data loaded successfully");
