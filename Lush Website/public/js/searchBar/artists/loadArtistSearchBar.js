import ArtistSearchBar from "./artistSearchBar.js";
import loadArtistSearchBarTemplate from "./loadArtistSearchBarTemplate.js";

export const loadArtistSearchBar = async () => {
  await Promise.resolve(loadArtistSearchBarTemplate()).then(
    (searchBarContainer) => new ArtistSearchBar(searchBarContainer)
  );
};
