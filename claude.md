# SuperKids Learning - Documentation Technique

## Vue d'ensemble

SuperKids Learning est une application web d'apprentissage conçue spécifiquement pour les enfants autistes âgés de 3 à 12 ans. L'application est basée sur les 28 pratiques basées sur des preuves (Evidence-Based Practices - EBPs) identifiées par le National Clearinghouse on Autism Evidence and Practice (NCAEP).

## Architecture de l'Application

### Frontend
- **Framework**: React 18+ avec TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI v5 (personnalisé avec palette neuro-inclusive)
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Styling**: Emotion (CSS-in-JS)
- **Design System**: Storybook (configuration dans `frontend/.storybook`, stories dans `frontend/src/stories`)

### Backend
- **Runtime**: Node.js 20+ avec Express.js
- **API**: RESTful API
- **Base de données**: PostgreSQL 15+ avec Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io pour la messagerie en temps réel et notifications de lecture
- **Logging**: Winston (+ export conditionnel Datadog/New Relic en production via `ENABLE_PROD_TELEMETRY=true`)
- **Conformité**: middlewares RGPD/COPPA (`enforceDataProtectionHeaders`, `requireParentalConsent`, `anonymizeResponse`)

### Récompenses et progression
- Les modèles Prisma `Reward` et `Progress` suivent une typologie unifiée (`RewardType`) pour différencier badges, avatars, thèmes et célébrations.
- Les déblocages sont tracés par type (badges, avatars, thèmes) et alimentent les barres de progression hebdomadaires.
- Le seeding inclut désormais des exemples cohérents pour chaque type de récompense afin de faciliter les tests d'intégration front/back.

## Structure du Projet

```
superkids-learning/
├── frontend/                          # Application React frontend
│   ├── src/
│   │   ├── components/               # Composants réutilisables
│   │   │   ├── Layout/              # Layout principal et navigation
│   │   │   └── Auth/                # Composants d'authentification
│   │   ├── pages/                   # Pages de l'application
│   │   │   ├── HomePage.tsx         # Page d'accueil
│   │   │   ├── Dashboard.tsx        # Tableau de bord
│   │   │   ├── ActivitiesPage.tsx   # Page des activités
│   │   │   ├── ProfilePage.tsx      # Profil utilisateur
│   │   │   ├── AnalyticsPage.tsx    # Statistiques et progrès
│   │   │   ├── ResourcesPage.tsx    # Bibliothèque de ressources
│   │   │   └── MessagesPage.tsx     # Messagerie
│   │   ├── store/                   # Redux store
│   │   │   ├── slices/              # Redux slices
│   │   │   └── index.ts             # Configuration du store
│   │   ├── types/                   # Types TypeScript
│   │   ├── styles/                  # Styles globaux et thèmes
│   │   ├── services/                # Services API
│   │   ├── utils/                   # Utilitaires
│   │   └── assets/                  # Images, icônes, etc.
│   ├── index.html                   # Point d'entrée HTML
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                          # API Node.js backend
│   ├── src/
│   │   ├── controllers/             # Contrôleurs de routes
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── activity.controller.ts
│   │   │   ├── progress.controller.ts
│   │   │   ├── resource.controller.ts
│   │   │   └── message.controller.ts
│   │   ├── routes/                  # Définitions de routes
│   │   ├── middleware/              # Middlewares Express
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── services/                # Logique métier
│   │   ├── utils/                   # Utilitaires
│   │   │   └── logger.ts
│   │   ├── config/                  # Configuration
│   │   └── server.ts                # Point d'entrée du serveur
│   ├── prisma/
│   │   └── schema.prisma            # Schéma de base de données
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── database/
│   └── migrations/                   # Migrations de base de données
│
├── docs/                            # Documentation
├── Application_Apprentissage_Autisme_Specifications.docx
└── claude.md                        # Ce fichier
```

## Modules et Fonctionnalités

### Module 1: Gestion des Profils Utilisateurs
**Objectif**: Créer et gérer les profils personnalisés pour chaque enfant

**Fonctionnalités**:
- Création de profils avec informations de base (nom, âge, date de naissance)
- Configuration des préférences sensorielles (LOW_STIMULATION, HIGH_CONTRAST, etc.)
- Définition d'objectifs d'apprentissage personnalisés (IEP)
- Définition structurée des objectifs IEP (titre, description, date cible, statut)
- Gestion des préférences sensorielles (LOW_STIMULATION, HIGH_CONTRAST, etc.)
- Gestion des préférences d'interface (sons, animations, police dyslexie)
- Gestion multi-utilisateurs (parents, éducateurs, thérapeutes)

**Préférences UI et accessibilité (persistées côté profil)**
- Le modèle Prisma `ChildProfile` porte désormais un champ `uiPreferences` (JSON) qui embarque la palette, le contraste, le schéma de couleurs, le volume global, les polices dyslexie et les indicateurs de mouvement.
- Les objectifs IEP sont stockés sous forme structurée (`title`, `description`, `targetDate`, `status`) et validés par Zod côté backend (`backend/src/types/profile.ts`).
- Le frontend réconcilie les préférences UI stockées avec le thème dynamique MUI via `createAppTheme` et la `ProfilePage` synchronise le store `settings` en temps réel.

**Fichiers concernés**:
- Frontend: `src/pages/ProfilePage.tsx`, `src/store/slices/profileSlice.ts`
- Backend: `src/controllers/profile.controller.ts`, `src/routes/profile.routes.ts`
- Base de données: `ChildProfile` model dans `schema.prisma`

### Module 2: Activités d'Apprentissage Interactives
**Objectif**: Fournir des activités éducatives adaptées aux différents domaines de compétences

**Catégories d'activités**:
1. **Compétences Sociales** (SOCIAL_SKILLS)
   - Reconnaissance des émotions
   - Tour de rôle et partage
   - Initiation sociale

2. **Communication** (COMMUNICATION)
   - Expression des besoins
   - Tableaux CAA (Communication Alternative Augmentée)
   - Vocabulaire

3. **Compétences Académiques** (ACADEMIC)
   - Mathématiques
   - Lecture et pré-lecture
   - Sciences

4. **Autonomie** (AUTONOMY)
   - Hygiène personnelle
   - Habillage
   - Sécurité

5. **Régulation Émotionnelle** (EMOTIONAL_REGULATION)
   - Identification des émotions
   - Stratégies d'autorégulation
   - Gestion de l'anxiété

**Niveaux de difficulté**: BEGINNER, INTERMEDIATE, ADVANCED

**Fichiers concernés**:
- Frontend: `src/pages/ActivitiesPage.tsx`, `src/store/slices/activitySlice.ts`
- Backend: `src/controllers/activity.controller.ts`
- Base de données: `Activity`, `ActivitySession` models

**Composants interactifs inclus**:
- Drag & Drop des émotions (régulation émotionnelle)
- Tableau CAA (communication augmentée)
- Jeux mathématiques adaptatifs (difficulté dynamique)
- Séquences d'autonomie (checklist guidée)
- Exercices de respiration (rituel 4-2-4)
- Catalogue d'activités annoté avec des tags EBP (Evidence-Based Practices) filtrables côté frontend et exposés via l'API `/api/activities`.

### Module 3 : Bibliothèque de ressources
**Objectif** : Centraliser les médias pédagogiques et favoriser leur réutilisation.**

**Mises à jour clés** :
- Schéma Prisma `Resource` enrichi (`assetUrl`, `isFavorite`, `language`, `ageRange`) pour mieux typer les médias et stocker le statut de favori.
- API filtrable (type, catégorie, tags, recherche full-text) avec sécurisation JWT sur toutes les routes `/api/resources` et un endpoint de mise en favori (`PATCH /api/resources/:id/favorite`).
- Page frontend `ResourcesPage.tsx` avec recherche instantanée, filtres de tags, favoris et affichage des pictogrammes via `components/accessibility/pictograms.ts`.
- Store Redux (`resourceSlice`) pour persister les filtres et synchroniser les favoris utilisateurs avec le backend.

## Moteur Adaptatif (nouveau)
- Backend : `backend/src/services/adaptive.service.ts` orchestre désormais la bascule ML/heuristique (journalisation de la provenance) et persiste chaque recommandation dans la table Prisma `AdaptiveRecommendation` pour l'audit et l'affinage.
- Endpoint dédié : `POST /api/adaptive/recommendations` (contrôleur `backend/src/controllers/adaptive.controller.ts`, routes `backend/src/routes/adaptive.routes.ts`) est validé par Zod (`adaptiveContextSchema`) incluant performances, émotions et préférences sensorielles.
- Frontend : hook `frontend/src/hooks/useAdaptiveLevel.ts` consomme la provenance (ML vs heuristique), mémoïse les recommandations récentes et assure un fallback heuristique local en cas d'erreur ou hors-ligne.
- Données d'entrée typiques : taux de réussite, nombre d'essais, signaux émotionnels légers, préférences sensorielles pour éviter la surcharge.

### Télémétrie des activités (nouveau)
- Le frontend envoie désormais les événements de démarrage, d'essais, de réussite et d'état émotionnel via `frontend/src/services/analytics.service.ts`. Les composants d'activités publient la durée écoulée, le niveau de support, l'émotion dominante et les tentatives pour chaque action.
- Le backend expose `/api/progress/events` (contrôleur `progress.controller.ts`, service `progress.service.ts`) pour collecter et agréger ces événements, enrichissant `ActivitySession` et `Progress` avec la durée, les essais, le taux de réussite et l'état émotionnel dominant. La page `AnalyticsPage.tsx` consomme ces agrégats pour afficher timeline, radar par compétence et histogramme d'émotions.

### Thème et préférences sensorielles (nouveau)
- `frontend/src/store/slices/settingsSlice.ts` gère maintenant le contraste (standard/élevé/maximal), les palettes neuro-inclusives (calme, vibrante, monochrome), le volume global, les animations/audio cues et les variantes de thème (`default`, `high-contrast`, `dyslexia`, `hypersensitive`).
- `frontend/src/styles/theme.ts` construit dynamiquement le thème MUI via `createAppTheme` pour appliquer police dyslexie, contrastes, mouvements réduits et profils hypersensibles.
- `frontend/src/components/Layout/AccessibilityControls.tsx` expose des réglages rapides (animations, audio, police, contraste, bascule de thème) directement dans le layout.
- `frontend/src/pages/ProfilePage.tsx` expose une section « Préférences sensorielles & UI » avec prévisualisation immédiate et synchronisation des préférences de profil.

### Module 3: Système de Récompenses et Motivation
**Objectif**: Encourager l'engagement et célébrer les progrès

**Fonctionnalités**:
- Système de jetons virtuels gagnés lors des activités
- Badges à débloquer selon les réalisations
- Graphiques de progrès visuels
- Récompenses personnalisables (avatars, thèmes, célébrations)
- Feedback positif immédiat

**Types de récompenses**:
- Badge: Récompenses pour accomplissements spécifiques
- Avatar: Nouveaux avatars à débloquer
- Theme: Thèmes visuels pour l'interface
- Celebration: Animations spéciales

**Fichiers concernés**:
- Frontend: `src/pages/Dashboard.tsx`, `src/store/slices/progressSlice.ts`
- Backend: `src/controllers/progress.controller.ts`
- Base de données: `Progress`, `Reward` models
- Ajouts récents : slice dédié aux récompenses (`src/store/slices/rewardSlice.ts`), service API frontend (`src/services/rewards.service.ts`) et endpoints backend `/api/rewards` pilotés par `reward.service.ts`/`rewards.controller.ts`.

**Nouveautés UX**:
- Feedback immédiat (jetons/badges) après chaque activité
- Barre de progression hebdomadaire et par compétence
- Recommandation de prochaine difficulté à partir des scores

### Module 4: Suivi et Analytiques
**Objectif**: Fournir des données détaillées sur les progrès de l'enfant

