import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../ProfilePage';
import ResourcesPage from '../ResourcesPage';
import { store } from '../../store';

const renderWithStore = (component: React.ReactElement) =>
  render(<Provider store={store}>{component}</Provider>);

describe('Upload forms validation', () => {
  it('shows an error for unsupported avatar formats', () => {
    renderWithStore(<ProfilePage />);
    const input = screen.getByLabelText(/Mettre à jour l'avatar/i);

    const invalidFile = new File(['avatar'], 'avatar.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(
      screen.getByText('Format non supporté. Utilise PNG, JPEG ou WEBP.')
    ).toBeInTheDocument();
  });

  it('blocks oversized resource files', () => {
    renderWithStore(<ResourcesPage />);
    const input = screen.getByLabelText(/Ajouter une nouvelle ressource/i);

    const largeContent = new Uint8Array(12 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText('Fichier trop volumineux (10 Mo maximum).')).toBeInTheDocument();
  });
});
