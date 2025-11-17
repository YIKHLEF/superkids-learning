import type { Meta, StoryObj } from '@storybook/react';
import AccessibilityPanel from '../components/accessibility/AccessibilityPanel';

const meta: Meta<typeof AccessibilityPanel> = {
  title: 'Accessibilite/Panneau',
  component: AccessibilityPanel,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof AccessibilityPanel>;

export const PanneauInteractif: Story = {
  render: () => <AccessibilityPanel onChange={(options) => console.log(options)} />,
};
