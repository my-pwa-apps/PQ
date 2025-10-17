/**
 * Enhanced Story System for Police Quest
 * Authentic Police Quest 1 storyline and case management
 */
class PoliceStory {    constructor(gameEngine) {
        this.engine = gameEngine;
        this.currentCase = null;
        this.storyProgress = 0;
        
        // Additional properties for update system
        this.promotionOffered = false;
        this.sceneBasedTriggers = {};
        this.npcDialogs = {};
        
        // Authentic Police Quest 1 storyline structure
        this.mainStoryline = {
            act1: {
                title: "Beat Cop",
                description: "Start as a patrol officer in Lytton",
                cases: ['speeding_ticket', 'drunk_driver', 'routine_patrol'],
                required_score: 200,
                completed: false
            },
            act2: {
                title: "The Death Angel Investigation", 
                description: "Investigate the mysterious Death Angel case",
                cases: ['death_angel_intro', 'evidence_gathering', 'witness_interviews'],
                required_score: 500,
                completed: false
            },
            act3: {
                title: "Narcotics Division",
                description: "Undercover work in narcotics",
                cases: ['drug_bust_prep', 'undercover_operation', 'final_bust'],
                required_score: 800,
                completed: false
            },
            act4: {
                title: "Climax and Resolution",
                description: "Final confrontation and case resolution",
                cases: ['final_showdown', 'case_closure'],
                required_score: 1000,
                completed: false
            }
        };
        
        // Detailed case definitions
        this.cases = {
            speeding_ticket: {
                id: "speeding_ticket",
                title: "Traffic Violation",
                type: "traffic",
                description: "Issue a speeding ticket following proper procedure",
                location: "Highway 1",
                objectives: [
                    { id: "patrol", text: "Begin patrol shift", completed: false, points: 10 },
                    { id: "spot_speeder", text: "Identify speeding vehicle", completed: false, points: 15 },
                    { id: "traffic_stop", text: "Conduct proper traffic stop", completed: false, points: 25 },
                    { id: "issue_citation", text: "Issue citation", completed: false, points: 20 }
                ],
                evidence: [],
                witnesses: [],
                suspects: ["speeding_driver"],
                time_limit: null,
                difficulty: "easy",
                required_procedures: ["trafficStop"]
            },
            
            drunk_driver: {
                id: "drunk_driver",
                title: "DUI Investigation", 
                type: "traffic",
                description: "Handle a drunk driving incident",
                location: "Downtown Lytton",
                objectives: [
                    { id: "respond_call", text: "Respond to dispatch call", completed: false, points: 10 },
                    { id: "assess_situation", text: "Assess driver condition", completed: false, points: 15 },
                    { id: "field_sobriety", text: "Conduct field sobriety test", completed: false, points: 30 },
                    { id: "arrest_process", text: "Make DUI arrest if warranted", completed: false, points: 35 }
                ],
                evidence: ["breathalyzer_results", "field_test_video"],
                witnesses: ["bartender", "passenger"],
                suspects: ["drunk_driver"],
                time_limit: 30, // minutes
                difficulty: "medium",
                required_procedures: ["trafficStop", "arrest"]
            },
            
            death_angel_intro: {
                id: "death_angel_intro",
                title: "Death Angel - First Clues",
                type: "investigation", 
                description: "Investigate the first Death Angel murder",
                location: "Crime Scene - Oak Street",
                objectives: [
                    { id: "secure_scene", text: "Secure the crime scene", completed: false, points: 20 },
                    { id: "examine_body", text: "Examine the victim", completed: false, points: 25 },
                    { id: "collect_evidence", text: "Collect physical evidence", completed: false, points: 30 },
                    { id: "interview_witnesses", text: "Interview witnesses", completed: false, points: 25 },
                    { id: "file_report", text: "File initial report", completed: false, points: 20 }
                ],
                evidence: ["murder_weapon", "victim_wallet", "footprint_cast", "fiber_sample"],
                witnesses: ["shop_owner", "passerby", "neighbor"],
                suspects: ["unknown_assailant"],
                time_limit: 60,
                difficulty: "hard",
                required_procedures: ["investigation"]
            },
            
            drug_bust_prep: {
                id: "drug_bust_prep",
                title: "Narcotics Operation Setup",
                type: "undercover",
                description: "Prepare for undercover drug operation",
                location: "Police Station - Briefing Room", 
                objectives: [
                    { id: "briefing", text: "Attend operation briefing", completed: false, points: 15 },
                    { id: "equipment_check", text: "Check undercover equipment", completed: false, points: 20 },
                    { id: "cover_story", text: "Review cover story", completed: false, points: 15 },
                    { id: "backup_plan", text: "Establish backup procedures", completed: false, points: 25 }
                ],
                evidence: ["operation_plan", "surveillance_photos", "suspect_dossier"],
                witnesses: ["informant", "detective_partners"],
                suspects: ["drug_dealer", "supplier"],
                time_limit: 45,
                difficulty: "hard",
                required_procedures: ["investigation"]
            }
        };
        
