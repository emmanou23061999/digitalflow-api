const http = require("http");
const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "data.json");

function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return {
      products: Array.isArray(data.products) ? data.products : [],
      offers: Array.isArray(data.offers) ? data.offers : [],
      orders: Array.isArray(data.orders) ? data.orders : []
    };
  } catch (error) {
    return { products: [], offers: [], orders: [] };
  }
}

let database = loadData();

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function readBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      callback(null, JSON.parse(body));
    } catch (error) {
      callback(new Error("JSON invalide"), null);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      success: true,
      service: "digitalflow-api",
      status: "ok"
    });
    return;
  }

  if (req.method === "GET" && req.url === "/products") {
    sendJson(res, 200, { success: true, data: database.products });
    return;
  }

  if (req.method === "POST" && req.url === "/products") {
    readBody(req, (error, data) => {
      if (error) {
        sendJson(res, 400, { success: false, error: "JSON invalide" });
        return;
      }
      if (!data.name || data.price === undefined) {
        sendJson(res, 400, {
          success: false,
          error: "name et price sont obligatoires"
        });
        return;
      }
      const product = {
        id: database.products.length + 1,
        name: data.name,
        description: data.description || "",
        price: data.price,
        currency: data.currency || "XOF",
        createdAt: new Date().toISOString()
      };
      database.products.push(product);
      saveData();
      sendJson(res, 201, { success: true, data: product });
    });
    return;
  }

  if (req.method === "GET" && req.url === "/offers") {
    sendJson(res, 200, { success: true, data: database.offers });
    return;
  }

  if (req.method === "POST" && req.url === "/offers") {
    readBody(req, (error, data) => {
      if (error) {
        sendJson(res, 400, { success: false, error: "JSON invalide" });
        return;
      }
      if (!data.name || data.price === undefined) {
        sendJson(res, 400, {
          success: false,
          error: "name et price sont obligatoires"
        });
        return;
      }
      const offer = {
        id: database.offers.length + 1,
        name: data.name,
        description: data.description || "",
        price: data.price,
        currency: data.currency || "XOF",
        productId: data.productId || null,
        createdAt: new Date().toISOString()
      };
      database.offers.push(offer);
      saveData();
      sendJson(res, 201, { success: true, data: offer });
    });
    return;
  }

  if (req.method === "GET" && req.url === "/orders") {
    sendJson(res, 200, { success: true, data: database.orders });
    return;
  }

  if (req.method === "POST" && req.url === "/orders") {
    readBody(req, (error, data) => {
      if (error) {
        sendJson(res, 400, { success: false, error: "JSON invalide" });
        return;
      }
      if (!data.offerId || !data.customerName) {
        sendJson(res, 400, {
          success: false,
          error: "offerId et customerName sont obligatoires"
        });
        return;
      }
      const order = {
        id: database.orders.length + 1,
        offerId: data.offerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        amount: data.amount || 0,
        currency: data.currency || "XOF",
        status: "pending",
        paymentStatus: "pending",
        deliveryStatus: "pending",
        createdAt: new Date().toISOString()
      };
      database.orders.push(order);
      saveData();
      sendJson(res, 201, { success: true, data: order });
    });
    return;
  }

  sendJson(res, 404, {
    success: false,
    error: "Route non trouvée"
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`DigitalFlow API démarrée sur le port ${PORT}`);
});

