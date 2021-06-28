import { artistsConfigurator } from "../../artists/loadArtists.js";
import { editArtistWindow } from "../../artists/loadArtists.js";
import SearchBar from "../searchBar.js";

export default class ArtistSearchBar extends SearchBar {
  constructor(searchBarContainer) {
    super(searchBarContainer, editArtistWindow, artistsConfigurator);

    this.configure();
    this.display();
  }
}