**Métriques suivies**:
- Temps passé sur chaque activité
- Taux de réussite par compétence
- Nombre de tentatives avant réussite
- États émotionnels pendant les activités
- Généralisation des compétences
- Séries consécutives (streaks)

**Visualisations**:
- Graphiques en ligne pour l'évolution temporelle
- Radar chart pour les compétences multiples
- Graphiques en barres pour les états émotionnels
- Statistiques rapides (cartes de métriques clés)

**Fichiers concernés**:
- Frontend: `src/pages/AnalyticsPage.tsx`
- Backend: `src/controllers/progress.controller.ts`
- Base de données: `Progress`, `ActivitySession` models

### Module 5: Bibliothèque de Ressources
**Objectif**: Centraliser tous les supports d'apprentissage

**Types de ressources**:
1. **Vidéos**: Vidéo-modélisation pour compétences sociales et autonomie
2. **Pictogrammes**: Bibliothèque PECS organisée par catégories
3. **Histoires Sociales**: Histoires personnalisables et imprimables
4. **Guides**: Documentation pour parents et éducateurs
5. **Tutoriels**: Guides d'utilisation de l'application

**Fonctionnalités**:
- Recherche par mots-clés
- Filtrage par type et catégorie
- Tags pour organisation
- Téléchargement et impression
- Favoris et collections
- Pictogrammes optimisés accessibilité (mapping dans `frontend/src/components/accessibility/pictograms.ts`)

**Fichiers concernés**:
- Frontend: `src/pages/ResourcesPage.tsx`
- Backend: `src/controllers/resource.controller.ts`
- Base de données: `Resource` model

### Module 6: Communication et Collaboration
**Objectif**: Faciliter la communication entre parents, éducateurs et thérapeutes

**Fonctionnalités**:
- Messagerie sécurisée entre utilisateurs
- Partage de notes et observations
- Notifications de nouveaux messages
- Pièces jointes
- Marquage des messages comme lus
- Conversations organisées par participant

**Fichiers concernés**:
- Frontend: `src/pages/MessagesPage.tsx`
- Backend: `src/controllers/message.controller.ts`, WebSocket dans `server.ts`
- Base de données: `Message` model

## Design Neuro-Inclusif

### Principes de Design

1. **Simplicité et Clarté Visuelle**
   - Interface épurée avec un seul objectif par écran
   - Hiérarchie visuelle claire
   - Espacement généreux (spacing: 8px base)
   - Navigation intuitive et prévisible

2. **Palette de Couleurs Apaisante**
   ```typescript
   Fond principal: #F0F4F8 (bleu pâle)
   Primaire: #A8D5E2 (bleu ciel doux)
   Secondaire: #B8E6D5 (vert menthe)
   Texte: #3A3A3A (gris anthracite)
   Succès: #C1E8C1 (vert pastel)
   Attention: #FFF4B8 (jaune doux)
   ```

3. **Typographie Accessible**
   - Police: Arial, Verdana (avec option OpenDyslexic)
   - Taille minimum: 16px
   - Interligne: 1.8
   - Éviter italique et majuscules prolongées

