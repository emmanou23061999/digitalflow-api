const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      service: "digitalflow-api",
      status: "ok"
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: "Route non trouvée"
  }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`DigitalFlow API démarrée sur le port ${PORT}`);
});
