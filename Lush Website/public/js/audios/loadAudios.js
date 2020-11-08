import getAudios from "./getAudios.js";
import loadAudioTemplate from "./loadAudioTemplate.js";
import loadEditAudioWindow from "./editAudioWindow/loadEditAudioWindow.js";

(async () => {
  Promise.all([loadAudioTemplate(), loadEditAudioWindow()]).then((responses) =>
    getAudios(...responses)
  );
})();
