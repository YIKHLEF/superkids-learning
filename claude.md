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

### Backend
- **Runtime**: Node.js 20+ avec Express.js
- **API**: RESTful API
- **Base de données**: PostgreSQL 15+ avec Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io pour la messagerie en temps réel
- **Logging**: Winston

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
- Gestion des préférences d'interface (sons, animations, police dyslexie)
- Gestion multi-utilisateurs (parents, éducateurs, thérapeutes)

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

### Phase 2 (À venir)
- [ ] Intégration complète Prisma avec base de données
- [ ] Tests unitaires et d'intégration
- [ ] Authentification complète avec JWT
- [ ] Upload et gestion de fichiers (S3)

### Phase 3 (Futur)
- [ ] Module IA de personnalisation
- [ ] Analyse vidéo pour suivi comportemental
- [ ] Application mobile (React Native)
- [ ] Intégration de l'analyse vocale

### Phase 4 (Long terme)
- [ ] Marketplace de contenu éducatif
- [ ] Intégration avec systèmes scolaires
- [ ] Recherche et collecte de données anonymisées
- [ ] Multilingue (anglais, espagnol, etc.)

## Contributeurs

Ce projet a été développé selon les spécifications du document "Application_Apprentissage_Autisme_Specifications.docx" qui s'appuie sur:
- Les 28 pratiques basées sur des preuves du NCAEP
- Les recherches récentes en neurosciences et pédagogie spécialisée
- Les meilleures pratiques UI/UX pour les personnes autistes

## Licence

Propriétaire - Tous droits réservés

---

**Dernière mise à jour**: Novembre 2025
**Version**: 1.0.0
