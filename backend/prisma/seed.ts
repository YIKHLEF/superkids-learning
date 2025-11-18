import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Nettoyer la base de données
  await prisma.message.deleteMany();
  await prisma.activitySession.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.childProfile.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // Créer des utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10);

  const child = await prisma.user.create({
    data: {
      email: 'child@example.com',
      password: hashedPassword,
      name: 'Lucas Martin',
      role: 'CHILD',
    },
  });

  const parent = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      password: hashedPassword,
      name: 'Marie Martin',
      role: 'PARENT',
    },
  });

  const educator = await prisma.user.create({
    data: {
      email: 'educator@example.com',
      password: hashedPassword,
      name: 'Sophie Dupont',
      role: 'EDUCATOR',
    },
  });

  console.log('✅ Utilisateurs créés');

  // Créer un profil enfant
  const childProfile = await prisma.childProfile.create({
    data: {
      userId: child.id,
      dateOfBirth: new Date('2015-06-15'),
      age: 8,
      sensoryPreferences: ['LOW_STIMULATION'],
      developmentLevel: 'intermediate',
      iepGoals: [
        'Améliorer la communication verbale',
        'Développer l\'autonomie quotidienne',
        'Renforcer les compétences sociales',
      ],
      parentIds: [parent.id],
      educatorIds: [educator.id],
      soundEnabled: true,
      animationsEnabled: true,
      dyslexiaMode: false,
      highContrastMode: false,
      fontSize: 'medium',
    },
  });

  console.log('✅ Profil enfant créé');

  // Créer des activités
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: 'Reconnaissance des émotions',
        description: 'Apprends à identifier les différentes émotions sur les visages',
        category: 'SOCIAL_SKILLS',
        difficulty: 'BEGINNER',
        duration: 10,
        instructions: [
          'Regarde chaque visage attentivement',
          'Identifie l\'émotion exprimée',
          'Glisse le pictogramme correspondant',
          'Valide la réponse et passe au visage suivant',
        ],
        targetSkills: ['reconnaissance_emotions', 'empathie'],
        ebpTags: ['Modeling', 'Visual Supports', 'Naturalistic Teaching'],
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Apprendre les couleurs',
        description: 'Découvre et mémorise les couleurs avec des objets colorés',
        category: 'ACADEMIC',
        difficulty: 'BEGINNER',
        duration: 15,
        instructions: [
          'Observe chaque objet présenté',
          'Nomme sa couleur à voix haute',
          'Associe avec un autre objet de la même couleur',
          'Valide la paire et passe à la couleur suivante',
        ],
        targetSkills: ['reconnaissance_couleurs', 'vocabulaire'],
        ebpTags: ['Prompting', 'Differential Reinforcement'],
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Séquences d\'autonomie',
        description: 'Réalise une routine étape par étape avec feedback visuel',
        category: 'AUTONOMY',
        difficulty: 'BEGINNER',
        duration: 7,
        instructions: [
          'Lis la consigne de l\'étape',
          'Exécute l\'action en t\'aidant du pictogramme',
          'Coche l\'étape réalisée',
          'Passe à l\'étape suivante jusqu\'à terminer la routine',
        ],
        targetSkills: ['hygiene', 'autonomie'],
        ebpTags: ['Task Analysis', 'Visual Supports'],
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Dire bonjour',
        description: 'Pratique les salutations et les tours de rôle avec des amis virtuels',
        category: 'COMMUNICATION',
        difficulty: 'BEGINNER',
        duration: 10,
        instructions: [
          'Regarde ton interlocuteur',
          'Utilise le pictogramme pour saluer',
          'Attends la réponse et choisis une réaction appropriée',
          'Réitère la salutation avec un nouvel interlocuteur',
        ],
        targetSkills: ['salutations', 'communication_verbale'],
        ebpTags: ['Social Narratives', 'Peer-Mediated Instruction'],
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Calmer sa colère',
        description: 'Techniques de respiration et stratégies pour se calmer',
        category: 'EMOTIONAL_REGULATION',
        difficulty: 'INTERMEDIATE',
        duration: 15,
        instructions: [
          'Identifie ton émotion avec un pictogramme',
          'Trouve un endroit calme',
          'Suis le cycle de respiration guidée 4-2-4',
          'Exprime ce que tu ressens à l\'aide d\'une carte émotion',
          'Choisis une stratégie de retour au calme',
        ],
        targetSkills: ['regulation_emotionnelle', 'gestion_colere'],
        ebpTags: ['Cognitive Behavioral Intervention', 'Reinforcement'],
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Jeux mathématiques adaptatifs',
        description: 'Résous des défis mathématiques qui s\'adaptent à ta progression',
        category: 'ACADEMIC',
        difficulty: 'INTERMEDIATE',
        duration: 12,
        instructions: [
          'Lis la consigne affichée',
          'Choisis la bonne réponse parmi les options',
          'Observe le feedback et la difficulté ajustée',
          'Continue jusqu\'à atteindre le score cible',
        ],
        targetSkills: ['raisonnement_logique', 'arithmetique'],
        ebpTags: ['Technology-Aided Instruction', 'Reinforcement'],
      },
    }),
  ]);

  console.log('✅ Activités créées');

  // Créer des récompenses
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: 'Champion du jour',
        description: 'Complète 5 activités en un jour',
        iconUrl: '/rewards/champion.png',
        tokensRequired: 50,
        type: 'BADGE',
        badgeCondition: '5 activités terminées',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Maître des émotions',
        description: 'Réussis 10 activités de régulation émotionnelle',
        iconUrl: '/rewards/emotions.png',
        tokensRequired: 100,
        type: 'BADGE',
        category: 'EMOTIONAL_REGULATION',
        badgeCondition: '10 activités émotions',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Avatar Robot',
        description: 'Un avatar robot cool',
        iconUrl: '/avatars/robot.png',
        avatarUrl: '/avatars/robot-full.png',
        tokensRequired: 75,
        type: 'AVATAR',
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Thème Nuit Étoilée',
        description: 'Palette sombre apaisante',
        iconUrl: '/themes/night.png',
        themePreview: '#0b1021,#1c2541,#3a506b',
        tokensRequired: 60,
        type: 'THEME',
      },
    }),
  ]);

  console.log('✅ Récompenses créées');

  // Créer des ressources
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        title: 'Comment dire bonjour',
        description: 'Vidéo de modélisation pour apprendre à saluer',
        type: 'video',
        category: 'Communication',
        url: '/videos/dire-bonjour.mp4',
        thumbnailUrl: '/thumbnails/dire-bonjour.jpg',
        tags: ['salutations', 'social', 'communication'],
      },
    }),
    prisma.resource.create({
      data: {
        title: 'Pictogrammes émotions',
        description: 'Collection de pictogrammes pour les émotions de base',
        type: 'pictogram',
        category: 'Émotions',
        url: '/pictograms/emotions',
        tags: ['emotions', 'pictogrammes', 'communication'],
      },
    }),
    prisma.resource.create({
      data: {
        title: 'Histoire sociale: Aller à l\'école',
        description: 'Une histoire pour se préparer à aller à l\'école',
        type: 'social_story',
        category: 'Préparation',
        url: '/stories/aller-ecole.pdf',
        thumbnailUrl: '/thumbnails/ecole.jpg',
        tags: ['ecole', 'preparation', 'anxiete'],
      },
    }),
  ]);

  console.log('✅ Ressources créées');

  // Créer le progrès pour l'enfant
  const progress = await prisma.progress.create({
    data: {
      childId: childProfile.id,
      totalActivitiesCompleted: 23,
      tokensEarned: 150,
      skillsAcquired: {
        social_skills: 85,
        communication: 78,
        academic: 92,
        autonomy: 70,
        emotional_regulation: 88,
      },
      currentStreak: 7,
      longestStreak: 12,
      lastActivityDate: new Date(),
      rewardsUnlocked: [rewards[0].id],
      badgesUnlocked: [rewards[0].id],
      avatarsUnlocked: [],
      themesUnlocked: [],
      weeklyProgress: 3,
    },
  });

  console.log('✅ Progrès créé');

  // Créer quelques sessions d'activités
  await Promise.all([
    prisma.activitySession.create({
      data: {
        childId: childProfile.id,
        activityId: activities[0].id,
        startTime: new Date(Date.now() - 3600000), // Il y a 1 heure
        endTime: new Date(Date.now() - 3000000),
        completed: true,
        successRate: 85,
        attemptsCount: 3,
        supportLevel: 'minimal',
        emotionalState: 'happy',
      },
    }),
    prisma.activitySession.create({
      data: {
        childId: childProfile.id,
        activityId: activities[1].id,
        startTime: new Date(Date.now() - 7200000), // Il y a 2 heures
        endTime: new Date(Date.now() - 6600000),
        completed: true,
        successRate: 92,
        attemptsCount: 2,
        supportLevel: 'none',
        emotionalState: 'happy',
      },
    }),
  ]);

  console.log('✅ Sessions d\'activités créées');

  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
