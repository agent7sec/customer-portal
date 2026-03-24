import type { DataProvider } from '@refinedev/core';
import { apiClient } from './apiProvider';
import { parseApiError } from '../types/errors';

/**
 * Refine-compatible data provider for API Gateway integration
 * Provides CRUD operations for resources like subscriptions, plans, analyses, etc.
 */
export const dataProvider: DataProvider = {
    getList: async ({ resource, pagination, filters, sorters }) => {
        try {
            const current = pagination?.current ?? 1;
            const pageSize = pagination?.pageSize ?? 10;
            
            const params: Record<string, any> = {
                page: current,
                limit: pageSize,
            };

            if (filters) {
                filters.forEach((filter) => {
                    if ('field' in filter && 'operator' in filter && 'value' in filter) {
                        params[filter.field] = filter.value;
                    }
                });
            }

            if (sorters && sorters.length > 0) {
                const sorter = sorters[0];
                params.sort = sorter.field;
                params.order = sorter.order;
            }

            const response: any = await apiClient.get(`/${resource}`, { params });

            return {
                data: response.data || response.items || response,
                total: response.total || response.data?.length || 0,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    getOne: async ({ resource, id }) => {
        try {
            const response: any = await apiClient.get(`/${resource}/${id}`);
            return {
                data: response.data || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    getMany: async ({ resource, ids }) => {
        try {
            const response: any = await apiClient.get(`/${resource}`, {
                params: { ids: ids.join(',') },
            });
            return {
                data: response.data || response.items || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    create: async ({ resource, variables }) => {
        try {
            const response: any = await apiClient.post(`/${resource}`, variables);
            return {
                data: response.data || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    createMany: async ({ resource, variables }) => {
        try {
            const response: any = await apiClient.post(`/${resource}/bulk`, { items: variables });
            return {
                data: response.data || response.items || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    update: async ({ resource, id, variables }) => {
        try {
            const response: any = await apiClient.put(`/${resource}/${id}`, variables);
            return {
                data: response.data || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    updateMany: async ({ resource, ids, variables }) => {
        try {
            const response: any = await apiClient.put(`/${resource}/bulk`, {
                ids,
                data: variables,
            });
            return {
                data: response.data || response.items || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    deleteOne: async ({ resource, id }) => {
        try {
            const response: any = await apiClient.delete(`/${resource}/${id}`);
            return {
                data: response.data || response || { id },
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    deleteMany: async ({ resource, ids }) => {
        try {
            const response: any = await apiClient.delete(`/${resource}/bulk`, {
                data: { ids },
            });
            return {
                data: response.data || response.items || ids.map(id => ({ id })),
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },

    getApiUrl: () => '',

    custom: async ({ url, method, payload, query, headers }) => {
        try {
            let response: any;
            
            switch (method) {
                case 'get':
                    response = await apiClient.get(url, { params: query, headers });
                    break;
                case 'post':
                    response = await apiClient.post(url, payload, { headers });
                    break;
                case 'put':
                    response = await apiClient.put(url, payload, { headers });
                    break;
                case 'patch':
                    response = await apiClient.patch(url, payload, { headers });
                    break;
                case 'delete':
                    response = await apiClient.delete(url, { headers });
                    break;
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }

            return {
                data: response.data || response,
            };
        } catch (error) {
            throw parseApiError(error);
        }
    },
};

export const subscriptionDataProvider = {
    getPlans: () => dataProvider.getList({ resource: 'plans', pagination: { current: 1, pageSize: 100, mode: 'server' } }),
    getCurrentSubscription: () => dataProvider.custom?.({ url: '/subscriptions/current', method: 'get' }),
    createSubscription: (data: any) => dataProvider.create({ resource: 'subscriptions', variables: data }),
    updateSubscription: (id: string, data: any) => dataProvider.update({ resource: 'subscriptions', id, variables: data }),
    cancelSubscription: (id: string) => dataProvider.deleteOne({ resource: 'subscriptions', id }),
};

export const analysisDataProvider = {
    getAnalyses: (params?: any) => dataProvider.getList({ resource: 'analyses', ...params }),
    getAnalysis: (id: string) => dataProvider.getOne({ resource: 'analyses', id }),
    createAnalysis: (data: any) => dataProvider.create({ resource: 'analyses', variables: data }),
};

export const certificateDataProvider = {
    getCertificates: (params?: any) => dataProvider.getList({ resource: 'certificates', ...params }),
    getCertificate: (id: string) => dataProvider.getOne({ resource: 'certificates', id }),
};
