/**
 * Default data values and constants for the Finance Management App
 */
import { AccountCategory, AssetType, Currency, TransactionCategory, TransactionType, Settings } from "../models";

/**
 * Currency definitions
 * Each currency includes:
 * - code: ISO 4217 currency code
 * - symbol: Currency symbol
 * - name: Full name of the currency
 */
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
} as const;

/**
 * Exchange rates for currency conversion
 * In a real app, these would be fetched from an API
 * Base currency: EUR
 */
export const EXCHANGE_RATES = {
  EUR: 1.0,
  USD: 1.09,
  GBP: 0.86,
  JPY: 162.75,
  CAD: 1.47,
  AUD: 1.63,
  CHF: 0.97,
  CNY: 7.82,
  INR: 90.56,
  BRL: 5.58,
  RUB: 102.50,
};

// Default account categories
export const DEFAULT_ACCOUNT_CATEGORIES: AccountCategory[] = [
  { id: 'savings', name: 'Savings', isDefault: true, icon: 'piggy-bank' },
  { id: 'checking', name: 'Checking', isDefault: true, icon: 'credit-card' },
  { id: 'investment', name: 'Investment', isDefault: true, icon: 'chart-line' },
  { id: 'crypto', name: 'Crypto', isDefault: true, icon: 'currency-bitcoin' },
  { id: 'real-estate', name: 'Real Estate', isDefault: true, icon: 'building' },
  { id: 'cash', name: 'Cash', isDefault: true, icon: 'wallet' },
  { id: 'other', name: 'Other', isDefault: true, icon: 'archive' },
];

// Default transaction categories for income
export const DEFAULT_INCOME_CATEGORIES: TransactionCategory[] = [
  { id: 'salary', name: 'Salary', type: TransactionType.INCOME, isDefault: true, icon: 'briefcase' },
  { id: 'interest', name: 'Interest', type: TransactionType.INCOME, isDefault: true, icon: 'percentage' },
  { id: 'dividends', name: 'Dividends', type: TransactionType.INCOME, isDefault: true, icon: 'chart-pie' },
  { id: 'gifts', name: 'Gifts', type: TransactionType.INCOME, isDefault: true, icon: 'gift' },
  { id: 'other-income', name: 'Other', type: TransactionType.INCOME, isDefault: true, icon: 'plus' },
];

// Default transaction categories for expenses
export const DEFAULT_EXPENSE_CATEGORIES: TransactionCategory[] = [
  { id: 'food', name: 'Food', type: TransactionType.EXPENSE, isDefault: true, icon: 'utensils' },
  { id: 'housing', name: 'Housing', type: TransactionType.EXPENSE, isDefault: true, icon: 'home' },
  { id: 'transportation', name: 'Transportation', type: TransactionType.EXPENSE, isDefault: true, icon: 'car' },
  { id: 'entertainment', name: 'Entertainment', type: TransactionType.EXPENSE, isDefault: true, icon: 'film' },
  { id: 'utilities', name: 'Utilities', type: TransactionType.EXPENSE, isDefault: true, icon: 'bolt' },
  { id: 'healthcare', name: 'Healthcare', type: TransactionType.EXPENSE, isDefault: true, icon: 'heartbeat' },
  { id: 'education', name: 'Education', type: TransactionType.EXPENSE, isDefault: true, icon: 'book' },
  { id: 'shopping', name: 'Shopping', type: TransactionType.EXPENSE, isDefault: true, icon: 'shopping-bag' },
  { id: 'other-expense', name: 'Other', type: TransactionType.EXPENSE, isDefault: true, icon: 'minus' },
];

// Default user settings
export const DEFAULT_USER_SETTINGS: Settings = {
  baseCurrency: 'EUR',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light',
  decimalPlaces: 2,
};

/**
 * Asset type definitions with information for UI display
 */
export const ASSET_TYPES = {
  [AssetType.CRYPTOCURRENCY]: {
    name: 'Cryptocurrency',
    description: 'Digital or virtual currency secured by cryptography',
    examples: 'Bitcoin, Ethereum, Ripple',
  },
  [AssetType.STOCK]: {
    name: 'Stock',
    description: 'Ownership shares of a company',
    examples: 'Apple, Tesla, Amazon',
  },
  [AssetType.REAL_ESTATE]: {
    name: 'Real Estate',
    description: 'Land and buildings owned',
    examples: 'House, Apartment, Land',
  },
  [AssetType.VEHICLE]: {
    name: 'Vehicle',
    description: 'Cars, motorcycles, boats and other vehicles',
    examples: 'Car, Motorcycle, Boat',
  },
  [AssetType.ELECTRONICS]: {
    name: 'Electronics',
    description: 'Electronic devices with significant value',
    examples: 'Computer, Smartphone, TV',
  },
  [AssetType.OTHER]: {
    name: 'Other',
    description: 'Any other valuable asset',
    examples: 'Collectibles, Furniture, Jewelry',
  },
};

/**
 * Default chart colors for consistent UI
 */
export const CHART_COLORS = [
  '#1E88E5', // Blue
  '#43A047', // Green
  '#FB8C00', // Orange
  '#E53935', // Red
  '#8E24AA', // Purple
  '#3949AB', // Indigo
  '#00ACC1', // Cyan
  '#558B2F', // Light Green
  '#D81B60', // Pink
  '#6D4C41', // Brown
];

/**
 * Date format options for display in the app
 */
export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (31.12.2023)' },
];

/**
 * Periods for reports and analytics
 */
export const REPORT_PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Range' },
];