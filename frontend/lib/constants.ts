/** App-wide constants shared across the frontend. */

/** SEED tokens credited per 1 CELO spent on buySeeds. */
export const SEED_PER_CELO = 100;

/** Maximum number of leaderboard entries displayed on the board page. */
export const LEADERBOARD_MAX_ENTRIES = 50;

/** Maximum number of activity items returned by the activity API. */
export const ACTIVITY_MAX_ITEMS = 200;

/** Leaderboard auto-refresh interval in seconds. */
export const LEADERBOARD_REFRESH_SECS = 60;

/** Milliseconds between plot polling refreshes on the farm page. */
export const PLOTS_POLL_INTERVAL_MS = 30_000;

/** Milliseconds between clock tick updates on the farm page. */
export const CLOCK_TICK_INTERVAL_MS = 1_000;

/** Zero address constant (null address). */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/** Celo Mainnet chain ID. */
export const CELO_MAINNET_CHAIN_ID = 42220;

/** Celo Sepolia Testnet chain ID. */
export const CELO_SEPOLIA_CHAIN_ID = 11142220;
