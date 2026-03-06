export interface UserProfile {
    id: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    fullName: string;
    picture?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
}
