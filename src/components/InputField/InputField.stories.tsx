import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { InputField } from './InputField';

const meta = {
  title: 'Components/InputField',
  component: InputField,
  tags: ['autodocs'],
  args: { label: 'Beneficiary name', placeholder: 'e.g. Fatima Al Mansoori' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'amount'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    prefix: { control: false },
    suffix: { control: false },
  },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Labelled text input. `label` is required, hint and error are wired to `aria-describedby`, and `error` sets `aria-invalid`. ' +
          'The `amount` variant is tuned for money: tabular figures, a currency adornment, and the decimal keypad on mobile.',
      },
    },
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: { label: 'IBAN', placeholder: 'AE07 0331 2345 6789 0123 456', hint: '23 characters, starting with AE.' },
};

export const Error: Story = {
  args: {
    label: 'IBAN',
    defaultValue: 'AE07 0331',
    error: 'This IBAN is too short. UAE IBANs have 23 characters.',
    required: true,
  },
};

export const Amount: Story = {
  args: {
    label: 'Amount to send',
    variant: 'amount',
    currency: 'AED',
    placeholder: '0.00',
    hint: 'Available balance AED 18,240.00',
  },
};

export const AmountWithValidation: Story = {
  name: 'Amount (live validation)',
  render: function Render() {
    const [value, setValue] = useState('25000');
    const amount = Number(value.replace(/,/g, ''));
    const error = Number.isNaN(amount)
      ? 'Enter a number.'
      : amount > 18240
        ? 'Amount exceeds your available balance.'
        : undefined;
    return (
      <InputField
        label="Amount to send"
        variant="amount"
        currency="AED"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hint="Available balance AED 18,240.00"
        error={error}
      />
    );
  },
};

export const WithPrefixAndSuffix: Story = {
  args: { label: 'Mobile number', prefix: '+971', suffix: 'UAE', type: 'tel', placeholder: '50 123 4567' },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Mal Current Account' } };

export const Arabic: Story = {
  args: { label: 'اسم المستفيد', placeholder: 'مثال: فاطمة المنصوري', hint: 'كما يظهر في الهوية الإماراتية' },
  decorators: [(Story) => <div dir="rtl" lang="ar"><Story /></div>],
};
