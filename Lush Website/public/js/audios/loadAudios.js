import AudiosConfigurator from "./AudiosConfigurator.js";
import loadAudioTemplate from "./loadAudioTemplate.js";
import loadEditAudioWindow from "./editAudioWindow/loadEditAudioWindow.js";
import { resetHeaderStyles } from "../partials/resetHeaderStyles.js";
import EditAudioWindow from "./editAudioWindow/EditAudioWindow.js";

var audiosConfigurator;
var editAudioWindow;

export const loadAudios = async () => {
  const editAudioWindowContainer = document.getElementById(
    "edit-audio-window-container"
  );

  resetHeaderStyles();

  await Promise.all([
    loadAudioTemplate(),
    editAudioWindowContainer || loadEditAudioWindow(),
  ]).then((resolves) => {
    audiosConfigurator = new AudiosConfigurator(resolves[0]);
    editAudioWindowContainer ||
      (editAudioWindow = new EditAudioWindow(resolves[1]));
  });
};

export { audiosConfigurator, editAudioWindow };
