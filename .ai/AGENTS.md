# AGENTS.md — index et guide opératoire `.ai`

Ce fichier est le point d'entrée pour les agents de code et les contributeurs.

## 1) Résumé produit
Nous développons une application interne permettant de vérifier si les startups de l'incubateur respectent les standards de qualité attendus pour leur phase courante. Un standard est un ensemble d'actions mesurables. Les startups mettent à jour la progression des actions, joignent des preuves, discutent avec des réviseurs au niveau des actions, et peuvent créer des instantanés immuables qui capturent l'état à un moment donné. L'appartenance d'une startup et sa phase proviennent d'une API externe ; localement nous conservons un `StartupShadow` pour l'intégrité référentielle et l'historique.

## 2) Ordre de lecture
1. `00-context.md` — intention produit et principes
2. `10-domain-model.md` — entités conceptuelles et relations
3. `20-bounded-contexts.md` — frontières DDD-lite (Catalog / Tracking / Snapshot)
4. `30-data-model-prisma.md` — justification du modèle de données
5. `40-cqrs-server-actions.md` — approche CQRS dans Next.js (commandes vs requêtes)
6. `50-read-models.md` — modèles de lecture par écran
7. `60-eager-init.md` — création idempotente d'`ActionProgress` pour la phase courante
8. `70-snapshots.md` — création d'instantanés immuables et autonomes
9. `80-authz.md` — règles d'autorisation
10. `90-non-goals.md` — éléments explicitement exclus du MVP

## 3) Limites et règles (MVP)
Doit :
- Suivre la progression des actions par startup (TODO/IN_PROGRESS/DONE/BLOCKED)
- Autoriser l'ajout de preuves (URL/référence fichier/note)
- Autoriser des discussions au niveau des actions (commentaires)
- Autoriser des instantanés immuables de la phase courante

Ne doit PAS (MVP) :
- effectuer des transitions de phase automatiques
- gérer des workflows de revue multi-étapes (états d'approbation)
- implémenter un scoring/pondération complexe
- fournir un système de notifications

## 4) Règles architecturales
### CQRS
- Commandes = Server Actions uniquement (mutations).
- Requêtes = fonctions read-model côté serveur (RSC/GET). Les requêtes ne mutent jamais l'état.

### Frontières DDD-lite
- Catalog : Phase/Job/Standard/Action/ActionSource (importé, principalement en lecture seule)
- Tracking : StartupShadow, ActionProgress, ActionProof, ActionComment, UserOnStartup (overrides d'accès)
- Snapshot : Snapshot, SnapshotActionProgress, SnapshotActionProof (enregistrements immuables)

### Immuabilité
- Les tables d'instantanés sont immuables par conception.
- `ActionProgress` ne doit pas être supprimé physiquement.
- Les preuves/commentaires sont supprimables via soft-delete (`deletedAt`).

## 5) Intégration API externe
L'API externe est la source de vérité pour :
- l'identité des startups
- la composition des membres
- la phase courante

La base locale stocke :
- `StartupShadow(externalId, currentPhaseId, name)`
- les overrides d'accès pour assistance/audit : `UserOnStartup`

## 6) Initialisation proactive (idempotente)
À chaque accès à une startup (ou lorsque la phase change) :
- upsert de `StartupShadow` par `externalId`
- calculer les actions attendues pour la phase courante (depuis le Catalog)
- créer les lignes `ActionProgress` manquantes (startupShadowId, actionId) avec `status=TODO`
- l'opération doit être sûre à exécuter plusieurs fois sans effets secondaires

## 7) Exigences pour les instantanés
`CreateSnapshot` doit :
- enregistrer la phase qui était courante au moment de la création
- figer le statut de chaque action attendue pour cette phase
- copier les preuves non supprimées dans les tables d'instantanés
Motif : les instantanés doivent rester lisibles même si les données en direct changent ensuite.

## 8) Autorisation (appliquée côté serveur)
Un utilisateur peut accéder à une startup si :
- il est membre selon l'API externe OU
- il a un `UserOnStartup` valide (non expiré) OU
- il est `ADMIN`/`REVIEWER` (selon la politique)

Permissions :
- `USER` : mettre à jour les statuts, ajouter des preuves, commenter sur les startups accessibles
- `REVIEWER` : commenter (par défaut MVP : pas de modification de statut)
- `ADMIN` : tous les droits

Toutes les commandes doivent vérifier l'autorisation côté serveur.

## 9) Checklist d'implémentation pour une nouvelle fonctionnalité
Avant de coder :
- Quel bounded context la possède ?
- Est-ce une commande ou une requête ?
- Quelles invariantes d'agrégat sont impactées ?
- Nécessite-t-elle un nouveau read model ?
- Impacte-t-elle les instantanés ou l'immutabilité ?

## 10) Règles de nommage
- Préférer « Proof » à « Evidence » (vocabulaire produit + modèles : `ActionProof`, `SnapshotActionProof`).
- `StartupShadow` désigne la représentation locale d'une startup externe.
- `ActionProgress` est l'état de suivi par startup pour une `Action` du catalogue.
