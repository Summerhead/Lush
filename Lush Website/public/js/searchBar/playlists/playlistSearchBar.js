import { playlistsConfigurator } from "../../playlists/loadPlaylists.js";
import { editPlaylistWindow } from "../../playlists/loadPlaylists.js";
import SearchBar from "../searchBar.js";

export default class PlaylistSearchBar extends SearchBar {
  constructor(searchBarContainer) {
    super(searchBarContainer, editPlaylistWindow, playlistsConfigurator);

    this.configure();
    this.display();
  }
}
