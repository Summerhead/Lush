import EditAudioWindow from "../audios/editAudioWindow/EditAudioWindow.js";
import EditArtistWindow from "../artists/editArtistWindow/EditArtistWindow.js";
import EditPlaylistWindow from "../playlists/editPlaylistWindow/EditPlaylistWindow.js";

var editAudioWindow;
var editArtistWindow;
var editPlaylistWindow;

export function configureEditWindows() {
  if (!editAudioWindow) {
    editAudioWindow = new EditAudioWindow(
      document.getElementById("edit-audio-window-container")
    );
  }
  if (!editArtistWindow) {
    editArtistWindow = new EditArtistWindow(
      document.getElementById("edit-artist-window-container")
    );
  }
  if (!editPlaylistWindow) {
    editPlaylistWindow = new EditPlaylistWindow(
      document.getElementById("edit-playlist-window-container")
    );
  }
}

export { editAudioWindow, editArtistWindow, editPlaylistWindow };
