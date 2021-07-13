import AudiosConfigurator from "./AudiosConfigurator.js";
import loadAudioTemplate from "./loadAudioTemplate.js";
import { header } from "../header/loadHeader.js";

var audiosConfigurator;

export const loadAudios = (audiosOlQuery, isDummy) => {
  return new Promise((resolve, reject) => {
    header.setDefaultStyle();

    Promise.all([loadAudioTemplate()]).then((resolves) => {
      audiosConfigurator = new AudiosConfigurator(
        resolves[0],
        audiosOlQuery,
        isDummy
      );

      resolve(audiosConfigurator);
    });
  });
};

export { audiosConfigurator };
