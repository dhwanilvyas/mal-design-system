import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './core/Button/Button.web';
import { InputField } from './core/InputField/InputField.web';
import { TransactionCard } from './banking/TransactionCard/TransactionCard.web';
import { installMalProbe, scan } from './probe';

afterEach(() => vi.useRealTimers());

describe('scan', () => {
  it('counts system components and reports full coverage when nothing is hand-written', () => {
    const { container } = render(
      <>
        <Button>Send</Button>
        <Button variant="secondary">Request</Button>
        <InputField label="Amount" />
        <TransactionCard merchant="Talabat" amount={{ minor: 6450, currency: 'AED' }} direction="debit" date="2026-11-11" onClick={() => {}} />
      </>,
    );
    const r = scan(container, 'test');
    expect(r.components).toMatchObject({ Button: 2, InputField: 1, TransactionCard: 1 });
    expect(r.unmanaged).toEqual({});
    expect(r.coverage).toBe(1);
  });

  it('flags interactive elements with no system component above them', () => {
    const { container } = render(
      <>
        <Button>Managed</Button>
        <button type="button">Plain</button>
        <input aria-label="Plain input" />
        <div role="button">Fake button</div>
      </>,
    );
    const r = scan(container);
    expect(r.unmanaged).toEqual({ button: 2, input: 1 });
    expect(r.coverage).toBeCloseTo(1 / 4);
  });

  it('returns null coverage for a page with nothing interactive', () => {
    const { container } = render(<p>Hello</p>);
    expect(scan(container).coverage).toBeNull();
  });
});

describe('installMalProbe', () => {
  it('reports after the DOM settles and again only when the counts change', async () => {
    vi.useFakeTimers();
    const report = vi.fn();
    const { container, rerender } = render(<Button>One</Button>);
    const stop = installMalProbe({ app: 'test', report, root: container, debounceMs: 100 });

    // MutationObserver delivers on a microtask; let it run before advancing the fake clock.
    const settle = async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(150);
    };

    await settle();
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0]![0]).toMatchObject({ app: 'test', components: { Button: 1 } });

    rerender(<Button>One, relabelled</Button>);
    await settle();
    expect(report).toHaveBeenCalledTimes(1);

    rerender(
      <>
        <Button>One</Button>
        <button type="button">Plain</button>
      </>,
    );
    await settle();
    expect(report).toHaveBeenCalledTimes(2);
    expect(report.mock.calls[1]![0].unmanaged).toEqual({ button: 1 });

    stop();
  });

  it('does nothing when not sampled', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const report = vi.fn();
    const { container } = render(<Button>One</Button>);
    installMalProbe({ app: 'test', report, root: container, sampleRate: 0.05, debounceMs: 10 });
    vi.advanceTimersByTime(50);
    expect(report).not.toHaveBeenCalled();
  });
});
