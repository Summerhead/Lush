import ArtistConfigurator from "./ArtistConfigurator.js";
// import loadArtistTemplate from "./loadArtistTemplate.js";

var artistConfigurator;

export const loadArtist = () => {
  artistConfigurator = new ArtistConfigurator();
};

export { artistConfigurator };
