import ArtistsConfigurator from "./ArtistsConfigurator.js";
import loadArtistTemplate from "./loadArtistTemplate.js";
import loadEditArtistWindow from "./editArtistWindow/loadEditArtistWindow.js";
import { header } from "../header/loadHeader.js";

var artistsConfigurator;

export const loadArtists = () => {
  return new Promise((resolve, reject) => {
    header.setDefaultStyle();

    Promise.all([loadArtistTemplate()]).then((resolves) => {
      artistsConfigurator = new ArtistsConfigurator(resolves[0]);

      resolve(artistsConfigurator);
    });
  });
};

export { artistsConfigurator };
