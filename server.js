const http = require("http");

const PORT = process.env.PORT || 3000;
const products = [];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON invalide"));
      }
    });

    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      success: true,
      service: "digitalflow-api",
      status: "ok"
    });
    return;
  }

  if (req.method === "GET" && req.url === "/products") {
    sendJson(res, 200, {
      success: true,
      data: products
    });
    return;
  }

  if (req.method === "POST" && req.url === "/products") {
    try {
      const body = await readBody(req);

      if (!body.name || !body.description || !body.deliveryType) {
        sendJson(res, 400, {
          success: false,
          error: "name, description et deliveryType sont obligatoires"
        });
        return;
      }

      const product = {
        id: String(products.length + 1),
        name: body.name,
        description: body.description,
        deliveryType: body.deliveryType,
        createdAt: new Date().toISOString()
      };

      products.push(product);
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

  sendJson(res, 404, {
    success: false,
    error: "Route non trouvée"
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`DigitalFlow API démarrée sur le port ${PORT}`);
});
