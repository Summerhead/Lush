import AudioSearchBar from "./audioSearchBar.js";
import loadAudioSearchBarTemplate from "./loadAudioSearchBarTemplate.js";

var audioSearchBar;

export const loadAudioSearchBar = async (
  searchBarQuery,
  audiosOlQuery,
  isEditing
) => {
  await Promise.resolve(loadAudioSearchBarTemplate()).then(
    (searchBarContainer) =>
      (audioSearchBar = new AudioSearchBar(
        searchBarContainer,
        searchBarQuery,
        audiosOlQuery,
        isEditing
      ))
  );
};

export { audioSearchBar };
