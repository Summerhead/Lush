import AudiosConfigurator from "./getAudios.js";
import loadAudioTemplate from "./loadAudioTemplate.js";
import loadEditAudioWindow from "./editAudioWindow/loadEditAudioWindow.js";

export const loadAudios = async () => {
  Promise.all([loadAudioTemplate(), loadEditAudioWindow()]).then(
    (resolves) => new AudiosConfigurator(resolves[0])
  );
};
