
const ROBOT_TIERS = [
    { name: "Prototype X-1", multiplier: 1, class: "tier-0", desc: "Basic clicker unit.", rarity: "Common" },
    { name: "Scout", multiplier: 2, class: "tier-1", desc: "Agile reconnaissance bot.", rarity: "Common" },
    { name: "Guardian", multiplier: 2, class: "tier-2", desc: "Reinforced steel chassis.", rarity: "Common" },
    { name: "Cobalt", multiplier: 5, class: "tier-3", desc: "Enhanced speed servos.", rarity: "Rare" },
    { name: "Sentinel", multiplier: 5, class: "tier-4", desc: "Energy shield generator.", rarity: "Rare" },
    { name: "Sovereign", multiplier: 5, class: "tier-5", desc: "Luxury plating, max efficiency.", rarity: "Rare" },
    { name: "Mech", multiplier: 10, class: "tier-6", desc: "Powered by unstable core.", rarity: "Epic" },
    { name: "Void", multiplier: 10, class: "tier-7", desc: "Phases through reality.", rarity: "Epic" },
    { name: "Titan", multiplier: 25, class: "tier-8", desc: "Forged in star fire.", rarity: "Legendary" },
    { name: "Warlord", multiplier: 25, class: "tier-9", desc: "Commands entire fleets.", rarity: "Legendary" },
    { name: "Heavy Siege Unit", multiplier: 25, class: "tier-14", desc: "Mobile fortress.", rarity: "Legendary" },
    { name: "Storm Bringer", multiplier: 25, class: "tier-15", desc: "Harnesses the weather.", rarity: "Legendary" },
    { name: "Solar Archon", multiplier: 50, class: "tier-16", desc: "Powered by a miniature sun.", rarity: "Godly" },
    { name: "Lunar Phantom", multiplier: 50, class: "tier-17", desc: "Silent as the moon's shadow.", rarity: "Godly" },
    { name: "Time Weaver", multiplier: 50, class: "tier-18", desc: "Manipulates the timeline.", rarity: "Godly" },
    { name: "Dimensional Horror", multiplier: 100, class: "tier-19", desc: "It shouldn't exist.", rarity: "Omega" },
    { name: "Quantum Seraph", multiplier: 100, class: "tier-20", desc: "Multi-dimensional angel.", rarity: "Omega" },
    { name: "The Architect", multiplier: 100, class: "tier-21", desc: "Builder of universes.", rarity: "Omega" }
];

// Generate Tiered Tasks
const generateTasks = () => {
    const tasks = [];
    const tiers = 10; // 10 Tiers of progression
    
    for (let i = 1; i <= tiers; i++) {
        // 1. Click Count (Rebalanced: Much easier scaling)
        // Was: 100 * 5^(i-1) -> ~195M at Tier 10
        // Now: 250 * 2^(i-1) -> ~128k at Tier 10 (Very reasonable)
        const clickTarget = Math.floor(250 * Math.pow(2, i - 1)); 
        tasks.push({
            id: `clicks_t${i}`,
            tier: i,
            desc: `Click ${clickTarget.toLocaleString()} Times`,
            type: 'clicks',
            target: clickTarget,
            reward: 25 * i, // Generous Gems: 25, 50, 75...
            icon: 'fa-fingerprint'
        });

        // 2. Earn Money (Rebalanced)
        // Was: 1000 * 10^(i-1) -> ~1T at Tier 10
        // Now: 1000 * 6^(i-1) -> ~10B at Tier 10
        const moneyTarget = 1000 * Math.pow(6, i - 1);
        tasks.push({
            id: `earn_t${i}`,
            tier: i,
            desc: `Earn $${moneyTarget.toLocaleString()} Total`,
            type: 'money_earned',
            target: moneyTarget,
            reward: 30 * i, // More gems for money tasks
            icon: 'fa-sack-dollar'
        });

        // 3. Click Value Upgrade Level
        const cvTarget = 10 + ((i - 1) * 10); // 10, 20, 30... (Easier)
        tasks.push({
            id: `cv_t${i}`,
            tier: i,
            desc: `Reach Click Value Lv. ${cvTarget}`,
            type: 'upgrade_level',
            upgradeKey: 'Click Value',
            target: cvTarget,
            reward: 25 * i,
            icon: 'fa-arrow-pointer'
        });

        // 4. Drone Count (Capped at 5)
        if (i <= 5) {
            tasks.push({
                id: `drone_t${i}`,
                tier: i,
                desc: `Deploy ${i} Drone${i > 1 ? 's' : ''}`,
                type: 'upgrade_level',
                upgradeKey: 'add_drone', // Uses upgrade level as count essentially
                target: i,
                reward: 50 * i, // Big reward for drones
                icon: 'fa-helicopter'
            });
        }
    }
    return tasks;
};

const TASKS_DATA = generateTasks();

const DRONE_COSTS = [500, 50000, 5000000, 500000000, 50000000000];

const GEM_SHOP_ITEMS = {
    'perm_auto_2x': { name: "Overclock Chip", desc: "Permanent 2x Drone Speed", cost: 200, type: 'perm_buff', mult: 2, icon: 'fa-microchip' },
    'perm_click_2x': { name: "Titanium Finger", desc: "Permanent 2x Click Value", cost: 300, type: 'perm_buff', mult: 2, icon: 'fa-hand-fist' },
    'perm_evo_speed': { name: "Evo Accelerator", desc: "Permanent 2x Evolution Speed", cost: 500, type: 'perm_buff', mult: 2, icon: 'fa-dna' },
    'mega_drone': { name: "MEGA DRONE", desc: "Deploys a Mega Drone!", cost: 1000, type: 'perm_mega_drone', icon: 'fa-jet-fighter-up' }
};

const AD_VARIANTS = [
    { id: 'turbo', title: 'TURBO SURGE', sub: '3x Income (60s)', icon: '🔥', color: 'linear-gradient(90deg, #ff4757, #ff6b81)' },
    { id: 'auto', title: 'OVERCLOCK', sub: '10x Speed (30s)', icon: '⚡', color: 'linear-gradient(90deg, #2ed573, #7bed9f)' },
    { id: 'auto_clicker', title: 'BOT SWARM', sub: 'Auto Clicks (30s)', icon: '🤖', color: 'linear-gradient(90deg, #5352ed, #70a1ff)' }
];

class RoboClicker {
    constructor() {
        this.gameState = {
            money: 0,
            gems: 0, // New Currency
            totalMoney: 0,
            totalClicks: 0, // New Stat
            clickPower: 1,
            autoClickPower: 0,
            rebirthMultiplier: 1,
            rebirthCount: 0,
            totalBotsDeployed: 0, 
            
            // Bot Hangar System
            drones: [], // Array of { tier: 1 } objects
            
            dailyStreak: 0,
            lastDailyClaim: 0,
            
            settings: { sfxVolume: 100, musicVolume: 50 },

            // Evolution System
            evolution: {
                stage: 0,
                xp: 0,
                maxXp: 150 // Scales with stage
            },
            unlockedRobots: [0], // Array of tier indices
            
            hasOpenedDrawer: false, // Track if user has seen ads
            hasSeenTutorial: false, // Track tutorial status

            // Prestige System
            prestige: {
                points: 0,
                totalResetCount: 0,
                claimedPoints: 0, // Track total points claimed to calc next threshold
                upgrades: {} // { 'id': level }
            },

            // Upgrades with descriptions - EXCLUSIVE & FUN
            upgrades: {
                'Click Value': { level: 0, baseCost: 10, basePower: 1, name: "Click Value", desc: "Increases Click Value", type: "click" },
                'add_drone': { level: 0, baseCost: 500, basePower: 1, name: "Deploy Drone", desc: "Deploys a Drone (Max 5)", type: "action_add_drone" },
                'upgrade_drone': { level: 0, baseCost: 1000, basePower: 1, name: "Upgrade Drone", desc: "Drones Gain More Power", type: "action_upgrade_drone" },
                'crit_money': { level: 0, baseCost: 1500, basePower: 1, name: "Better Critical Chance", desc: "Increases Critical Chance", type: "effect_crit" },
            },
            
            // Gem Shop State
            gemUpgrades: {},
            
            // Task Progress tracking
            tasks: {}, 
            
            // Drone State
            droneLevel: 1,
            
            // Combo System State
            combo: {
                count: 0,
                timer: null,
                multiplier: 1
            },
            
            lastSave: Date.now(),
            startTime: Date.now()
        };

        this.lastAdSpawn = Date.now(); // Timer for sliding ads
        this.lastGoldenDroneSpawn = Date.now(); // Timer for Golden Drone

        this.adManager = {
            activeBoost: null, // Legacy flag, kept for safety
            boosts: {}, // { type: endTime }
            boostEndTime: 0
        };

        this.audioCtx = null;
        this.musicNodes = []; // Store oscillators for music
        this.musicGain = null;
        this.els = {};
        
        this.isHardReset = false; // Flag to prevent save on reset
        
        // Tab State
        this.activeTab = 'upgrades';

        this.toggleBonusDrawer = this.toggleBonusDrawer.bind(this);
        this.toggleDailyDrawer = this.toggleDailyDrawer.bind(this);
    }

    async init() {
        console.log("Initializing Robo Clicker Elite...");

        // --- CrazyGames SDK Manager Initialization ---
        if (window.CrazyManager) {
            await window.CrazyManager.init();
            
            // Ad Block Check
            const hasAdblock = await window.CrazyManager.hasAdblock();
            if (hasAdblock) {
                console.warn("Adblock detected!");
            }
        }
        
        this.cacheDOM();
        this.initAudio();
        
        // Ensure Audio Resumes on Interaction
        const resumeAudio = () => {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('touchstart', resumeAudio);
        };
        window.addEventListener('click', resumeAudio);
        window.addEventListener('touchstart', resumeAudio);

        await this.loadGame();
        
        // Initialize Tasks Data if missing
        this.initTasks();
        
        this.setupEventListeners();
        
        this.startGameLoop();
        this.startAutoSave();

        this.updateDisplay();
        this.renderUpgrades();
        this.renderTasks(); // Initial Render
        this.renderGemShop();
        
        // Check Daily Reward but DO NOT auto-open modal on init
        this.checkDailyReward(false); 
        this.applyRobotVisuals();
        
        // Offline Earnings Check
        this.checkOfflineEarnings();

        // Tutorial Check
        if (this.gameState.totalBotsDeployed === 0) {
            this.initTutorial();
        }
        
        // Signal Gameplay Start to SDK
        if (window.CrazyManager) {
            // 1. Stop Loading (Assets loaded)
            window.CrazyManager.loadingStop();
            
            // 2. Start Gameplay
            window.CrazyManager.gameplayStart();
            
            // --- NEW: Request Banners ---
            // Request responsive banners for both slots
            window.CrazyManager.requestResponsiveBanner('banner-container-top');
            window.CrazyManager.requestResponsiveBanner('banner-container-bottom');
        }
    }
    
    initTasks() {
        // Ensure all defined tasks exist in state
        TASKS_DATA.forEach(task => {
            if (!this.gameState.tasks[task.id]) {
                this.gameState.tasks[task.id] = { 
                    id: task.id, 
                    progress: 0, 
                    claimed: false 
                };
            }
        });
        
        // Clean up old tasks that no longer exist (optional, prevents save bloat)
        const taskIds = new Set(TASKS_DATA.map(t => t.id));
        for (const key in this.gameState.tasks) {
            if (!taskIds.has(key)) {
                // delete this.gameState.tasks[key]; // Keep for legacy safety or delete
            }
        }
        
        // Retroactive Check (for loaded games)
        this.checkTaskProgress();
    }
    
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update Buttons
        document.querySelectorAll('.panel-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // Show/Hide Containers
        document.getElementById('upgrades-container').classList.add('hidden');
        document.getElementById('tasks-container').classList.add('hidden');
        document.getElementById('gems-container').classList.add('hidden');
        
        if (tabName === 'upgrades') {
            document.getElementById('upgrades-container').classList.remove('hidden');
        } else if (tabName === 'tasks') {
            document.getElementById('tasks-container').classList.remove('hidden');
            this.renderTasks();
        } else if (tabName === 'gems') {
            document.getElementById('gems-container').classList.remove('hidden');
            this.renderGemShop();
        }
        
        this.playClickSound();
    }

    // --- TUTORIAL ---
    initTutorial() {
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.id = 'tut-overlay';
        document.body.appendChild(overlay);

        const cursor = document.createElement('div');
        cursor.className = 'tutorial-cursor';
        cursor.id = 'tut-cursor';
        cursor.textContent = '👆'; 
        document.body.appendChild(cursor);

        // Highlight the robot
        this.els.hero.classList.add('highlight-z');
        this.gameState.isTutorialActive = true;
        
        // Dynamic Position
        this.updateTutorialCursor();
        window.addEventListener('resize', () => this.updateTutorialCursor());
    }
    
    updateTutorialCursor() {
        const cursor = document.getElementById('tut-cursor');
        if (!cursor || !this.els.hero) return;
        
        const rect = this.els.hero.getBoundingClientRect();
        // Position to the right side of the robot
        const top = rect.top + (rect.height / 2); 
        const left = rect.right - 20;
        
        cursor.style.top = `${top}px`;
        cursor.style.left = `${left}px`;
    }

    endTutorial() {
        if (!this.gameState.isTutorialActive) return;
        
        this.gameState.hasSeenTutorial = true;
        this.saveGame();
        
        const overlay = document.getElementById('tut-overlay');
        const cursor = document.getElementById('tut-cursor');
        
        if (overlay) overlay.style.opacity = '0';
        if (cursor) cursor.style.opacity = '0';
        
        this.els.hero.classList.remove('highlight-z');
        
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) heroSection.classList.remove('lift-z');
        
        setTimeout(() => {
            if (overlay) overlay.remove();
            if (cursor) cursor.remove();
        }, 500);
        