4. **Éléments Interactifs**
   - Boutons: Minimum 44x44px (normes d'accessibilité)
   - Feedback visuel immédiat
   - Coins arrondis doux (12px)
   - Animations douces et prévisibles

5. **Support pour Mouvement Réduit**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

### Modes d'Accessibilité

1. **Mode Haute Contraste**: Contraste maximal pour déficiences visuelles
2. **Mode Dyslexie**: Police OpenDyslexic et espacement accru
3. **Mode Hypersensibilité**: Réduction maximale des stimuli
4. **Mode Communication Non-Verbale**: Interface entièrement visuelle avec CAA

## Base de Données (Prisma Schema)

### Modèles Principaux

**User**: Utilisateurs de l'application (enfants, parents, éducateurs, thérapeutes)
```prisma
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  password String
  name     String
  role     UserRole
}
```

**ChildProfile**: Profils détaillés des enfants
```prisma
model ChildProfile {
  id                  String
  userId              String   @unique
  dateOfBirth         DateTime
  sensoryPreferences  SensoryPreference[]
  iepGoals            String[]
  preferences         Json
}
```

**Activity**: Activités d'apprentissage disponibles
```prisma
model Activity {
  id           String
  title        String
  category     ActivityCategory
  difficulty   DifficultyLevel
  duration     Int
  instructions String[]
}
```

**ActivitySession**: Sessions d'activités complétées
```prisma
model ActivitySession {
  id             String
  childId        String
  activityId     String
  startTime      DateTime
  completed      Boolean
  successRate    Float
  emotionalState String?
}
```

**Progress**: Suivi des progrès de l'enfant
```prisma
model Progress {
  id                       String
  childId                  String   @unique
  totalActivitiesCompleted Int
  tokensEarned             Int
  currentStreak            Int
  skillsAcquired           Json
}
```

## Services Backend (Architecture)

### Pourquoi une Couche de Services ?

Les services backend séparent la logique métier des controllers, offrant plusieurs avantages:

1. **Séparation des préoccupations**: Controllers gèrent HTTP, services gèrent la logique métier
2. **Réutilisabilité**: Services peuvent être appelés depuis plusieurs controllers
3. **Testabilité**: Plus facile de tester la logique métier isolément
4. **Maintenabilité**: Code organisé et facile à maintenir

### Services à Implémenter (Phase 3.1)

#### AuthService (`src/services/auth.service.ts`)
```typescript
class AuthService {
  async register(userData: RegisterDTO): Promise<UserWithToken>
  async login(credentials: LoginDTO): Promise<UserWithToken>
  async validateToken(token: string): Promise<User>
  async refreshToken(refreshToken: string): Promise<string>
  async logout(userId: string): Promise<void>
  async resetPassword(email: string): Promise<void>
}
```

#### ProfileService (`src/services/profile.service.ts`)
```typescript
class ProfileService {
  async getProfile(userId: string): Promise<ChildProfile>
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<ChildProfile>
  async updatePreferences(userId: string, prefs: PreferencesDTO): Promise<ChildProfile>
  async getAllChildrenProfiles(parentId: string): Promise<ChildProfile[]>
  async deleteProfile(userId: string): Promise<void>
}
```

#### ActivityService (`src/services/activity.service.ts`)
```typescript
class ActivityService {
  async getAllActivities(filters?: ActivityFilters): Promise<Activity[]>
  async getActivityById(id: string): Promise<Activity>
  async getActivitiesByCategory(category: ActivityCategory): Promise<Activity[]>
  async startActivitySession(childId: string, activityId: string): Promise<ActivitySession>
  async completeActivitySession(sessionId: string, results: SessionResults): Promise<ActivitySession>
  async getChildActivityHistory(childId: string): Promise<ActivitySession[]>
}
```

#### ProgressService (`src/services/progress.service.ts`)
```typescript
class ProgressService {
  async getProgress(childId: string): Promise<Progress>
  async updateProgress(childId: string, sessionData: SessionResults): Promise<Progress>
  async getRewards(childId: string): Promise<Reward[]>
  async unlockReward(childId: string, rewardId: string): Promise<Progress>
  async calculateStreak(childId: string): Promise<number>
  async getAnalytics(childId: string, period: DateRange): Promise<AnalyticsData>
}
```

#### ResourceService (`src/services/resource.service.ts`)
```typescript
class ResourceService {
  async getAllResources(filters?: ResourceFilters): Promise<Resource[]>
  async getResourcesByType(type: ResourceType): Promise<Resource[]>
  async searchResources(query: string): Promise<Resource[]>
  async createResource(data: CreateResourceDTO): Promise<Resource>
  async updateResource(id: string, data: UpdateResourceDTO): Promise<Resource>
  async deleteResource(id: string): Promise<void>
}
```

#### MessageService (`src/services/message.service.ts`)
```typescript
class MessageService {
  async getUserMessages(userId: string): Promise<Message[]>
  async sendMessage(data: SendMessageDTO): Promise<Message>
  async markAsRead(messageId: string): Promise<Message>
  async deleteMessage(messageId: string): Promise<void>
  async getConversation(userId1: string, userId2: string): Promise<Message[]>
}
```

### Architecture de Service Standard

Chaque service suit cette structure:

```typescript
// Exemple: activity.service.ts
import { PrismaClient } from '@prisma/client';
import { ActivityFilters, CreateActivityDTO } from '../types';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ActivityService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllActivities(filters?: ActivityFilters) {
    try {
      const activities = await this.prisma.activity.findMany({
        where: {
          category: filters?.category,
          difficulty: filters?.difficulty,
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`Fetched ${activities.length} activities`);
      return activities;
    } catch (error) {
      logger.error('Error fetching activities:', error);
      throw new AppError('Failed to fetch activities', 500);
    }
  }

  // ... autres méthodes
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Créer un nouveau compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter
- `GET /api/auth/me` - Obtenir l'utilisateur actuel

### Profils
- `GET /api/profiles/:id` - Obtenir un profil
- `PUT /api/profiles/:id` - Mettre à jour un profil
- `PATCH /api/profiles/:id/preferences` - Mettre à jour les préférences
- `GET /api/profiles/children/all` - Obtenir tous les profils enfants

### Activités
- `GET /api/activities` - Obtenir toutes les activités
- `GET /api/activities/:id` - Obtenir une activité spécifique
- `GET /api/activities/category/:category` - Filtrer par catégorie
- `POST /api/activities/session/start` - Démarrer une session
- `POST /api/activities/session/:sessionId/complete` - Compléter une session

### Progrès
- `GET /api/progress/:childId` - Obtenir les progrès d'un enfant
- `PUT /api/progress/:childId` - Mettre à jour les progrès
- `GET /api/progress/:childId/rewards` - Obtenir les récompenses
- `POST /api/progress/:childId/rewards/:rewardId/unlock` - Débloquer une récompense

### Ressources
- `GET /api/resources` - Obtenir toutes les ressources
- `GET /api/resources/type/:type` - Filtrer par type
- `GET /api/resources/search?query=...` - Rechercher des ressources

### Messages
- `GET /api/messages/user/:userId` - Obtenir les messages d'un utilisateur
- `POST /api/messages` - Envoyer un message
- `PATCH /api/messages/:messageId/read` - Marquer comme lu
- `DELETE /api/messages/:messageId` - Supprimer un message

## Installation et Démarrage

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Backend

```bash
cd backend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run migrate

# Démarrer le serveur
npm run dev
```

L'API sera accessible sur `http://localhost:5000`

## Variables d'Environnement

### Backend (.env)
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/superkids_learning
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Sécurité

### Mesures Implémentées

1. **Authentification**
   - Mots de passe hashés avec bcrypt (10 rounds)
   - JWT pour les sessions
   - Rate limiting sur les tentatives de connexion

2. **Protection des Données**
   - Validation des entrées utilisateur
   - Protection CSRF, XSS, SQL Injection
   - Headers de sécurité avec Helmet
   - CORS configuré

3. **Conformité**
   - RGPD (protection des données personnelles)
   - COPPA (protection des enfants en ligne)

## Pratiques Pédagogiques Basées sur des Preuves

L'application intègre les EBPs suivantes:

1. **Interventions basées sur les antécédents (ABI)**
2. **Communication Alternative Augmentée (CAA)**
3. **Instruction directe (DI)**
4. **Modelage (MD)**
5. **Interventions naturalistes (NI)**
6. **Vidéo-modélisation (VM)**
7. **Supports visuels**
8. **Analyse de tâches**
9. **Renforcement différentiel**
10. **Routines structurées**

## Technologies d'IA (Futur)

Fonctionnalités IA prévues pour les versions futures:

1. **Personnalisation Adaptative**
   - Ajustement du niveau de difficulté en temps réel
   - Détection des moments optimaux d'apprentissage
   - Prédiction des difficultés

2. **Analyse Comportementale**
   - Reconnaissance des patterns d'apprentissage
   - Détection de signes de fatigue/frustration
   - Recommandations personnalisées

3. **NLP et Synthèse Vocale**
   - Lecture automatique du texte
   - Reconnaissance vocale pour les réponses
   - Traduction multilingue

## Maintenance et Support

### Logs
Les logs sont stockés dans:
- `backend/logs/error.log` - Erreurs uniquement
- `backend/logs/combined.log` - Tous les logs

### Monitoring
- Winston pour le logging
- À implémenter: Datadog/New Relic pour monitoring production

### Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## Roadmap Future

### Phase 1 (Actuel)
- ✅ Architecture de base
- ✅ Modules principaux
- ✅ Design neuro-inclusif
- ✅ API RESTful

### Phase 2 (Complétée) ✅
- ✅ Intégration complète Prisma avec base de données
- ✅ Tests unitaires et d'intégration (Jest)
- ✅ Authentification complète avec JWT
- ✅ Upload et gestion de fichiers (Multer)
- ✅ Services API frontend complets
- ✅ Middleware de validation et sécurité
- ✅ Scripts de seed pour données de test
- ✅ Configuration Docker et Docker Compose

### Phase 3 (En cours) 🚧
#### 3.1 - Services Backend (Priorité Haute) ✅ COMPLÉTÉ
- [x] Créer la couche de services métier séparée des controllers
- [x] Service d'authentification (auth.service.ts)
- [x] Service de gestion de profils (profile.service.ts)
- [x] Service de gestion des activités (activity.service.ts)
- [x] Service de suivi des progrès (progress.service.ts)
- [x] Service de gestion des ressources (resource.service.ts)
- [x] Service de messagerie (message.service.ts)
- [x] ServiceFactory pour gestion centralisée
- [x] Types et DTOs complets (backend/src/types/)

**Résultat**: 6 services backend + factory + types (2600+ lignes de code)

#### 3.2 - Tests et Qualité (Priorité Haute) ✅ EN COURS
- [x] Tests unitaires pour tous les services backend (Jest) - **51 tests créés**
  - [x] auth.service.test.ts (9 tests)
  - [x] profile.service.test.ts (8 tests)
  - [x] activity.service.test.ts (10 tests)
  - [x] progress.service.test.ts (12 tests)
  - [x] message.service.test.ts (12 tests)
- [x] Tests d'intégration pour les API endpoints - **78 tests créés**
  - [x] auth.routes.test.ts (13 tests)
  - [x] profile.routes.test.ts (12 tests)
  - [x] activity.routes.test.ts (15 tests)
  - [x] progress.routes.test.ts (11 tests)
  - [x] resource.routes.test.ts (12 tests)
  - [x] message.routes.test.ts (15 tests)
- [x] Augmenter la couverture de tests à > 80%
- [ ] Tests E2E avec Playwright ou Cypress
- [ ] Configuration SonarQube pour analyse de code

**Résultat**: 129 tests (51 unitaires + 78 intégration), > 80% couverture backend

#### 3.3 - Documentation API (Priorité Moyenne) ✅ COMPLÉTÉ
- [x] Intégration Swagger/OpenAPI pour documentation API
- [x] Configuration Swagger avec swagger-jsdoc et swagger-ui-express
- [x] Documentation interactive des endpoints via Swagger UI
- [x] Schémas de données complets (7 modèles)
- [x] Exemples de requêtes/réponses
- [x] Guide d'authentification JWT Bearer
- [x] Tags et catégorisation des endpoints
- [x] Endpoints de santé documentés
- [x] Export JSON OpenAPI spec (/api-docs.json)

**Résultat**: Documentation Swagger complète accessible à http://localhost:5000/api-docs

#### 3.4 - Fonctionnalités Temps Réel (Priorité Haute) ✅ COMPLÉTÉ
- [x] Implémentation complète Socket.io dans server.ts
- [x] Service Socket.io dédié avec gestion événements
- [x] Authentification Socket.io avec JWT
- [x] Événements de notification en temps réel
- [x] Mise à jour live des progrès
- [x] Chat en temps réel pour messagerie
- [x] Présence utilisateur (online/offline)
- [x] Indicateurs de frappe (typing indicators)
- [x] Gestion multi-connexions par utilisateur
- [x] Client Socket.io frontend avec hooks React
- [x] Types TypeScript pour tous les événements

**Résultat**: SocketService complet, 15+ événements temps réel, client/serveur intégrés

#### 3.5 - Gestion de Fichiers (Priorité Moyenne)
- [ ] Upload d'avatars pour profils enfants
- [ ] Upload de ressources éducatives
- [ ] Stockage et compression d'images
- [ ] Validation et sécurisation des uploads
- [ ] Intégration avec cloud storage (AWS S3 / Azure Blob)

#### 3.6 - Infrastructure DevOps (Priorité Moyenne)
- [ ] Pipeline CI/CD avec GitHub Actions
  - [ ] Tests automatiques sur PR
  - [ ] Build et déploiement automatique
  - [ ] Analyse de sécurité (Snyk)
- [ ] Scripts d'administration
- [ ] Monitoring avec Prometheus + Grafana
- [ ] Logging centralisé (ELK Stack)
- [ ] Backup automatisé de la base de données

#### 3.7 - Sécurité Renforcée (Priorité Haute) ✅ COMPLÉTÉ
- [x] Rate limiting granulaire par endpoint - **8 limiters spécialisés**
  - [x] authLimiter (5 req/15min)
  - [x] writeOperationsLimiter (30 req/10min)
  - [x] uploadLimiter (20 req/1h)
  - [x] searchLimiter (50 req/5min)
  - [x] messagingLimiter (40 req/10min)
  - [x] adminLimiter (200 req/15min)
  - [x] deleteLimiter (10 req/1h)
  - [x] analyticsLimiter (60 req/10min)
- [x] Validation renforcée des inputs (Zod schemas) - **15+ schémas**
  - [x] Schémas d'authentification (register, login, changePassword)
  - [x] Schémas de profils (create, update, preferences)
  - [x] Schémas d'activités (filters, session, completion)
  - [x] Schémas de progrès et récompenses
  - [x] Schémas de ressources et messages
  - [x] Middleware de validation avec formatage d'erreurs
  - [x] Sanitization des inputs (XSS protection)
- [x] Audit logging des actions sensibles
  - [x] AuditService avec 25+ types d'actions
  - [x] Enregistrement automatique dans Winston logs
  - [x] Middleware d'audit pour routes
  - [x] Tracking des connexions, modifications, suppressions
  - [x] Détection d'activités suspectes
  - [x] Logs de rate limiting et accès non autorisés
- [x] RBAC (Role-Based Access Control) complet
  - [x] 5 rôles définis (CHILD, PARENT, EDUCATOR, THERAPIST, ADMIN)
  - [x] 25+ permissions granulaires
  - [x] Matrice de permissions par rôle
  - [x] Middleware requirePermission
  - [x] Middleware requireRole
  - [x] Middleware requireOwnership
  - [x] Contrôle d'accès aux profils enfants
- [ ] Scan de vulnérabilités (OWASP ZAP) - **À faire**
- [x] Headers de sécurité HTTP avancés
  - [x] Configuration Helmet complète
  - [x] Content Security Policy (CSP)
  - [x] HSTS avec preload
  - [x] XSS Protection
  - [x] Clickjacking protection (frameguard)
  - [x] CORS sécurisé avec whitelist
  - [x] Protection SQL injection
  - [x] Protection NoSQL injection
  - [x] Permissions Policy

**Résultat**: Sécurité renforcée à plusieurs niveaux (réseau, application, données)

#### 3.8 - Performance et Optimisation (Priorité Moyenne) ✅ COMPLÉTÉ
- [x] Cache Redis pour ressources fréquentes - **CacheService complet**
  - [x] Service Redis avec reconnexion automatique
  - [x] Méthodes get/set/delete avec TTL configurable
  - [x] Pattern cache-aside (getOrSet)
  - [x] Invalidation par pattern (user, child, activities, resources)
  - [x] Clés de cache prédéfinies (CacheKeys)
  - [x] TTL recommandés (SHORT, MEDIUM, LONG, VERY_LONG)
  - [x] Statistiques et monitoring du cache
- [x] Optimisation des queries Prisma - **Helpers et patterns**
  - [x] Sélections optimisées par modèle (minimal, complete, list)
  - [x] Includes optimisés par cas d'usage
  - [x] WhereBuilder pour filtres dynamiques
  - [x] Helpers de recherche textuelle (contains, startsWith, multiField)
  - [x] Filtres de date (today, thisWeek, thisMonth, lastNDays)
  - [x] Opérations batch (batchUpdate, batchDelete)
  - [x] Helpers d'existence et comptage optimisés
- [x] Pagination pour toutes les listes - **Système complet**
  - [x] Pagination offset-based avec métadonnées
  - [x] Pagination cursor-based pour grandes données
  - [x] Helper paginateWithPrisma
  - [x] Headers de pagination (X-Total-Count, X-Total-Pages, etc.)
  - [x] Liens HATEOAS (first, last, next, prev)
  - [x] Validation et normalisation des paramètres
  - [x] Limite maximale configurable (100 par défaut)
- [x] Compression gzip des réponses API
  - [x] Middleware compression pour réponses > 1KB
  - [x] Niveau de compression configurable
  - [x] Filtrage intelligent par type de contenu
- [x] Middlewares de performance additionnels
  - [x] responseTimeMiddleware - Mesure temps de réponse
  - [x] cacheControlMiddleware - Headers de cache HTTP
  - [x] payloadSizeLimit - Limite taille des requêtes (10MB)
  - [x] memoryMonitor - Détection fuites mémoire
  - [x] statsCollector - Statistiques de performance
- [ ] CDN pour assets statiques - **À faire**
- [ ] Lazy loading des composants React - **À faire (frontend)**

**Résultat**: Amélioration significative des performances backend avec cache, compression et queries optimisées

#### 3.9 - Activités Interactives Spécifiques (Priorité Haute)
- [ ] Composants d'activités par catégorie:
  - [ ] Reconnaissance des émotions (drag & drop)
  - [ ] Tableau CAA interactif
  - [ ] Jeux de mathématiques adaptés
  - [ ] Séquences d'habillage/hygiène
  - [ ] Exercices de respiration pour régulation
- [ ] Système de scoring et feedback immédiat
- [ ] Adaptabilité du niveau de difficulté

#### 3.10 - Composants UI Additionnels (Priorité Basse)
- [ ] Storybook pour documentation composants
- [ ] Composants d'accessibilité avancés
- [ ] Bibliothèque de pictogrammes intégrée
- [ ] Composants d'animations douces (Framer Motion)
- [ ] Lecteur vidéo personnalisé

### Phase 4 (Futur - Long terme)
- [ ] Module IA de personnalisation adaptative
- [ ] Analyse vidéo pour suivi comportemental
- [ ] Application mobile (React Native)
- [ ] Intégration de l'analyse vocale
- [ ] Marketplace de contenu éducatif
- [ ] Intégration avec systèmes scolaires (LMS)
- [ ] Recherche et collecte de données anonymisées
- [ ] Support multilingue (anglais, espagnol, arabe, etc.)

## Tests et Qualité du Code

### Vue d'ensemble

Le projet SuperKids Learning maintient une suite de tests complète pour garantir la qualité, la fiabilité et la maintenabilité du code.

### Tests Backend ✅

#### Structure des Tests

```
backend/src/
├── services/
│   ├── __tests__/
│   │   ├── auth.service.test.ts       (9 tests)
│   │   ├── profile.service.test.ts    (8 tests)
│   │   ├── activity.service.test.ts   (10 tests)
│   │   ├── progress.service.test.ts   (12 tests)
│   │   └── message.service.test.ts    (12 tests)
│   ├── auth.service.ts
│   ├── profile.service.ts
│   └── ...
├── controllers/__tests__/
├── middleware/__tests__/
└── setupTests.ts
```

#### Tests Unitaires des Services (51 tests)

**AuthService** - Authentification et Sécurité
- ✅ Enregistrement utilisateur avec hashage bcrypt
- ✅ Connexion avec validation identifiants
- ✅ Validation tokens JWT
- ✅ Changement mot de passe sécurisé
- ✅ Gestion erreurs (email existant, credentials invalides)

**ProfileService** - Gestion des Profils
- ✅ CRUD complet profils enfants
- ✅ Création automatique Progress associé
- ✅ Mise à jour préférences accessibilité
- ✅ Récupération profils par parent/éducateur
- ✅ Validation données et gestion erreurs

**ActivityService** - Activités d'Apprentissage
- ✅ Récupération activités avec filtres (catégorie, difficulté, recherche)
- ✅ Démarrage et complétion sessions
- ✅ Calcul automatique progressions
- ✅ Historique et statistiques détaillées
- ✅ Validation child/activity existence

**ProgressService** - Suivi des Progrès
- ✅ Gestion progrès avec création automatique
- ✅ Système de jetons et récompenses
- ✅ Déblocage récompenses avec validation
- ✅ Calcul streaks (séries quotidiennes)
- ✅ Analytiques détaillées (successRate, favoriteCategories, timeSpent)
- ✅ Leaderboard

**MessageService** - Messagerie
- ✅ Envoi/réception messages
- ✅ Gestion messages non lus
- ✅ Conversations entre utilisateurs
- ✅ Sécurité (validation sender/recipient)
- ✅ Comptage et marquage lecture

#### Méthodologie de Tests

- **Isolation**: Mocks de Prisma Client pour tests indépendants
- **Couverture**: 100% des méthodes publiques
- **Cas testés**: Success paths + Error paths
- **Assertions**: Validations détaillées des retours et effets de bord
- **Jest**: Framework de test avec support TypeScript

#### Commandes de Test

```bash
# Tous les tests backend
cd backend
npm test

# Tests des services uniquement
npm test -- --testPathPattern="services/__tests__"

# Avec couverture de code
npm test -- --coverage

# Mode watch pour développement
npm test -- --watch

# Tests spécifiques
npm test -- auth.service.test.ts
```

#### Configuration Jest

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

#### Tests d'Intégration des API Endpoints (78 tests) ✅

Les tests d'intégration valident le fonctionnement complet des endpoints API avec les controllers, routes, services et base de données.

**Structure des Tests d'Intégration**

```
backend/src/
├── __tests__/
│   └── integration/
│       ├── auth.routes.test.ts       (13 tests)
│       ├── profile.routes.test.ts    (12 tests)
│       ├── activity.routes.test.ts   (15 tests)
│       ├── progress.routes.test.ts   (11 tests)
│       ├── resource.routes.test.ts   (12 tests)
│       └── message.routes.test.ts    (15 tests)
└── tests/
    └── helpers/
        └── testSetup.ts              (Configuration & Helpers)
```

**Tests Authentication Routes (13 tests)**
- ✅ POST /api/auth/register - Inscription utilisateur
  - Création réussie avec données valides
  - Échec avec email existant
  - Validation champs requis
  - Validation format email
- ✅ POST /api/auth/login - Connexion
  - Authentification réussie
  - Échec mot de passe incorrect
  - Échec email inexistant
  - Validation champs requis
- ✅ POST /api/auth/logout - Déconnexion
- ✅ GET /api/auth/me - Profil utilisateur
  - Récupération avec token valide
  - Échec sans token
  - Échec token invalide

**Tests Profile Routes (12 tests)**
- ✅ GET /api/profiles/:id - Récupération profil
- ✅ PUT /api/profiles/:id - Mise à jour profil
- ✅ PATCH /api/profiles/:id/preferences - Préférences sensorielles
  - Mise à jour complète
  - Mise à jour partielle
- ✅ GET /api/profiles/children/all - Liste profils enfants
  - Avec plusieurs profils
  - Tableau vide si aucun profil
  - Échec sans authentification

**Tests Activity Routes (15 tests)**
- ✅ GET /api/activities - Liste activités
  - Toutes les activités
  - Filtres par catégorie
  - Filtres par difficulté
- ✅ GET /api/activities/:id - Activité par ID
- ✅ GET /api/activities/category/:category - Par catégorie
- ✅ POST /api/activities/session/start - Démarrer session
  - Création réussie
  - Validation child/activity ID
  - Validation champs requis
- ✅ POST /api/activities/session/:sessionId/complete - Terminer session
  - Complétion avec tokens gagnés
  - Validation successRate (0-100)
  - Erreur session inexistante
- ✅ PATCH /api/activities/session/:sessionId - Mise à jour session

**Tests Progress Routes (11 tests)**
- ✅ GET /api/progress/:childId - Statistiques progression
- ✅ PUT /api/progress/:childId - Mise à jour (admin only)
  - Mise à jour réussie (admin)
  - Échec non-admin (403)
  - Validation valeurs négatives
- ✅ GET /api/progress/:childId/rewards - Liste récompenses
  - Récompenses débloquées
  - Récompenses disponibles
- ✅ POST /api/progress/:childId/rewards/:rewardId/unlock - Débloquer
  - Déblocage réussi avec jetons
  - Échec jetons insuffisants
  - Échec récompense déjà débloquée

**Tests Resource Routes (12 tests)**
- ✅ GET /api/resources - Liste ressources
  - Pagination (page, limit)
  - Filtres type et catégorie
  - Métadonnées pagination (total, pages)
- ✅ GET /api/resources/type/:type - Par type
  - Ressources du type spécifié
  - Tableau vide si aucune ressource
- ✅ GET /api/resources/search - Recherche
  - Recherche par query
  - Filtres combinés (query + type)
  - Résultats vides
  - Validation query requis
- ✅ GET /api/resources/:id - Ressource par ID

**Tests Message Routes (15 tests)**
- ✅ POST /api/messages - Envoyer message
  - Envoi réussi avec pièces jointes
  - Envoi sans pièces jointes
  - Validation champs requis
  - Validation destinataire existant
- ✅ GET /api/messages/user/:userId - Messages utilisateur
  - Messages envoyés et reçus
  - Filtre messages non lus
  - Comptage non lus
  - Tableaux vides si aucun message
- ✅ PATCH /api/messages/:messageId/read - Marquer comme lu
  - Marquage réussi (destinataire)
  - Échec si non destinataire (403)
  - Erreur message inexistant
- ✅ DELETE /api/messages/:messageId - Supprimer
  - Suppression réussie (expéditeur)
  - Suppression réussie (destinataire)
  - Échec utilisateur non autorisé (403)

**Helper de Tests (`testSetup.ts`)**

Fonctions utilitaires pour simplifier les tests:

```typescript
// Clean database avant chaque test
await cleanDatabase();

// Créer utilisateur test avec token
const { userId, token, user } = await createTestUser(app, {
  email: 'test@example.com',
  password: 'SecureP@ssw0rd',
  name: 'Test User',
  role: 'PARENT',
});

// Créer profil enfant test
const profile = await createTestChildProfile(app, token, userId);

// Créer activité test
const activity = await createTestActivity();

// Créer ressource test
const resource = await createTestResource();

// Teardown après tests
await teardown();
```

**Technologie de Tests d'Intégration**

- **Supertest**: Tests HTTP des endpoints Express
- **Prisma Client**: Base de données réelle (test DB)
- **Jest**: Framework de test et assertions
- **Express App**: Application complète avec routes/middlewares
- **JWT Real Tokens**: Authentification réelle

**Méthodologie**

- ✅ Tests avec base de données réelle (nettoyée avant chaque test)
- ✅ Tests des happy paths et error paths
- ✅ Validation codes de statut HTTP
- ✅ Validation format des réponses JSON
- ✅ Tests d'authentification et autorisations
- ✅ Tests de validation des données
- ✅ Tests des relations entre entités

**Exécution des Tests d'Intégration**

```bash
# Tous les tests d'intégration
npm test -- --testPathPattern="__tests__/integration"

# Tests d'un endpoint spécifique
npm test -- auth.routes.test.ts

# Avec couverture
npm test -- --testPathPattern="integration" --coverage

# Mode watch
npm test -- --testPathPattern="integration" --watch
```

**Statistiques Globales de Tests**

- **Tests Unitaires**: 51 tests (services)
- **Tests d'Intégration**: 78 tests (endpoints API)
- **Total**: **129 tests** 🎉
- **Couverture**: > 80% du code backend
- **Catégories testées**: 6 (Auth, Profiles, Activities, Progress, Resources, Messages)

### Tests Frontend (À compléter)

```bash
cd frontend
npm test
```

### Standards de Qualité

- **TypeScript Strict**: Typage strict sur tous les fichiers
- **ESLint**: Règles strictes avec auto-fix
- **Prettier**: Formatage automatique
- **Tests**: Couverture minimale 70% (objectif 80%+)
- **Code Review**: Obligatoire sur toutes les PRs
- **Documentation**: JSDoc pour toutes les fonctions publiques

### Monitoring et Logging

#### Winston Logger

Tous les services utilisent un logger structuré:

```typescript
import { logger } from '../utils/logger';

logger.info('Action réussie', { userId, action });
logger.error('Erreur critique', { error, context });
logger.warn('Attention requise', { details });
```

Format des logs:
```json
{
  "level": "info",
  "message": "Utilisateur connecté",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "service": "auth",
  "metadata": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

#### Gestion des Erreurs

Classe personnalisée `AppError` pour erreurs métier:

```typescript
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Usage
throw new AppError('Utilisateur introuvable', 404);
throw new AppError('Pas assez de jetons', 400);
```

## Documentation API avec Swagger/OpenAPI

### Vue d'ensemble

SuperKids Learning utilise **Swagger UI** pour fournir une documentation API interactive et complète. Cette documentation permet aux développeurs de:
- **Explorer** tous les endpoints disponibles
- **Tester** les appels API directement depuis le navigateur
- **Comprendre** les schémas de données et les réponses
- **S'authentifier** avec JWT pour tester les endpoints protégés

### Accès à la Documentation

#### Interface Swagger UI
```
📚 http://localhost:5000/api-docs
```
Interface interactive avec Try-it-out pour chaque endpoint.

#### Spécification OpenAPI JSON
```
📄 http://localhost:5000/api-docs.json
```
Fichier JSON OpenAPI 3.0 brut, utilisable avec des outils comme Postman, Insomnia, etc.

### Configuration Swagger

#### Fichier de Configuration (`backend/src/config/swagger.ts`)

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SuperKids Learning API',
    version: '1.1.0',
    description: 'API REST pour l\'application d\'apprentissage',
    contact: {
      name: 'SuperKids Learning Support',
      email: 'support@superkids-learning.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Serveur de développement'
    },
    {
      url: 'https://api.superkids-learning.com',
      description: 'Serveur de production'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};
```

### Schémas de Données Documentés

#### 7 Modèles Principaux

1. **User** - Utilisateurs de l'application
2. **ChildProfile** - Profils enfants avec préférences
3. **Activity** - Activités d'apprentissage
4. **Progress** - Suivi des progrès et récompenses
5. **Message** - Messages entre utilisateurs
6. **Resource** - Ressources pédagogiques
7. **Error** - Format des erreurs API

#### Exemple de Schéma: ChildProfile

```yaml
ChildProfile:
  type: object
  properties:
    id:
      type: string
      format: uuid
    userId:
      type: string
      format: uuid
    dateOfBirth:
      type: string
      format: date
    age:
      type: integer
      minimum: 3
      maximum: 12
    sensoryPreferences:
      type: array
      items:
        type: string
        enum: [LOW_STIMULATION, MEDIUM_STIMULATION, HIGH_CONTRAST, MONOCHROME]
    iepGoals:
      type: array
      items:
        type: string
    soundEnabled:
      type: boolean
    dyslexiaMode:
      type: boolean
    highContrastMode:
      type: boolean
```

### Catégorisation des Endpoints (Tags)

Les endpoints sont organisés par tags:

- **Authentication** - Authentification et gestion utilisateurs
- **Profiles** - Gestion profils enfants
- **Activities** - Activités d'apprentissage
- **Progress** - Suivi progrès et récompenses
- **Resources** - Bibliothèque de ressources
- **Messages** - Messagerie
- **Health** - Endpoints de santé

### Authentification JWT dans Swagger

#### 1. Obtenir un Token

Utilisez l'endpoint `POST /api/auth/login` dans Swagger UI:

```json
{
  "email": "parent@example.com",
  "password": "votre_mot_de_passe"
}
```

Réponse:
```json
{
  "user": {
    "id": "user_123",
    "email": "parent@example.com",
    "name": "Parent Test",
    "role": "PARENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Autoriser dans Swagger UI

1. Cliquez sur le bouton **"Authorize"** 🔒 en haut à droite
2. Entrez: `Bearer <votre_token>`
3. Cliquez sur "Authorize"
4. Tous les endpoints protégés sont maintenant accessibles

### Exemples d'Utilisation

#### Obtenir Tous les Profils Enfants

```http
GET /api/profiles/children/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Réponse:
```json
[
  {
    "id": "profile_123",
    "userId": "user_456",
    "age": 7,
    "sensoryPreferences": ["LOW_STIMULATION"],
    "soundEnabled": false,
    "dyslexiaMode": true
  }
]
```

#### Démarrer une Session d'Activité

```http
POST /api/activities/session/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "childId": "profile_123",
  "activityId": "activity_789"
}
```

Réponse:
```json
{
  "id": "session_abc",
  "childId": "profile_123",
  "activityId": "activity_789",
  "startTime": "2025-11-16T10:00:00.000Z",
  "completed": false
}
```

#### Compléter une Session

```http
POST /api/activities/session/session_abc/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "successRate": 0.85,
  "attemptsCount": 3,
  "supportLevel": "minimal",
  "emotionalState": "happy"
}
```

### Annotations JSDoc dans le Code

Les endpoints sont documentés directement dans le code avec JSDoc:

```typescript
/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Vérifier l'état de l'API
 *     description: Retourne l'état de santé de l'API
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '...' });
});
```

### Réponses d'Erreur Standardisées

Toutes les erreurs suivent le même format:

```typescript
{
  "message": "Description de l'erreur",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
```

Codes d'erreur communs:
- **401 Unauthorized**: Token manquant ou invalide
- **403 Forbidden**: Accès refusé
- **404 Not Found**: Ressource introuvable
- **400 Bad Request**: Données invalides
- **500 Internal Server Error**: Erreur serveur

### Composants Réutilisables

#### Réponses Prédéfinies

```yaml
components:
  responses:
    Unauthorized:
      description: Non authentifié
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: Token invalide ou expiré
            statusCode: 401
            code: UNAUTHORIZED

    NotFound:
      description: Ressource non trouvée
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

### Intégration avec Autres Outils

#### Postman
1. Téléchargez le JSON: `http://localhost:5000/api-docs.json`
2. Importez dans Postman: File → Import → Paste Raw Text
3. Collection prête à l'emploi avec tous les endpoints !

#### Insomnia
1. Téléchargez le JSON OpenAPI
2. Importez dans Insomnia
3. Toutes les routes sont automatiquement créées

#### VS Code REST Client
Créez un fichier `.http`:
```http
@baseUrl = http://localhost:5000
@token = {{auth_token}}

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Profile
GET {{baseUrl}}/api/profiles/user_123
Authorization: Bearer {{token}}
```

### Personnalisation Swagger UI

Dans `server.ts`:

```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SuperKids Learning API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true, // Garder le token en mémoire
    displayRequestDuration: true, // Afficher durée des requêtes
    filter: true, // Activer la recherche
    syntaxHighlight: {
      theme: 'monokai' // Thème de coloration
    }
  }
}));
```

### Bonnes Pratiques

✅ **Documentation à jour** - Swagger est généré depuis le code source
✅ **Types cohérents** - Schémas alignés avec Prisma/TypeScript
✅ **Exemples concrets** - Chaque endpoint a des exemples
✅ **Erreurs documentées** - Tous les codes d'erreur expliqués
✅ **Authentification claire** - Process JWT bien décrit
✅ **Versioning** - Version de l'API dans la config

### Avantages pour le Développement

1. **Frontend**: Connaissance exacte des contrats API
2. **Backend**: Documentation auto-générée, toujours à jour
3. **Tests**: Utilisation directe dans Swagger UI
4. **Onboarding**: Nouveaux développeurs comprennent l'API rapidement
5. **Clients**: Génération automatique de clients SDK

### Endpoints API Documentés (26 endpoints)

Tous les endpoints REST de l'application sont entièrement documentés avec Swagger/OpenAPI.

#### Authentication (4 endpoints)

**POST `/api/auth/register`**
- Créer un nouveau compte utilisateur
- Body: `{ email, password, name, role }`
- Response: `{ user, token }`
- Rate limited: 5 requêtes/15 min

**POST `/api/auth/login`**
- Authentification d'un utilisateur
- Body: `{ email, password }`
- Response: `{ user, token }`
- Rate limited: 5 requêtes/15 min

**POST `/api/auth/logout`**
- Déconnexion (invalide le token côté client)
- Auth required: ✅
- Response: `{ success, message }`

**GET `/api/auth/me`**
- Obtenir le profil de l'utilisateur connecté
- Auth required: ✅
- Response: `{ id, email, name, role, createdAt }`

#### Profiles (4 endpoints)

**GET `/api/profiles/:id`**
- Obtenir un profil enfant par ID
- Auth required: ✅
- Response: ChildProfile complet
- Errors: 404 si profil introuvable

**PUT `/api/profiles/:id`**
- Mettre à jour un profil enfant
- Auth required: ✅
- Body: `{ dateOfBirth?, avatarUrl?, developmentLevel?, iepGoals? }`
- Response: ChildProfile mis à jour

**PATCH `/api/profiles/:id/preferences`**
- Mettre à jour les préférences sensorielles
- Auth required: ✅
- Body: `{ sensoryPreferences?, soundEnabled?, animationsEnabled?, dyslexiaMode?, highContrastMode?, fontSize? }`
- Response: ChildProfile avec préférences mises à jour

**GET `/api/profiles/children/all`**
- Obtenir tous les profils enfants
- Auth required: ✅
- Response: Array de ChildProfile
- Permissions: PARENT, EDUCATOR, THERAPIST, ADMIN

#### Activities (6 endpoints)

**GET `/api/activities`**
- Obtenir toutes les activités avec filtres
- Auth required: ✅
- Query params: `category?, difficulty?, minAge?, maxAge?`
- Response: Array d'Activity
- Filtres disponibles: SOCIAL_SKILLS, COMMUNICATION, ACADEMIC, AUTONOMY, EMOTIONAL_REGULATION

**GET `/api/activities/:id`**
- Obtenir une activité par ID
- Auth required: ✅
- Response: Activity complet avec instructions et targetSkills
- Errors: 404 si activité introuvable

**GET `/api/activities/category/:category`**
- Obtenir les activités par catégorie
- Auth required: ✅
- Params: category (SOCIAL_SKILLS | COMMUNICATION | ACADEMIC | AUTONOMY | EMOTIONAL_REGULATION)
- Response: Array d'Activity de la catégorie

**POST `/api/activities/session/start`**
- Démarrer une session d'activité
- Auth required: ✅
- Body: `{ childId, activityId }`
- Response: `{ sessionId, startedAt }`
- Creates: Nouveau ActivitySession dans la base

**POST `/api/activities/session/:sessionId/complete`**
- Terminer une session d'activité
- Auth required: ✅
- Body: `{ successRate (0-100), responses?, notes? }`
- Response: `{ tokensEarned, rewardsUnlocked }`
- Side effects: Met à jour Progress automatiquement

**PATCH `/api/activities/session/:sessionId`**
- Mettre à jour une session en cours
- Auth required: ✅
- Body: `{ responses?, notes? }`
- Response: Session mise à jour
- Utilité: Sauvegarde progressive pendant l'activité

#### Progress (4 endpoints)

**GET `/api/progress/:childId`**
- Obtenir les statistiques de progression
- Auth required: ✅
- Response: Progress complet `{ totalActivitiesCompleted, tokensEarned, currentStreak, longestStreak, lastActivityDate, rewardsUnlocked }`

**PUT `/api/progress/:childId`**
- Mettre à jour le progrès (admin uniquement)
- Auth required: ✅ + ADMIN role
- Body: `{ totalActivitiesCompleted?, tokensEarned?, currentStreak? }`
- Response: Progress mis à jour
- Errors: 403 si non autorisé

**GET `/api/progress/:childId/rewards`**
- Obtenir les récompenses (débloquées et disponibles)
- Auth required: ✅
- Response: `{ unlocked: string[], available: string[] }`

**POST `/api/progress/:childId/rewards/:rewardId/unlock`**
- Débloquer une récompense
- Auth required: ✅
- Response: `{ rewardId, tokensSpent }`
- Errors: 400 si tokens insuffisants ou déjà débloquée

#### Resources (4 endpoints)

**GET `/api/resources`**
- Obtenir toutes les ressources pédagogiques
- Auth required: ✅
- Query params: `page=1, limit=20, type?, category?`
- Response: `{ data: Resource[], pagination: { page, limit, total, pages } }`
- Pagination: 20 résultats par défaut

**GET `/api/resources/type/:type`**
- Obtenir les ressources par type
- Auth required: ✅
- Params: type (video | pictogram | social_story | guide | tutorial)
- Response: Array de Resource du type spécifié

**GET `/api/resources/search`**
- Rechercher des ressources
- Auth required: ✅
- Query params: `q (required), type?, category?`
- Response: `{ data: Resource[], count: number }`
- Recherche: titre, description, tags

**GET `/api/resources/:id`**
- Obtenir une ressource par ID
- Auth required: ✅
- Response: Resource complet
- Errors: 404 si ressource introuvable

#### Messages (4 endpoints)

**GET `/api/messages/user/:userId`**
- Obtenir les messages d'un utilisateur
- Auth required: ✅
- Query params: `unreadOnly=false`
- Response: `{ sent: Message[], received: Message[], unreadCount: number }`

**POST `/api/messages`**
- Envoyer un message
- Auth required: ✅
- Body: `{ recipientId, subject, content, attachments? }`
- Response: Message créé
- Side effects: Notification temps réel via Socket.io
- Errors: 404 si destinataire introuvable

**PATCH `/api/messages/:messageId/read`**
- Marquer un message comme lu
- Auth required: ✅
- Response: Message mis à jour
- Side effects: Notification de lecture via Socket.io
- Errors: 403 si non destinataire

**DELETE `/api/messages/:messageId`**
- Supprimer un message
- Auth required: ✅
- Response: `{ success, message }`
- Permissions: Expéditeur ou destinataire uniquement
- Errors: 403 si non autorisé

### Statistiques de Documentation

- **Total endpoints documentés**: 26
- **Endpoints protégés (JWT)**: 22 (85%)
- **Endpoints publics**: 4 (register, login, logout, health)
- **Catégories**: 6 (Auth, Profiles, Activities, Progress, Resources, Messages)
- **Schémas de données**: 7 (User, ChildProfile, Activity, Progress, Message, Resource, Error)
- **Méthodes HTTP utilisées**: GET (11), POST (9), PUT (2), PATCH (3), DELETE (1)

Tous ces endpoints sont testables interactivement via Swagger UI à `http://localhost:5000/api-docs`.

## Communication Temps Réel avec Socket.io

### Vue d'ensemble

SuperKids Learning utilise Socket.io pour fournir des fonctionnalités temps réel essentielles:
- **Messagerie instantanée** entre parents, éducateurs et thérapeutes
- **Notifications en direct** pour les progrès et récompenses
- **Présence utilisateur** (online/offline/away)
- **Indicateurs de frappe** dans les conversations
- **Mises à jour live** des activités et progrès

### Architecture Socket.io

```
┌──────────────┐                  ┌──────────────┐
│   Frontend   │  ◄──────────►    │   Backend    │
│  (React)     │   WebSocket      │  (Node.js)   │
│              │                  │              │
│ SocketService│                  │SocketService │
└──────────────┘                  └──────────────┘
        │                                │
        │ Events:                        │
        │ - authenticate                 │ Events:
        │ - send-message                 │ - new-message
        │ - typing-start                 │ - user-online
        │ - join-room                    │ - progress-update
        └────────────────────────────────┘
```

### Implémentation Backend

#### SocketService (`backend/src/services/socket.service.ts`)

Service complet de gestion des événements Socket.io:

```typescript
export class SocketService {
  private io: Server;
  private prisma: PrismaClient;
  private onlineUsers: Map<string, Set<string>>;
  private typingUsers: Map<string, Set<string>>;

  // Méthodes principales
  - handleAuthentication()     // Authentification JWT
  - handleMessaging()          // Événements de messagerie
  - handlePresence()           // Gestion présence
  - handleNotifications()      // Notifications temps réel
  - setUserOnline/Offline()    // Gestion connexions multiples
}
```

#### Types Socket.io (`backend/src/types/socket.types.ts`)

Types TypeScript complets pour la sécurité:

```typescript
interface ClientToServerEvents {
  authenticate: (token: string) => void;
  'send-message': (data: SendMessageData) => void;
  'typing-start': (data: TypingData) => void;
  'join-room': (userId: string) => void;
  // ... 10+ événements
}

interface ServerToClientEvents {
  'new-message': (data: NewMessageData) => void;
  'user-online': (userId: string) => void;
  'progress-update': (data: ProgressUpdateData) => void;
  'reward-unlocked': (data: RewardUnlockedData) => void;
  // ... 15+ événements
}
```

### Événements Temps Réel

#### 1. Authentification

```typescript
// Client → Server
socket.emit('authenticate', jwtToken);

// Server → Client
socket.on('authenticated', (userId) => {
  console.log('Authenticated as:', userId);
});
```

#### 2. Messagerie

```typescript
// Envoyer un message
socketService.sendMessage({
  recipientId: 'user_456',
  subject: 'Question sur les progrès',
  content: 'Comment va mon enfant ?',
  attachments: []
});

// Recevoir un nouveau message
socketService.on('new-message', (message) => {
  // Afficher notification
  showNotification(message);
  // Mettre à jour UI
  updateMessagesList(message);
});

// Indicateur de frappe
socketService.startTyping(conversationId, userId);
socketService.stopTyping(conversationId, userId);

// Écouter indicateurs de frappe
socketService.on('typing-indicator', ({ userName, isTyping }) => {
  if (isTyping) {
    showTypingIndicator(`${userName} est en train d'écrire...`);
  }
});
```

#### 3. Présence Utilisateur

```typescript
// Changer son statut
socketService.setUserStatus('online'); // 'online' | 'offline' | 'away'

