import GenresConfigurator from "./GenresConfigurator.js";
import { header } from "../header/loadHeader.js";

var genresConfigurator;

export const loadGenres = async () => {
  const editAudioWindowContainer = document.getElementById(
    "edit-audio-window-container"
  );

  header.setDefaultStyle();

  genresConfigurator = new GenresConfigurator();
};

export { genresConfigurator };
