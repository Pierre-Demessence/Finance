/**
 * Core data models for the Finance Management App
 */

// Base interface with common fields for all models
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Currency type
export type Currency = {
  code: string;  // ISO 4217 currency code (e.g., USD, EUR, GBP)
  symbol: string;  // Currency symbol (e.g., $, €, £)
  name: string;  // Full name (e.g., US Dollar, Euro, British Pound)
};

// User Settings
export interface Settings {
  baseCurrency: string;
  theme: 'light' | 'dark';
  dateFormat: string;
  decimalPlaces: number;
  exchangeRateSource?: string;
  exchangeRateAPIKey?: string;
  lastSync?: Date;
}

// Account Category
export interface AccountCategory {
  id: string;
  name: string;
  icon?: string;
  isDefault: boolean;
}

// Account
export interface Account extends BaseModel {
  name: string;
  description?: string;
  categoryId: string;
  currency: string;
  isArchived: boolean;
  initialBalance?: number;
  notes?: string;
}

// Balance Record for historical account balances
export interface BalanceRecord extends BaseModel {
  accountId: string;
  amount: number;
  date: Date;
  notes?: string;
  isVerified: boolean; // Flag to indicate if the balance has been verified by the user
}

// Transaction Types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

// Transaction Category
export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType | 'all'; // 'all' means the category can be used for any transaction type
  icon?: string;
  isDefault?: boolean;
}

// Transaction
export interface Transaction extends BaseModel {
  type: TransactionType;
  amount: number;
  date: Date;
  categoryId: string;
  description?: string;
  fromAccountId?: string | null; // Null for income from external source
  toAccountId?: string | null;   // Null for expense to external destination
  isRecurring?: boolean;
  recurringRuleId?: string;
  tags?: string[];
  attachments?: string[];
  notes?: string;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Asset Types
export enum AssetType {
  CRYPTOCURRENCY = 'cryptocurrency',
  STOCK = 'stock',
  REAL_ESTATE = 'real_estate',
  VEHICLE = 'vehicle',
  ELECTRONICS = 'electronics',
  OTHER = 'other'
}

// Asset
export interface Asset extends BaseModel {
  name: string;
  type: AssetType;
  accountId: string; // Account where this asset is tracked
  description?: string;
  quantity: number;
  currentPrice: number;
  acquisitionPrice?: number;
  acquisitionDate?: Date;
  identifier?: string; // Symbol for stocks/crypto, address for real estate, etc.
  lastUpdated: Date;
  notes?: string;
  autoUpdate?: boolean; // Whether to update price automatically via API
  purchasePrice: number;
  purchaseDate: Date;
  tags?: string[];
  symbol?: string; // Stock or crypto symbol
  assetImageUrl?: string; // URL to an image representing the asset
}

// RecurringRule for recurring transactions
export interface RecurringRule extends BaseModel {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: Date;
  endDate?: Date;
  dayOfMonth?: number;
  dayOfWeek?: number;
  interval?: number; // e.g., every 2 weeks
  lastProcessed?: Date;
  isActive: boolean;
  transactionTemplate: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'date'>;
}

// Budget
export interface Budget extends BaseModel {
  name: string;
  startDate: Date;
  endDate: Date;
  categoryId?: string; // If set, budget applies to a specific category
  amount: number;
  notes?: string;
  isRecurring: boolean;
  recurringRuleId?: string;
  period: 'weekly' | 'monthly' | 'yearly';
  categoryIds: string[]; // Categories included in this budget
}

// Budget entry (for tracking budget performance)
export interface BudgetEntry extends BaseModel {
  budgetId: string;
  amount: number;
  date: Date;
  notes?: string;
  isAdjustment: boolean; // Flag to indicate if this is an adjustment entry
}

// Goal entity (savings goals)
export interface Goal extends BaseModel {
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate?: Date;
  accountId?: string; // Optional link to a specific account
  notes?: string;
  isCompleted: boolean;
  color?: string;
  icon?: string;
}

// Exchange Rate for currency conversion
export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: Date;
}

// Report template for saved custom reports
export interface ReportTemplate extends BaseModel {
  name: string;
  type: 'income' | 'expenses' | 'netWorth' | 'assets' | 'custom';
  configJson: string; // Serialized report configuration
}

// Report settings
export interface ReportSettings {
  id: string;
  name: string;
  type: 'income' | 'expenses' | 'netWorth' | 'cashflow' | 'custom';
  periodStart?: Date;
  periodEnd?: Date;
  includedAccountIds?: string[];
  includedCategoryIds?: string[];
  isPublic: boolean;
  refreshFrequency?: 'daily' | 'weekly' | 'monthly';
}

// Custom period for date filters
export interface DatePeriod {
  start: Date;
  end: Date;
}