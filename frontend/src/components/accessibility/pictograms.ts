import calm from './assets/calm.svg';
import greet from './assets/greet.svg';
import help from './assets/help.svg';

export type PictogramCategory = 'emotions' | 'communication' | 'autonomy';

export interface PictogramAsset {
  id: string;
  label: string;
  description: string;
  category: PictogramCategory;
  src: string;
}

export const pictogramLibrary: PictogramAsset[] = [
  {
    id: 'calm',
    label: 'Calme',
    description: 'Indique un moment de calme ou de retour au calme.',
    category: 'emotions',
    src: calm,
  },
  {
    id: 'greet',
    label: 'Dire bonjour',
    description: 'Illustration pour encourager une salutation.',
    category: 'communication',
    src: greet,
  },
  {
    id: 'help',
    label: 'J’ai besoin d’aide',
    description: 'Permet à l’enfant de signaler qu’il a besoin d’aide.',
    category: 'autonomy',
    src: help,
  },
];

export const pictogramsById = pictogramLibrary.reduce<Record<string, PictogramAsset>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});
