import ArtistSearchBar from "./artistSearchBar.js";
import loadArtistSearchBarTemplate from "./loadArtistSearchBarTemplate.js";

var artistSearchBar;

export const loadArtistSearchBar = () => {
  return new Promise((resolve, reject) => {
    Promise.resolve(loadArtistSearchBarTemplate()).then(
      (searchBarContainer) => {
        artistSearchBar = new ArtistSearchBar(searchBarContainer);

        resolve(artistSearchBar);
      }
    );
  });
};

export { artistSearchBar };
