import api from './api';
import { AdaptiveContext, AdaptiveEngineResult } from '../types';

interface AdaptiveResponse {
  status: string;
  data: {
    recommendation: AdaptiveEngineResult['recommendation'];
    source: AdaptiveEngineResult['source'];
  };
}

export const adaptiveService = {
  /**
   * Récupère une recommandation d'adaptation depuis le backend.
   */
  async getRecommendations(context: AdaptiveContext): Promise<AdaptiveEngineResult> {
    const response = await api.post<AdaptiveResponse>('/adaptive/recommendations', context);
    return {
      recommendation: response.data.data.recommendation,
      source: response.data.data.source,
    };
  },
};

export default adaptiveService;
