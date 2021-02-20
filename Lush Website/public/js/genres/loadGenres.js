import GenresConfigurator from "./GenresConfigurator.js";
import { resetHeaderStyles } from "../partials/resetHeaderStyles.js";

var genresConfigurator;

export const loadGenres = async () => {
  const editAudioWindowContainer = document.getElementById(
    "edit-audio-window-container"
  );

  resetHeaderStyles();

  genresConfigurator = new GenresConfigurator();
};

export { genresConfigurator };