        // Character development system
        this.character = {
            name: "Sonny Bonds",
            rank: "Officer",
            badge_number: "2847",
            experience: 0,
            skills: {
                driving: 75,
                firearms: 80,
                investigation: 60,
                communication: 70,
                procedure_knowledge: 85
            },
            achievements: [],
            case_history: []
        };
        
        // Dialog trees for major story characters
        this.characterDialogs = {
            sergeant_dooley: {
                initial: "Alright Bonds, ready for another day of keeping Lytton safe?",
                responses: [
                    { text: "Yes sir, ready for duty!", next: "assignment" },
                    { text: "What's the situation today?", next: "briefing" },
                    { text: "Any special instructions?", next: "instructions" }
                ],
                states: {
                    assignment: "Good. I've got a routine patrol assignment for you. Remember to follow procedures.",
                    briefing: "We've had reports of increased drug activity downtown. Keep your eyes open.",
                    instructions: "By the book, Bonds. No heroics. Safety first, always."
                }
            },
            
            captain_tate: {
                initial: "Officer Bonds, how's the investigation progressing?",
                responses: [
                    { text: "Making good progress, sir.", next: "progress_update" },
                    { text: "Need more time to gather evidence.", next: "request_time" },
                    { text: "Ready to make an arrest.", next: "arrest_approval" }
                ],
                states: {
                    progress_update: "Good work. Keep me informed of any developments.",
                    request_time: "Time is of the essence, but do it right. Don't rush.",
                    arrest_approval: "Make sure you have solid evidence before proceeding."
                }
            }
        };
        
        // Story triggers and events
        this.storyTriggers = new Map();
        this.activeEvents = [];
        
        this.initializeStory();
    }
    
    // Initialize the story system
    initializeStory() {
        // Set up first case
        this.startCase('speeding_ticket');
        
        // Initialize story triggers
        this.setupStoryTriggers();
        
        // Show intro message
        this.showStoryMessage(
            "Welcome to Police Quest, Officer Bonds. " +
            "You're starting your shift as a patrol officer in Lytton. " +
            "Follow proper police procedures and serve with honor."
        );
    }
    
    // Start a new case
    startCase(caseId) {
        const caseData = this.cases[caseId];
        if (!caseData) {
            console.error(`Case not found: ${caseId}`);
            return false;
        }
        
        this.currentCase = { ...caseData };
        this.currentCase.start_time = new Date();
        this.currentCase.status = "active";
        
        // Add to character history
        this.character.case_history.push({
            case_id: caseId,
            start_time: this.currentCase.start_time,
            status: "started"
        });
        
        this.showCaseIntro(this.currentCase);
        this.updateCaseUI();
        
        // Start required procedures
        if (this.currentCase.required_procedures) {
            this.currentCase.required_procedures.forEach(procedure => {
                if (this.engine.policeGameplay) {
                    this.engine.policeGameplay.startProcedure(procedure);
                }
            });
        }
        
        return true;
    }
    
