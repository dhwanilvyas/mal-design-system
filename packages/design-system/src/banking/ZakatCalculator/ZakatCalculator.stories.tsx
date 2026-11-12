import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ZakatCalculator } from './ZakatCalculator.web';

// Illustrative nisab: 85g × ~AED 294/g. In production this comes from the pricing service.
const nisab = { minor: 2_499_000, currency: 'AED' };

const meta = {
  title: 'Banking/ZakatCalculator',
  component: ZakatCalculator,
  tags: ['autodocs'],
  args: { nisab, onPay: fn(), onChange: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['quick', 'detailed'] },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4] },
  },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Mal-specific widget, built **only from system primitives** (InputField, Button, tokens). It shows how product ' +
          'components should compose the system. The maths lives in a pure `calculateZakat()` (unit-tested, reusable server-side). ' +
          'Nisab is a prop because it moves with the gold price. The result is announced through a debounced polite live region.',
      },
    },
  },
} satisfies Meta<typeof ZakatCalculator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Detailed: Story = {
  args: { variant: 'detailed', defaultValues: { cash: '82,500', goldSilver: '18,000', investments: '40,000', liabilities: '12,000' } },
};

export const Quick: Story = { args: { variant: 'quick' } };

export const BelowNisab: Story = {
  args: { variant: 'detailed', defaultValues: { cash: '15,000', goldSilver: '4,000' } },
};

export const QuickInteraction: Story = {
  name: 'Quick (interaction test)',
  args: { variant: 'quick' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /Total zakatable wealth/ }), '100000');
    const pay = await canvas.findByRole('button', { name: /Pay AED\s?2,500\.00 Zakat/ });
    await userEvent.click(pay);
    await expect(args.onPay).toHaveBeenCalledWith(expect.objectContaining({ zakat: 250000 }));
  },
};
