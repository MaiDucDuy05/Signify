import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LogIn from './LogIn';
import * as api from '../../utils/api';

jest.mock('../../utils/api', () => ({
    __esModule: true,
    default: { interceptors: { request: { use: jest.fn() } } },
    login: jest.fn(),
    logout: jest.fn(),
}));

const renderLogin = () =>
    render(
        <MemoryRouter>
            <AuthProvider>
                <LogIn />
            </AuthProvider>
        </MemoryRouter>
    );

describe('LogIn Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form with email/password inputs and submit button', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Enter Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        renderLogin();
        const emailInput = screen.getByPlaceholderText('Enter Email');
        const passwordInput = screen.getByPlaceholderText('Enter Password');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls login API with correct credentials on form submit', async () => {
        api.login.mockResolvedValue({
            data: { token: 'fake-token', user: { id: '1', name: 'Test' } },
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
            target: { value: 'pass123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'pass123',
            });
        });
    });

    it('shows alert on login failure', async () => {
        const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });
        api.login.mockRejectedValue({
            response: { data: { error: 'Invalid credentials' } },
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
            target: { value: 'bad@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
            target: { value: 'wrong' },
        });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Invalid credentials');
        });

        mockAlert.mockRestore();
    });
});
