import type { Meta, StoryObj } from '@storybook/react';
import AccessibleButton from '../components/Common/AccessibleButton';

const meta: Meta<typeof AccessibleButton> = {
  title: 'Composants/AccessibleButton',
  component: AccessibleButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Valider',
    variant: 'contained',
    color: 'primary',
    description: 'Bouton accessible avec cible tactile élargie',
  },
};

export default meta;
type Story = StoryObj<typeof AccessibleButton>;

export const Primaire: Story = {};

export const Secondaire: Story = {
  args: {
    color: 'secondary',
    children: 'Suivant',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outlined',
    children: 'Explorer',
  },
};
