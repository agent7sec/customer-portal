import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import type {
    UserProfile,
    UpdateProfileData,
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

    async getUserProfile(): Promise<UserProfile> {
        const headers = await this.getAuthHeaders();
        const response = await axios.get(`${config.api.baseUrl}/users/me`, { headers });
        return this.mapToUserProfile(response.data);
    }

    async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
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

    async deleteAccount(password: string): Promise<void> {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${config.api.baseUrl}/users/me`, {
            headers,
            data: { password },
        });
    }

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
