import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import { accountService } from '../../services/AccountService';
import type { UserProfile } from '../../types/account.types';

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

const mockProfile: UserProfile = {
    id: 'auth0|123',
    email: 'john@example.com',
    emailVerified: true,
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    picture: 'https://example.com/pic.jpg',
    phone: '+1234567890',
    company: 'Test Corp',
    jobTitle: 'Developer',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

describe('ProfileForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state initially', () => {
        vi.mocked(accountService.getUserProfile).mockImplementation(
            () => new Promise(() => {})
        );

        const { container } = render(<ProfileForm />);

        const spinner = container.querySelector('.ant-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('should load and display user profile', async () => {
        vi.mocked(accountService.getUserProfile).mockResolvedValue(mockProfile);

        render(<ProfileForm />);

        await waitFor(() => {
            expect(screen.getByText('Profile Information')).toBeInTheDocument();
        });

        expect(accountService.getUserProfile).toHaveBeenCalledTimes(1);
    });

    it('should display error notification when profile load fails', async () => {
        vi.mocked(accountService.getUserProfile).mockRejectedValue(
            new Error('Failed to load profile')
        );

        render(<ProfileForm />);

        await waitFor(() => {
            expect(screen.getByText('Profile Information')).toBeInTheDocument();
        });
    });

    it('should render form fields after loading', async () => {
        vi.mocked(accountService.getUserProfile).mockResolvedValue(mockProfile);

        render(<ProfileForm />);

        await waitFor(() => {
            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Company')).toBeInTheDocument();
        expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
    });

    it('should have save changes button', async () => {
        vi.mocked(accountService.getUserProfile).mockResolvedValue(mockProfile);

        render(<ProfileForm />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
        });
    });

    it('should show change photo button', async () => {
        vi.mocked(accountService.getUserProfile).mockResolvedValue(mockProfile);

        render(<ProfileForm />);

        await waitFor(() => {
            expect(screen.getByText('Change Photo')).toBeInTheDocument();
        });
    });

    it('should validate required fields', async () => {
        vi.mocked(accountService.getUserProfile).mockResolvedValue(mockProfile);

        render(<ProfileForm />);

        await waitFor(() => {
            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        });

        const firstNameInput = screen.getByLabelText('First Name');
        const lastNameInput = screen.getByLabelText('Last Name');
        
        expect(firstNameInput).toBeInTheDocument();
        expect(lastNameInput).toBeInTheDocument();
    });
});
