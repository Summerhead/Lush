import AudioSearchBar from "./audioSearchBar.js";
import loadAudioSearchBarTemplate from "./loadAudioSearchBarTemplate.js";

var audioSearchBar;

export const loadAudioSearchBar = async () => {
  await Promise.resolve(loadAudioSearchBarTemplate()).then(
    (searchBarContainer) =>
      (audioSearchBar = new AudioSearchBar(searchBarContainer))
  );
};

export { audioSearchBar };
