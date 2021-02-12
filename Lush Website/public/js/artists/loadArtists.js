import ArtistsConfigurator from "./ArtistsConfigurator.js";
import loadArtistTemplate from "./loadArtistTemplate.js";
import loadEditArtistWindow from "./editArtistWindow/loadEditArtistWindow.js";
import { resetHeaderStyles } from "../partials/resetHeaderStyles.js";
import EditArtistWindow from "./editArtistWindow/EditArtistWindow.js";

var artistsConfigurator;
var editArtistWindow;

export const loadArtists = async (href) => {
  const editArtistWindowContainer = document.getElementById(
    "edit-artist-window-container"
  );

  resetHeaderStyles();

  await Promise.all([
    loadArtistTemplate(),
    editArtistWindowContainer || loadEditArtistWindow(),
  ]).then((resolves) => {
    artistsConfigurator = new ArtistsConfigurator(resolves[0], href);
    editArtistWindowContainer ||
      (editArtistWindow = new EditArtistWindow(resolves[1], href));
  });
};

export { artistsConfigurator, editArtistWindow };
