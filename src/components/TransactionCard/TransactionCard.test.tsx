import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { TransactionCard, type TransactionCardProps } from './TransactionCard';

const base: TransactionCardProps = {
  merchant: 'Carrefour',
  amount: { minor: 12050, currency: 'AED' },
  direction: 'debit',
  date: '2026-11-10T14:30:00Z',
  category: 'shopping',
};

describe('TransactionCard', () => {
  it('shows a signed amount visually and a plain-language one to AT', () => {
    render(<TransactionCard {...base} />);
    expect(screen.getByText(/-AED\s?120\.50/)).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(/Spent AED\s?120\.50/)).toBeInTheDocument();
  });

  it('marks credits as received with a plus sign', () => {
    render(<TransactionCard {...base} direction="credit" category="salary" />);
    expect(screen.getByText(/\+AED\s?120\.50/)).toBeInTheDocument();
    expect(screen.getByText(/Received/)).toBeInTheDocument();
  });

  it('communicates status with text, not colour alone', () => {
    render(<TransactionCard {...base} status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('becomes a single button when interactive', async () => {
    const onClick = vi.fn();
    render(<TransactionCard {...base} onClick={onClick} />);
    const button = screen.getByRole('button', { name: /Carrefour.*Spent AED/ });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders a non-interactive card without a button role', () => {
    render(<TransactionCard {...base} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <TransactionCard {...base} />
        <TransactionCard {...base} variant="compact" status="failed" onClick={() => {}} />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});

describe('TransactionCard bidi', () => {
  it('isolates merchant names so Latin names render correctly in RTL', () => {
    render(<div dir="rtl"><TransactionCard {...base} merchant="Etisalat by e&" /></div>);
    expect(screen.getByText('Etisalat by e&').tagName).toBe('BDI');
  });
});
