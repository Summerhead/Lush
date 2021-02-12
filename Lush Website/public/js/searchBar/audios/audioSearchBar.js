import { audiosConfigurator } from "../../audios/loadAudios.js";
import AudiosConfigurator from "../../audios/AudiosConfigurator.js";

export default class AudioSearchBar {
  constructor(searchBarContainer) {
    this.searchBarContainer = searchBarContainer;
    this.searchBar = searchBarContainer.querySelector("#search-bar");
    this.searchButton = searchBarContainer.querySelector("#search-audio");
    this.uploadButton = searchBarContainer.querySelector("#upload-audio");
    this.fileInput = searchBarContainer.querySelector("#file-input");

    this.audios = document.getElementById("audios-ol");

    this.alphaNumericKeyCodes = /^[a-z0-9]+$/i;

    this.addSearchAction();
    this.addUploadAction();
    this.displaySearchBar();
  }

  addSearchAction() {
    this.searchButton.addEventListener("click", this.sendSearchRequest);

    this.searchBar.addEventListener("focus", () =>
      window.addEventListener("keyup", this.sendSearchRequest)
    );

    this.searchBar.addEventListener("blur", () =>
      window.removeEventListener("keyup", this.sendSearchRequest)
    );
  }

  sendSearchRequest = (event) => {
    // console.log(event.key);
    // console.log(this.alphaNumericKeyCodes);
    // if (this.alphaNumericKeyCodes.test(event.key)) {
    this.audios.textContent = "";

    audiosConfigurator.atTheBottom = true;
    audiosConfigurator.reqAudioDataSpec.search = this.searchBar.value;
    audiosConfigurator.reqAudioDataSpec.offset = 0;
    audiosConfigurator.getAudios();
    // }
  };

  addUploadAction() {
    this.uploadButton.onclick = () => {
      this.fileInput.click();
    };

    this.fileInput.onchange = this.handleFileSelect;
  }

  displaySearchBar() {
    document
      .getElementById("search-bar-container")
      .replaceWith(this.searchBarContainer);
  }

  async handleFileSelect(e) {
    const files = e.target.files;

    if (files.length < 1) {
      return 0;
    }

    for (const file of files) {
      await Promise.resolve(this.uploadAudio(file));
    }
  }

  uploadAudio(file) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      var fd = new FormData();

      xhr.open("POST", "/uploadAudio", true);
      xhr.overrideMimeType("multipart/form-data");
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          const response = JSON.parse(xhr.responseText);
          console.log("Response:", response);

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
