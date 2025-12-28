import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactPage from '../pages/contactUs';

jest.mock('../layouts/navbar.jsx', () => () => <div>Navbar</div>);

describe('ContactPage', () => {
  it('renders Contact page', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Email Us/i)).toBeInTheDocument();
  });

  it('shows Call Us method', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Call Us/i)).toBeInTheDocument();
  });
}); 