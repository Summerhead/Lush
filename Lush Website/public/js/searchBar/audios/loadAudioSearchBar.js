import AudioSearchBar from "./audioSearchBar.js";
import loadAudioSearchBarTemplate from "./loadAudioSearchBarTemplate.js";

export const loadAudioSearchBar = async () => {
  await Promise.resolve(loadAudioSearchBarTemplate()).then(
    (searchBarContainer) => new AudioSearchBar(searchBarContainer)
  );
};
