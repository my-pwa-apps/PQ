const GAME_DATA = {
    scenes: {
        policeStation: {
            background: '', // Background is drawn by code
            music: 'station_theme',
            hotspots: [
                {
                    id: 'desk',
                    x: 100,
                    y: 200,
                    width: 80,
                    height: 60,
                    interactions: {
                        look: "Your desk. Several cases need attention.",
                        use: "Time to get to work on these cases.",
                        take: "You can't take the desk with you."
                    }
                },
                {
                    id: 'evidenceLocker',
                    x: 300,
                    y: 150,
                    width: 50,
                    height: 100,
                    interactions: {
                        look: "The evidence locker. It's locked.",
                        use: "You need a key to open it.",
                        take: "You can't take the locker with you."
                    }
                }
            ]
        },
        downtown: {
            background: '', // Background is drawn by code
            music: 'downtown_theme',
            hotspots: [
                {
                    id: 'alley',
                    x: 200,
                    y: 300,
                    width: 100,
                    height: 150,
                    interactions: {
                        look: "A dark alley. It looks suspicious.",
                        use: "You find some clues in the alley.",
                        take: "You pick up a piece of evidence."
                    }
                },
                {
                    id: 'shop',
                    x: 400,
                    y: 200,
                    width: 80,
                    height: 100,
                    interactions: {
                        look: "A small shop. It seems to be closed.",
                        use: "The door is locked.",
                        take: "You can't take the shop with you."
                    }
                }
            ]
        },
        park: {
            background: '', // Background is drawn by code
            music: 'park_theme',
            hotspots: [
                {
                    id: 'bench',
                    x: 150,
                    y: 250,
                    width: 100,
                    height: 50,
                    interactions: {
                        look: "A park bench. Someone left a newspaper.",
                        use: "You sit on the bench and read the newspaper.",
                        take: "You take the newspaper with you."
                    }
                },
                {
                    id: 'fountain',
                    x: 350,
                    y: 150,
                    width: 120,
                    height: 100,
                    interactions: {
                        look: "A beautiful fountain. The water is clear.",
                        use: "You throw a coin into the fountain.",
                        take: "You can't take the fountain with you."
                    }
                }
            ]
        }
    },
    cases: {
        case1: {
            title: "The Downtown Burglar",
            description: "A series of break-ins has occurred downtown.",
            evidence: ["fingerprints", "witness_statement", "security_footage"],
            suspects: ["john_doe", "jane_smith"]
        }
    }
};

class Game {
    constructor(engine) {
        this.engine = engine;
        this.currentCase = null;
        this.evidence = new Set();
        this.gameState = {
            currentLocation: 'policeStation',
            solvedCases: 0,
            reputation: 0
        };
    }

    startCase(caseId) {
        this.currentCase = GAME_DATA.cases[caseId];
        soundManager.playMusic('case_start');
    }

    // Additional game logic methods
}
