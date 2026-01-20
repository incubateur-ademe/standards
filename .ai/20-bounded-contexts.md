# Contextes délimités (DDD-lite)

Nous conservons une seule base de données (`schema.prisma`), mais le code est organisé par contextes délimités.

1) Catalog
- Possède : Phase, Job, Standard, Action, ActionSource
- Responsabilité : importer/synchroniser depuis Notion, fournir les requêtes "actions attendues pour une phase".

2) Tracking
- Possède : StartupShadow, ActionProgress, ActionProof, ActionComment, UserOnStartup (overrides d'accès)
- Responsabilité : changements d'état, invariantes, collaboration au niveau des actions.

3) Snapshot
- Possède : Snapshot, SnapshotActionProgress, SnapshotActionProof
- Responsabilité : figer et préserver l'état pour audit/usages comité.
