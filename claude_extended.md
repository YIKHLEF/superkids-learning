# EXTENSIONS À CLAUDE.MD - Nouvelles Fonctionnalités

## Tests Automatisés

### Tests Frontend (Jest + React Testing Library)

**Configuration**: `frontend/jest.config.js`

**Tests implémentés**:

1. **Tests Redux Slices** (`src/store/slices/__tests__/`)
   - `authSlice.test.ts`: Tests d'authentification
   - `profileSlice.test.ts`: Tests de gestion de profil
   - Couverture: Actions, reducers, états

2. **Tests de Composants** (`src/components/__tests__/`)
   - `Navigation.test.tsx`: Tests du composant de navigation
   - Vérification du rendu et des interactions utilisateur

**Exécution des tests**:
```bash
cd frontend
npm test                 # Exécuter tous les tests
npm run test:watch      # Mode watch
npm run test:coverage   # Avec couverture de code
```

**Seuils de couverture**:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Tests Backend (Jest)

**Configuration**: `backend/jest.config.js`

**Tests implémentés**:

1. **Tests Controllers** (`src/controllers/__tests__/`)
   - `auth.controller.test.ts`: Tests d'authentification (register, login)
   - Mock de bcrypt et jsonwebtoken
   - Validation des réponses API

2. **Tests Middleware** (`src/middleware/__tests__/`)
   - `errorHandler.test.ts`: Tests de gestion d'erreurs
   - Tests AppError et erreurs génériques

**Exécution des tests**:
```bash
cd backend
npm test                 # Exécuter tous les tests
npm run test:watch      # Mode watch
npm run test:coverage   # Avec couverture de code
```

## Services API Frontend

**Localisation**: `frontend/src/services/`

### Architecture des Services

Tous les services utilisent un client Axios centralisé (`api.ts`) avec:
- Intercepteurs de requête (ajout automatique du token JWT)
- Intercepteurs de réponse (gestion erreurs 401)
- Configuration de base (baseURL, headers, timeout)
- Stockage du token dans localStorage

### Services Disponibles

#### 1. `authService.ts`
```typescript
- login(credentials): Authentification
- register(data): Inscription
- logout(): Déconnexion
- getCurrentUser(): Utilisateur actuel
- isAuthenticated(): Vérification statut
```

#### 2. `profileService.ts`
```typescript
- getProfile(id): Récupérer profil
- updateProfile(id, updates): Mettre à jour profil
- updatePreferences(id, prefs): Mettre à jour préférences
- updateSensoryPreferences(id, prefs): Préférences sensorielles
- getChildProfiles(): Tous les profils enfants
```

#### 3. `activityService.ts`
```typescript
- getAllActivities(): Toutes les activités
- getActivityById(id): Activité spécifique
- getActivitiesByCategory(category): Par catégorie
- startActivity(childId, activityId): Démarrer session
- completeActivity(sessionId, data): Compléter session
- updateActivitySession(sessionId, updates): Mettre à jour session
```

#### 4. `progressService.ts`
```typescript
- getProgress(childId): Progrès de l'enfant
- updateProgress(childId, updates): Mettre à jour progrès
- getRewards(childId): Récompenses disponibles
- unlockReward(childId, rewardId): Débloquer récompense
- addTokens(childId, amount): Ajouter jetons
- incrementStreak(childId): Incrémenter série
```

#### 5. `resourceService.ts`
```typescript
- getAllResources(): Toutes les ressources
- getResourcesByType(type): Par type
- getResourceById(id): Ressource spécifique
- searchResources(query): Recherche
```

#### 6. `messageService.ts`
```typescript
- getMessages(userId): Messages d'un utilisateur
- sendMessage(data): Envoyer message
- markAsRead(messageId): Marquer comme lu
- deleteMessage(messageId): Supprimer message
```

### Utilisation dans les Composants

```typescript
import authService from '@/services/authService';

const handleLogin = async () => {
  try {
    const response = await authService.login({ email, password });
    // Token automatiquement stocké
    dispatch(loginSuccess(response.data));
  } catch (error) {
    // Gestion d'erreur
  }
};
```

## Middleware Backend

**Localisation**: `backend/src/middleware/`

### 1. Authentification JWT (`auth.ts`)

**Middleware `authenticateToken`**:
- Vérifie la présence du token dans les headers
- Valide le token JWT
- Ajoute `req.user` avec userId et role
- Retourne 401 si token manquant, 403 si invalide

**Middleware `authorizeRoles(...roles)`**:
- Vérifie que l'utilisateur a le rôle requis
- Utilise après `authenticateToken`
- Retourne 403 si rôle non autorisé

