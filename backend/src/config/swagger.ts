import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SuperKids Learning API',
    version: '1.1.0',
    description: `
      API REST pour SuperKids Learning - Application d'apprentissage pour enfants autistes.

      ## Fonctionnalités
      - 🔐 Authentification JWT
      - 👤 Gestion des profils enfants
      - 🎯 Activités d'apprentissage interactives
      - 📊 Suivi des progrès et récompenses
      - 📚 Bibliothèque de ressources pédagogiques
      - 💬 Messagerie entre utilisateurs
      - 🔌 Communication temps réel via WebSocket

      ## Authentification
      La plupart des endpoints requièrent un token JWT dans le header:
      \`\`\`
      Authorization: Bearer <votre_token_jwt>
      \`\`\`

      Obtenez un token via \`POST /api/auth/login\` ou \`POST /api/auth/register\`.
    `,
    contact: {
      name: 'SuperKids Learning Support',
      email: 'support@superkids-learning.com',
    },
    license: {
      name: 'Proprietary',
      url: 'https://superkids-learning.com/license',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Serveur de développement',
    },
    {
      url: 'https://api.superkids-learning.com',
      description: 'Serveur de production',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenu via /api/auth/login',
      },
    },
    schemas: {
      // Modèles de données
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID unique de l\'utilisateur',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email de l\'utilisateur',
          },
          name: {
            type: 'string',
            description: 'Nom complet de l\'utilisateur',
          },
          role: {
            type: 'string',
            enum: ['CHILD', 'PARENT', 'EDUCATOR', 'THERAPIST', 'ADMIN'],
            description: 'Rôle de l\'utilisateur',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ChildProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          dateOfBirth: { type: 'string', format: 'date' },
          age: { type: 'integer', minimum: 3, maximum: 12 },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          sensoryPreferences: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['LOW_STIMULATION', 'MEDIUM_STIMULATION', 'HIGH_CONTRAST', 'MONOCHROME'],
            },
          },
          developmentLevel: { type: 'string' },
          iepGoals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                description: { type: 'string' },
                targetDate: { type: 'string', format: 'date' },
                status: { type: 'string', enum: ['not_started', 'in_progress', 'achieved'] },
              },
            },
          },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['CHILD', 'PARENT', 'EDUCATOR', 'THERAPIST', 'ADMIN'],
            },
          },
          soundEnabled: { type: 'boolean' },
          animationsEnabled: { type: 'boolean' },
          dyslexiaMode: { type: 'boolean' },
          highContrastMode: { type: 'boolean' },
          fontSize: { type: 'string', enum: ['small', 'medium', 'large'] },
        },
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: {
            type: 'string',
            enum: ['SOCIAL_SKILLS', 'COMMUNICATION', 'ACADEMIC', 'AUTONOMY', 'EMOTIONAL_REGULATION'],
          },
          difficulty: {
            type: 'string',
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
          },
          duration: { type: 'integer', description: 'Durée en minutes' },
          thumbnailUrl: { type: 'string', format: 'uri', nullable: true },
          videoUrl: { type: 'string', format: 'uri', nullable: true },
          instructions: {
            type: 'array',
            items: { type: 'string' },
          },
          targetSkills: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Progress: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          childId: { type: 'string', format: 'uuid' },
          totalActivitiesCompleted: { type: 'integer', minimum: 0 },
          tokensEarned: { type: 'integer', minimum: 0 },
          currentStreak: { type: 'integer', minimum: 0 },
          longestStreak: { type: 'integer', minimum: 0 },
          lastActivityDate: { type: 'string', format: 'date-time', nullable: true },
          rewardsUnlocked: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          senderId: { type: 'string', format: 'uuid' },
          recipientId: { type: 'string', format: 'uuid' },
          subject: { type: 'string' },
          content: { type: 'string' },
          read: { type: 'boolean' },
          attachments: {
            type: 'array',
            items: { type: 'string' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Resource: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: {
            type: 'string',
            enum: ['video', 'pictogram', 'social_story', 'guide', 'tutorial'],
          },
          category: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          thumbnailUrl: { type: 'string', format: 'uri', nullable: true },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Message d\'erreur',
          },
          statusCode: {
            type: 'integer',
            description: 'Code HTTP de l\'erreur',
          },
          code: {
            type: 'string',
            description: 'Code d\'erreur spécifique',
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Non authentifié - Token manquant ou invalide',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Token invalide ou expiré',
              statusCode: 401,
              code: 'UNAUTHORIZED',
            },
          },
        },
      },
      NotFound: {
        description: 'Ressource non trouvée',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Ressource introuvable',
              statusCode: 404,
              code: 'NOT_FOUND',
            },
          },
        },
      },
      BadRequest: {
        description: 'Requête invalide',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Données invalides',
              statusCode: 400,
              code: 'BAD_REQUEST',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints d\'authentification et gestion des utilisateurs',
    },
    {
      name: 'Profiles',
      description: 'Gestion des profils enfants et préférences',
    },
    {
      name: 'Activities',
      description: 'Activités d\'apprentissage et sessions',
    },
    {
      name: 'Progress',
      description: 'Suivi des progrès, récompenses et analytiques',
    },
    {
      name: 'Resources',
      description: 'Bibliothèque de ressources pédagogiques',
    },
    {
      name: 'Messages',
      description: 'Messagerie entre utilisateurs',
    },
    {
      name: 'Health',
      description: 'Endpoints de santé et monitoring',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/server.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
