import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/home';
import { AuthContext } from '../auth/AuthProvider.jsx';

jest.mock('../layouts/navbar.jsx', () => () => <div>Navbar</div>);
jest.mock('../layouts/footer.jsx', () => () => <div>Footer</div>);
jest.mock('../pages/Newsletter.jsx', () => () => <div>Newsletter</div>);
jest.mock('../services/addPropertyService.jsx', () => ({ fetchPropertiesService: jest.fn(() => Promise.resolve([])) }));

describe('Home Page', () => {
  it('renders home page', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Test User' } }}>
        <Home />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );
    expect(screen.getByText(/Find Your Perfect/i)).toBeInTheDocument();
  });

  it('shows Explore Properties button', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Test User' } }}>
        <Home />
      </AuthContext.Provider>,
      { wrapper: MemoryRouter }
    );
    expect(screen.getByRole('link', { name: /Explore Properties/i })).toBeInTheDocument();
  });
}); 