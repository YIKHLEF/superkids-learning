import type { Meta, StoryObj } from '@storybook/react';
import CustomVideoPlayer from '../components/media/CustomVideoPlayer';
import AnimatedMediaCard from '../components/media/AnimatedMediaCard';

const meta: Meta<typeof CustomVideoPlayer> = {
  title: 'Media/CustomVideoPlayer',
  component: CustomVideoPlayer,
  parameters: { layout: 'centered' },
  args: {
    title: 'Routine du matin',
    description: 'Une courte démonstration vidéo avec contrôles accessibles.',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
  },
};

export default meta;
type Story = StoryObj<typeof CustomVideoPlayer>;

export const AvecAnimation: Story = {
  render: (args) => (
    <AnimatedMediaCard title="Vidéo accompagnée" detail="Transitions douces pour réduire la charge sensorielle.">
      <CustomVideoPlayer {...args} />
    </AnimatedMediaCard>
  ),
};
