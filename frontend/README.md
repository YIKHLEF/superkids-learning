# Frontend

## CDN & build configuration
- Set the CDN base URL in `.env` (variable `VITE_CDN_URL`) so Vite injects absolute URLs for JS/CSS assets during `npm run build`.
- The Vite build generates a manifest at `dist/manifest.json` to help reverse proxies or backends map logical entries to the hashed assets served from the CDN.
- When building via Docker/Compose, `VITE_CDN_URL` is forwarded as a build arg so the generated HTML and manifest point to the CDN host.

## Serving static assets through a CDN
- Upload the `dist/assets` directory to your CDN (e.g., CloudFront/Azure CDN) after running the production build.
- Ensure your reverse proxy points the `/assets/` path to the CDN origin or serves files directly from the CDN host referenced in `VITE_CDN_URL`.
- Keep `index.html` served by the application container so client-side routing continues to work while static assets are fetched from the CDN.

## Storybook & documentation des composants
- **Démarrer le catalogue** : `npm run storybook` (serveur sur http://localhost:6006).
- **Build statique** : `npm run build-storybook` génère `storybook-static/` pour l’hébergement.
- Les stories sont regroupées dans `src/stories` et couvrent les boutons accessibles, cartes d’information, modales, panneaux d’accessibilité et le lecteur vidéo personnalisé.
- L’addon a11y est activé par défaut pour inspecter les contrastes, rôles et labels ARIA.

## Tests visuels / snapshots
- Les stories critiques sont contrôlées via Jest + `@storybook/testing-react` dans `src/stories/__tests__/criticalStories.test.tsx`.
- Exécuter les snapshots : `npm run test:stories`.
- Les snapshots sont générés depuis les stories Storybook afin de détecter les régressions d’interface entre builds.
