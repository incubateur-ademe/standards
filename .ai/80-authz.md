# Modèle d'autorisation

L'API externe est la source de vérité pour l'appartenance et la phase d'une startup.

Accès à une startup accordé si :
- l'utilisateur est membre selon l'API externe OU
- l'utilisateur possède un `UserOnStartup` valide (non expiré) OU
- l'utilisateur est `ADMIN`/`REVIEWER` (selon la politique)

Permissions :
- `USER` : peut mettre à jour le statut d'une action, ajouter des preuves, ajouter des commentaires sur les startups accessibles
- `REVIEWER` : peut ajouter des commentaires (et éventuellement des preuves) mais ne peut pas changer les statuts (par défaut MVP)
- `ADMIN` : accès complet

Toutes les commandes appliquent l'autorisation côté serveur.
