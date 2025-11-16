# Guide de Déploiement - SuperKids Learning

## Vue d'ensemble

Ce document décrit les différentes méthodes de déploiement de l'application SuperKids Learning en production.

## Options de Déploiement

### Option 1: Docker Compose (Recommandé pour début)

Le moyen le plus simple pour déployer l'application complète.

#### Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 20GB d'espace disque

#### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/your-org/superkids-learning.git
cd superkids-learning
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
nano .env  # Éditer les variables
```

Variables critiques à modifier:
```env
JWT_SECRET=un-secret-tres-securise-changez-moi
POSTGRES_PASSWORD=un-mot-de-passe-fort
NODE_ENV=production
```

3. **Démarrer l'application**
```bash
docker-compose up -d
```

4. **Vérifier le déploiement**
```bash
docker-compose ps
docker-compose logs -f
```

5. **Accéder à l'application**
- Frontend: http://your-domain:3000
- Backend API: http://your-domain:5000
- Health check: http://your-domain:5000/health

#### Maintenance

```bash
# Voir les logs
docker-compose logs -f [service-name]

# Redémarrer un service
docker-compose restart backend

# Mettre à jour l'application
git pull
docker-compose build
docker-compose up -d

# Backup de la base de données
docker-compose exec postgres pg_dump -U superkids superkids_learning > backup.sql

# Restore de la base de données
docker-compose exec -T postgres psql -U superkids superkids_learning < backup.sql
```

### Option 2: Services Cloud Séparés

Déploiement sur des services cloud individuels pour meilleure scalabilité.

#### Architecture Recommandée

```
┌─────────────────┐
│   CloudFlare    │  CDN + DDoS Protection
└────────┬────────┘
         │
┌────────▼────────┐
│   Vercel/       │  Frontend (React)
│   Netlify       │
└─────────────────┘
         │
┌────────▼────────┐
│   Heroku/       │  Backend (Node.js)
│   Railway/      │
│   Render        │
└────────┬────────┘
         │
┌────────▼────────┐
│   Supabase/     │  PostgreSQL
│   AWS RDS       │
└─────────────────┘
         │
┌────────▼────────┐
│   Upstash/      │  Redis
│   Redis Cloud   │
└─────────────────┘
```

#### Frontend (Vercel)

1. **Configuration**
```bash
cd frontend
npm install -g vercel
vercel login
```

2. **Déployer**
```bash
vercel --prod
```

3. **Variables d'environnement**
Dans le dashboard Vercel, ajouter:
```
VITE_API_URL=https://your-backend.herokuapp.com/api
```

#### Backend (Heroku)

1. **Installation Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. **Créer l'application**
```bash
cd backend
heroku create superkids-api
```

3. **Configurer PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Configurer Redis**
```bash
heroku addons:create heroku-redis:mini
```

5. **Variables d'environnement**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
```

6. **Déployer**
```bash
git push heroku main
```

7. **Exécuter les migrations**
```bash
heroku run npm run migrate:deploy
heroku run npm run seed
```

### Option 3: Kubernetes (Production Enterprise)

Pour les déploiements à grande échelle.

#### Prérequis

- Cluster Kubernetes
- kubectl configuré
- Helm 3.0+

#### Structure

```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── postgres/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── pvc.yaml
├── redis/
│   ├── deployment.yaml
│   └── service.yaml
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
└── frontend/
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

#### Déploiement

```bash
# Créer le namespace
kubectl apply -f k8s/namespace.yaml

# Configurer les secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-secret \
  --from-literal=postgres-password=your-password \
  -n superkids

# Déployer les services
kubectl apply -f k8s/ -R

# Vérifier
kubectl get pods -n superkids
```

## Configuration de Production

### Variables d'Environnement Essentielles

#### Backend
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=very-secure-secret-min-32-chars
JWT_EXPIRES_IN=7d
REDIS_HOST=redis-host
REDIS_PORT=6379
FRONTEND_URL=https://app.superkids.com
LOG_LEVEL=info
```

#### Frontend
```env
VITE_API_URL=https://api.superkids.com/api
NODE_ENV=production
```

### Sécurité

#### 1. HTTPS/SSL

