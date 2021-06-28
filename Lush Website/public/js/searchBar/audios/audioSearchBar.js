import { audiosConfigurator } from "../../audios/loadAudios.js";
import { lushURL } from "../../partials/loadContent.js";
import SearchBar from "../searchBar.js";

export default class AudioSearchBar extends SearchBar {
  constructor(searchBarContainer, searchBarQuery, audiosOlQuery, isEditing) {
    super(
      searchBarContainer,
      null,
      audiosConfigurator,
      searchBarQuery,
      audiosOlQuery
    );

    this.fileInput = searchBarContainer.querySelector(".file-input");
    this.searchBarQuery = searchBarQuery || "#main .search-bar-container";
    this.audiosOl = document.querySelector(this.audiosOlQuery);

    this.isEditing = isEditing;

    this.configure();
    this.display();
  }

  insertGenres() {
    lushURL
      .getGenres()
      ?.split("_")
      .forEach((genre) => {
        this.insertGenreQuery(genre);
      });
  }

  addEventListenerToAddButton() {
    this.addButton.onclick = () => {
      this.fileInput.click();
    };
    this.fileInput.onchange = this.handleFileSelect;
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

  handleFileSelect = async (e) => {
    const files = e.target.files;

    if (files.length < 1) {
      return 0;
    }

    for (const file of files) {
      await Promise.resolve(this.uploadAudio(file));
    }
  };

  uploadAudio(audio) {
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

      const url = URL.createObjectURL(audio);
      const audioPlayer = document.createElement("audio");
      audioPlayer.src = url;
      audioPlayer.onloadedmetadata = () => {
        URL.revokeObjectURL(url);

        fd.append("audio", audio);
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
