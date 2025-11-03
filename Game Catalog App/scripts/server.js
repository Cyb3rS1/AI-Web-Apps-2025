const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = 3000;
const FRONTEND_ORIGIN = "http://127.0.0.1:5500"; // <-- your app origin

// 🔐 Replace these
const CLIENT_ID = "nvf7jobxc5l9pc0klkf0tg1sqrd930";
const ACCESS_TOKEN = "pea9s96ul6jmqyi4ccw94l8rirq9jh"; // client-credentials token

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, obj) {
  setCORS(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

function serveStatic(req, res) {
  const urlObj = new URL(req.url, `http://127.0.0.1:${PORT}`);
  let filePath = urlObj.pathname === "/" ? "/index.html" : urlObj.pathname;
  filePath = path.join(__dirname, "public", filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      setCORS(res);
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    setCORS(res);
    const ext = path.extname(filePath).toLowerCase();
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function httpsRequest(options, body) {
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (igdbRes) => {
      let data = "";
      igdbRes.on("data", (chunk) => (data += chunk));
      igdbRes.on("end", () => {
        const status = igdbRes.statusCode || 500;
        if (status >= 200 && status < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Bad JSON from IGDB: " + e.message));
          }
        } else {
          reject(new Error(`IGDB ${status}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function igdbQuery(body, category) {

  const options = {
    hostname: "api.igdb.com",
    path: `/v4/${category}`,
    method: "POST",
    headers: {
      "Client-ID": CLIENT_ID,
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "text/plain"
    }
  };

  return await httpsRequest(options, body);
}


async function igdbGamesSearch(query) {

  const body = `
  fields name, summary, first_release_date, platforms.name, genres.name, cover.url, screenshots.url;
  search "${query}";
  limit 20;
  `;

  const results = await igdbQuery(body, "games");
  console.log(JSON.stringify(results, null, 2));
  return results;

}

async function igdbSearchRecent() {
  const body = `
    fields name, summary, first_release_date, platforms.name, genres.name, cover.url;
    sort first_release_date desc;
    limit 10;
  `;

  return await igdbQuery(body, "games");
}

/* async function igdbSearchCharacters() {

  const body = `
  fields name, mug_shot.url, games.name;
  limit 5;
  where mug_shot != null & games != null;
  `;

  return await igdbQuery(body, "characters");

}

(async () => {
  const chars = await igdbSearchCharacters();
  console.log(chars);
})(); */











const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const { pathname } = urlObj;

  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    setCORS(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === "/search" && req.method === "GET") {
    const q = (urlObj.searchParams.get("q") || "").trim();
    if (!q) return sendJson(res, 400, { error: "Missing q" });

    try {
      const results = await igdbGamesSearch(q);
      sendJson(res, 200, results);
    } catch (err) {
      sendJson(res, 502, { error: err.message });
    }
    return;
  }

  if (pathname === "/recent" && req.method === "GET") {
    try {
      const results = await igdbSearchRecent();
      sendJson(res, 200, results);
    } catch (err) {
      sendJson(res, 502, { error: err.message });
    }
    return;
  }

  // everything else: serve static
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`API server on http://127.0.0.1:${PORT}`);
  console.log(`CORS allowed from ${FRONTEND_ORIGIN}`);
});