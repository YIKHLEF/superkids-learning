import api from './api';
import { ChildProfile, SensoryPreference } from '../types';

interface ProfileResponse {
  status: string;
  data: {
    profile: ChildProfile;
  };
}

interface ProfilesResponse {
  status: string;
  data: {
    profiles: ChildProfile[];
  };
}

export const profileService = {
  /**
   * Get profile by ID
   */
  async getProfile(id: string): Promise<ChildProfile> {
    const response = await api.get<ProfileResponse>(`/profiles/${id}`);
    return response.data.data.profile;
  },

  /**
   * Update profile
   */
  async updateProfile(id: string, updates: Partial<ChildProfile>): Promise<ChildProfile> {
    const response = await api.put<ProfileResponse>(`/profiles/${id}`, updates);
    return response.data.data.profile;
  },

  /**
   * Update preferences
   */
  async updatePreferences(
    id: string,
    preferences: Partial<ChildProfile['preferences']>
  ): Promise<any> {
    const response = await api.patch(`/profiles/${id}/preferences`, preferences);
    return response.data;
  },

  /**
   * Update sensory preferences
   */
  async updateSensoryPreferences(
    id: string,
    preferences: SensoryPreference[]
  ): Promise<ChildProfile> {
    const response = await api.put<ProfileResponse>(`/profiles/${id}`, {
      sensoryPreferences: preferences,
    });
    return response.data.data.profile;
  },

  /**
   * Get all child profiles (for parents/educators)
   */
  async getChildProfiles(): Promise<ChildProfile[]> {
    const response = await api.get<ProfilesResponse>('/profiles/children/all');
    return response.data.data.profiles;
  },
};

export default profileService;
