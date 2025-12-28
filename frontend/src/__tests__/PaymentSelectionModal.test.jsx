// __tests__/PaymentSelectionModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentSelectionModal from '../components/payment/PaymentSelectionModal';

jest.mock('../../assets/eSewa.png', () => 'eSewa.png');
jest.mock('../../assets/khalti.png', () => 'khalti.png');

describe('PaymentSelectionModal', () => {
  const onClose = jest.fn();
  const onSelectPaymentMethod = jest.fn();

  it('does not render when show is false', () => {
    const { container } = render(
      <PaymentSelectionModal show={false} onClose={onClose} onSelectPaymentMethod={onSelectPaymentMethod} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders and allows payment method selection', () => {
    render(
      <PaymentSelectionModal show={true} onClose={onClose} onSelectPaymentMethod={onSelectPaymentMethod} />
    );
    expect(screen.getByText(/choose payment method/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/pay with khalti/i));
    expect(onSelectPaymentMethod).toHaveBeenCalledWith('khalti');
    fireEvent.click(screen.getByText(/pay with esewa/i));
    expect(onSelectPaymentMethod).toHaveBeenCalledWith('esewa');
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PaymentSelectionModal show={true} onClose={onClose} onSelectPaymentMethod={onSelectPaymentMethod} />
    );
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
}); 