const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = { products: [], offers: [], orders: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(content || '{}');

    return {
      products: Array.isArray(data.products) ? data.products : [],
      offers: Array.isArray(data.offers) ? data.offers : [],
      orders: Array.isArray(data.orders) ? data.orders : []
    };
  } catch (error) {
    console.error('Erreur de lecture de data.json:', error.message);
    return { products: [], offers: [], orders: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
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
  const url = (req.url || '/').split('?')[0];
  const data = loadData();

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (method === 'GET' && url === '/health') {
    sendJson(res, 200, {
      success: true,
      message: 'DigitalFlow API fonctionne correctement'
    });
    return;
  }

  if (method === 'GET' && url === '/products') {
    sendJson(res, 200, {
      success: true,
      data: data.products
    });
    return;
  }

  if (method === 'GET' && url.startsWith('/products/')) {
    const id = Number(url.split('/')[2]);
    const product = data.products.find((item) => Number(item.id) === id);

    if (!product) {
      sendJson(res, 404, {
        success: false,
        error: 'Produit introuvable'
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: product
    });
    return;
  }

  if (method === 'POST' && url === '/products') {
    try {
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const description = String(body.description || '').trim();
      const price = Number(body.price);

      if (!name || !description || !Number.isFinite(price) || price <= 0) {
        sendJson(res, 400, {
          success: false,
          error: 'name, description et un price supérieur à 0 sont obligatoires'
        });
        return;
      }

      const product = {
        id: nextId(data.products),
        name,
        description,
        price,
        currency: body.currency || 'XOF',
        createdAt: new Date().toISOString()
      };

      data.products.push(product);
      saveData(data);

      sendJson(res, 201, {
        success: true,
        data: product
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message
      });
    }
    return;
  }

  if (method === 'GET' && url === '/offers') {
    sendJson(res, 200, {
      success: true,
      data: data.offers
    });
    return;
  }

  if (method === 'GET' && url.startsWith('/offers/')) {
    const id = Number(url.split('/')[2]);
    const offer = data.offers.find((item) => Number(item.id) === id);

    if (!offer) {
      sendJson(res, 404, {
        success: false,
        error: 'Offre introuvable'
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: offer
    });
    return;
  }

  if (method === 'POST' && url === '/offers') {
    try {
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const description = String(body.description || '').trim();
      const price = Number(body.price);
      const productIds = Array.isArray(body.productIds) ? body.productIds : [];

      if (!name || !description || !Number.isFinite(price) || price <= 0 || productIds.length === 0) {
        sendJson(res, 400, {
          success: false,
          error: 'name, description, un price supérieur à 0 et au moins un productId sont obligatoires'
        });
        return;
      }

      const offer = {
        id: nextId(data.offers),
        name,
        description,
        price,
        currency: body.currency || 'XOF',
        productIds,
        createdAt: new Date().toISOString()
      };

      data.offers.push(offer);
      saveData(data);

      sendJson(res, 201, {
        success: true,
        data: offer
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message
      });
    }
    return;
  }

  if (method === 'GET' && url === '/orders') {
    sendJson(res, 200, {
      success: true,
      data: data.orders
    });
    return;
  }

  if (method === 'GET' && url.startsWith('/orders/')) {
    const id = Number(url.split('/')[2]);
    const order = data.orders.find((item) => Number(item.id) === id);

    if (!order) {
      sendJson(res, 404, {
        success: false,
        error: 'Commande introuvable'
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: order
    });
    return;
  }

  if (method === 'POST' && url === '/orders') {
    try {
      const body = await readBody(req);

      if (!body.customerName || body.amount === undefined || body.amount === null || body.amount === '') {
        sendJson(res, 400, {
          success: false,
          error: 'customerName et amount sont obligatoires'
        });
        return;
      }

      const order = {
        id: nextId(data.orders),
        customerName: body.customerName,
        customerPhone: body.customerPhone || '',
        productId: body.productId || null,
        offerId: body.offerId || null,
        amount: Number(body.amount),
        currency: body.currency || 'XOF',
        status: 'pending',
        paymentReference: null,
        whatsappUrl: null,
        deliveryStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      data.orders.push(order);
      saveData(data);

      sendJson(res, 201, {
        success: true,
        data: order
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message
      });
    }
    return;
  }

  if (method === 'POST' && url === '/checkout-sessions') {
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

      const paymentReference = `PAY-${order.id}-${Date.now()}`;
      order.paymentReference = paymentReference;
      order.status = 'payment_pending';
      saveData(data);

      sendJson(res, 201, {
        success: true,
        message: 'Session de paiement simulée créée',
        data: {
          orderId: order.id,
          paymentReference,
          amount: order.amount,
          currency: order.currency,
          status: order.status
        }
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message
      });
    }
    return;
  }

  if (method === 'POST' && url === '/checkout-sessions/confirm') {
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

      order.status = 'paid';
      order.paymentReference = body.paymentReference || order.paymentReference || `PAY-${order.id}-${Date.now()}`;
      saveData(data);

      sendJson(res, 200, {
        success: true,
        message: 'Paiement confirmé avec succès',
        data: order
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message
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

      const phone = String(body.phone || order.customerPhone || '').replace(/[^0-9]/g, '');
      const message = body.message || `Bonjour ${order.customerName}, votre paiement a été confirmé avec succès. Voici votre lien de livraison DigitalFlow.`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      order.whatsappUrl = whatsappUrl;
      order.deliveryStatus = 'ready';
      saveData(data);

      sendJson(res, 200, {
        success: true,
        message: 'Lien WhatsApp de livraison généré',
        data: {
          orderId: order.id,
          whatsappUrl,
          deliveryStatus: order.deliveryStatus
        }
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message
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
