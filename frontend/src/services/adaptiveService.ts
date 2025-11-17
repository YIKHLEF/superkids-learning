import api from './api';
import { AdaptiveContext, AdaptiveRecommendation } from '../types';

interface AdaptiveResponse {
  status: string;
  data: {
    recommendation: AdaptiveRecommendation;
  };
}

export const adaptiveService = {
  /**
   * Récupère une recommandation d'adaptation depuis le backend.
   */
  async getRecommendations(context: AdaptiveContext): Promise<AdaptiveRecommendation> {
    const response = await api.post<AdaptiveResponse>('/adaptive/recommendations', context);
    return response.data.data.recommendation;
  },
};

export default adaptiveService;
