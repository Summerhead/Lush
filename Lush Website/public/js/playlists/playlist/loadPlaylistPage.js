import { loadAudioSearchBar } from "../../searchBar/audios/loadAudioSearchBar.js";
import { loadAudios } from "../../audios/loadAudios.js";

export default async function loadPlaylistPage() {
  await Promise.all([loadAudioSearchBar(), loadAudios()]).then((resolves) => {
    resolves[0].setConfigurator(resolves[1]);
  });
}
