/**
 * Helpers pour Optimisation des Queries Prisma
 * Fournit des patterns et utilitaires pour des queries efficaces
 */

/**
 * Sélections optimisées par modèle
 * Définit les champs minimaux à récupérer pour chaque modèle
 */

export const PrismaSelects = {
  /**
   * User - Sélection minimale
   */
  userMinimal: {
    id: true,
    email: true,
    name: true,
    role: true,
  },

  /**
   * User - Sélection complète (sans password)
   */
  userComplete: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  },

  /**
   * ChildProfile - Sélection minimale
   */
  childProfileMinimal: {
    id: true,
    userId: true,
    dateOfBirth: true,
    avatarUrl: true,
  },

  /**
   * ChildProfile - Sélection complète
   */
  childProfileComplete: {
    id: true,
    userId: true,
    dateOfBirth: true,
    avatarUrl: true,
    developmentLevel: true,
    sensoryPreferences: true,
    iepGoals: true,
    soundEnabled: true,
    animationsEnabled: true,
    dyslexiaMode: true,
    highContrastMode: true,
    fontSize: true,
    autoReadText: true,
    createdAt: true,
    updatedAt: true,
  },

  /**
   * Activity - Sélection pour liste
   */
  activityList: {
    id: true,
    title: true,
    description: true,
    category: true,
    difficulty: true,
    estimatedDuration: true,
    ageRange: true,
    thumbnailUrl: true,
  },

  /**
   * Activity - Sélection complète
   */
  activityComplete: {
    id: true,
    title: true,
    description: true,
    category: true,
    difficulty: true,
    estimatedDuration: true,
    ageRange: true,
    instructions: true,
    targetSkills: true,
    materials: true,
    thumbnailUrl: true,
    createdAt: true,
    updatedAt: true,
  },

  /**
   * Progress - Sélection minimale
   */
  progressMinimal: {
    id: true,
    childId: true,
    totalActivitiesCompleted: true,
    tokensEarned: true,
    currentStreak: true,
  },

  /**
   * Resource - Sélection pour liste
   */
  resourceList: {
    id: true,
    title: true,
    type: true,
    category: true,
    url: true,
    thumbnailUrl: true,
    tags: true,
  },

  /**
   * Message - Sélection pour liste
   */
  messageList: {
    id: true,
    senderId: true,
    recipientId: true,
    subject: true,
    isRead: true,
    createdAt: true,
    sender: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

/**
 * Includes optimisés par cas d'usage
 */
export const PrismaIncludes = {
  /**
   * ChildProfile avec progrès
   */
  childProfileWithProgress: {
    progress: {
      select: PrismaSelects.progressMinimal,
    },
  },

  /**
   * Activity avec sessions récentes
   */
  activityWithSessions: (limit = 5) => ({
    sessions: {
      take: limit,
      orderBy: { startTime: 'desc' as const },
      select: {
        id: true,
        startTime: true,
        completed: true,
        successRate: true,
      },
    },
  }),

  /**
   * Progress avec récompenses
   */
  progressWithRewards: {
    rewards: {
      select: {
        id: true,
        name: true,
        type: true,
        cost: true,
        iconUrl: true,
      },
    },
  },
};

/**
 * Options de tri optimisées
 */
export const PrismaOrderBy = {
  /**
   * Tri par date de création (plus récent d'abord)
   */
  newestFirst: { createdAt: 'desc' as const },

  /**
   * Tri par date de création (plus ancien d'abord)
   */
  oldestFirst: { createdAt: 'asc' as const },

  /**
   * Tri par date de mise à jour
   */
  recentlyUpdated: { updatedAt: 'desc' as const },

  /**
   * Tri alphabétique
   */
  alphabetical: (field: string) => ({ [field]: 'asc' as const }),
};

/**
 * Patterns de queries optimisées
 */

/**
 * Récupère uniquement les IDs (très rapide)
 */
export async function getIdsOnly(
  model: any,
  where: any = {}
): Promise<string[]> {
  const results = await model.findMany({
    where,
    select: { id: true },
  });

  return results.map((r: any) => r.id);
}

/**
 * Compte avec cache potentiel
 */
export async function countWithCache(
  model: any,
  where: any = {},
  _cacheKey?: string
): Promise<number> {
  // Si une clé de cache est fournie, on pourrait l'utiliser
  // Pour l'instant, simple count
  return await model.count({ where });
}

/**
 * Vérifie l'existence d'un enregistrement (optimisé)
 */
export async function exists(
  model: any,
  where: any
): Promise<boolean> {
  const result = await model.findFirst({
    where,
    select: { id: true },
  });

  return result !== null;
}

/**
 * Récupère un ou crée (upsert optimisé)
 */
export async function findOrCreate<T>(
  model: any,
  where: any,
  create: any
): Promise<T> {
  return await model.upsert({
    where,
    update: {},
    create,
  });
}

/**
 * Batch update efficace
 */
export async function batchUpdate(
  model: any,
  ids: string[],
  data: any
): Promise<number> {
  const result = await model.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data,
  });

  return result.count;
}

