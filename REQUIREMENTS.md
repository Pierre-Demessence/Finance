# Finance Management App: Detailed Requirements

## Overview
A comprehensive personal finance management application that allows users to track accounts, assets, transactions, and monitor net worth over time across multiple currencies and asset types.

## Core Features

### Account Management
- **Account Creation & Management**
  - Create, read, update, and delete accounts
  - Assign accounts to categories (e.g., Savings, Checking, Crypto, Investment)
  - Default account categories: Savings, Checking, Investment, Crypto, Real Estate, Cash, Other
  - User-defined custom categories

### Account Data Types
1. **Balance Records**
   - Record account balance at a specific date
   - Used as reference points for historical balances
   - Override previous transaction calculations

2. **Transactions**
   - Types: Income, Expense, Transfer
   - Record amount, date, category, description
   - Support for transfers between internal accounts
   - External transactions (from/to outside sources)
   - Transaction categories (customizable)
   - Default categories: 
     - Income: Salary, Interest, Dividends, Gifts, Other
     - Expenses: Food, Housing, Transportation, Entertainment, Utilities, Healthcare, Education, Shopping, Other

3. **Direct Asset Holdings**
   - Record ownership of specific assets without transaction history
   - Asset types: Cryptocurrency, Stocks, Real Estate, Vehicles, Electronics, Other
   - For each asset: quantity, acquisition price (optional), current value (retrieved via API where applicable)

### Balance Calculation Logic
- Balance at date X is calculated as:
  1. Find the most recent balance record before date X
  2. Apply all transactions between that balance record and date X
- Example:
  - January 2020: Balance record of €1,000
  - February 2020: Transaction of +€200
  - July 2021: Balance record of €1,500 (overwrites previous balance)
  - August 2021: Transaction of -€100
  - Balance in March 2020 = €1,000 + €200 = €1,200
  - Balance in July 2021 = €1,500 (direct from balance record)
  - Balance in August 2021 = €1,500 - €100 = €1,400

### Multi-Currency Support
- Support for multiple currencies in accounts and transactions
- Set a primary/base currency for the app
- Auto-conversion of all values to the primary currency
- Integration with currency exchange rate API
- Historical exchange rates for accurate past calculations

### Asset Valuation
- Real-time valuation of investment assets
- API integration for stocks, ETFs, mutual funds (via financial data provider)
- API integration for cryptocurrency valuation
- Manual valuation for other assets with optional auto-adjustment based on depreciation/appreciation models

### Net Worth Visualization
- Total net worth chart showing all accounts and assets over time
- Customizable time range (day, week, month, quarter, year)
- Breakdown of net worth by:
  - Account categories
  - Asset types
  - Individual accounts
- Category-based visualization of income and expenses

## User Interface Requirements
- Dashboard with key financial metrics
- Account management interface
- Transaction entry and management
- Asset management interface
- Reports and charts for financial analysis
- Settings for currency preferences, categories, etc.

## Future Features
- **External Account Integration**
  - Abstract "managed account" interface for connecting to external services
  - Integration with financial platforms:
    - Trading212
    - Coinbase
    - eToro
    - Banking APIs (Open Banking)
  - Automatic transaction import
  - Scheduled data synchronization

## Technical Implementation Details
- Next.js frontend with Mantine UI components
- Recharts for data visualization
- Zustand for state management
- TypeScript for type safety
- RESTful API architecture for external integrations
- Secure credential storage for API keys