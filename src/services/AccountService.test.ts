import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountService } from './AccountService';
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import type { UpdateProfileData, ChangePasswordData, UpdateEmailData } from '../types/account.types';

vi.mock('axios');
vi.mock('./Auth0Service');

describe('AccountService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth0Service.getTokens).mockReturnValue({
            accessToken: 'test-token',
            idToken: 'test-id-token',
            refreshToken: 'test-refresh-token',
            expiresAt: new Date(Date.now() + 3600000),
        });
    });

    describe('updateProfile', () => {
        it('should validate and update profile successfully', async () => {
            const profileData: UpdateProfileData = {
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1234567890',
                company: 'Test Corp',
                jobTitle: 'Developer',
            };

            const mockResponse = {
                data: {
                    user_id: 'auth0|123',
                    email: 'john@example.com',
                    email_verified: true,
                    user_metadata: {
                        firstName: 'John',
                        lastName: 'Doe',
                        phone: '+1234567890',
                        company: 'Test Corp',
                        jobTitle: 'Developer',
                    },
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                },
            };

            vi.mocked(axios.patch).mockResolvedValue(mockResponse);

            const result = await accountService.updateProfile(profileData);

            expect(result.firstName).toBe('John');
            expect(result.lastName).toBe('Doe');
            expect(result.phone).toBe('+1234567890');
        });

        it('should throw error for empty first name', async () => {
            const profileData: UpdateProfileData = {
                firstName: '   ',
            };

            await expect(accountService.updateProfile(profileData)).rejects.toThrow('First name cannot be empty');
        });

        it('should throw error for invalid phone format', async () => {
            const profileData: UpdateProfileData = {
                phone: 'invalid-phone!@#',
            };

            await expect(accountService.updateProfile(profileData)).rejects.toThrow('Invalid phone number format');
        });

        it('should throw error for too long first name', async () => {
            const profileData: UpdateProfileData = {
                firstName: 'a'.repeat(101),
            };

            await expect(accountService.updateProfile(profileData)).rejects.toThrow('First name is too long');
        });
    });

    describe('changePassword', () => {
        it('should validate password requirements', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'OldPass123',
                newPassword: 'NewPass123',
                confirmPassword: 'NewPass123',
            };

            vi.mocked(axios.post).mockResolvedValue({ data: {} });

            await accountService.changePassword(passwordData);

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/change-password'),
                expect.objectContaining({
                    current_password: 'OldPass123',
                    new_password: 'NewPass123',
                }),
                expect.any(Object)
            );
        });

        it('should throw error if passwords do not match', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'OldPass123',
                newPassword: 'NewPass123',
                confirmPassword: 'DifferentPass123',
            };

            await expect(accountService.changePassword(passwordData)).rejects.toThrow('do not match');
        });

        it('should throw error for weak password (too short)', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'OldPass123',
                newPassword: 'Short1',
                confirmPassword: 'Short1',
            };

            await expect(accountService.changePassword(passwordData)).rejects.toThrow('at least 8 characters');
        });

        it('should throw error for password without uppercase', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'OldPass123',
                newPassword: 'newpass123',
                confirmPassword: 'newpass123',
            };

            await expect(accountService.changePassword(passwordData)).rejects.toThrow('uppercase letter');
        });

        it('should throw error for password without lowercase', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'OldPass123',
                newPassword: 'NEWPASS123',
                confirmPassword: 'NEWPASS123',
            };

            await expect(accountService.changePassword(passwordData)).rejects.toThrow('lowercase letter');
        });

        it('should throw error for password without number', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'OldPass123',
                newPassword: 'NewPassword',
                confirmPassword: 'NewPassword',
            };

            await expect(accountService.changePassword(passwordData)).rejects.toThrow('number');
        });

        it('should throw error if new password same as current', async () => {
            const passwordData: ChangePasswordData = {
                currentPassword: 'SamePass123',
                newPassword: 'SamePass123',
                confirmPassword: 'SamePass123',
            };

            await expect(accountService.changePassword(passwordData)).rejects.toThrow('must be different');
        });
    });

    describe('updateEmail', () => {
        it('should validate and update email successfully', async () => {
            const emailData: UpdateEmailData = {
                newEmail: 'newemail@example.com',
                password: 'Password123',
            };

            vi.mocked(axios.post).mockResolvedValue({ data: {} });

            await accountService.updateEmail(emailData);

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/change-email'),
                expect.objectContaining({
                    new_email: 'newemail@example.com',
                    password: 'Password123',
                }),
                expect.any(Object)
            );
        });

        it('should throw error for invalid email format', async () => {
            const emailData: UpdateEmailData = {
                newEmail: 'invalid-email',
                password: 'Password123',
            };

            await expect(accountService.updateEmail(emailData)).rejects.toThrow('Invalid email format');
        });

        it('should throw error for empty email', async () => {
            const emailData: UpdateEmailData = {
                newEmail: '   ',
                password: 'Password123',
            };

            await expect(accountService.updateEmail(emailData)).rejects.toThrow('New email is required');
        });

        it('should throw error for missing password', async () => {
            const emailData: UpdateEmailData = {
                newEmail: 'newemail@example.com',
                password: '',
            };

            await expect(accountService.updateEmail(emailData)).rejects.toThrow('Password is required');
        });

        it('should throw error for too long email', async () => {
            const emailData: UpdateEmailData = {
                newEmail: 'a'.repeat(250) + '@example.com',
                password: 'Password123',
            };

            await expect(accountService.updateEmail(emailData)).rejects.toThrow('Email is too long');
        });
    });

    describe('getUserProfile', () => {
        it('should fetch and map user profile correctly', async () => {
            const mockResponse = {
                data: {
                    user_id: 'auth0|123',
                    email: 'test@example.com',
                    email_verified: true,
                    given_name: 'John',
                    family_name: 'Doe',
                    name: 'John Doe',
                    picture: 'https://example.com/pic.jpg',
                    user_metadata: {
                        phone: '+1234567890',
                        company: 'Test Corp',
                        jobTitle: 'Developer',
                    },
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                },
            };

            vi.mocked(axios.get).mockResolvedValue(mockResponse);

            const profile = await accountService.getUserProfile();

            expect(profile.id).toBe('auth0|123');
            expect(profile.email).toBe('test@example.com');
            expect(profile.emailVerified).toBe(true);
            expect(profile.firstName).toBe('John');
            expect(profile.lastName).toBe('Doe');
            expect(profile.fullName).toBe('John Doe');
            expect(profile.phone).toBe('+1234567890');
            expect(profile.company).toBe('Test Corp');
            expect(profile.jobTitle).toBe('Developer');
        });
    });
});
