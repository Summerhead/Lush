import SearchBar from "../searchBar.js";

export default class PlaylistSearchBar extends SearchBar {
  constructor(searchBarContainer) {
    super(searchBarContainer);

    this.configure();
    this.display();
  }
}
