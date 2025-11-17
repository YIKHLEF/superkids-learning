import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const buildElkTransport = (): winston.transport | null => {
  const endpoint = process.env.ELK_HTTP_ENDPOINT || process.env.ELASTIC_INGEST_URL;

  if (!endpoint) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(endpoint);
  } catch (error) {
    return null;
  }

  const useTls = url.protocol === 'https:';

  return new winston.transports.Http({
    host: url.hostname,
    path: url.pathname || '/',
    port: url.port ? Number(url.port) : useTls ? 443 : 80,
    ssl: useTls,
    auth:
      process.env.ELK_USERNAME && process.env.ELK_PASSWORD
        ? {
            username: process.env.ELK_USERNAME,
            password: process.env.ELK_PASSWORD,
          }
        : undefined,
  });
};

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize(), logFormat),
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
  }),
];

const elkTransport = buildElkTransport();

if (elkTransport) {
  transports.push(elkTransport);
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports,
});
