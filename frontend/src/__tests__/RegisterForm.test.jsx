import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../components/auth/RegisterForm';

jest.mock('../hooks/userRegisterUserTan.js', () => ({
  useRegisterUserTan: () => ({ mutate: jest.fn(), isPending: false })
}));

jest.mock('react-toastify', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

describe('RegisterForm', () => {
  it('renders all input fields and the submit button', () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/password/i)[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows error if fields are empty and submit is clicked', () => {
    const { toast } = require('react-toastify');
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(toast.error).toHaveBeenCalledWith('Please fill all the fields');
  });

  it('shows error if passwords do not match', () => {
    const { toast } = require('react-toastify');
    render(<RegisterForm />);
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'John Doe', name: 'fullName' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), { target: { value: '1234567890', name: 'phoneNumber' } });
    fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'pass1', name: 'password' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'pass2', name: 'confirmPassword' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Tenant', name: 'stakeholder' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
  });
}); 