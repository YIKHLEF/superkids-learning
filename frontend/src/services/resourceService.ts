import api from './api';
import { Resource } from '../types';

interface ResourcesResponse {
  status: string;
  data: {
    resources: Resource[];
  };
}

interface ResourceResponse {
  status: string;
  data: {
    resource: Resource;
  };
}

export const resourceService = {
  /**
   * Get all resources
   */
  async getAllResources(): Promise<Resource[]> {
    const response = await api.get<ResourcesResponse>('/resources');
    return response.data.data.resources;
  },

  /**
   * Get resources by type
   */
  async getResourcesByType(type: string): Promise<Resource[]> {
    const response = await api.get<ResourcesResponse>(`/resources/type/${type}`);
    return response.data.data.resources;
  },

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<Resource> {
    const response = await api.get<ResourceResponse>(`/resources/${id}`);
    return response.data.data.resource;
  },

  /**
   * Search resources
   */
  async searchResources(query: string): Promise<Resource[]> {
    const response = await api.get<ResourcesResponse>('/resources/search', {
      params: { query },
    });
    return response.data.data.resources;
  },
};

export default resourceService;