    // Complete case objective
    completeObjective(objectiveId) {
        if (!this.currentCase) return false;
        
        const objective = this.currentCase.objectives.find(obj => obj.id === objectiveId);
        if (!objective || objective.completed) {
            return false;
        }
        
        objective.completed = true;
        
        // Award points
        if (this.engine.policeGameplay) {
            this.engine.policeGameplay.addScore(objective.points);
        }
        
        this.showStoryMessage(`✓ ${objective.text} (+${objective.points} points)`);
        
        // Check if case is complete
        if (this.currentCase.objectives.every(obj => obj.completed)) {
            this.completeCase();
        }
        
        this.updateCaseUI();
        return true;
    }
    
    // Complete current case
    completeCase() {
        if (!this.currentCase) return;
        
        this.currentCase.status = "completed";
        this.currentCase.end_time = new Date();
        
        // Calculate case score
        const totalPoints = this.currentCase.objectives.reduce((sum, obj) => sum + obj.points, 0);
        const bonusPoints = Math.floor(totalPoints * 0.2); // 20% bonus
        
        if (this.engine.policeGameplay) {
            this.engine.policeGameplay.addScore(bonusPoints);
        }
        
        // Add achievement
        this.character.achievements.push({
            name: `Case Closed: ${this.currentCase.title}`,
            description: `Successfully completed ${this.currentCase.title}`,
            date: new Date()
        });
        
        // Update character history
        const historyEntry = this.character.case_history.find(h => h.case_id === this.currentCase.id);
        if (historyEntry) {
            historyEntry.status = "completed";
            historyEntry.end_time = this.currentCase.end_time;
            historyEntry.score = totalPoints + bonusPoints;
        }
        
        this.showCaseCompletion();
        this.checkStoryProgression();
        
        // Auto-advance to next case or act
        setTimeout(() => this.advanceStory(), 3000);
    }
    
    // Check and advance story progression
    checkStoryProgression() {
        const currentScore = this.engine.policeGameplay ? this.engine.policeGameplay.score : 0;
        
        // Check if ready for next act
        for (const [actId, act] of Object.entries(this.mainStoryline)) {
            if (!act.completed && currentScore >= act.required_score) {
                this.startAct(actId);
                break;
            }
        }
    }
    
    // Start new story act
    startAct(actId) {
        const act = this.mainStoryline[actId];
        if (!act || act.completed) return;
        
        act.completed = true;
        this.storyProgress++;
        
        this.showActIntro(act);
        
        // Start first case of the act
        if (act.cases && act.cases.length > 0) {
            setTimeout(() => this.startCase(act.cases[0]), 2000);
        }
    }
    
    // Advance to next story element
    advanceStory() {
        if (!this.currentCase) return;
        
        // Find current act and next case
        let nextCaseId = null;
        
        for (const act of Object.values(this.mainStoryline)) {
            const currentIndex = act.cases.indexOf(this.currentCase.id);
            if (currentIndex !== -1 && currentIndex < act.cases.length - 1) {
                nextCaseId = act.cases[currentIndex + 1];
                break;
            }
        }
        
        if (nextCaseId) {
            this.startCase(nextCaseId);
        } else {
            this.showStoryMessage("Awaiting next assignment...");
        }
    }
    
    // Setup story triggers
    setupStoryTriggers() {
        // Location-based triggers
        this.storyTriggers.set('enter_evidence_room', () => {
            if (this.currentCase && this.currentCase.id === 'death_angel_intro') {
                this.completeObjective('collect_evidence');
            }
        });
        
        // Action-based triggers
        this.storyTriggers.set('talk_to_witness', (witnessId) => {
            if (this.currentCase && this.currentCase.witnesses.includes(witnessId)) {
                this.completeObjective('interview_witnesses');
            }
        });
        
        // Time-based triggers
        this.storyTriggers.set('shift_start', () => {
            this.completeObjective('patrol');
        });
    }
    
    // Trigger story event
    triggerEvent(eventId, context = {}) {
        const trigger = this.storyTriggers.get(eventId);
        if (trigger) {
            trigger(context);
        }
    }
    