// Écouter les changements de statut
socketService.on('user-online', (userId) => {
  updateUserPresence(userId, 'online');
});

socketService.on('user-offline', (userId) => {
  updateUserPresence(userId, 'offline');
});

// Vérifier qui est en ligne
GET /health/socket
{
  "status": "OK",
  "onlineUsers": 12,
  "users": ["user_1", "user_2", ...]
}
```

#### 4. Notifications en Temps Réel

```typescript
// Recevoir une notification
socketService.on('new-notification', (notification) => {
  // Afficher toast/banner
  toast.info(notification.title, notification.message);

  // Jouer un son (si activé)
  if (soundEnabled) playNotificationSound();

  // Incrémenter compteur
  incrementNotificationCount();
});

// Types de notifications
type NotificationType =
  | 'message'           // Nouveau message
  | 'progress'          // Mise à jour progrès
  | 'reward'            // Récompense débloquée
  | 'activity'          // Activité complétée
  | 'system';           // Notification système
```

#### 5. Mises à Jour de Progrès

```typescript
// Backend émet après complétion d'activité
socketService.notifyProgressUpdate(childId, {
  tokensEarned: 10,
  totalActivitiesCompleted: 25,
  currentStreak: 5
});

// Frontend écoute
socketService.on('progress-update', (data) => {
  // Mettre à jour Redux store
  dispatch(updateProgress(data));

  // Animation de célébration
  if (data.tokensEarned > 0) {
    showTokensAnimation(data.tokensEarned);
  }
});

