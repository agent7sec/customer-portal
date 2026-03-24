import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import type {
    UserProfile,
    UpdateProfileData,
    ChangePasswordData,
    UpdateEmailData,
} from '../types/account.types';

class AccountService {
    private async getAuthHeaders(): Promise<Record<string, string>> {
        // Ensure tokens are fresh
        const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
        return {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Get current user profile
     */
    async getUserProfile(): Promise<UserProfile> {
        const headers = await this.getAuthHeaders();
        const response = await axios.get(`${config.api.baseUrl}/users/me`, { headers });
        return this.mapToUserProfile(response.data);
    }

    /**
     * Update user profile with validation
     */
    async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
        // Validate profile data
        this.validateProfileData(data);

        const headers = await this.getAuthHeaders();
        const response = await axios.patch(
            `${config.api.baseUrl}/users/me`,
            {
                user_metadata: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    company: data.company,
                    jobTitle: data.jobTitle,
                },
            },
            { headers }
        );
        return this.mapToUserProfile(response.data);
    }

    /**
     * Change user password with validation
     */
    async changePassword(data: ChangePasswordData): Promise<void> {
        // Validate password data
        this.validatePasswordData(data);

        const headers = await this.getAuthHeaders();
        await axios.post(
            `${config.api.baseUrl}/users/me/change-password`,
            {
                current_password: data.currentPassword,
                new_password: data.newPassword,
            },
            { headers }
        );
    }

    /**
     * Update user email with validation
     */
    async updateEmail(data: UpdateEmailData): Promise<void> {
        // Validate email data
        this.validateEmailData(data);

        const headers = await this.getAuthHeaders();
        await axios.post(
            `${config.api.baseUrl}/users/me/change-email`,
            {
                new_email: data.newEmail,
                password: data.password,
            },
            { headers }
        );
    }

    /**
     * Delete user account
     */
    async deleteAccount(password: string): Promise<void> {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${config.api.baseUrl}/users/me`, {
            headers,
            data: { password },
        });
    }

    /**
     * Validate profile update data
     */
    private validateProfileData(data: UpdateProfileData): void {
        if (data.firstName !== undefined && data.firstName.trim().length === 0) {
            throw new Error('First name cannot be empty');
        }

        if (data.lastName !== undefined && data.lastName.trim().length === 0) {
            throw new Error('Last name cannot be empty');
        }

        if (data.phone !== undefined && data.phone.trim().length > 0) {
            // Basic phone validation (allows various formats)
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(data.phone)) {
                throw new Error('Invalid phone number format');
            }
        }

        if (data.firstName && data.firstName.length > 100) {
            throw new Error('First name is too long (max 100 characters)');
        }

        if (data.lastName && data.lastName.length > 100) {
            throw new Error('Last name is too long (max 100 characters)');
        }

        if (data.company && data.company.length > 200) {
            throw new Error('Company name is too long (max 200 characters)');
        }

        if (data.jobTitle && data.jobTitle.length > 100) {
            throw new Error('Job title is too long (max 100 characters)');
        }
    }

    /**
     * Validate password change data
     */
    private validatePasswordData(data: ChangePasswordData): void {
        if (!data.currentPassword || data.currentPassword.trim().length === 0) {
            throw new Error('Current password is required');
        }

        if (!data.newPassword || data.newPassword.trim().length === 0) {
            throw new Error('New password is required');
        }

        if (!data.confirmPassword || data.confirmPassword.trim().length === 0) {
            throw new Error('Password confirmation is required');
        }

        if (data.newPassword !== data.confirmPassword) {
            throw new Error('New password and confirmation do not match');
        }

        // Password strength validation
        if (data.newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(data.newPassword)) {
            throw new Error('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(data.newPassword)) {
            throw new Error('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(data.newPassword)) {
            throw new Error('Password must contain at least one number');
        }

        if (data.currentPassword === data.newPassword) {
            throw new Error('New password must be different from current password');
        }
    }

    /**
     * Validate email update data
     */
    private validateEmailData(data: UpdateEmailData): void {
        if (!data.newEmail || data.newEmail.trim().length === 0) {
            throw new Error('New email is required');
        }

        if (!data.password || data.password.trim().length === 0) {
            throw new Error('Password is required to change email');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.newEmail)) {
            throw new Error('Invalid email format');
        }

        if (data.newEmail.length > 255) {
            throw new Error('Email is too long (max 255 characters)');
        }
    }

    /**
     * Map API response to UserProfile interface
     */
    private mapToUserProfile(data: any): UserProfile {
        return {
            id: data.user_id || data.sub,
            email: data.email,
            emailVerified: data.email_verified,
            firstName: data.user_metadata?.firstName || data.given_name || '',
            lastName: data.user_metadata?.lastName || data.family_name || '',
            fullName: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
            picture: data.picture,
            phone: data.user_metadata?.phone,
            company: data.user_metadata?.company,
            jobTitle: data.user_metadata?.jobTitle,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
}

export const accountService = new AccountService();
