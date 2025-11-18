import settingsReducer, {
  setContrastLevel,
  setFontSize,
  setGlobalVolume,
  setPalette,
  setTheme,
  toggleSetting,
  updateAccessibility,
  setColorScheme,
} from '../settingsSlice';
import { AccessibilitySettings } from '../../../types';

describe('settingsSlice', () => {
  const baseAccessibility: AccessibilitySettings = {
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    fontSize: 'medium',
    colorScheme: 'light',
    soundEnabled: true,
    audioCuesEnabled: true,
    animationsEnabled: true,
    contrastLevel: 'standard',
    palette: 'calm',
    globalVolume: 80,
    dyslexiaFont: false,
    autoRead: false,
    sensoryProfile: 'standard',
  };

  it('met à jour les préférences en masse', () => {
    const state = settingsReducer(undefined, updateAccessibility({ reducedMotion: true, fontSize: 'large' }));
    expect(state.accessibility.reducedMotion).toBe(true);
    expect(state.accessibility.fontSize).toBe('large');
  });

  it('bascule une option booléenne', () => {
    const state = settingsReducer(undefined, toggleSetting('screenReader'));
    expect(state.accessibility.screenReader).toBe(true);
  });

  it('active le thème haute-contraste en ajustant les préférences dérivées', () => {
    const state = settingsReducer({ accessibility: baseAccessibility, theme: 'default' }, setTheme('high-contrast'));
    expect(state.accessibility.highContrast).toBe(true);
    expect(state.accessibility.contrastLevel).toBe('maximum');
    expect(state.accessibility.palette).toBe('monochrome');
  });

  it('active le mode hypersensible et réduit les sollicitations', () => {
    const state = settingsReducer({ accessibility: baseAccessibility, theme: 'default' }, setTheme('hypersensitive'));
    expect(state.accessibility.reducedMotion).toBe(true);
    expect(state.accessibility.animationsEnabled).toBe(false);
    expect(state.accessibility.soundEnabled).toBe(false);
    expect(state.accessibility.sensoryProfile).toBe('hypersensitive');
  });

  it('définit la taille de police et la palette', () => {
    let state = settingsReducer(undefined, setFontSize('extra-large'));
    expect(state.accessibility.fontSize).toBe('extra-large');
    state = settingsReducer(state, setPalette('vibrant'));
    expect(state.accessibility.palette).toBe('vibrant');
  });

  it('applique un niveau de contraste et bascule highContrast selon le niveau', () => {
    let state = settingsReducer(undefined, setContrastLevel('maximum'));
    expect(state.accessibility.highContrast).toBe(true);
    state = settingsReducer(state, setContrastLevel('standard'));
    expect(state.accessibility.highContrast).toBe(false);
  });

  it('change le schéma de couleurs sans toucher aux autres préférences', () => {
    const state = settingsReducer(undefined, setColorScheme('dark'));
    expect(state.accessibility.colorScheme).toBe('dark');
    expect(state.accessibility.palette).toBe('calm');
  });

  it('normalise le volume global et synchronise soundEnabled', () => {
    let state = settingsReducer(undefined, setGlobalVolume(120));
    expect(state.accessibility.globalVolume).toBe(100);
    expect(state.accessibility.soundEnabled).toBe(true);
    state = settingsReducer(state, setGlobalVolume(0));
    expect(state.accessibility.globalVolume).toBe(0);
    expect(state.accessibility.soundEnabled).toBe(false);
  });
});