/**
 * Batch delete efficace
 */
export async function batchDelete(
  model: any,
  ids: string[]
): Promise<number> {
  const result = await model.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result.count;
}

/**
 * Query builder pour filtres dynamiques
 */
export class WhereBuilder {
  private conditions: any[] = [];

  and(condition: any): this {
    if (condition) {
      this.conditions.push(condition);
    }
    return this;
  }

  or(conditions: any[]): this {
    if (conditions.length > 0) {
      this.conditions.push({ OR: conditions });
    }
    return this;
  }

  build(): any {
    if (this.conditions.length === 0) {
      return {};
    }

    if (this.conditions.length === 1) {
      return this.conditions[0];
    }

    return {
      AND: this.conditions,
    };
  }
}

/**
 * Helpers pour les recherches textuelles
 */
export const TextSearch = {
  /**
   * Recherche insensible à la casse
   */
  contains: (field: string, value: string) => ({
    [field]: {
      contains: value,
      mode: 'insensitive' as const,
    },
  }),

  /**
   * Recherche par début de chaîne
   */
  startsWith: (field: string, value: string) => ({
    [field]: {
      startsWith: value,
      mode: 'insensitive' as const,
    },
  }),

  /**
   * Recherche dans plusieurs champs
   */
  multiField: (fields: string[], value: string) => ({
    OR: fields.map((field) => ({
      [field]: {
        contains: value,
        mode: 'insensitive' as const,
      },
    })),
  }),
};

/**
 * Helpers pour les filtres de date
 */
export const DateFilters = {
  /**
   * Aujourd'hui
   */
  today: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return {
      gte: start,
      lte: end,
    };
  },

  /**
   * Cette semaine
   */
  thisWeek: () => {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      gte: start,
      lte: end,
    };
  },

  /**
   * Ce mois
   */
  thisMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return {
      gte: start,
      lte: end,
    };
  },

  /**
   * N derniers jours
   */
  lastNDays: (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    return {
      gte: start,
      lte: end,
    };
  },

  /**
   * Entre deux dates
   */
  between: (startDate: Date, endDate: Date) => ({
    gte: startDate,
    lte: endDate,
  }),
};

/**
 * Optimisations de performance Prisma
 */
export const PerformanceTips = {
  /**
   * Toujours utiliser select ou include, jamais les deux
   * Toujours limiter les champs récupérés
   * Utiliser take/skip pour la pagination
   * Créer des index sur les champs fréquemment filtrés
   * Utiliser les transactions pour les opérations multiples
   * Éviter N+1 queries avec include
   * Utiliser findUnique quand possible (plus rapide que findFirst)
   * Batch les opérations similaires
   */
};
