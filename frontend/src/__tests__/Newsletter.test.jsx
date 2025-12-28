import React from 'react';
import { render, screen } from '@testing-library/react';
import Newsletter from '../pages/Newsletter';

describe('Newsletter', () => {
  it('renders Newsletter component', () => {
    render(<Newsletter />);
    expect(screen.getByText(/Subscribe/i)).toBeInTheDocument();
  });

  it('shows input for email', () => {
    render(<Newsletter />);
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
  });
}); 