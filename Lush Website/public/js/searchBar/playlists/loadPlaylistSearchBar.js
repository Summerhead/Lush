import PlaylistSearchBar from "./playlistSearchBar.js";
import loadPlaylistSearchBarTemplate from "./loadPlaylistSearchBarTemplate.js";

var playlistSearchBar;

export const loadPlaylistSearchBar = () => {
  return new Promise((resolve, reject) => {
    Promise.resolve(loadPlaylistSearchBarTemplate()).then(
      (searchBarContainer) => {
        playlistSearchBar = new PlaylistSearchBar(searchBarContainer);

        resolve(playlistSearchBar);
      }
    );
  });
};

export { playlistSearchBar };
