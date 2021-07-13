import PlaylistsConfigurator from "./PlaylistsConfigurator.js";
import loadPlaylistTemplate from "./loadPlaylistTemplate.js";
import loadEditArtistWindow from "./editPlaylistWindow/loadEditPlaylistWindow.js";
import { header } from "../header/loadHeader.js";
import EditPlaylistWindow from "./editPlaylistWindow/EditPlaylistWindow.js";
import loadAudioTemplate from "../audios/loadAudioTemplate.js";
import { loadAudioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";

var playlistsConfigurator;
var editPlaylistWindow;

export const loadPlaylists = () => {
  return new Promise((resolve, reject) => {
    const editPlaylistWindowContainer = document.getElementById(
      "edit-playlist-window-container"
    );

    header.setDefaultStyle();

    Promise.all([
      loadPlaylistTemplate(),
      editPlaylistWindowContainer || loadEditArtistWindow(),
      loadAudioTemplate(),
    ]).then((resolves) => {
      playlistsConfigurator = new PlaylistsConfigurator(resolves[0]);
      editPlaylistWindowContainer ||
        (editPlaylistWindow = new EditPlaylistWindow(resolves[1], resolves[2]));

      resolve(playlistsConfigurator);
    });
  });
};

export { playlistsConfigurator, editPlaylistWindow };
