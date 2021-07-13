import SearchBar from "../searchBar.js";

export default class ArtistSearchBar extends SearchBar {
  constructor(searchBarContainer) {
    super(searchBarContainer);

    this.configure();
    this.display();
  }
}
