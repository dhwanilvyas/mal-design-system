import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from './Button';

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'button');
  });

  it('is operable by keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Transfer</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('blocks clicks while loading but stays focusable', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Pay</Button>);
    const button = screen.getByRole('button', { name: 'Pay' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards refs (React 19 ref-as-prop)', () => {
    let node: HTMLButtonElement | null = null;
    render(<Button ref={(el) => { node = el; }}>Ref</Button>);
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it('has no axe violations across variants', async () => {
    const { container } = render(
      <div>
        {(['primary', 'secondary', 'tertiary', 'danger'] as const).map((v) => (
          <Button key={v} variant={v}>{v}</Button>
        ))}
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
