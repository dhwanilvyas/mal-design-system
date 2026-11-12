import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { calculateZakat } from './calculateZakat';
import { ZakatCalculator } from './ZakatCalculator';

const nisab = { minor: 2_500_000, currency: 'AED' }; // AED 25,000

describe('calculateZakat', () => {
  it('charges 2.5% of net wealth at or above nisab', () => {
    expect(calculateZakat({ cash: 10_000_000 }, nisab.minor)).toMatchObject({ isDue: true, zakat: 250_000 });
    expect(calculateZakat({ cash: 2_500_000 }, nisab.minor)).toMatchObject({ isDue: true, zakat: 62_500 });
  });

  it('is not due below nisab', () => {
    expect(calculateZakat({ cash: 2_499_999 }, nisab.minor)).toMatchObject({ isDue: false, zakat: 0 });
  });

  it('deducts liabilities and never goes negative', () => {
    expect(calculateZakat({ cash: 5_000_000, liabilities: 3_000_000 }, nisab.minor)).toMatchObject({
      netWealth: 2_000_000,
      isDue: false,
    });
    expect(calculateZakat({ cash: 100, liabilities: 900 }, nisab.minor).netWealth).toBe(0);
  });

  it('rounds to the nearest fils', () => {
    expect(calculateZakat({ cash: 2_500_013 }, nisab.minor).zakat).toBe(62_500);
  });
});

describe('<ZakatCalculator />', () => {
  it('computes live and offers payment when due', async () => {
    const onPay = vi.fn();
    render(<ZakatCalculator nisab={nisab} variant="quick" onPay={onPay} />);
    await userEvent.type(screen.getByRole('textbox', { name: /Total zakatable wealth/ }), '100,000');
    const pay = screen.getByRole('button', { name: /Pay AED\s?2,500\.00 Zakat/ });
    await userEvent.click(pay);
    expect(onPay).toHaveBeenCalledWith(expect.objectContaining({ zakat: 250_000, currency: 'AED' }));
  });

  it('announces the result politely after typing pauses', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ZakatCalculator nisab={nisab} variant="quick" />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.type(screen.getByRole('textbox'), '1000');
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByRole('status')).toHaveTextContent(/No Zakat due/);
    vi.useRealTimers();
  });

  it('validates malformed amounts', async () => {
    render(<ZakatCalculator nisab={nisab} />);
    const cash = screen.getByRole('textbox', { name: /Cash & bank balances/ });
    await userEvent.type(cash, '12.345');
    expect(cash).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('button', { name: /Pay/ })).toBeNull();
  });

  it('subtracts liabilities in detailed mode', async () => {
    render(<ZakatCalculator nisab={nisab} onPay={() => {}} defaultValues={{ cash: '60000', liabilities: '40000' }} />);
    expect(screen.getByText(/Below nisab by/)).toBeInTheDocument();
  });

  it('has no axe violations in either variant', async () => {
    const { container } = render(
      <div>
        <ZakatCalculator nisab={nisab} variant="quick" />
        <ZakatCalculator nisab={nisab} variant="detailed" title="Detailed Zakat" headingLevel={3} defaultValues={{ cash: 'x' }} />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
