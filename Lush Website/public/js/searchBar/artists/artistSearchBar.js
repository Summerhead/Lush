import { artistsConfigurator } from "../../artists/loadArtists.js";
import { editArtistWindow } from "../../artists/loadArtists.js";
import { lushURL } from "../../partials/loadContent.js";

export default class ArtistSearchBar {
  constructor(searchBarContainer) {
    this.searchBarContainer = searchBarContainer;
    this.searchBar = searchBarContainer.querySelector(".search-bar");
    this.searchButton = searchBarContainer.querySelector(".search-button");
    this.addButton = searchBarContainer.querySelector(".add-button");

    this.artists = document.getElementById("artists-ol");
    this.alphaNumericKeyCodes = /^[a-z0-9]+$/i;

    const keyCodesRangeRule = (keyCode) =>
      keyCode < 16 ||
      (keyCode > 20 && keyCode < 27) ||
      (keyCode > 27 && keyCode < 33) ||
      (keyCode > 45 && keyCode < 91) ||
      (keyCode > 145 && keyCode < 255);
    const clearingBlankInput = (keyCode) =>
      !this.prevInput && (keyCode === 8 || keyCode === 46);
    this.keyUpCondition = (keyCode) =>
      keyCodesRangeRule(keyCode) && !clearingBlankInput(keyCode);

    this.prevInput;
    this.checkInput;

    this.configure();
    this.display();
  }

  inputChanged = () => {
    this.prevInput = this.searchBar.value;
  };

  configure() {
    this.searchButton.addEventListener("click", this.sendSearchRequest);

    this.searchBar.addEventListener("focus", () => {
      this.searchBar.addEventListener("keydown", this.inputChanged);
      window.addEventListener("keyup", this.sendSearchRequest);
    });

    this.searchBar.addEventListener("blur", () => {
      this.searchBar.removeEventListener("keydown", this.inputChanged);
      window.removeEventListener("keyup", this.sendSearchRequest);
    });

    this.addButton.addEventListener("click", () => editArtistWindow.open());

    this.searchBar.value = lushURL.getQuery();
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
    if (artistsConfigurator.artistsRequestResolved) {
      this.artists.textContent = "";

      artistsConfigurator.atTheBottom = true;
      artistsConfigurator.dataRequest.dataRequest.search = this.searchBar.value;
      artistsConfigurator.dataRequest.dataRequest.offset = 0;
      Promise.resolve(artistsConfigurator.getArtists()).then(() => {
        clearInterval(this.checkInput);
        this.checkInput = null;
      });
    } else if (!this.checkInput) {
      this.checkInput = setInterval(() => {
        if (
          artistsConfigurator.dataRequest.dataRequest.search !==
          this.searchBar.value
        ) {
          this.configureRequest();
        }
      }, 10);
    }
  }

  display() {
    document
      .querySelector("#main #search-bar-container")
      .replaceWith(this.searchBarContainer);
  }
}