// Récompense débloquée
socketService.on('reward-unlocked', (reward) => {
  showRewardModal({
    name: reward.rewardName,
    type: reward.rewardType,
    icon: reward.iconUrl
  });
  playConfettiAnimation();
});
```

### Implémentation Frontend

#### SocketService (`frontend/src/services/socketService.ts`)

Client Socket.io singleton pour React:

```typescript
import { socketService } from '../services/socketService';

// Dans App.tsx ou layout principal
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    socketService.connect(token);
  }

  return () => {
    socketService.disconnect();
  };
}, []);

// Dans un composant de messagerie
const MessageComponent = () => {
  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      playNotificationSound();
    };

    socketService.on('new-message', handleNewMessage);

    return () => {
      socketService.off('new-message', handleNewMessage);
    };
  }, []);

  const sendMessage = () => {
    socketService.sendMessage({
      recipientId: selectedUser.id,
      subject: 'Hello',
      content: messageText
    });
  };

  return (/* JSX */);
};
```

### Gestion Multi-Connexions

Le SocketService gère automatiquement les connexions multiples:

```typescript
// Un utilisateur peut avoir plusieurs connexions
// (navigateur, mobile, tablette)
private onlineUsers: Map<string, Set<string>>;
// userId → Set<socketId>

// L'utilisateur est "offline" seulement quand toutes
// ses connexions sont fermées
private setUserOffline(userId, socketId) {
  userSockets.delete(socketId);
  if (userSockets.size === 0) {
    // Vraiment offline
    this.io.emit('user-offline', userId);
  }
}
```

### Sécurité

#### Authentification JWT

```typescript
// Le socket doit s'authentifier avant d'envoyer des événements
socket.on('authenticate', async (token) => {
  const decoded = jwt.verify(token, jwtSecret);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (user) {
    socket.data.userId = user.id;
    socket.data.authenticated = true;
    socket.join(user.id);
    socket.emit('authenticated', user.id);
  } else {
    socket.emit('auth-error', 'Invalid token');
  }
});

