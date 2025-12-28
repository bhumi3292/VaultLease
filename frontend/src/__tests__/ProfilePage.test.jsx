// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import ProfilePage from '../pages/profilePage';
// import { AuthContext } from '../auth/AuthProvider.jsx';
//
// jest.mock('../layouts/navbar', () => () => <div>Navbar</div>);
// jest.mock('../components/profile/UpdatePersonalInfoForm', () => () => <div>UpdatePersonalInfoForm</div>);
// jest.mock('../components/profile/ChangePasswordForm', () => () => <div>ChangePasswordForm</div>);
// jest.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: [], isLoading: false }), useMutation: () => [jest.fn(), { isLoading: false }] }));
//
// describe('ProfilePage', () => {
//   it('renders profile page', () => {
//     render(
//       <AuthContext.Provider value={{ user: { name: 'Test User', role: 'Tenant' }, loading: false, setUser: jest.fn(), isAuthenticated: true }}>
//         <ProfilePage />
//       </AuthContext.Provider>
//     );
//     expect(screen.getByText(/Navbar/i)).toBeInTheDocument();
//   });
//
//   it('shows loading state', () => {
//     jest.spyOn(require('@tanstack/react-query'), 'useQuery').mockReturnValueOnce({ data: [], isLoading: true });
//     render(
//       <AuthContext.Provider value={{ user: { name: 'Test User', role: 'Tenant' }, loading: false, setUser: jest.fn(), isAuthenticated: true }}>
//         <ProfilePage />
//       </AuthContext.Provider>
//     );
//     expect(screen.getByText(/Navbar/i)).toBeInTheDocument();
//   });
// });