/**
 * Services Backend - SuperKids Learning
 *
 * Ce fichier exporte tous les services de la couche métier.
 * Les services encapsulent la logique métier et sont utilisés par les controllers.
 */

export { AuthService } from './auth.service';
export { ProfileService } from './profile.service';
export { ActivityService } from './activity.service';
export { ProgressService } from './progress.service';
export { ResourceService } from './resource.service';
export { MessageService } from './message.service';
export { AdaptiveService } from './adaptive.service';
export { RewardService } from './reward.service';

import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { ActivityService } from './activity.service';
import { ProgressService } from './progress.service';
import { ResourceService } from './resource.service';
import { MessageService } from './message.service';
import { AdaptiveService } from './adaptive.service';
import { RewardService } from './reward.service';

/**
 * Factory pour créer toutes les instances de services
 */
export class ServiceFactory {
  private static prisma: PrismaClient;

  // Instances de services (singleton pattern)
  private static authService: AuthService;
  private static profileService: ProfileService;
  private static activityService: ActivityService;
  private static progressService: ProgressService;
  private static resourceService: ResourceService;
  private static messageService: MessageService;
  private static adaptiveService: AdaptiveService;
  private static rewardService: RewardService;

  /**
   * Initialiser la factory avec une instance Prisma
   */
  static initialize(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtenir l'instance du service d'authentification
   */
  static getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(this.prisma);
    }
    return this.authService;
  }

  /**
   * Obtenir l'instance du service de profils
   */
  static getProfileService(): ProfileService {
    if (!this.profileService) {
      this.profileService = new ProfileService(this.prisma);
    }
    return this.profileService;
  }

  /**
   * Obtenir l'instance du service d'activités
   */
  static getActivityService(): ActivityService {
    if (!this.activityService) {
      this.activityService = new ActivityService(this.prisma);
    }
    return this.activityService;
  }

  /**
   * Obtenir l'instance du service de progrès
   */
  static getProgressService(): ProgressService {
    if (!this.progressService) {
      this.progressService = new ProgressService(this.prisma);
    }
    return this.progressService;
  }

  /**
   * Obtenir l'instance du service de ressources
   */
  static getResourceService(): ResourceService {
    if (!this.resourceService) {
      this.resourceService = new ResourceService(this.prisma);
    }
    return this.resourceService;
  }

  /**
   * Obtenir l'instance du service de messagerie
   */
  static getMessageService(): MessageService {
    if (!this.messageService) {
      this.messageService = new MessageService(this.prisma);
    }
    return this.messageService;
  }

  /**
   * Obtenir l'instance du service adaptatif
   */
  static getAdaptiveService(): AdaptiveService {
    if (!this.adaptiveService) {
      this.adaptiveService = new AdaptiveService({ prisma: this.prisma });
    }
    return this.adaptiveService;
  }

  static getRewardService(): RewardService {
    if (!this.rewardService) {
      this.rewardService = new RewardService(this.prisma);
    }
    return this.rewardService;
  }

  /**
   * Réinitialiser toutes les instances (utile pour les tests)
   */
  static reset() {
    this.authService = null as any;
    this.profileService = null as any;
    this.activityService = null as any;
    this.progressService = null as any;
    this.resourceService = null as any;
    this.messageService = null as any;
    this.adaptiveService = null as any;
    this.rewardService = null as any;
  }
}
