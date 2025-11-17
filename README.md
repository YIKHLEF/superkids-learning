# 🌟 SuperKids Learning

> Application web d'apprentissage innovante pour enfants autistes, basée sur les pratiques pédagogiques basées sur des preuves scientifiques.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![Node](https://img.shields.io/badge/Node-20+-339933.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Contribuer](#-contribuer)

## 🎯 À Propos

**SuperKids Learning** est une solution d'apprentissage complète et innovante spécifiquement conçue pour les enfants autistes âgés de 3 à 12 ans. Fondée sur les dernières recherches en neurosciences, pédagogie spécialisée et technologies d'assistance, l'application intègre les **28 pratiques basées sur des preuves (EBPs)** identifiées par le National Clearinghouse on Autism Evidence and Practice (NCAEP).

### 💡 Valeur Ajoutée Unique

- **🧠 Personnalisation Adaptive**: IA qui adapte le contenu en temps réel selon le profil de chaque enfant
- **🎨 Design Neuro-Inclusif**: Interface conçue pour minimiser la surcharge sensorielle
- **🎥 Approche Multimodale**: Vidéo-modélisation, supports visuels et activités interactives
- **👨‍👩‍👧 Collaboration**: Plateforme intégrée pour parents, éducateurs et thérapeutes
- **📊 Suivi Basé sur les Données**: Analytiques détaillées pour mesurer l'acquisition des compétences

## ✨ Fonctionnalités

### 🎯 Modules Principaux

#### 1. Gestion des Profils
- Profils personnalisés pour chaque enfant
- Configuration des préférences sensorielles
- Définition d'objectifs d'apprentissage (IEP)
- Gestion multi-utilisateurs (enfant, parents, éducateurs, thérapeutes)

#### 2. Activités d'Apprentissage
Activités organisées en 5 catégories:
- **👥 Compétences Sociales**: Reconnaissance des émotions, interactions
- **💬 Communication**: Expression, vocabulaire, CAA
- **📚 Académique**: Mathématiques, lecture, sciences
- **🧼 Autonomie**: Hygiène, habillage, sécurité
- **❤️ Régulation Émotionnelle**: Gestion des émotions, stratégies d'autorégulation

#### 3. Système de Récompenses
- Jetons virtuels personnalisables
- Badges et réalisations à débloquer
- Graphiques de progrès visuels
- Animations de célébration

#### 4. Suivi et Analytiques
- Tableaux de bord détaillés
- Rapports de progrès téléchargeables
- Visualisations interactives (graphiques, radar charts)
- Alertes sur difficultés ou régressions

#### 5. Bibliothèque de Ressources
- Vidéothèque de modélisation
- Bibliothèque de pictogrammes PECS
- Histoires sociales personnalisables
- Guides pour parents et éducateurs

#### 6. Communication
- Messagerie sécurisée entre utilisateurs
- Partage de notes et observations
- Notifications en temps réel
- Calendrier partagé

### ♿ Accessibilité

L'application offre plusieurs modes d'accessibilité:

- **Mode Haute Contraste**: Pour déficiences visuelles
- **Mode Dyslexie**: Police OpenDyslexic et espacement accru
- **Mode Hypersensibilité**: Réduction maximale des stimuli
- **Mouvement Réduit**: Respect des préférences de mouvement réduit
- **Lecture Automatique**: Synthèse vocale pour le texte
- **Palettes neuro-inclusives**: Sélection calme/vibrante/monochrome avec intensité de contraste ajustable
- **Préférences sensorielles globales**: Volume unique, indices audio discrets, animations adaptables, prévisualisation en direct

## 🛠 Technologies

### Frontend
- **React 18+** avec TypeScript
- **Redux Toolkit** pour la gestion d'état
- **Material-UI v5** avec thème personnalisé neuro-inclusif
- **Vite** comme build tool
- **Recharts** pour les visualisations de données
- **Framer Motion** pour les animations

### Backend
- **Node.js 20+** avec Express.js
- **PostgreSQL 15+** pour la base de données
- **Prisma ORM** pour l'accès aux données
- **Socket.io** pour la communication en temps réel
- **Winston** pour le logging
- **JWT** pour l'authentification

### Outils et Infrastructure
- **TypeScript** pour la sûreté du typage
- **ESLint** et **Prettier** pour la qualité du code
- **Jest** pour les tests
- **Docker** pour la conteneurisation
- **GitHub Actions** pour CI/CD

## 📦 Installation

### Prérequis

- Node.js >= 20.0.0
- PostgreSQL >= 15.0
- npm ou yarn

### Installation du Frontend

```bash
# Naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### Installation du Backend

```bash
# Naviguer vers le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos configurations
# Notamment DATABASE_URL, JWT_SECRET, etc.

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations de base de données
npm run migrate

