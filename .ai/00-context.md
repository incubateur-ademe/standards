# Contexte

Objectif : Construire une application interne pour aider les startups de l'incubateur à respecter les standards de qualité, par phase.
Un standard est un ensemble d'actions mesurables. Les startups sont évaluées selon les standards de leur phase courante.

Source de vérité externe :
- L'identité de la startup, ses membres et sa phase courante proviennent d'une API externe de l'incubateur.
- Localement, nous conservons un enregistrement minimal « shadow » pour assurer l'intégrité référentielle et l'historique.

Principes produits principaux :
- L'unité de vérité est l'`Action` (par startup).
- L'achèvement d'un standard est dérivé de la progression des actions.
- Les discussions de revue sont attachées aux actions (pas aux standards).
- Les instantanés sont immuables et autonomes (doivent rester lisibles même si les données live changent).
