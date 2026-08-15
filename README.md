# DigitalFlow API

DigitalFlow API est une API REST portable destinée à la vente et à la livraison de produits numériques. Le parcours principal est centré sur la création d’une commande, la confirmation d’un paiement simulé et la préparation d’un lien de livraison WhatsApp.

Le projet est conçu pour rester simple, compréhensible et portable. Il fonctionne avec Node.js, le module natif `http` et un fichier local `data.json`. Il ne dépend pas de Manus et n’utilise aucune vraie clé de paiement ou clé WhatsApp.

## Objectifs du projet

DigitalFlow API doit permettre de :

- enregistrer des produits numériques ;
- créer des offres ;
- recevoir des commandes de clients ;
- créer une session de paiement simulée ;
- confirmer un paiement dans le prototype ;
- générer un lien WhatsApp contenant le message de livraison ;
- préparer la remise d’un lien de téléchargement après paiement.

## Technologies utilisées

| Élément | Choix actuel |
|---|---|
| Langage | JavaScript |
| Runtime | Node.js 20 |
| Serveur HTTP | Module natif `http` |
| Dépendances | Aucune dépendance npm obligatoire |
| Stockage du prototype | `data.json` |
| Devise par défaut | XOF |
| Hébergement de test | Replit |
| Sauvegarde du code | GitHub |

## Installation et démarrage

Le projet peut être lancé avec :

```bash
npm start
