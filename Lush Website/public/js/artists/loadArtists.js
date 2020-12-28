import ArtistsConfigurator from "./getArtists.js";
import loadArtistTemplate from "./loadArtistTemplate.js";

export const loadArtists = async () => {
  Promise.resolve(loadArtistTemplate()).then(
    (artistLi) => new ArtistsConfigurator(artistLi)
  );
};