# Démarrer le serveur
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

### Configuration du stockage et de l'upload

Ajoutez les variables suivantes dans `backend/.env` pour activer l'upload sécurisé vers S3 ou Azure (mode `local` par défaut) :

```
STORAGE_PROVIDER=local # ou s3 / azure
STORAGE_BUCKET=superkids-uploads
STORAGE_REGION=eu-west-1
STORAGE_ACCESS_KEY_ID=xxx
STORAGE_SECRET_ACCESS_KEY=xxx
AZURE_STORAGE_CONNECTION_STRING=xxx
MAX_UPLOAD_SIZE=5242880
ALLOWED_UPLOAD_MIME_TYPES=image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm
```

Les images sont compressées avec Sharp avant l'envoi pour réduire la bande passante.

## 🚀 Utilisation

### Démarrage Rapide

1. **Créer un compte**: Inscription avec email et mot de passe
2. **Configurer le profil**: Définir les préférences sensorielles et objectifs
3. **Explorer les activités**: Choisir parmi 5 catégories d'apprentissage
4. **Suivre les progrès**: Consulter les statistiques et graphiques
5. **Accéder aux ressources**: Vidéos, pictogrammes, histoires sociales

### Configuration des Préférences

Dans la page **Mon Profil**, vous pouvez personnaliser:
- Sons activés/désactivés
- Animations activées/désactivées
- Mode dyslexie
- Mode haute contraste
- Taille du texte
- Lecture automatique

## 📚 Documentation

Pour une documentation technique complète, consultez:

- **[claude.md](./claude.md)**: Documentation technique détaillée
- **[Application_Apprentissage_Autisme_Specifications.docx](./Application_Apprentissage_Autisme_Specifications.docx)**: Spécifications fonctionnelles complètes

### Structure de Documentation

```
docs/
├── API.md                 # Documentation de l'API
├── COMPONENTS.md          # Guide des composants
├── DEPLOYMENT.md          # Guide de déploiement
└── CONTRIBUTING.md        # Guide de contribution
```

## 🏗 Architecture

### Architecture Générale

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│   Backend       │
│   (Node.js)     │
└────────┬────────┘
         │
         │ Prisma ORM
         │
┌────────▼────────┐
│  PostgreSQL     │
│  Database       │
└─────────────────┘
```

### Modules Backend

```
backend/
├── Authentication       → JWT, bcrypt
├── Profile Management   → CRUD profils
├── Activity Engine      → Gestion activités
├── Progress Tracking    → Suivi analytiques
├── Resource Library     → Gestion ressources
└── Messaging           → WebSocket, messages
```

### Redux Store (Frontend)

```
store/
├── auth          → État d'authentification
├── profile       → Profil utilisateur
├── activity      → Activités et sessions
├── progress      → Progrès et récompenses
└── settings      → Paramètres d'accessibilité
```

## 🎨 Design Neuro-Inclusif

### Palette de Couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Bleu pâle | `#F0F4F8` | Fond principal |
| Bleu ciel doux | `#A8D5E2` | Primaire |
| Vert menthe | `#B8E6D5` | Secondaire |
| Gris anthracite | `#3A3A3A` | Texte |
| Vert pastel | `#C1E8C1` | Succès |
| Jaune doux | `#FFF4B8` | Attention |

### Principes de Design

1. **Simplicité**: Un objectif par écran
2. **Espacement**: Minimum 8px entre éléments
3. **Contraste**: Suffisant mais non agressif
4. **Taille**: Boutons minimum 44x44px
5. **Police**: 16px minimum, interligne 1.8

## 🤝 Contribuer

Nous accueillons les contributions! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code

- Utiliser TypeScript strict mode
- Suivre les conventions ESLint
- Ajouter des tests pour nouvelles fonctionnalités
- Documenter les fonctions publiques
- Commits en français, clairs et descriptifs

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

## 👥 Équipe

Développé selon les spécifications basées sur:
- Les 28 pratiques basées sur des preuves du NCAEP
- Les recherches en neurosciences et pédagogie spécialisée
- Les meilleures pratiques UI/UX pour personnes autistes

## 📞 Contact

Pour toute question ou suggestion:
- Email: support@superkids-learning.com
- Documentation: Voir [claude.md](./claude.md)

## 🙏 Remerciements

- National Clearinghouse on Autism Evidence and Practice (NCAEP)
- Communauté des chercheurs en autisme et technologies assistives
- Familles et éducateurs qui ont contribué aux retours d'expérience

---

**Fait avec ❤️ pour tous les enfants qui apprennent différemment**

*Version 1.0.0 - Novembre 2025*
