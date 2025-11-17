import type { Meta, StoryObj } from '@storybook/react';
import Pictogram from '../components/accessibility/Pictogram';
import { pictogramLibrary } from '../components/accessibility/pictograms';

const meta: Meta<typeof Pictogram> = {
  title: 'Accessibilite/Pictogrammes',
  component: Pictogram,
  args: {
    pictogram: pictogramLibrary[0],
    size: 120,
  },
};

export default meta;
type Story = StoryObj<typeof Pictogram>;

export const Calme: Story = {};

export const DireBonjour: Story = {
  args: { pictogram: pictogramLibrary[1] },
};

export const BesoinAide: Story = {
  args: { pictogram: pictogramLibrary[2] },
};
