import getArtist from "./getArtist.js";
import loadArtistTemplate from "./loadArtistTemplate.js";

(async () => {
  await Promise.resolve(loadArtistTemplate()).then((artistLi) =>
    getArtist(artistLi)
  );
})();
