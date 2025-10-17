/**
 * Police Quest Gameplay Enhancement System
 * Authentic Police Quest 1 gameplay mechanics and procedures
 */
class PoliceGameplay {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.score = 0;
        this.maxScore = 1000;
        
        // Police procedures system - authentic to Police Quest 1
        this.procedures = {
            trafficStop: {
                name: "Traffic Stop Protocol",
                steps: [
                    { id: "signal", description: "Signal the vehicle to pull over", completed: false, points: 5 },
                    { id: "position", description: "Position patrol car safely behind suspect vehicle", completed: false, points: 5 },
                    { id: "radio", description: "Radio in the license plate and location", completed: false, points: 10 },
                    { id: "approach", description: "Approach vehicle from driver side rear", completed: false, points: 10 },
                    { id: "identify", description: "Ask for license and registration", completed: false, points: 10 },
                    { id: "verify", description: "Verify documents and check for warrants", completed: false, points: 15 },
                    { id: "issue", description: "Issue citation or warning", completed: false, points: 10 }
                ],
                active: false,
                completed: false
            },
            arrest: {
                name: "Arrest Protocol",
                steps: [
                    { id: "probable_cause", description: "Establish probable cause", completed: false, points: 20 },
                    { id: "miranda", description: "Read Miranda rights", completed: false, points: 25 },
                    { id: "handcuff", description: "Apply handcuffs properly", completed: false, points: 15 },
                    { id: "search", description: "Search suspect for weapons", completed: false, points: 15 },
                    { id: "transport", description: "Transport to station safely", completed: false, points: 10 }
                ],
                active: false,
                completed: false
            },
            investigation: {
                name: "Crime Scene Investigation",
                steps: [
                    { id: "secure", description: "Secure the crime scene", completed: false, points: 15 },
                    { id: "photograph", description: "Photograph the scene", completed: false, points: 10 },
                    { id: "evidence", description: "Collect and bag evidence", completed: false, points: 20 },
                    { id: "interview", description: "Interview witnesses", completed: false, points: 15 },
                    { id: "report", description: "File complete report", completed: false, points: 25 }
                ],
                active: false,
                completed: false
            },
            pursuit: {
                name: "Vehicle Pursuit Protocol",
                steps: [
                    { id: "radio_pursuit", description: "Radio pursuit to dispatch", completed: false, points: 15 },
                    { id: "maintain_distance", description: "Maintain safe following distance", completed: false, points: 10 },
                    { id: "coordinate", description: "Coordinate with other units", completed: false, points: 15 },
                    { id: "terminate", description: "Safely terminate pursuit", completed: false, points: 20 }
                ],
                active: false,
                completed: false
            }
        };
        
        // Case management system
        this.cases = {
            current: null,
            completed: [],
            evidence: new Map(),
            suspects: new Map(),
            witnesses: new Map()
        };
        
        // Equipment system (authentic Police Quest items)
        this.equipment = {
            weapon: { type: "service_revolver", condition: "good", ammo: 6 },
            radio: { type: "police_radio", battery: 100, frequency: "dispatch" },
            handcuffs: { type: "standard", count: 1 },
            badge: { number: "2847", department: "Lytton PD" },
            notebook: { pages: [], current_page: 0 },
            citation_book: { citations: [], remaining: 20 },
            flashlight: { battery: 85, working: true },
            keys: { patrol_car: true, station: true, locker: false }
        };
          // Shift system
        this.shift = {
            start_time: "08:00",
            end_time: "16:00",
            current_time: "08:00",
            calls_handled: 0,
            miles_driven: 0,
            reports_filed: 0,
            status: "on-duty",
            timeRemaining: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
        };
          // Performance tracking
        this.performance = {
            safety_rating: 100,
            procedure_compliance: 100,
            efficiency: 100,
            citizen_relations: 100,
            overall_rating: "Satisfactory",
            timeOnDuty: 0,
            proceduresCompleted: 0,
            arrestsMade: 0
        };
        
        // Missing properties for update method
        this.currentProcedure = null;
        this.activeInvestigations = [];
        this.violations = [];
        
