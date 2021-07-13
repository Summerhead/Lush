import { loadPlaylistSearchBar } from "../searchBar/playlists/loadPlaylistSearchBar.js";
import { loadPlaylists } from "./loadPlaylists.js";

export default async function loadPlaylistsPage() {
  await Promise.all([loadPlaylistSearchBar(), loadPlaylists()]).then(
    (resolves) => {
      resolves[0].setConfigurator(resolves[1]);
    }
  );
}
