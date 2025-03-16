# Bug to Fix:

* Dashboard/Homepage
  * ✓ Recent Transactions is empty
  * ✓ Expenses by Category is empty
  * ✓ Accounts Total Balance shows 0 even if some account has a non 0 balance
  * ✓ Cash Flow (30d) shows 0 even if there are transactions
  * ✓ Net Worth tab doesn't show the proper value per date (it always shows the most recent one).
  * ✓ Expenses by Category also shows income and transfer transactions (which is not logical).

* Reports Page
  * ✓ Net Cash Flow, Total Income, Total Expenses show 0 even if there are transactionsd.
  * ✓ Net Worth tab doesn't show the proper value per date (it always shows the most recent one).
  * ✓ Income and Expenses tab are empty

* Account Details Page:
  * ✓ Balance History is empty. It says "Balance data available for 3 date points" even tho there are more than 3 transactions with different dates.

* Transaction Form
  * ✓ When editing a transaction, the Category is not retained.
  * ✓ When editing a transfer transaction, the "To Account" is not retained.

* Assets Page:
  * ✓ Editing an asset to change the acquisition date doesn't save the date.
  * ✓ Other tab doesn't work

* Others:
  * Fix theme selection flickering on page load. (It starts with light theme, then swith to dark theme)
  * ✓ Fix area charts not having any area (nor lines)


# Features to Implements:
* Dashboard/Homepage
  * ✓ Clicking on the Accounts and Assets cards should link to the proper page.
  * ✓ Add the total assets value to the Asset card

* Transactions List:
  * ✓ Clicking on the Account name should link to the Account Details Page.
  * ✓ Change number of transactions we can see at once

* Account Details Page:
  * ✓ Clicking on the Account name in the "From/To" column should link to the Account Details Page (not when it's External of course).
  * ✓ Pagination for transaction list

* Assets Page:
  * Show acquisition value

* Reports Page:
  * ✓ Modify Top Income/Expense Categories so it looks like the Assets Summary card in the Assets Page.

* System:
  * Implement Account Records:
      - Record account balance at a specific date
      - Used as reference points for historical balances
      - Override previous transaction calculations
  
  * Budget system
  
  * ✓ Default icons for all the categories (account categories, income/expense category, assets). And show the icons when relevant.

  * ✓ Demo Data
  * ✓ Can configure demo data generation (how many transactions, timespan, etc..) in a config file (outsidee of dataSlice.ts directly).
  * ✓ Allow to unarchive an account
  * ✓ Rework README
  * Refactor code and make components to avoid duplications.
  * Do something with tags, notes, recurring transaction checkbox?

  * Connect to Third Party Services
    * Load Data from:
      * Trading212
      * eToro
      * Coinbase
    * Track prices of Stocks/Crypto
    * Track price of currency exchange