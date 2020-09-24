import parseAudios from "./parseAudio.js";
import loadSongTemplate from "./loadSongTemplate.js";

(async () => {
    await Promise.resolve(loadSongTemplate());
    parseAudios();
})();
