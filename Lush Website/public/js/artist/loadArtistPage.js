import { loadAudioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";
import { loadArtist } from "./loadArtist.js";
import { loadAudios } from "../audios/loadAudios.js";

export default async function loadArtistPage() {
  await Promise.all([loadAudioSearchBar(), loadAudios(), loadArtist()]).then(
    (resolves) => {
      resolves[0].setConfigurator(resolves[1]);
    }
  );
}
