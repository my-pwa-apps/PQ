# Police Quest - Enhanced Edition

A faithful recreation and enhancement of the classic Sierra Police Quest adventure game, built with modern web technologies while maintaining authentic Sierra AGI/SCI aesthetics.

## 🎮 Game Overview

**The Silicon Circuit Investigation**

Play as Officer Sonny Bonds in this enhanced Police Quest adventure featuring a brand new storyline. Investigate a sophisticated electronics theft ring operating in Lytton, following proper police procedures, gathering evidence, and uncovering a conspiracy that reaches higher than you ever imagined.

### Features

- ✅ **Authentic Sierra Graphics**: VGA color palette, pixelated rendering, classic Sierra character sprites
- ✅ **Proper Police Procedures**: Traffic stops, evidence collection, arrests, investigations
- ✅ **Multiple Detailed Scenes**: Police station, downtown, crime scenes, and more
- ✅ **Rich NPC Interactions**: Talk to witnesses, suspects, and fellow officers
- ✅ **Sierra-Style Humor**: Classic adventure game wit and charm
- ✅ **Death Scenes**: Authentic "game over" scenarios with restart options
- ✅ **Case System**: Multiple cases with objectives, evidence, and witness statements
- ✅ **Score System**: Earn points for proper procedure and detective work
- ✅ **Save/Load System**: Multiple save slots for your progress

## 🎯 Story Acts

### Act I: Beat Cop Blues
Your first day as Officer Bonds. Learn the ropes through routine patrol and your first major case.

**Cases:**
- Morning Briefing (Tutorial)
- Routine Patrol
- The TechWorld Break-In

### Act II: The Pattern Emerges
Multiple electronics stores hit. Evidence points to an inside job.

**Cases:**
- Evidence Analysis
- Witness Interviews
- Inside Lead

### Act III: Going Underground
Follow the stolen goods trail. Infiltrate the fencing operation.

**Cases:**
- Undercover Preparation
- Fence Meeting
- Warehouse Stakeout

### Act IV: The Silicon Conspiracy
Uncover the full extent of the conspiracy and bring the criminals to justice.

**Cases:**
- Corruption Evidence
- Internal Investigation
- Final Confrontation

## 🕹️ Controls

### Mouse
- **Left Click**: Interact with objects and move player
- **Hover**: See cursor change for interactive elements

### Keyboard
- **Arrow Keys / WASD**: Move player character
- **I**: Toggle inventory
- **P**: Toggle procedure panel
- **R**: Use radio
- **B**: Show badge
- **H**: Use handcuffs
- **ESC**: Cancel current action
- **Alt+D**: Toggle debug mode
- **Alt+H**: Show hotspots

### Command Buttons
- **LOOK**: Examine objects and scenes
- **TALK**: Speak with NPCs
- **USE**: Interact with objects and use items
- **TAKE**: Pick up items and evidence
- **MOVE**: Walk to locations

## 📁 Project Structure

```
PQ/
├── index.html                  # Main game HTML
├── css/
│   ├── style_sierra.css       # Enhanced Sierra-style CSS (NEW)
│   ├── style.css               # Original styles
│   └── style_*.css             # Other style variants
├── js/
│   ├── game.js                 # Main game logic
│   ├── engine.js               # Game engine
│   ├── SierraGraphics.js      # Sierra-style rendering system
│   ├── PoliceGameplay.js      # Police procedure mechanics
│   ├── PoliceStory.js         # Story and case management
│   ├── ParticleSystem.js      # Particle effects
│   ├── SpatialPartitioning.js # Collision optimization
│   ├── soundManager.js        # Audio system
│   ├── debug.js               # Debug tools
│   ├── data/
│   │   ├── GameData.js        # Original game data
│   │   ├── EnhancedStory.js   # New storyline data (NEW)
│   │   └── EnhancedScenes.js  # Enhanced scene definitions (NEW)
│   ├── ui/
│   │   └── DialogManager.js   # Dialog system
│   ├── managers/
│   │   ├── CollisionManager.js
│   │   └── DialogManager.js
│   └── scenes/
│       └── SceneManager.js     # Scene transitions
├── GameObjects/
│   ├── Jenny.ts               # Character implementations
│   └── PoliceBadge.ts
└── UI/
    ├── CaseInfoUI.ts
    └── TextBalloon.ts
```

## 🎨 Sierra-Style Aesthetics

### Color Palette
The game uses an authentic 16-color VGA palette based on Sierra AGI/SCI engines:
- Black, Dark Blue, Dark Green, Dark Cyan
- Dark Red, Dark Magenta, Brown, Light Gray
- Dark Gray, Blue, Green, Cyan
- Red, Magenta, Yellow, White

### UI Elements
- **Command Bar**: Sierra-style button interface
- **Dialog Boxes**: Classic bordered message windows
- **Inventory**: Grid-based item display
- **Status Line**: Score, time, and location tracking
- **Procedure Panel**: Track police procedure compliance

### Graphics Features
- Pixelated rendering (image-rendering: pixelated)
- Dithering patterns for backgrounds
- Classic Sierra character sprites (multi-directional)
- Authentic scene backgrounds
- Screen transitions (wipe, iris effects)

## 🚓 Police Procedure System

The game features authentic police procedures that must be followed:

### Traffic Stop Protocol
1. Signal vehicle to pull over
2. Position patrol car safely
3. Radio in license plate and location
4. Approach from driver side rear
5. Request license and registration
6. Verify documents
7. Issue citation or warning

### Arrest Protocol
1. Establish probable cause
2. Read Miranda rights
3. Apply handcuffs properly
4. Search suspect for weapons
5. Transport to station safely

