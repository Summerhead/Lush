import ArtistsConfigurator from "./ArtistsConfigurator.js";
import loadArtistTemplate from "./loadArtistTemplate.js";
import loadEditArtistWindow from "./editArtistWindow/loadEditArtistWindow.js";
import { header } from "../header/loadHeader.js";
import EditArtistWindow from "./editArtistWindow/EditArtistWindow.js";

var artistsConfigurator;
var editArtistWindow;

export const loadArtists = async () => {
  const editArtistWindowContainer = document.getElementById(
    "edit-artist-window-container"
  );

  header.setDefaultStyle();

  await Promise.all([
    loadArtistTemplate(),
    editArtistWindowContainer || loadEditArtistWindow(),
  ]).then((resolves) => {
    artistsConfigurator = new ArtistsConfigurator(resolves[0]);
    editArtistWindowContainer ||
      (editArtistWindow = new EditArtistWindow(resolves[1]));
  });
};

export { artistsConfigurator, editArtistWindow };
