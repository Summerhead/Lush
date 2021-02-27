import { playlistsConfigurator } from "../../playlists/loadPlaylists.js";
import { editPlaylistWindow } from "../../playlists/loadPlaylists.js";
import { lushURL } from "../../partials/loadContent.js";

export default class PlaylistSearchBar {
  constructor(searchBarContainer) {
    this.searchBarContainer = searchBarContainer;
    this.searchBar = searchBarContainer.querySelector("#search-bar");
    this.searchButton = searchBarContainer.querySelector("#search-playlist");
    this.addButton = searchBarContainer.querySelector("#add-playlist");

    this.playlists = document.getElementById("playlists-ol");
    this.alphaNumericKeyCodes = /^[a-z0-9]+$/i;

    this.addSearchAction();
    this.insertSearchQuery();
    this.addAddAction();
    this.displaySearchBar();
  }

  addSearchAction() {
    this.searchButton.addEventListener("click", this.sendSearchRequest);

    this.searchBar.addEventListener("focus", () =>
      window.addEventListener("keyup", this.sendSearchRequest)
    );

    this.searchBar.addEventListener("blur", () =>
      window.removeEventListener("keyup", this.sendSearchRequest)
    );
  }

  insertSearchQuery() {
    this.searchBar.value = lushURL.get("search");
  }

  sendSearchRequest = (event) => {
    // console.log(event.key);
    // console.log(this.alphaNumericKeyCodes);
    // if (this.alphaNumericKeyCodes.test(event.key)) {

    lushURL.insertURLParam("search", this.searchBar.value);

    this.playlists.textContent = "";

    playlistsConfigurator.atTheBottom = true;
    playlistsConfigurator.reqPlaylistDataSpec.search = this.searchBar.value;
    playlistsConfigurator.reqPlaylistDataSpec.offset = 0;
    playlistsConfigurator.getPlaylists();
    // }
  };

  addAddAction() {
    this.addButton.onclick = () => {
      editPlaylistWindow.open();
    };
  }

  displaySearchBar() {
    document
      .getElementById("search-bar-container")
      .replaceWith(this.searchBarContainer);
  }
}
