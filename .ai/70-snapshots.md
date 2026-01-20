# Instantanés

Un instantané doit être immuable et autonome.

`CreateSnapshot` effectue :
- création de `Snapshot(startupShadowId, phaseId, createdById)`
- pour chaque action attendue dans la phase courante :
  - lire `ActionProgress.status`
  - copier vers `SnapshotActionProgress`
  - copier les preuves non supprimées vers `SnapshotActionProof`

Motif :
- Même si des preuves sont ensuite supprimées ou que des liens expirent, l'instantané reste un enregistrement fidèle de ce qui était fourni à ce moment.
