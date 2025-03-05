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

// Default account categories (merged from both files)
export const DEFAULT_ACCOUNT_CATEGORIES: AccountCategory[] = [
  { id: 'cat_banking', name: 'Banking', icon: 'wallet', isDefault: true },
  { id: 'cat_cash', name: 'Cash', icon: 'cash', isDefault: true },
  { id: 'cat_investment', name: 'Investments', icon: 'chart-line', isDefault: true },
  { id: 'cat_credit', name: 'Credit Cards', icon: 'credit-card', isDefault: true },
  { id: 'cat_loan', name: 'Loans', icon: 'cash-banknote', isDefault: true }
];

// Default transaction categories (merged from both files)
export const DEFAULT_TRANSACTION_CATEGORIES: TransactionCategory[] = [
  // Income categories
  { id: 'tcat_salary', name: 'Salary', type: TransactionType.INCOME, icon: 'wallet', isDefault: true },
  { id: 'tcat_interest', name: 'Interest', type: TransactionType.INCOME, icon: 'percentage', isDefault: true },
  { id: 'tcat_dividends', name: 'Dividends', type: TransactionType.INCOME, icon: 'chart-pie', isDefault: true },
  { id: 'tcat_gift', name: 'Gifts', type: TransactionType.INCOME, icon: 'gift', isDefault: true },
  { id: 'tcat_other_income', name: 'Other Income', type: TransactionType.INCOME, icon: 'plus', isDefault: true },
  
  // Expense categories
  { id: 'tcat_housing', name: 'Housing', type: TransactionType.EXPENSE, icon: 'home', isDefault: true },
  { id: 'tcat_food', name: 'Food & Dining', type: TransactionType.EXPENSE, icon: 'chef-hat', isDefault: true },
  { id: 'tcat_transportation', name: 'Transportation', type: TransactionType.EXPENSE, icon: 'car', isDefault: true },
  { id: 'tcat_utilities', name: 'Utilities', type: TransactionType.EXPENSE, icon: 'bulb', isDefault: true },
  { id: 'tcat_shopping', name: 'Shopping', type: TransactionType.EXPENSE, icon: 'shopping-cart', isDefault: true },
  { id: 'tcat_entertainment', name: 'Entertainment', type: TransactionType.EXPENSE, icon: 'device-tv', isDefault: true },
  { id: 'tcat_health', name: 'Health & Medical', type: TransactionType.EXPENSE, icon: 'stethoscope', isDefault: true },
  { id: 'tcat_education', name: 'Education', type: TransactionType.EXPENSE, icon: 'book', isDefault: true },
  { id: 'tcat_other_expense', name: 'Other Expenses', type: TransactionType.EXPENSE, icon: 'minus', isDefault: true },
  
  // Transfer category
  { id: 'tcat_transfer', name: 'Transfer', type: TransactionType.TRANSFER, icon: 'arrows-exchange', isDefault: true },
];

// Default user settings
export const DEFAULT_SETTINGS: Settings = {
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
    icon: 'currency-bitcoin'
  },
  [AssetType.STOCK]: {
    name: 'Stock',
    description: 'Ownership shares of a company',
    examples: 'Apple, Tesla, Amazon',
    icon: 'chart-candlestick'
  },
  [AssetType.REAL_ESTATE]: {
    name: 'Real Estate',
    description: 'Land and buildings owned',
    examples: 'House, Apartment, Land',
    icon: 'building'
  },
  [AssetType.VEHICLE]: {
    name: 'Vehicle',
    description: 'Cars, motorcycles, boats and other vehicles',
    examples: 'Car, Motorcycle, Boat',
    icon: 'car'
  },
  [AssetType.ELECTRONICS]: {
    name: 'Electronics',
    description: 'Electronic devices with significant value',
    examples: 'Computer, Smartphone, TV',
    icon: 'device-laptop'
  },
  [AssetType.OTHER]: {
    name: 'Other',
    description: 'Any other valuable asset',
    examples: 'Collectibles, Furniture, Jewelry',
    icon: 'box'
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