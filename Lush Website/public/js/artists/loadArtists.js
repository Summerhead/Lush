import getArtists from "./getArtists.js";
import loadArtistTemplate from "./loadArtistTemplate.js";

(async () => {
  await Promise.resolve(loadArtistTemplate()).then((artistLi) =>
    getArtists(artistLi)
  );
})();
