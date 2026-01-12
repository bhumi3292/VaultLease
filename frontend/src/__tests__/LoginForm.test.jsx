import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { AuthContext } from '../auth/AuthProvider.jsx';

jest.mock('../hooks/useLoginUser.js', () => ({
  useLoginUser: () => ({ mutate: jest.fn(), isLoading: false })
}));

describe('LoginForm', () => {
  it('renders login form', () => {
    render(
      <AuthContext.Provider value={{ login: jest.fn() }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Login to VaultLease/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stakeholder/i)).toBeInTheDocument();
  });

  it('shows validation error if fields are empty', async () => {
    render(
      <AuthContext.Provider value={{ login: jest.fn() }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
  });
}); 