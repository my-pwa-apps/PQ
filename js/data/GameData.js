// Define the game data in the global scope
window.GAME_DATA = {
    scenes: {
        policeStation: {
            background: '',
            music: 'station_theme',
            hotspots: [
                // ...existing hotspots...
            ]
        },
        downtown: {
            background: '',
            music: 'downtown_theme',
            hotspots: [
                // ...existing hotspots...
            ]
        },
        // ...other scenes...
    },
    cases: {
        case1: {
            title: "The Downtown Burglar",
            description: "A series of break-ins has occurred in downtown electronic stores. The perpetrator seems to be targeting high-end equipment and leaving almost no evidence behind.",
            stages: [
                // ...existing stages...
            ],
            evidence: [],
            suspects: [
                // ...existing suspects...
            ]
        },
        case2: {
            title: "Missing Evidence",
            description: "Crucial evidence from several cases has gone missing from the evidence locker. Internal investigation required.",
            stages: [
                // ...existing stages...
            ],
            evidence: [],
            suspects: []
        }
    }
};

console.log("Game data loaded successfully");
