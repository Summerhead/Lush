import { loadArtistSearchBar } from "../searchBar/artists/loadArtistSearchBar.js";
import { loadArtists } from "./loadArtists.js";

export default async function loadArtistsPage() {
  await Promise.all([loadArtistSearchBar(), loadArtists()]).then((resolves) => {
    resolves[0].setConfigurator(resolves[1]);
  });
}
