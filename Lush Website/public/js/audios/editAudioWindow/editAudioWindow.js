import { audios } from "../AudiosConfigurator.js";

export default class EditAudioWindow {
  constructor(editAudioWindowContainer) {
    this.editAudioWindowContainer = editAudioWindowContainer;
    this.editAudioWindowBackground = editAudioWindowContainer.querySelector(
      "#edit-audio-window-background"
    );
    this.editAudioWindow = editAudioWindowContainer.querySelector(
      "#edit-audio-window"
    );
    this.titleInput = editAudioWindowContainer.querySelector(".title>.inputs");
    this.artistsInputs = editAudioWindowContainer.querySelector(
      ".artists>.inputs"
    );
    this.artistDropdowns = [];
    this.genresInputs = editAudioWindowContainer.querySelector(
      ".genres>.inputs"
    );
    this.genreDropdowns = [];
    this.closeButton = editAudioWindowContainer.querySelector(".close-button");
    this.submitButton = editAudioWindowContainer.querySelector(
      ".submit-button"
    );
    this.addArtistButton = editAudioWindowContainer.querySelector(
      ".add-artist"
    );
    this.addGenreButton = editAudioWindowContainer.querySelector(".add-genre");

    this.audioClass;
    this.audioID;
    this.title;
    this.artists = [];
    this.genres = [];

    this.configure();
    this.display();
  }

  configure() {
    this.closeButton.addEventListener("click", this.hide);
    this.editAudioWindowBackground.addEventListener("click", this.hide);
    this.submitButton.addEventListener("click", this.sendChanges);
    this.addArtistButton.addEventListener("click", this.addArtist);
    this.addGenreButton.addEventListener("click", this.addGenre);
  }

  hide = () => {
    this.editAudioWindowContainer.style.display = "none";
    this.editAudioWindowContainer
      .querySelectorAll(".inputs")
      .forEach((input) => {
        input.innerHTML = "";
      });
  };

  display() {
    document
      .getElementsByTagName("body")[0]
      .prepend(this.editAudioWindowContainer);
  }

  open(audioLi) {
    this.audioClass = audios.get(audioLi);
    console.log(this.audioClass);

    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    inputText.value = this.audioClass.audio.title;
    this.titleInput.appendChild(inputText);

    const artistAttributes = this.audioClass.audio.artists;
    artistAttributes.forEach((artist) => {
      const artistDiv = document.createElement("div");
      artistDiv.classList.add("artist");

      const input = document.createElement("input");
      input.setAttribute("type", "text");

      const { artist_id, name } = artist;
      input.value = name;
      input.setAttribute("data-artist-id", artist_id);
      input.addEventListener("focus", this.toggleDropdown);
      input.addEventListener("keyup", this.sendArtistSearchRequest);

      const removeArtistButton = document.createElement("button");
      removeArtistButton.innerHTML = "-";
      removeArtistButton.addEventListener("click", this.removeParentNode);

      const dropdown = document.createElement("div");
      dropdown.classList.add("dropdown");
      dropdown.classList.add("hidden");

      artistDiv.appendChild(input);
      artistDiv.appendChild(removeArtistButton);
      artistDiv.appendChild(dropdown);

      this.artistsInputs.appendChild(artistDiv);
    });

    this.getArtists();

    const genreAttributes = this.audioClass.audio.genres;
    genreAttributes.forEach((genre) => {
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

    this.editAudioWindowContainer.style.display = "block";
  }

  sendArtistSearchRequest = (event) => {
    event.target.parentElement.querySelector(".dropdown").textContent = "";
    this.getArtists(event.target.value);
  };

  sendGenreSearchRequest = (event) => {
    event.target.parentElement.querySelector(".dropdown").textContent = "";
    this.getGenres(event.target.value);
  };

  getArtists(artistName) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/artistsForDropdown", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.artistDropdowns = this.editAudioWindowContainer.querySelectorAll(
          ".artist>.dropdown"
        );
        this.artistDropdowns.forEach((dropdown) => {
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

  getGenres(genreName) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/genresData", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.genreDropdowns = this.editAudioWindowContainer.querySelectorAll(
          ".genre>.dropdown"
        );
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

  sendChanges = () => {
    this.newTitle = this.titleInput.querySelector("input").value;

    this.artists = [];
    this.artistsInputs.querySelectorAll("input").forEach((input) => {
      this.artists.push(input.getAttribute("data-artist-id"));
    });

    this.genres = [];
    this.genresInputs.querySelectorAll("input").forEach((input) => {
      this.genres.push(input.getAttribute("data-genre-id"));
    });

    this.hide();

    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", "/editAudio", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log(response);

        this.audioClass.setAttributes(this.newTitle);
      }
    };

    const dataRequest = {
      dataRequest: {
        audioId: this.audioClass.audio.audio_id,
        title: this.newTitle,
        artists: this.artists,
        genres: this.genres,
      },
    };

    xhr.send(JSON.stringify(dataRequest));
  };

  addArtist = () => {
    const artistDiv = document.createElement("div");
    artistDiv.classList.add("artist");

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.addEventListener("focus", this.toggleDropdown);
    input.addEventListener("keyup", this.sendArtistSearchRequest);

    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");
    dropdown.classList.add("hidden");

    const removeArtistButton = document.createElement("button");
    removeArtistButton.innerHTML = "-";
    removeArtistButton.addEventListener("click", this.removeParentNode);

    artistDiv.appendChild(input);
    artistDiv.appendChild(removeArtistButton);
    artistDiv.appendChild(dropdown);

    this.artistsInputs.appendChild(artistDiv);
    this.getArtists();
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
