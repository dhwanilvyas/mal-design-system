import type { MouseEventHandler } from 'react';
import { Badge } from '../../core/Badge/Badge.web';
import { Icon } from '../../core/Icon/Icon.web';
import { cx } from '../../utils/cx';
import { variants } from '../../utils/variants';
import { describeTransaction, type TransactionCardBaseProps } from './TransactionCard.shared';

export type { TransactionCategory, TransactionDirection, TransactionStatus } from './TransactionCard.shared';

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

export interface TransactionCardProps extends TransactionCardBaseProps {
  /** Makes the whole card a button (e.g. open transaction details). */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function TransactionCard({ onClick, className, ...props }: TransactionCardProps) {
  const { merchant, description, variant = 'default' } = props;
  const { meta, isCompact, isCredit, status, dateObj, dateLabel, visualAmount, spokenAmount, statusLabel } =
    describeTransaction(props);

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
          {visualAmount}
        </span>
        <span className="sr-only">{spokenAmount}</span>
        {statusLabel && (
          <Badge tone={status === 'failed' ? 'danger' : 'warning'} icon={<Icon name={status === 'failed' ? 'x' : 'clock'} size={12} />}>
            {statusLabel}
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
