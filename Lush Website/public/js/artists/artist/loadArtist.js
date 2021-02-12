import ArtistConfigurator from "./ArtistConfigurator.js";
import loadArtistTemplate from "./loadArtistTemplate.js";
// import { pushState } from "../../partials/loadContent.js";

export const loadArtist = async (href) => {
  await Promise.resolve(loadArtistTemplate()).then(
    (artistLi) => new ArtistConfigurator(artistLi)
  );

  // pushState(href);
};
