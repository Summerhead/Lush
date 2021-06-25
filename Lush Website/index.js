const fs = require("fs");
const path = require("path");
const { app } = require("./server_modules/server.js");
const server = require("http").createServer(app);

(function () {
  const ROUTES_DIR = "server_modules/routes";

  // Combine routes
  fs.readdir(ROUTES_DIR, function (error, files) {
    if (error) {
      console.error("Could not list the directory.", error);
      return;
    }

    files.forEach((file) =>
      app.use("/", require(path.join(__dirname, ROUTES_DIR, file)))
    );
  });

  const PAGES_JSON = JSON.parse(fs.readFileSync("pages.json"));
  const MAIN_PAGE_PATH = path.join(__dirname, "public/html/main.html");

  // Configure post and get requests for pages
  for (const [route, object] of Object.entries(PAGES_JSON)) {
    app.get(route, function (_req, res) {
      res.sendFile(MAIN_PAGE_PATH);
    });

    app.post(route, function (_req, res) {
      res.send(object);
    });
  }

  require("dotenv/config");
  // Start Lush server
  server.listen(process.env.SERVER_PORT);
})();
