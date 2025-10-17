/**
 * Enhanced Police Quest Story System
 * Creative new storyline featuring "The Silicon Circuit" case
 * Classic Sierra-style adventure with humor and proper police procedure
 */

const ENHANCED_STORY = {
    // Main story arc: "The Silicon Circuit"
    mainArc: {
        title: "The Silicon Circuit",
        description: "A sophisticated electronics theft ring is operating in Lytton. What starts as routine burglaries leads to uncovering a larger conspiracy involving corruption, stolen technology, and organized crime.",
        
        // Story acts with Sierra-style progression
        acts: [
            {
                id: "act1_beat_cop",
                title: "Act I: Beat Cop Blues",
                description: "Your first day as Officer Sonny Bonds. Learn the ropes, handle routine calls, and stumble upon your first clue.",
                cases: ["morning_briefing", "routine_patrol", "first_burglary"],
                unlocked: true,
                completed: false
            },
            {
                id: "act2_investigation",
                title: "Act II: The Pattern Emerges",
                description: "Multiple electronics stores hit. Evidence points to an inside job. Time to dig deeper.",
                cases: ["evidence_analysis", "witness_interviews", "inside_lead"],
                unlocked: false,
                completed: false
            },
            {
                id: "act3_undercover",
                title: "Act III: Going Underground",
                description: "Follow the stolen goods trail. Go undercover to infiltrate the fencing operation.",
                cases: ["undercover_prep", "fence_meeting", "warehouse_stakeout"],
                unlocked: false,
                completed: false
            },
            {
                id: "act4_conspiracy",
                title: "Act IV: The Silicon Conspiracy",
                description: "The theft ring is bigger than you thought. High-tech components for something sinister. Someone in the department is dirty.",
                cases: ["corruption_evidence", "internal_investigation", "final_confrontation"],
                unlocked: false,
                completed: false
            }
        ]
    },
    
    // Detailed case definitions with Sierra-style puzzles
    cases: {
        morning_briefing: {
            id: "morning_briefing",
            title: "Morning Briefing",
            type: "tutorial",
            scene: "briefingRoom",
            description: "First day on the job. Attend the morning briefing and learn the basics of police work.",
            
            objectives: [
                {
                    id: "arrive_briefing",
                    text: "Arrive at briefing room before 8:00 AM",
                    hint: "Don't be late! Sergeant Dooley doesn't appreciate tardiness.",
                    completed: false,
                    points: 5,
                    required: true
                },
                {
                    id: "proper_uniform",
                    text: "Ensure uniform is properly worn",
                    hint: "Check your appearance. Button that top button!",
                    completed: false,
                    points: 10,
                    required: true
                },
                {
                    id: "listen_briefing",
                    text: "Listen to Sergeant Dooley's briefing",
                    hint: "Pay attention. There might be a quiz later...",
                    completed: false,
                    points: 15,
                    required: true
                },
                {
                    id: "get_assignment",
                    text: "Receive patrol assignment",
                    hint: "Talk to Sergeant Dooley after the briefing.",
                    completed: false,
                    points: 10,
                    required: true
                }
            ],
            
            // Sierra-style dialog trees
            dialogs: {
                sergeant_dooley_briefing: {
                    text: "Alright people, listen up! We've had three electronics store burglaries this week. The perps are professionals - in and out, no witnesses, security systems disabled. Keep your eyes open out there.",
                    responses: [
                        {
                            text: "Any pattern to the burglaries, Sarge?",
                            next: "pattern_response",
                            sierraHumor: true
                        },
                        {
                            text: "What items were stolen?",
                            next: "items_response"
                        },
                        {
                            text: "*Stay silent and take notes*",
                            next: "professional_response",
                            reputationBonus: 5
                        }
                    ]
                },
                pattern_response: {
                    text: "Good question, Bonds. All hits between 2-3 AM, targeting high-end computer components. Someone knows what they're looking for.",
                    canAdvance: true
                },
                items_response: {
                    text: "Processors, memory chips, graphics cards - the expensive stuff. Street value around $50,000 total. This isn't some punk kid operation.",
                    canAdvance: true
                },
                professional_response: {
                    text: "*Sergeant Dooley nods approvingly* Smart move, Bonds. That's what I like to see - officers who listen before they speak.",
                    canAdvance: true
                }
            },
            
            // Sierra-style deaths (game overs)
            deathScenarios: [
                {
                    id: "late_to_briefing",
                    trigger: "time_past_briefing",
                    message: "You arrive 15 minutes late to the briefing. Sergeant Dooley is not amused.\n\n'Bonds! In my office. NOW!'\n\nYour first day ends in a written reprimand. Not the career start you imagined.\n\nRemember: A good cop is a punctual cop!",
                    restoreText: "Try being on time this time!"
                },
                {
                    id: "improper_uniform",
                    trigger: "uniform_check_failed",
                    message: "Sergeant Dooley stops mid-sentence and stares at you.\n\n'Bonds, is that how you think a Lytton PD officer presents themselves? Get out and come back when you look like a professional!'\n\nThe other officers snicker as you leave in embarrassment.\n\nRemember: Appearance matters in law enforcement!",
                    restoreText: "Check that uniform, rookie!"
                }
            ],
            
            // Easter eggs and Sierra humor
            secrets: [
                {
                    id: "coffee_pot_examine",
                    trigger: "examine_coffee_pot",
                    message: "The coffee pot contains a thick, dark liquid that may have once been coffee... several days ago. It moves sluggishly when you tilt the pot. You're pretty sure something in there just winked at you.",
                    sierraStyle: true
                },
                {
                    id: "donut_box",
                    trigger: "take_donut",
                    message: "You reach for the last donut. Every officer in the room suddenly turns to look at you. The tension is palpable.\n\nThis is clearly a trap. You slowly withdraw your hand.",
                    sierraStyle: true
                }
            ],
            
            completionBonus: 50,
            timeLimit: null
        },
        
        routine_patrol: {
            id: "routine_patrol",
            title: "Routine Patrol",
            type: "patrol",
            scene: "downtown",
            description: "First patrol shift. Handle routine calls and get familiar with Lytton.",
            
            objectives: [
                {
                    id: "inspect_vehicle",
                    text: "Perform pre-shift vehicle inspection",
                    hint: "Check the tires, lights, and equipment. It's in the manual!",
                    completed: false,
                    points: 15,
                    required: true,
                    procedure: "vehicle_inspection"
                },
                {
                    id: "radio_check",
                    text: "Radio check with dispatch",
                    hint: "Use the radio in your patrol car. Call it in before leaving the lot.",
                    completed: false,
                    points: 10,
                    required: true
                },
                {
                    id: "patrol_downtown",
                    text: "Patrol downtown district",
                    hint: "Drive around and observe. Look for anything unusual.",
                    completed: false,
                    points: 20,
                    required: true
                },
                {
                    id: "traffic_stop",
                    text: "Conduct proper traffic stop",
                    hint: "Follow procedure: Signal, position, radio in, approach safely.",
                    completed: false,
                    points: 30,
                    required: false
                },
                {
                    id: "suspicious_activity",
                    text: "Investigate suspicious activity near electronics store",
                    hint: "Something doesn't look right at TechWorld. Better check it out.",
                    completed: false,
                    points: 40,
                    required: true
                }
            ],
            
            dialogs: {
                dispatch_radio: {
                    text: "Unit 15, this is dispatch. You're 10-8, proceed with patrol.",
                    responses: [
                        {
                            text: "10-4, dispatch. Unit 15 is 10-8 and beginning downtown patrol.",
                            next: "professional_radio",
                            proper_procedure: true
                        },
                        {
                            text: "Roger that!",
                            next: "casual_radio",
                            improper_procedure: true
                        }
                    ]
                },
                professional_radio: {
                    text: "Copy that, Unit 15. Have a safe shift.",
                    points: 10,
                    canAdvance: true
                },
                casual_radio: {
                    text: "*Static* Unit 15, please use proper radio codes. This is official police communication.",
                    points: -5,
                    canAdvance: true
                }
            },
            
            deathScenarios: [
                {
                    id: "skip_vehicle_inspection",
                    trigger: "start_patrol_without_inspection",
                    message: "You pull out of the parking lot without checking your vehicle.\n\n*BANG!*\n\nTwo blocks later, your left front tire blows out from a slow leak you didn't catch. The patrol car careens into a lamppost.\n\nSergeant Dooley arrives at the scene. He is NOT happy.\n\n'Bonds, WHAT did they teach you at the academy?!'\n\nRemember: Vehicle inspection is not optional!",
                    restoreText: "Check those tires, rookie!"
                },
                {
                    id: "dangerous_pursuit",
                    trigger: "unauthorized_high_speed_pursuit",
                    message: "You floor the accelerator, pursuing the speeding vehicle without calling it in or getting authorization.\n\nThe chase ends badly when you lose control taking a corner too fast. The patrol car flips and rolls.\n\nAs consciousness fades, you hear sirens approaching...\n\nRemember: High-speed pursuits require authorization and proper procedure!",
                    restoreText: "Call it in and follow procedure!"
                }
            ],
            
            sierraHumor: [
                {
                    trigger: "examine_parking_meter",
                    message: "A parking meter. You resist the urge to shake it for loose change. You're a police officer now, not a broke academy student. (Though the pay isn't that much better...)"
                },
                {
                    trigger: "examine_fire_hydrant",
                    message: "A fire hydrant. It stands there, red and proud, ready to save lives. You wonder if it dreams of being a dalmatian."
                },
                {
                    trigger: "smell_hot_dog_cart",
                    message: "The aroma from the hot dog cart is intoxicating. Your stomach rumbles. But you're on duty. You'll have to wait until your lunch break. \n\n*Your stomach files a formal complaint.*"
                }
            ],
            
            completionBonus: 100,
            timeLimit: 60 // minutes
        },
        
        first_burglary: {
            id: "first_burglary",
            title: "The TechWorld Break-In",
            type: "investigation",
            scene: "downtown",
            description: "Respond to a break-in at TechWorld Electronics. Your first real case begins here.",
            
            objectives: [
                {
                    id: "secure_scene",
                    text: "Secure the crime scene",
                    hint: "Set up police tape and keep civilians away.",
                    completed: false,
                    points: 20,
                    required: true,
                    procedure: "crime_scene_security"
                },
                {
                    id: "interview_owner",
                    text: "Interview store owner",
                    hint: "Get the details. What was taken? When? Any witnesses?",
                    completed: false,
                    points: 30,
                    required: true
                },
                {
                    id: "examine_entry_point",
                    text: "Examine point of entry",
                    hint: "How did they get in? Look for tool marks, fingerprints.",
                    completed: false,
                    points: 25,
                    required: true
                },
                {
                    id: "collect_evidence",
                    text: "Collect physical evidence",
                    hint: "Use evidence bags. Document everything. Chain of custody matters!",
                    completed: false,
                    points: 35,
                    required: true,
                    procedure: "evidence_collection"
                },
                {
                    id: "check_security_footage",
                    text: "Review security camera footage",
                    hint: "Ask about security cameras. They might have caught something.",
                    completed: false,
                    points: 40,
                    required: true
                },
                {
                    id: "file_report",
                    text: "File detailed incident report",
                    hint: "Back at the station. Include all evidence and witness statements.",
                    completed: false,
                    points: 30,
                    required: true
                }
            ],
            
            evidence: [
                {
                    id: "security_tape",
                    name: "Security Camera Footage",
                    description: "Grainy footage showing shadowy figure, approximately 6' tall, wearing dark clothing and gloves. Professional movements suggest experience.",
                    location: "TechWorld Security Office",
                    importance: "high"
                },
                {
                    id: "tool_marks",
                    name: "Tool Marks on Door Frame",
                    description: "Pry marks consistent with professional burglary tools. Suspect knew exactly where to apply leverage.",
                    location: "Back Door",
                    importance: "medium"
                },
                {
                    id: "footprint",
                    name: "Boot Print",
                    description: "Size 11 work boot print in dust near the display cases. Unique tread pattern.",
                    location: "Store Floor",
                    importance: "high"
                },
                {
                    id: "cut_wires",
                    name: "Cut Alarm Wires",
                    description: "Alarm system wires cleanly cut. No damage to surrounding equipment. Professional work.",
                    location: "Back Office",
                    importance: "high"
                },
                {
                    id: "component_list",
                    name: "List of Stolen Items",
                    description: "High-end processors, graphics cards, memory modules. Total value: $18,000. All items are latest generation tech.",
                    location: "Owner's Inventory",
                    importance: "critical"
                }
            ],
            
            witnesses: [
                {
                    id: "owner_martinez",
                    name: "Carlos Martinez",
                    role: "Store Owner",
                    statement: "I got here at 7 AM to open up and found the back door jimmied open. They knew exactly what they wanted - didn't touch the cash register or the cheap stuff, just the high-end components. This is the third store hit this month. We're all scared.",
                    reliability: "high",
                    dialogs: {
                        initial: "Officer, thank God you're here! They cleaned me out - $18,000 in merchandise, gone!",
                        follow_up_1: "You ask about security footage...",
                        follow_up_2: "You ask about enemies or competitors...",
                        follow_up_3: "You ask about recent suspicious customers..."
                    }
                },
                {
                    id: "neighbor_wilson",
                    name: "Mrs. Wilson",
                    role: "Neighboring Business Owner",
                    statement: "I was closing up my flower shop around 9 PM last night. I saw a van parked in the alley behind TechWorld. Dark blue or black, couldn't tell in the light. Didn't think much of it at the time.",
                    reliability: "medium",
                    dialogs: {
                        initial: "Oh officer, this neighborhood used to be so safe! Now look at us...",
                        follow_up_van: "Yes, it was definitely a van. No windows on the sides, I remember that.",
                        follow_up_plates: "I'm sorry, dear. I didn't think to look at the license plate. I should have, shouldn't I?"
                    }
                }
            ],
            
            dialogs: {
                owner_initial: {
                    text: "Officer Bonds? Thank God you're here! They cleaned me out - $18,000 in merchandise, gone! This is going to bankrupt me!",
                    responses: [
                        {
                            text: "Mr. Martinez, I understand you're upset. Let's start from the beginning. When did you discover the break-in?",
                            next: "professional_questioning",
                            proper_procedure: true,
                            points: 10
                        },
                        {
                            text: "Calm down! I need you to stop panicking and answer my questions.",
                            next: "harsh_questioning",
                            improper_procedure: true,
                            points: -10
                        },
                        {
                            text: "Eighteen thousand? That's rough, buddy. Insurance should cover it though, right?",
                            next: "casual_questioning",
                            improper_procedure: true,
                            points: -5
                        }
                    ]
                },
                professional_questioning: {
                    text: "*Mr. Martinez takes a deep breath and collects himself*\n\n'Yes, officer. I arrived at 7 AM this morning to open the store. That's when I found the back door forced open and the inventory gone. I called 911 immediately.'",
                    canAdvance: true,
                    points: 10
                },
                harsh_questioning: {
                    text: "*Mr. Martinez looks taken aback and defensive*\n\n'I-I'm sorry officer. I'm just scared. This is my livelihood...'",
                    canAdvance: true,
                    reputation: -10
                },
                casual_questioning: {
                    text: "*Mr. Martinez frowns*\n\n'Insurance? Do you have any idea how high my deductible is? And my rates will skyrocket! I need these thieves caught, officer!'",
                    canAdvance: true,
                    reputation: -5
                }
            },
            
            puzzles: [
                {
                    id: "security_footage_analysis",
                    name: "Analyze Security Footage",
                    description: "Review the grainy security footage to find clues about the burglar.",
                    solution: "Notice the suspect's unusual watch reflecting light - an expensive chronograph. Criminals usually don't wear expensive jewelry on jobs.",
                    hint: "Look carefully at the suspect's wrist in frame 47.",
                    solvedMessage: "You notice an expensive watch on the suspect's wrist. Interesting - most burglars don't wear fancy jewelry on jobs. This suggests either an amateur or someone with connections to the stolen goods market.",
                    points: 50
                },
                {
                    id: "boot_print_match",
                    name: "Boot Print Analysis",
                    description: "The boot print has a unique tread pattern. Match it to a specific brand and model.",
                    solution: "Compare to catalog: Wolverine ProTec steel-toe work boots, size 11. Common among construction workers and warehouse employees.",
                    hint: "The tread pattern database is in the evidence room.",
                    solvedMessage: "Match found! Wolverine ProTec boots, size 11. These are popular with construction and warehouse workers. Time to check local businesses.",
                    points: 40
                }
            ],
            
            deathScenarios: [
                {
                    id: "contaminate_evidence",
                    trigger: "handle_evidence_without_gloves",
                    message: "You pick up the evidence with your bare hands.\n\n*Flash forward: Internal Affairs Office*\n\n'Officer Bonds, your fingerprints are all over the evidence. The defense attorney will have a field day with this. The case is compromised.'\n\nYour career at Lytton PD ends before it really begins.\n\nRemember: Always use proper evidence handling procedures!",
                    restoreText: "Gloves first, Bonds!"
                },
                {
                    id: "break_chain_custody",
                    trigger: "evidence_not_logged_properly",
                    message: "You take the evidence back to the station but forget to properly log it into the evidence room.\n\nThe next day, the evidence is missing from your desk.\n\n'Bonds! Where's the evidence from the TechWorld case?!'\n\nWithout proper chain of custody, the case falls apart.\n\nRemember: Evidence procedures exist for a reason!",
                    restoreText: "Log it right away!"
                }
            ],
            
            sierraHumor: [
                {
                    trigger: "taste_spilled_liquid",
                    message: "You're about to taste the spilled liquid to determine what it is.\n\nThen you remember: This is a crime scene, not a chemistry class. And you're a cop, not Sherlock Holmes.\n\nYou feel slightly embarrassed that you almost did that."
                },
                {
                    trigger: "examine_register",
                    message: "The cash register is untouched. $300 in small bills, right there for the taking.\n\n'They didn't even look at the money,' Mr. Martinez says. 'What kind of thief steals computer chips but not cash?'\n\n'A very specialized one,' you reply, stroking your chin like you've seen detectives do on TV."
                }
            ],
            
            completionBonus: 150,
            criticalPath: true,
            unlocks: ["evidence_analysis"],
            timeLimit: 120
        },
        
        // Additional cases would go here: evidence_analysis, witness_interviews, inside_lead, etc.
        // Each with similar structure and Sierra-style content
    },
    
    // NPCs with personality and Sierra-style dialog
    npcs: {
        sergeant_dooley: {
            id: "sergeant_dooley",
            name: "Sergeant Dooley",
            title: "Watch Sergeant",
            personality: "Gruff but fair, by-the-book veteran",
            location: "policeStation",
            sprite: "dooley_sprite",
            importance: "critical",
            
            dialogs: {
                greeting: "Bonds. Don't just stand there, you've got work to do.",
                assignment: "Your beat is downtown. Keep your eyes open and your radio on.",
                praise: "Good work, Bonds. Keep this up and you might make detective someday.",
                criticism: "That was sloppy, Bonds. I expect better from my officers.",
                humor: "Coffee? Sure, if you want to melt your stomach lining. That pot's been on since Tuesday."
            },
            
            questRelated: {
                morning_briefing: "Bonds! You're just in time. Grab a seat.",
                routine_patrol: "Your patrol car is ready. Remember - vehicle inspection first!",
                first_burglary: "Bonds, we got a call about a break-in at TechWorld. You're up. Don't screw this up."
            }
        },
        
        officer_jenny: {
            id: "officer_jenny",
            name: "Officer Jenny Patterson",
            title: "Front Desk Officer",
            personality: "Professional, helpful, secretly crushing on Bonds",
            location: "policeStation",
            sprite: "jenny_sprite",
            importance: "high",
            
            dialogs: {
                greeting: "Hi Sonny! How's your shift going?",
                helpful: "Need anything? I can pull up records, check evidence logs, whatever you need.",
                flirty: "*smiles* You know, if you ever want to grab coffee after shift...",
                professional: "Officer Bonds, the Captain wants to see you.",
                humor: "Sergeant Dooley's coffee? I've seen it dissolve a spoon. Literally."
            },
            
            relationship: {
                status: "friendly",
                romance_possible: true,
                trust_level: 75
            }
        },
        
        captain_tate: {
            id: "captain_tate",
            name: "Captain Harold Tate",
            title: "Station Commander",
            personality: "Political, ambitious, but ultimately good cop",
            location: "policeStation",
            sprite: "tate_sprite",
            importance: "critical",
            
            dialogs: {
                greeting: "Bonds. What brings you to my office?",
                pressure: "The mayor is breathing down my neck about these burglaries. I need results, Bonds.",
                approval: "Excellent work, officer. This is exactly the kind of initiative I like to see.",
                disappointment: "I expected more from you, Bonds. Don't let me down again."
            },
            
            secretPlot: {
                corruption: false,
                secret: "Under pressure from city hall, but clean cop"
            }
        },
        
        // More NPCs: informants, criminals, witnesses, love interests, etc.
    },
    
    // Sierra-style game over scenarios
    deathMechanics: {
        types: ["procedural_failure", "safety_violation", "evidence_tampering", "time_expired", "corruption"],
        
        deathMessages: {
            default: "Your career at the Lytton Police Department ends in disgrace.",
            procedural: "Remember: Proper procedure saves lives and careers!",
            safety: "In police work, safety is never optional!",
            evidence: "Without proper evidence handling, justice cannot be served!",
            time: "Sometimes in police work, time is the enemy!"
        },
        
        restoreOptions: {
            restart: true,
            restore_save: true,
            undo_last_move: false // True Sierra style!
        }
    },
    
    // Easter eggs and hidden content
    secrets: {
        developer_room: {
            trigger: "type_backdoor_code",
            message: "You've found the developer room! Here's a free donut. 🍩",
            reward: "infinite_donuts"
        },
        
        al_lowe_reference: {
            trigger: "examine_poster_twenty_times",
            message: "The poster advertises 'Larry's Leisure Lounge.' You feel a strange sense of déjà vu...",
            sierraStyle: true
        },
        
        space_quest_cameo: {
            trigger: "look_at_stars",
            message: "In the night sky, you spot what looks like a janitor floating past in a spacesuit. You blink, and it's gone. Must be the coffee.",
            sierraStyle: true
        }
    },
    
    // Score system
    scoring: {
        maxScore: 1000,
        ranks: [
            { score: 0, rank: "Rookie", badge: "bronze" },
            { score: 200, rank: "Officer", badge: "silver" },
            { score: 500, rank: "Detective", badge: "gold" },
            { score: 800, rank: "Lieutenant", badge: "platinum" },
            { score: 1000, rank: "Captain", badge: "legendary" }
        ]
    }
};

// Export for game engine
window.ENHANCED_STORY = ENHANCED_STORY;
