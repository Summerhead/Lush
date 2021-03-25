import PlaylistsConfigurator from "./PlaylistsConfigurator.js";
import loadPlaylistTemplate from "./loadPlaylistTemplate.js";
import loadEditArtistWindow from "./editPlaylistWindow/loadEditPlaylistWindow.js";
import { header } from "../header/loadHeader.js";
import EditPlaylistWindow from "./editPlaylistWindow/EditPlaylistWindow.js";

var playlistsConfigurator;
var editPlaylistWindow;

export const loadPlaylists = async () => {
  const editPlaylistWindowContainer = document.getElementById(
    "edit-playlist-window-container"
  );

  header.setDefaultStyle();

  await Promise.all([
    loadPlaylistTemplate(),
    editPlaylistWindowContainer || loadEditArtistWindow(),
  ]).then((resolves) => {
    playlistsConfigurator = new PlaylistsConfigurator(resolves[0]);
    editPlaylistWindowContainer ||
      (editPlaylistWindow = new EditPlaylistWindow(resolves[1]));
  });
};

export { playlistsConfigurator, editPlaylistWindow };
