const fs = require("fs");
const path = require("path");
const { app } = require("./server modules/server.js");

const pagesJSON = JSON.parse(fs.readFileSync("./pages.json"));
for (const [route, object] of Object.entries(pagesJSON)) {
  app.post(route, function (req, res) {
    res.send(object);
  });
  app.get(route, function (req, res) {
    res.sendFile(path.join(__dirname, "/public/html/main.html"));
  });
}

// Routes
const musicRoutes = require("./server modules/routes/music.js");
app.use("/", musicRoutes);

const artistsRoutes = require("./server modules/routes/artists.js");
app.use("/", artistsRoutes);

const genresRoutes = require("./server modules/routes/genres.js");
app.use("/", genresRoutes);

const playlistsRoutes = require("./server modules/routes/playlists.js");
app.use("/", playlistsRoutes);