// Validation sur chaque événement
socket.on('send-message', async (data) => {
  if (!socket.data.authenticated) {
    socket.emit('error', {
      message: 'Not authenticated',
      code: 'AUTH_REQUIRED'
    });
    return;
  }
  // ... traitement
});
```

#### Validation des Données

```typescript
// Validation des données entrantes
socket.on('send-message', (data: SendMessageData) => {
  // Vérifier que l'expéditeur est bien l'utilisateur connecté
  if (data.senderId !== socket.data.userId) {
    socket.emit('error', { message: 'Unauthorized' });
    return;
  }

  // Valider les champs requis
  if (!data.recipientId || !data.content) {
    socket.emit('error', { message: 'Missing required fields' });
    return;
  }

  // Créer le message dans la DB
  // ...
});
```

### Configuration et Optimisation

#### Paramètres Socket.io

```typescript
// backend/src/server.ts
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  pingTimeout: 60000,      // 60s avant de considérer déconnecté
  pingInterval: 25000,     // Ping tous les 25s
  reconnection: true,      // Auto-reconnexion
  reconnectionAttempts: 5  // Max 5 tentatives
});
```

#### Rooms et Namespaces

```typescript
// Rooms par utilisateur
socket.join(userId);  // Chaque user a sa room

// Rooms pour conversations
socket.join(`conversation_${conversationId}`);

// Émission ciblée
io.to(userId).emit('new-message', message);
io.to(conversationId).emit('typing-indicator', data);

// Broadcast à tous sauf l'émetteur
socket.broadcast.emit('user-online', userId);
```

### Endpoints de Santé

```bash
# Vérifier l'état général
GET /health
{
  "status": "OK",
  "message": "SuperKids Learning API is running",
  "timestamp": "2025-11-16T...",
  "environment": "development"
}

# Vérifier Socket.io
GET /health/socket
{
  "status": "OK",
  "onlineUsers": 12,
  "users": ["user_1", "user_2", ...]
}
```

### Logs et Debugging

Tous les événements Socket.io sont loggés:

```typescript
logger.info(`Socket connected: ${socket.id}`);
logger.info(`User authenticated: ${userName} (${userId})`);
logger.info(`Message sent from ${senderId} to ${recipientId}`);
logger.info(`User ${userId} status changed to ${status}`);
```

Format des logs:
```json
{
  "level": "info",
  "message": "Message sent from user_123 to user_456",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "service": "socket"
}
```

## Sécurité Renforcée (Phase 3.7)

### Vue d'ensemble

SuperKids Learning implémente une architecture de sécurité multi-niveaux pour protéger les données sensibles des enfants et garantir la conformité avec les réglementations (RGPD, COPPA).

### 1. Rate Limiting Granulaire

#### Limiters Spécialisés par Type d'Endpoint

Le système implémente 8 rate limiters différenciés selon le niveau de sensibilité:

```typescript
// backend/src/middleware/rateLimiter.ts

// 1. Authentication (5 req/15min)
authLimiter - Protège contre les attaques par force brute

// 2. Write Operations (30 req/10min)
writeOperationsLimiter - Limite les créations/modifications

// 3. File Upload (20 req/1h)
uploadLimiter - Contrôle l'upload de fichiers

// 4. Search (50 req/5min)
searchLimiter - Prévient l'abus des recherches

// 5. Messaging (40 req/10min)
messagingLimiter - Limite l'envoi de messages

// 6. Admin Operations (200 req/15min)
adminLimiter - Limite élevée pour les admins

// 7. Delete Operations (10 req/1h)
deleteLimiter - Stricte pour les suppressions

// 8. Analytics (60 req/10min)
analyticsLimiter - Contrôle les requêtes de stats
```

#### Configuration Avancée

- **Key Generation**: Par userId pour utilisateurs authentifiés, par IP sinon
- **Standard Headers**: Retourne X-RateLimit-* headers
- **Skip Conditions**: Bypass pour super admins sur certains limiters

### 2. Validation Renforcée avec Zod

#### Schémas de Validation Stricts

```typescript
// backend/src/middleware/validation.schemas.ts

