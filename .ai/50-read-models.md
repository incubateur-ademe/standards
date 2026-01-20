# Modèles de lecture (orientés écran)

Dashboard:
- `completionGlobal` (done/total actions dans la phase courante)
- comptages par statut
- `completionByJob`
- `lastSnapshotAt`

Liste des standards de la phase :
- pour chaque standard : `completion`, `blockersCount`, `openDiscussionsCount`, chips par job

Détails du standard :
- liste des actions avec `status`, `lastUpdatedAt`, `proofsCount`, `commentsCount`

Détails de l'action :
- informations de l'action (raison, KPI)
- statut de progression
- preuves (non supprimées)
- commentaires (non supprimés)
