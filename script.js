/* ROBO CLICKER - ELITE EDITION */

const ROBOT_TIERS = [
    { name: "Prototype X-1", multiplier: 1, class: "tier-0", desc: "Basic clicker unit.", rarity: "Common" },
    { name: "Nano Scout", multiplier: 2, class: "tier-1", desc: "Agile reconnaissance bot.", rarity: "Common" },
    { name: "Iron Guardian", multiplier: 4, class: "tier-2", desc: "Reinforced steel chassis.", rarity: "Common" },
    { name: "Cobalt Striker", multiplier: 8, class: "tier-3", desc: "Enhanced speed servos.", rarity: "Rare" },
    { name: "Plasma Sentinel", multiplier: 16, class: "tier-4", desc: "Energy shield generator.", rarity: "Rare" },
    { name: "Golden Sovereign", multiplier: 32, class: "tier-5", desc: "Luxury plating, max efficiency.", rarity: "Rare" },
    { name: "Crimson Destroyer", multiplier: 64, class: "tier-6", desc: "Powered by unstable core.", rarity: "Epic" },
    { name: "Void Walker", multiplier: 150, class: "tier-7", desc: "Phases through reality.", rarity: "Epic" },
    { name: "Nebula Titan", multiplier: 300, class: "tier-8", desc: "Forged in star fire.", rarity: "Legendary" },
    { name: "Galactic Warlord", multiplier: 1000, class: "tier-9", desc: "Commands entire fleets.", rarity: "Legendary" },
    { name: "Celestial Prime", multiplier: 5000, class: "tier-10", desc: "God-tier technology.", rarity: "Godly" },
    { name: "Omega Singularity", multiplier: 25000, class: "tier-11", desc: "The end of all things.", rarity: "Omega" },
    // New Tiers (12-24)
    { name: "Mecha-Rex", multiplier: 50000, class: "tier-12", desc: "Prehistoric fury reborn in steel.", rarity: "Epic" },
    { name: "Cyber-Samurai", multiplier: 100000, class: "tier-13", desc: "Blade faster than light.", rarity: "Epic" },
    { name: "Heavy Siege Unit", multiplier: 250000, class: "tier-14", desc: "Mobile fortress.", rarity: "Legendary" },
    { name: "Storm Bringer", multiplier: 500000, class: "tier-15", desc: "Harnesses the weather.", rarity: "Legendary" },
    { name: "Solar Archon", multiplier: 1000000, class: "tier-16", desc: "Powered by a miniature sun.", rarity: "Godly" },
    { name: "Lunar Phantom", multiplier: 2500000, class: "tier-17", desc: "Silent as the moon's shadow.", rarity: "Godly" },
    { name: "Time Weaver", multiplier: 5000000, class: "tier-18", desc: "Manipulates the timeline.", rarity: "Godly" },
    { name: "Dimensional Horror", multiplier: 15000000, class: "tier-19", desc: "It shouldn't exist.", rarity: "Omega" },
    { name: "Quantum Seraph", multiplier: 50000000, class: "tier-20", desc: "Multi-dimensional angel.", rarity: "Omega" },
    { name: "The Architect", multiplier: 100000000, class: "tier-21", desc: "Builder of universes.", rarity: "Omega" }
];