        // Initialize event handlers
        this.setupGameplayEvents();
    }
    
    // Start a police procedure
    startProcedure(procedureType) {
        if (!this.procedures[procedureType]) {
            console.error(`Unknown procedure type: ${procedureType}`);
            return false;
        }
        
        // Reset procedure
        this.procedures[procedureType].active = true;
        this.procedures[procedureType].completed = false;
        this.procedures[procedureType].steps.forEach(step => {
            step.completed = false;
        });
        
        this.showProcedureUI(procedureType);
        this.engine.showMessage(`Started: ${this.procedures[procedureType].name}`);
        
        return true;
    }
    
    // Complete a procedure step
    completeStep(procedureType, stepId) {
        const procedure = this.procedures[procedureType];
        if (!procedure || !procedure.active) {
            return false;
        }
        
        const step = procedure.steps.find(s => s.id === stepId);
        if (!step || step.completed) {
            return false;
        }
        
        step.completed = true;
        this.addScore(step.points);
        this.engine.showMessage(`✓ ${step.description} (+${step.points} points)`);
        
        // Check if all steps completed
        if (procedure.steps.every(s => s.completed)) {
            this.completeProcedure(procedureType);
        }
        
        this.updateProcedureUI(procedureType);
        return true;
    }
    
    // Complete entire procedure
    completeProcedure(procedureType) {
        const procedure = this.procedures[procedureType];
        if (!procedure) return;
        
        procedure.active = false;
        procedure.completed = true;
        
        const bonusPoints = 25;
        this.addScore(bonusPoints);
        
        this.engine.showMessage(`✓ Completed: ${procedure.name} (+${bonusPoints} bonus points)`);
        this.updatePerformanceRating("procedure_compliance", 5);
        
        this.hideProcedureUI();
    }
    
    // Validate player action against procedure
    validateAction(action, context = {}) {
        // Check if action violates any active procedures
        for (const [procedureType, procedure] of Object.entries(this.procedures)) {
            if (!procedure.active) continue;
            
            const result = this.checkProcedureViolation(action, procedure, context);
            if (result.violation) {
                this.handleProcedureViolation(procedureType, result.message);
                return false;
            }
        }
        
        return true;
    }
    
    // Check for procedure violations
    checkProcedureViolation(action, procedure, context) {
        // Traffic stop violations
        if (procedure.name === "Traffic Stop Protocol") {
            if (action === "approach_vehicle" && !procedure.steps.find(s => s.id === "radio").completed) {
                return { violation: true, message: "You must radio in the stop before approaching!" };
            }
            if (action === "draw_weapon" && !context.threat_present) {
                return { violation: true, message: "Drawing weapon without justification violates procedure!" };
            }
        }
        
        // Arrest violations
        if (procedure.name === "Arrest Protocol") {
            if (action === "handcuff" && !procedure.steps.find(s => s.id === "miranda").completed) {
                return { violation: true, message: "You must read Miranda rights before arrest!" };
            }
        }
        
        return { violation: false };
    }
    
    // Handle procedure violations
    handleProcedureViolation(procedureType, message) {
        this.engine.showMessage(`⚠️ PROCEDURE VIOLATION: ${message}`);
        this.updatePerformanceRating("procedure_compliance", -10);
        this.updatePerformanceRating("safety_rating", -5);
        
        // Play error sound if available
        if (this.engine.soundManager) {
            this.engine.soundManager.playSound('error');
        }
    }
    
    // Add evidence to case
    addEvidence(evidenceId, description, location) {
        const evidence = {
            id: evidenceId,
            description: description,
            location: location,
            collected_time: this.shift.current_time,
            collected_by: "Officer Bonds",
            chain_of_custody: [`Collected by Officer Bonds at ${this.shift.current_time}`]
        };
        
        this.cases.evidence.set(evidenceId, evidence);
        this.addScore(15);
        this.engine.showMessage(`Evidence collected: ${description} (+15 points)`);
        
        // Add to inventory
        if (this.engine.addToInventory) {
            this.engine.addToInventory(evidenceId);
        }
    }
    
    // Interview witness or suspect
    conductInterview(personId, responses) {
        const interview = {
            person_id: personId,
            time: this.shift.current_time,
            responses: responses,
            conducted_by: "Officer Bonds"
        };
        
        if (personId.includes('suspect')) {
            this.cases.suspects.set(personId, interview);
        } else {
            this.cases.witnesses.set(personId, interview);
        }
        
        this.addScore(10);
        this.engine.showMessage(`Interview completed with ${personId} (+10 points)`);
    }
    
    // File police report
    fileReport(reportType, details) {
        const report = {
            type: reportType,
            details: details,
            filed_time: this.shift.current_time,
            officer: "Officer Bonds",
            case_number: this.generateCaseNumber()
        };
        
        this.shift.reports_filed++;
        this.addScore(25);
        this.updatePerformanceRating("efficiency", 3);
        
        this.engine.showMessage(`Report filed: ${reportType} (+25 points)`);
        
        return report;
    }
    
    // Generate case number
    generateCaseNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const sequence = (this.shift.reports_filed + 1).toString().padStart(3, '0');
        
        return `${year}${month}${day}-${sequence}`;
    }
    
    // Update performance rating
    updatePerformanceRating(category, change) {
        if (!this.performance[category]) return;
        
        this.performance[category] = Math.max(0, Math.min(100, this.performance[category] + change));
        
        // Update overall rating
        const categories = ['safety_rating', 'procedure_compliance', 'efficiency', 'citizen_relations'];
        const average = categories.reduce((sum, cat) => sum + this.performance[cat], 0) / categories.length;
        
        if (average >= 90) this.performance.overall_rating = "Exemplary";
        else if (average >= 80) this.performance.overall_rating = "Satisfactory";
        else if (average >= 70) this.performance.overall_rating = "Needs Improvement";
        else this.performance.overall_rating = "Unsatisfactory";
    }
    
    // Add score with feedback
    addScore(points) {
        this.score = Math.min(this.maxScore, this.score + points);
        this.updateScoreDisplay();
    }
    
    // Setup gameplay event handlers
    setupGameplayEvents() {
        // Listen for specific game events
        document.addEventListener('playerAction', (event) => {
            this.handlePlayerAction(event.detail);
        });
        
        document.addEventListener('sceneChange', (event) => {
            this.handleSceneChange(event.detail);
        });
    }
    
    // Handle player actions
    handlePlayerAction(action) {
        // Validate action against procedures
        if (!this.validateAction(action.type, action.context)) {
            return;
        }
        
        // Process different action types
        switch (action.type) {
            case 'use_radio':
                this.useRadio(action.message);
                break;
            case 'write_citation':
                this.writeCitation(action.violation, action.suspect);
                break;
            case 'draw_weapon':
                this.drawWeapon(action.context);
                break;
            case 'search_suspect':
                this.searchSuspect(action.suspect);
                break;
        }
    }
    
    // Use police radio
    useRadio(message) {
        if (this.equipment.radio.battery <= 0) {
            this.engine.showMessage("Radio battery is dead!");
            return;
        }
        
        this.equipment.radio.battery = Math.max(0, this.equipment.radio.battery - 1);
        this.engine.showMessage(`📻 Radio: "${message}"`);
        
        // Check if this completes a procedure step
        for (const [type, procedure] of Object.entries(this.procedures)) {
            if (procedure.active) {
                const radioStep = procedure.steps.find(s => s.id === 'radio' || s.id === 'radio_pursuit');
                if (radioStep && !radioStep.completed) {
                    this.completeStep(type, radioStep.id);
                    break;
                }
            }
        }
    }
    
    // Write citation
    writeCitation(violation, suspect) {
        if (this.equipment.citation_book.remaining <= 0) {
            this.engine.showMessage("No citation forms remaining!");
            return;
        }
        
        const citation = {
            violation: violation,
            suspect: suspect,
            time: this.shift.current_time,
            officer: "Officer Bonds"
        };
        
        this.equipment.citation_book.citations.push(citation);
        this.equipment.citation_book.remaining--;
        
        this.addScore(15);
        this.engine.showMessage(`Citation issued for: ${violation} (+15 points)`);
    }
    
    // Draw weapon
    drawWeapon(context) {
        if (!context.threat_present && !context.justified) {
            this.updatePerformanceRating("safety_rating", -15);
            this.engine.showMessage("⚠️ Drawing weapon without justification!");
            return;
        }
        
        this.engine.showMessage("🔫 Service weapon drawn");
        this.updatePerformanceRating("safety_rating", 5);
    }
    
    // Search suspect
    searchSuspect(suspect) {
        // Must have completed handcuffing first
        const arrestProcedure = this.procedures.arrest;
        if (arrestProcedure.active) {
            const handcuffStep = arrestProcedure.steps.find(s => s.id === 'handcuff');
            if (!handcuffStep.completed) {
                this.engine.showMessage("You must handcuff the suspect first!");
                return;
            }
        }
        
        this.engine.showMessage(`Searching ${suspect} for weapons and evidence...`);
        this.addScore(10);
        
        // Simulate finding items
        const foundItems = this.simulateSearch();
        foundItems.forEach(item => {
            this.addEvidence(item.id, item.description, "On suspect");
        });
    }
    
    // Simulate search results
    simulateSearch() {
        const possibleItems = [
            { id: "wallet", description: "Suspect's wallet with ID" },
            { id: "keys", description: "Set of car keys" },
            { id: "drugs", description: "Small bag of suspicious substance" },
            { id: "weapon", description: "Concealed knife" }
        ];
        
        // Random chance of finding items
        return possibleItems.filter(() => Math.random() < 0.3);
    }
    
    // Show procedure UI
    showProcedureUI(procedureType) {
        const procedure = this.procedures[procedureType];
        if (!procedure) return;
        
        let html = `
            <div id="procedure-panel" class="ui-panel">
                <h3>${procedure.name}</h3>
                <div class="procedure-steps">
        `;
        
        procedure.steps.forEach(step => {
            const status = step.completed ? '✓' : '○';
            const className = step.completed ? 'completed' : 'pending';
            html += `<div class="step ${className}">${status} ${step.description}</div>`;
        });
        
        html += `
                </div>
            </div>
        `;
        
        // Remove existing panel
        const existing = document.getElementById('procedure-panel');
        if (existing) existing.remove();
        
        // Add new panel
        document.body.insertAdjacentHTML('beforeend', html);
    }
    
    // Update procedure UI
    updateProcedureUI(procedureType) {
        const panel = document.getElementById('procedure-panel');
        if (!panel) return;
        
        const procedure = this.procedures[procedureType];
        const steps = panel.querySelectorAll('.step');
        
        procedure.steps.forEach((step, index) => {
            if (steps[index]) {
                const status = step.completed ? '✓' : '○';
                const className = step.completed ? 'completed' : 'pending';
                steps[index].className = `step ${className}`;
                steps[index].textContent = `${status} ${step.description}`;
            }
        });
    }
    
    // Hide procedure UI
    hideProcedureUI() {
        const panel = document.getElementById('procedure-panel');
        if (panel) panel.remove();
    }
    
    // Update score display
    updateScoreDisplay() {
        const scoreElement = document.getElementById('score-display');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}/${this.maxScore}`;
        }
    }
    
    // Handle scene changes
    handleSceneChange(newScene) {
        // Update location-based procedures
        if (newScene === 'patrol_car') {
            // Enable traffic stop procedures
            this.enableTrafficStopMode();
        }
    }
    
    // Enable traffic stop mode
    enableTrafficStopMode() {
        this.engine.showMessage("Patrol mode active. Watch for traffic violations.");
    }
    
    // Get current performance summary
    getPerformanceSummary() {
        return {
            score: this.score,
            maxScore: this.maxScore,
            rating: this.performance.overall_rating,
            categories: this.performance,
            shift: this.shift,
            equipment: this.equipment
        };
    }
    
    // Update method for game loop integration
    update(deltaTime) {
        // Update procedure timers
        if (this.currentProcedure) {
            this.currentProcedure.timeElapsed += deltaTime;
            
            // Check for procedure timeout
            if (this.currentProcedure.timeLimit && 
                this.currentProcedure.timeElapsed > this.currentProcedure.timeLimit) {
                this.addViolation('PROCEDURE_TIMEOUT', 'Procedure took too long to complete');
                this.endProcedure(false);
            }
        }
        
        // Update active investigations
        for (const investigation of this.activeInvestigations) {
            investigation.timeElapsed += deltaTime;
            
            // Check for evidence expiration or case updates
            if (investigation.timeElapsed > 3600000) { // 1 hour in milliseconds
                console.log(`Investigation ${investigation.id} has been active for over an hour`);
            }
        }
        
        // Update performance tracking
        this.performance.timeOnDuty += deltaTime;
        
        // Update shift status
        if (this.shift.status === 'on-duty') {
            this.shift.timeRemaining -= deltaTime;
            
            if (this.shift.timeRemaining <= 0) {
                this.endShift();
            }
        }
        
        // Update equipment status (e.g., radio battery, etc.)
        this.updateEquipmentStatus(deltaTime);
    }
    
    updateEquipmentStatus(deltaTime) {
        // Simulate equipment wear and status updates
        if (this.equipment.radio.status === 'working') {
            // Radio might occasionally have static or issues
            if (Math.random() < 0.00001) { // Very rare
                this.equipment.radio.status = 'static';
                setTimeout(() => {
                    this.equipment.radio.status = 'working';
                }, 5000);
            }
        }
        
        // Update other equipment as needed
        for (const item in this.equipment) {
            if (this.equipment[item].durability !== undefined) {
                // Gradual wear over time
                this.equipment[item].durability -= deltaTime * 0.000001;
                
                if (this.equipment[item].durability <= 0) {
                    this.equipment[item].status = 'broken';
                }
            }
        }
    }
    
    endShift() {
        this.shift.status = 'off-duty';
        console.log('Shift ended');
        
        // Calculate shift performance
        const shiftScore = this.calculateShiftPerformance();
        this.addScore(shiftScore);
        
        // Reset for next shift
        this.currentProcedure = null;
        this.violations = [];
    }
    
    calculateShiftPerformance() {
        let score = 0;
        
        // Base score for completing shift
        score += 100;
        
        // Bonus for no violations
        if (this.violations.length === 0) {
            score += 200;
        } else {
            score -= this.violations.length * 50;
        }
        
        // Bonus for completed procedures
        score += this.performance.proceduresCompleted * 50;
        
        // Bonus for arrests made
        score += this.performance.arrestsMade * 100;
        
        return score;
    }
    
    // Add missing methods for procedure management
    addViolation(type, message) {
        this.violations.push({
            type: type,
            message: message,
            timestamp: Date.now()
        });
        console.warn(`Violation: ${type} - ${message}`);
    }
    
    endProcedure(success = true) {
        if (this.currentProcedure) {
            if (success) {
                this.performance.proceduresCompleted++;
                this.addScore(50);
            }
            this.currentProcedure = null;
        }
    }
    
    // Handle NPC interactions for police procedures
    handleNPCInteraction(npc, playerPosition) {
        const interaction = {
            handled: false,
            message: null
        };
        
        // Check if this is a procedure-related NPC
        if (npc.type === 'suspect' || npc.type === 'citizen' || npc.type === 'criminal') {
            // Start appropriate procedure based on context
            if (npc.type === 'suspect' && !this.procedures.arrest.active) {
                this.startProcedure('arrest');
                interaction.handled = true;
                interaction.message = "Arrest procedure initiated";
            } else if (npc.type === 'citizen' && npc.hasViolation) {
                this.startProcedure('trafficStop');
                interaction.handled = true;
                interaction.message = "Traffic stop procedure initiated";
            }
        }
        
        return interaction;
    }
    
    // Police equipment methods
    useRadio() {
        if (this.equipment.radio.battery > 0) {
            this.useRadio("Officer Bonds requesting backup");
        } else {
            this.engine.showMessage("Radio battery is dead!");
        }
    }
    
    showBadge() {
        this.engine.showMessage("*Shows Police Badge #2847*");
        // Play audio if available
        if (this.engine.playPoliceAudio) {
            this.engine.playPoliceAudio('badge_show');
        }
    }
    
    useHandcuffs() {
        if (this.equipment.handcuffs.count > 0) {
            this.engine.showMessage("*Applies handcuffs*");
            if (this.engine.playPoliceAudio) {
                this.engine.playPoliceAudio('arrest');
            }
            
            // Check if this completes an arrest procedure step
            if (this.procedures.arrest.active) {
                this.completeStep('arrest', 'handcuff');
            }
        } else {
            this.engine.showMessage("No handcuffs available!");
        }
    }
    
    drawWeapon() {
        this.engine.showMessage("*Draws service revolver*");
        this.updatePerformanceRating("safety_rating", -5); // Drawing weapon lowers safety rating unless justified
        
        if (this.engine.playPoliceAudio) {
            this.engine.playPoliceAudio('weapon_draw');
        }
    }
    
    cancelCurrentProcedure() {
        if (this.currentProcedure) {
            this.addViolation('PROCEDURE_CANCELLED', 'Procedure was cancelled before completion');
            this.endProcedure(false);
        }
        
        // Cancel any active procedures
        for (const [type, procedure] of Object.entries(this.procedures)) {
            if (procedure.active) {
                procedure.active = false;
                this.engine.showMessage(`Cancelled: ${procedure.name}`);
            }
        }
    }
}

// Export for use
window.PoliceGameplay = PoliceGameplay;
