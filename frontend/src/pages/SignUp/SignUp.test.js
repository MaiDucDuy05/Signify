import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import SignUp from './SignUp';
import * as api from '../../utils/api';

jest.mock('../../utils/api', () => ({
    __esModule: true,
    default: { interceptors: { request: { use: jest.fn() } } },
    signup: jest.fn(),
    logout: jest.fn(),
}));

const renderSignUp = () =>
    render(
        <MemoryRouter>
            <AuthProvider>
                <SignUp />
            </AuthProvider>
        </MemoryRouter>
    );

describe('SignUp Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders signup form with name, email, password inputs and submit button', () => {
        renderSignUp();
        expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
        expect(screen.getByText('Sign Up', { selector: 'button span, button' })).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        renderSignUp();
        const nameInput = screen.getByPlaceholderText('Enter Name');
        const emailInput = screen.getByPlaceholderText('Enter Email');
        const passwordInput = screen.getByPlaceholderText('Enter Password');

        fireEvent.change(nameInput, { target: { value: 'NewUser' } });
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'secret123' } });

        expect(nameInput.value).toBe('NewUser');
        expect(emailInput.value).toBe('new@example.com');
        expect(passwordInput.value).toBe('secret123');
    });

    it('calls signup API with correct data on form submit', async () => {
        const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });
        api.signup.mockResolvedValue({});

        renderSignUp();

        fireEvent.change(screen.getByPlaceholderText('Enter Name'), {
            target: { value: 'TestUser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
            target: { value: 'pass123' },
        });

        fireEvent.submit(screen.getByPlaceholderText('Enter Name').closest('form'));

        await waitFor(() => {
            expect(api.signup).toHaveBeenCalledWith({
                name: 'TestUser',
                email: 'test@example.com',
                password: 'pass123',
            });
        });

        mockAlert.mockRestore();
    });

    it('shows error alert on signup failure', async () => {
        const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });
        api.signup.mockRejectedValue({
            response: { data: { error: 'Email already exists' } },
        });

        renderSignUp();

        fireEvent.change(screen.getByPlaceholderText('Enter Name'), {
            target: { value: 'User' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
            target: { value: 'exists@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
            target: { value: 'pass' },
        });

        fireEvent.submit(screen.getByPlaceholderText('Enter Name').closest('form'));

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Email already exists');
        });

        mockAlert.mockRestore();
    });
});
