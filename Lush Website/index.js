const fs = require("fs");
const path = require("path");
const { app } = require("./server modules/server.js");

const pagesJSON = JSON.parse(fs.readFileSync("./pages.json"));
const mainPagePath = path.join(__dirname, "/public/html/main.html");
for (const [route, object] of Object.entries(pagesJSON)) {
  app.post(route, function (_req, res) {
    res.send(object);
  });
  app.get(route, function (_req, res) {
    res.sendFile(mainPagePath);
  });
}

// Routes
const routesDir = "./server modules/routes";
fs.readdir(routesDir, function (error, files) {
  if (error) {
    console.error("Could not list the directory.", error);
  }

  files.forEach(function (file) {
    app.use("/", require(path.join(__dirname, routesDir, file)));
  });
});
