# Guide de Tests - SuperKids Learning

## Vue d'ensemble

Ce document décrit la stratégie de tests, les outils utilisés et comment exécuter les tests pour le projet SuperKids Learning.

## Stack de Tests

### Frontend
- **Jest**: Framework de tests
- **React Testing Library**: Tests de composants React
- **@testing-library/jest-dom**: Matchers personnalisés
- **ts-jest**: Support TypeScript

### Backend
- **Jest**: Framework de tests
- **Supertest**: Tests d'intégration API (à ajouter)
- **ts-jest**: Support TypeScript

## Structure des Tests

### Frontend

```
frontend/src/
├── components/
│   └── __tests__/
│       └── Navigation.test.tsx
├── store/
│   └── slices/
│       └── __tests__/
│           ├── authSlice.test.ts
│           └── profileSlice.test.ts
├── setupTests.ts
└── jest.config.js
```

### Backend

```
backend/src/
├── controllers/
│   └── __tests__/
│       └── auth.controller.test.ts
├── middleware/
│   └── __tests__/
│       └── errorHandler.test.ts
├── setupTests.ts
└── jest.config.js
```

## Exécution des Tests

### Frontend

```bash
cd frontend

# Exécuter tous les tests
npm test

# Mode watch (re-exécute les tests modifiés)
npm run test:watch

# Avec couverture de code
npm run test:coverage

# Exécuter un fichier spécifique
npm test -- Navigation.test.tsx

# Tests en mode verbose
npm test -- --verbose
```

### Backend

```bash
cd backend

# Exécuter tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture de code
npm run test:coverage

# Exécuter un fichier spécifique
npm test -- auth.controller.test.ts
```

## Seuils de Couverture

Les deux projets (frontend et backend) ont les mêmes seuils de couverture minimale:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

La build CI échouera si ces seuils ne sont pas atteints.

## Types de Tests

### 1. Tests Unitaires

Tests des fonctions, méthodes et composants isolés.

**Exemple - Redux Slice**:
```typescript
describe('authSlice', () => {
  it('should handle loginSuccess', () => {
    const payload = {
      userId: 'test-id',
      role: UserRole.CHILD,
      token: 'test-token',
    };

    store.dispatch(loginSuccess(payload));
    const state = store.getState().auth;

    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(payload.token);
  });
});
```

**Exemple - Controller**:
```typescript
describe('Auth Controller', () => {
  it('should register a new user successfully', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'CHILD',
    };

    await register(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });
});
```

### 2. Tests de Composants

Tests du rendu et des interactions des composants React.

**Exemple**:
```typescript
describe('Navigation Component', () => {
  it('should render navigation items', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Activités')).toBeInTheDocument();
  });
});
```

### 3. Tests d'Intégration

Tests de l'interaction entre plusieurs modules (à implémenter).

**Exemple futur**:
```typescript
describe('Activity Flow', () => {
  it('should create activity session when starting activity', async () => {
    const activity = await createActivity();
    const session = await startActivity(childId, activity.id);

    expect(session.activityId).toBe(activity.id);
    expect(session.completed).toBe(false);
  });
});
```

### 4. Tests End-to-End (E2E)

Tests du parcours utilisateur complet (à implémenter avec Cypress).

## Bonnes Pratiques

### 1. Naming Convention

```typescript
// Describe blocks
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Test
    });
  });
});

// Arrange-Act-Assert pattern
it('should update user profile', () => {
  // Arrange
  const user = createMockUser();

  // Act
  const updated = updateProfile(user, { name: 'New Name' });

  // Assert
  expect(updated.name).toBe('New Name');
});
```

### 2. Mocking

**Mock des modules externes**:
```typescript
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Dans le test
(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
```

**Mock des services**:
```typescript
jest.mock('../services/authService');

const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;
mockLogin.mockResolvedValue({ token: 'test-token' });
```

### 3. Setup et Teardown

