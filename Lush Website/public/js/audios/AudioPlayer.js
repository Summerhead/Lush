import { editAudioWindow } from "./loadAudios.js";
import showPage from "../partials/loadContent.js";

var currentAudio;

const tagColor = {
  1: "87B6A7",
  2: "F7D08A",
  3: "E3F09B",
  4: "F79F79",
  5: "e63946",
  6: "f1faee",
  7: "1d3557",
  8: "ffe8d6",
  9: "219ebc",
  10: "bdb2ff",
  11: "ffb703",
  12: "e5989b",
  13: "ef476f",
  14: "06d6a0",
  15: "03071e",
  16: "dda15e",
  17: "00b4d8",
  18: "006d77",
  19: "ffddd2",
  20: "faedcd",
  21: "f72585",
  22: "b5179e",
  23: "560bad",
  24: "3f37c9",
  25: "8d99ae",
  26: "ef233c",
  27: "ddbea9",
  28: "cbc0d3",
  29: "90be6d",
  30: "52b788",
};

export default class AudioPlayer {
  constructor(audioLi, audio) {
    this.audio = audio;
    this.audioLi = audioLi.cloneNode(true);
    this.clickableBackground = this.audioLi.querySelector(
      "#clickable-background"
    );
    this.actionButton = this.audioLi.querySelector("#audio-hud__action");

    this.audioPlayer = document.createElement("audio");
    this.audioPlayer.setAttribute("src", "");
    this.audioPlayer.setAttribute("id", "audio-player");
    this.audioPlayer.setAttribute("class", "audio-player");
    this.audioPlayer.setAttribute("preload", "metadata");

    this.genres = this.audioLi.querySelector("#genres");
    this.progressBar = this.audioLi.querySelector("#audio-hud__progress-bar");
    this.currentTime = this.audioLi.querySelector("#audio-hud__curr-time>span");
    this.durationTime = this.audioLi.querySelector("#audio-hud__duration>span");

    this.addButton = this.audioLi.querySelector("#add-button");
    this.deleteButton = this.audioLi.querySelector("#delete-button");
    this.editButton = this.audioLi.querySelector("#edit-button");
    this.infoButton = this.audioLi.querySelector("#info-button");

    this.hiddenTime = this.audioLi.querySelector("#time .hidden");

    // console.log(audio);
    this.configureAudioPlayer();
  }

  configureAudioPlayer() {
    // this.clickableBackground.onfocus = () => alert("focused");

    this.insertArtists();
    this.audioLi.querySelector(
      ".audio-header>.title"
    ).innerText = this.audio.title;
    this.durationTime.innerText = this.audioTime(this.audio.duration);
    this.progressBar.max = Math.floor(this.audio.duration);

    // if (isCurrentlyPlaying) audioLi.classList.add("playing");
    this.audioLi.setAttribute("data-audio-id", this.audio.audio_id);
    this.audioLi.setAttribute("data-blob-id", this.audio.blob_id);

    var artistAttributes = "";
    for (const [index, artist] of this.audio.artists.entries()) {
      const dataArtistAttribute = "data-artist-" + (index + 1);
      artistAttributes += dataArtistAttribute + " ";
      const artistJSON = { id: artist.artist_id, name: artist.name };
      this.audioLi.setAttribute(
        dataArtistAttribute,
        JSON.stringify(artistJSON)
      );
    }
    artistAttributes = artistAttributes.trim();
    this.audioLi.setAttribute("data-artist-attributes", artistAttributes);
    this.audioLi.setAttribute("data-audio-title", this.audio.title);

    this.displayTags();
    this.addEventListeners();
  }

