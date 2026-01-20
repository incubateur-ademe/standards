# Modèle de domaine (conceptuel)

## Catalogue (importé)
- Phase : phases de l'incubateur (Investigation, Construction, Accélération, etc.)
- Job : rôles/domaines (Tech, Product, Design, ...)
- Standard : un standard de qualité, lié à des Jobs et à des Actions, catégorisé par priorité de phase (could/should/must)
- Action : exigence mesurable avec KPI/Raison/Sources

## Suivi (par startup)
- `StartupShadow` : représentation locale minimale d'une startup externe (`externalId`, `name`, `currentPhaseId`)
- `ActionProgress` : état de progression par paire (startup, action) (TODO/IN_PROGRESS/DONE/BLOCKED)
- `ActionProof` : éléments de preuve attachés (URL, référence fichier, note). Soft-deletable.
- `ActionComment` : messages de discussion sur l'action. Soft-deletable.

## Instantané
- `Snapshot` : capture immuable de l'état de la phase courante pour une startup à un instant donné.
- `SnapshotActionProgress` : statut figé par action dans cet instantané.
- `SnapshotActionProof` : copie figée des preuves pour chaque action figée.
