import { lushURL } from "../partials/loadContent.js";

export default class SearchBar {
  constructor(
    searchBarContainer,
    editorWindow,
    searchBarQuery,
    itemsContainerQuery
  ) {
    this.searchBarContainer = searchBarContainer;
    this.searchBar = searchBarContainer.querySelector(".search-bar");
    this.clearInputButton = searchBarContainer.querySelector(".clear-input");
    this.searchButton = searchBarContainer.querySelector(".search-button");
    this.addButton = searchBarContainer.querySelector(".add-button");
    this.shuffleButton = searchBarContainer.querySelector(".shuffle-button");
    this.genresSearchBar =
      searchBarContainer.querySelector(".genres-search-bar");

    this.searchBarQuery = searchBarQuery || "#main .search-bar-container";
    this.audiosOlQuery = itemsContainerQuery || "#main .items-ol";
    this.audiosOl = document.querySelector(this.audiosOlQuery);
    this.editorWindow = editorWindow;

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
  }

  setConfigurator(configurator) {
    this.configurator = configurator;
  }

  inputChanged = () => {
    this.prevInput = this.searchBar.value;
  };

  configure() {
    this.clearInputButton.addEventListener("click", this.clearInput);

    this.searchButton.addEventListener("click", this.configureRequest);

    this.searchBar.addEventListener("focus", () => {
      this.searchBar.addEventListener("keydown", this.inputChanged);
      this.searchBar.addEventListener("keyup", this.sendSearchRequest);
    });
    this.searchBar.addEventListener("blur", () => {
      this.searchBar.removeEventListener("keydown", this.inputChanged);
      this.searchBar.removeEventListener("keyup", this.sendSearchRequest);
    });

    this.addEventListenerToAddButton();

    this.shuffleButton.addEventListener("click", this.configureShuffleRequest);

    this.searchBar.value = lushURL.getQuery();

    this.insertGenres();

    if (lushURL.getShuffle()) {
      this.toggleShuffle();
    }
  }

  insertGenres() {}

  addEventListenerToAddButton() {
    this.addButton.addEventListener("click", () => this.editorWindow.open());
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

    this.configureGenresRequest();
  };

  clearInput = () => {
    this.searchBar.value = "";

    lushURL.setQuery(this.searchBar.value);
    this.configureRequest();
  };

  configureGenresRequest() {
    if (this.configurator.requestResolved) {
      this.audiosOl.textContent = "";

      this.configurator.atTheBottom = true;
      this.configurator.dataRequest.genres = lushURL.processGenresQuery();
      this.configurator.dataRequest.offset = 0;
      Promise.resolve(this.configurator.fetchData()).then(() => {
        clearInterval(this.checkInput);
        this.checkInput = null;
      });
    } else if (!this.checkInput) {
      this.checkInput = setInterval(() => {
        this.configureRequest();
      }, 10);
    }
  }

  configureShuffleRequest = () => {
    this.toggleShuffle();
    this.sendShuffleRequest();
  };

  toggleShuffle = () => {
    this.shuffleButton.classList.toggle("checked");
  };

  sendShuffleRequest() {
    this.configurator.atTheBottom = true;
    this.configurator.dataRequest.offset = 0;

    if (this.shuffleButton.classList.contains("checked")) {
      this.configurator.dataRequest.shuffle = true;
      lushURL.setShuffle();
    } else {
      this.configurator.dataRequest.shuffle = false;
      lushURL.deleteShuffle();
    }

    this.audiosOl.textContent = "";
    this.configurator.fetchData();
  }

  sendSearchRequest = (event) => {
    const keyCode = event.keyCode;

    if (this.keyUpCondition(keyCode)) {
      lushURL.setQuery(this.searchBar.value);
      this.configureRequest();
    }
  };

  configureRequest() {
    if (this.configurator.requestResolved) {
      this.audiosOl.textContent = "";
      this.configurator.audios = [];

      this.configurator.atTheBottom = true;
      this.configurator.dataRequest.search = this.searchBar.value;
      this.configurator.dataRequest.offset = 0;
      Promise.resolve(this.configurator.fetchData()).then(() => {
        clearInterval(this.checkInput);
        this.checkInput = null;
      });
    } else if (!this.checkInput) {
      this.checkInput = setInterval(() => {
        this.configureRequest();
      }, 10);
    }
  }

  display() {
    document
      .querySelector(this.searchBarQuery)
      .replaceWith(this.searchBarContainer);
  }
}
