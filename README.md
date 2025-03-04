# Finance - Personal Finance Management Application

A comprehensive personal finance management application built with Next.js that allows you to track accounts, assets, transactions, and monitor your net worth over time across multiple currencies and asset types.

## Features

### Account Management
- Create and manage financial accounts (banking, investments, credit cards, etc.)
- Archive accounts you no longer actively use
- Organize accounts by customizable categories
- Track account balances over time

### Transaction Tracking
- Record income, expenses, and transfers between accounts
- Categorize transactions for better financial insights
- View transaction history by account or category
- Attach additional information like descriptions or notes

### Asset Management
- Track various asset types (cryptocurrency, stocks, real estate, etc.)
- Record acquisition date and purchase price
- Update current valuations
- Include assets in your overall net worth calculation

### Financial Reporting
- View your net worth over time
- Analyze income and expense trends
- Break down spending by categories
- Visualize your financial data through interactive charts

### Multi-Currency Support
- Track accounts and transactions in different currencies
- Automatic conversion to your base currency
- Historical and current exchange rate support

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **UI Library**: [Mantine UI](https://mantine.dev/)
- **Charts**: [Mantine Charts](https://mantine.dev/charts/getting-started/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Persistence**: Local storage (browser-based)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Create Accounts**: Start by setting up your financial accounts
2. **Add Transactions**: Record your income and expenses
3. **Track Assets**: Add any assets you own
4. **View Reports**: Analyze your financial situation through the reports section
5. **Adjust Settings**: Customize the application to your preferences in the settings page

## Development

This project uses TypeScript for type safety and follows the Next.js App Router architecture. The main components of the application are:

- `/src/app/*` - Page components
- `/src/components/*` - Reusable UI components
- `/src/store/*` - Zustand store for state management
- `/src/hooks/*` - Custom React hooks
- `/src/models/*` - TypeScript interfaces and type definitions
- `/src/config/*` - Application configuration

## License

[MIT](LICENSE)
