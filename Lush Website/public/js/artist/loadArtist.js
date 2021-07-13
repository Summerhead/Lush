import ArtistConfigurator from "./ArtistConfigurator.js";
// import loadArtistTemplate from "./loadArtistTemplate.js";

var artistConfigurator;

export const loadArtist = () => {
  return new Promise((resolve, reject) => {
    artistConfigurator = new ArtistConfigurator();

    resolve(artistConfigurator);
  });
};

export { artistConfigurator };
