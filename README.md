# DigitalFlow API

DigitalFlow API est une API REST portable destinée à la vente et à la livraison de produits numériques. Le parcours principal est centré sur la création d’une commande, la confirmation d’un paiement simulé et la préparation d’un lien de livraison WhatsApp.

Le projet reste simple, compréhensible et portable. Il fonctionne avec Node.js, le module natif `http` et un fichier local `data.json`. Il ne dépend pas de Manus et n’utilise aucune vraie clé de paiement ou clé WhatsApp.

## Objectifs

DigitalFlow API permet d’enregistrer des produits, de créer des offres, de recevoir des commandes, de simuler un paiement, de confirmer ce paiement et de préparer un lien WhatsApp contenant les informations de livraison.

## Technologies

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

## Démarrage

```bash
### GET /products/:id

Consulte un seul produit à partir de son identifiant.

```bash
curl http://localhost:3000/products/1
t