    // Show case introduction
    showCaseIntro(caseData) {
        const introHTML = `
            <div id="case-intro" class="story-overlay">
                <div class="case-intro-content">
                    <h2>${caseData.title}</h2>
                    <p class="case-type">${caseData.type.toUpperCase()}</p>
                    <p class="case-description">${caseData.description}</p>
                    <p class="case-location"><strong>Location:</strong> ${caseData.location}</p>
                    ${caseData.time_limit ? `<p class="time-limit"><strong>Time Limit:</strong> ${caseData.time_limit} minutes</p>` : ''}
                    <div class="case-objectives">
                        <h3>Objectives:</h3>
                        <ul>
                            ${caseData.objectives.map(obj => `<li>${obj.text}</li>`).join('')}
                        </ul>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()">Begin Case</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', introHTML);
    }
    
    // Show act introduction
    showActIntro(act) {
        const actHTML = `
            <div id="act-intro" class="story-overlay">
                <div class="act-intro-content">
                    <h1>${act.title}</h1>
                    <p class="act-description">${act.description}</p>
                    <button onclick="this.parentElement.parentElement.remove()">Continue</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', actHTML);
    }
    
    // Show case completion
    showCaseCompletion() {
        const completionHTML = `
            <div id="case-complete" class="story-overlay">
                <div class="case-complete-content">
                    <h2>Case Completed!</h2>
                    <h3>${this.currentCase.title}</h3>
                    <p>Excellent work, Officer Bonds!</p>
                    <div class="completion-stats">
                        <p><strong>Objectives Completed:</strong> ${this.currentCase.objectives.length}</p>
                        <p><strong>Total Points:</strong> ${this.currentCase.objectives.reduce((sum, obj) => sum + obj.points, 0)}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()">Continue</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', completionHTML);
    }
    
    // Show story message
    showStoryMessage(message, duration = 5000) {
        if (this.engine.showMessage) {
            this.engine.showMessage(message);
        } else {
            console.log(`Story: ${message}`);
        }
    }
    
    // Update case UI
    updateCaseUI() {
        const casePanel = document.getElementById('case-panel');
        if (!casePanel || !this.currentCase) return;
        
        const completedObjectives = this.currentCase.objectives.filter(obj => obj.completed).length;
        const totalObjectives = this.currentCase.objectives.length;
        
        casePanel.innerHTML = `
            <h3>${this.currentCase.title}</h3>
            <p class="case-status">Progress: ${completedObjectives}/${totalObjectives}</p>
            <div class="objectives-list">
                ${this.currentCase.objectives.map(obj => `
                    <div class="objective ${obj.completed ? 'completed' : 'pending'}">
                        ${obj.completed ? '✓' : '○'} ${obj.text}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Get character progression
    getCharacterProgression() {
        return {
            character: this.character,
            currentCase: this.currentCase,
            storyProgress: this.storyProgress,
            actsCompleted: Object.values(this.mainStoryline).filter(act => act.completed).length
        };
    }
    
    // Handle dialog with story characters
    handleCharacterDialog(characterId, playerResponse = null) {
        const dialog = this.characterDialogs[characterId];
        if (!dialog) return null;
        
        if (!playerResponse) {
            // Show initial dialog
            return {
                text: dialog.initial,
                responses: dialog.responses
            };
        } else {
            // Process player response
            const response = dialog.responses.find(r => r.text === playerResponse);
            if (response && dialog.states[response.next]) {
                return {
                    text: dialog.states[response.next],
                    responses: []
                };
            }
        }
        
        return null;
    }
    
    // Save story progress
    saveProgress() {
        const saveData = {
            currentCase: this.currentCase,
            storyProgress: this.storyProgress,
            character: this.character,
            mainStoryline: this.mainStoryline,
            timestamp: new Date()
        };
        
        localStorage.setItem('pq_story_save', JSON.stringify(saveData));
    }
    
    // Load story progress
    loadProgress() {
        const saveData = localStorage.getItem('pq_story_save');
        if (!saveData) return false;
        
        try {
            const data = JSON.parse(saveData);
            this.currentCase = data.currentCase;
            this.storyProgress = data.storyProgress;
            this.character = data.character;
            this.mainStoryline = data.mainStoryline;
            
            this.updateCaseUI();
            return true;
        } catch (error) {
            console.error('Failed to load story progress:', error);
            return false;
        }
    }
    
    // Update method for game loop integration
    update(deltaTime) {
        // Update active case timers
        if (this.currentCase) {
            this.currentCase.timeElapsed = (this.currentCase.timeElapsed || 0) + deltaTime;
            
            // Check for case-specific time events
            this.checkCaseTimeEvents();
            
            // Update case difficulty based on time
            if (this.currentCase.timeElapsed > 1800000) { // 30 minutes
                console.log('Case is taking a long time - consider reviewing objectives');
            }
        }
        
        // Update dialog cooldowns
        for (const npcName in this.npcDialogs) {
            if (this.npcDialogs[npcName].lastInteraction) {
                const timeSinceLastInteraction = Date.now() - this.npcDialogs[npcName].lastInteraction;
                
                // Reset dialog availability after cooldown period
                if (timeSinceLastInteraction > 30000) { // 30 seconds
                    if (this.npcDialogs[npcName].cooldown) {
                        this.npcDialogs[npcName].cooldown = false;
                    }
                }
            }
        }
        
        // Update story triggers based on game state
        this.checkStoryTriggers();
        
        // Auto-save story progress periodically
        if (this.storyProgress > 0 && deltaTime % 60000 < 16) { // Roughly every minute
            this.saveStoryProgress();
        }
    }
    
    checkCaseTimeEvents() {
        if (!this.currentCase) return;
        
        const timeElapsed = this.currentCase.timeElapsed || 0;
        
        // Trigger time-based events
        if (timeElapsed > 600000 && !this.currentCase.timeEventTriggered) { // 10 minutes
            this.currentCase.timeEventTriggered = true;
            
            switch (this.currentCase.id) {
                case 'electronics_theft':
                    console.log('Time pressure: The suspect might be moving the stolen goods!');
                    break;
                case 'death_angel':
                    console.log('Time is critical: The Death Angel might strike again!');
                    break;
            }
        }
    }
    
    checkStoryTriggers() {
        // Check for automatic story progression triggers
        if (this.engine.policeGameplay) {
            const score = this.engine.policeGameplay.score;
            const rank = this.engine.policeGameplay.rank;
            
            // Trigger promotions or story events based on performance
            if (score >= 1000 && rank === 'Patrol Officer' && !this.promotionOffered) {
                this.promotionOffered = true;
                this.triggerPromotion();
            }
        }
        
        // Check scene-based triggers
        const currentScene = this.engine.currentScene;
        if (this.sceneBasedTriggers[currentScene]) {
            for (const trigger of this.sceneBasedTriggers[currentScene]) {
                if (this.checkTriggerConditions(trigger)) {
                    this.executeTrigger(trigger);
                }
            }
        }
    }
    
    triggerPromotion() {
        console.log('Congratulations! You are being considered for promotion to Detective.');
        
        // Start promotion storyline
        this.startCase('promotion_opportunity');
    }
    
    saveStoryProgress() {
        const progressData = {
            currentCase: this.currentCase,
            storyProgress: this.storyProgress,
            mainStoryline: this.mainStoryline,
            timestamp: Date.now()
        };
        
        localStorage.setItem('policeQuestStoryProgress', JSON.stringify(progressData));
    }
    
    loadStoryProgress() {
        const savedData = localStorage.getItem('policeQuestStoryProgress');
        if (savedData) {
            try {
                const progressData = JSON.parse(savedData);
                this.currentCase = progressData.currentCase;
                this.storyProgress = progressData.storyProgress;
                this.mainStoryline = progressData.mainStoryline;
                
                console.log('Story progress loaded successfully');
                return true;
            } catch (error) {
                console.error('Failed to load story progress:', error);
            }
        }
        return false;
    }
}

// Export for use
window.PoliceStory = PoliceStory;
