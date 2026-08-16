# DigitalFlow API

DigitalFlow API est une API REST portable destinée à la vente et à la livraison de produits numériques. Le parcours principal est centré sur WhatsApp : création d’un produit ou d’une offre, enregistrement d’une commande, paiement simulé, confirmation du paiement et génération d’un lien de livraison WhatsApp.

Le projet est construit en Node.js avec le module HTTP natif. Il ne nécessite aucune dépendance npm obligatoire et utilise `data.json` comme stockage persistant pour le prototype.

## Caractéristiques du prototype

| Élément | Technologie ou valeur |
|---|---|
| Langage | Node.js |
| Version d’exécution | Node.js 20 |
| Serveur HTTP | Module natif `http` |
| Dépendances | Aucune dépendance npm obligatoire |
| Stockage du prototype | `data.json` |
| Devise par défaut | XOF |
| Hébergement de test | Replit |
| Sauvegarde du code | GitHub |

## Démarrage

Pour démarrer l’API, exécuter :

```bash
npm start

Le serveur démarre normalement sur le port 
3000 et affiche :
DigitalFlow API démarrée sur le port 3000
Routes disponibles
GET /health
Vérifie que l’API fonctionne correctement.
curl http://localhost:3000/health
GET /products
Retourne la liste de tous les produits.
curl http://localhost:3000/products
GET /products/:id
Consulte un seul produit à partir de son identifiant.
curl http://localhost:3000/products/1
Si l’identifiant n’existe pas, l’API renvoie 
Produit introuvable .
POST /products
Crée un nouveau produit.
Les champs obligatoires sont :
Champ Règle
name Nom non vide
description Description non vide
price Nombre supérieur à 0
currency Facultatif ; valeur par défaut : XOF
Exemple valide :
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" --data "{\"name\":\"Guide WhatsApp\",\"description\":\"Guide numérique pour vendre avec WhatsApp\",\"price\":5000,\"currency\":\"XOF\"}"
Si name , description
 ou un prix supérieur à 0
 manque, l’API refuse la demande avec le message :
name, description et un price supérieur à 0 sont obligatoires
GET /offers
Retourne la liste de toutes les offres.
curl http://localhost:3000/offers
GET /offers/:id
Consulte une seule offre à partir de son identifiant.
curl http://localhost:3000/offers/1
Si l’identifiant n’existe pas, l’API renvoie 
Offre introuvable .
POST /offers
Crée une nouvelle offre.
Les champs obligatoires sont :
Champ Règle
name Nom non vide
description Description non vide
price Nombre supérieur à 0
productIds Tableau contenant au moins un identifiant de produit
currency Facultatif ; valeur par défaut : XOF
Exemple valide :
curl -X POST http://localhost:3000/offers -H "Content-Type: application/json" --data "{\"name\":\"Offre Premium WhatsApp\",\"description\":\"Accès complet à la formation digitale\",\"price\":15000,\"currency\":\"XOF\",\"productIds\":[1]}"
Si le nom, la description, un prix supérieur à 
0 ou au moins un productId
 manque, l’API refuse la demande avec le message :
name, description, un price supérieur à 0 et au moins un productId sont obligatoires
GET /orders
Retourne la liste de toutes les commandes.
curl http://localhost:3000/orders
GET /orders/:id
Consulte une seule commande à partir de son identifiant.
curl http://localhost:3000/orders/1
POST /orders
Crée une nouvelle commande.
Les champs customerName et amount
 sont obligatoires.
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" --data "{\"customerName\":\"Client test\",\"customerPhone\":\"2250700000000\",\"productId\":1,\"amount\":5000,\"currency\":\"XOF\"}"
POST /checkout-sessions
Crée une session de paiement simulée pour une commande existante.
curl -X POST http://localhost:3000/checkout-sessions -H "Content-Type: application/json" --data "{\"orderId\":1}"
La réponse contient une référence simulée au format 
PAY-... et le statut payment_pending .
POST /checkout-sessions/confirm
Confirme le paiement simulé d’une commande.
curl -X POST http://localhost:3000/checkout-sessions/confirm -H "Content-Type: application/json" --data "{\"orderId\":1}"
Après confirmation, le statut de la commande devient 
paid .
POST /deliveries/whatsapp
Génère un lien WhatsApp de livraison pour une commande existante.
curl -X POST http://localhost:3000/deliveries/whatsapp -H "Content-Type: application/json" --data "{\"orderId\":1,\"phone\":\"2250700000000\"}"
La réponse contient un lien wa.me
 et le statut de livraison ready .
Stockage
Les données du prototype sont conservées dans 
data.json
. Le fichier contient trois tableaux : products
, offers et orders .
Le stockage par fichier est adapté aux tests et à la démonstration. Pour une utilisation réelle, il devra être remplacé par une base de données avec sauvegardes, contrôle d’accès et gestion des erreurs adaptée à la production.
Sécurité
Aucune clé secrète, aucun mot de passe et aucun code reçu par SMS ne doit être ajouté dans le dépôt GitHub. Les futures clés de paiement et les identifiants de l’API WhatsApp devront être placés dans des variables d’environnement sur la plateforme d’hébergement.
Le paiement utilisé actuellement est uniquement simulé. Le lien WhatsApp généré est également un prototype ; l’intégration officielle WhatsApp Business API sera ajoutée plus tard avec des identifiants sécurisés.
Sauvegarde et portabilité
Le dépôt GitHub constitue la sauvegarde permanente du code. Le projet peut être repris sur Replit, en local ou avec un autre assistant, à condition de conserver 
server.js , data.json , package.json , 
.replit , README.md et openapi.yaml .
Prochaines améliorations
Les prochaines améliorations prévues sont l’intégration d’un vrai fournisseur de paiement, l’intégration de WhatsApp Business API, le remplacement de 
data.json
 par une véritable base de données et l’ajout de contrôles de sécurité adaptés à la production.
