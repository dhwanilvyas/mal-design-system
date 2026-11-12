import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { InputField } from './InputField';

describe('InputField', () => {
  it('associates the label with the input', () => {
    render(<InputField label="IBAN" />);
    expect(screen.getByRole('textbox', { name: 'IBAN' })).toBeInTheDocument();
  });

  it('includes the currency in the accessible name for amounts', () => {
    render(<InputField label="Amount" variant="amount" currency="AED" />);
    const input = screen.getByRole('textbox', { name: 'Amount (AED)' });
    expect(input).toHaveAttribute('inputmode', 'decimal');
  });

  it('links hint and error via aria-describedby and flags invalid', () => {
    render(<InputField label="Amount" hint="Daily limit AED 50,000" error="Exceeds your balance" />);
    const input = screen.getByRole('textbox', { name: 'Amount' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Exceeds your balance Daily limit AED 50,000');
  });

  it('keeps a visually hidden label accessible', () => {
    render(<InputField label="Search transactions" hideLabel />);
    expect(screen.getByRole('textbox', { name: 'Search transactions' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <InputField label="Name" hint="As on your Emirates ID" required />
        <InputField label="Amount" variant="amount" currency="AED" error="Required" />
        <InputField label="Disabled" disabled />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
