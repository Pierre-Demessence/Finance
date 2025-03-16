import { Budget } from '@/models';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { TransactionsSlice } from './transactionsSlice';

dayjs.extend(isBetween);

export interface BudgetsSlice {
  budgets: Budget[];
  
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteBudget: (id: string) => boolean;
  getBudgetSpent: (budgetId: string) => number;
  getBudgetRemaining: (budgetId: string) => number;
}

type BudgetsStoreWithDependencies = BudgetsSlice & TransactionsSlice;

export const createBudgetsSlice: StateCreator<
  BudgetsStoreWithDependencies,
  [],
  [],
  BudgetsSlice
> = (set, get) => ({
  budgets: [],
  
  addBudget: (budget) => {
    const id = uuidv4();
    const now = new Date();
    
    set((state) => ({
      budgets: [
        ...state.budgets,
        {
          ...budget,
          id,
          createdAt: now,
          updatedAt: now,
        }
      ]
    }));
    
    return id;
  },
  
  updateBudget: (id, updates) => {
    let found = false;
    
    set((state) => ({
      budgets: state.budgets.map(budget => {
        if (budget.id === id) {
          found = true;
          return {
            ...budget,
            ...updates,
            updatedAt: new Date()
          };
        }
        return budget;
      })
    }));
    
    return found;
  },
  
  deleteBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter(budget => budget.id !== id)
    }));
    
    return true;
  },

  getBudgetSpent: (budgetId) => {
    const { budgets, transactions } = get();
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;

    // Get the start of the current period
    const now = dayjs();
    let periodStart = dayjs(budget.startDate);
    
    // If it's a recurring budget, adjust the start date to the current period
    if (budget.isRecurring) {
      while (periodStart.isBefore(now)) {
        switch (budget.period) {
          case 'weekly':
            periodStart = periodStart.add(1, 'week');
            break;
          case 'monthly':
            periodStart = periodStart.add(1, 'month');
            break;
          case 'yearly':
            periodStart = periodStart.add(1, 'year');
            break;
        }
      }
      // Move back one period to get the current period's start
      switch (budget.period) {
        case 'weekly':
          periodStart = periodStart.subtract(1, 'week');
          break;
        case 'monthly':
          periodStart = periodStart.subtract(1, 'month');
          break;
        case 'yearly':
          periodStart = periodStart.subtract(1, 'year');
          break;
      }
    }

    // Calculate period end date
    let periodEnd = budget.endDate ? dayjs(budget.endDate) : now;
    if (budget.isRecurring) {
      switch (budget.period) {
        case 'weekly':
          periodEnd = periodStart.add(1, 'week');
          break;
        case 'monthly':
          periodEnd = periodStart.add(1, 'month');
          break;
        case 'yearly':
          periodEnd = periodStart.add(1, 'year');
          break;
      }
    }

    // Sum up relevant transactions
    return transactions
      .filter(t => {
        // Only include expenses in specified categories
        if (t.type !== 'expense') return false;
        if (!budget.categoryIds.includes(t.categoryId)) return false;
        
        // Check if transaction falls within the budget period
        const txDate = dayjs(t.date);
        return txDate.isBetween(periodStart, periodEnd, null, '[]');
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getBudgetRemaining: (budgetId) => {
    const { budgets } = get();
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;

    const spent = get().getBudgetSpent(budgetId);
    return Math.max(0, budget.amount - spent);
  }
});