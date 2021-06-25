import { playlistsConfigurator } from "../../playlists/loadPlaylists.js";
import { editPlaylistWindow } from "../../playlists/loadPlaylists.js";
import { lushURL } from "../../partials/loadContent.js";

export default class PlaylistSearchBar {
  constructor(searchBarContainer) {
    this.searchBarContainer = searchBarContainer;
    this.searchBar = searchBarContainer.querySelector(".search-bar");
    this.searchButton = searchBarContainer.querySelector(".search-button");
    this.addButton = searchBarContainer.querySelector(".add-button");
    this.genresSearchBar =
      searchBarContainer.querySelector(".genres-search-bar");

    this.playlistsOl = document.getElementById("playlists-ol");
    this.alphaNumericKeyCodes = /^[a-z0-9]+$/i;

    const keyCodesRangeRule = (keyCode) =>
      keyCode < 16 ||
      (keyCode > 20 && keyCode < 27) ||
      (keyCode > 27 && keyCode < 33) ||
      (keyCode > 45 && keyCode < 91) ||
      (keyCode > 145 && keyCode < 255);
    const isClearingBlankInput = (keyCode) =>
      !this.prevInput && (keyCode === 8 || keyCode === 46);
    this.keyUpCondition = (keyCode) => keyCodesRangeRule(keyCode);
    // && !isClearingBlankInput(keyCode);

    this.prevInput;
    this.checkInput;

    this.configure();
    this.display();
  }

  configure() {
    this.searchButton.addEventListener("click", this.sendSearchRequest);

    this.searchBar.addEventListener("focus", () =>
      window.addEventListener("keyup", this.sendSearchRequest)
    );

    this.searchBar.addEventListener("blur", () =>
      window.removeEventListener("keyup", this.sendSearchRequest)
    );

    this.addButton.addEventListener("click", () => editPlaylistWindow.open());

    this.searchBar.value = lushURL.getQuery();

    const genres = lushURL.getGenres();
    if (genres) {
      genres.split("_").forEach((genre) => {
        this.insertGenreQuery(genre);
      });
    }

    const shuffle = lushURL.getShuffle();
    if (shuffle) {
      this.toggleShuffle();
    }
  }

  sendSearchRequest = (event) => {
    const keyCode = event.keyCode;
    // console.log(keyCode);

    if (this.keyUpCondition(keyCode)) {
      lushURL.setQuery(this.searchBar.value);
      this.configureRequest();
    }
  };

  configureRequest() {
    if (playlistsConfigurator.playlistsRequestResolved) {
      this.playlistsOl.textContent = "";

      playlistsConfigurator.atTheBottom = true;
      playlistsConfigurator.dataRequest.dataRequest.search =
        this.searchBar.value;
      playlistsConfigurator.dataRequest.dataRequest.offset = 0;
      Promise.resolve(playlistsConfigurator.getPlaylists()).then(() => {
        clearInterval(this.checkInput);
        this.checkInput = null;
      });
    } else if (!this.checkInput) {
      this.checkInput = setInterval(() => {
        // if (audiosConfigurator.dataRequest.search !== this.searchBar.value) {
        this.configureRequest();
        // }
      }, 10);
    }
  }

  insertGenreQuery(genre) {
    const genreDiv = document.createElement("div");
    genreDiv.classList.add("genre");
    genreDiv.setAttribute("data-genre-name", genre);
    genreDiv.innerText = genre;
    genreDiv.addEventListener("click", this.removeGenreSearchQuery);

    if (this.genresSearchBar.getBoundingClientRect().height === 0) {
      this.searchBarContainer.style.rowGap = "5px";
    }

    this.genresSearchBar.appendChild(genreDiv);
  }

  removeGenreSearchQuery = (event) => {
    const target = event.target;
    target.remove();
    lushURL.removeGenre(target.getAttribute("data-genre-name"));

    // this.configureGenresRequest();
  };

  display() {
    document
      .querySelector("#main #search-bar-container")
      .replaceWith(this.searchBarContainer);
  }
}
