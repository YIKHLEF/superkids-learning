import { NextFunction, Request, Response } from 'express';

type MetricLabels = {
  method: string;
  route: string;
  statusCode: number;
};

const histogramBuckets = [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, Infinity];
const requestTotals = new Map<string, number>();
const durationSums = new Map<string, number>();
const durationBuckets = new Map<string, number[]>();

const normalizeRoute = (req: Request): string => {
  if (req.route?.path) return req.route.path.toString();
  if (req.baseUrl) return `${req.baseUrl}${req.path}`;
  return req.path || 'unknown';
};

const getKey = (labels: MetricLabels): string =>
  `${labels.method}|${labels.route}|${labels.statusCode}`;

const parseKey = (key: string): MetricLabels => {
  const [method, route, statusCode] = key.split('|');
  return {
    method,
    route,
    statusCode: Number(statusCode),
  };
};

const observeDuration = (labels: MetricLabels, durationSeconds: number): void => {
  const key = getKey(labels);
  const previousCount = requestTotals.get(key) ?? 0;
  requestTotals.set(key, previousCount + 1);

  const previousSum = durationSums.get(key) ?? 0;
  durationSums.set(key, previousSum + durationSeconds);

  const buckets = durationBuckets.get(key) ?? histogramBuckets.map(() => 0);
  const bucketIndex = histogramBuckets.findIndex((bound) => durationSeconds <= bound);
  const startIndex = bucketIndex === -1 ? buckets.length - 1 : bucketIndex;

  for (let i = startIndex; i < buckets.length; i += 1) {
    buckets[i] += 1;
  }

  durationBuckets.set(key, buckets);
};

const formatMetrics = (): string => {
  const lines: string[] = [];

  lines.push('# HELP superkids_http_requests_total Nombre total de requêtes HTTP');
  lines.push('# TYPE superkids_http_requests_total counter');
  requestTotals.forEach((value, key) => {
    const { method, route, statusCode } = parseKey(key);
    lines.push(
      `superkids_http_requests_total{method="${method}",route="${route}",status_code="${statusCode}"} ${value}`
    );
  });

  lines.push(
    '# HELP superkids_http_request_duration_seconds Durée des requêtes HTTP en secondes'
  );
  lines.push('# TYPE superkids_http_request_duration_seconds histogram');

  durationBuckets.forEach((buckets, key) => {
    const { method, route, statusCode } = parseKey(key);

    buckets.forEach((count, index) => {
      const bound = histogramBuckets[index];
      const le = Number.isFinite(bound) ? bound : '+Inf';
      lines.push(
        `superkids_http_request_duration_seconds_bucket{method="${method}",route="${route}",status_code="${statusCode}",le="${le}"} ${count}`
      );
    });

    const sum = durationSums.get(key) ?? 0;
    const totalCount = requestTotals.get(key) ?? 0;

    lines.push(
      `superkids_http_request_duration_seconds_sum{method="${method}",route="${route}",status_code="${statusCode}"} ${sum}`
    );
    lines.push(
      `superkids_http_request_duration_seconds_count{method="${method}",route="${route}",status_code="${statusCode}"} ${totalCount}`
    );
  });

  return lines.join('\n');
};

export const prometheusMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime.bigint();
  const route = normalizeRoute(req);

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationSeconds = Number(end - start) / 1_000_000_000;

    observeDuration(
      {
        method: req.method,
        route,
        statusCode: res.statusCode,
      },
      durationSeconds
    );
  });

  next();
};

export const metricsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.end(formatMetrics());
};
