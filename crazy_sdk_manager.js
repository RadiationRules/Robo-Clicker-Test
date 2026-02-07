/**
 * CrazyGames SDK v3 Manager
 * Wraps SDK functionality for production-ready implementation.
 */
class CrazySDKManager {
    constructor() {
        this.sdk = null;
        this.isInitialized = false;
        this.debug = true;
    }

    /**
     * Initialize the SDK.
     * Must be called and awaited before any other SDK methods.
     */
    async init() {
        if (this.isInitialized) return true;

        // Poll for SDK presence (up to 2 seconds)
        // This handles cases where the SDK script loads async or slightly slower than the manager
        let attempts = 0;
        while ((!window.CrazyGames || !window.CrazyGames.SDK) && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.CrazyGames || !window.CrazyGames.SDK) {
            this.log("CrazyGames SDK not found after polling. Enabling Mock Mode.");
            this.mockMode = true;
            this.isInitialized = true;
            return true;
        }

        try {
            await window.CrazyGames.SDK.init();
            this.sdk = window.CrazyGames.SDK;
            this.isInitialized = true;
            this.log("SDK Initialized successfully.");
            return true;
        } catch (error) {
            this.error("SDK Initialization failed. Enabling Mock Mode.", error);
            this.mockMode = true;
            this.isInitialized = true;
            return true; // Return true to allow game to start
        }
    }

    /**
     * Signal to SDK that gameplay has started.
     */
    gameplayStart() {
        if (!this.checkInit()) return;
        if (this.mockMode) return;
        try {
            this.sdk.game.gameplayStart();
            this.log("Gameplay Started");
        } catch (e) {
            this.error("gameplayStart error:", e);
        }
    }

    /**
     * Signal to SDK that gameplay has stopped (e.g. paused, menu, ad).
     */
    gameplayStop() {
        if (!this.checkInit()) return;
        if (this.mockMode) return;
        try {
            this.sdk.game.gameplayStop();
            this.log("Gameplay Stopped");
        } catch (e) {
            this.error("gameplayStop error:", e);
        }
    }

    /**
     * Signal to SDK that loading has finished.
     */
    loadingStop() {
        if (!this.checkInit()) return;
        if (this.mockMode) {
            this.log("Mock Mode: Loading Stop");
            return;
        }
        try {
            this.sdk.game.loadingStop();
            this.log("Loading Stopped");
        } catch (e) {
            this.error("loadingStop error:", e);
        }
    }

    /**
     * Signal a 'Happy Time' event (e.g. level up, boss defeat).
     */
    happytime() {
        if (!this.checkInit()) return;
        if (this.mockMode) {
            this.log("Mock Mode: Happy Time!");
            return;
        }
        try {
            this.sdk.game.happytime();
            this.log("Happy Time Sent");
        } catch (e) {
            this.error("happytime error:", e);
        }
    }

    /**
     * Request a Standard Banner Ad.
     * @param {string} containerId - The ID of the div to place the banner in.
     */
    async requestBanner(containerId) {
        if (!this.checkInit()) return;
        
        if (this.mockMode) {
            this.log(`Mock Mode: Requested Banner in #${containerId}`);
            const el = document.getElementById(containerId);
            if (el) {
                el.style.background = "#333";
                el.style.color = "#fff";
                el.style.display = "flex";
                el.style.alignItems = "center";
                el.style.justifyContent = "center";
                el.textContent = "MOCK BANNER AD (728x90 or 300x250)";
            }
            return;
        }

        try {
            await this.sdk.banner.requestBanner({
                id: containerId,
                width: 728, // Default Standard
                height: 90,
            });
            this.log(`Requested Banner for ${containerId}`);
        } catch (e) {
            this.error("requestBanner error:", e);
        }
    }

    /**
     * Request a Responsive Banner Ad (Best for Mobile/Desktop hybrid).
     * @param {string} containerId 
     */
    async requestResponsiveBanner(containerId) {
        if (!this.checkInit()) return;

        if (this.mockMode) {
            this.log(`Mock Mode: Requested Responsive Banner in #${containerId}`);
            const el = document.getElementById(containerId);
            if (el) {
                el.style.background = "#444";
                el.textContent = "MOCK RESPONSIVE BANNER";
            }
            return;
        }

        try {
            await this.sdk.banner.requestResponsiveBanner(containerId);
            this.log(`Requested Responsive Banner for ${containerId}`);
        } catch (e) {
            this.error("requestResponsiveBanner error:", e);
        }
    }

    /**
     * Clear all banners from the screen.
     */
    clearAllBanners() {
        if (!this.checkInit()) return;
        if (this.mockMode) {
            this.log("Mock Mode: Cleared All Banners");
            return;
        }
        try {
            this.sdk.banner.clearAllBanners();
            this.log("Cleared All Banners");
        } catch (e) {
            this.error("clearAllBanners error:", e);
        }
    }

