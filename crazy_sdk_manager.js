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

        if (!window.CrazyGames || !window.CrazyGames.SDK) {
            this.log("CrazyGames SDK not found in window object.");
            return false;
        }

        try {
            await window.CrazyGames.SDK.init();
            this.sdk = window.CrazyGames.SDK;
            this.isInitialized = true;
            this.log("SDK Initialized successfully.");
            return true;
        } catch (error) {
            this.error("SDK Initialization failed:", error);
            return false;
        }
    }

    /**
     * Signal to SDK that gameplay has started.
     */
    gameplayStart() {
        if (!this.checkInit()) return;
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
        try {
            this.sdk.game.gameplayStop();
            this.log("Gameplay Stopped");
        } catch (e) {
            this.error("gameplayStop error:", e);
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
     * Get User Token for backend verification.
     * @returns {string|null} Token or null
     */
    async getUserToken() {
        if (!this.checkInit()) return null;
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
