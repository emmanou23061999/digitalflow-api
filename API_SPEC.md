# Première version de DigitalFlow API

## Parcours principal
1. Créer un produit numérique.
2. Créer une offre et un prix.
3. Créer un paiement de test.
4. Recevoir la confirmation du paiement.
5. Créer la commande.
6. Livrer un lien sécurisé.

## Endpoints prévus
- GET /health : vérifier que l’API fonctionne.
- POST /products : créer un produit.
- GET /products : lister les produits.
- POST /offers : créer une offre.
- POST /checkout-sessions : créer un paiement.
- POST /webhooks/payment : recevoir la confirmation du paiement.
- GET /orders/{id} : consulter une commande.
- GET /deliveries/{id} : obtenir la livraison.
