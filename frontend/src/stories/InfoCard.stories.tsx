import type { Meta, StoryObj } from '@storybook/react';
import InfoCard from '../components/Common/InfoCard';
import AccessibleButton from '../components/Common/AccessibleButton';

const meta: Meta<typeof InfoCard> = {
  title: 'Composants/InfoCard',
  component: InfoCard,
  args: {
    title: 'Carte d’apprentissage',
    subtitle: 'Plan de séance',
    description: 'Présente une activité avec un vocabulaire clair et concis pour éviter la surcharge cognitive.',
    badges: ['Calme', 'Visuel', '3-5 ans'],
  },
};

export default meta;
type Story = StoryObj<typeof InfoCard>;

export const AvecAction: Story = {
  args: {
    action: <AccessibleButton size="small">Commencer</AccessibleButton>,
  },
};

export const SansAction: Story = {};
