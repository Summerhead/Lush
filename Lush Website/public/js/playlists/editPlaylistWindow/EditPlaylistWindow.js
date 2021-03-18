export default class EditPlaylistWindow {
  constructor(editPlaylistWindowContainer) {
    this.editPlaylistWindowContainer = editPlaylistWindowContainer;
    this.editPlaylistWindowBackground = editPlaylistWindowContainer.querySelector(
      "#edit-playlist-window-background"
    );
    this.editPlaylistWindow = editPlaylistWindowContainer.querySelector(
      "#edit-playlist-window"
    );
    this.titleInput = editPlaylistWindowContainer.querySelector(
      "#title>.inputs"
    );
    this.closeButton = editPlaylistWindowContainer.querySelector(
      "#close-button"
    );
    this.submitButton = editPlaylistWindowContainer.querySelector(
      "#submit-button"
    );
    this.imageWrapper = editPlaylistWindowContainer.querySelector(
      "#image-wrapper"
    );
    this.uploadCover = editPlaylistWindowContainer.querySelector(
      "#upload-cover"
    );
    this.fileInput = editPlaylistWindowContainer.querySelector("#file-input");

    this.playlistLi;
    this.playlistID;
    this.playlistName;
    this.image;

    this.configure();
    this.display();
  }

  configure() {
    this.closeButton.addEventListener("click", this.hide);
    this.editPlaylistWindowBackground.addEventListener("click", this.hide);

    this.submitButton.addEventListener("click", this.sendChanges);
    // this.addArtistButton.addEventListener("click", this.addArtist);

    this.uploadCover.onclick = () => {
      this.fileInput.click();
    };

    this.fileInput.onchange = this.handleFileSelect;
  }

  resetAttributes() {
    this.playlistLi = "";
    this.playlistID = "";
    this.playlistName = "";
    this.image = "";
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
    this.playlistID = playlistLi
      ? playlistLi.getAttribute("data-playlist-id")
      : null;

    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    this.playlistName = playlistLi
      ? playlistLi.getAttribute("data-playlist-name")
      : null;
    inputText.value = this.playlistName;
    this.titleInput.appendChild(inputText);

    if (playlistLi) {
      if (playlistLi.querySelector(".image-wrapper").style.backgroundImage) {
        this.imageWrapper.style.height = "250px";
      } else {
        this.imageWrapper.style.height = "0px";
      }
      this.imageWrapper.style.backgroundImage = playlistLi.querySelector(
        ".image-wrapper"
      ).style.backgroundImage;
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

    const json = {
      playlistID: this.playlistID,
      playlistName: this.playlistName,
    };

    fd.append("playlistMetadata", JSON.stringify(json));
    fd.append("image", this.image);

    xhr.send(fd);
  };
}
