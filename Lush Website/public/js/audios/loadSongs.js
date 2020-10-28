import getAudios from "./getAudios.js";
import loadSongTemplate from "./loadSongTemplate.js";

(async () => {
  await Promise.resolve(loadSongTemplate());
  getAudios();
})();
