import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutUs from '../pages/AboutUs';

jest.mock('../layouts/navbar.jsx', () => () => <div>Navbar</div>);
jest.mock('../layouts/footer.jsx', () => () => <div>Footer</div>);
jest.mock('../assets/a.png', () => 'a.png');
jest.mock('../assets/c.png', () => 'c.png');

describe('AboutUs Page', () => {
  it('renders AboutUs page', () => {
    render(<AboutUs />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Properties Listed/i)).toBeInTheDocument();
  });

  it('shows team member name', () => {
    render(<AboutUs />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Bhumi Singh Subedi/i)).toBeInTheDocument();
  });
}); 