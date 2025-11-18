import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import * as ThemeStories from '../stories/NeuroInclusiveTheme.stories';
import * as ButtonStories from '../stories/AccessibleButton.stories';

const { ModeStandard, ModeHauteContraste, ModeDyslexie, ModeHypersensibilite } = composeStories(ThemeStories);
const { Primaire } = composeStories(ButtonStories);

describe('Contrôles visuels Storybook', () => {
  it.each([
    ['standard', <ModeStandard />],
    ['haute-contraste', <ModeHauteContraste />],
    ['dyslexie', <ModeDyslexie />],
    ['hypersensibilité', <ModeHypersensibilite />],
  ])('rend le mode %s sans régression visuelle', (_, Story) => {
    const { container } = render(Story);
    expect(container).toMatchSnapshot();
  });
});

describe('Audits axe-core sur les composants critiques', () => {
  it('bouton accessible sans violations', async () => {
    const { container } = render(<Primaire />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('mode haute-contraste sans violations majeures', async () => {
    const { container } = render(<ModeHauteContraste />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