**Utilisation**:
```typescript
import { authenticateToken, authorizeRoles } from './middleware/auth';

router.get('/admin',
  authenticateToken,
  authorizeRoles('ADMIN', 'EDUCATOR'),
  adminController
);
```

### 2. Validation (`validation.ts`)

**Middleware `validate(validations)`**:
- Exécute validations express-validator
- Collecte les erreurs
- Formate les erreurs de validation
- Retourne 400 avec détails des erreurs

**Utilisation**:
```typescript
import { body } from 'express-validator';
import { validate } from './middleware/validation';

router.post('/register',
  validate([
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty(),
  ]),
  registerController
);
```

### 3. Upload de Fichiers (`upload.ts`)

**Configuration**:
- Stockage: Disque local (`uploads/`)
- Taille max: 10MB
- Types autorisés: jpeg, jpg, png, gif, pdf, mp4, webm
- Nommage: `fieldname-timestamp-random.ext`

**Middleware disponibles**:
```typescript
- uploadSingle(fieldName): Un seul fichier
- uploadMultiple(fieldName, maxCount): Plusieurs fichiers
- uploadFields(fields): Champs multiples
```

**Utilisation**:
```typescript
import { uploadSingle } from './middleware/upload';

router.post('/upload-avatar',
  authenticateToken,
  uploadSingle('avatar'),
  uploadController
);
```

### 4. Gestion d'Erreurs (`errorHandler.ts`)

**Classe `AppError`**:
- Erreurs opérationnelles personnalisées
- Propriétés: message, statusCode, isOperational

**Middleware `errorHandler`**:
- Capture toutes les erreurs
- Log avec Winston
- Retourne JSON formaté
- Messages différents selon NODE_ENV

### 5. Rate Limiting (`rateLimiter.ts`)

**Configuration générale**:
- Fenêtre: 15 minutes
- Max requêtes: 100
- Headers standard

**Rate limiter auth**:
- Fenêtre: 15 minutes
- Max tentatives: 5
- Skip requêtes réussies

## Composants UI Additionnels

**Localisation**: `frontend/src/components/Common/`

### 1. LoadingSpinner.tsx

Affiche un indicateur de chargement avec message optionnel.

**Props**:
```typescript
{
  size?: number;           // Taille du spinner (défaut: 40)
  message?: string;        // Message à afficher
  fullScreen?: boolean;    // Plein écran (défaut: false)
}
```

**Utilisation**:
```tsx
<LoadingSpinner message="Chargement des activités..." fullScreen />
```

### 2. Notification.tsx

Affiche des notifications toast avec différents niveaux de gravité.

**Props**:
```typescript
{
  open: boolean;
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  autoHideDuration?: number;  // défaut: 6000ms
}
```

**Utilisation**:
```tsx
<Notification
  open={showNotif}
  message="Profil mis à jour avec succès!"
  severity="success"
  onClose={() => setShowNotif(false)}
/>
```

### 3. Modal.tsx

Modal réutilisable avec titre, contenu et actions.

**Props**:
```typescript
{
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}
```

**Utilisation**:
```tsx
<Modal
  open={showModal}
  onClose={() => setShowModal(false)}
  title="Confirmer l'action"
  actions={
    <>
      <Button onClick={handleCancel}>Annuler</Button>
      <Button variant="contained" onClick={handleConfirm}>
        Confirmer
      </Button>
    </>
  }
>
  <Typography>Êtes-vous sûr de vouloir continuer?</Typography>
</Modal>
```

### 4. ActivityCard.tsx

Carte d'activité réutilisable pour afficher une activité.

**Props**:
```typescript
{
  activity: Activity;
  onStart: (activityId: string) => void;
}
```

**Utilisation**:
```tsx
<ActivityCard
  activity={activity}
  onStart={(id) => handleStartActivity(id)}
/>
```

## Base de Données - Scripts de Seed

**Fichier**: `backend/prisma/seed.ts`

### Données Créées

Le script de seed crée un jeu de données complet pour le développement et les tests:

**Utilisateurs (3)**:
- Enfant: `child@example.com` / `password123`
- Parent: `parent@example.com` / `password123`
- Éducateur: `educator@example.com` / `password123`

**Profil Enfant (1)**:
- Nom: Lucas Martin
- Âge: 8 ans
- Préférences sensorielles: LOW_STIMULATION
- Objectifs IEP: 3 objectifs d'apprentissage

**Activités (5)**:
1. Reconnaissance des émotions (Social, Débutant, 10 min)
2. Apprendre les couleurs (Académique, Débutant, 15 min)
3. Se laver les mains (Autonomie, Débutant, 5 min)
4. Dire bonjour (Communication, Débutant, 10 min)
5. Calmer sa colère (Régulation émotionnelle, Intermédiaire, 15 min)

