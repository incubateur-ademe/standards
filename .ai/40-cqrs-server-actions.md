# CQRS avec Server Actions dans Next.js

Commandes = Server Actions (mutations) :
- `updateActionStatus(startupExternalId, actionId, status)`
- `addActionProof(startupExternalId, actionId, proof)`
- `addActionComment(startupExternalId, actionId, body)`
- `createSnapshot(startupExternalId)`

Requêtes = fonctions côté serveur (RSC ou routes GET) :
- `getStartupDashboard(startupExternalId)`
- `getPhaseStandards(startupExternalId)`
- `getStandardDetails(startupExternalId, standardId)`
- `getActionDetails(startupExternalId, actionId)`
- `getSnapshots(startupExternalId)`
- `getSnapshot(snapshotId)`

Règles :
- Aucune logique métier dans les composants UI.
- Les commandes valident les entrées (Zod), appliquent l'autorisation, et utilisent des transactions pour les opérations multi-écritures.
- Après une commande, révalider les tags/paths pour rafraîchir les read models.
