# Notes sur le modèle de données Prisma

## StartupShadow
 - Stocke l'identité externe de la startup : `externalId` (unique), `name` (optionnel)
 - Stocke `currentPhaseId` mappé à la `Phase` interne
 - Utilisé pour l'intégrité référentielle (FKs) et l'historique

## Overrides d'accès
- `UserOnStartup` accorde un accès local lorsqu'un utilisateur n'est pas membre selon l'API externe.
- Possède un `kind` (ASSISTANCE/AUDIT/TEMP/OTHER) et un `expiresAt` optionnel.

## ActionProgress
- Unique par paire (`startupShadowId`, `actionId`)
- Stocke le `status`, `owner` (optionnel), `updatedBy` (optionnel)
- Contient les preuves et commentaires

## Preuves et commentaires
- Soft-delete via `deletedAt`
- `ProofKind` supporte `URL`/`FILE`/`NOTE`
- `ref` est une URL ou une clé de stockage (clé S3 recommandée pour les fichiers)

## Instantanés
- `Snapshot` est immuable
- `SnapshotActionProgress` fige le statut par action
- `SnapshotActionProof` copie les preuves pour rendre les instantanés autonomes