  displayTags() {
    this.audio.genres.forEach((genre) => {
      const genreDiv = document.createElement("a");
      genreDiv.href =
        "/genres/" +
        genre.genre_name.replace(/ /g, "+").replace(/\//g, "%2F").toLowerCase();
      genreDiv.classList.add("genre");
      genreDiv.style.backgroundColor = "white";
      genreDiv.innerText = genre.genre_name;
      this.genres.append(genreDiv);
      // const tagDiv1 = document.createElement("a");
      // tagDiv1.href = tag.tag_name;
      // tagDiv1.classList.add("tag");
      // tagDiv1.innerText = tag.tag_name;
      // this.tags.append(tagDiv1);
      // const tagDiv2 = document.createElement("a");
      // tagDiv2.href = tag.tag_name;
      // tagDiv2.classList.add("tag");
      // tagDiv2.innerText = tag.tag_name;
      // this.tags.append(tagDiv2);
    });
  }

  addEventListeners() {
    const mutationObserver = new MutationObserver(
      this.classListMutationDetector
    );
    mutationObserver.observe(this.actionButton, { attributes: true });

    this.actionButton.addEventListener("click", this.changeClass);
    this.clickableBackground.addEventListener("click", this.changeClass);

    this.audioPlayer.addEventListener("timeupdate", this.audioProgress);
    this.audioPlayer.addEventListener("ended", this.playNext);

    this.progressBar.addEventListener("click", this.progressBarAct);

    this.addButton.addEventListener("click", () => alert("Add"));
    this.deleteButton.addEventListener("click", () => alert("Delete"));
    this.editButton.addEventListener("click", this.editAudioButtonOnClick);
    this.infoButton.addEventListener("click", () => alert("Info"));
  }

  insertArtists() {
    const parsedArtists = this.parseArtists(this.audio.artists),
      artistsDiv = this.audioLi.querySelector(".audio-header>.artists");

    // console.log(parsedArtists);
    artistsDiv.replaceWith(parsedArtists);
  }

  parseArtists(artists) {
    const artistsDiv = document.createElement("div");
    artistsDiv.setAttribute("class", "artists");

    artists.forEach((artist, index) => {
      if (index != 0) {
        const span = document.createElement("span");
        span.innerHTML = index == artists.length - 1 ? " & " : ", ";
        artistsDiv.appendChild(span);
      }

      const aElement = document.createElement("a"),
        link = `/artists/${artist.artist_id}/${artist.name
          .replace(/ /g, "+")
          .replace(/\//g, "%2F")}`;
      aElement.setAttribute("href", link);
      aElement.onclick = () => {
        showPage(aElement.href);
        return false;
      };
      aElement.innerText = artist.name;
      artistsDiv.appendChild(aElement);
    });

    return artistsDiv;
  }

  revokeObjectURL() {
    URL.revokeObjectURL(this.audioPlayer.src);
    this.audioPlayer.src = "";
  }

  classListMutationDetector = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        this.audioAct();
      }
    });
  };

  changeClass = () => {
    if (currentAudio && currentAudio !== this.audioLi) {
      currentAudio.classList.remove("playing");

      currentAudio
        .querySelector("#audio-hud__action")
        .setAttribute("class", "audio-hud__element audio-hud__action");
    }

    currentAudio = this.audioLi;
    // console.log(currentAudio);
    currentAudio.classList.add("playing");

    if (this.actionButton.classList.contains("audio-hud__action_play")) {
      this.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_pause"
      );
    } else {
      this.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_play"
      );
    }
  };

  async audioAct() {
    if (
      !this.actionButton.classList.contains("audio-hud__action_play") &&
      !this.actionButton.classList.contains("audio-hud__action_pause")
    ) {
      this.stopAudio();
      this.revokeObjectURL();

      this.progressBar.style.display = "none";
      this.hiddenTime.style.display = "none";
      this.audioPlayer.onloadeddata = null;
    } else {
      this.progressBar.style.display = "block";
      this.hiddenTime.style.display = "flex";

      if (this.actionButton.classList.contains("audio-hud__action_play")) {
        if (this.audioPlayer.src === document.location.href) {
          await this.fetchBlob({
            blobID: Number(this.audioLi.getAttribute("data-blob-id")),
          });
        }

        this.audioPlayer.play();
      } else {
        this.audioPlayer.pause();
      }
    }
  }

  async fetchBlob(reqAudioBlob) {
    await fetch("/audioBlob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqAudioBlob),
    })
      .then((response) => response.body)
      .then((rs) => {
        const reader = rs.getReader();

        return new ReadableStream({
          async start(controller) {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              controller.enqueue(value);
            }

            controller.close();
            reader.releaseLock();
          },
        });
      })
      .then((rs) => new Response(rs))
      .then((response) => response.blob())
      .then((blobData) => {
        // var blob = new Blob([blobData], { type: "audio/mp3" });
        const url = URL.createObjectURL(blobData);
        this.setAudioPlayerSrc(url);
      })
      .catch((error) =>
        console.log("Error occured while fetching blob:", error)
      );
  }

  stopAudio() {
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
  }

  audioTime(time) {
    time = Math.floor(time);

    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time - minutes * 60);
    var minutesVal = minutes;
    var secondsVal = seconds;

    if (minutes < 10) {
      minutesVal = "0" + minutes;
    }

    if (seconds < 10) {
      secondsVal = "0" + seconds;
    }

    return minutesVal + ":" + secondsVal;
  }

  audioProgress = () => {
    const progress = Math.ceil(
      this.audioPlayer.currentTime /
        (Math.floor(this.audioPlayer.duration) / this.progressBar.max)
    );

    this.progressBar.value = progress || 0;
    this.currentTime.innerHTML = this.audioTime(this.audioPlayer.currentTime);
  };

  playNext = () => {
    this.audioLi.classList.remove("playing");
    this.actionButton.setAttribute(
      "class",
      "audio-hud__element audio-hud__action"
    );

    var nextSibling;
    if ((nextSibling = this.audioLi.nextSibling)) {
      currentAudio = nextSibling;
      currentAudio.classList.add("playing");
      currentAudio
        .querySelector("#audio-hud__action")
        .setAttribute(
          "class",
          "audio-hud__element audio-hud__action audio-hud__action_play"
        );
    } else {
      currentAudio = null;
    }
  };

  audioChangeTime = (e) => {
    const mouseX = Math.floor(
        e.pageX - this.progressBar.getBoundingClientRect().left
      ),
      progress = mouseX / this.progressBar.offsetWidth;
    this.audioPlayer.currentTime = this.audioPlayer.duration * progress;
  };

  progressBarAct = async (e) => {
    if (this.audioPlayer.src === document.location.href) {
      await this.fetchBlob({
        blobID: Number(this.audioLi.getAttribute("data-blob-id")),
      });

      this.audioPlayer.onloadeddata = () => {
        this.audioChangeTime(e);
      };
    } else {
      this.audioChangeTime(e);
    }

    if (currentAudio && currentAudio !== this.audioLi) {
      currentAudio
        .querySelector("#audio-hud__action")
        .setAttribute("class", "audio-hud__element audio-hud__action");
    }

    currentAudio = this.audioLi;

    if (this.audioPlayer.paused) {
      this.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_play"
      );
    }
  };

  editAudioButtonOnClick = () => {
    editAudioWindow.openEditAudioWindow(this.audioLi);
  };

  setAudioPlayerSrc(url) {
    this.audioPlayer.src = url;
  }
}

export { currentAudio };