        this.gameState.isTutorialActive = false;
    }

    cacheDOM() {
        this.els = {
            money: document.getElementById('money-count'),
            gems: document.getElementById('gems-count'), // New
            currencyContainer: document.getElementById('money-display-container'),
            botValue: document.getElementById('bot-value-stat'), // Now Click Value
            multiplierStat: document.getElementById('multiplier-stat'), // New Multiplier Display
            // totalBots removed
            
            hero: document.getElementById('hero-robot'),
            fusionFill: document.getElementById('fusion-fill'), // Now Evolution Fill
            evoPercent: document.getElementById('evo-percent'),
            
            // Heat System
            heatSystem: document.querySelector('.heat-system'), 
            heatFillBar: document.getElementById('heat-fill-bar'),
            heatPercent: document.getElementById('heat-percent'),
            heatLightning: document.getElementById('heat-lightning'),
            heatBulb: document.getElementById('heat-bulb'), // New Bulb
            idlePrompt: document.getElementById('idle-prompt'),
            
            // Turbo UI
            turboOverlay: document.getElementById('turbo-overlay'),
            turboTimer: document.getElementById('turbo-timer'),
            
            // Hangar UI
            hangarGrid: document.getElementById('hangar-grid'),
            mergeBtn: document.getElementById('merge-drones-btn'),
            droneCount: document.getElementById('drone-count'),

            upgradesContainer: document.getElementById('upgrades-container'),
            tasksContainer: document.getElementById('tasks-container'), // New
            gemsContainer: document.getElementById('gems-container'), // New
            
            tasksBadge: document.getElementById('tasks-badge'), // New Notification Badge
            
            modalOverlay: document.getElementById('modal-overlay'),
            rebirthModal: document.getElementById('rebirth-modal'),
            dailyModal: document.getElementById('daily-rewards-modal'),
            settingsModal: document.getElementById('settings-modal'),
            offlineModal: document.getElementById('offline-modal'), // New
            indexModal: document.getElementById('index-modal'),
            confirmModal: document.getElementById('confirm-modal'), // New
            
            rebirthBtn: document.getElementById('open-rebirth-btn'),
            dailyRewardBtn: document.getElementById('daily-reward-btn'), // HUD Button
            
            claimOfflineBtn: document.getElementById('claim-offline-btn'), // New
            
            bonusDrawer: document.getElementById('bonus-drawer'),
            drawerToggle: document.getElementById('bonus-btn'), // New Button ID
            closeBonusBtn: document.getElementById('close-bonus-btn'), // New Close Button
            
            // dailyDrawer removed
            dailyBadge: document.getElementById('daily-badge'), // HUD Badge
            
            dailyGrid: document.getElementById('daily-streak-grid'),
            claimDailyBtn: document.getElementById('claim-daily-btn'),
            dailyTimer: document.getElementById('daily-timer'),

            sfxSlider: document.getElementById('setting-sfx'),
            musicSlider: document.getElementById('setting-music'),
            
            confirmYesBtn: document.getElementById('confirm-yes-btn'),
            confirmNoBtn: document.getElementById('confirm-no-btn')
        };
    }

    initAudio() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.playBackgroundMusic();
        } catch (e) {
            console.warn("Web Audio API not supported");
        }
    }

    playClickSound() {
        if (!this.audioCtx || this.gameState.settings.sfxVolume === 0) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        // Soft "Bubble" Pop
        // Sine wave, low pitch, very short envelope
        const baseFreq = 300 + (Math.random() * 50); // Slight variation
        osc.type = 'sine'; 
        
        const now = this.audioCtx.currentTime;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq + 100, now + 0.1); // Pitch up slightly
        
        const vol = (this.gameState.settings.sfxVolume / 100) * 0.05; // Much lower volume (5%) - Permanent Fix
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playNotificationSound() {
        if (!this.audioCtx || this.gameState.settings.sfxVolume === 0) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.1);
        
        const vol = (this.gameState.settings.sfxVolume / 100) * 0.1;
        gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    playBackgroundMusic() {
        if (this.bgMusic) return; // Already setup

        // Upbeat Mobile Casual Video Game Music
        const musicUrl = "https://cdn.pixabay.com/download/audio/2023/07/15/audio_19d71aeb6a.mp3?filename=mobile-casual-video-game-music-158301.mp3"; 
        
        this.bgMusic = new Audio(musicUrl); 
        this.bgMusic.loop = true;
        this.updateMusicVolume();
        
        // Interaction requirement handling
        const startMusic = () => {
            if (this.bgMusic && this.bgMusic.paused) {
                this.bgMusic.play().catch(e => console.log("Waiting for interaction to play music"));
            }
        };
        
        document.addEventListener('click', startMusic);
        document.addEventListener('touchstart', startMusic);
        document.addEventListener('keydown', startMusic);
        
        // Try playing immediately
        startMusic();
    }

    updateMusicVolume() {
        if (this.bgMusic) {
            // Volume range 0.0 to 0.05 (max) for "permanently quieter" feel
            const vol = (this.gameState.settings.musicVolume / 100) * 0.05;
            this.bgMusic.volume = vol;
        }
    }

    // --- DRONE SYSTEM (FLYING - SWARM) ---
    addDrone(tier) {
        if (!this.gameState.drones) this.gameState.drones = [];
        
        // Cap visual drones to 5 as per request
        if (this.gameState.drones.length >= 5) {
             return;
        }
        
        this.gameState.drones.push({ tier: tier });
        this.renderFlyingDrones();
        this.saveGame();
    }

    renderFlyingDrones() {
        const container = document.getElementById('flying-drones-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Slot System to prevent overlap (Max 5 drones)
        // Y-Percentages for 5 distinct vertical slots
        const slots = [20, 32, 44, 56, 68];
        // Shuffle slots so they don't fill top-down every time
        const shuffledSlots = slots.sort(() => Math.random() - 0.5);
        
        this.gameState.drones.forEach((drone, index) => {
            const el = document.createElement('div');
            el.className = `flying-drone tier-${drone.tier}`;
            
            // STRICT Positioning: LEFT SIDE ONLY
            // Use slot if available, else fallback to random (safeguard)
            const yBase = shuffledSlots[index] !== undefined ? shuffledSlots[index] : (20 + Math.random() * 50);
            
            // X is slightly random for organic feel but kept tight
            const x = (5 + Math.random() * 15) + '%'; 
            const y = yBase + '%'; 
            
            el.style.left = x;
            el.style.top = y;
            
            // Random float delay for desync
            el.style.animationDelay = `${Math.random() * -5}s`;
            
            // Inner visual - SIMPLE NEON DESIGN (No Arms)
            const visual = document.createElement('div');
            visual.className = 'drone-visual';
            
            // Core (Glowing Center)
            const core = document.createElement('div');
            core.className = 'drone-core-simple';
            
            // Energy Ring (Rotating)
            const ring = document.createElement('div');
            ring.className = 'drone-ring-simple';

            // Glow Pulse
            const glow = document.createElement('div');
            glow.className = 'drone-glow-pulse';
            
            visual.appendChild(glow);
            visual.appendChild(ring);
            visual.appendChild(core);
            
            el.appendChild(visual);
            container.appendChild(el);
        });
    }

    fireDroneLaser(droneEl) {
        if (!droneEl) return;
        
        // Calculate target (Robot Center)
        const robot = this.els.hero;
        if (!robot) return;
        
        const droneRect = droneEl.getBoundingClientRect();
        const robotRect = robot.getBoundingClientRect();
        
        const droneX = droneRect.left + droneRect.width / 2;
        const droneY = droneRect.top + droneRect.height / 2;
        
        const robotX = robotRect.left + (Math.random() * robotRect.width);
        const robotY = robotRect.top + (Math.random() * robotRect.height);
        
        const angle = Math.atan2(robotY - droneY, robotX - droneX) * 180 / Math.PI;
        const dist = Math.hypot(robotX - droneX, robotY - droneY);

        const laser = document.createElement('div');
        laser.className = 'drone-laser';
        // Set rotation to point at robot
        laser.style.transform = `rotate(${angle}deg)`;
        
        // MEGA DRONE: Blue Laser
        const isMega = droneEl.classList.contains('tier-mega');
        if (isMega) {
            laser.style.background = '#00ffff';
            laser.style.boxShadow = '0 0 10px #00ffff';
            laser.style.height = '4px'; // Thicker
        }
        
        droneEl.appendChild(laser);
        
        // Dynamic Animation via JS for exact distance
        laser.animate([
            { width: '0px', opacity: 1 },
            { width: `${dist}px`, opacity: 1, offset: 0.3 },
            { width: `${dist}px`, opacity: 0 }
        ], {
            duration: 300, // Fast shot
            easing: 'ease-out'
        }).onfinish = () => laser.remove();
        
        // Damage & Impact Logic (Synced with hit)
        setTimeout(() => {
            const lvl = this.gameState.droneLevel || 1;
            // Damage scales: Exactly 200% of User Click Power per shot (2x Boost)
            let baseDamage = Math.max(10, this.getClickPower() * this.getGlobalMultiplier() * 2);
            
            // MEGA DRONE: Massive Damage Bonus (50x) - Persists through Rebirth
            if (isMega) {
                baseDamage *= 50;
            }
            
            // --- NEW: DRONE CRITICAL HITS ---
            const critUpgrade = this.gameState.upgrades['crit_money'] || { level: 0, basePower: 0 }; 
            const critChance = (critUpgrade.level * critUpgrade.basePower) / 100;
            const isCrit = Math.random() < critChance;
            
            if (isCrit) {
                baseDamage *= 2; // Critical Hit Multiplier
                this.spawnCriticalPopup(robotX, robotY);
            }

            this.addMoney(baseDamage);
            
            // --- NEW: FULL VISUAL FEEDBACK (Same as Click) ---
            // 1. Flying Money
            this.spawnMoneyParticle(baseDamage, robotX, robotY);
            
            // 2. Bolt Particles
            this.spawnBoltParticle(robotX, robotY);
            
            // 3. Robot Bounce
            this.animateHero();
            
        }, 100);
    }

    getDroneBoost() {
        return 1; // Disabled drone multiplier boost as per user request
    }

    triggerSlidingAd() {
        // --- NEW LOGIC: NOTIFICATION ONLY ---
        // Instead of spawning a banner, we highlight a card in the drawer and notify the user.
        
        // Pick random variant
        const variants = ['turbo', 'auto', 'auto_clicker'];
        const type = variants[Math.floor(Math.random() * variants.length)];
        
        // Map type to Card ID
        let cardId = '';
        if (type === 'turbo') cardId = 'card-turbo';
        else if (type === 'auto') cardId = 'card-auto';
        else if (type === 'auto_clicker') cardId = 'card-swarm';
        
        const card = document.getElementById(cardId);
        if (card) {
            // Remove highlight from others first? No, let them stack or clear all?
            // Let's clear all first to be neat.
            ['card-turbo', 'card-auto', 'card-swarm'].forEach(id => {
                const c = document.getElementById(id);
                if (c) c.classList.remove('card-highlight');
            });
            
            // Add highlight
            card.classList.add('card-highlight');
            
            // Auto-remove highlight after 15s? Or keep until clicked?
            // Keep until drawer opened?
            // Let's remove it after 20s so it doesn't stay forever if ignored.
            setTimeout(() => {
                if (card) card.classList.remove('card-highlight');
            }, 20000);
        }
        
        // Trigger Notification on Drawer Button
        const bonusBadge = document.getElementById('bonus-badge');
        if (bonusBadge) {
            bonusBadge.classList.remove('hidden');
            bonusBadge.classList.add('active-pulse');
        }
        
        const handle = document.getElementById('bonus-btn');
        if (handle) {
            handle.classList.add('attention-shake');
            setTimeout(() => handle.classList.remove('attention-shake'), 1000);
        }
        
        this.playNotificationSound();
    }

    // --- GAMEPLAY LOGIC ---

    spawnTutorialSplash(x, y) {
        const el = document.createElement('div');
        el.className = 'tutorial-splash';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);
        
        setTimeout(() => el.remove(), 600);
    }

    clickHero(event, isAuto = false) {
        // --- TUTORIAL FIX ---
        if (!isAuto && this.gameState.isTutorialActive) {
            this.endTutorial();
        }

        // --- HEAT SYSTEM ---
        if (!isAuto) {
            this.lastClickTime = Date.now();
            this.isIdle = false;
            if (this.els.idlePrompt) this.els.idlePrompt.classList.add('hidden');
            
            // Satisfying Shake on Click
            this.els.hero.classList.remove('click-shake');
            void this.els.hero.offsetWidth; // Force reflow
            this.els.hero.classList.add('click-shake');

            // Increase Heat - EASIER TO FILL
            this.heat = Math.min(100, (this.heat || 0) + 8); // Adjusted to be harder (was 12)
            
            // Add Shake to Robot
            this.els.hero.classList.remove('shake');
            void this.els.hero.offsetWidth; // Force reflow
            this.els.hero.classList.add('shake');
            
            // Track Total Clicks
            this.gameState.totalClicks = (this.gameState.totalClicks || 0) + 1;
            
            this.checkTaskProgress();
        }

        let heatMult = 1;
        if (this.heat >= 90) { 
            heatMult = 2; // Was 5, User requested 2X
            this.show5xMultiplier(); // Renamed visually but function kept
        } else if (this.heat >= 50) {
            heatMult = 1.5; // Smoother curve
        }

        // Critical Chance Logic
        const critUpgrade = this.gameState.upgrades['crit_money'] || { level: 0, basePower: 0 }; 
        const critChance = (critUpgrade.level * critUpgrade.basePower) / 100;
        let isCrit = Math.random() < critChance;
        
        let amount = this.getClickPower(); // Base Click Value
        
        // Calculate Global Multiplier (Evo, Prestige, Boosts)
        const globalMult = this.getGlobalMultiplier();
        
        // Combine
        amount *= globalMult;
        
        // Heat is a separate temporary multiplier, apply here
        amount *= heatMult;

        if (isCrit) {
            // Apply Critical Damage Multiplier (Base 2x)
            amount *= 2;
        }

        // Midas Chip Logic (Legacy check, kept safe)
        const midasUpgrade = this.gameState.upgrades['midas_chip'];
        const midasLevel = midasUpgrade ? midasUpgrade.level : 0;
        let isMidas = false;
        if (midasLevel > 0 && Math.random() < 0.005) { // 0.5% fixed chance
            amount *= 10;
            isMidas = true;
        }

        this.addMoney(amount);
        
    // --- EVOLUTION MECHANIC
        // Only Manual Clicks give XP
        if (!isAuto) {
            this.gameState.totalBotsDeployed++;
            // Add XP per click
            let xpGain = 2; // Was 1, made easier

            // Gem Shop Evo Boost
            if (this.gameState.gemUpgrades && this.gameState.gemUpgrades['perm_evo_speed']) {
                xpGain *= 2;
            }
            
            // Prestige XP Boost
            if (this.gameState.prestige && this.gameState.prestige.upgrades['pp_xp']) {
                xpGain *= (1 + (this.gameState.prestige.upgrades['pp_xp'] * 0.2));
            }
            
            this.gameState.evolution.xp += xpGain;
            if (this.gameState.evolution.xp >= this.gameState.evolution.maxXp) {
                this.evolveRobot();
            }
        }

        // Visuals & Audio
        if (!isAuto && event) { 
            this.spawnMoneyParticle(amount, event.clientX, event.clientY);
            this.spawnBoltParticle(event.clientX, event.clientY); 
            
            if (this.gameState.isTutorialActive) {
                this.spawnTutorialSplash(event.clientX, event.clientY);
            }

            this.animateHero();
            
            if (isMidas) {
                this.spawnDamageNumber("MIDAS!", event.clientX, event.clientY - 80, '#FFD700');
                this.playNotificationSound();
            } else if (isCrit) {
                this.spawnCriticalPopup(event.clientX, event.clientY);
            } else if (this.gameState.combo.multiplier > 1.2) {
                // Show combo text occasionally
                if (Math.random() < 0.2) {
                    this.spawnDamageNumber(`${this.gameState.combo.multiplier.toFixed(1)}x COMBO`, event.clientX, event.clientY - 100, '#e67e22');
                }
            }
            
            this.playClickSound();
        } 
        
        this.updateHUD(); 
        this.updateFusionUI();
    }
    
    // NEW: Centralized Multiplier Logic for Display & Calculation
    getGlobalMultiplier() {
        let mult = 1;
        
        // 1. Rebirth/Prestige
        mult *= this.gameState.rebirthMultiplier;
        
        // 2. Robot Evolution Tier
        const tierMult = ROBOT_TIERS[this.gameState.evolution.stage].multiplier;
        mult *= tierMult;
        
        // 3. Passive Upgrades
        const passiveUpgrade = this.gameState.upgrades['passive_mult'];
        const passiveMult = passiveUpgrade ? 1 + (passiveUpgrade.level * passiveUpgrade.basePower) : 1;
        mult *= passiveMult;
        
        // 4. Drone Boost
        mult *= this.getDroneBoost();
        
        // 5. Active Ad Boosts (Turbo)
        const now = Date.now();
        if (this.adManager.boosts['turbo'] && this.adManager.boosts['turbo'] > now) {
            mult *= 3;
        }
        
        // 6. Prestige System Bonuses
        if (this.gameState.prestige) {
            // Base Passive
            mult *= (1 + (this.gameState.prestige.points * 0.10));
            // Synergy Upgrade
            const synLevel = this.gameState.prestige.upgrades['pp_mult'] || 0;
            if (synLevel > 0) {
                mult *= (1 + (synLevel * 0.5));
            }
        }
        
        return mult;
    }

    addMoney(amount) {
        this.gameState.money += amount;
        this.gameState.totalMoney += amount;
        
        if (Math.random() < 0.1) this.checkTaskProgress();
    }
    
    // Helper to calculate auto income with multipliers
    calculateAutoIncome() {
        const baseAuto = this.getAutoPower();
        const now = Date.now();
        
        // --- BOT SWARM LOGIC (Active Clicks Simulation) ---
        if (this.adManager.boosts['auto_clicker'] && this.adManager.boosts['auto_clicker'] > now) {
            // "Super Fast" clicks: We simulate this by triggering rapid clicks in the game loop
            // Since this function returns PASSIVE income, we handle active clicks separately in the loop
            // BUT, let's inject some base value here just in case? No, better keep it separate.
        }

        if (baseAuto === 0) return 0;
        
        let mult = this.getGlobalMultiplier();
        
        // Auto-specific boost (Overclock)
        if (this.adManager.boosts['auto'] && this.adManager.boosts['auto'] > now) {
            mult *= 10;
        }
        
        return baseAuto * mult;
    }

    /* 
       ORIGINAL addMoney LOGIC REMOVED/REPLACED 
       I need to make sure I didn't break anything.
       Original addMoney: applied Rebirth, Tier, Passive, Drone, Turbo, Prestige.
       My getGlobalMultiplier covers: Rebirth, Tier, Passive, Drone, Turbo, Prestige.
       
       So in clickHero:
       amount = getClickPower() * globalMult * heatMult * crit.
       addMoney(amount) -> Adds. Correct.
       
       In Auto Loop:
       See next replacement.
    */

    getClickPower() {
        const cursor = this.gameState.upgrades['Click Value'];
        let power = 1;
        if (cursor) {
            power = 1 + (cursor.level * cursor.basePower);
        }
        
        // Gem Shop Perm Boost
        if (this.gameState.gemUpgrades && this.gameState.gemUpgrades['perm_click_2x']) {
            power *= 2;
        }
        
        return power;
    }

    getAutoPower() {
        let power = 0;
        for (const key in this.gameState.upgrades) {
            const upgrade = this.gameState.upgrades[key];
            if (upgrade && upgrade.type === 'auto') {
                power += upgrade.level * upgrade.basePower;
            }
        }
        
        // Gem Shop Perm Boost
        if (this.gameState.gemUpgrades && this.gameState.gemUpgrades['perm_auto_2x']) {
            power *= 2;
        }
        
        return power;
    }

    buyUpgrade(key, event) {
        const upgrade = this.gameState.upgrades[key];
        const cost = this.getUpgradeCost(key);

        // Safety check for max drones
        if (key === 'add_drone' && this.gameState.drones.length >= 5) {
            return; // Already maxed
        }

        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            upgrade.level++;
            
            // Special Logic for Add Drone
            if (key === 'add_drone') {
                this.addDrone(this.gameState.droneLevel || 1);
            }
            
            // Special Logic for Upgrade Drone
            if (key === 'upgrade_drone') {
                this.gameState.droneLevel = (this.gameState.droneLevel || 1) + 1;
                
                const droneContainer = document.getElementById('flying-drones-container');
                if (droneContainer) {
                    Array.from(droneContainer.children).forEach(el => {
                        el.classList.add('power-surge');
                        setTimeout(() => el.classList.remove('power-surge'), 500);
                    });
                }
            }
            
            // Show "Little UI" Popup
            if (event && (event.target || event.currentTarget)) {
                this.spawnMiniUpgradePopup(event.currentTarget || event.target);
            }

            this.updateDisplay();
            this.renderUpgrades(); 
            this.checkTaskProgress();
            this.saveGame();
            this.playClickSound(); // UI Click
        } else {
            // --- SMART AD UPGRADE SYSTEM ---
            // ALWAYS offer if can't afford (Aggressive as requested)
            // "Adds should slide in very often there should always be a slid in add"
            if (event && (event.target || event.currentTarget)) {
                 // Remove any existing first to prevent stack
                 const existing = document.querySelectorAll('.free-upgrade-bubble');
                 existing.forEach(e => e.remove());
                 
                 this.showSmartAdOffer(event.currentTarget || event.target, key);
            }
            this.playNotificationSound(); // Error/Deny sound (reused)
        }
    }
    
    // --- GEM SHOP ---
    renderGemShop() {
        const container = this.els.gemsContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        // Initialize gemUpgrades if not present (legacy saves)
        if (!this.gameState.gemUpgrades) this.gameState.gemUpgrades = {};

        for (const [key, item] of Object.entries(GEM_SHOP_ITEMS)) {
            const isOwned = this.gameState.gemUpgrades[key] === true;
            const canAfford = this.gameState.gems >= item.cost;
            
            const div = document.createElement('div');
            div.className = `upgrade-item ${canAfford && !isOwned ? 'can-afford' : ''}`;
            
            // If owned, maybe style differently
            if (isOwned) {
                div.style.opacity = '0.7';
                div.style.background = '#e8f7eb';
            }
            
            let btnText = `💎 ${item.cost}`;
            if (isOwned) btnText = "OWNED";
            
            let btnClass = `purchase-btn ${canAfford && !isOwned ? 'btn-ready' : ''}`;
            if (isOwned) btnClass = "purchase-btn claimed";

            div.innerHTML = `
                <div class="upgrade-icon-box" style="color: #9b59b6; border-color: #9b59b6;"><i class="fa-solid ${item.icon}"></i></div>
                <div class="upgrade-content">
                    <div class="upgrade-header">
                        <span class="upgrade-name" style="color: #8e44ad;">${item.name}</span>
                    </div>
                    <div class="upgrade-desc">${item.desc}</div>
                </div>
                <button class="${btnClass}" ${canAfford && !isOwned ? '' : 'disabled'}>
                    ${btnText}
                </button>
            `;
            
            if (!isOwned) {
                div.addEventListener('click', (e) => this.buyGemItem(key));
            }
            
            container.appendChild(div);
        }
    }
    
    buyGemItem(key) {
        const item = GEM_SHOP_ITEMS[key];
        if (this.gameState.gemUpgrades[key]) return; // Already owned
        
        if (this.gameState.gems >= item.cost) {
            this.gameState.gems -= item.cost;
            this.gameState.gemUpgrades[key] = true;
            
            // Mega Drone Handling
            if (key === 'mega_drone') {
                 if (!this.gameState.drones) this.gameState.drones = [];
                 this.gameState.drones.push({ tier: 'mega' });
                 this.renderFlyingDrones();
            }

            this.playNotificationSound();
            this.saveGame();
            this.updateDisplay();
            this.renderGemShop();
            
            // Effect
            alert(`${item.name} Acquired!`);
        }
    }
    
    // --- TASKS SYSTEM ---
    checkTaskProgress() {
        let changed = false;
        
        TASKS_DATA.forEach(taskDef => {
            const taskState = this.gameState.tasks[taskDef.id];
            if (taskState.claimed) return; // Already done
            
            let currentVal = 0;
            
            if (taskDef.type === 'clicks') {
                currentVal = this.gameState.totalClicks || 0;
            } else if (taskDef.type === 'money_earned') {
                currentVal = this.gameState.totalMoney;
            } else if (taskDef.type === 'upgrade_level') {
                if (this.gameState.upgrades[taskDef.upgradeKey]) {
                    currentVal = this.gameState.upgrades[taskDef.upgradeKey].level;
                }
            } else if (taskDef.type === 'evolution_stage') {
                currentVal = this.gameState.evolution.stage;
            }
            
            if (currentVal !== taskState.progress) {
                taskState.progress = currentVal;
                changed = true;
            }
        });
        
        if (changed && this.activeTab === 'tasks') {
            this.renderTasks();
        }
    }
    
    claimTask(taskId) {
        const taskDef = TASKS_DATA.find(t => t.id === taskId);
        const taskState = this.gameState.tasks[taskId];
        
        if (taskDef && taskState && !taskState.claimed) {
            if (taskState.progress >= taskDef.target) {
                // Give Reward
                this.gameState.gems += taskDef.reward;
                taskState.claimed = true;
                
                // FX
                this.playNotificationSound();
                this.showCustomRewardModal(taskDef.reward, true); // true for gems
                
                this.saveGame();
                this.updateDisplay();
                this.renderTasks();
            }
        }
    }
    
    renderTasks() {
        const container = this.els.tasksContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        const grid = document.createElement('div');
        grid.className = 'task-grid'; 
        
        // 1. Prepare and Sort Tasks
        const renderList = TASKS_DATA.map(task => {
            const state = this.gameState.tasks[task.id];
            const isCompleted = state.progress >= task.target;
            const isClaimed = state.claimed;
            
            // Assign priority for sorting
            let priority = 1; // Default: Active
            if (isClaimed) priority = 2; // Bottom
            if (isCompleted && !isClaimed) priority = 0; // Top
            
            return { task, state, isCompleted, isClaimed, priority };
        });
        
        // Sort: Claimable (0) -> Active (1) -> Claimed (2)
        // Secondary Sort: Active tasks by % completion (descending)
        renderList.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (a.priority === 1) {
                const pctA = a.state.progress / a.task.target;
                const pctB = b.state.progress / b.task.target;
                return pctB - pctA; // Higher % first
            }
            return a.task.tier - b.task.tier; // Default tier sort
        });
        
        // 2. Render Sorted List
        renderList.forEach(item => {
            const { task, state, isCompleted, isClaimed, priority } = item;
            
            let pct = (state.progress / task.target) * 100;
            if (pct > 100) pct = 100;
            
            const div = document.createElement('div');
            // Add priority class for CSS styling hooks
            let priorityClass = 'priority-active';
            if (priority === 0) priorityClass = 'priority-claim';
            if (priority === 2) priorityClass = 'priority-done';
            
            div.className = `task-item ${priorityClass}`;
            
            let btnHTML = '';
            if (isClaimed) {
                btnHTML = `<button class="task-btn claimed" disabled><i class="fa-solid fa-check"></i> DONE</button>`;
            } else if (isCompleted) {
                btnHTML = `<button class="task-btn claim-ready" onclick="game.claimTask('${task.id}')">CLAIM</button>`;
            } else {
                btnHTML = `<button class="task-btn" disabled>${this.formatNumber(state.progress)} / ${this.formatNumber(task.target)}</button>`;
            }
            
            div.innerHTML = `
                <div class="task-icon"><i class="fa-solid ${task.icon}"></i></div>
                <div class="task-info">
                    <div class="task-desc">${task.desc}</div>
                    <div class="task-reward">Reward: <span class="gem-val">💎 ${task.reward}</span></div>
                    <div class="task-progress-track">
                        <div class="task-progress-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
                <div class="task-action">
                    ${btnHTML}
                </div>
            `;
            grid.appendChild(div);
        });
        
        container.appendChild(grid);
    }

    showSmartAdOffer(targetBtn, key) {
        // --- STRICT SAFETY CHECK ---
        // Absolutely prevent spawning on "Deploy Drone"
        if (key === 'add_drone') return;

        // Remove existing
        const existing = document.querySelectorAll('.free-upgrade-bubble');
        existing.forEach(e => e.remove());

        const bubble = document.createElement('div');
        bubble.className = 'free-upgrade-bubble';
        // Updated casual bubble look
        bubble.innerHTML = `
            <div class="ticket-content">
                <i class="fa-solid fa-gift"></i>
                <span>+2 FREE</span>
            </div>
        `;
        
        // Position relative to button - Overlapping the button slightly
        const rect = targetBtn.getBoundingClientRect();
        // Position it on the right side, tilted
        bubble.style.left = (rect.width - 80) + 'px'; 
        bubble.style.top = '-25px'; 
        
        // Append to the button itself so it moves with it? 
        // No, upgrade list rebuilds often. Append to button parent or body.
        // If we append to body we need absolute coords.
        // Let's append to the button container (the .upgrade-item div)
        // targetBtn is the button. The parent is .upgrade-item
        
        // Actually, the caller passes targetBtn which is the BUTTON or the UPGRADE ITEM?
        // In buyUpgrade: event.currentTarget || event.target.
        // If user clicks button, currentTarget is button.
        // If user clicks item, currentTarget is item.
        
        let container = targetBtn;
        if (!container.classList.contains('upgrade-item')) {
            container = container.closest('.upgrade-item');
        }
        
        if (container) {
            container.style.position = 'relative'; // Ensure relative positioning
            container.appendChild(bubble);
            
            // Override styles for relative positioning
            bubble.style.position = 'absolute';
            bubble.style.left = 'auto';
            bubble.style.right = '10px';
            bubble.style.top = '-15px';
            
            bubble.addEventListener('click', (e) => {
                e.stopPropagation();
                this.watchRewardedAd(`smart_upgrade_${key}`);
                bubble.remove();
            });
            
            // Longer duration: 8 seconds
            setTimeout(() => {
                if (bubble.parentNode) bubble.remove();
            }, 8000);
        }
    }

    spawnMiniUpgradePopup(targetElement) {
        if (!targetElement) return;
        
        const rect = targetElement.getBoundingClientRect();
        // Position at top center of the element
        const x = rect.left + rect.width / 2;
        const y = rect.top; 
        
        const el = document.createElement('div');
        el.className = 'mini-upgrade-pop';
        el.innerHTML = "UP!"; // Simple, small text
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
        document.body.appendChild(el);
        
        // Removed via CSS animation logic or manual timeout
        setTimeout(() => el.remove(), 1000);
    }

    spawnUpgradeFlash() {
        const flash = document.createElement('div');
        flash.className = 'upgrade-flash';
        
        // Default center
        flash.style.left = '50%';
        flash.style.top = '30%';
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);
    }

    getUpgradeCost(key) {
        const upgrade = this.gameState.upgrades[key];
        if (!upgrade) return 999999999;
        
        // --- CUSTOM DRONE LOGIC ---
        if (key === 'add_drone') {
            const count = this.gameState.drones ? this.gameState.drones.length : 0;
            if (count >= 5) return Infinity; // Maxed
            
            // Costs: [500, 10k, 500k, 1.5m, 100m]
            if (count < DRONE_COSTS.length) {
                return DRONE_COSTS[count];
            }
            return 999999999;
        }

        // Discount Upgrade
        const discountUpgrade = this.gameState.upgrades['discount'];
        const discountLevel = discountUpgrade ? discountUpgrade.level : 0;
        const discountPct = Math.min(0.50, discountLevel * 0.02); // Max 50% discount
        
        // Balanced Economy: 1.5x scaling (was 1.4x) to prevent runaway growth
        let cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
        cost = Math.floor(cost * (1 - discountPct));
        
        return Math.max(1, cost);
    }

    getRebirthCost() {
        // Base Cost: 1M
        // Scales 5x each time: 1M, 5M, 25M, 125M...
        const base = 1000000;
        const count = this.gameState.rebirthCount || 0;
        return base * Math.pow(5, count);
    }

    rebirth() {
        const cost = this.getRebirthCost();
        if (this.gameState.money < cost) return;

        // 1. Close Modal
        this.toggleModal('rebirth-modal', false);

        // 2. Trigger Midgame Ad (Interstitial) via CrazyManager
        if (window.CrazyManager) {
            window.CrazyManager.showMidgameAd({
                adStarted: () => {
                    this.stopGameplay();
                },
                adFinished: () => {
                    this.resumeGameplay();
                    this.triggerRebirthSequence();
                },
                adError: (error) => {
                    this.resumeGameplay();
                    this.triggerRebirthSequence();
                }
            });
        } else {
            // Dev Mode
            console.log("Dev: Rebirth Ad Skipped");
            this.triggerRebirthSequence();
        }
    }

    triggerRebirthSequence() {
        // 3. Show Overlay & Animation
        const overlay = document.getElementById('rebirth-overlay');
        const multDisplay = document.getElementById('rebirth-mult-display');
        
        // Visual Update
        const newMult = Math.pow(2, (this.gameState.rebirthCount || 0) + 1);
        if (multDisplay) multDisplay.textContent = `${newMult}X`;
        
        const titleAnim = document.querySelector('.rebirth-title-anim');
        if (titleAnim) titleAnim.textContent = "REBIRTH!";
        
        const subAnim = document.querySelector('.rebirth-sub-anim');
        if (subAnim) subAnim.textContent = "SYSTEM UPGRADED";
        
        if (overlay) {
            overlay.classList.add('active');
            this.fireRebirthConfetti();
            this.playNotificationSound();
            
            setTimeout(() => {
                this.performRebirthReset();
                overlay.classList.remove('active');
            }, 4000);
        } else {
            this.performRebirthReset();
        }
    }

    performRebirthReset() {
        // Increment Rebirth Count
        this.gameState.rebirthCount = (this.gameState.rebirthCount || 0) + 1;
        this.gameState.rebirthMultiplier = Math.pow(2, this.gameState.rebirthCount);

        // RESET GAME STATE
        // Reset Money (Keep Gems)
        this.gameState.money = 0;
        this.gameState.clickPower = 1;
        this.gameState.autoClickPower = 0;
        
        // Reset Standard Upgrades
        for (const key in this.gameState.upgrades) {
            this.gameState.upgrades[key].level = 0;
        }
        
        // Reset Drones - KEEP MEGA DRONES
        if (this.gameState.drones) {
             this.gameState.drones = this.gameState.drones.filter(d => d.tier === 'mega');
        } else {
             this.gameState.drones = [];
        }
        this.gameState.droneLevel = 1;
        
        // Reset Evolution - DISABLED per user request (Persistence)
        // this.gameState.evolution.stage = 0;
        // this.gameState.evolution.xp = 0;
        // this.gameState.evolution.maxXp = 150;
        
        // Reset Heat
        this.heat = 0;
        
        // SAVE & RENDER
        this.saveGame();
        this.updateDisplay();
        this.renderUpgrades();
        this.renderFlyingDrones();
        this.applyRobotVisuals();
    }


    fireRebirthConfetti() {
        const colors = ['#e056fd', '#f1c40f', '#00cec9', '#ff7675', '#ffffff'];
        const count = 100;
        
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'confetti';
            
            // Randomize styling
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.left = Math.random() * 100 + '%';
            el.style.top = '-10px';
            
            // Randomize animation
            const duration = 2 + Math.random() * 3;
            el.style.animationDuration = `${duration}s`;
            el.style.animationDelay = Math.random() * 2 + 's';
            
            // Append to overlay so it's on top
            const overlay = document.getElementById('rebirth-overlay');
            if (overlay) overlay.appendChild(el);
            
            // Cleanup
            setTimeout(() => el.remove(), duration * 1000 + 2000);
        }
    }

    checkNotifications() {
        // Daily
        const dailyBtn = document.getElementById('daily-badge');
        if (dailyBtn) {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const timeSince = now - this.gameState.lastDailyClaim;
            if (timeSince > oneDay) {
                dailyBtn.classList.remove('hidden');
            } else {
                dailyBtn.classList.add('hidden');
            }
        }
        
        // Bonus (Drawer) Badge logic managed by triggerSlidingAd mostly, 
        // but we can ensure it hides if drawer is open?
        const bonusBadge = document.getElementById('bonus-badge');
        if (bonusBadge && this.els.bonusDrawer && this.els.bonusDrawer.classList.contains('open')) {
             bonusBadge.classList.add('hidden');
             bonusBadge.classList.remove('active-pulse');
        }
        
        // Index
        if (this.gameState.lastViewedRobotCount === undefined) {
            this.gameState.lastViewedRobotCount = this.gameState.unlockedRobots.length;
        }
        const indexBadge = document.getElementById('index-badge');
        if (indexBadge) {
            if (this.gameState.unlockedRobots.length > this.gameState.lastViewedRobotCount) {
                indexBadge.classList.remove('hidden');
            } else {
                indexBadge.classList.add('hidden');
            }
        }

        // Tasks Notification
        let hasCompletedTasks = false;
        TASKS_DATA.forEach(task => {
            const state = this.gameState.tasks[task.id];
            if (state && !state.claimed && state.progress >= task.target) {
                hasCompletedTasks = true;
            }
        });
        
        if (this.els.tasksBadge) {
            if (hasCompletedTasks) {
                this.els.tasksBadge.classList.remove('hidden');
                this.els.tasksBadge.classList.add('active-pulse');
            } else {
                this.els.tasksBadge.classList.add('hidden');
                this.els.tasksBadge.classList.remove('active-pulse');
            }
        }
    }

    // --- VISUALS ---

    updateDisplay() {
        this.updateHUD();
        this.updateFusionUI();
        this.checkNotifications();
        this.updateUpgradeAffordability();
        
        const rebirthCost = this.getRebirthCost();
        const canRebirth = this.gameState.money >= rebirthCost;
        
        // PRESTIGE BUTTON UPDATE
        if (this.els.rebirthBtn) {
             const cost = this.getRebirthCost();
             const canAfford = this.gameState.money >= cost;
             
             // Removed icon as per request
             this.els.rebirthBtn.innerHTML = `REBIRTH <span class="rebirth-cost">$${this.formatNumber(cost)}</span>`;
             
             // Always show Rebirth button as per user request
             this.els.rebirthBtn.style.display = 'block';
             
             if (canAfford) {
                 this.els.rebirthBtn.classList.add('rebirth-glow');
                 this.els.rebirthBtn.style.filter = ''; // Remove inline filter
             } else {
                 this.els.rebirthBtn.classList.remove('rebirth-glow');
                 this.els.rebirthBtn.style.filter = ''; // Let CSS handle it
             }
        }

        // Update Heat Meter (Energy Core)
        if (this.els.heatFillBar) {
            // Use 100 as max heat
            const pct = Math.min(100, (this.heat / 100) * 100); 
            this.els.heatFillBar.style.width = '100%'; 
            this.els.heatFillBar.style.height = `${pct}%`; // Vertical
            
            // Color Shift
            this.els.heatFillBar.className = 'heat-fill-bar'; // Reset
            if (pct > 50) this.els.heatFillBar.classList.add('med');
            if (pct > 80) this.els.heatFillBar.classList.add('high');
            
            if (this.els.heatPercent) this.els.heatPercent.textContent = `${Math.floor(pct)}%`;
            
            // Bulb Logic
            if (this.els.heatBulb) {
                 if (pct >= 98) this.els.heatBulb.classList.add('active');
                 else this.els.heatBulb.classList.remove('active');
            }

            // Lightning at max
            if (pct >= 98) {
                this.els.heatLightning.classList.remove('hidden');
            } else {
                this.els.heatLightning.classList.add('hidden');
            }
        }
    }

    updateUpgradeAffordability() {
        const container = this.els.upgradesContainer;
        if (!container) return;

        const items = container.querySelectorAll('.upgrade-item');
        // Only update standard upgrades if we are in upgrade tab
        if (this.activeTab !== 'upgrades') {
            // But if we are in Gems tab, we might want to update gems UI?
            if (this.activeTab === 'gems') {
                const gemItems = this.els.gemsContainer.querySelectorAll('.upgrade-item');
                gemItems.forEach(item => {
                   const btn = item.querySelector('.purchase-btn');
                   if (btn && btn.classList.contains('claimed')) return; // Ignore owned
                   
                   // Need to re-check cost from button text or data
                   // Simpler to just re-render or do robust binding, but for now re-render handles most
                });
            }
            return; 
        }

        let index = 0;
        for (const [key, upgrade] of Object.entries(this.gameState.upgrades)) {
            if (index >= items.length) break;
            
            const cost = this.getUpgradeCost(key);
            
            // Handle MAX
            if (cost === Infinity) {
                const item = items[index];
                item.classList.remove('can-afford');
                const btn = item.querySelector('.purchase-btn');
                if (btn) {
                    btn.textContent = "MAXED";
                    btn.disabled = true;
                    btn.classList.remove('btn-ready');
                }
                index++;
                continue;
            }

            const canAfford = this.gameState.money >= cost;
            const item = items[index];
            const btn = item.querySelector('.purchase-btn');

            if (canAfford) {
                item.classList.add('can-afford');
                if (btn) {
                    btn.classList.add('btn-ready');
                    btn.disabled = false;
                    // Update Cost display dynamic
                    if (!btn.textContent.includes("MAXED")) {
                        btn.textContent = `$${this.formatNumber(cost)}`;
                    }
                }
                item.style.cursor = 'pointer';
            } else {
                item.classList.remove('can-afford');
                if (btn) {
                    btn.classList.remove('btn-ready');
                    btn.disabled = true;
                    if (!btn.textContent.includes("MAXED")) {
                        btn.textContent = `$${this.formatNumber(cost)}`;
                    }
                }
                item.style.cursor = 'default';
            }
            index++;
        }
    }

    updateHUD() {
        this.els.money.textContent = this.formatNumber(Math.floor(this.gameState.money));
        if (this.els.gems) this.els.gems.textContent = this.formatNumber(Math.floor(this.gameState.gems));
        
        // Update Click Value Stat (Base Power)
        if (this.els.botValue) {
             this.els.botValue.textContent = this.formatNumber(this.getClickPower());
        }

        // Update Multiplier Stat (Global)
        if (this.els.multiplierStat) {
             const mult = this.getGlobalMultiplier();
             this.els.multiplierStat.textContent = `${this.formatNumber(mult)}x`;
        }

        // this.els.totalBots.textContent = this.formatNumber(this.gameState.totalBotsDeployed);
    }

    updateFusionUI() {
        // Evolution Bar
        let pct = (this.gameState.evolution.xp / this.gameState.evolution.maxXp) * 100;
        if (pct > 100) pct = 100;
        this.els.fusionFill.style.width = `${pct}%`;
        if (this.els.evoPercent) {
            this.els.evoPercent.textContent = `${Math.floor(pct)}%`;
        }

        // Update Next Bot Preview
        const nextPreviewName = document.querySelector('.evo-target-name');
        const nextMultEl = document.getElementById('next-evo-mult');
        
        if (nextPreviewName) {
            const nextStage = this.gameState.evolution.stage + 1;
            if (nextStage < ROBOT_TIERS.length) {
                nextPreviewName.textContent = ROBOT_TIERS[nextStage].name;
                document.querySelector('.evo-target-label').textContent = "NEXT GOAL";
                document.querySelector('.evo-target-icon').textContent = "🔒";
                
                if (nextMultEl) {
                    nextMultEl.textContent = `${this.formatNumber(ROBOT_TIERS[nextStage].multiplier)}X`;
                    nextMultEl.style.display = 'inline-block';
                }
            } else {
                nextPreviewName.textContent = "MAXED OUT";
                document.querySelector('.evo-target-label').textContent = "COMPLETED";
                document.querySelector('.evo-target-icon').textContent = "👑";
                
                if (nextMultEl) nextMultEl.style.display = 'none';
            }
        }
    }

    spawnGoldenDrone() {
        const drone = document.createElement('div');
        drone.className = 'golden-drone';
        
        // Random start position (Vertical)
        // Keep it somewhat central so it doesn't get clipped
        const startY = 10 + Math.random() * 60; // 10% to 70%
        
        drone.style.top = `${startY}%`;
        drone.style.left = '100%'; // Start at right edge
        
        // Parachute Structure
        drone.innerHTML = `
            <div class="parachute-assembly">
                <div class="parachute-canopy"></div>
                <div class="parachute-strings">
                    <div class="p-string s1"></div>
                    <div class="p-string s2"></div>
                    <div class="p-string s3"></div>
                </div>
                <div class="parachute-payload">
                    <div class="gold-crate">
                        <div class="shine"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Animation to fly across (Right to Left)
        const duration = 8000; // 8 seconds to cross
        const keyframes = [
            { transform: `translateX(0)` },
            { transform: `translateX(-120vw)` } // Fly to left
        ];
        
        const anim = drone.animate(keyframes, {
            duration: duration,
            easing: 'linear'
        });
        
        anim.onfinish = () => drone.remove();
        
        // Click Event
        drone.addEventListener('click', (e) => {
            e.stopPropagation();
            if (drone.classList.contains('clicked')) return;
            
            drone.classList.add('clicked');
            anim.pause();
            
            // Reward: 20% of current money or 5 mins of income
            // Balanced: 50x Click Power * Multiplier * 100 (Big Burst)
            const reward = this.getClickPower() * this.getGlobalMultiplier() * 500; 
            
            this.addMoney(reward);
            this.playNotificationSound();
            this.spawnDamageNumber(`+$${this.formatNumber(reward)}`, e.clientX, e.clientY, '#FFD700');
            
            setTimeout(() => drone.remove(), 600);
        });
        
        document.body.appendChild(drone);
    }

    applyRobotVisuals() {
        if (!this.els.hero) return;
        
        // Remove old tier classes
        this.els.hero.className = 'hero-robot'; 
        
        // Add new tier class
        const tierIndex = this.gameState.evolution.stage;
        this.els.hero.classList.add(`tier-${tierIndex}`);
        
        // Add visual flair
        this.els.hero.classList.add('evolve-anim');
        setTimeout(() => this.els.hero.classList.remove('evolve-anim'), 1000);
        
        this.updateFusionUI();
    }

    evolveRobot() {
        const currentStage = this.gameState.evolution.stage;
        const nextStage = currentStage + 1;
        
        if (nextStage >= ROBOT_TIERS.length) return; // Maxed
        
        // Logic
        this.gameState.evolution.stage = nextStage;
        this.gameState.evolution.xp = 0;
        // Made easier: Scaling reduced from 1.5 to 1.35
        this.gameState.evolution.maxXp = Math.floor(this.gameState.evolution.maxXp * 1.35); 
        
        // Unlock
        if (!this.gameState.unlockedRobots.includes(nextStage)) {
            this.gameState.unlockedRobots.push(nextStage);
        }
        
        this.applyRobotVisuals();
        this.saveGame();
        
        // Visuals
        this.playNotificationSound();
        this.triggerEvolutionModal(nextStage);
    }

    triggerEvolutionModal(tierIndex) {
        const tier = ROBOT_TIERS[tierIndex];
        const modal = document.getElementById('evolution-modal');
        if (!modal) return;
        
        // Inject Content
        const nameEl = document.getElementById('evo-new-name');
        if (nameEl) nameEl.textContent = tier.name;
        
        const multEl = document.getElementById('evo-mult-val');
        if (multEl) multEl.textContent = `x${this.formatNumber(tier.multiplier)}`;
        
        // Robot Visual
        const visualContainer = modal.querySelector('.evo-new-robot');
        if (visualContainer) {
            visualContainer.innerHTML = this.getMiniRobotHTML(tierIndex);
            // Make it big
            const bot = visualContainer.querySelector('.hero-robot');
            if (bot) bot.style.transform = 'scale(1.5)';
        }
        
        this.toggleModal('evolution-modal', true);
    }

    triggerMoneyBounce() {
        this.els.currencyContainer.classList.remove('bounce');
        void this.els.currencyContainer.offsetWidth; 
        this.els.currencyContainer.classList.add('bounce');
    }

    renderUpgrades() {
        // Save scroll position
        const scrollPos = this.els.upgradesContainer.scrollTop;
        
        this.els.upgradesContainer.innerHTML = '';
        
        // --- UPDATED ICONS (FontAwesome) ---
        const icons = {
            'Click Value': '<i class="fa-solid fa-arrow-pointer"></i>',
            'add_drone': '<i class="fa-solid fa-helicopter"></i>', // Drone Icon
            'upgrade_drone': '<i class="fa-solid fa-bolt"></i>', // Power Icon
            'crit_money': '<i class="fa-solid fa-crosshairs"></i>',
        };

        for (const [key, upgrade] of Object.entries(this.gameState.upgrades)) {
            // Skip rendering xp_boost
            if (key === 'xp_boost') continue;

            const cost = this.getUpgradeCost(key);
            const canAfford = this.gameState.money >= cost && cost !== Infinity;
            
            // Dynamic Name/Desc for Drone
            let displayName = upgrade.name;
            let displayDesc = upgrade.desc;
            let btnText = `$${this.formatNumber(cost)}`;
            
            if (key === 'add_drone') {
                 const count = this.gameState.drones ? this.gameState.drones.length : 0;
                 if (count >= 5) {
                     btnText = "MAXED";
                     displayDesc = "Maximum Drones Deployed (5/5)";
                 } else {
                     displayDesc = `Deploy Drone ${count + 1}/5`;
                 }
            }

            const div = document.createElement('div');
            // Explicitly set 'can-afford' class based on logic
            div.className = `upgrade-item ${canAfford ? 'can-afford' : ''}`;
            div.setAttribute('data-key', key); // Essential for Smart Ad Targeting
            div.innerHTML = `
                <div class="upgrade-icon-box">${icons[key] || '<i class="fa-solid fa-wrench"></i>'}</div>
                <div class="upgrade-content">
                    <div class="upgrade-header">
                        <span class="upgrade-name">${displayName}</span>
                        <!-- Level hidden via CSS -->
                        <span class="upgrade-level">Lv. ${upgrade.level}</span>
                    </div>
                    <div class="upgrade-desc">${displayDesc}</div>
                </div>
                <button class="purchase-btn ${canAfford ? 'btn-ready' : ''}" ${canAfford ? '' : 'disabled'}>
                    ${btnText}
                </button>
            `;
            
            div.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling
                this.buyUpgrade(key, e);
            });
            
            // Always allow clicking the card, logic inside checks money
            div.addEventListener('click', (e) => this.buyUpgrade(key, e));
            
            // Initial visual state
            if (canAfford) {
                div.style.cursor = 'pointer';
            } else {
                div.style.cursor = 'default';
            }

            this.els.upgradesContainer.appendChild(div);
        }
        
        // Restore scroll
        this.els.upgradesContainer.scrollTop = scrollPos;
    }

    renderRobotIndex() {
        const container = document.getElementById('robot-index-grid');
        container.innerHTML = '';
        
        ROBOT_TIERS.forEach((tier, index) => {
            const unlocked = this.gameState.unlockedRobots.includes(index);
            const div = document.createElement('div');
            
            // Rarity class for border color
            const rarityClass = `rarity-${tier.rarity.toLowerCase()}`;
            div.className = `index-card ${unlocked ? 'unlocked' : 'locked'} ${rarityClass}`;
            
            let visualHTML = '';
            
            if (unlocked) {
                // Render the actual robot
                visualHTML = `
                    <div class="index-visual-container">
                        <div class="index-rarity-badge">${tier.rarity}</div>
                        <div class="mini-robot-wrapper">
                            ${this.getMiniRobotHTML(index)}
                        </div>
                    </div>
                `;
            } else {
                // Render Mystery Box + Lock
                visualHTML = `
                    <div class="index-visual-container" style="background: transparent; border: none; box-shadow: none;">
                        <div class="mystery-box box-${tier.rarity.toLowerCase()}">
                            <div class="mystery-q">?</div>
                        </div>
                        <div class="toon-lock">
                            <div class="lock-shackle"></div>
                            <div class="lock-body">
                                <div class="lock-keyhole"></div>
                            </div>
                        </div>
                    </div>
                `;
            }

            div.innerHTML = `
                ${visualHTML}
                <div class="index-info">
                    <div class="index-name">${unlocked ? tier.name : 'LOCKED'}</div>
                    <div class="index-desc">${unlocked ? `x${this.formatNumber(tier.multiplier)} Multiplier` : `${tier.rarity} Tier`}</div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    getMiniRobotHTML(tierIndex) {
        // Re-uses the hero-robot HTML structure but with the specific tier class
        const tierClass = `tier-${tierIndex}`;
        return `
            <div class="hero-robot ${tierClass}" style="cursor: default;">
                <div class="robot-glow"></div>
                <!-- Antenna Removed -->
                <div class="robot-head">
                    <div class="robot-visor"></div>
                    <div class="robot-eyes">
                        <div class="eye left"></div>
                        <div class="eye right"></div>
                    </div>
                </div>
                <div class="robot-neck"></div>
                <div class="robot-body">
                    <div class="chest-plate">
                        <div class="core-light"></div>
                    </div>
                </div>
                <div class="robot-shoulders"></div>
                <div class="robot-arms">
                    <div class="arm left"><div class="hand"></div></div>
                    <div class="arm right"><div class="hand"></div></div>
                </div>
            </div>
        `;
    }

    spawnMoneyParticle(amount, x, y) {
        // ... existing code ...
        // Keeping this for compatibility or removing if user strictly said "integrate when user clicks robot, not a splash animations"
        // The user said: "integrate when user clicks robot, not a splash animations, make so when user clicks robot animated satisfying bolts and screws fly out"
        // I will keep money particle (floating text) because it's vital feedback, but I will modify clickHero to NOT call spawnClickRipple and instead call spawnBoltParticle.
        // So this method stays as is, but I'll add the new ones below it.
        const rect = this.els.currencyContainer.getBoundingClientRect();
        const targetX = rect.left + (rect.width / 2);
        const targetY = rect.top + (rect.height / 2);

        const el = document.createElement('div');
        el.className = 'flying-cash';
        el.textContent = '💸'; 
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = '2rem'; 
        document.body.appendChild(el);

        const animation = el.animate([
            { transform: 'translate(0, 0) scale(0.5)', opacity: 1 },
            { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(1)`, opacity: 0.5 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        animation.onfinish = () => {
            el.remove();
            this.triggerMoneyBounce();
        };
    }

    spawnBoltParticle(x, y) {
        const count = 4 + Math.floor(Math.random() * 4); // 4 to 7 particles
        
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            // 50% chance for screw
            const isScrew = Math.random() > 0.5;
            el.className = `bolt-particle ${isScrew ? 'screw' : ''}`;
            
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            
            // Random Initial Rotation
            const startRot = Math.random() * 360;
            el.style.transform = `rotate(${startRot}deg)`;
            
            document.body.appendChild(el);
            
            // Random Physics
            const angle = Math.random() * Math.PI * 2;
            const velocity = 80 + Math.random() * 150; // Faster
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity; // Fly out
            const endRot = startRot + (Math.random() * 720 - 360); // Spin wild
            
            const anim = el.animate([
                { transform: `translate(0, 0) rotate(${startRot}deg) scale(0.5)`, opacity: 1 },
                { transform: `translate(${tx * 0.5}px, ${ty * 0.5}px) rotate(${startRot + (endRot-startRot)*0.5}deg) scale(1.2)`, opacity: 1, offset: 0.4 },
                { transform: `translate(${tx}px, ${ty + 150}px) rotate(${endRot}deg) scale(1)`, opacity: 0 } // +150y for heavier gravity
            ], {
                duration: 800 + Math.random() * 300,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            anim.onfinish = () => el.remove();
        }
    }

    spawnUpgradedPopup(targetElement) {
        // Disabled as per request
    }

    spawnCriticalPopup(x, y) {
        const el = document.createElement('div');
        el.className = 'damage-number'; // Reuse damage number styling but bigger
        el.textContent = "2X!";
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = '4rem';
        el.style.color = '#e74c3c'; // Red
        el.style.zIndex = '3000';
        el.style.textShadow = '0 0 10px #000';
        
        // Custom animation
        const rot = (Math.random() * 40) - 20;
        el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0.5)`;
        
        document.body.appendChild(el);
        
        const anim = el.animate([
            { transform: `translate(-50%, -50%) rotate(${rot}deg) scale(0.5)`, opacity: 0 },
            { transform: `translate(-50%, -150%) rotate(${rot}deg) scale(1.5)`, opacity: 1, offset: 0.3 },
            { transform: `translate(-50%, -300%) rotate(${rot}deg) scale(1)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        anim.onfinish = () => el.remove();
    }


    spawnDamageNumber(amount, x, y, color = null) {
        const el = document.createElement('div');
        el.className = 'damage-number';
        el.textContent = isNaN(amount) ? amount : `+$${this.formatNumber(amount)}`; // Support text or number
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        if (color) el.style.color = color;
        
        // Randomize rotation slightly for "cool" messy feel
        const rot = (Math.random() * 20) - 10;
        el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
        
        document.body.appendChild(el);

        // Remove after animation (0.8s defined in CSS)
        setTimeout(() => el.remove(), 800);
    }

    spawnClickRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 500);
    }

    animateHero() {
        this.els.hero.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.els.hero.style.transform = 'scale(1)';
        }, 50);
    }

    triggerRobotPersonality() {
        // Only if not currently animating (check classes)
        const hero = this.els.hero;
        if (hero.classList.contains('anim-breathe') || 
            hero.classList.contains('anim-look-left') || 
            hero.classList.contains('anim-look-right') || 
            hero.classList.contains('anim-shiver') ||
            hero.classList.contains('glitch')) return;

        const animations = [
            { class: 'anim-breathe', duration: 2000 },
            { class: 'anim-look-left', duration: 1000 },
            { class: 'anim-look-right', duration: 1000 },
            { class: 'anim-shiver', duration: 500 },
            { class: 'glitch', duration: 300 }
        ];

        const anim = animations[Math.floor(Math.random() * animations.length)];
        
        hero.classList.add(anim.class);
        setTimeout(() => {
            hero.classList.remove(anim.class);
        }, anim.duration);
    }

    toggleModal(modalId, show) {
        this.els.modalOverlay.classList.toggle('hidden', !show);
        document.querySelectorAll('.game-modal').forEach(m => m.classList.add('hidden'));
        if (show) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('hidden');
                
                // Special handling for Index Modal
                if (modalId === 'index-modal') {
                    this.renderRobotIndex();
                    // Clear notification
                    if (this.gameState.unlockedRobots.length > (this.gameState.lastViewedRobotCount || 0)) {
                        this.gameState.lastViewedRobotCount = this.gameState.unlockedRobots.length;
                        this.saveGame();
                        this.checkNotifications();
                    }
                }
            }
        }
    }

    toggleBonusDrawer() {
        this.els.bonusDrawer.classList.toggle('open');
        if (!this.gameState.hasOpenedDrawer) {
            this.gameState.hasOpenedDrawer = true;
            this.saveGame();
        }
    }
    
    toggleDailyDrawer() {
        // Legacy function, replaced by modal
        this.toggleModal('daily-rewards-modal', true);
    }

    watchRewardedAd(type, callbacks = {}) {
        // Cooldown Check
        const now = Date.now();
        if (this.adManager.cooldowns && this.adManager.cooldowns[type]) {
            if (now < this.adManager.cooldowns[type]) {
                alert("Ad is on cooldown!");
                return;
            }
        }

        this.adManager.requestedType = type;
        console.log(`[AdManager] Requesting ad for: ${type}`);
        
        // Use CrazySDKManager
        if (window.CrazyManager) {
            window.CrazyManager.showRewardedAd({
                adStarted: () => {
                    this.stopGameplay(); // Game-specific pause logic (audio)
                },
                adFinished: () => {
                    this.grantReward(type);
                    this.resumeGameplay();
                    if (callbacks.onFinish) callbacks.onFinish();
                },
                adError: (error) => {
                    this.resumeGameplay();
                    alert("Ad failed to load. Please try again later.");
                    if (callbacks.onError) callbacks.onError(error);
                }
            });
        } else {
            // Dev Fallback
            console.log("Dev Mode: Ad Watched (No SDK)");
            this.grantReward(type);
            if (callbacks.onFinish) callbacks.onFinish();
        }
    }

    // Alias for HTML onclicks
    watchAd(type) {
        this.watchRewardedAd(type);
    }

    // --- ADS & BONUSES ---

    stopGameplay() {
        // Mute Audio
        if (this.audioCtx && this.audioCtx.state === 'running') {
            this.audioCtx.suspend();
        }
        // CrazyManager handles SDK gameplayStop
    }

    resumeGameplay() {
        // Unmute Audio
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        // CrazyManager handles SDK gameplayStart
    }

    startAdCooldown(type) {
        if (!this.adManager.cooldowns) this.adManager.cooldowns = {};
        const duration = 180000; // 3 minutes
        this.adManager.cooldowns[type] = Date.now() + duration;
        
        // Find button - Robust Selector (Data Attribute -> Onclick Fallback)
        let btn = document.querySelector(`.bonus-btn[data-ad-type="${type}"]`);
        if (!btn) {
             btn = document.querySelector(`.bonus-btn[onclick="game.watchAd('${type}')"]`);
        }

        if (btn) {
            const originalText = btn.innerHTML; // Use innerHTML to keep icon
            btn.disabled = true;
            btn.classList.add('cooldown-active');
            
            const interval = setInterval(() => {
                const remaining = this.adManager.cooldowns[type] - Date.now();
                if (remaining <= 0) {
                    clearInterval(interval);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.remove('cooldown-active');
                } else {
                    const m = Math.floor(remaining / 60000);
                    const s = Math.floor((remaining % 60000) / 1000);
                    btn.textContent = `WAIT ${m}:${s.toString().padStart(2, '0')}`;
                }
            }, 1000);
        }
    }

    grantReward(type) {
        let msg = "";
        const now = Date.now();
        
        // Start Cooldown for button-based ads
        if (type === 'turbo' || type === 'auto' || type === 'lucky') {
            this.startAdCooldown(type);
        }

        if (type === 'turbo') {
            // 1 Minute Boost
            this.adManager.boosts['turbo'] = now + 60000;
            msg = "TURBO SURGE: 3x Income for 1 Minute!";
            // this.toggleBonusDrawer(); // Removed per request
        } else if (type === 'auto') {
            // 30 Seconds Boost
            this.adManager.boosts['auto'] = now + 30000;
            msg = "OVERCLOCK: 10x Speed for 30 Seconds!";
             // this.toggleBonusDrawer(); // Removed per request
        } else if (type === 'lucky') {
            // New Logic: 30% of CURRENT CASH
            const reward = Math.floor(this.gameState.money * 0.30); 
            this.addMoney(reward);
            
            // Custom UI for Lucky Strike
            this.showCustomRewardModal(reward);
            // this.toggleBonusDrawer(); // Removed per request
            return; // Skip default alert
        } else if (type === 'auto_clicker') {
            // Auto Clicker Ad: 30s of clicks
            this.adManager.boosts['auto_clicker'] = now + 30000;
            msg = "AUTO CLICKER: Bot Swarm Activated!";
            // this.toggleBonusDrawer(); // Removed per request
        } else if (type === 'offline_2x') {
             if (this.adManager.pendingOfflineAmount) {
                 this.addMoney(this.adManager.pendingOfflineAmount * 2);
                 this.adManager.pendingOfflineAmount = 0;
                 this.toggleModal('offline-modal', false);
                 msg = "Offline Earnings Doubled!";
             }
        } else if (type.startsWith('smart_upgrade_')) {
            const key = type.replace('smart_upgrade_', '');
            if (this.gameState.upgrades[key]) {
                this.gameState.upgrades[key].level += 2; // 2 Free Levels
                
                // Drone check
                if (key === 'add_drone') {
                    this.addDrone(this.gameState.droneLevel || 1);
                    this.addDrone(this.gameState.droneLevel || 1);
                }
                
                // NEW: Show Reward UI Modal
                this.showCustomRewardModal(2, false, "2x FREE UPGRADES RECEIVED!");
                
                this.updateDisplay();
                this.renderUpgrades();
                this.saveGame();
            }
        }
        
        // Removed standard alert for better flow, using UI instead
        if (msg) console.log(msg); // Log instead of blocking alert
    }

    showCustomRewardModal(amount, isGems = false, customTitle = null) {
        // Reuse reward modal structure or create dynamic one
        // We can use the existing reward-modal logic if we inject content
        const overlay = document.createElement('div');
        overlay.className = 'reward-modal-overlay';
        const symbol = isGems ? '💎' : (customTitle ? '' : '$');
        const colorClass = isGems ? 'color: #9b59b6;' : 'color: var(--success);';
        
        let label = isGems ? 'GEMS' : 'CASH';
        let title = isGems ? 'TASK COMPLETE!' : 'LUCKY STRIKE!';
        
        // Handle Custom Title (e.g. Free Upgrades)
        if (customTitle) {
            title = "REWARD RECEIVED!";
            label = customTitle;
        }

        let valueDisplay = `${symbol}${this.formatNumber(amount)}`;
        if (customTitle && !isGems) {
             valueDisplay = `+${amount} LEVELS`; // Specific for upgrades
        }
        
        overlay.innerHTML = `
            <div class="reward-modal-content">
                <h2>${title}</h2>
                <div style="font-size: 1.2rem; color: #555;">YOU HAVE RECEIVED</div>
                <div class="reward-value" style="${colorClass}">${valueDisplay}</div>
                <div style="font-size: 1.2rem; color: #555;">${label}</div>
                <button class="reward-claim-btn" onclick="this.closest('.reward-modal-overlay').remove()">AWESOME!</button>
            </div>
        `;
        document.body.appendChild(overlay);
        this.playNotificationSound();
    }

    // --- OFFLINE EARNINGS ---
    checkOfflineEarnings() {
        const now = Date.now();
        const lastSave = this.gameState.lastSave;
        const diff = now - lastSave;
        
        // Minimum 1 minute (60000ms) to trigger - User Friendly
        if (diff > 60000) {
            const seconds = Math.floor(diff / 1000);
            
            // Calculate earnings
            // 1. Drones (Main source since Auto Upgrades removed)
            const droneLvl = this.gameState.droneLevel || 1;
            const allDrones = this.gameState.drones || [];
            
            let regularCount = 0;
            let megaCount = 0;
            
            allDrones.forEach(d => {
                if (d.tier === 'mega') megaCount++;
                else regularCount++;
            });

            const clickPower = this.getClickPower();
            
            // Avg Shots Per Sec: (0.1 + lvl*0.02) * 10 (ticks)
            let fireChance = 0.1 + (droneLvl * 0.02);
            if (fireChance > 0.6) fireChance = 0.6; // Cap
            const shotsPerSec = fireChance * 10;
            
            // Damage Per Shot: 200% Click Power (2x User Click)
            const baseDmg = Math.max(10, clickPower * 2);
            
            const regularIncome = regularCount * shotsPerSec * baseDmg;
            const megaIncome = megaCount * shotsPerSec * (baseDmg * 50); // 50x for Mega
            
            const droneIncomePerSec = regularIncome + megaIncome;

            // 2. Multipliers
            // We use getGlobalMultiplier() but we need to exclude TEMPORARY boosts like Turbo
            // Reconstruct permanent multiplier:
            let globalMult = 1;
            globalMult *= this.gameState.rebirthMultiplier;
            globalMult *= ROBOT_TIERS[this.gameState.evolution.stage].multiplier;
            
            const passiveUpgrade = this.gameState.upgrades['passive_mult'];
            if (passiveUpgrade) globalMult *= (1 + (passiveUpgrade.level * passiveUpgrade.basePower));
            
            globalMult *= this.getDroneBoost();
            
            if (this.gameState.prestige) {
                 globalMult *= (1 + (this.gameState.prestige.points * 0.10));
                 const synLevel = this.gameState.prestige.upgrades['pp_mult'] || 0;
                 if (synLevel > 0) globalMult *= (1 + (synLevel * 0.5));
            }

            const totalPerSec = droneIncomePerSec * globalMult;
            const totalOffline = Math.floor(totalPerSec * seconds * 0.5); // 50% efficiency for offline
            
            if (totalOffline > 0) {
                this.adManager.pendingOfflineAmount = totalOffline;
                
                // Format Time
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                
                document.getElementById('offline-time').textContent = `${h}h ${m}m`;
                document.getElementById('offline-earnings').textContent = `$${this.formatNumber(totalOffline)}`;
                
                this.toggleModal('offline-modal', true);
            }
        }
    }

    // --- DAILY REWARDS (INFINITE SCROLL) ---
    checkDailyReward(autoOpen = true) {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const timeSince = now - this.gameState.lastDailyClaim;

        // Reset if missed a day (allow 48h window)
        if (timeSince > oneDay * 2) this.gameState.dailyStreak = 0;

        const currentStreak = this.gameState.dailyStreak;
        const isClaimable = timeSince > oneDay;
        
        // Base reward calculation
        const productionPerSec = this.getAutoPower() + (this.getClickPower() * 2);
        const playerPower = Math.max(100, productionPerSec * 60);
        
        if (this.els.dailyGrid) {
            this.els.dailyGrid.innerHTML = '';
        }

        // Show a window of days
        const startDay = currentStreak; 
        const numToShow = 5; 

        for (let i = 0; i < numToShow; i++) {
            const dayIndex = startDay + i;
            const rewardType = this.getDailyRewardType(dayIndex);
            const val = this.getDailyRewardValue(dayIndex, playerPower);
            
            const el = document.createElement('div');
            const isCurrent = (i === 0);
            
            // Class determines styling
            let stateClass = 'future-day';
            if (isCurrent) {
                stateClass = isClaimable ? 'active-ready' : 'active-locked';
            }
            
            el.className = `day-card-infinite ${stateClass} type-${rewardType}`;
            
            // NEW: Gift Icon System
            let iconHtml = '<i class="fa-solid fa-gift"></i>';
            let label = `$${this.formatNumber(val)}`;
            
            if (rewardType === 'buff_speed') { 
                iconHtml = '<i class="fa-solid fa-gift" style="color: #00ffff;"></i>'; // Cyan Gift
                label = '2x SPD'; 
            }
            if (rewardType === 'big_cash') { 
                iconHtml = '<i class="fa-solid fa-gifts" style="color: #FFD700;"></i>'; // Gold Gifts
                label = 'JACKPOT'; 
            }
            
            // Special Visuals for the Claimable Reward
            if (isCurrent && isClaimable) {
                 iconHtml = '<i class="fa-solid fa-box-open fa-bounce" style="color: #00ff00;"></i>'; // Green Open Box
                 label = "OPEN ME!";
            } else if (isCurrent && !isClaimable) {
                // Locked/Waiting state
                iconHtml = '<i class="fa-solid fa-lock"></i>';
            }
            
            el.innerHTML = `
                <div class="day-header">Day ${dayIndex + 1}</div>
                <div class="day-icon-large">${iconHtml}</div>
                <div class="day-reward-text">${label}</div>
            `;
            if (this.els.dailyGrid) this.els.dailyGrid.appendChild(el);
        }

        if (isClaimable) {
            if (this.els.claimDailyBtn) {
                this.els.claimDailyBtn.disabled = false;
                this.els.claimDailyBtn.textContent = "CLAIM REWARD";
                this.els.claimDailyBtn.classList.add('pulse-btn-green');
            }
            if (this.els.dailyTimer) this.els.dailyTimer.classList.add('hidden');
            
            if (autoOpen) {
                this.toggleModal('daily-rewards-modal', true);
            }
            
            if (this.els.dailyBadge) this.els.dailyBadge.classList.remove('hidden');
            if (this.els.dailyRewardBtn) this.els.dailyRewardBtn.classList.add('pulse-btn');
            
        } else {
            if (this.els.claimDailyBtn) {
                this.els.claimDailyBtn.disabled = true;
                this.els.claimDailyBtn.textContent = "COME BACK LATER";
                this.els.claimDailyBtn.classList.remove('pulse-btn-green');
            }
            if (this.els.dailyTimer) {
                this.els.dailyTimer.classList.remove('hidden');
                this.updateDailyTimer();
            }
            
            if (this.els.dailyBadge) this.els.dailyBadge.classList.add('hidden');
            if (this.els.dailyRewardBtn) this.els.dailyRewardBtn.classList.remove('pulse-btn');
        }
    }

    getDailyRewardType(dayIndex) {
        // Pattern: Cash, Cash, Buff, Cash, Cash, Big Cash
        if ((dayIndex + 1) % 6 === 0) return 'big_cash';
        if ((dayIndex + 1) % 3 === 0) return 'buff_speed';
        return 'cash';
    }

    getDailyRewardValue(dayIndex, basePower) {
        // Dynamic scaling: Should be relevant to user's CURRENT status
        // If user has 1M cash, getting 100 is useless.
        // Scale against whichever is higher: Production or % of Current Cash
        
        const productionScale = basePower; // Already derived from 1 min of production
        
        // 50% of current cash as baseline for daily reward (MEGA BUFFED)
        const cashScale = this.gameState.money * 0.50;
        
        const baseValue = Math.max(productionScale, cashScale);
        
        // Ensure minimum 500
        const finalBase = Math.max(500, baseValue);

        // Stronger Streak Bonus: 25% per day instead of 15%
        const streakBonus = 1 + (dayIndex * 0.25); 
        
        if ((dayIndex + 1) % 6 === 0) return Math.floor(finalBase * 5 * streakBonus); // Jackpot (5x)
        return Math.floor(finalBase * streakBonus); // Regular
    }

    claimDaily() {
        const now = Date.now();
        const streak = this.gameState.dailyStreak;
        
        // Recalculate based on current stats
        const productionPerSec = this.getAutoPower() + (this.getClickPower() * 2);
        const playerPower = Math.max(100, productionPerSec * 60);

        const type = this.getDailyRewardType(streak);
        const val = this.getDailyRewardValue(streak, playerPower);
        
        if (type === 'cash' || type === 'big_cash') {
            this.addMoney(val);
        } else if (type === 'buff_speed') {
            this.activateAdBoost(); // Re-use ad boost logic for now (speed boost)
            alert("SPEED BUFF ACTIVATED!");
        }
        
        this.gameState.lastDailyClaim = now;
        this.gameState.dailyStreak++;
        
        this.saveGame();
        this.checkDailyReward();
    }

    updateDailyTimer() {
        const now = Date.now();
        const nextTime = this.gameState.lastDailyClaim + (24 * 60 * 60 * 1000);
        const diff = nextTime - now;
        
        if (diff > 0) {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            this.els.dailyTimer.textContent = `Next in: ${h}h ${m}m`;
        }
    }

    // --- SETUP & UTILS ---

    setupEventListeners() {
        // Mouse Interaction
        this.els.hero.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.clickHero({ clientX: e.clientX, clientY: e.clientY });
        });

        // Touch Interaction (Multi-touch support)
        this.els.hero.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Stop zoom/scroll
            // Process ALL changed touches (new fingers touching down)
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                this.clickHero({ clientX: t.clientX, clientY: t.clientY });
            }
        }, { passive: false });

        // Spacebar Support
        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.key === ' ') && !e.repeat) {
                // Only trigger if no modal is open
                const overlay = document.getElementById('modal-overlay');
                if (overlay && !overlay.classList.contains('hidden')) return;

                e.preventDefault(); // Prevent scrolling
                
                // Simulate Center Click
                if (this.els.hero) {
                    const rect = this.els.hero.getBoundingClientRect();
                    const centerX = rect.left + (rect.width / 2);
                    const centerY = rect.top + (rect.height / 2);
                    
                    // Add some random jitter for visual variety
                    const jitterX = (Math.random() * 40) - 20;
                    const jitterY = (Math.random() * 40) - 20;

                    this.clickHero({ clientX: centerX + jitterX, clientY: centerY + jitterY });
                    
                    // Visual Feedback (CSS :active simulation)
                    this.els.hero.classList.add('active-click');
                    setTimeout(() => this.els.hero.classList.remove('active-click'), 100);
                }
            }
        });

        // New Bonus Drawer Listeners
        if (this.els.drawerToggle) {
            this.els.drawerToggle.addEventListener('click', this.toggleBonusDrawer);
        }
        if (this.els.closeBonusBtn) {
            this.els.closeBonusBtn.addEventListener('click', this.toggleBonusDrawer);
        }
        
        if (this.els.dailyDrawerToggle) {
            this.els.dailyDrawerToggle.addEventListener('click', this.toggleDailyDrawer);
        }

        // Sliding Ad Banner Click - Handled in triggerSlidingAd creation logic now
        
        document.getElementById('open-rebirth-btn').addEventListener('click', () => {
             // Calculate Multipliers
             const currentMult = Math.pow(2, this.gameState.rebirthCount || 0);
             const newMult = Math.pow(2, (this.gameState.rebirthCount || 0) + 1);
             
             // Update UI
             document.querySelector('.current-mult').textContent = `${currentMult}x`;
             document.querySelector('.new-mult').textContent = `${newMult}x`;
             
             // Update Cost
             const cost = this.getRebirthCost();
             const costDisplay = document.querySelector('.rebirth-cost-display');
             if (costDisplay) costDisplay.textContent = `Cost: $${this.formatNumber(cost)}`;
             
             // Update Button Text
             const actionBtn = document.getElementById('confirm-rebirth-btn');
             if (actionBtn) {
                 if (this.gameState.money >= cost) {
                    actionBtn.textContent = `REBIRTH NOW (${newMult}X)`;
                    actionBtn.disabled = false;
                    actionBtn.classList.remove('disabled');
                 } else {
                    actionBtn.textContent = `NEED $${this.formatNumber(cost)}`;
                    actionBtn.disabled = true;
                    actionBtn.classList.add('disabled');
                 }
             }
             
             this.toggleModal('rebirth-modal', true);
        });

        // Enhanced Close Button Logic
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                this.toggleModal(null, false);
            });
        });

        document.getElementById('confirm-rebirth-btn').addEventListener('click', () => this.rebirth());
        
        document.getElementById('daily-reward-btn').addEventListener('click', () => {
            this.checkDailyReward(false); // Update UI
            this.toggleModal('daily-rewards-modal', true);
        });
        this.els.claimDailyBtn.addEventListener('click', () => this.claimDaily());
        
        // Offline Claim
        if (this.els.claimOfflineBtn) {
            this.els.claimOfflineBtn.addEventListener('click', () => {
                if (this.adManager.pendingOfflineAmount > 0) {
                    // Direct add without multipliers (already calculated)
                    this.gameState.money += this.adManager.pendingOfflineAmount;
                    this.gameState.totalMoney += this.adManager.pendingOfflineAmount;
                    
                    this.adManager.pendingOfflineAmount = 0;
                    this.saveGame();
                    this.playNotificationSound();
                    this.updateDisplay();
                }
                this.toggleModal('offline-modal', false);
            });
        }

        document.getElementById('claim-offline-2x-btn').addEventListener('click', () => {
             this.watchRewardedAd('offline_2x');
        });

        // Evolution Modal Claim
        const evoClaimBtn = document.getElementById('evo-claim-btn');
        if (evoClaimBtn) {
            evoClaimBtn.addEventListener('click', () => {
                this.toggleModal('evolution-modal', false);
                // Happy Time! (Evolution Complete)
                if (window.CrazyManager) window.CrazyManager.happytime();
            });
        }

        document.getElementById('settings-btn').addEventListener('click', () => this.toggleModal('settings-modal', true));
        this.els.sfxSlider.addEventListener('input', (e) => {
            this.gameState.settings.sfxVolume = parseInt(e.target.value);
            this.saveGame();
        });
        this.els.musicSlider.addEventListener('input', (e) => {
            this.gameState.settings.musicVolume = parseInt(e.target.value);
            this.updateMusicVolume(); // Real-time update
            this.saveGame();
        });
        
        // Auto-Save on Exit (Crucial for Offline System)
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
        
        // Visibility Change (Pause/Resume music or save)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveGame();
            }
        });

        // Custom Reset Logic
        document.getElementById('hard-reset-btn').addEventListener('click', () => {
            this.toggleModal('confirm-modal', true);
            // Hide settings to focus on danger
            document.getElementById('settings-modal').classList.add('hidden');
        });

        this.els.confirmYesBtn.addEventListener('click', async () => {
            // FULL NUCLEAR RESET
            this.isHardReset = true; // Prevent auto-save from overriding
            
            // Use SDK Manager for unified reset
            if (window.CrazyManager) {
                await window.CrazyManager.resetProgress('roboClickerElite');
            } else {
                // Fallback if Manager missing (shouldn't happen)
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            }
        });

        this.els.confirmNoBtn.addEventListener('click', () => {
            this.toggleModal(null, false);
        });
        
        // New Index Button Logic
        document.getElementById('index-btn').addEventListener('click', () => {
             this.toggleModal('index-modal', true);
        });

        // Offline Modal Events
        document.getElementById('claim-offline-btn').addEventListener('click', () => {
             if (this.adManager.pendingOfflineAmount) {
                 this.addMoney(this.adManager.pendingOfflineAmount);
                 this.adManager.pendingOfflineAmount = 0;
                 this.toggleModal('offline-modal', false);
             }
        });

        document.getElementById('claim-offline-2x-btn').addEventListener('click', () => {
             this.watchRewardedAd('offline_2x');
        });
    }

    show5xMultiplier() {
        // Create element if not exists
        let el = document.getElementById('heat-mult-text');
        if (!el) {
            el = document.createElement('div');
            el.id = 'heat-mult-text';
            el.className = 'heat-multiplier-text';
            el.textContent = "2X";
            
            // Append to heat system or hero section
            const heatSys = document.querySelector('.heat-system');
            if (heatSys) heatSys.appendChild(el);
        }
        
        el.classList.add('active');
        
        // Hide after a bit if heat drops (handled in loop)
        if (this.heat < 90) el.classList.remove('active');
    }

    startGameLoop() {
        setInterval(() => {
            const now = Date.now();

            // --- HEAT SYSTEM LOGIC ---
            if (this.heat > 0) {
                // Decay Logic
                let decay = 2.5; // Faster decay (was 1.5)
                if (this.heat >= 90) decay = 0.5; // Slower at max but harder than before (was 0.2)
                
                this.heat = Math.max(0, this.heat - decay); 
                
                // Update UI
                if (this.els.heatFillBar) {
                    const pct = Math.min(100, (this.heat / 100) * 100); 
                    this.els.heatFillBar.style.width = '100%';
                    this.els.heatFillBar.style.height = `${pct}%`; // Vertical
                    
                    // Colors
                    this.els.heatFillBar.className = 'heat-fill-bar'; // Reset
                    if (pct > 50) this.els.heatFillBar.classList.add('med');
                    if (pct > 80) this.els.heatFillBar.classList.add('high');

                    // Bulb Logic
                    if (this.els.heatBulb) {
                         if (pct >= 90) this.els.heatBulb.classList.add('active');
                         else {
                             this.els.heatBulb.classList.remove('active');
                             // Hide 5x text if heat drops
                             const txt = document.getElementById('heat-mult-text');
                             if (txt) txt.classList.remove('active');
                         }
                    }

                    // Max State Effects
                    if (this.heat >= 90) {
                        if (this.els.heatSystem) this.els.heatSystem.classList.add('energy-surge');
                        if (this.els.heatLightning) this.els.heatLightning.classList.remove('hidden');
                    } else {
                        if (this.els.heatSystem) this.els.heatSystem.classList.remove('energy-surge');
                        if (this.els.heatLightning) this.els.heatLightning.classList.add('hidden');
                    }
                }
            } else if (this.els.heatFillBar) {
                 this.els.heatFillBar.style.height = '0%';
                 if (this.els.heatBulb) this.els.heatBulb.classList.remove('active');
            }
            
            // --- IDLE CHECK ---
            if (!this.isIdle && (now - (this.lastClickTime || now)) > 10000) {
                this.isIdle = true;
                if (this.els.idlePrompt) this.els.idlePrompt.classList.remove('hidden');
            }

        // Auto Income
        const autoIncome = this.calculateAutoIncome();
        if (autoIncome > 0) {
             this.addMoney(autoIncome / 10); // per 100ms
        }
            
            // --- GOLDEN DRONE SPAWN ---
            if (now - this.lastGoldenDroneSpawn > 30000) { // Every 30 seconds
                // Fix: Only spawn if tab is visible to prevent stacking
                if (!document.hidden) {
                    this.spawnGoldenDrone();
                    this.lastGoldenDroneSpawn = now;
                }
            }

            // Robot Personality Check (Randomly trigger animations)
            // 2% chance per 100ms tick (~every 5 seconds on avg)
            if (Math.random() < 0.02) {
                this.triggerRobotPersonality();
            }
            
            // --- FLYING DRONE LASERS (SWARM AI) ---
            const droneContainer = document.getElementById('flying-drones-container');
            if (droneContainer && droneContainer.children.length > 0) {
                // Fire Rate scales with Drone Level
                // Base: 10% chance per tick + (Level * 2%)
                const lvl = this.gameState.droneLevel || 1;
                const fireChance = 0.1 + (lvl * 0.02);
                const cappedChance = Math.min(0.6, fireChance); // Cap at 60% per tick (6 shots/sec avg)

                if (Math.random() < cappedChance) {
                     const drones = droneContainer.children;
                     const randomDrone = drones[Math.floor(Math.random() * drones.length)];
                     this.fireDroneLaser(randomDrone);
                }
            }

            // --- BOT SWARM (AUTO CLICKER) ---
            if (this.adManager.boosts['auto_clicker'] && this.adManager.boosts['auto_clicker'] > now) {
                // Show Overlay
                if (this.els.botswarmOverlay) {
                    this.els.botswarmOverlay.classList.remove('hidden');
                    const remaining = Math.ceil((this.adManager.boosts['auto_clicker'] - now) / 1000);
                    if (this.els.botswarmTimer) this.els.botswarmTimer.textContent = remaining + "s";
                }

                // Simulate clicks (Super Fast!)
                // Use safe coordinate center if robot exists
                let rect = this.els.hero ? this.els.hero.getBoundingClientRect() : null;
                const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
                const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
                
                // Trigger logic (isAuto = true to skip heat/xp for balance, or false for OP?)
                // User said "click super fast", implying main click power.
                this.clickHero(null, true); 
                
                // Visuals (Manual Trigger since isAuto=true skips them)
                // 30% chance per tick (approx 3/sec) to avoid lag
                if (Math.random() < 0.3) {
                     this.spawnBoltParticle(centerX, centerY);
                }
                
                // Jiggle Robot
                if (this.els.hero) {
                    this.els.hero.style.transform = `scale(${0.95 + Math.random() * 0.1})`;
                }
                
                // "AUTO" Text removed per user request (relying on Overlay)
            } else {
                // Hide Overlay
                if (this.els.botswarmOverlay) {
                    this.els.botswarmOverlay.classList.add('hidden');
                }
            }

            // --- TURBO MODE VISUALS ---
            if (this.adManager.boosts['turbo'] && this.adManager.boosts['turbo'] > now) {
                // Active
                this.els.hero.classList.add('turbo-mode');
                
                // Show Big Overlay
                if (this.els.turboOverlay) {
                    this.els.turboOverlay.classList.remove('hidden');
                    const remaining = Math.ceil((this.adManager.boosts['turbo'] - now) / 1000);
                    if (this.els.turboTimer) this.els.turboTimer.textContent = remaining + "s";
                }
            } else {
                // Inactive
                this.els.hero.classList.remove('turbo-mode');
                if (this.els.turboOverlay) this.els.turboOverlay.classList.add('hidden');
            }

            if (!this.els.dailyTimer.classList.contains('hidden')) {
                this.updateDailyTimer();
            }
            this.checkNotifications(); 
            this.updateHUD(); 
            this.updateUpgradeAffordability();
            this.updateBoostsUI(); // New UI Update

            // --- AUTO SPAWN ADS & OFFERS ---
            // Sliding Ad Banner: Every 10 seconds (Deterministic)
            if (now - this.lastAdSpawn > 10000) {
                this.triggerSlidingAd();
                this.lastAdSpawn = now;
            }

            // Free Upgrade Bubble: Very Frequent (5% chance per tick if none exist)
            if (Math.random() < 0.05) {
                this.spawnRandomFreeUpgrade();
            }

        }, 100);
    }
    
    spawnRandomFreeUpgrade() {
        if (document.querySelector('.free-upgrade-bubble')) return; // One at a time
        
        // Cooldown check to prevent spamming right after one disappears
        const now = Date.now();
        if (this.lastFreeUpgradeTime && (now - this.lastFreeUpgradeTime < 5000)) return; // 5s cooldown

        const container = this.els.upgradesContainer;
        if (!container) return;
        
        // --- SMART LOGIC ---
        // Check if user can afford ANY upgrade
        let canAffordAny = false;
        if (container.querySelector('.upgrade-item.can-afford')) {
            canAffordAny = true;
        }

        // Base Chance per tick (100ms)
        // We want it to appear roughly every 10-15 seconds
        // 10s = 100 ticks. 1/100 = 0.01
        // If broke: More frequent (every 5-8s) -> 0.02
        
        let chance = canAffordAny ? 0.01 : 0.03;
        
        if (Math.random() > chance) return;
        
        const items = container.querySelectorAll('.upgrade-item');
        if (items.length === 0) return;
        
        // Filter out MAXED items AND 'add_drone' to avoid it spawning there
        const eligibleItems = Array.from(items).filter(item => {
            const btn = item.querySelector('.purchase-btn');
            const key = item.getAttribute('data-key');
            return btn && !btn.textContent.includes("MAXED") && key !== 'add_drone';
        });

        if (eligibleItems.length === 0) return;
        
        // Pick random eligible item
        const randomItem = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
        const key = randomItem.getAttribute('data-key');
        
        if (key && this.gameState.upgrades[key]) {
            // Find the button inside to attach bubble to
            const btn = randomItem.querySelector('.purchase-btn');
            if (btn) {
                this.showSmartAdOffer(btn, key);
                this.lastFreeUpgradeTime = now;
            }
        }
    }

    updateBoostsUI() {
        const container = document.getElementById('active-boosts-container');
        if (!container) return;
        
        const now = Date.now();
        const activeTypes = [];

        for (const [type, endTime] of Object.entries(this.adManager.boosts)) {
            if (endTime > now) {
                activeTypes.push(type);
                const remaining = Math.ceil((endTime - now) / 1000);
                
                let label = type.toUpperCase();
                let icon = '⚡';
                if (type === 'turbo') { label = 'TURBO'; icon = '🔥'; }
                if (type === 'auto') { label = 'OVERCLOCK'; icon = '⚙️'; }
                if (type === 'auto_clicker') { label = 'AUTO CLICK'; icon = '🤖'; }
                
                let pill = document.getElementById(`boost-pill-${type}`);
                if (!pill) {
                    pill = document.createElement('div');
                    pill.id = `boost-pill-${type}`;
                    pill.className = `boost-pill type-${type}`;
                    container.appendChild(pill);
                }
                
                const contentHTML = `
                    <div class="boost-icon-wrapper">${icon}</div>
                    <div>${label}: ${remaining}s</div>
                `;
                
                // Only update if text changed
                if (pill.innerHTML !== contentHTML) {
                    pill.innerHTML = contentHTML;
                }
            }
        }
        
        // Cleanup expired pills
        Array.from(container.children).forEach(child => {
            const type = child.id.replace('boost-pill-', '');
            if (!activeTypes.includes(type)) {
                child.remove();
            }
        });
    }

    startAutoSave() { setInterval(() => this.saveGame(), 30000); }
    
    async saveGame() {
        if (this.isHardReset) return;
        this.gameState.lastSave = Date.now();
        const json = JSON.stringify(this.gameState);
        localStorage.setItem('roboClickerElite', json);
        
        // Cloud Save via Manager
        if (window.CrazyManager) {
            await window.CrazyManager.saveData('roboClickerElite', this.gameState);
        }
    }

    async loadGame() {
        let save = localStorage.getItem('roboClickerElite');
        
        // Cloud Load via Manager
        if (window.CrazyManager) {
            try {
                const cloudData = await window.CrazyManager.loadData('roboClickerElite');
                if (cloudData) {
                    const localData = save ? JSON.parse(save) : null;
                    
                    // Use Cloud if Local is missing OR Cloud is newer
                    if (!localData || (cloudData.lastSave > (localData.lastSave || 0))) {
                        console.log("Using Cloud Save");
                        // We already have the object, so we can use it directly or stringify to match existing logic
                        // Let's use it directly to avoid double parse
                        this.processSaveData(cloudData);
                        return; 
                    } else {
                        console.log("Using Local Save (Newer)");
                    }
                }
            } catch (e) {
                console.error("Cloud Load Error:", e);
            }
        }

        if (save) {
            try {
                const data = JSON.parse(save);
                this.processSaveData(data);
            } catch (e) {
                console.error("Save File Corrupted:", e);
            }
        }
    }

    processSaveData(data) {
        // Preserve default upgrades structure to ensure we have all keys
        const defaultUpgrades = JSON.parse(JSON.stringify(this.gameState.upgrades));
        
        // Merge basic state
        this.gameState = { ...this.gameState, ...data };
        
        // --- ROBUST STATE RECOVERY ---
        
        // 1. Upgrades Recovery
        if (!this.gameState.upgrades) this.gameState.upgrades = defaultUpgrades;
        else {
            // Ensure all default keys exist
            for (const key in defaultUpgrades) {
                if (!this.gameState.upgrades[key]) {
                    this.gameState.upgrades[key] = defaultUpgrades[key];
                } else {
                    // Ensure structure (level, basePower, etc) is preserved
                    const saved = this.gameState.upgrades[key];
                    const def = defaultUpgrades[key];
                    this.gameState.upgrades[key] = { ...def, level: saved.level || 0 };
                }
            }
            
            // Cleanup removed upgrades (Strict Mode)
            const allowedKeys = Object.keys(defaultUpgrades);
            for (const key in this.gameState.upgrades) {
                if (!allowedKeys.includes(key)) {
                    delete this.gameState.upgrades[key];
                }
            }
            
            // Migration: crit_chance -> crit_money
            if (data.upgrades && data.upgrades['crit_chance']) {
                this.gameState.upgrades['crit_money'].level = data.upgrades['crit_chance'].level;
            }
        }

        // 2. Evolution Recovery
        if (!this.gameState.evolution) {
            this.gameState.evolution = { stage: 0, xp: 0, maxXp: 150 };
        }
        if (!this.gameState.unlockedRobots || !Array.isArray(this.gameState.unlockedRobots)) {
            this.gameState.unlockedRobots = [0];
        }

        // 3. Tasks Recovery
        if (!this.gameState.tasks) this.gameState.tasks = {};

        // 4. Prestige Recovery
        if (!this.gameState.prestige) {
            this.gameState.prestige = {
                points: 0,
                totalResetCount: 0,
                claimedPoints: 0,
                upgrades: {}
            };
        }

        // 5. Gem Shop Recovery
        if (!this.gameState.gemUpgrades) this.gameState.gemUpgrades = {};

        // 6. Settings Recovery
        if (this.gameState.settings) {
            if (this.els.sfxSlider) this.els.sfxSlider.value = this.gameState.settings.sfxVolume || 100;
            if (this.els.musicSlider) this.els.musicSlider.value = this.gameState.settings.musicVolume || 50;
        }

        // 7. Drones Visual Recovery
        if (this.gameState.drones && Array.isArray(this.gameState.drones) && this.gameState.drones.length > 0) {
            this.renderFlyingDrones();
        } else {
            this.gameState.drones = [];
        }
    }

    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
        return Math.floor(num).toString();
    }
}

window.onload = () => {
    window.game = new RoboClicker(); 
    window.game.init();
};