**Récompenses (3)**:
- Champion du jour (50 jetons)
- Maître des émotions (100 jetons)
- Avatar Robot (75 jetons)

**Ressources (3)**:
- Vidéo: Comment dire bonjour
- Pictogrammes: Émotions
- Histoire sociale: Aller à l'école

**Progrès**:
- 23 activités complétées
- 150 jetons gagnés
- Série de 7 jours
- Compétences à différents niveaux

**Sessions d'Activités (2)**:
- Sessions complétées avec taux de réussite et état émotionnel

### Exécution du Seed

```bash
cd backend
npm run seed          # Exécuter le seed
npm run db:reset      # Reset + seed
```

## Conteneurisation avec Docker

### Architecture Docker

L'application utilise Docker Compose avec 4 services:

1. **postgres**: Base de données PostgreSQL 15
2. **redis**: Cache et sessions
3. **backend**: API Node.js
4. **frontend**: Application React (nginx)

### Fichiers Docker

**Frontend** (`frontend/Dockerfile`):
- Build multi-stage
- Stage 1: Build avec Node 20
- Stage 2: Nginx alpine pour servir les fichiers statiques
- Configuration nginx avec support React Router

**Backend** (`backend/Dockerfile`):
- Build multi-stage
- Stage 1: Build TypeScript et génération Prisma
- Stage 2: Production avec dépendances minimales
- Health check sur `/health`
- Création des dossiers `uploads/` et `logs/`

**Docker Compose** (`docker-compose.yml`):
- Réseau: `superkids-network`
- Volumes persistants: `postgres_data`, `redis_data`
- Health checks pour tous les services
- Dépendances entre services
- Variables d'environnement configurables

### Démarrage avec Docker

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables si nécessaire
nano .env

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Accès aux Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Variables d'Environnement Docker

Voir `.env.example` à la racine du projet:
```env
NODE_ENV=production
POSTGRES_USER=superkids
POSTGRES_PASSWORD=superkids123
POSTGRES_DB=superkids_learning
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api
```

## Scripts NPM Mis à Jour

### Backend

```json
{
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint . --ext .ts",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "migrate": "prisma migrate dev",
  "migrate:deploy": "prisma migrate deploy",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio",
  "seed": "ts-node prisma/seed.ts",
  "db:reset": "prisma migrate reset && npm run seed"
}
```

### Frontend

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

## Guides de Développement

### Démarrage Rapide

**Sans Docker**:
```bash
# 1. Démarrer PostgreSQL localement

# 2. Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec DATABASE_URL
npm run prisma:generate
npm run migrate
npm run seed
npm run dev

# 3. Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

**Avec Docker**:
```bash
cp .env.example .env
docker-compose up -d
```

### Workflow de Développement

1. **Créer une nouvelle fonctionnalité**:
   - Créer une branche: `git checkout -b feature/ma-fonctionnalite`
   - Développer avec tests
   - Commit régulièrement
   - Push et créer PR

2. **Ajouter une nouvelle route API**:
   - Créer le controller dans `backend/src/controllers/`
   - Créer la route dans `backend/src/routes/`
   - Ajouter la validation si nécessaire
   - Créer les tests dans `__tests__/`
   - Mettre à jour la documentation

3. **Ajouter un nouveau composant React**:
   - Créer le composant dans `frontend/src/components/`
   - Ajouter les tests dans `__tests__/`
   - Documenter les props avec TypeScript
   - Vérifier l'accessibilité (44x44px pour boutons)

4. **Modifier le schéma de base de données**:
   - Éditer `backend/prisma/schema.prisma`
   - Créer la migration: `npm run migrate`
   - Mettre à jour le seed si nécessaire
   - Régénérer le client: `npm run prisma:generate`

### Tests et Qualité

**Avant de committer**:
```bash
# Backend
cd backend
npm run lint
npm run test
npm run build

# Frontend
cd frontend
npm run lint
npm run test
npm run build
```

**Couverture de code**:
```bash
npm run test:coverage
```

Objectif: Minimum 70% de couverture sur toutes les métriques.

### Debugging

**Backend**:
- Logs dans `backend/logs/`
- Log level configuré via `LOG_LEVEL` env var
- Utiliser `logger.info()`, `logger.error()`, etc.

**Frontend**:
- Redux DevTools dans le navigateur
- Console browser pour les erreurs
- React DevTools pour inspecter les composants

---

**Dernière mise à jour**: Novembre 2025
**Version**: 2.0.0
