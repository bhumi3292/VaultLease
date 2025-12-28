// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import CartProperty from '../pages/cartProperty';
// import { AuthContext } from '../auth/AuthProvider.jsx';
//
// describe('CartProperty', () => {
//   it('renders CartProperty page', () => {
//     render(
//       <AuthContext.Provider value={{ isAuthenticated: true, user: { name: 'Test User' }, logout: jest.fn(), loading: false }}>
//         <CartProperty />
//       </AuthContext.Provider>,
//       { wrapper: MemoryRouter }
//     );
//     expect(screen.getByText('Your Cart')).toBeInTheDocument();
//   });
// });