### Crime Scene Investigation
1. Secure the scene
2. Photograph evidence
3. Collect and bag evidence properly
4. Interview witnesses
5. File complete report

### Pursuit Protocol
1. Radio pursuit to dispatch
2. Maintain safe distance
3. Coordinate with other units
4. Safely terminate pursuit

## 🎯 Scoring System

- **Maximum Score**: 1,000 points
- **Ranks**: Rookie → Officer → Detective → Lieutenant → Captain

### Points Awarded For:
- Following proper procedures: 5-25 points
- Completing objectives: 10-50 points
- Collecting evidence: 15-30 points
- Solving puzzles: 20-50 points
- Case completion bonuses: 50-150 points
- Act completion bonuses: 100-200 points

### Points Deducted For:
- Procedure violations: -5 to -25 points
- Safety violations: -10 to -30 points
- Evidence tampering: -20 to -50 points
- Improper conduct: -5 to -15 points

## 💀 Sierra-Style Deaths

Classic adventure game "game over" scenarios with humor:

- **Procedural Failures**: Skip vehicle inspection, forget Miranda rights
- **Safety Violations**: Dangerous pursuits, improper firearm handling
- **Evidence Tampering**: Contaminate evidence, break chain of custody
- **Time Failures**: Miss important deadlines
- **Poor Decisions**: Trust the wrong people, ignore warnings

Each death includes:
- Humorous message explaining what went wrong
- "Restore" option to try again
- Lesson about what to do differently

## 🎵 Audio System

### Music Themes
- Station Theme: Police station atmosphere
- Downtown Theme: Urban city sounds
- Investigation Theme: Mysterious detective work
- Suspense Theme: Tense situations
- Danger Theme: Action sequences
- Park Theme: Peaceful outdoor areas

### Sound Effects
- Police radio chatter
- Footsteps
- Door sounds
- Evidence collection
- Vehicle sounds
- Ambient city noise

## 🔧 Technical Details

### Technologies Used
- **HTML5 Canvas**: For rendering
- **Vanilla JavaScript**: Core game logic
- **CSS3**: Sierra-style UI
- **TypeScript**: Character classes (GameObjects)
- **LocalStorage**: Save game functionality

### Performance Optimizations
- Spatial partitioning for collision detection
- Object pooling for particles
- Offscreen canvas rendering
- Efficient frame management (60 FPS target)
- Lazy loading of assets

### Browser Requirements
- Modern browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: Chrome, Firefox, Edge (latest versions)

## 🎮 How to Play

1. **Open `index.html`** in a web browser
2. **Attend morning briefing** - Listen to Sergeant Dooley
3. **Start your patrol** - Follow proper procedures
4. **Investigate the break-in** - Collect evidence, interview witnesses
5. **Follow the case** - Solve puzzles, make arrests
6. **Advance through the story** - Complete all four acts

### Tips for Success
- ✅ Always follow proper police procedure
- ✅ Examine everything thoroughly
- ✅ Talk to all NPCs
- ✅ Collect all evidence
- ✅ Read case files and notices
- ✅ Save your game frequently
- ✅ Pay attention to Sierra-style humor clues

## 📝 Development Notes

### Recent Enhancements
- ✨ New comprehensive storyline: "The Silicon Circuit"
- ✨ Enhanced Sierra-style CSS with authentic VGA palette
- ✨ Multiple detailed scenes with rich interactions
- ✨ Improved NPC system with dialog trees
- ✨ Police procedure tracking system
- ✨ Case management with objectives and evidence
- ✨ Sierra-style death screens with humor
- ✨ Enhanced graphics rendering
- ✨ Performance optimizations

### Known Issues
- Some TypeScript files (Jenny.ts, PoliceBadge.ts) need JavaScript conversion
- Sound system needs audio file assets
- Some scenes need complete implementation
- Save/load system needs testing

### Future Enhancements
- [ ] Add more cases and story branches
- [ ] Implement full audio system with sound effects
- [ ] Add more NPC characters and interactions
- [ ] Create additional scenes (hospital, court, etc.)
- [ ] Add mini-games (shooting range, pursuit driving)
- [ ] Implement achievement system
- [ ] Add difficulty levels
- [ ] Create cutscenes for major story beats

## 🤝 Contributing

This is a passion project recreating the classic Police Quest experience. Contributions welcome!

### Areas for Contribution
- Additional cases and storylines
- More Sierra-style humor and easter eggs
- Sound effects and music
- Additional scenes and locations
- Character sprites and animations
- Bug fixes and optimizations
- Documentation improvements

## 📜 Credits

**Inspired by:**
- Police Quest series by Jim Walls and Sierra On-Line
- Classic Sierra adventure games (1980s-1990s)

**Enhanced Edition by:**
- Game Design & Programming: Bart M.
- Story Writing: Enhanced storyline based on classic Police Quest themes
- Graphics: Sierra-style rendering system
- Audio: System framework (assets needed)

## 📄 License

This is a fan project inspired by the classic Police Quest series. All rights to the original Police Quest games belong to Sierra Entertainment / Activision.

This enhanced edition is created for educational and entertainment purposes.

## 🎯 Version History

### v2.0 (Enhanced Edition) - October 2025
- New comprehensive storyline: "The Silicon Circuit"
- Enhanced Sierra-style graphics and UI
- Multiple detailed scenes with rich interactions
- Improved police procedure system
- Case management with evidence and witnesses
- Sierra-style humor and death screens
- Performance optimizations

### v1.0 (Original) - [Previous Date]
- Basic game engine
- Initial scenes and NPCs
- Simple case system
- Basic police procedures

---

**Made with ❤️ for fans of classic Sierra adventure games**

*Remember: In Lytton, crime doesn't pay... but solving it earns you points!* 🚓
