import AudioSearchBar from "./audioSearchBar.js";
import loadAudioSearchBarTemplate from "./loadAudioSearchBarTemplate.js";

var audioSearchBar;

export const loadAudioSearchBar = (
  searchBarQuery,
  audiosOlQuery,
  isEditing
) => {
  return new Promise((resolve, reject) => {
    Promise.resolve(loadAudioSearchBarTemplate()).then((searchBarContainer) => {
      audioSearchBar = new AudioSearchBar(
        searchBarContainer,
        searchBarQuery,
        audiosOlQuery,
        isEditing
      );

      resolve(audioSearchBar);
    });
  });
};

export { audioSearchBar };
