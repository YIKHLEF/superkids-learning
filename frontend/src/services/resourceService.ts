import api from './api';
import { Resource } from '../types';

export interface ResourceQueryParams {
  type?: string;
  category?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

interface ResourcesResponse {
  success: boolean;
  data: Resource[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ResourceResponse {
  success: boolean;
  data: Resource;
}

export const resourceService = {
  /**
   * Get all resources
   */
  async getAllResources(params?: ResourceQueryParams): Promise<ResourcesResponse> {
    const response = await api.get<ResourcesResponse>('/resources', {
      params: {
        ...params,
        tags: params?.tags?.join(','),
        search: params?.search,
      },
    });
    return response.data;
  },

  /**
   * Get resources by type
   */
  async getResourcesByType(type: string): Promise<Resource[]> {
    const response = await api.get<ResourcesResponse>(`/resources/type/${type}`);
    return response.data.data;
  },

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<Resource> {
    const response = await api.get<ResourceResponse>(`/resources/${id}`);
    return response.data.data;
  },

  /**
   * Search resources
   */
  async searchResources(query: string, params?: ResourceQueryParams): Promise<Resource[]> {
    const response = await api.get<ResourcesResponse>('/resources/search', {
      params: { q: query, ...params, tags: params?.tags?.join(',') },
    });
    return response.data.data;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Resource> {
    const response = await api.patch<ResourceResponse>(`/resources/${id}/favorite`, {
      isFavorite,
    });
    return response.data.data;
  },
};

export default resourceService;
