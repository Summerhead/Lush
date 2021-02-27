// import { pushState } from "../../partials/loadContent.js";

export default class EditAudioWindow {
  constructor(editAudioWindowContainer) {
    this.editAudioWindowContainer = editAudioWindowContainer;
    this.editAudioWindowBackground = editAudioWindowContainer.querySelector(
      "#edit-audio-window-background"
    );
    this.editAudioWindow = editAudioWindowContainer.querySelector(
      "#edit-audio-window"
    );
    this.titleInput = editAudioWindowContainer.querySelector("#title>.inputs");
    this.artistsInputs = editAudioWindowContainer.querySelector(
      "#artists>.inputs"
    );
    this.closeButton = editAudioWindowContainer.querySelector("#close-button");
    this.submitButton = editAudioWindowContainer.querySelector(
      "#submit-button"
    );
    this.addArtistButton = editAudioWindowContainer.querySelector(
      "#add-artist"
    );

    this.audioLi;

    this.audioID;
    this.title;
    this.artists = [];

    this.configure();
    this.display();
  }

  configure() {
    this.closeButton.addEventListener("click", this.hide);
    this.editAudioWindowBackground.addEventListener("click", this.hide);

    this.submitButton.addEventListener("click", this.sendChanges);
    this.addArtistButton.addEventListener("click", this.addArtist);
  }

  hide = () => {
    this.editAudioWindowContainer
      .querySelectorAll(".inputs")
      .forEach((input) => {
        input.innerHTML = "";
      });

    this.editAudioWindowContainer.style.display = "none";
  };

  display() {
    document
      .getElementsByTagName("body")[0]
      .prepend(this.editAudioWindowContainer);
  }

  open(audioLi) {
    this.audioLi = audioLi;
    this.audioID = audioLi.audioID;

    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    this.title = audioLi.audioTitle;
    inputText.value = this.title;
    this.titleInput.appendChild(inputText);

    const artistAttributes = audioLi.artists;
    artistAttributes.forEach((artist) => {
      const artistDiv = document.createElement("div");
      artistDiv.classList.add("artist");

      const input = document.createElement("input");
      input.setAttribute("type", "text");

      const { id, name } = artist;
      input.value = name;
      input.setAttribute("data-artist-id", id);
      input.addEventListener("focus", this.toggleDropdown);
      input.addEventListener("keyup", this.sendSearchRequest);

      const removeArtistButton = document.createElement("button");
      removeArtistButton.innerHTML = "-";
      removeArtistButton.addEventListener("click", this.removeArtist);

      const dropdown = document.createElement("div");
      dropdown.classList.add("dropdown");
      dropdown.classList.add("hidden");

      artistDiv.appendChild(input);
      artistDiv.appendChild(removeArtistButton);
      artistDiv.appendChild(dropdown);

      this.artistsInputs.appendChild(artistDiv);
      this.artists.push(name);
    });

    this.getArtists();

    this.editAudioWindowContainer.style.display = "block";
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

        this.editAudioWindow
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

  sendChanges = () => {
    this.title = this.titleInput.querySelector("input").value;
    this.artists = [];
    this.artistsInputs
      .querySelectorAll("input")
      .forEach((input) =>
        this.artists.push(input.getAttribute("data-artist-id"))
      );

    this.hide();

    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", "/editAudio", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const response = JSON.parse(xhr.response);
        console.log("Response edit:", response);

        this.audioLi.querySelector(
          ".audio-header>.title"
        ).innerText = this.title;
      }
    };

    const json = {
      audioId: this.audioID,
      title: this.title,
      artists: this.artists,
    };

    xhr.send(JSON.stringify(json));
  };

  addArtist = () => {
    const artistDiv = document.createElement("div");
    artistDiv.classList.add("artist");

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.addEventListener("focus", this.toggleDropdown);
    input.addEventListener("keyup", this.sendSearchRequest);

    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");
    dropdown.classList.add("hidden");

    const removeArtistButton = document.createElement("button");
    removeArtistButton.innerHTML = "-";
    removeArtistButton.addEventListener("click", this.removeArtist);

    artistDiv.appendChild(input);
    artistDiv.appendChild(removeArtistButton);
    artistDiv.appendChild(dropdown);

    this.artistsInputs.appendChild(artistDiv);
  };

  removeArtist = (event) => {
    event.target.parentNode.remove();
  };
}
