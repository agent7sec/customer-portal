export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class ValidationError extends Error {
    constructor(
        message: string,
        public field?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network connection error') {
        super(message);
        this.name = 'NetworkError';
    }
}

export const isApiError = (error: unknown): error is ApiError => {
    return error instanceof ApiError;
};

export const isAuthError = (error: unknown): error is AuthenticationError => {
    return error instanceof AuthenticationError;
};