```typescript
describe('Database Tests', () => {
  beforeEach(async () => {
    // Setup avant chaque test
    await setupTestDatabase();
  });

  afterEach(async () => {
    // Nettoyage après chaque test
    await cleanupTestDatabase();
  });

  it('should save user', async () => {
    // Test
  });
});
```

### 4. Tests Asynchrones

```typescript
it('should fetch user data', async () => {
  const data = await fetchUserData('user-id');
  expect(data).toBeDefined();
});

// Ou avec done callback
it('should call callback', (done) => {
  someAsyncFunction((result) => {
    expect(result).toBe('success');
    done();
  });
});
```

## Debugging des Tests

### Mode Debug

```bash
# Node debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Avec VS Code
# Ajouter breakpoint et utiliser "Jest: Debug"
```

### Console Logs

```typescript
it('should work', () => {
  console.log('Debug info:', someValue);
  expect(someValue).toBe(expected);
});
```

### Tests Isolés

```typescript
// Exécuter seulement ce test
it.only('should test this one', () => {
  // Test
});

// Skip ce test
it.skip('should skip this', () => {
  // Test
});
```

## Commandes Utiles

```bash
# Mettre à jour les snapshots
npm test -- -u

# Exécuter les tests modifiés depuis le dernier commit
npm test -- --onlyChanged

# Lister tous les tests sans les exécuter
npm test -- --listTests

# Exécuter avec un pattern
npm test -- --testNamePattern="login"

# Tests en parallèle (défaut)
npm test

# Tests séquentiels
npm test -- --runInBand
```

## Intégration Continue (CI)

Les tests sont exécutés automatiquement sur chaque push et PR via GitHub Actions (à configurer).

**Pipeline CI**:
1. Linting (ESLint)
2. Type checking (TypeScript)
3. Tests unitaires
4. Tests d'intégration
5. Vérification de la couverture
6. Build

## Scans automatisés

Un scan ZAP baseline est automatisé pour détecter rapidement les vulnérabilités les plus critiques de l'API.

- **Workflow** : `Security - ZAP Baseline` (GitHub Actions) déclenché manuellement (`workflow_dispatch`) ou chaque lundi à 03:00 UTC.
- **Port cible** : l'API est construite puis démarrée localement sur `http://localhost:5000` avant le scan.
- **Rapports** : un rapport HTML et un JSON sont publiés comme artefacts `zap-baseline-report`.
- **Seuil d'échec** : l'entrée `fail_on` (par défaut `high`) permet de faire échouer la CI quand une alerte de sévérité égale ou supérieure est trouvée (High/Critical). Le résumé des alertes est écrit dans les logs.
- **Secrets optionnels** : `ZAP_DATABASE_URL` et `ZAP_JWT_SECRET` peuvent être fournis pour ajuster la configuration de démarrage de l'API.

Pour lancer manuellement :
1. Aller dans **Actions** → **Security - ZAP Baseline** → **Run workflow**.
2. Renseigner si besoin `fail_on` (`info`, `low`, `medium`, `high`, `critical`).
3. Télécharger l'artefact `zap-baseline-report` pour analyser les détails.


## Prochaines Étapes

### À Implémenter

- [ ] Tests d'intégration API (Supertest)
- [ ] Tests E2E (Cypress)
- [ ] Tests de performance (Lighthouse CI)
- [ ] Tests d'accessibilité (jest-axe)
- [ ] Visual regression testing (Percy ou Chromatic)
- [ ] Tests de charge (k6)

### Scripts à Ajouter

```json
{
  "test:integration": "jest --testMatch='**/*.integration.test.ts'",
  "test:e2e": "cypress run",
  "test:a11y": "jest --testMatch='**/*.a11y.test.tsx'",
  "test:all": "npm run test && npm run test:integration && npm run test:e2e"
}
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Note**: Ce document sera mis à jour au fur et à mesure de l'ajout de nouvelles stratégies et outils de tests.
