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
    this.genresInputs =
      editArtistWindowContainer.querySelector(".genres>.inputs");
    this.genreDropdowns = [];
    this.addGenreButton = editArtistWindowContainer.querySelector(".add-genre");
    this.closeButton = editArtistWindowContainer.querySelector(".close-button");
    this.submitButton =
      editArtistWindowContainer.querySelector(".submit-button");
    this.imageWrapper =
      editArtistWindowContainer.querySelector(".image-wrapper");
    this.uploadButton =
      editArtistWindowContainer.querySelector(".upload-button");
    this.fileInput = editArtistWindowContainer.querySelector(".file-input");

    this.artist;
    this.artistId;
    this.artistName;
    this.image;
    this.rgb;

    this.configure();
    this.addUploadAction();
    this.display();
  }

  configure() {
    this.closeButton.addEventListener("click", this.hide);
    this.editArtistWindowBackground.addEventListener("click", this.hide);

    this.submitButton.addEventListener("click", this.sendChanges);
    this.addGenreButton.addEventListener("click", this.addGenre);
  }

  resetAttributes() {
    this.fileInput.value = null;
    this.artist = null;
    this.artistId = null;
    this.artistName = null;
    this.image = null;
    this.rgb = null;
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

  open(artist, imageWrapper) {
    this.artist = artist;

    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    inputText.value = this.artist?.artist_name || null;
    this.titleInput.appendChild(inputText);

    if (this.artist) {
      if (imageWrapper.style.backgroundImage) {
        this.imageWrapper.style.height = "250px";
      } else {
        this.imageWrapper.style.height = "0px";
      }
      this.imageWrapper.style.backgroundImage =
        imageWrapper.style.backgroundImage;
    } else {
      this.imageWrapper.style.height = "0px";
      this.imageWrapper.style.backgroundImage = "";
    }

    const genreAttributes = this.artist?.genres;
    genreAttributes?.forEach((genre) => {
      const genreDiv = document.createElement("div");
      genreDiv.classList.add("genre");

      const input = document.createElement("input");
      input.setAttribute("type", "text");

      const { genre_id, genre_name } = genre;
      input.value = genre_name;
      input.setAttribute("data-genre-id", genre_id);
      input.addEventListener("focus", this.toggleDropdown);
      input.addEventListener("keyup", this.sendGenreSearchRequest);

      const removeGenreButton = document.createElement("button");
      removeGenreButton.innerHTML = "-";
      removeGenreButton.addEventListener("click", this.removeParentNode);

      const dropdown = document.createElement("div");
      dropdown.classList.add("dropdown");
      dropdown.classList.add("hidden");

      genreDiv.appendChild(input);
      genreDiv.appendChild(removeGenreButton);
      genreDiv.appendChild(dropdown);

      this.genresInputs.appendChild(genreDiv);
    });

    this.getGenres();

    this.editArtistWindowContainer.style.display = "block";
  }

  sendGenreSearchRequest = (event) => {
    event.target.parentElement.querySelector(".dropdown").textContent = "";
    this.getGenres(event.target.value);
  };

  getGenres(genreName) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/genresData", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.genreDropdowns =
          this.editArtistWindowContainer.querySelectorAll(".genre>.dropdown");
        this.genreDropdowns.forEach((dropdown) => {
          response.genres.forEach((genre) => {
            const genreP = document.createElement("p");
            genreP.setAttribute("data-genre-id", genre.genre_id);
            genreP.innerText = genre.genre_name;
            genreP.addEventListener("click", this.setGenre);
            dropdown.appendChild(genreP);
          });
        });
      }
    };

    const dataRequest = { genreName: genreName };
    xhr.send(JSON.stringify(dataRequest));
  }

  toggleDropdown(event) {
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

  setGenre(event) {
    event.target.closest(".genre").querySelector("input").value =
      event.target.innerText;

    event.target
      .closest(".genre")
      .querySelector("input")
      .setAttribute(
        "data-genre-id",
        event.target.getAttribute("data-genre-id")
      );

    event.target.parentElement.classList.add("hidden");
  }

  addUploadAction() {
    this.uploadButton.onclick = () => {
      this.fileInput.click();
    };

    this.fileInput.addEventListener("change", this.handleFileSelect);
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

  displayCover(image) {
    this.image = image;

    const url = URL.createObjectURL(this.image);
    this.imageWrapper.style.backgroundImage = `url(${url})`;
    this.imageWrapper.style.height = "250px";

    const img = document.createElement("img");
    img.src = url;
    img.onload = () => {
      this.rgb = getAverageRGB(img);
    };
  }

  sendChanges = async () => {
    this.genres = [];
    this.artistName = this.titleInput.querySelector("input").value;
    if (this.artist) {
      this.artist.artist_name = this.artistName;
    }
    this.genresInputs.querySelectorAll("input").forEach((input) => {
      this.genres.push(input.getAttribute("data-genre-id"));
    });

    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    const artistMetadata = {
      artistId: this.artist?.artist_id,
      artistName: this.artistName,
      genres: this.genres,
      rgb: this.rgb,
    };

    xhr.open("POST", "/submitArtist", true);
    xhr.overrideMimeType("multipart/form-data");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log("Response:", response);
      }
    };

    fd.append("artistMetadata", JSON.stringify(artistMetadata));
    fd.append("image", this.image);

    xhr.send(fd);

    this.hide();
  };

  addGenre = () => {
    const genreDiv = document.createElement("div");
    genreDiv.classList.add("genre");

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.addEventListener("focus", this.toggleDropdown);
    input.addEventListener("keyup", this.sendGenreSearchRequest);

    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");
    dropdown.classList.add("hidden");

    const removeGenreButton = document.createElement("button");
    removeGenreButton.innerHTML = "-";
    removeGenreButton.addEventListener("click", this.removeParentNode);

    genreDiv.appendChild(input);
    genreDiv.appendChild(removeGenreButton);
    genreDiv.appendChild(dropdown);

    this.genresInputs.appendChild(genreDiv);
    this.getGenres();
  };

  removeParentNode = (event) => {
    event.target.parentNode.remove();
  };
}

function getAverageRGB(imgEl) {
  var blockSize = 1, // only visit every 5 pixels
    defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
    canvas = document.createElement("canvas"),
    context = canvas.getContext && canvas.getContext("2d"),
    data,
    width,
    height,
    i = -4,
    length,
    rgb = { r: 0, g: 0, b: 0 },
    count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    console.log("ok");
    /* security error, img on diff domain */
    return defaultRGB;
  }

  length = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}
