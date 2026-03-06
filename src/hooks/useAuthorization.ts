import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/SubscriptionService';

export const useAuthorization = () => {
    const { user, isAuthenticated } = useAuth();

    /**
     * Check if current user owns a resource
     */
    const canAccessResource = (resourceUserId: string): boolean => {
        return isAuthenticated && user?.id === resourceUserId;
    };

    /**
     * Check if user has an active subscription
     */
    const hasActiveSubscription = async (): Promise<boolean> => {
        if (!isAuthenticated) return false;
        try {
            const subscription = await subscriptionService.getCurrentSubscription();
            return subscription?.status === 'active';
        } catch {
            return false;
        }
    };

    /**
     * Check if user can perform analysis (has subscription with remaining analyses)
     */
    const canPerformAnalysis = async (): Promise<boolean> => {
        if (!isAuthenticated) return false;
        try {
            const subscription = await subscriptionService.getCurrentSubscription();
            return subscription?.status === 'active';
        } catch {
            return false;
        }
    };

    return {
        canAccessResource,
        hasActiveSubscription,
        canPerformAnalysis,
        isAuthenticated,
        userId: user?.id,
    };
};