    /**
     * Request a Rewarded Ad.
     * @param {Object} callbacks - { adStarted, adFinished, adError }
     */
    async showRewardedAd(callbacks = {}) {
        if (!this.checkInit()) {
            if (callbacks.adError) callbacks.adError("SDK not initialized");
            return;
        }

        this.log("Requesting Rewarded Ad...");

        if (this.mockMode) {
            this.log("Mock Mode: Simulating Ad...");
            if (callbacks.adStarted) callbacks.adStarted();
            setTimeout(() => {
                this.log("Mock Mode: Ad Finished");
                if (callbacks.adFinished) callbacks.adFinished();
            }, 1000);
            return;
        }

        try {
            await this.sdk.ad.requestAd('rewarded', {
                adStarted: () => {
                    this.log("Ad Started");
                    // Mute/Pause logic should be handled by the caller in adStarted callback
                    // But SDK requires us to call gameplayStop()
                    this.gameplayStop();
                    if (callbacks.adStarted) callbacks.adStarted();
                },
                adFinished: () => {
                    this.log("Ad Finished");
                    // SDK requires us to call gameplayStart()
                    this.gameplayStart();
                    if (callbacks.adFinished) callbacks.adFinished();
                },
                adError: (error) => {
                    this.error("Ad Error:", error);
                    // Ensure gameplay resumes if error occurs during start
                    this.gameplayStart(); 
                    if (callbacks.adError) callbacks.adError(error);
                }
            });
        } catch (e) {
            this.error("showRewardedAd Exception:", e);
            // Ensure gameplay resumes on exception
            this.gameplayStart();
            if (callbacks.adError) callbacks.adError(e);
        }
    }

    /**
     * Request a Midgame (Interstitial) Ad.
     * @param {Object} callbacks - { adStarted, adFinished, adError }
     */
    async showMidgameAd(callbacks = {}) {
        if (!this.checkInit()) return;

        this.log("Requesting Midgame Ad...");

        if (this.mockMode) {
            this.log("Mock Mode: Simulating Midgame Ad...");
            if (callbacks.adStarted) callbacks.adStarted();
            setTimeout(() => {
                this.log("Mock Mode: Ad Finished");
                if (callbacks.adFinished) callbacks.adFinished();
            }, 1000);
            return;
        }

        try {
            await this.sdk.ad.requestAd('midgame', {
                adStarted: () => {
                    this.log("Midgame Ad Started");
                    this.gameplayStop();
                    if (callbacks.adStarted) callbacks.adStarted();
                },
                adFinished: () => {
                    this.log("Midgame Ad Finished");
                    this.gameplayStart();
                    if (callbacks.adFinished) callbacks.adFinished();
                },
                adError: (error) => {
                    this.error("Midgame Ad Error:", error);
                    this.gameplayStart();
                    if (callbacks.adError) callbacks.adError(error);
                }
            });
        } catch (e) {
            this.error("showMidgameAd Exception:", e);
            this.gameplayStart();
            if (callbacks.adError) callbacks.adError(e);
        }
    }

    /**
     * Save data to cloud.
     * @param {string} key 
     * @param {any} data - Will be JSON stringified
     */
    async saveData(key, data) {
        if (!this.checkInit()) return;
        
        if (this.mockMode) {
            this.log(`Mock Mode: Saved data for key: ${key}`);
            return;
        }

        try {
            const json = JSON.stringify(data);
            await this.sdk.data.setItem(key, json);
            this.log(`Saved data for key: ${key}`);
        } catch (e) {
            this.error("saveData error:", e);
        }
    }

    /**
     * Load data from cloud.
     * @param {string} key 
     * @returns {any|null} Parsed data or null
     */
    async loadData(key) {
        if (!this.checkInit()) return null;
        
        if (this.mockMode) {
            this.log(`Mock Mode: Load data for key: ${key} (returning null)`);
            return null;
        }

        try {
            const json = await this.sdk.data.getItem(key);
            if (json) {
                this.log(`Loaded data for key: ${key}`);
                return JSON.parse(json);
            }
            return null;
        } catch (e) {
            this.error("loadData error:", e);
            return null;
        }
    }

    /**
     * Clear data from cloud.
     * @param {string} key
     */
    async clearData(key) {
        if (!this.checkInit()) return;
        
        if (this.mockMode) {
            this.log(`Mock Mode: Cleared data for key: ${key}`);
            return;
        }

        try {
            await this.sdk.data.removeItem(key);
            this.log(`Cleared data for key: ${key}`);
        } catch (e) {
            this.error("clearData error:", e);
        }
    }

    /**
     * Completely resets game progress (Cloud + Local) and reloads.
     * @param {string} key - The save key (e.g. 'roboClickerElite')
     */
    async resetProgress(key) {
        // 1. Ensure Initialization
        await this.init();
        
        // 2. Clear Cloud Data
        await this.clearData(key);
        
        // 3. Clear Local Storage
        localStorage.removeItem(key);
        localStorage.clear(); // Nuclear option
        sessionStorage.clear();
        
        // 4. Reload
        this.log("Progress Reset Complete. Reloading...");
        window.location.reload();
    }

    /**
     * Get User Token for backend verification.
     * @returns {string|null} Token or null
     */
    async getUserToken() {
        if (!this.checkInit()) return null;
        if (this.mockMode) return "mock-token";
        try {
            const token = await this.sdk.user.getUserToken();
            return token;
        } catch (e) {
            this.error("getUserToken error:", e);
            return null;
        }
    }

    /**
     * Check if AdBlock is detected.
     * @returns {boolean}
     */
    async hasAdblock() {
        if (!this.checkInit()) return false;
        if (this.mockMode) return false;
        try {
            return await this.sdk.ad.hasAdblock();
        } catch (e) {
            this.error("hasAdblock error:", e);
            return false;
        }
    }

    checkInit() {
        if (!this.isInitialized) {
            this.error("SDK not initialized. Call init() first.");
            return false;
        }
        return true;
    }

    log(...args) {
        if (this.debug) console.log("[CrazyManager]", ...args);
    }

    error(...args) {
        console.error("[CrazyManager]", ...args);
    }
}

// Export singleton
window.CrazyManager = new CrazySDKManager();