// Validation de mot de passe fort
passwordSchema
  .min(8)
  .regex(/[A-Z]/) // Majuscule
  .regex(/[a-z]/) // Minuscule
  .regex(/[0-9]/) // Chiffre
  .regex(/[@$!%*?&#]/) // Caractère spécial

// Validation âge (3-12 ans)
dateOfBirthSchema.refine((date) => {
  const age = calculateAge(date);
  return age >= 3 && age <= 12;
});

// Validation UUID stricte
uuidSchema = z.string().uuid('ID invalide');
```

#### 15+ Schémas Disponibles

- **Auth**: registerSchema, loginSchema, changePasswordSchema
- **Profiles**: createProfileSchema, updateProfileSchema, updatePreferencesSchema
- **Activities**: activityFiltersSchema, startSessionSchema, completeSessionSchema
- **Progress**: updateProgressSchema, unlockRewardSchema
- **Resources**: resourceFiltersSchema, searchResourcesSchema, createResourceSchema
- **Messages**: sendMessageSchema, messageFiltersSchema

#### Middleware de Validation

```typescript
// Utilisation dans les routes
router.post('/register', validate(registerSchema), authController.register);

// Validation multi-sources
router.post(
  '/activity/:id',
  validateAll({
    params: idParamSchema,
    body: startSessionSchema,
    query: paginationSchema,
  }),
  activityController.start
);
```

#### Sanitization Automatique

- Échappement des caractères HTML/JS dangereux
- Protection contre XSS
- Nettoyage récursif des objets imbriqués

### 3. Audit Logging des Actions Sensibles

#### AuditService Complet

```typescript
// backend/src/services/audit.service.ts

enum AuditAction {
  // 25+ types d'actions trackées
  USER_LOGIN,
  USER_LOGOUT,
  PASSWORD_CHANGE,
  PROFILE_CREATE,
  PROFILE_UPDATE,
  PROFILE_DELETE,
  ACTIVITY_START,
  REWARD_UNLOCK,
  MESSAGE_SEND,
  UNAUTHORIZED_ACCESS,
  SUSPICIOUS_ACTIVITY,
  RATE_LIMIT_EXCEEDED,
  // ...
}

enum AuditSeverity {
  INFO,
  WARNING,
  ERROR,
  CRITICAL
}
```

#### Fonctionnalités d'Audit

**Enregistrement Automatique**
```typescript
auditService.log({
  action: AuditAction.USER_LOGIN,
  userId: 'user_123',
  severity: AuditSeverity.INFO,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
  metadata: { loginMethod: 'email' }
});
```

**Méthodes Spécialisées**
- `logSuccessfulLogin()` - Connexions réussies
- `logFailedLogin()` - Tentatives échouées
- `logPasswordChange()` - Changements de mot de passe
- `logUnauthorizedAccess()` - Accès refusés
- `logAdminAction()` - Actions administratives
- `logSuspiciousActivity()` - Activités anormales
- `logRateLimitExceeded()` - Dépassements de limites

**Historique et Compliance**
- Logs stockés dans Winston (fichiers)
- Option de stockage DB (AuditLog table)
- Nettoyage automatique après 90 jours (GDPR)
- Récupération des logs par utilisateur
- Détection d'activités suspectes

### 4. RBAC (Role-Based Access Control)

#### Hiérarchie des Rôles

```typescript
enum UserRole {
  CHILD       // Accès limité aux activités
  PARENT      // Gestion profils enfants
  EDUCATOR    // Création activités + profils
  THERAPIST   // Similaire à EDUCATOR
  ADMIN       // Toutes permissions
}
```

#### Matrice de Permissions (25+ permissions)

```typescript
enum Permission {
  // Profils
  CREATE_PROFILE,
  READ_PROFILE,
  UPDATE_PROFILE,
  DELETE_PROFILE,
  READ_ALL_PROFILES,

  // Activités
  START_ACTIVITY,
  COMPLETE_ACTIVITY,
  CREATE_ACTIVITY,
  UPDATE_ACTIVITY,
  DELETE_ACTIVITY,

  // Progrès
  READ_PROGRESS,
  UPDATE_PROGRESS,
  UNLOCK_REWARD,

  // Messages
  SEND_MESSAGE,
  READ_MESSAGE,
  DELETE_MESSAGE,

  // Ressources
  READ_RESOURCE,
  CREATE_RESOURCE,
  UPDATE_RESOURCE,
  DELETE_RESOURCE,
  DOWNLOAD_RESOURCE,

  // Admin
  ACCESS_ADMIN_PANEL,
  VIEW_AUDIT_LOGS,
  MANAGE_PERMISSIONS,
  // ...
}
```

#### Middlewares RBAC

**Vérification de Permission**
```typescript
// Requiert une permission spécifique
router.delete(
  '/profile/:id',
  requirePermission(Permission.DELETE_PROFILE),
  profileController.delete
);

// Requiert plusieurs permissions (OU logique)
router.post(
  '/activity',
  requirePermission([Permission.CREATE_ACTIVITY, Permission.UPDATE_ACTIVITY]),
  activityController.create
);

// Requiert toutes les permissions (ET logique)
router.post(
  '/admin/action',
  requirePermission([Permission.ACCESS_ADMIN_PANEL, Permission.MANAGE_PERMISSIONS], true),
  adminController.action
);
```

**Vérification de Rôle**
```typescript
// Autorise certains rôles uniquement
router.get(
  '/analytics',
  requireRole([UserRole.PARENT, UserRole.EDUCATOR, UserRole.ADMIN]),
  analyticsController.get
);
```

**Vérification de Propriété**
```typescript
// Vérifie que l'utilisateur est propriétaire
router.put(
  '/profile/:id',
  requireOwnership('id', 'userId'),
  profileController.update
);
```

**Accès Contrôlé aux Profils Enfants**
```typescript
// Parents/Éducateurs/Thérapeutes autorisés
router.get(
  '/child/:childId/progress',
  requireChildAccess,
  progressController.getByChild
);
```

### 5. Headers de Sécurité HTTP Avancés

#### Configuration Helmet Complète

```typescript
// backend/src/config/security.ts

helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", frontendUrl],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },

  // HSTS - Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  },

  // Anti-Clickjacking
  frameguard: { action: 'deny' },

  // XSS Protection
  xssFilter: true,
  noSniff: true,

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
```

#### Headers Personnalisés Additionnels

```typescript
// Permissions Policy
'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'

// Cross-Origin Policies
'Cross-Origin-Embedder-Policy': 'require-corp'
'Cross-Origin-Opener-Policy': 'same-origin'
'Cross-Origin-Resource-Policy': 'same-origin'

// Cache Control pour endpoints sensibles
'Cache-Control': 'no-store, no-cache, must-revalidate'
```

#### Protection Contre les Injections

**SQL Injection Protection**
```typescript
// Détection de patterns SQL malveillants
sqlInjectionPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP)\b)/i
];
// Rejet automatique des requêtes suspectes
```

**NoSQL Injection Protection**
```typescript
// Blocage des opérateurs MongoDB
if (key.startsWith('$')) {
  throw new Error('Invalid query');
}
```

**XSS Protection**
```typescript
// Nettoyage des scripts malveillants
xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi  // onclick=, onerror=, etc.
];
```

### 6. CORS Sécurisé

#### Whitelist d'Origines

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24h
};
```

### Résumé de la Sécurité

| Couche | Protection | Statut |
|--------|------------|--------|
| Réseau | Rate Limiting (8 types) | ✅ |
| Entrées | Validation Zod (15+ schémas) | ✅ |
| Entrées | Sanitization XSS/SQL/NoSQL | ✅ |
| Autorisation | RBAC (5 rôles, 25+ permissions) | ✅ |
| Audit | Logging (25+ actions) | ✅ |
| Transport | Headers HTTP sécurisés | ✅ |
| Transport | CORS whitelist | ✅ |
| Transport | HSTS + CSP | ✅ |

**Niveau de Sécurité**: Production-Ready avec conformité RGPD/COPPA

## Performance et Optimisation (Phase 3.8)

### Vue d'ensemble

SuperKids Learning implémente un système complet d'optimisation des performances pour garantir une expérience utilisateur fluide et réactive, même avec un volume élevé de données et d'utilisateurs concurrents.

### 0. Optimisations Frontend (bundles + CDN)

- **Code splitting**: pages React chargées en `React.lazy` + `Suspense` pour créer des chunks dédiés aux vues lourdes (dashboard, analytics, activités...).
- **CDN-ready build**: Vite expose `VITE_CDN_URL` pour générer des URLs absolues vers CloudFront/Azure CDN, avec manifest `dist/manifest.json` pour le reverse-proxy.
- **Cache longue durée**: assets versionnés (`assets/[name].[hash].js|css`) servis via CDN, tandis que `index.html` reste livré par le conteneur pour router correctement.

### 1. Cache Redis

#### CacheService Complet

Le système de cache Redis permet de réduire considérablement les temps de réponse pour les données fréquemment accédées.

```typescript
// backend/src/services/cache.service.ts

class CacheService {
  // Initialisation avec reconnexion automatique
  private async initialize(): Promise<void>

  // Opérations de base
  async get<T>(key: string): Promise<T | null>
  async set(key: string, value: any, ttl?: number): Promise<boolean>
  async delete(key: string): Promise<boolean>

  // Pattern cache-aside
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T>

  // Invalidation par pattern
  async deletePattern(pattern: string): Promise<number>
  async invalidateUser(userId: string): Promise<number>
  async invalidateChildProfile(childId: string): Promise<number>
}
```

#### Clés de Cache Prédéfinies

```typescript
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
};
```

#### TTL Recommandés

```typescript
export const CacheTTL = {
  SHORT: 300,       // 5 minutes - Données changeant fréquemment
  MEDIUM: 1800,     // 30 minutes - Données semi-statiques
  LONG: 3600,       // 1 heure - Données relativement stables
  VERY_LONG: 86400, // 24 heures - Données statiques
};
```

#### Stratégies de Cache

**Cache-Aside Pattern**
```typescript
// Récupère du cache ou calcule si absent
const activities = await cacheService.getOrSet(
  CacheKeys.activities('all'),
  async () => await prisma.activity.findMany(),
  CacheTTL.MEDIUM
);
```

**Invalidation Intelligente**
```typescript
// Après modification de profil
await cacheService.invalidateChildProfile(childId);

// Après création d'activité
await cacheService.invalidateActivities();
```

#### Reconnexion Automatique

```typescript
reconnectStrategy: (retries) => {
  if (retries > 10) return new Error('Too many retries');
  return Math.min(retries * 100, 3000); // Backoff exponentiel
}
```

### 2. Compression GZIP

#### Middleware de Compression

```typescript
// backend/src/middleware/performance.ts

export const compressionMiddleware = compression({
  threshold: 1024,      // Compresser si > 1KB
  level: 6,             // Niveau de compression (0-9)
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
});
```

#### Bénéfices

- **Réduction de bande passante**: 60-80% pour JSON
- **Temps de chargement**: -40% en moyenne
- **Coût réseau**: Réduction significative

#### Configuration Intelligente

- Compression uniquement pour réponses > 1KB
- Respect du header `x-no-compression`
- Filtrage automatique par type MIME

### 3. Pagination Complète

#### Système de Pagination Dual

**Offset-Based Pagination** (pages numérotées)
```typescript
interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const result = await paginateWithPrisma<Activity>(
  prisma.activity,
  { page: 1, limit: 20 },
  { category: 'SOCIAL_SKILLS' },
  { sessions: true },
  { createdAt: 'desc' }
);

// Retourne: { data: Activity[], pagination: PaginationMetadata }
```

**Cursor-Based Pagination** (grandes données)
```typescript
interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

const result = await paginateWithCursor<Activity>(
  prisma.activity,
  { cursor: 'last_id', limit: 50 },
  { category: 'ACADEMIC' }
);
```

#### Headers de Pagination

```typescript
X-Total-Count: 150
X-Total-Pages: 8
X-Current-Page: 3
X-Per-Page: 20
X-Has-Next: true
X-Has-Prev: true
```

#### Liens HATEOAS

```typescript
{
  "data": [...],
  "links": {
    "self": "/api/activities?page=3&limit=20",
    "first": "/api/activities?page=1&limit=20",
    "last": "/api/activities?page=8&limit=20",
    "next": "/api/activities?page=4&limit=20",
    "prev": "/api/activities?page=2&limit=20"
  }
}
```

#### Limites et Validation

- Limite par défaut: **20 items**
- Limite maximale: **100 items**
- Validation et normalisation automatiques

### 4. Optimisation Queries Prisma

#### Sélections Optimisées

```typescript
// backend/src/utils/prisma-helpers.ts

export const PrismaSelects = {
  // Minimal - Seulement les champs essentiels
  userMinimal: {
    id: true,
    email: true,
    name: true,
    role: true,
  },

  // Complete - Tous les champs sauf sensibles
  userComplete: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    // password: false (exclu)
  },

  // List - Optimisé pour listes
  activityList: {
    id: true,
    title: true,
    description: true,
    category: true,
    difficulty: true,
    estimatedDuration: true,
    thumbnailUrl: true,
    // Instructions complètes exclues pour performance
  },
};
```

#### Includes Optimisés

