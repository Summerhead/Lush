import { loadAudioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";
import { loadAudios } from "./loadAudios.js";

export default async function loadAudiosPage(
  audiosOlQuery,
  isDummy,
  searchBarQuery,
  isEditing
) {
  await Promise.all([
    loadAudioSearchBar(searchBarQuery, audiosOlQuery, isEditing),
    loadAudios(audiosOlQuery, isDummy),
  ]).then((resolves) => {
    resolves[0].setConfigurator(resolves[1]);
  });
}
