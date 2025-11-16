/**
 * Utilitaires de Pagination
 * Fournit des helpers pour paginer les résultats de manière cohérente
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Options de pagination par défaut
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Normalise les paramètres de pagination
 */
export function normalizePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
} {
  let page = params.page || DEFAULT_PAGE;
  let limit = params.limit || DEFAULT_LIMIT;

  // Validation
  page = Math.max(1, Math.floor(page));
  limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Crée les métadonnées de pagination
 */
export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Crée une réponse paginée
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMetadata(page, limit, total),
  };
}

/**
 * Extrait les paramètres de pagination de la query string
 */
export function extractPaginationParams(query: any): PaginationParams {
  return {
    page: query.page ? parseInt(query.page, 10) : undefined,
    limit: query.limit ? parseInt(query.limit, 10) : undefined,
  };
}

/**
 * Génère les paramètres Prisma pour la pagination
 */
export function getPrismaPaginationParams(params: PaginationParams) {
  const { skip, limit } = normalizePaginationParams(params);

  return {
    skip,
    take: limit,
  };
}

/**
 * Helper pour paginer avec Prisma
 */
export async function paginateWithPrisma<T>(
  model: any,
  params: PaginationParams,
  where: any = {},
  include?: any,
  orderBy?: any
): Promise<PaginatedResponse<T>> {
  const { page, limit, skip } = normalizePaginationParams(params);

  // Exécuter la requête et le count en parallèle
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  return createPaginatedResponse(data, page, limit, total);
}

/**
 * Curseur de pagination (pour grandes données)
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Pagination par curseur avec Prisma
 */
export async function paginateWithCursor<T extends { id: string }>(
  model: any,
  params: CursorPaginationParams,
  where: any = {},
  include?: any,
  orderBy?: any
): Promise<CursorPaginatedResponse<T>> {
  const limit = Math.min(params.limit || DEFAULT_LIMIT, MAX_LIMIT);

  const items = await model.findMany({
    where,
    include,
    orderBy: orderBy || { createdAt: 'desc' },
    take: limit + 1, // +1 pour savoir s'il y a plus
    ...(params.cursor && {
      cursor: {
        id: params.cursor,
      },
      skip: 1, // Skip le curseur lui-même
    }),
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? items[items.length - 2]?.id : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}

/**
 * Helper pour ajouter les headers de pagination à la réponse
 */
export function addPaginationHeaders(res: any, metadata: PaginationMetadata): void {
  res.setHeader('X-Total-Count', metadata.total.toString());
  res.setHeader('X-Total-Pages', metadata.totalPages.toString());
  res.setHeader('X-Current-Page', metadata.page.toString());
  res.setHeader('X-Per-Page', metadata.limit.toString());
  res.setHeader('X-Has-Next', metadata.hasNext.toString());
  res.setHeader('X-Has-Prev', metadata.hasPrev.toString());
}

/**
 * Génère les liens de pagination (HATEOAS)
 */
export function generatePaginationLinks(
  baseUrl: string,
  metadata: PaginationMetadata
): {
  self: string;
  first: string;
  last: string;
  next?: string;
  prev?: string;
} {
  const buildUrl = (page: number) => `${baseUrl}?page=${page}&limit=${metadata.limit}`;

  return {
    self: buildUrl(metadata.page),
    first: buildUrl(1),
    last: buildUrl(metadata.totalPages),
    ...(metadata.hasNext && { next: buildUrl(metadata.page + 1) }),
    ...(metadata.hasPrev && { prev: buildUrl(metadata.page - 1) }),
  };
}
