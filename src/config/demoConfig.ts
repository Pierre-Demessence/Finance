/**
 * Configuration for demo data generation
 * This file allows customizing the parameters for generating demo data
 * without modifying the core data generation logic
 */

export interface DemoDataConfig {
  /** 
   * Transaction generation settings
   */
  transactions: {
    /**
     * Number of months to generate recurring transactions for
     */
    recurringMonthsCount: number;

    /**
     * Number of random expense transactions to generate
     */
    randomExpensesCount: number;

    /**
     * Maximum days in the past for random transactions
     */
    maxDaysInPast: number;
  };

  /**
   * Account value settings
   */
  accounts: {
    /**
     * Initial balance multiplier (use to scale up/down all initial balances)
     */
    initialBalanceMultiplier: number;
  };

  /**
   * Asset settings
   */
  assets: {
    /**
     * Price variation percentage (random adjustment to current prices, +/-)
     */
    priceVariationPercent: number;
  };

  /**
   * Date range settings
   */
  dateRanges: {
    /**
     * Years of historical data to generate
     */
    historyYears: number;
  };
}

/**
 * Default configuration for demo data generation
 */
export const DEFAULT_DEMO_CONFIG: DemoDataConfig = {
  transactions: {
    recurringMonthsCount: 120, // 10 years of monthly transactions
    randomExpensesCount: 500,  // 500 random expense transactions
    maxDaysInPast: 3650,       // Random transactions up to ~10 years in past
  },
  accounts: {
    initialBalanceMultiplier: 1.0, // Default multiplier (no change)
  },
  assets: {
    priceVariationPercent: 0, // No random variation by default
  },
  dateRanges: {
    historyYears: 10,
  },
};

/**
 * Sample configurations for different scenarios
 */
export const DEMO_PRESETS = {
  minimal: {
    transactions: {
      recurringMonthsCount: 12,
      randomExpensesCount: 50,
      maxDaysInPast: 365,
    },
    accounts: {
      initialBalanceMultiplier: 1.0,
    },
    assets: {
      priceVariationPercent: 0,
    },
    dateRanges: {
      historyYears: 1,
    },
  },
  standard: DEFAULT_DEMO_CONFIG,
  extended: {
    transactions: {
      recurringMonthsCount: 240, // 20 years
      randomExpensesCount: 1000,
      maxDaysInPast: 7300, // ~20 years
    },
    accounts: {
      initialBalanceMultiplier: 1.0,
    },
    assets: {
      priceVariationPercent: 5, // 5% random variation
    },
    dateRanges: {
      historyYears: 20,
    },
  },
  highVolume: {
    transactions: {
      recurringMonthsCount: 120,
      randomExpensesCount: 5000, // 10x more random transactions
      maxDaysInPast: 3650,
    },
    accounts: {
      initialBalanceMultiplier: 2.0, // 2x initial balances
    },
    assets: {
      priceVariationPercent: 10, // 10% random variation
    },
    dateRanges: {
      historyYears: 10,
    },
  },
};