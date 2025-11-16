import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

/**
 * Service de Cache Redis
 * Optimise les performances en mettant en cache les données fréquemment accédées
 */

export class CacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private readonly defaultTTL: number = 3600; // 1 heure par défaut

  constructor() {
    this.initialize();
  }

  /**
   * Initialise la connexion Redis
   */
  private async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis: Too many reconnection attempts, giving up');
              return new Error('Redis reconnection failed');
            }
            // Exponentiel backoff: 100ms, 200ms, 400ms, etc.
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis Client Reconnecting');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis', { error });
      // Ne pas faire crasher l'app si Redis n'est pas disponible
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Vérifie si Redis est disponible
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const data = await this.client!.get(key);
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data) as T;
      logger.debug('Cache hit', { key });
      return parsed;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client!.setEx(key, ttl, serialized);
      logger.debug('Cache set', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  /**
   * Supprime une clé du cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.del(key);
      logger.debug('Cache delete', { key });
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Supprime plusieurs clés correspondant à un pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client!.del(keys);
      logger.debug('Cache delete pattern', { pattern, count: keys.length });
      return keys.length;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error });
      return 0;
    }
  }

  /**
   * Vide complètement le cache
   */
  async flush(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.flushDb();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { error });
      return false;
    }
  }

  /**
   * Récupère ou calcule une valeur (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Essayer de récupérer du cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si pas en cache, calculer la valeur
    const value = await factory();

    // Stocker dans le cache (ne pas attendre)
    this.set(key, value, ttl).catch((err) => {
      logger.error('Failed to cache computed value', { key, error: err });
    });

    return value;
  }

  /**
   * Invalide le cache pour un utilisateur spécifique
   */
  async invalidateUser(userId: string): Promise<number> {
    const pattern = `user:${userId}:*`;
    return await this.deletePattern(pattern);
  }

  /**
   * Invalide le cache pour un profil enfant
   */
  async invalidateChildProfile(childId: string): Promise<number> {
    const patterns = [
      `child:${childId}:*`,
      `profile:${childId}:*`,
      `progress:${childId}:*`,
    ];

    let total = 0;
    for (const pattern of patterns) {
      total += await this.deletePattern(pattern);
    }
    return total;
  }

  /**
   * Invalide le cache des activités
   */
  async invalidateActivities(): Promise<number> {
    return await this.deletePattern('activities:*');
  }

  /**
   * Invalide le cache des ressources
   */
  async invalidateResources(): Promise<number> {
    return await this.deletePattern('resources:*');
  }

  /**
   * Obtient les statistiques du cache
   */
  async getStats(): Promise<any> {
    if (!this.isAvailable()) {
      return {
        available: false,
        message: 'Redis not connected',
      };
    }

    try {
      const info = await this.client!.info('stats');
      const dbSize = await this.client!.dbSize();

      return {
        available: true,
        connected: this.isConnected,
        dbSize,
        info: this.parseRedisInfo(info),
      };
    } catch (error) {
      logger.error('Failed to get cache stats', { error });
      return {
        available: false,
        error: 'Failed to retrieve stats',
      };
    }
  }

  /**
   * Parse les infos Redis
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const parsed: Record<string, string> = {};
    const lines = info.split('\r\n');

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          parsed[key] = value;
        }
      }
    }

    return parsed;
  }

  /**
   * Ferme la connexion Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis Client Disconnected');
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

/**
 * Clés de cache prédéfinies pour cohérence
 */
export const CacheKeys = {
  // Profils
  profile: (id: string) => `profile:${id}`,
  childProfile: (id: string) => `child:${id}`,
  userProfiles: (userId: string) => `user:${userId}:profiles`,

  // Activités
  activities: (filters?: string) => `activities:${filters || 'all'}`,
  activity: (id: string) => `activity:${id}`,
  activityByCategory: (category: string) => `activities:category:${category}`,

  // Progrès
  progress: (childId: string) => `progress:${childId}`,
  rewards: (childId: string) => `rewards:${childId}`,
  analytics: (childId: string, period: string) => `analytics:${childId}:${period}`,

  // Ressources
  resources: (filters?: string) => `resources:${filters || 'all'}`,
  resource: (id: string) => `resource:${id}`,
  resourcesByType: (type: string) => `resources:type:${type}`,

  // Messages
  userMessages: (userId: string) => `messages:${userId}`,
  conversation: (user1: string, user2: string) => {
    const sorted = [user1, user2].sort();
    return `conversation:${sorted[0]}:${sorted[1]}`;
  },

  // Statistiques
  stats: (type: string) => `stats:${type}`,
};

/**
 * Durées de cache recommandées (en secondes)
 */
export const CacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 heure
  VERY_LONG: 86400, // 24 heures
};
