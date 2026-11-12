import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionCard } from '../banking/TransactionCard/TransactionCard.web';
import { Badge } from '../core/Badge/Badge.web';
import { Button } from '../core/Button/Button.web';
import { Icon } from '../core/Icon/Icon.web';
import { InputField } from '../core/InputField/InputField.web';

const meta = {
  title: 'Banking/Example: Home screen',
  parameters: {
    docs: { description: { story: 'A product screen built only from system components, with no custom styling: the top level of the composition ladder (tokens → core → banking → screens). Check it in dark mode and RTL.' } },
  },
} satisfies Meta;

export default meta;

export const HomeScreen: StoryObj = {
  render: () => (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <section aria-labelledby="balance" className="flex flex-col gap-4 rounded-xl bg-brand p-6 text-fg-on-brand shadow-lg">
        <div className="flex items-center justify-between">
          <h2 id="balance" className="text-sm font-medium">Current account</h2>
          <Badge tone="accent">Sharia-compliant</Badge>
        </div>
        <p className="tabular text-display font-bold" dir="ltr">AED 18,240.00</p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" leadingIcon={<Icon name="arrow-up-right" size={16} />}>Send</Button>
          <Button variant="secondary" size="sm" leadingIcon={<Icon name="arrow-down-left" size={16} />}>Request</Button>
        </div>
      </section>

      <form className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6" onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-lg font-semibold">Quick transfer</h2>
        <InputField label="To" placeholder="Name, IBAN or mobile" />
        <InputField label="Amount" variant="amount" currency="AED" placeholder="0.00" hint="No fees for Mal-to-Mal transfers" />
        <Button type="submit" size="lg" fullWidth>Review transfer</Button>
      </form>

      <section aria-labelledby="recent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="recent" className="text-lg font-semibold">Recent activity</h2>
          <Button variant="tertiary" size="sm">View all</Button>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          <li><TransactionCard variant="compact" merchant="Talabat" amount={{ minor: 6450, currency: 'AED' }} direction="debit" date="2026-11-12T13:05:00+04:00" category="food" onClick={() => {}} /></li>
          <li><TransactionCard variant="compact" merchant="Salary · Emaar" amount={{ minor: 2450000, currency: 'AED' }} direction="credit" date="2026-11-01T09:00:00+04:00" category="salary" onClick={() => {}} /></li>
          <li><TransactionCard variant="compact" merchant="DEWA" amount={{ minor: 41230, currency: 'AED' }} direction="debit" date="2026-10-29T08:00:00+04:00" category="bills" status="pending" onClick={() => {}} /></li>
        </ul>
      </section>
    </div>
  ),
};
