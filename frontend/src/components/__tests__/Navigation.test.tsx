import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navigation from '../Layout/Navigation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navigation Component', () => {
  it('should render navigation items', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Activités')).toBeInTheDocument();
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    expect(screen.getByText('Mes Progrès')).toBeInTheDocument();
    expect(screen.getByText('Ressources')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('should render SuperKids title', () => {
    renderWithRouter(<Navigation />);
    expect(screen.getByText('SuperKids')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    renderWithRouter(<Navigation />);
    expect(screen.getByText("Apprendre en s'amusant")).toBeInTheDocument();
  });
});
