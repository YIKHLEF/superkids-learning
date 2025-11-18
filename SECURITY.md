# Sécurité & Protection des données

## Données nécessaires à l'Adaptive Engine
- Identifiants pseudonymisés des enfants (UUID, pas de nom complet dans les flux d'adaptation).
- Âge ou tranche d'âge, préférences sensorielles et objectifs IEP nécessaires pour le calibrage pédagogique.
- Signaux de performance d'activité (taux de réussite, nombre d'essais, temps moyen par item, niveau de support, état émotionnel qualifié).
- Journalisation d'audit minimale (qui consulte ou modifie les recommandations, horodatage, origine de la requête).

## Consentement & conformité (RGPD / COPPA)
- **Base légale** : consentement explicite du détenteur de l'autorité parentale + intérêt légitime pour fournir le service éducatif.
- **COPPA** : vérification parentale renforcée pour tout compte enfant (<13 ans) avant collecte de données.
- **Transparence** : écran dédié résumant les données utilisées par l'Adaptive Engine et possibilité de retrait du consentement.
- **Droits utilisateurs** : export, rectification et suppression à traiter sous 30 jours ; prévoir un mode "pause collecte" désactivant les recommandations.

## Minimisation & rétention
- Limiter les payloads aux signaux strictement nécessaires (pas d'éléments biométriques, pas de notes libres non modérées).
- Troncature des identifiants côté logs et rotation hebdomadaire des journaux adaptatifs.
- Purge automatique des signaux bruts après agrégation (30 jours max), conservation des métriques agrégées anonymisées seulement.
- **Headers applicatifs** : `X-Data-Retention-Days` et `X-Anonymization-Flag` sont ajoutés par le middleware `enforceDataProtectionHeaders`
  afin de tracer la politique active dans les réponses HTTP.

## Garde-fous de confidentialité
- **Chiffrement** : TLS obligatoire en transit, chiffrement au repos pour les tables d'activités et de profils.
- **Isolation** : séparer le stockage des performances et des métadonnées d'identité ; clés d'API ML stockées uniquement en variables d'environnement.
- **Data contracts** : valider le schéma des signaux (whitelist) avant toute transmission à un connecteur ML externe.
- **Red team** : activer des contrôles d'anomalie (ex : volume inhabituel de requêtes Adaptive Engine) et alertes dans le SIEM.
- **Désactivation immédiate** : bouton/flag d'opt-out désactive l'appel au connecteur ML (fallback heuristique local).

## Consentement & anonymisation
- Les opérations profil et préférences exigent le middleware `requireParentalConsent` (entête `x-parent-consent:true`) pour les utilisateurs enfants ou lorsque l'âge (<13 ans) est fourni.
- L'anonymisation des champs sensibles (`email`, `parentEmail`) est activable via la variable `DATA_ANONYMIZATION=true` et repose sur `anonymizeResponse`.
- Les logs d'audit (login, messages, profils) sont envoyés vers Datadog/New Relic en production lorsque `ENABLE_PROD_TELEMETRY=true`.

## Procédures d'incident
- Temps de détection cible : <15 minutes via alerting sur les endpoints sensibles (/adaptive/*).
- Contention : rotation des clés d'API, blocage réseau vers l'endpoint ML, bascule automatique en mode heuristique.
- Communication : notification aux parents/administrateurs sous 72h avec périmètre et mesures correctives.
