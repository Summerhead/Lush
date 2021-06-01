import AudioSearchBar from "./audioSearchBar.js";
import loadAudioSearchBarTemplate from "./loadAudioSearchBarTemplate.js";

var audioSearchBar;

export const loadAudioSearchBar = async (
  searchBarQuery,
  audioOlQuery,
  isEditing
) => {
  await Promise.resolve(loadAudioSearchBarTemplate()).then(
    (searchBarContainer) =>
      (audioSearchBar = new AudioSearchBar(
        searchBarContainer,
        searchBarQuery,
        audioOlQuery,
        isEditing
      ))
  );
};

export { audioSearchBar };
