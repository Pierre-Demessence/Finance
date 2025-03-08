import { TransactionType } from '@/models';
import dayjs from 'dayjs';

/**
 * Returns the appropriate color based on transaction type or value sign
 */
export function getStatusColor(
  type: TransactionType | string | 'positive' | 'negative', 
  defaultColor = undefined
) {
  if (type === TransactionType.INCOME || type === 'positive') return 'teal';
  if (type === TransactionType.EXPENSE || type === 'negative') return 'red';
  if (type === TransactionType.TRANSFER) return 'blue';
  return defaultColor;
}

/**
 * Formats a percentage value with consistent decimals and optional symbol
 */
export function formatPercentage(value: number, decimals = 1, includeSymbol = true) {
  return `${value.toFixed(decimals)}${includeSymbol ? '%' : ''}`;
}

/**
 * Returns a standard color for account categories
 */
export function getAccountCategoryColor(index: number) {
  const colors = ['blue', 'teal', 'violet', 'indigo', 'cyan', 'green'];
  return colors[index % colors.length];
}

/**
 * Date helper functions for consistent date handling
 */
export const dateHelpers = {
  /**
   * Gets a date range based on a period string
   */
  getDateRangeByPeriod: (period: '7d' | '30d' | '90d' | '1y'): [Date, Date] => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = dayjs().subtract(7, 'day').toDate();
        break;
      case '30d':
        startDate = dayjs().subtract(30, 'day').toDate();
        break;
      case '90d':
        startDate = dayjs().subtract(90, 'day').toDate();
        break;
      case '1y':
        startDate = dayjs().subtract(1, 'year').toDate();
        break;
    }
    
    return [startDate, endDate];
  },
  
  /**
   * Formats a date consistently across the application
   */
  formatDate: (date: Date, format = 'MMM D, YYYY') => {
    return dayjs(date).format(format);
  }
};