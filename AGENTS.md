# Agents
- Voir `.ai/AGENTS.md` pour l'index et le guide opératoire des agents.

## Résumé du dépôt

- Framework : Next.js (app directory) — voir `package.json` (dépendance `next`).
- Gestionnaire de paquets : `pnpm` (`pnpm@10` dans `package.json`).
- Version ciblée de Node : `node >= 24` (voir `package.json` > `engines`).
- Scripts principaux :
	- `pnpm dev` — démarre le serveur de développement Next (`next dev`).
	- `pnpm build` — construit l'application Next.
	- `pnpm start` — lance le serveur en production.
	- `pnpm run generateEnvDeclaration` — lit `.env.development` et génère `env.d.ts`.

## Organisation du code

- `src/` — sources de l'application
- `src/app/` — routes Next.js et composants serveur (app directory)
- `src/app/admin/` — routes de l'interface d'administration
- `src/components/` — composants UI réutilisables
- `src/hooks/` — hooks React personnalisés
- `src/dsfr/` — composants, hooks et layouts DSFR (client et server)
- `src/lib/` — utilitaires, helpers, repositories DB
- `src/config.ts` — configuration centrale lisant les variables d'environnement
- `scripts/` — scripts utilitaires (ex. `generateEnvDeclaration.ts`)

## Conventions de travail

- Parle et réfléchi en exclusivement français dans nos échanges. (pas d'anglais ou de franglais sauf citations techniques)
- Pas la peine d'ajouter des commentaires explicatifs ligne à ligne pour tout
- Tu dois me challenger, ni moi ni toi n'avons la réponse à tout
- Tu dois toujours expliquer tes choix, surtout quand tu prends des décisions architecturales ou de conception
- Tu peux poser des questions pour clarifier le besoin ou le contexte avant de proposer une solution
- Toujours viser la simplicité et la clarté du code
- Tu peux être moqueur, mais jamais méprisant
- On travaille sur Next.js 16+ avec l'app directory. Le MCP de Nextjs est notre référence principale pour les bonnes pratiques, les codemods, et l'exploitation des erreurs/warnings du framework.
- Ne pas importer l'espace de noms React par défaut (`import React from "react"`) — la toolchain Next gère la transformation JSX.
- Exporter les composants UI React en tant que `named exports` (pas d'`export default`), sauf pour les fichiers Next.js spécifiques (`page.tsx`, `layout.tsx`, `route.ts`, etc.) qui conservent leurs exports par défaut lorsque requis.
- Éviter les fichiers "barrel" `index.ts` dans les dossiers de routes ou de composants de l'app — ne pas créer de barrels pour le code d'app.
- Préférer les fonctions serveur / Server Actions plutôt que des routes API internes pour la persistance et les opérations internes à l'app. Si une route API est nécessaire pour une intégration externe, la documenter clairement.
- Pour les composants clients qui doivent appeler du code serveur, préférer le passage d'une Server Action en prop (le nom doit se terminer par `Action`, ex. `onToggleAction`). Ne pas accéder directement à la base de données depuis du code client.
- Toujours faire du pair programming : ne pas tenter de récupérer seul des ressources protégées (ex. détails de startup) — demander le contexte nécessaire ou fournir le loader serveur ; on s'organise ensemble pour l'implémentation.
- Ne jamais utiliser `any` ou `unknown` (sauf dans le catch) en TypeScript ; typer précisément ou demander de l'aide pour définir les types.

Ces conventions s'appliquent dans tout le dépôt pour garder une cohérence d'import, de bundling et de séparation server/client.


## Conventions UI (modales, styles, formulaires)

- **Modales :** utiliser le composant officiel de `react-dsfr` (trouvable via MCP Storybook si besoin) pour assurer accessibilité et comportements natifs. N'utiliser `SimpleModal` depuis `src/dsfr/layout` qu'en dernier recours pour des cas très spécifiques.
- **Styles (priorité) :**
  - **1.** classes DSFR via `fr.cx(...)` (préféré) ;
  - **2.** classes Tailwind (si un besoin rapide justifie son usage) ;
  - **3.** modules SCSS (`*.module.scss`) en dernier recours pour du style spécifique.
  - **Interdit :** styles inline (`style={{ ... }}`).
- **Layout :** pour la structure responsive, préférer `Grid` / `GridCol` (disponibles dans `src/dsfr/layout`) qui reposent sur la grille DSFR.
- **Formulaires :**
  - **Privilégier les formulaires natifs** avec `formAction` (Server Action) lorsque la validation est minimale et que le traitement peut se faire côté serveur sans lourde interaction client.
  - Si une validation côté client plus riche est nécessaire, utiliser `react-hook-form` côté client et valider avec `zod` (`@hookform/resolvers` pour la liaison).
  - Favoriser toujours une solution simple et accessible — éviter d'ajouter de la complexité inutile.



## Journal des modifications

- 2025-12-08 : `AGENTS.md` initial créé.
- 2026-01-02 : Ajout d'un dossier `.ai/` pour la documentation des agents et du produit.
