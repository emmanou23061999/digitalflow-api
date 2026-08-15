const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(content);

    return {
      products: Array.isArray(data.products) ? data.products : [],
      offers: Array.isArray(data.offers) ? data.offers : [],
      orders: Array.isArray(data.orders) ? data.orders : []
    };
  } catch (error) {
    return { products: [], offers: [], orders: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('JSON invalide'));
      }
    });

    req.on('error', reject);
  });
}

function nextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

const server = http.createServer(async (req, res) => {
  const method = req.method;
  const url = req.url.split('?')[0];
  const data = loadData();

  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (method === 'GET' && url === '/health') {
    sendJson(res, 200, {
      success: true,
      message: 'DigitalFlow API fonctionne'
    });
    return;
  }

  if (method === 'GET' && url === '/products') {
    sendJson(res, 200, { success: true, data: data.products });
    return;
  }

  if (method === 'POST' && url === '/products') {
    try {
      const body = await readBody(req);
      const product = {
        id: nextId(data.products),
        name: body.name || 'Produit sans nom',
        description: body.description || '',
        price: Number(body.price) || 0,
        currency: body.currency || 'XOF',
        downloadUrl: body.downloadUrl || '',
        createdAt: new Date().toISOString()
      };

      data.products.push(product);
      saveData(data);
      sendJson(res, 201, { success: true, data: product });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Données du produit invalides'
      });
    }
    return;
  }

  if (method === 'GET' && url === '/offers') {
    sendJson(res, 200, { success: true, data: data.offers });
    return;
  }

  if (method === 'POST' && url === '/offers') {
    try {
      const body = await readBody(req);
      const offer = {
        id: nextId(data.offers),
        name: body.name || 'Offre sans nom',
        description: body.description || '',
        price: Number(body.price) || 0,
        currency: body.currency || 'XOF',
        productIds: Array.isArray(body.productIds) ? body.productIds : [],
        createdAt: new Date().toISOString()
      };

      data.offers.push(offer);
      saveData(data);
      sendJson(res, 201, { success: true, data: offer });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Données de l’offre invalides'
      });
    }
    return;
  }

  if (method === 'GET' && url === '/orders') {
    sendJson(res, 200, { success: true, data: data.orders });
    return;
  }

  if (method === 'POST' && url === '/orders') {
    try {
      const body = await readBody(req);
      const order = {
        id: nextId(data.orders),
        customerName: body.customerName || body.name || 'Client',
        customerPhone: body.customerPhone || body.phone || '',
        productId: body.productId || null,
        offerId: body.offerId || null,
        amount: Number(body.amount ?? body.price) || 0,
        currency: body.currency || 'XOF',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      data.orders.push(order);
      saveData(data);
      sendJson(res, 201, { success: true, data: order });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Données de la commande invalides'
      });
    }
    return;
  }

  if (method === 'POST' && url === '/checkout-sessions') {
    try {
      const body = await readBody(req);
      const orderId = Number(body.orderId);

      if (!orderId) {
        sendJson(res, 400, {
          success: false,
          error: 'orderId est obligatoire'
        });
        return;
      }

      const order = data.orders.find((item) => Number(item.id) === orderId);

      if (!order) {
        sendJson(res, 404, {
          success: false,
          error: 'Commande introuvable'
        });
        return;
      }

      const paymentReference = `PAY-${order.id}-${Date.now()}`;
      const amount = order.amount ?? order.price ?? 0;

      order.paymentReference = paymentReference;
      order.paymentStatus = 'pending';
      order.paymentUrl = `https://digitalflow.test/pay/${paymentReference}`;
      saveData(data);

      sendJson(res, 201, {
        success: true,
        data: {
          orderId: order.id,
          amount: amount,
          currency: order.currency || 'XOF',
          paymentReference: paymentReference,
          paymentUrl: order.paymentUrl,
          status: 'pending'
        }
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Données de paiement invalides'
      });
    }
    return;
  }

  if (method === 'POST' && url === '/checkout-sessions/confirm') {
    try {
      const body = await readBody(req);
      const orderId = Number(body.orderId);
      const paymentReference = body.paymentReference;

      const order = data.orders.find((item) => {
        const sameId = orderId && Number(item.id) === orderId;
        const sameReference = paymentReference && item.paymentReference === paymentReference;
        return sameId || sameReference;
      });

      if (!order) {
        sendJson(res, 404, {
          success: false,
          error: 'Commande ou référence de paiement introuvable'
        });
        return;
      }

      order.paymentStatus = 'paid';
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      saveData(data);

      sendJson(res, 200, {
        success: true,
        message: 'Votre paiement a été effectué avec succès',
        data: order
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Données de confirmation invalides'
      });
    }
    return;
  }

  if (method === 'POST' && url === '/deliveries/whatsapp') {
    try {
      const body = await readBody(req);
      const orderId = Number(body.orderId);
      const order = data.orders.find((item) => Number(item.id) === orderId);

      if (!order) {
        sendJson(res, 404, {
          success: false,
          error: 'Commande introuvable'
        });
        return;
      }

      if (order.status !== 'paid' && order.paymentStatus !== 'paid') {
        sendJson(res, 400, {
          success: false,
          error: 'Le paiement doit être confirmé avant la livraison'
        });
        return;
      }

      const product = data.products.find((item) => {
        return Number(item.id) === Number(order.productId);
      });

      const downloadUrl = product && product.downloadUrl
        ? product.downloadUrl
        : `https://digitalflow.test/download/order-${order.id}`;

      const message = `Bonjour ${order.customerName || 'cher client'}, votre paiement a été confirmé. Voici votre lien de téléchargement : ${downloadUrl}`;
      const encodedMessage = encodeURIComponent(message);
      const phone = String(order.customerPhone || '').replace(/[^0-9]/g, '');
      const whatsappUrl = phone
        ? `https://wa.me/${phone}?text=${encodedMessage}`
        : `https://wa.me/?text=${encodedMessage}`;

      order.deliveryStatus = 'ready';
      order.deliveryChannel = 'whatsapp';
      order.downloadUrl = downloadUrl;
      order.whatsappUrl = whatsappUrl;
      saveData(data);

      sendJson(res, 200, {
        success: true,
        message: 'Lien WhatsApp de livraison créé',
        data: {
          orderId: order.id,
          deliveryStatus: order.deliveryStatus,
          downloadUrl: downloadUrl,
          whatsappUrl: whatsappUrl,
          message: message
        }
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Données de livraison invalides'
      });
    }
    return;
  }

  sendJson(res, 404, {
    success: false,
    error: 'Route non trouvée'
  });
});

server.listen(PORT, () => {
  console.log(`DigitalFlow API démarrée sur le port ${PORT}`);
});
