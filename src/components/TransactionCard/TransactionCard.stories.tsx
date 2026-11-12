import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TransactionCard, type TransactionCardProps } from './TransactionCard';

const meta = {
  title: 'Components/TransactionCard',
  component: TransactionCard,
  tags: ['autodocs'],
  args: {
    merchant: 'Carrefour Mall of the Emirates',
    amount: { minor: 34575, currency: 'AED' },
    direction: 'debit',
    date: '2026-11-10T14:32:00+04:00',
    category: 'shopping',
    status: 'completed',
    description: 'Card •• 4821',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'compact'] },
    status: { control: 'inline-radio', options: ['completed', 'pending', 'failed'] },
    direction: { control: 'inline-radio', options: ['debit', 'credit'] },
    locale: { control: 'inline-radio', options: ['en-AE', 'ar-AE'] },
  },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'A single transaction. Amounts are `Money` in **minor units** (no floats). Sign and colour are visual only; ' +
          'screen readers hear "Spent" or "Received". Status always has a text label. Pass `onClick` to make the whole card a button.',
      },
    },
  },
} satisfies Meta<typeof TransactionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Credit: Story = {
  args: {
    merchant: 'Salary · Emaar Properties',
    amount: { minor: 2450000, currency: 'AED' },
    direction: 'credit',
    category: 'salary',
    description: 'November payroll',
  },
};

export const Pending: Story = { args: { status: 'pending', merchant: 'Emirates Airline', category: 'travel', amount: { minor: 289000, currency: 'AED' } } };

export const Failed: Story = { args: { status: 'failed', merchant: 'DEWA', category: 'bills', description: 'Insufficient funds' } };

export const Interactive: Story = { args: { onClick: fn() } };

const feed: TransactionCardProps[] = [
  { merchant: 'Talabat', amount: { minor: 6450, currency: 'AED' }, direction: 'debit', date: '2026-11-12T13:05:00+04:00', category: 'food' },
  { merchant: 'Zakat · Mal Giving', amount: { minor: 125000, currency: 'AED' }, direction: 'debit', date: '2026-11-11T09:00:00+04:00', category: 'zakat' },
  { merchant: 'Ahmed Khan', amount: { minor: 50000, currency: 'AED' }, direction: 'credit', date: '2026-11-10T18:20:00+04:00', category: 'transfer', status: 'pending' },
  { merchant: 'Etisalat by e&', amount: { minor: 29900, currency: 'AED' }, direction: 'debit', date: '2026-11-09T08:00:00+04:00', category: 'bills', status: 'failed' },
  { merchant: 'Dubai Cares', amount: { minor: 10000, currency: 'AED' }, direction: 'debit', date: '2026-11-08T21:45:00+04:00', category: 'charity' },
];

export const CompactList: Story = {
  name: 'Compact (list)',
  render: (args) => (
    <ul aria-label="Recent transactions" className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {feed.map((tx) => (
        <li key={tx.merchant}>
          <TransactionCard {...tx} variant="compact" onClick={args.onClick} locale={args.locale} />
        </li>
      ))}
    </ul>
  ),
  args: { onClick: fn() },
};

export const ArabicLocale: Story = {
  name: 'Arabic (ar-AE, RTL)',
  args: { merchant: 'كارفور', description: 'بطاقة •• 4821', locale: 'ar-AE' },
  decorators: [(Story) => <div dir="rtl" lang="ar"><Story /></div>],
};
