export default class EditArtistWindow {
  constructor(editArtistWindowContainer) {
    this.editArtistWindowContainer = editArtistWindowContainer;
    this.editArtistWindowBackground = editArtistWindowContainer.querySelector(
      "#edit-artist-window-background"
    );
    this.editArtistWindowContainer = editArtistWindowContainer;
    this.editArtistWindow = editArtistWindowContainer.querySelector(
      "#edit-artist-window"
    );
    this.titleInput = editArtistWindowContainer.querySelector(".title>.inputs");
    this.closeButton = editArtistWindowContainer.querySelector(".close-button");
    this.submitButton = editArtistWindowContainer.querySelector(
      ".submit-button"
    );
    this.imageWrapper = editArtistWindowContainer.querySelector(
      ".image-wrapper"
    );
    this.uploadButton = editArtistWindowContainer.querySelector(
      ".upload-button"
    );
    this.fileInput = editArtistWindowContainer.querySelector(".file-input");

    this.artistLi;
    this.artistID;
    this.artistName;
    this.image;

    this.configure();
    this.addUploadAction();
    this.display();
  }

  configure() {
    this.closeButton.addEventListener("click", this.hide);
    this.editArtistWindowBackground.addEventListener("click", this.hide);

    this.submitButton.addEventListener("click", this.sendChanges);
    // this.addArtistButton.addEventListener("click", this.addArtist);
  }

  resetAttributes() {
    this.artistLi = null;
    this.artistID = null;
    this.artistName = null;
    this.image = null;
  }

  hide = () => {
    this.resetAttributes();

    this.editArtistWindowContainer
      .querySelectorAll(".inputs")
      .forEach((input) => {
        input.innerHTML = "";
      });

    this.editArtistWindowContainer.style.display = "none";
  };

  display() {
    document
      .getElementsByTagName("body")[0]
      .prepend(this.editArtistWindowContainer);
  }

  open(artistLi) {
    this.artistLi = artistLi;
    this.artistID = artistLi?.getAttribute("data-artist-id") || null;

    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    this.artistName = artistLi
      ? artistLi.getAttribute("data-artist-name")
      : null;
    inputText.value = this.artistName;
    this.titleInput.appendChild(inputText);

    if (artistLi) {
      if (artistLi.querySelector(".image-wrapper").style.backgroundImage) {
        this.imageWrapper.style.height = "250px";
      } else {
        this.imageWrapper.style.height = "0px";
      }
      this.imageWrapper.style.backgroundImage = artistLi.querySelector(
        ".image-wrapper"
      ).style.backgroundImage;
    } else {
      this.imageWrapper.style.height = "0px";
      this.imageWrapper.style.backgroundImage = "";
    }

    this.editArtistWindowContainer.style.display = "block";
  }

  sendSearchRequest = (event) => {
    event.target.parentElement.querySelector(".dropdown").textContent = "";
    this.getArtists(event.target.value);
  };

  getArtists(artistName) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/artistsForDropdown", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.editArtistWindow
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

  addUploadAction() {
    this.uploadButton.onclick = () => {
      this.fileInput.click();
    };

    this.fileInput.onchange = this.handleFileSelect;
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
    // return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    this.artistName = this.titleInput.querySelector("input").value;

    xhr.open("POST", "/submitArtist", true);
    xhr.overrideMimeType("multipart/form-data");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log("Response edit:", response);

        // this.artistLi.querySelector(".audio-header>.title").innerText =
        //   response.audio.title;
      }
    };

    const json = {
      artistID: this.artistID,
      artistName: this.artistName,
    };

    fd.append("artistMetadata", JSON.stringify(json));
    fd.append("image", this.image);

    xhr.send(fd);

    this.hide();
    // });
  };
}
