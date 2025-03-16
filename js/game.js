const GAME_DATA = {
    scenes: {
        policeStation: {
            background: 'assets/scenes/station.png',
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
