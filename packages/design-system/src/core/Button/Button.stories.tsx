import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon } from '../Icon/Icon.web';
import { Button } from './Button.web';

const meta = {
  title: 'Core/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Transfer money', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Triggers an action. Use **one primary** per region; pair with `secondary`/`tertiary` for alternatives. ' +
          'Defaults to `type="button"`. `loading` keeps focus on the button (uses `aria-disabled`, not `disabled`).',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">Pay bill</Button>
      <Button {...args} variant="secondary">Schedule</Button>
      <Button {...args} variant="tertiary">View details</Button>
      <Button {...args} variant="danger">Freeze card</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">Small · 32px</Button>
      <Button {...args} size="md">Medium · 40px</Button>
      <Button {...args} size="lg">Large · 48px</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    leadingIcon: <Icon name="arrow-up-right" size={16} />,
    children: 'Send',
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} />
      <Button {...args} variant="secondary" leadingIcon={<Icon name="arrow-down-left" size={16} />}>
        Request
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true, children: 'Processing payment' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const FullWidthMobileCTA: Story = {
  name: 'Full width (mobile CTA)',
  args: { fullWidth: true, size: 'lg', children: 'Continue' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div className="max-w-sm">
      <Button {...args} />
    </div>
  ),
};
