import api from './api';
import { Activity, ActivitySession, ActivityCategory } from '../types';

interface ActivitiesResponse {
  status: string;
  data: {
    activities: Activity[];
  };
}

interface ActivityResponse {
  status: string;
  data: {
    activity: Activity;
  };
}

interface SessionResponse {
  status: string;
  data: {
    session: ActivitySession;
  };
}

export const activityService = {
  /**
   * Get all activities
   */
  async getAllActivities(): Promise<Activity[]> {
    const response = await api.get<ActivitiesResponse>('/activities');
    return response.data.data.activities;
  },

  /**
   * Get activity by ID
   */
  async getActivityById(id: string): Promise<Activity> {
    const response = await api.get<ActivityResponse>(`/activities/${id}`);
    return response.data.data.activity;
  },

  /**
   * Get activities by category
   */
  async getActivitiesByCategory(category: ActivityCategory): Promise<Activity[]> {
    const response = await api.get<ActivitiesResponse>(`/activities/category/${category}`);
    return response.data.data.activities;
  },

  /**
   * Start activity session
   */
  async startActivity(childId: string, activityId: string): Promise<ActivitySession> {
    const response = await api.post<SessionResponse>('/activities/session/start', {
      childId,
      activityId,
    });
    return response.data.data.session;
  },

  /**
   * Complete activity session
   */
  async completeActivity(
    sessionId: string,
    data: { successRate: number; emotionalState?: string }
  ): Promise<ActivitySession> {
    const response = await api.post<SessionResponse>(
      `/activities/session/${sessionId}/complete`,
      data
    );
    return response.data.data.session;
  },

  /**
   * Update activity session
   */
  async updateActivitySession(
    sessionId: string,
    updates: Partial<ActivitySession>
  ): Promise<ActivitySession> {
    const response = await api.patch<SessionResponse>(
      `/activities/session/${sessionId}`,
      updates
    );
    return response.data.data.session;
  },
};

export default activityService;
