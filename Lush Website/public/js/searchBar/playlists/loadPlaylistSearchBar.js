import PlaylistSearchBar from "./playlistSearchBar.js";
import loadPlaylistSearchBarTemplate from "./loadPlaylistSearchBarTemplate.js";

export const loadPlaylistSearchBar = async () => {
  await Promise.resolve(loadPlaylistSearchBarTemplate()).then(
    (searchBarContainer) => new PlaylistSearchBar(searchBarContainer)
  );
};
