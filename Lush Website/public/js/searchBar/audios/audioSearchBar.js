import { audiosConfigurator } from "../../audios/loadAudios.js";
import { lushURL } from "../../partials/loadContent.js";

export default class AudioSearchBar {
  constructor(searchBarContainer) {
    this.searchBarContainer = searchBarContainer;
    this.searchBar = searchBarContainer.querySelector("#search-bar");
    this.searchButton = searchBarContainer.querySelector("#search-audio");
    this.uploadButton = searchBarContainer.querySelector("#upload-audio");
    this.fileInput = searchBarContainer.querySelector("#file-input");
    this.shuffleButton = searchBarContainer.querySelector("#shuffle-audios");
    this.genresSearchBar = searchBarContainer.querySelector(
      "#genres-search-bar"
    );

    this.audiosOl = document.getElementById("audios-ol");
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

    this.uploadButton.onclick = () => {
      this.fileInput.click();
    };
    this.fileInput.onchange = this.handleFileSelect;

    this.shuffleButton.addEventListener("click", this.configureShuffleRequest);
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

  configureGenresRequest() {
    if (audiosConfigurator.audiosRequestResolved) {
      this.audiosOl.textContent = "";

      audiosConfigurator.atTheBottom = true;
      audiosConfigurator.dataRequest.dataRequest.genres = audiosConfigurator.processGenresQuery(
        lushURL.getGenres()
      );
      audiosConfigurator.dataRequest.dataRequest.offset = 0;
      Promise.resolve(audiosConfigurator.getAudios()).then(() => {
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

  configureShuffleRequest = () => {
    this.toggleShuffle();
    this.sendShuffleRequest();
  };

  toggleShuffle = () => {
    this.shuffleButton.classList.toggle("checked");
  };

  sendShuffleRequest() {
    audiosConfigurator.atTheBottom = true;
    audiosConfigurator.dataRequest.dataRequest.offset = 0;

    if (this.shuffleButton.classList.contains("checked")) {
      audiosConfigurator.dataRequest.dataRequest.shuffle = true;
      lushURL.setShuffle();
    } else {
      audiosConfigurator.dataRequest.dataRequest.shuffle = false;
      lushURL.deleteShuffle();
    }

    this.audiosOl.textContent = "";
    audiosConfigurator.getAudios();
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
    if (audiosConfigurator.audiosRequestResolved) {
      this.audiosOl.textContent = "";

      audiosConfigurator.atTheBottom = true;
      audiosConfigurator.dataRequest.dataRequest.search = this.searchBar.value;
      audiosConfigurator.dataRequest.dataRequest.offset = 0;
      Promise.resolve(audiosConfigurator.getAudios()).then(() => {
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

  display() {
    document
      .getElementById("search-bar-container")
      .replaceWith(this.searchBarContainer);
  }

  handleFileSelect = async (e) => {
    const files = e.target.files;

    if (files.length < 1) {
      return 0;
    }

    for (const file of files) {
      await Promise.resolve(this.uploadAudio(file));
    }
  };

  uploadAudio(file) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      var fd = new FormData();

      xhr.open("POST", "/uploadAudio", true);
      xhr.overrideMimeType("multipart/form-data");
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          const response = JSON.parse(xhr.responseText);
          console.log(response);

          resolve(xhr.responseText);
        }
      };

      const url = URL.createObjectURL(file);
      const audioPlayer = document.createElement("audio");
      audioPlayer.src = url;
      audioPlayer.onloadedmetadata = () => {
        URL.revokeObjectURL(url);

        fd.append("audio", file);
        fd.append("duration", audioPlayer.duration);
        xhr.send(fd);
      };
    });
  }

  onFileLoaded(e) {
    var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
    if (match == null) {
      throw "Could not parse result";
    }
  }
}
