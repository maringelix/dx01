import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock do axios para evitar chamadas reais
jest.mock('axios');

describe('App Component', () => {
  it('should render the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should have App class in container', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });
});
