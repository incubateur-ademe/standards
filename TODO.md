# TODO — page /startup/[startupId] + global checklist

Objectif
- Implémenter la page principale d'une startup (/startup/:startupId) pour :
  - afficher et remplir les standards par phase,
  - commenter inline (reviewers et membres),
  - créer des snapshots (tag d'état à T, model JSON db à définir),
  - conserver l'historique des modifications (model db).

## AuditLog — explication rapide
But
- Garder une trace immuable des opérations CRUD importantes pour debugging, responsabilité et possibilité de reconstituer l'historique.

Structure recommandée (Prisma)
- AuditLog {
  id: String (UUID)
  userId: String?
  startupId: String?           // si l'op concerne une startup
  entity: String              // ex: "ActionStatus", "Standard", "Action", "Comment", "Snapshot"
  entityId: String?           // id de l'entité modifiée
  op: String                  // "create" | "update" | "delete" | "snapshot" | "comment"
  diff: Json?                 // objet décrivant les changements { before?, after? } ou { field: [old, new] }
  meta: Json?                 // contexte libre (ip, user-agent, reason)
  createdAt: DateTime
}

Bonnes pratiques
- Écrire systématiquement pour: création/modif/suppression de Standard, Action, ActionStatus, Snapshot, Comment.
- Pour les updates, stocker before/after partiels dans diff (pas tout l'objet si volumineux).
- Éviter données sensibles (pas de token).
- Endpoint/server-action qui effectue l'op doit écrire l'AuditLog dans la même transaction Prisma quand possible.
- Fournir une UI admin /admin/audit pour parcourir (filtrage par startup, entity, user, date).
- Supporter export (CSV/JSON) pour audits réglementaires.

Exemples d'usage
- Upsert ActionStatus: op="update", entity="ActionStatus", entityId=..., diff={status:{old:"todo",new:"done"},note:{old:null,new:"Réalisé"}}.
- Suppression standard: op="delete", entity="Standard", meta={cascadeCounts:{actions:3,comments:10}}.

Retention & reprise
- Politique retenue au produit; prévoir purge/archivage et index sur createdAt pour requêtes.

---

## Schéma DB minimal (rappel)
- ActionStatus { id, startupId, actionId, status(enum), note, updatedBy, updatedAt }
- Comment { id, startupId, standardId?, actionId?, authorId, text, createdAt }
- Snapshot { id, startupId, name?, createdBy, createdAt, actionStatusSnapshot JSON }
- AuditLog { ...voir ci-dessus... }

(Startups et Users gérés via EspaceMembre / next-auth)

---

## Pages / routes (tâches globales)
- / (Home)
  - [ ] Hero explicatif + CTA
  - [ ] Liste des startups de l'utilisateur avec progression agrégée par phase
  - [ ] Filtres (industry, phase)
- /login
  - [x] Déjà faite
- /startup/[startupId]
  - [ ] Server page loader (startup, standards, actions, actionStatus, snapshots, comments)
  - [ ] StartupHeader (snapshots, meta)
  - [ ] StandardsList (group by phase, MoSCoW filter)
  - [ ] StandardCard (ouvrir /standards/[id] en parallel route)
  - [ ] ActionRow (toggle / save -> server action + AuditLog)
  - [ ] CommentsPanel (inline add/list)
  - [ ] SnapshotModal (create snapshot -> AuditLog)
  - [ ] Rôles: vérif via UserOnStartup pour habilitations
  - [ ] Tests unitaires pour upsert ActionStatus
- /standards
  - [ ] Liste globale des standards, recherche, tri, filtres MoSCoW/phase/industry
  - [ ] Pagination / lazy load si nécessaire
- /standards/[id] (parallel route / drawer)
  - [ ] Page/drawer qui peut s'ouvrir depuis /startup/[startupId] sans navig full
  - [ ] Afficher détail standard + actions + historique admin (modifs)
  - [ ] Afficher disabled flag + option d'édition (admin)
- /admin/*
  - [ ] Admin CRUD pour Standards/Actions (create/edit/soft-disable/delete avec warning cascade)
  - [ ] /admin/audit — UI pour parcourir AuditLog
  - [ ] Seed import tooling pour admin (seed minimal)
- Reviews & Snapshots
  - [ ] Inline comments déjà prévus sur startup/standard/action
  - [ ] Snapshot list + restore preview (non destructif)
- API / Server actions
  - [ ] POST /api/startups/[id]/action-status (upsert + AuditLog)
  - [ ] POST /api/startups/[id]/comments (create + AuditLog)
  - [ ] POST /api/startups/[id]/snapshots (create + AuditLog)
  - [ ] Helpers read endpoints si besoin (server components préf)
- Auth & sécurité
  - [ ] Intégrer UserOnStartup roles, checks côté serveur et client
  - [ ] Protéger routes admin
  - [ ] Rate-limit / abuse protections si public
- DB & infra
  - [ ] Ajouter modèles Prisma listés et migrer
  - [ ] pnpm prisma generate
  - [ ] Mettre à jour prisma/seed.ts (dev seed minimal)
  - [ ] Tests d'intégration pour endpoints critiques
- UI / UX
  - [ ] Utiliser react-dsfr pour composants officiels
  - [ ] Indicateurs d'avancement (% par phase et global)
  - [ ] Confirmation avant suppression (afficher impact via counts)
  - [ ] Filtrage par métier (industry) et MoSCoW
  - [ ] Accessibilité basique (labels, focus, clavier)
- Observabilité & maintenance
  - [ ] Logger côté serveur (requests/erreurs)
  - [ ] Metrics basiques (nombre d'actions/status modifiés, snapshots créés)
  - [ ] Endpoint d'export AuditLog

---

## Dev plan (priorités)
- [ ] Modèles Prisma + migration + seed
- [ ] Générer client Prisma (pnpm prisma generate)
- [ ] Page server component /startup/[startupId]/page.tsx
- [ ] Endpoints / server-actions pour action-status, comments, snapshots (avec AuditLog dans transaction)
- [ ] Composants client pour interactions (ActionRow, CommentsPanel, SnapshotModal)
- [ ] Parallel route /standards/[id] (drawer)
- [ ] Admin UI minimal + /admin/audit
- [ ] Tests unitaires / intégration pour upsert + audit
- [ ] Revue sécurité & rôles

---

## Notes / repères fichiers
- src/app/Navigation.tsx — réactiver liste startups
- src/lib/next-auth/auth.ts — callbacks & user info
- prisma/schema.prisma — ajouter modèles
- prisma/seed.ts — adapter seed
- src/generated/prisma/ — régénérer client
- scripts/export-notion-json.ts — inutile si plus de Notion sync (seed initial seulement)