**Avec Nginx**:
```nginx
server {
    listen 443 ssl http2;
    server_name app.superkids.com;

    ssl_certificate /etc/letsencrypt/live/superkids.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/superkids.com/privkey.pem;

    # SSL config
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Avec Let's Encrypt**:
```bash
sudo certbot --nginx -d app.superkids.com -d api.superkids.com
```

#### 2. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

#### 3. Secrets Management

**Avec Docker Secrets**:
```bash
echo "my-secret-password" | docker secret create db_password -
```

**Avec Kubernetes Secrets**:
```bash
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=xxx \
  --from-literal=db-password=xxx
```

#### 4. Rate Limiting

Déjà configuré dans `backend/src/middleware/rateLimiter.ts`

### Monitoring et Logs

#### 1. Application Monitoring

**Option: PM2 (Node.js)**
```bash
npm install -g pm2

# Démarrer l'application
pm2 start dist/server.js --name superkids-api

# Monitoring
pm2 monit

# Logs
pm2 logs
```

**Option: New Relic / Datadog**
```javascript
// backend/src/server.ts
import newrelic from 'newrelic';
```

#### 2. Logs Centralisés

**Winston → CloudWatch / ELK Stack**
```typescript
// backend/src/utils/logger.ts
const logger = winston.createLogger({
  transports: [
    new winston.transports.CloudWatch({
      logGroupName: 'superkids-api',
      logStreamName: process.env.NODE_ENV,
    }),
  ],
});
```

#### 3. Health Checks

```bash
# Endpoint déjà configuré
curl https://api.superkids.com/health

# Uptime monitoring avec Uptime Robot
# Configurer ping toutes les 5 minutes
```

### Backup et Récupération

#### Base de Données

**Backup automatique quotidien**:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
pg_dump -h localhost -U superkids superkids_learning | gzip > /backups/db_$DATE.sql.gz

# Garder seulement les 30 derniers jours
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

**Cron job**:
```bash
crontab -e
# Ajouter:
0 2 * * * /path/to/backup.sh
```

#### Fichiers Uploads

```bash
# Sync vers S3
aws s3 sync /app/uploads s3://superkids-backups/uploads --delete
```

### Scaling

#### Horizontal Scaling (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### Load Balancing

**Nginx**:
```nginx
upstream backend {
    least_conn;
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### Performance

#### 1. Caching

**Redis Cache**:
```typescript
import redis from 'redis';
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
});

// Cache des activités
app.get('/api/activities', async (req, res) => {
  const cached = await client.get('activities');
  if (cached) return res.json(JSON.parse(cached));

  const activities = await getActivities();
  await client.setex('activities', 3600, JSON.stringify(activities));
  res.json(activities);
});
```

#### 2. CDN pour Assets

```bash
# Uploader les assets vers CDN
aws s3 sync frontend/dist s3://superkids-cdn
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

#### 3. Compression

Déjà configuré dans `frontend/nginx.conf`:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Checklist de Déploiement

#### Avant le Déploiement

- [ ] Tests passent (frontend et backend)
- [ ] Build réussit sans erreurs
- [ ] Variables d'environnement configurées
- [ ] Secrets sécurisés (pas de secrets dans le code)
- [ ] SSL/TLS configuré
- [ ] Backups configurés
- [ ] Monitoring configuré
- [ ] Health checks fonctionnent
- [ ] Documentation à jour

#### Après le Déploiement

- [ ] Vérifier que l'application est accessible
- [ ] Tester les fonctionnalités critiques
- [ ] Vérifier les logs pour les erreurs
- [ ] Tester la performance
- [ ] Vérifier les métriques de monitoring
- [ ] Tester les backups
- [ ] Documenter la version déployée

### Rollback

Si un problème survient après déploiement:

**Docker Compose**:
```bash
git checkout previous-version
docker-compose build
docker-compose up -d
```

**Kubernetes**:
```bash
kubectl rollout undo deployment/backend -n superkids
```

**Heroku**:
```bash
heroku rollback
```

## Support et Dépannage

### Problèmes Courants

**1. L'application ne démarre pas**
```bash
# Vérifier les logs
docker-compose logs backend
# Vérifier les variables d'environnement
docker-compose exec backend env
```

**2. Base de données non accessible**
```bash
# Vérifier la connexion
docker-compose exec backend nc -zv postgres 5432
# Vérifier les credentials
docker-compose exec postgres psql -U superkids -d superkids_learning
```

**3. Erreurs 502 Bad Gateway**
```bash
# Vérifier que le backend tourne
docker-compose ps
# Vérifier les health checks
curl http://localhost:5000/health
```

---

Pour plus d'aide, consulter la documentation complète dans `claude.md` et `claude_extended.md`.
