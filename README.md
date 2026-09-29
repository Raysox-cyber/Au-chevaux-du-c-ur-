# Au Galop du Cœur — version Supabase + GitHub

## Parcours des dons

Le bouton **💚 Faire un don** ouvre `don.html`.

Le visiteur peut :
- choisir 5 €, 10 €, 20 €, 50 € ou 100 € ;
- entrer un montant libre **sans plafond** ;
- entrer son nom ou pseudo ;
- cliquer sur « Faire le don ».

Cette version est une **démo** : aucun paiement bancaire réel n'est effectué. Le don est enregistré dans Supabase.

## Base Supabase

Dans Supabase → SQL Editor, exécute le SQL fourni avec cette version du projet. La table `donors` utilise un montant `numeric` sans limite de précision imposée par la colonne : il n'y a donc plus l'ancien plafond lié à `numeric(10,2)`.

La colonne `featured` permet à l'administration de choisir qui apparaît dans le Top donations.

## Configuration

Dans `config.js`, mets :
- Project URL
- anon/public key

Ne mets jamais la clé `service_role` dans GitHub.

## GitHub Pages

Mets tous les fichiers à la racine du dépôt GitHub puis :
Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Administration

Code de démonstration : `3945`.

Le panel permet :
- d'ajouter un don manuellement ;
- de voir les dons ;
- de mettre/retirer un donateur du Top ;
- de supprimer un don ;
- d'ajouter/supprimer un cheval.

⚠️ Pour un vrai site public, le code 3945 côté JavaScript n'est pas une sécurité suffisante. Il faudra utiliser Supabase Auth + RLS pour protéger les opérations d'administration.

## Paiements réels

Cette version ne collecte aucune donnée bancaire. Pour de vrais dons, il faudra connecter un prestataire de paiement sécurisé plutôt que créer une fausse page bancaire.