class RoboClicker {
    constructor() {
        this.gameState = {
            money: 0,
            totalMoney: 0,
            clickPower: 1,
            autoClickPower: 0,
            rebirthMultiplier: 1,
            rebirthCount: 0,
            totalBotsDeployed: 0, 
            
            dailyStreak: 0,
            lastDailyClaim: 0,
            
            settings: { sfxVolume: 100, musicVolume: 50 },

            // Evolution System
            evolution: {
                stage: 0,
                xp: 0,
                maxXp: 25 // Scales with stage
            },
            unlockedRobots: [0], // Array of tier indices
            
            hasOpenedDrawer: false, // Track if user has seen ads

            // Upgrades with descriptions - EXCLUSIVE & FUN
            upgrades: {
                'cursor': { level: 0, baseCost: 10, basePower: 1, name: "Stronger Clicks", desc: "+1 Click Value", type: "click" },
                'auto_clicker': { level: 0, baseCost: 100, basePower: 1, name: "Auto Clicker", desc: "Clicks once every second", type: "effect_autoclick" },
                'crit_chance': { level: 0, baseCost: 1000, basePower: 1, name: "Crit Chance", desc: "+1% Chance for Double Damage", type: "effect_crit" },
                'passive_mult': { level: 0, baseCost: 10000, basePower: 0.05, name: "Income Multiplier", desc: "+5% to ALL earnings", type: "effect_mult" },
                'discount': { level: 0, baseCost: 50000, basePower: 0.02, name: "Cheaper Upgrades", desc: "-2% Upgrade Costs", type: "effect_discount" }
            },
            
            lastSave: Date.now(),
            startTime: Date.now()
        };

        this.adManager = {
            activeBoost: null, // Legacy flag, kept for safety
            boosts: {}, // { type: endTime }
            boostEndTime: 0
        };

        this.adManager = {
            activeBoost: null, // Legacy flag, kept for safety
            boosts: {}, // { type: endTime }
            boostEndTime: 0
        };

        this.audioCtx = null;
        this.musicNodes = []; // Store oscillators for music
        this.musicGain = null;
        this.els = {};
        
        this.toggleDrawer = this.toggleDrawer.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);
    }

    async init() {
        console.log("Initializing Robo Clicker Elite...");
        
        this.cacheDOM();
        this.initAudio();
        this.loadGame();
        
        this.setupEventListeners();
        
        this.startGameLoop();
        this.startAutoSave();

        this.updateDisplay();
        this.renderUpgrades();
        // Check Daily Reward but DO NOT auto-open modal on init
        this.checkDailyReward(false); 
        this.applyRobotVisuals();
        
        // Offline Earnings Check
        this.checkOfflineEarnings();

        // Tutorial Check
        if (this.gameState.totalBotsDeployed === 0) {
            this.initTutorial();
        }
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
        // Position below the bot, centered horizontally
        // '👆' points up by default.
        const top = rect.bottom + 10; 
        const left = rect.left + (rect.width / 2) - 30; // -30 to center the emoji roughly
        
        cursor.style.top = `${top}px`;
        cursor.style.left = `${left}px`;
    }

    endTutorial() {
        if (!this.gameState.isTutorialActive) return;
        
        const overlay = document.getElementById('tut-overlay');
        const cursor = document.getElementById('tut-cursor');
        
        if (overlay) overlay.style.opacity = '0';
        if (cursor) cursor.style.opacity = '0';
        
        this.els.hero.classList.remove('highlight-z');
        
        setTimeout(() => {
            if (overlay) overlay.remove();
            if (cursor) cursor.remove();
        }, 500);
        
        this.gameState.isTutorialActive = false;
    }

    cacheDOM() {
        this.els = {
            money: document.getElementById('money-count'),
            currencyContainer: document.getElementById('money-display-container'),
            botValue: document.getElementById('bot-value-stat'),
            totalBots: document.getElementById('total-bots-stat'),
            
            hero: document.getElementById('hero-robot'),
            fusionFill: document.getElementById('fusion-fill'), // Now Evolution Fill
            fusionLabel: document.querySelector('.fusion-label'),
            
            upgradesContainer: document.getElementById('upgrades-container'),
            
            modalOverlay: document.getElementById('modal-overlay'),
            rebirthModal: document.getElementById('rebirth-modal'),
            dailyModal: document.getElementById('daily-rewards-modal'),
            settingsModal: document.getElementById('settings-modal'),
            indexModal: document.getElementById('index-modal'),
            confirmModal: document.getElementById('confirm-modal'), // New
            leaderboardOverlay: document.getElementById('leaderboard-overlay'),
            
            rebirthBtn: document.getElementById('open-rebirth-btn'),
            leaderboardScores: document.getElementById('leaderboard-scores'),
            
            bonusDrawer: document.getElementById('bonus-drawer'),
            drawerToggle: document.getElementById('drawer-toggle'),
            
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
        
        const vol = (this.gameState.settings.sfxVolume / 100) * 0.1; // Much lower volume (10%)
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
        if (!this.audioCtx) return;
        if (this.musicInterval) clearInterval(this.musicInterval);

        // Master Gain for Music
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.connect(this.audioCtx.destination);
        this.updateMusicVolume();

        // Simulator Vibe: Upbeat, Marimba/Pluck, C Major
        // Pattern: Arpeggio
        const scale = [261.63, 329.63, 392.00, 523.25]; // C E G C
        const pattern = [0, 1, 2, 1, 0, 2, 3, 2];
        let noteIdx = 0;

        const playNote = () => {
            if (this.audioCtx.state === 'suspended') return;
            
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'triangle'; // Pluckier than sine
            // Filter to make it softer/marimba-like
            // (Simulated by using triangle + low volume)
            
            const freq = scale[pattern[noteIdx]];
            osc.frequency.value = freq;
            
            const now = this.audioCtx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.02); // Quick attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Short decay
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start(now);
            osc.stop(now + 0.5);
            
            noteIdx = (noteIdx + 1) % pattern.length;
        };

        // Faster tempo: 300ms
        this.musicInterval = setInterval(playNote, 300);
    }

    updateMusicVolume() {
        if (this.musicGain) {
            // Volume range 0.0 to 0.3 (max) to keep it background
            const vol = (this.gameState.settings.musicVolume / 100) * 0.3;
            this.musicGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.1);
        }
    }

    // --- GAMEPLAY LOGIC ---

    clickHero(event) {
        // Critical Chance Logic
        const critChance = (this.gameState.upgrades['crit_chance'].level * this.gameState.upgrades['crit_chance'].basePower) / 100;
        let isCrit = Math.random() < critChance;
        
        let amount = this.getClickPower();
        if (isCrit) {
            amount *= 2; // Double Damage
        }

        // Midas Chip Logic
        const midasLevel = this.gameState.upgrades['midas_chip'] ? this.gameState.upgrades['midas_chip'].level : 0;
        let isMidas = false;
        if (midasLevel > 0 && Math.random() < 0.005) { // 0.5% fixed chance
             amount *= 10;
             isMidas = true;
        }

        this.addMoney(amount);
        
        this.gameState.totalBotsDeployed++;
        
        // EVOLUTION MECHANIC
        // Add XP per click
        this.gameState.evolution.xp += 0.5;
        if (this.gameState.evolution.xp >= this.gameState.evolution.maxXp) {
            this.evolveRobot();
        }

        // Visuals & Audio
        if (event) { // Check if triggered by user input for visuals
            this.spawnMoneyParticle(amount, event.clientX, event.clientY);
            this.spawnClickRipple(event.clientX, event.clientY); // New Ripple
            this.animateHero();
            
            if (isMidas) {
                 this.spawnDamageNumber("MIDAS!", event.clientX, event.clientY - 80, '#FFD700');
                 this.playNotificationSound();
            } else if (isCrit) {
                 this.spawnDamageNumber("CRIT!", event.clientX, event.clientY - 50, 'red');
            }
            
            // Tutorial End trigger
            if (this.gameState.isTutorialActive) {
                this.endTutorial();
            }
            
            // Only play sound on manual click
            this.playClickSound();
        }
        
        this.updateHUD(); 
        this.updateFusionUI();
    }

    evolveRobot() {
        // Can we evolve?
        if (this.gameState.evolution.stage < ROBOT_TIERS.length - 1) {
            this.gameState.evolution.stage++;
            this.gameState.evolution.xp = 0;
            
            // EASY MODE XP CURVE
            // 5%, 4%, 3.5%, 3%, 2.5%, 1.5%, 1%, 0.8%, 0.7%, 0.65%, 0.55%, 0.5%, 0.4%...
            // maxXp = 100 / percentage
            
            const stage = this.gameState.evolution.stage;
            let percent = 5; // Default fallback
            
            // Sequence: 5, 4, 3.5, 3, 2.5, 1.5, 1, 0.8, 0.7, 0.65, 0.55, 0.5, 0.4
            const percentages = [
                5, 4, 3.5, 3, 2.5, 1.5, 1, 0.8, 0.7, 0.65, 0.55, 0.5, 0.4
            ];
            
            if (stage < percentages.length) {
                percent = percentages[stage];
            } else {
                // Decay further for later stages: 0.35, 0.3, 0.25...
                percent = Math.max(0.01, 0.4 - ((stage - percentages.length) * 0.05));
            }
            
            // Calculate clicks needed (1 click = 1 XP usually, so maxXp is total clicks)
            // If percent is 5, clicks = 100/5 = 20.
            this.gameState.evolution.maxXp = Math.ceil(100 / percent);
            
            // Unlock in Index
            if (!this.gameState.unlockedRobots.includes(this.gameState.evolution.stage)) {
                this.gameState.unlockedRobots.push(this.gameState.evolution.stage);
                this.playNotificationSound();
            }

            this.applyRobotVisuals();
            this.showEvolutionModal(stage, this.gameState.evolution.stage);
        } else {
            // Max Level
            this.gameState.evolution.xp = this.gameState.evolution.maxXp;
        }
    }

    showEvolutionModal(oldStage, newStage) {
        const newBot = ROBOT_TIERS[newStage];
        
        const modal = document.getElementById('evolution-modal');
        if (!modal) return;

        // Render New Robot ONLY
        modal.querySelector('.evo-new-robot').innerHTML = this.getMiniRobotHTML(newStage);
        
        // Update Text
        document.getElementById('evo-new-name').textContent = newBot.name;
        document.getElementById('evo-mult-val').textContent = `x${this.formatNumber(newBot.multiplier)}`;
        
        // Setup Button
        const btn = document.getElementById('evo-claim-btn');
        // Remove old listeners to prevent stacking
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            this.toggleModal('evolution-modal', false);
            this.playClickSound();
        });

        // Show Modal with Animation
        this.toggleModal('evolution-modal', true);
        
        // Play special sound?
        this.playNotificationSound();
    }

    applyRobotVisuals() {
        // Reset classes
        this.els.hero.className = 'hero-robot';
        const currentTier = ROBOT_TIERS[this.gameState.evolution.stage];
        this.els.hero.classList.add(currentTier.class);
        
        // Update Label
        if (this.els.fusionLabel) {
            this.els.fusionLabel.textContent = `EVOLUTION: ${Math.floor((this.gameState.evolution.xp / this.gameState.evolution.maxXp) * 100)}%`;
        }
    }

    addMoney(amount) {
        amount *= this.gameState.rebirthMultiplier;
        
        // Tier Multiplier
        const tierMult = ROBOT_TIERS[this.gameState.evolution.stage].multiplier;
        amount *= tierMult;

        // Passive Multiplier Upgrade
        const passiveMult = 1 + (this.gameState.upgrades['passive_mult'].level * this.gameState.upgrades['passive_mult'].basePower);
        amount *= passiveMult;

        // Bonuses (New Logic)
        const now = Date.now();
        if (this.adManager.boosts['turbo'] && this.adManager.boosts['turbo'] > now) {
            amount *= 3;
        }
        
        this.gameState.money += amount;
        this.gameState.totalMoney += amount;
    }

    getClickPower() {
        return 1 + (this.gameState.upgrades['cursor'].level * this.gameState.upgrades['cursor'].basePower);
    }

    getAutoPower() {
        let power = 0;
        for (const key in this.gameState.upgrades) {
            if (this.gameState.upgrades[key].type === 'auto') {
                power += this.gameState.upgrades[key].level * this.gameState.upgrades[key].basePower;
            }
        }
        return power;
    }

    buyUpgrade(key) {
        const upgrade = this.gameState.upgrades[key];
        const cost = this.getUpgradeCost(key);

        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            upgrade.level++;
            this.updateDisplay();
            this.renderUpgrades(); 
            this.saveGame();
            this.playClickSound(); // UI Click
        }
    }

    getUpgradeCost(key) {
        const upgrade = this.gameState.upgrades[key];
        // Discount Upgrade
        const discountLevel = this.gameState.upgrades['discount'].level;
        const discountPct = Math.min(0.50, discountLevel * 0.02); // Max 50% discount
        
        let cost = Math.floor(upgrade.baseCost * Math.pow(1.4, upgrade.level));
        cost = Math.floor(cost * (1 - discountPct));
        
        return Math.max(1, cost);
    }

    rebirth() {
        if (this.gameState.money < 1000000) return;

        this.gameState.money = 0;
        for (const key in this.gameState.upgrades) {
            this.gameState.upgrades[key].level = 0;
        }

        this.gameState.rebirthMultiplier *= 2;
        this.gameState.rebirthCount++;
        
        // Reset Evolution? No, keep it as permanent progression or maybe partial reset?
        // User said "rewarding...progressively harder". Rebirth usually resets everything but keeps multiplier.
        // Let's reset Stage to 0 but keep unlocked index.
        this.gameState.evolution.stage = 0;
        this.gameState.evolution.xp = 0;
        this.gameState.evolution.maxXp = 100;
        this.applyRobotVisuals();

        this.saveGame();
        this.updateDisplay();
        this.renderUpgrades();
        this.toggleModal('rebirth-modal', false);
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
        
        // Bonus (Drawer)
        const bonusBadge = document.getElementById('bonus-badge');
        if (bonusBadge) {
             const now = Date.now();
             
             // Intro Nudge: Show after 30s if never opened
             const sessionTime = now - this.gameState.startTime;
             const showIntro = (sessionTime > 30000 && !this.gameState.hasOpenedDrawer);

             if (showIntro) {
                 bonusBadge.classList.remove('hidden');
             } else {
                 bonusBadge.classList.add('hidden');
             }
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
    }

    // --- VISUALS ---

    updateDisplay() {
        this.updateHUD();
        this.updateFusionUI();
        this.checkNotifications();
        this.updateUpgradeAffordability();
        
        const rebirthCost = 1000000;
        const canRebirth = this.gameState.money >= rebirthCost;
        this.els.rebirthBtn.style.opacity = canRebirth ? '1' : '0.5';
        
        if (canRebirth) {
            this.els.rebirthBtn.classList.add('rebirth-glow');
        } else {
            this.els.rebirthBtn.classList.remove('rebirth-glow');
        }
    }

    updateUpgradeAffordability() {
        const container = this.els.upgradesContainer;
        if (!container) return;

        const items = container.querySelectorAll('.upgrade-item');
        let index = 0;
        for (const [key, upgrade] of Object.entries(this.gameState.upgrades)) {
            if (index >= items.length) break;
            
            const cost = this.getUpgradeCost(key);
            const canAfford = this.gameState.money >= cost;
            const item = items[index];
            const btn = item.querySelector('.purchase-btn');

            if (canAfford) {
                item.classList.add('can-afford');
                if (btn) {
                    btn.classList.add('btn-ready');
                    btn.disabled = false;
                }
                item.style.cursor = 'pointer';
            } else {
                item.classList.remove('can-afford');
                if (btn) {
                    btn.classList.remove('btn-ready');
                    btn.disabled = true;
                }
                item.style.cursor = 'default';
            }
            index++;
        }
    }

    updateHUD() {
        this.els.money.textContent = this.formatNumber(Math.floor(this.gameState.money));
        
        // "Bot Value" is click power * all multipliers
        const currentTierMult = ROBOT_TIERS[this.gameState.evolution.stage].multiplier;
        const totalMult = this.gameState.rebirthMultiplier * currentTierMult;
        
        this.els.botValue.textContent = this.formatNumber(Math.floor(this.getClickPower() * totalMult));
        this.els.totalBots.textContent = this.formatNumber(this.gameState.totalBotsDeployed);
    }

    updateFusionUI() {
        // Evolution Bar
        let pct = (this.gameState.evolution.xp / this.gameState.evolution.maxXp) * 100;
        if (pct > 100) pct = 100;
        this.els.fusionFill.style.width = `${pct}%`;
        if (this.els.fusionLabel) {
            this.els.fusionLabel.textContent = `EVOLUTION PROGRESS: ${Math.floor(pct)}%`;
        }

        // Update Next Bot Preview
        const nextPreview = document.getElementById('next-evo-preview');
        if (nextPreview) {
            const nextStage = this.gameState.evolution.stage + 1;
            if (nextStage < ROBOT_TIERS.length) {
                nextPreview.textContent = `NEXT: ${ROBOT_TIERS[nextStage].name}`;
            } else {
                nextPreview.textContent = "MAX EVOLUTION";
            }
        }
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
        
        const icons = {
            'cursor': '🖱️',
            'auto_clicker': '🤖',
            // 'xp_boost': '🧠', // Removed
            'crit_chance': '🎯',
            'auto_cash_1': '⚙️',
            'passive_mult': '⚡',
            'discount': '🏷️',
            'midas_chip': '🏺',
            'auto_cash_2': '🏭'
        };

        for (const [key, upgrade] of Object.entries(this.gameState.upgrades)) {
            // Skip rendering xp_boost
            if (key === 'xp_boost') continue;

            const cost = this.getUpgradeCost(key);
            const canAfford = this.gameState.money >= cost;
            
            const div = document.createElement('div');
            // Explicitly set 'can-afford' class based on logic
            div.className = `upgrade-item ${canAfford ? 'can-afford' : ''}`;
            div.innerHTML = `
                <div class="upgrade-icon-box">${icons[key] || '🔧'}</div>
                <div class="upgrade-content">
                    <div class="upgrade-header">
                        <span class="upgrade-name">${upgrade.name}</span>
                        <!-- Level hidden via CSS -->
                        <span class="upgrade-level">Lv. ${upgrade.level}</span>
                    </div>
                    <div class="upgrade-desc">${upgrade.desc}</div>
                </div>
                <button class="purchase-btn ${canAfford ? 'btn-ready' : ''}" ${canAfford ? '' : 'disabled'}>
                    $${this.formatNumber(cost)}
                </button>
            `;
            
            div.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling
                this.buyUpgrade(key);
            });
            
            // Always allow clicking the card, logic inside checks money
            div.addEventListener('click', () => this.buyUpgrade(key));
            
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
        const rect = this.els.currencyContainer.getBoundingClientRect();
        const targetX = rect.left + (rect.width / 2);
        const targetY = rect.top + (rect.height / 2);

        const el = document.createElement('div');
        el.className = 'flying-cash';
        el.textContent = '💸'; // Just icon for flying particle to reduce clutter
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = '2rem'; // Smaller icon
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

    spawnDamageNumber(amount, x, y) {
        const el = document.createElement('div');
        el.className = 'damage-number';
        el.textContent = `+$${this.formatNumber(amount)}`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
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

    toggleDrawer() {
        this.els.bonusDrawer.classList.toggle('open');
        if (!this.gameState.hasOpenedDrawer) {
            this.gameState.hasOpenedDrawer = true;
            this.saveGame();
        }
    }

    toggleDrawer() {
        this.els.bonusDrawer.classList.toggle('open');
        if (!this.gameState.hasOpenedDrawer) {
            this.gameState.hasOpenedDrawer = true;
            this.saveGame();
        }
    }

    // --- ADS & BONUSES ---

    stopGameplay() {
        // Mute Audio
        if (this.audioCtx && this.audioCtx.state === 'running') {
            this.audioCtx.suspend();
        }
    }

    resumeGameplay() {
        // Unmute Audio
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
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
        
        console.log("Dev Mode: Ad Watched");
        this.grantReward(type);
        if (callbacks.onFinish) callbacks.onFinish();
    }

    startAdCooldown(type) {
        if (!this.adManager.cooldowns) this.adManager.cooldowns = {};
        const duration = 180000; // 3 minutes
        this.adManager.cooldowns[type] = Date.now() + duration;
        
        // Find button and start timer UI
        const btn = document.querySelector(`.bonus-btn[onclick="game.watchAd('${type}')"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.classList.add('cooldown-active');
            
            const interval = setInterval(() => {
                const remaining = this.adManager.cooldowns[type] - Date.now();
                if (remaining <= 0) {
                    clearInterval(interval);
                    btn.textContent = originalText;
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
            this.toggleDrawer();
        } else if (type === 'auto') {
            // 30 Seconds Boost
            this.adManager.boosts['auto'] = now + 30000;
            msg = "OVERCLOCK: 10x Speed for 30 Seconds!";
             this.toggleDrawer();
        } else if (type === 'lucky') {
            // New Logic: 30% of CURRENT CASH
            const reward = Math.floor(this.gameState.money * 0.30); 
            this.addMoney(reward);
            
            // Custom UI for Lucky Strike
            this.showCustomRewardModal(reward);
            this.toggleDrawer();
            return; // Skip default alert
        } else if (type === 'offline_2x') {
             if (this.adManager.pendingOfflineAmount) {
                 this.addMoney(this.adManager.pendingOfflineAmount * 2);
                 this.adManager.pendingOfflineAmount = 0;
                 this.toggleModal('offline-modal', false);
                 msg = "Offline Earnings Doubled!";
             }
        }
        
        // Removed standard alert for better flow, using UI instead
        if (msg) console.log(msg); // Log instead of blocking alert
    }

    showCustomRewardModal(amount) {
        // Reuse reward modal structure or create dynamic one
        // We can use the existing reward-modal logic if we inject content
        const overlay = document.createElement('div');
        overlay.className = 'reward-modal-overlay';
        overlay.innerHTML = `
            <div class="reward-modal-content">
                <h2>LUCKY STRIKE!</h2>
                <div style="font-size: 1.2rem; color: #555;">YOU HAVE BEEN REWARDED WITH</div>
                <div class="reward-value">$${this.formatNumber(amount)}</div>
                <div style="font-size: 1.2rem; color: #555;">CASH!</div>
                <button class="reward-claim-btn" onclick="this.closest('.reward-modal-overlay').remove()">AWESOME!</button>
            </div>
        `;
        document.body.appendChild(overlay);
        this.playNotificationSound();
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
    }

    resumeGameplay() {
        // Unmute Audio
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
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
        
        console.log("Dev Mode: Ad Watched");
        this.grantReward(type);
        if (callbacks.onFinish) callbacks.onFinish();
    }

    startAdCooldown(type) {
        if (!this.adManager.cooldowns) this.adManager.cooldowns = {};
        const duration = 180000; // 3 minutes
        this.adManager.cooldowns[type] = Date.now() + duration;
        
        // Find button and start timer UI
        const btn = document.querySelector(`.bonus-btn[onclick="game.watchAd('${type}')"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.classList.add('cooldown-active');
            
            const interval = setInterval(() => {
                const remaining = this.adManager.cooldowns[type] - Date.now();
                if (remaining <= 0) {
                    clearInterval(interval);
                    btn.textContent = originalText;
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
            this.toggleDrawer();
        } else if (type === 'auto') {
            // 30 Seconds Boost
            this.adManager.boosts['auto'] = now + 30000;
            msg = "OVERCLOCK: 10x Speed for 30 Seconds!";
             this.toggleDrawer();
        } else if (type === 'lucky') {
            // New Logic: 30% of CURRENT CASH
            const reward = Math.floor(this.gameState.money * 0.30); 
            this.addMoney(reward);
            
            // Custom UI for Lucky Strike
            this.showCustomRewardModal(reward);
            this.toggleDrawer();
            return; // Skip default alert
        } else if (type === 'offline_2x') {
             if (this.adManager.pendingOfflineAmount) {
                 this.addMoney(this.adManager.pendingOfflineAmount * 2);
                 this.adManager.pendingOfflineAmount = 0;
                 this.toggleModal('offline-modal', false);
                 msg = "Offline Earnings Doubled!";
             }
        }
        
        // Removed standard alert for better flow, using UI instead
        if (msg) console.log(msg); // Log instead of blocking alert
    }

    showCustomRewardModal(amount) {
        // Reuse reward modal structure or create dynamic one
        // We can use the existing reward-modal logic if we inject content
        const overlay = document.createElement('div');
        overlay.className = 'reward-modal-overlay';
        overlay.innerHTML = `
            <div class="reward-modal-content">
                <h2>LUCKY STRIKE!</h2>
                <div style="font-size: 1.2rem; color: #555;">YOU HAVE BEEN REWARDED WITH</div>
                <div class="reward-value">$${this.formatNumber(amount)}</div>
                <div style="font-size: 1.2rem; color: #555;">CASH!</div>
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
        
        // Minimum 5 minutes (300000ms) to trigger
        if (diff > 300000) {
            const seconds = Math.floor(diff / 1000);
            
            // Calculate earnings
            // Auto Income per second * seconds
            // Apply Tier Mult and Passive Mult
            const autoIncome = this.getAutoPower();
            const tierMult = ROBOT_TIERS[this.gameState.evolution.stage].multiplier;
            const passiveMult = 1 + (this.gameState.upgrades['passive_mult'].level * this.gameState.upgrades['passive_mult'].basePower);
            
            // Note: Auto loop divides by 10 every 100ms, so raw is per second.
            // Wait, in loop: `(autoIncome * mult * tierMult * passiveMult) / 10` every 100ms.
            // So per second = `autoIncome * mult * tierMult * passiveMult`.
            // Base `mult` is 1 (no ad boost offline).
            
            const totalOffline = Math.floor(autoIncome * tierMult * passiveMult * seconds * 0.5); // 50% efficiency offline
            
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
        
        // Base reward calculation - Scales with player's production capability
        // Use 1 minute of total production (Active + Auto) as baseline
        const productionPerSec = this.getAutoPower() + (this.getClickPower() * 2); // Assume 2 clicks/sec avg
        const playerPower = Math.max(100, productionPerSec * 60);
        
        this.els.dailyGrid.innerHTML = '';
        this.els.dailyGrid.className = 'daily-scroll-container'; // Update class for new CSS

        // Show a window of days: previous 1, current, next 5 (More "infinite" feel)
        const startDay = currentStreak; 
        const numToShow = 7; // Increased to show more future

        for (let i = 0; i < numToShow; i++) {
            const dayIndex = startDay + i;
            const rewardType = this.getDailyRewardType(dayIndex);
            const val = this.getDailyRewardValue(dayIndex, playerPower);
            
            const el = document.createElement('div');
            // First card is always the active one to claim
            const isCurrent = (i === 0);
            
            el.className = `day-card-infinite ${isCurrent ? 'active-day' : 'future-day'} type-${rewardType}`;
            
            let icon = '💵';
            let label = `$${this.formatNumber(val)}`;
            
            if (rewardType === 'buff_speed') { icon = '⚡'; label = '2x SPD'; }
            if (rewardType === 'buff_luck') { icon = '🍀'; label = 'Lucky'; }
            if (rewardType === 'big_cash') { icon = '💰'; label = 'JACKPOT'; }
            
            el.innerHTML = `
                <div class="day-header">Day ${dayIndex + 1}</div>
                <div class="day-icon-large">${icon}</div>
                <div class="day-reward-text">${label}</div>
            `;
            this.els.dailyGrid.appendChild(el);
        }

        if (timeSince > oneDay) {
            this.els.claimDailyBtn.disabled = false;
            this.els.claimDailyBtn.textContent = "CLAIM REWARD";
            this.els.dailyTimer.classList.add('hidden');
            
            // Only auto-open if requested
            if (autoOpen) {
                this.toggleModal('daily-rewards-modal', true);
            }
            
            // ALWAYS show notification badge if ready
            const badge = document.getElementById('daily-badge');
            if (badge) badge.classList.remove('hidden');
            
        } else {
            this.els.claimDailyBtn.disabled = true;
            this.els.dailyTimer.classList.remove('hidden');
            this.updateDailyTimer();
            
            // Hide badge if not ready
            const badge = document.getElementById('daily-badge');
            if (badge) badge.classList.add('hidden');
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
        
        // 5% of current cash as baseline for daily reward?
        // Capped to avoid exploits if they hoard excessively, but "scaling" is requested.
        // Let's use 10% of current cash as a strong baseline, or Production, whichever is higher.
        const cashScale = this.gameState.money * 0.10;
        
        const baseValue = Math.max(productionScale, cashScale);
        
        // Ensure minimum 100
        const finalBase = Math.max(100, baseValue);

        const streakBonus = 1 + (dayIndex * 0.15); 
        
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
        const handleInteraction = (e) => {
            e.preventDefault(); 
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.clickHero({ clientX, clientY });
        };
        this.els.hero.addEventListener('mousedown', handleInteraction);
        this.els.hero.addEventListener('touchstart', handleInteraction);

        this.els.drawerToggle.addEventListener('click', this.toggleDrawer);

        document.getElementById('open-rebirth-btn').addEventListener('click', () => {
             document.querySelector('.current-mult').textContent = `${this.gameState.rebirthMultiplier}x`;
             document.querySelector('.new-mult').textContent = `${this.gameState.rebirthMultiplier * 2}x`;
             
             this.toggleModal('rebirth-modal', true);
        });

        // Enhanced Close Button Logic
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                if (targetId) {
                    // Special handling for specific overlays like leaderboard
                    const el = document.getElementById(targetId);
                    if (el) el.classList.remove('active');
                } else {
                    // Default close all game modals
                    this.toggleModal(null, false);
                }
            });
        });

        document.getElementById('confirm-rebirth-btn').addEventListener('click', () => this.rebirth());
        
        document.getElementById('daily-reward-btn').addEventListener('click', () => {
            this.checkDailyReward();
            this.toggleModal('daily-rewards-modal', true);
        });
        this.els.claimDailyBtn.addEventListener('click', () => this.claimDaily());

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

        // Custom Reset Logic
        document.getElementById('hard-reset-btn').addEventListener('click', () => {
            this.toggleModal('confirm-modal', true);
            // Hide settings to focus on danger
            document.getElementById('settings-modal').classList.add('hidden');
        });

        this.els.confirmYesBtn.addEventListener('click', () => {
            localStorage.removeItem('roboClickerElite');
            location.reload();
        });

        this.els.confirmNoBtn.addEventListener('click', () => {
            this.toggleModal(null, false);
        });
        
        // New Index Button Logic
        document.getElementById('index-btn').addEventListener('click', () => {
             this.toggleModal('index-modal', true);
        });

        // Toggle Leaderboard Modal
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
             const dropdown = this.els.leaderboardOverlay;
             // Close others
             this.toggleModal(null, false);
             
             dropdown.classList.toggle('active');
             if (dropdown.classList.contains('active')) {
                 this.fetchLeaderboard();
             }
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

    async fetchLeaderboard() {
         const container = this.els.leaderboardScores;
         container.innerHTML = '<div style="padding:20px; text-align:center;">Loading...</div>';
         
         setTimeout(() => {
             container.innerHTML = '';
             const mockData = [
                 { rank: 1, name: "Alpha", score: 500000 },
                 { rank: 2, name: "Beta", score: 250000 },
                 { rank: 3, name: "Gamma", score: 100000 },
                 { rank: 4, name: "Delta", score: 50000 },
                 { rank: 5, name: "You", score: this.gameState.totalBotsDeployed }
             ];
             
             mockData.forEach(p => {
                 const row = document.createElement('div');
                 row.className = `score-row rank-${p.rank}`;
                 row.innerHTML = `
                    <div style="display:flex; align-items:center;">
                        <span class="rank-badge">${p.rank}</span>
                        <span>${p.name}</span>
                    </div>
                    <span>${this.formatNumber(p.score)} Bots</span>
                 `;
                 container.appendChild(row);
             });
         }, 500);
    }

    startGameLoop() {
        setInterval(() => {
            const now = Date.now();

            // Auto Income
            const autoIncome = this.getAutoPower();
            if (autoIncome > 0) {
                // Boost Logic
                let mult = 1;
                if (this.adManager.boosts['auto'] && this.adManager.boosts['auto'] > now) {
                    mult = 10;
                }
                
                // Tier Boost
                const tierMult = ROBOT_TIERS[this.gameState.evolution.stage].multiplier;
                
                // Passive Mult
                const passiveMult = 1 + (this.gameState.upgrades['passive_mult'].level * this.gameState.upgrades['passive_mult'].basePower);

                this.addMoney((autoIncome * mult * tierMult * passiveMult) / 10);
            }

            // Auto-Clicker Upgrade Logic
            const autoClickLvl = this.gameState.upgrades['auto_clicker'].level;
            if (autoClickLvl > 0) {
                if (Math.random() < (0.1 * autoClickLvl)) {
                     this.clickHero(null);
                }
            }

            // XP Boost Logic REMOVED
            /*
            const xpBoostLvl = this.gameState.upgrades['xp_boost'].level;
            if (xpBoostLvl > 0) {
                if (Math.random() < (0.1 * xpBoostLvl)) {
                    this.gameState.evolution.xp += 1;
                    if (this.gameState.evolution.xp >= this.gameState.evolution.maxXp) {
                        this.evolveRobot();
                    }
                    this.updateFusionUI();
                }
            }
            */
            
            if (!this.els.dailyTimer.classList.contains('hidden')) {
                this.updateDailyTimer();
            }
            this.checkNotifications(); 
            this.updateHUD(); 
            this.updateUpgradeAffordability();
            this.updateBoostsUI(); // New UI Update
        }, 100);
    }

    updateBoostsUI() {
        const container = document.getElementById('active-boosts-container');
        if (!container) return;
        
        container.innerHTML = '';
        const now = Date.now();
        
        for (const [type, endTime] of Object.entries(this.adManager.boosts)) {
            if (endTime > now) {
                const remaining = Math.ceil((endTime - now) / 1000);
                
                let label = type.toUpperCase();
                let icon = '⚡';
                if (type === 'turbo') { label = 'TURBO'; icon = '🔥'; }
                if (type === 'auto') { label = 'OVERCLOCK'; icon = '⚙️'; }
                
                const pill = document.createElement('div');
                pill.className = `boost-pill type-${type}`;
                pill.innerHTML = `
                    <div class="boost-icon-wrapper">${icon}</div>
                    <div>${label}: ${remaining}s</div>
                `;
                container.appendChild(pill);
            }
        }
    }

    startAutoSave() { setInterval(() => this.saveGame(), 30000); }
    
    saveGame() {
        this.gameState.lastSave = Date.now();
        localStorage.setItem('roboClickerElite', JSON.stringify(this.gameState));
    }

    loadGame() {
        const save = localStorage.getItem('roboClickerElite');
        if (save) {
            const data = JSON.parse(save);
            // Deep merge logic simplified for this structure
            this.gameState = { ...this.gameState, ...data };
            
            // Ensure evolution object exists if loading old save
            if (!this.gameState.evolution) {
                this.gameState.evolution = { stage: 0, xp: 0, maxXp: 100 };
            }
            if (!this.gameState.unlockedRobots) {
                this.gameState.unlockedRobots = [0];
            }
            
            this.els.sfxSlider.value = this.gameState.settings.sfxVolume;
            this.els.musicSlider.value = this.gameState.settings.musicVolume;
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