import { 
  IconWallet, 
  IconChartPie, 
  IconChartLine, 
  IconPigMoney,
  IconBuilding,
  IconCurrencyBitcoin,
  IconArchive,
  IconBriefcase,
  IconPercentage,
  IconGift,
  IconPlus,
  IconHome,
  IconCar,
  IconBolt,
  IconHeartbeat,
  IconBook,
  IconShoppingBag,
  IconMinus,
  IconArrowsExchange,
  IconChefHat,
  IconDeviceTv,
  IconShoppingCart,
  IconCreditCard,
  IconCashBanknote,
  IconStethoscope,
  IconDeviceLaptop,
  IconCube
} from '@tabler/icons-react';
import React from 'react';

/**
 * Get a React icon component based on an icon name
 * @param iconName The name of the icon to display
 * @returns The corresponding React icon component
 */
export const getIconByName = (iconName?: string): React.ReactNode => {
  if (!iconName) return <IconWallet size={14} />;

  switch (iconName.toLowerCase()) {
    // Account category icons
    case 'piggy-bank':
    case 'pig-money':
      return <IconPigMoney size={14} />;
    case 'credit-card':
      return <IconCreditCard size={14} />;
    case 'chart-line':
      return <IconChartLine size={14} />;
    case 'currency-bitcoin':
      return <IconCurrencyBitcoin size={14} />;
    case 'building':
      return <IconBuilding size={14} />;
    case 'wallet':
    case 'cash':
      return <IconWallet size={14} />;
    case 'archive':
      return <IconArchive size={14} />;
    case 'cash-banknote':
      return <IconCashBanknote size={14} />;

    // Transaction category icons - Income
    case 'briefcase':
      return <IconBriefcase size={14} />;
    case 'percentage':
      return <IconPercentage size={14} />;
    case 'chart-pie':
      return <IconChartPie size={14} />;
    case 'gift':
      return <IconGift size={14} />;
    case 'plus':
      return <IconPlus size={14} />;

    // Transaction category icons - Expense
    case 'utensils':
    case 'chef-hat':
      return <IconChefHat size={14} />;
    case 'home':
      return <IconHome size={14} />;
    case 'car':
      return <IconCar size={14} />;
    case 'film':
    case 'device-tv':
      return <IconDeviceTv size={14} />;
    case 'bolt':
    case 'bulb':
      return <IconBolt size={14} />;
    case 'heartbeat':
    case 'stethoscope':
      return <IconStethoscope size={14} />;
    case 'book':
      return <IconBook size={14} />;
    case 'shopping-bag':
    case 'shopping-cart':
      return <IconShoppingCart size={14} />;
    case 'minus':
      return <IconMinus size={14} />;

    // Transaction type icons
    case 'arrows-exchange':
      return <IconArrowsExchange size={14} />;

    // Asset type icons
    case 'chart-candlestick':
      return <IconChartLine size={14} />;
    case 'device-laptop':
      return <IconDeviceLaptop size={14} />;
    case 'box':
    case 'cube':
      return <IconCube size={14} />;

    // Default fallback
    default:
      return <IconWallet size={14} />;
  }
};