```typescript
export const PrismaIncludes = {
  // Child profile avec progrès minimal
  childProfileWithProgress: {
    progress: {
      select: PrismaSelects.progressMinimal,
    },
  },

  // Activité avec sessions récentes limitées
  activityWithSessions: (limit = 5) => ({
    sessions: {
      take: limit,
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        startTime: true,
        completed: true,
        successRate: true,
      },
    },
  }),
};
```

#### WhereBuilder pour Filtres Dynamiques

```typescript
const where = new WhereBuilder()
  .and({ category: 'SOCIAL_SKILLS' })
  .and({ difficulty: { in: ['BEGINNER', 'INTERMEDIATE'] } })
  .or([
    { ageRange: { contains: '5-7' } },
    { ageRange: { contains: '8-10' } },
  ])
  .build();

const activities = await prisma.activity.findMany({ where });
```

#### Recherche Textuelle Optimisée

```typescript
// Recherche insensible à la casse
const where = TextSearch.contains('title', searchTerm);

// Recherche multi-champs
const where = TextSearch.multiField(
  ['title', 'description', 'tags'],
  searchTerm
);

// Recherche par début
const where = TextSearch.startsWith('name', 'Ali');
```

#### Filtres de Date Prédéfinis

```typescript
// Aujourd'hui
{ createdAt: DateFilters.today() }

// Cette semaine
{ createdAt: DateFilters.thisWeek() }

// 30 derniers jours
{ createdAt: DateFilters.lastNDays(30) }

// Période personnalisée
{ createdAt: DateFilters.between(startDate, endDate) }
```

#### Opérations Batch

```typescript
// Update multiple
const count = await batchUpdate(
  prisma.activity,
  ['id1', 'id2', 'id3'],
  { isActive: true }
);

// Delete multiple
const count = await batchDelete(
  prisma.activity,
  ['id1', 'id2']
);
```

#### Helpers de Performance

```typescript
// Vérifier existence (sans récupérer toutes les données)
const userExists = await exists(prisma.user, { email });

// Récupérer uniquement les IDs
const activityIds = await getIdsOnly(prisma.activity, { category });

// Find or create (upsert optimisé)
const profile = await findOrCreate(
  prisma.childProfile,
  { userId },
  { userId, dateOfBirth, ... }
);
```

### 5. Middlewares de Performance

#### Mesure du Temps de Réponse

```typescript
export const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Logger requêtes lentes (> 1s)
    if (duration > 1000) {
      logger.warn('Slow request', { url: req.url, duration });
    }

    res.setHeader('X-Response-Time', `${duration}ms`);
  });

  next();
};
```

#### Cache Control HTTP

```typescript
export const cacheControlMiddleware = (req, res, next) => {
  // Par défaut: pas de cache
  res.setHeader('Cache-Control', 'no-store, no-cache');

  // Assets statiques: cache 24h
  if (req.path.match(/\.(jpg|png|svg|pdf)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  // Activities: cache 5 min
  if (req.path.startsWith('/api/activities')) {
    res.setHeader('Cache-Control', 'private, max-age=300');
  }

  next();
};
```

#### Limite de Payload

```typescript
export const payloadSizeLimit = (maxSizeInMB = 10) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSize) {
      return res.status(413).json({
        message: `Payload too large. Max: ${maxSizeInMB}MB`
      });
    }

    next();
  };
};
```

#### Monitoring Mémoire

```typescript
export const memoryMonitor = (req, res, next) => {
  const memBefore = process.memoryUsage();

  res.on('finish', () => {
    const memAfter = process.memoryUsage();
    const heapDelta = memAfter.heapUsed - memBefore.heapUsed;

    // Logger si augmentation > 50MB
    if (heapDelta > 50 * 1024 * 1024) {
      logger.warn('Memory spike detected', { heapDelta, path: req.path });
    }
  });

  next();
};
```

#### Collecteur de Statistiques

```typescript
interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorCount: number;
}

// Collecte automatique
export const statsCollector = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    stats.totalRequests++;
    stats.averageResponseTime =
      (stats.averageResponseTime * (stats.totalRequests - 1) + duration) /
      stats.totalRequests;

    if (duration > 1000) stats.slowRequests++;
    if (res.statusCode >= 400) stats.errorCount++;
  });

  next();
};

// Récupération des stats
GET /api/performance/stats
{
  "totalRequests": 15420,
  "averageResponseTime": 127,
  "slowRequests": 23,
  "errorCount": 45
}
```

### Résumé des Gains de Performance

| Optimisation | Gain Estimé | Impact |
|--------------|-------------|--------|
| Cache Redis | -70% temps réponse | ⭐⭐⭐⭐⭐ |
| Compression GZIP | -60% bande passante | ⭐⭐⭐⭐ |
| Pagination | Scaling illimité | ⭐⭐⭐⭐⭐ |
| Select optimisés | -50% données transférées | ⭐⭐⭐⭐ |
| Includes optimisés | -40% queries DB | ⭐⭐⭐⭐ |
| Batch operations | -80% temps batch | ⭐⭐⭐ |

**Performance Cible**:
- Temps de réponse moyen: **< 200ms**
- Requêtes lentes (>1s): **< 1%**
- Cache hit rate: **> 70%**
- Bande passante: **-60% vs sans compression**

## Contributeurs

Ce projet a été développé selon les spécifications du document "Application_Apprentissage_Autisme_Specifications.docx" qui s'appuie sur:
- Les 28 pratiques basées sur des preuves du NCAEP
- Les recherches récentes en neurosciences et pédagogie spécialisée
- Les meilleures pratiques UI/UX pour les personnes autistes

## Licence

Propriétaire - Tous droits réservés

---

## Historique des Versions

### Version 1.0.0 (Novembre 2025)
- ✅ Phase 1: Architecture de base complète
- ✅ Phase 2: Tests, Services API, Middleware et Infrastructure

### Version 1.1.0 (En cours - Phase 3)
- ✅ **Phase 3.1**: Services backend (couche métier) - **COMPLÉTÉ**
  - 6 services complets (Auth, Profile, Activity, Progress, Resource, Message)
  - ServiceFactory pour gestion centralisée
  - Types et DTOs complets
  - 2600+ lignes de code
- ✅ **Phase 3.2**: Tests unitaires - **51 tests créés**
  - 100% des méthodes publiques des services testées
  - Mocks Prisma pour isolation
  - Success + Error paths couverts
- ✅ **Phase 3.3**: Documentation API Swagger/OpenAPI - **COMPLÉTÉ**
  - Configuration Swagger complète avec swagger-jsdoc
  - Documentation interactive accessible à /api-docs
  - 7 schémas de données documentés
  - 26 endpoints API documentés
  - Authentification JWT dans Swagger UI
  - Export JSON OpenAPI spec
- ✅ **Phase 3.4**: Socket.io temps réel - **COMPLÉTÉ**
  - SocketService backend complet avec 15+ événements
  - Authentification JWT pour WebSocket
  - Messagerie instantanée avec indicateurs de frappe
  - Présence utilisateur (online/offline/away)
  - Notifications temps réel (messages, progrès, récompenses)
  - Gestion multi-connexions par utilisateur
  - Client Socket.io frontend avec types TypeScript
  - Endpoints de santé Socket.io (/health/socket)
- ✅ **Phase 3.7**: Sécurité Renforcée - **COMPLÉTÉ** 🔒
  - **Rate Limiting Granulaire**: 8 limiters spécialisés par type d'endpoint
    - authLimiter, writeOperationsLimiter, uploadLimiter, searchLimiter
    - messagingLimiter, adminLimiter, deleteLimiter, analyticsLimiter
  - **Validation Zod**: 15+ schémas de validation avec middleware
    - Validation stricte des entrées (auth, profils, activités, etc.)
    - Sanitization automatique XSS
    - Formatage d'erreurs détaillé
  - **Audit Logging**: Traçabilité complète des actions sensibles
    - AuditService avec 25+ types d'actions
    - Logging Winston + option DB
    - Détection d'activités suspectes
    - Conformité GDPR (nettoyage auto après 90j)
  - **RBAC Complet**: Contrôle d'accès basé sur les rôles
    - 5 rôles (CHILD, PARENT, EDUCATOR, THERAPIST, ADMIN)
    - 25+ permissions granulaires
    - Middlewares requirePermission, requireRole, requireOwnership
    - Contrôle d'accès aux profils enfants
  - **Headers Sécurité HTTP**: Configuration Helmet avancée
    - CSP, HSTS, XSS Protection, Anti-Clickjacking
    - CORS sécurisé avec whitelist
    - Protection SQL/NoSQL injection
    - Cross-Origin Policies
- ✅ **Phase 3.8**: Performance et Optimisation - **COMPLÉTÉ** ⚡
  - **Cache Redis**: CacheService complet avec reconnexion automatique
    - Pattern cache-aside (getOrSet)
    - Invalidation intelligente par pattern
    - Clés prédéfinies et TTL recommandés
    - Statistiques et monitoring
  - **Compression GZIP**: Réduction 60-80% bande passante
    - Middleware compression intelligent (> 1KB)
    - Filtrage par type de contenu
  - **Pagination Complète**: Système dual offset/cursor
    - paginateWithPrisma helper
    - Headers et liens HATEOAS
    - Validation automatique (max 100)
  - **Optimisation Prisma**: Helpers et patterns
    - Sélections optimisées (minimal, complete, list)
    - WhereBuilder pour filtres dynamiques
    - Recherche textuelle et filtres de date
    - Opérations batch efficaces
  - **Middlewares Performance**: 5+ middlewares
    - Response time tracking
    - Cache control HTTP
    - Payload size limit (10MB)
    - Memory monitoring
    - Stats collector
- 🚧 **Phase 3.5**: Gestion de Fichiers - EN COURS
  - **Upload sécurisé**: Multer en mémoire, filtrage MIME/taille configurable, compression Sharp → WebP
  - **Stockage multi-cloud**: client unifié S3 / Azure Blob / local (chemins cohérents, métadonnées largeur/hauteur)
  - **API & Front**: endpoints avatar/ressource exposés, services persistants, formulaires accessibles avec validations côté client + tests UI
- ✅ **Phase 3.6**: Pipeline CI/CD & Opérations - **COMPLÉTÉ** 🚀
  - **CI GitHub Actions**: workflow `ci.yml` pour lint + tests + build backend/frontend + audit sécurité npm
  - **CD Staging**: workflow `deploy.yml` qui build/push les images Docker backend/frontend vers un registry (secrets REGISTRY_* / IMAGE_NAME)
  - **Monitoring**: middleware Prometheus `/metrics`, stack `docker-compose.monitoring.yml` (Prometheus, Grafana, Node Exporter) + scrape config `monitoring/prometheus.yml`
  - **Logging**: transport Winston HTTP optionnel vers ELK/OpenSearch (env `ELK_HTTP_ENDPOINT` / `ELASTIC_INGEST_URL` + auth basique)
  - **Backups**: script `scripts/backup-db.sh` (pg_dump compressé + upload S3 optionnel, rétention configurable)
- 🚧 **Phase 3.9**: Activités Interactives Spécifiques

**Dernière mise à jour**: 18 Novembre 2025
**Version Actuelle**: 1.1.0-dev
**Statut**: Phases 3.1-3.4, 3.6-3.8 complétées - Sécurité + Performance + CI/CD/Monitoring prêts prod !

## Scans de sécurité automatisés

- Un workflow GitHub Actions `Security - ZAP Baseline` démarre l'API locale sur le port 5000, lance le scan ZAP baseline et publie les rapports HTML/JSON comme artefacts.
- L'entrée `fail_on` (par défaut `high`) permet de contrôler le seuil d'échec, avec un résumé des alertes injecté dans les logs CI.
- Les secrets `ZAP_DATABASE_URL` et `ZAP_JWT_SECRET` peuvent être fournis pour ajuster l'environnement de démarrage pendant le scan.
