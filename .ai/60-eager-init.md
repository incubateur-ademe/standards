# Initialisation proactive

Objectif : garantir qu'un `ActionProgress` existe pour chaque action attendue dans la phase courante de la startup.

Moments déclencheurs :
- au premier accès au tableau de bord d'une startup
- lorsque la `currentPhase` change (détecté via la synchronisation avec l'API externe)

Algorithme :
1) Upsert `StartupShadow(externalId)` avec `currentPhaseId`
2) Calculer les actions attendues pour cette phase (depuis le Catalog)
3) `createMany` `ActionProgress(startupShadowId, actionId, status=TODO)` avec `skipDuplicates=true`

Notes :
- Nous ne supprimons jamais `ActionProgress` lorsque la phase change ; l'UI filtre par les actions attendues de la phase courante.
- L'initialisation proactive doit être idempotente.
