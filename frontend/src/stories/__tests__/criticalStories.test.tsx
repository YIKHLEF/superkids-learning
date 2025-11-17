import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import * as ButtonStories from '../AccessibleButton.stories';
import * as ModalStories from '../Modal.stories';
import * as VideoStories from '../CustomVideoPlayer.stories';

const { Primaire } = composeStories(ButtonStories);
const { AccessibleModal } = composeStories(ModalStories);
const { AvecAnimation } = composeStories(VideoStories);

describe('Stories snapshots', () => {
  it('rend le bouton accessible sans régressions visuelles', () => {
    const { container } = render(<Primaire />);
    expect(container).toMatchSnapshot();
  });

  it('rend le modal accessible sans régressions visuelles', () => {
    const { container } = render(<AccessibleModal />);
    expect(container).toMatchSnapshot();
  });

  it('rend le lecteur vidéo animé sans régressions visuelles', () => {
    const { container } = render(<AvecAnimation />);
    expect(container).toMatchSnapshot();
  });
});
