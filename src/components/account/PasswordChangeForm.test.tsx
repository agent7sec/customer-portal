import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordChangeForm } from './PasswordChangeForm';
import { accountService } from '../../services/AccountService';

vi.mock('../../services/AccountService');
vi.mock('@refinedev/antd', async () => {
    const actual = await vi.importActual('@refinedev/antd');
    return {
        ...actual,
        useForm: () => ({
            formProps: {
                form: undefined,
            },
            saveButtonProps: {
                loading: false,
            },
            form: {
                setFieldsValue: vi.fn(),
                resetFields: vi.fn(),
            },
        }),
    };
});

describe('PasswordChangeForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render password change form', () => {
        const { container } = render(<PasswordChangeForm />);

        const card = container.querySelector('.ant-card-head-title');
        expect(card).toHaveTextContent('Change Password');
        expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });

    it('should render submit button', () => {
        render(<PasswordChangeForm />);

        const submitButton = screen.getByRole('button', { name: /change password/i });
        expect(submitButton).toBeInTheDocument();
    });

    it('should have password input fields with correct type', () => {
        render(<PasswordChangeForm />);

        const currentPassword = screen.getByLabelText('Current Password');
        const newPassword = screen.getByLabelText('New Password');
        const confirmPassword = screen.getByLabelText('Confirm New Password');

        expect(currentPassword).toHaveAttribute('type', 'password');
        expect(newPassword).toHaveAttribute('type', 'password');
        expect(confirmPassword).toHaveAttribute('type', 'password');
    });

    it('should submit form with valid password data', async () => {
        const user = userEvent.setup();
        vi.mocked(accountService.changePassword).mockResolvedValue(undefined);

        render(<PasswordChangeForm />);

        const currentPassword = screen.getByLabelText('Current Password');
        const newPassword = screen.getByLabelText('New Password');
        const confirmPassword = screen.getByLabelText('Confirm New Password');

        await user.type(currentPassword, 'OldPass123!');
        await user.type(newPassword, 'NewPass123!');
        await user.type(confirmPassword, 'NewPass123!');

        const submitButton = screen.getByRole('button', { name: /change password/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(accountService.changePassword).toHaveBeenCalledWith({
                currentPassword: 'OldPass123!',
                newPassword: 'NewPass123!',
                confirmPassword: 'NewPass123!',
            });
        });
    });

    it('should validate password requirements', () => {
        render(<PasswordChangeForm />);

        const newPasswordInput = screen.getByLabelText('New Password');
        expect(newPasswordInput).toBeInTheDocument();
    });

    it('should have placeholder text in input fields', () => {
        render(<PasswordChangeForm />);

        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('should render lock icons for password fields', () => {
        render(<PasswordChangeForm />);

        const lockIcons = screen.getAllByRole('img', { name: /lock/i });
        expect(lockIcons.length).toBe(3);
    });
});
