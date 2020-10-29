import getAudios from "./getAudios.js";
import loadAudioTemplate from "./loadAudioTemplate.js";

(async () => {
  await Promise.resolve(loadAudioTemplate());
  getAudios();
})();
