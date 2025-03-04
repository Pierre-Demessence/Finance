export const financeConfig = {
  currency: '€',
  currencyPosition: 'before' as 'before' | 'after',
  locale: 'de-DE',  // Used for number formatting
};

export const formatCurrency = (amount: number): string => {
  const formatted = amount.toLocaleString(financeConfig.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return financeConfig.currencyPosition === 'before' 
    ? `${financeConfig.currency}${formatted}`
    : `${formatted}${financeConfig.currency}`;
};