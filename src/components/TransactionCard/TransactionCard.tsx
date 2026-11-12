import type { MouseEventHandler } from 'react';
import { Icon, type IconName } from '../../icons/Icon';
import { cx } from '../../utils/cx';
import { DEFAULT_LOCALE, formatMoney, formatSignedMoney, type Money } from '../../utils/money';
import { variants } from '../../utils/variants';
import { Badge } from '../Badge/Badge';

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

const categoryMeta: Record<TransactionCategory, { icon: IconName; label: string }> = {
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

const cardStyles = variants({
  base: 'flex w-full items-center text-start bg-surface text-fg',
  variants: {
    variant: {
      /** Standalone card: activity feeds, transaction detail entry points. */
      default: 'gap-3 rounded-lg border border-border p-4 shadow-sm',
      /** Dense row for lists. Wrap a set in a bordered container with dividers. */
      compact: 'gap-3 px-4 py-3',
    },
    interactive: {
      true: [
        'cursor-pointer transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-hover',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus',
      ].join(' '),
      false: '',
    },
  },
  defaults: { variant: 'default', interactive: 'false' },
});

export interface TransactionCardProps {
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
  /** Makes the whole card a button (e.g. open transaction details). */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** BCP 47 locale for number/date formatting. Defaults to `en-AE`; use `ar-AE` for Arabic. */
  locale?: string;
  className?: string;
}

export function TransactionCard({
  merchant,
  amount,
  direction,
  date,
  category = 'other',
  status = 'completed',
  description,
  variant = 'default',
  onClick,
  locale = DEFAULT_LOCALE,
  className,
}: TransactionCardProps) {
  const meta = categoryMeta[category];
  const isCompact = variant === 'compact';
  const isCredit = direction === 'credit';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    ...(isCompact ? {} : { hour: 'numeric', minute: '2-digit' }),
  }).format(dateObj);

  const content = (
    <>
      <span
        className={cx(
          'flex shrink-0 items-center justify-center rounded-md',
          isCompact ? 'size-8' : 'size-10',
          isCredit ? 'bg-success-subtle text-success-fg' : 'bg-surface-sunken text-fg-muted',
        )}
      >
        <Icon name={meta.icon} size={isCompact ? 16 : 20} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        {/* <bdi>: merchant names are user data in any script; isolate them so "e&" doesn't reorder in RTL. */}
        <bdi className="truncate font-medium text-fg">{merchant}</bdi>
        <span className="truncate text-sm text-fg-muted">
          {meta.label}
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          <time dateTime={dateObj.toISOString()}>{dateLabel}</time>
          {!isCompact && description && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, </span>
              <bdi>{description}</bdi>
            </>
          )}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        {/* Visual amount: sign + colour. Screen readers get an explicit verb instead. */}
        <span
          aria-hidden="true"
          dir="ltr"
          className={cx(
            'tabular font-semibold',
            isCompact ? 'text-sm' : 'text-md',
            status === 'failed' ? 'text-fg-subtle line-through' : isCredit ? 'text-success-fg' : 'text-fg',
          )}
        >
          {formatSignedMoney(amount, isCredit ? 'positive' : 'negative', locale)}
        </span>
        <span className="sr-only">
          {isCredit ? 'Received' : 'Spent'} {formatMoney(amount, locale)}
        </span>
        {status === 'pending' && (
          <Badge tone="warning" icon={<Icon name="clock" size={12} />}>
            Pending
          </Badge>
        )}
        {status === 'failed' && (
          <Badge tone="danger" icon={<Icon name="x" size={12} />}>
            Failed
          </Badge>
        )}
      </span>
    </>
  );

  const classes = cardStyles({ variant, interactive: onClick ? 'true' : 'false' }, className);

  // Only phrasing content (spans) is used above, so the same markup is valid inside a <button>.
  return onClick ? (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  );
}
