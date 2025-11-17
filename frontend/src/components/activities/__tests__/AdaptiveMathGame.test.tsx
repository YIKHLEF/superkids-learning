import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdaptiveMathGame from '../AdaptiveMathGame';
import { DifficultyLevel } from '../../../types';

describe('AdaptiveMathGame', () => {
  it('adapte le niveau en cas de réussite', () => {
    const onLevelChange = jest.fn();
    render(<AdaptiveMathGame initialDifficulty={DifficultyLevel.BEGINNER} onLevelChange={onLevelChange} />);

    fireEvent.click(screen.getByText('Réponse correcte'));

    expect(onLevelChange).toHaveBeenCalledWith(DifficultyLevel.INTERMEDIATE);
    expect(screen.getByText(/niveau intermediate/i)).toBeInTheDocument();
  });

  it('simplifie la difficulté après une erreur', () => {
    const onLevelChange = jest.fn();
    render(<AdaptiveMathGame initialDifficulty={DifficultyLevel.INTERMEDIATE} onLevelChange={onLevelChange} />);

    fireEvent.click(screen.getByText('Besoin d\'aide'));

    expect(onLevelChange).toHaveBeenCalledWith(DifficultyLevel.BEGINNER);
    expect(screen.getByText(/niveau beginner/i)).toBeInTheDocument();
  });
});
