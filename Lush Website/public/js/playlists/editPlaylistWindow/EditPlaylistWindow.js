import Audio from "../../audios/Audio.js";
import { lushURL } from "../../partials/loadContent.js";
import { audios } from "../../audios/AudiosConfigurator.js";
import { loadAudios } from "../../audios/loadAudios.js";
import { loadAudioSearchBar } from "../../searchBar/audios/loadAudioSearchBar.js";

export default class EditPlaylistWindow {
  constructor(editPlaylistWindowContainer, audioLi, dataRequest) {
    this.editPlaylistWindowContainer = editPlaylistWindowContainer;
    this.editPlaylistWindowBackground =
      editPlaylistWindowContainer.querySelector(
        "#edit-playlist-window-background"
      );
    this.editPlaylistWindow = editPlaylistWindowContainer.querySelector(
      "#edit-playlist-window"
    );
    this.audioLi = audioLi;
    this.titleInput =
      editPlaylistWindowContainer.querySelector(".title>.inputs");
    this.closeButton =
      editPlaylistWindowContainer.querySelector(".close-button");
    this.submitButton =
      editPlaylistWindowContainer.querySelector(".submit-button");
    this.imageWrapper =
      editPlaylistWindowContainer.querySelector(".image-wrapper");
    this.uploadCover =
      editPlaylistWindowContainer.querySelector(".upload-cover");
    this.fileInput = editPlaylistWindowContainer.querySelector(".file-input");
    this.audiosOl = editPlaylistWindowContainer.querySelector(".audios-ol");

    this.defaultDataRequest = {
      artistId: this.processArtistId(),
      playlistId: this.processPlaylistId(),
      search: lushURL.getQuery(),
      genres: this.processGenresQuery(lushURL.getGenres()),
      shuffle: this.processShuffleQuery(lushURL.getShuffle()),
      limit: 100,
      offset: 0,
    };
    this.dataRequest = { dataRequest: dataRequest || this.defaultDataRequest };

    this.playlistLi;
    this.playlistId;
    this.playlistName;
    this.image;
    this.chosenAudiosIds = new Set();

    this.configure();
    this.display();
  }

  processArtistId() {
    if (lushURL.currentPage === "artist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  processPlaylistId() {
    if (lushURL.currentPage === "playlist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  processGenresQuery(genres) {
    if (genres) {
      genres = genres.split("_");
    }
    return genres;
  }

  processShuffleQuery(shuffle) {
    if (shuffle == 1) {
      return true;
    }
    return false;
  }

  getAudios() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/audioData", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.displayAudios(xhr.response);
      }
    };

    xhr.send(JSON.stringify(this.dataRequest));
  }

  configure() {
    this.closeButton.addEventListener("click", this.hide);
    this.editPlaylistWindowBackground.addEventListener("click", this.hide);

    this.submitButton.addEventListener("click", this.sendChanges);

    this.uploadCover.onclick = () => {
      this.fileInput.click();
    };

    this.fileInput.onchange = this.handleFileSelect;
  }

  resetAttributes() {
    this.playlistLi = "";
    this.playlistId = "";
    this.playlistName = "";
    this.image = "";
    this.chosenAudiosIds.clear();
  }

  hide = () => {
    this.editPlaylistWindowContainer
      .querySelectorAll(".inputs")
      .forEach((input) => {
        input.innerHTML = "";
      });

    this.editPlaylistWindowContainer.style.display = "none";
  };

  display() {
    document
      .getElementsByTagName("body")[0]
      .prepend(this.editPlaylistWindowContainer);
  }

  open(playlistLi) {
    this.playlistLi = playlistLi;
    this.playlistId = playlistLi?.getAttribute("data-playlist-id");

    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    this.playlistName = playlistLi?.getAttribute("data-playlist-name");
    inputText.value = this.playlistName;
    this.titleInput.appendChild(inputText);

    loadAudios("#edit-playlist-window .audios-ol", true);
    loadAudioSearchBar(
      "#edit-playlist-window #search-bar-container",
      "#edit-playlist-window .audios-ol",
      true
    );
    // this.getAudios();

    if (playlistLi) {
      if (playlistLi.querySelector(".image-wrapper").style.backgroundImage) {
        this.imageWrapper.style.height = "250px";
      } else {
        this.imageWrapper.style.height = "0px";
      }
      this.imageWrapper.style.backgroundImage =
        playlistLi.querySelector(".image-wrapper").style.backgroundImage;
    } else {
      this.imageWrapper.style.height = "0px";
      this.imageWrapper.style.backgroundImage = "";
    }

    this.editPlaylistWindowContainer.style.display = "block";
  }

  sendSearchRequest = (event) => {
    event.target.parentElement.querySelector(".dropdown").textContent = "";
    this.getPlaylists(event.target.value);
  };

  getPlaylists(artistName) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/artistsForDropdown", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.editPlaylistWindow
          .querySelectorAll(".dropdown")
          .forEach((dropdown) => {
            response.artists.forEach((artist) => {
              const artistP = document.createElement("p");
              artistP.setAttribute("data-artist-id", artist.id);
              artistP.innerText = artist.name;
              artistP.addEventListener("click", this.setArtist);
              dropdown.appendChild(artistP);
            });
          });
      }
    };

    const dataJSON = { artistName: artistName };

    xhr.send(JSON.stringify(dataJSON));
  }

  toggleDropdown(event) {
    // console.log(event);

    event.target.parentElement
      .querySelector(".dropdown")
      .classList.remove("hidden");
  }

  setArtist(event) {
    event.target.closest(".artist").querySelector("input").value =
      event.target.innerText;

    event.target
      .closest(".artist")
      .querySelector("input")
      .setAttribute(
        "data-artist-id",
        event.target.getAttribute("data-artist-id")
      );

    event.target.parentElement.classList.add("hidden");
  }

  handleFileSelect = async (e) => {
    const files = e.target.files;

    if (files.length < 1) {
      return 0;
    }

    for (const file of files) {
      this.displayCover(file);
    }
  };

  displayCover(file) {
    this.image = file;
    const url = URL.createObjectURL(file);
    this.imageWrapper.style.backgroundImage = `url(${url})`;
    this.imageWrapper.style.height = "250px";
  }

  sendChanges = async () => {
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    this.playlistName = this.titleInput.querySelector("input").value;

    this.hide();

    xhr.open("POST", "/submitPlaylist", true);
    xhr.overrideMimeType("multipart/form-data");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log("Response edit:", response);

        this.resetAttributes();
      }
    };

    const reqJson = {
      playlistId: this.playlistId,
      playlistName: this.playlistName,
      audioIds: [...this.chosenAudiosIds],
    };

    fd.append("playlistMetadata", JSON.stringify(reqJson));
    fd.append("image", this.image);

    xhr.send(fd);
  };
}
