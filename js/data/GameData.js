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
                    result: 'You head back to the main lobby.'
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
                    objective: 'Inspect the electronics store.',
                    trigger: 'inspect',
                    target: 'Electronics Store',
                    nextStage: 1
                },
                {
                    objective: 'Analyze the fingerprints.',
                    trigger: 'analyze',
                    target: 'fingerprints',
                    nextStage: 2
                }
            ],
            evidence: ['fingerprints'],
            suspects: [
                {
                    name: 'John Doe',
                    description: 'A known burglar with a history of targeting electronics stores.'
                }
            ]
        },
        case2: {
            title: "Missing Evidence",
            description: "Crucial evidence from several cases has gone missing from the evidence locker. Internal investigation required.",
            stages: [
                {
                    objective: 'Search the evidence locker.',
                    trigger: 'search',
                    target: 'Evidence Locker',
                    nextStage: 1
                }
            ],
            evidence: ['missing files'],
            suspects: []
        }
    },
    inventory: []
};

console.log("Game data loaded successfully");
