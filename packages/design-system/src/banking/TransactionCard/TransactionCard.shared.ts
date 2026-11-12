import type { IconName } from '../../core/Icon/icons';
import { DEFAULT_LOCALE, formatMoney, formatSignedMoney, type Money } from '../money';

export type TransactionCategory =
  | 'shopping'
  | 'food'
  | 'bills'
  | 'transfer'
  | 'salary'
  | 'zakat'
  | 'charity'
  | 'travel'
  | 'other';

export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionDirection = 'debit' | 'credit';

export const categoryMeta: Record<TransactionCategory, { icon: IconName; label: string }> = {
  shopping: { icon: 'shopping-bag', label: 'Shopping' },
  food: { icon: 'food', label: 'Food & dining' },
  bills: { icon: 'bills', label: 'Bills & utilities' },
  transfer: { icon: 'transfer', label: 'Transfer' },
  salary: { icon: 'salary', label: 'Salary' },
  zakat: { icon: 'coins', label: 'Zakat' },
  charity: { icon: 'heart', label: 'Sadaqah' },
  travel: { icon: 'plane', label: 'Travel' },
  other: { icon: 'dots', label: 'Other' },
};

export interface TransactionCardBaseProps {
  /** Counterparty shown as the title, e.g. "Carrefour" or "Salary – Emirates NBD". */
  merchant: string;
  /** Always a positive amount in minor units; `direction` decides the sign. */
  amount: Money;
  direction: TransactionDirection;
  /** Booking date. ISO string or Date. */
  date: Date | string;
  category?: TransactionCategory;
  status?: TransactionStatus;
  /** Secondary line, e.g. a reference or note. Hidden in the compact variant. */
  description?: string;
  /** `default` = standalone card; `compact` = dense list row. */
  variant?: 'default' | 'compact';
  /** BCP 47 locale for number/date formatting. Defaults to `en-AE`; use `ar-AE` for Arabic. */
  locale?: string;
}

/** Everything both platforms render, computed once so web and native can't drift apart. */
export function describeTransaction({
  amount,
  direction,
  date,
  category = 'other',
  status = 'completed',
  variant = 'default',
  locale = DEFAULT_LOCALE,
}: TransactionCardBaseProps) {
  const isCompact = variant === 'compact';
  const isCredit = direction === 'credit';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return {
    meta: categoryMeta[category],
    isCompact,
    isCredit,
    status,
    dateObj,
    dateLabel: new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      ...(isCompact ? {} : { hour: 'numeric', minute: '2-digit' }),
    }).format(dateObj),
    /** "+AED 1,200.00" / "-AED 64.50". Visual only: the sign and colour aren't announced. */
    visualAmount: formatSignedMoney(amount, isCredit ? 'positive' : 'negative', locale),
    /** What screen readers hear instead of "minus": "Spent AED 64.50". */
    spokenAmount: `${isCredit ? 'Received' : 'Spent'} ${formatMoney(amount, locale)}`,
    statusLabel: status === 'pending' ? 'Pending' : status === 'failed' ? 'Failed' : undefined,
  };
}
