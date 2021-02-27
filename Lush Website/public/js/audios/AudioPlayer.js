import { editAudioWindow } from "./loadAudios.js";
import showPage from "../partials/loadContent.js";
import LushURL from "../partials/LushURL.js";
import { lushURL } from "../partials/loadContent.js";

var currentAudio;

export default class AudioPlayer {
  constructor(audioLi, audio) {
    this.audio = audio;
    this.audioLi = audioLi.cloneNode(true);
    this.clickableBackground = this.audioLi.querySelector(
      "#clickable-background"
    );

    this.audioLi.audioPlayer = document.createElement("audio");
    this.audioLi.audioPlayer.setAttribute("src", "");
    this.audioLi.audioPlayer.setAttribute("id", "audio-player");
    this.audioLi.audioPlayer.setAttribute("class", "audio-player");
    this.audioLi.audioPlayer.setAttribute("preload", "metadata");
    this.audioLi.actionButton = this.audioLi.querySelector(
      "#audio-hud__action"
    );

    this.genres = this.audioLi.querySelector("#genres");
    this.progressBar = this.audioLi.querySelector("#audio-hud__progress-bar");
    this.currentTime = this.audioLi.querySelector("#audio-hud__curr-time>span");
    this.durationTime = this.audioLi.querySelector("#audio-hud__duration>span");

    this.addButton = this.audioLi.querySelector("#add-button");
    this.deleteButton = this.audioLi.querySelector("#delete-button");
    this.editButton = this.audioLi.querySelector("#edit-button");
    this.infoButton = this.audioLi.querySelector("#info-button");
    this.hiddenTime = this.audioLi.querySelector("#time .hidden");

    this.configure();
    this.displayTags();
    this.addEventListeners();
  }

  configure() {
    this.insertArtists();
    this.audioLi.querySelector(
      ".audio-header>.title"
    ).innerText = this.audio.title;
    this.durationTime.innerText = this.audioTime(this.audio.duration);
    this.progressBar.max = Math.floor(this.audio.duration);

    // this.audioLi.setAttribute("data-audio-id", this.audio.audio_id);
    // this.audioLi.setAttribute("data-blob-id", this.audio.blob_id);

    // var artistAttributes = "";
    // for (const [index, artist] of this.audio.artists.entries()) {
    //   const dataArtistAttribute = "data-artist-" + (index + 1);
    //   artistAttributes += dataArtistAttribute + " ";
    //   const artistJSON = { id: artist.artist_id, name: artist.name };
    //   this.audioLi.setAttribute(
    //     dataArtistAttribute,
    //     JSON.stringify(artistJSON)
    //   );
    // }
    // artistAttributes = artistAttributes.trim();
    // this.audioLi.setAttribute("data-artist-attributes", artistAttributes);
    // this.audioLi.setAttribute("data-audio-title", this.audio.title);

    this.audioLi.audioID = this.audio.audio_id;
    this.audioLi.blobID = this.audio.blob_id;

    const artists = [];
    for (const [index, artist] of this.audio.artists.entries()) {
      artists.push({ id: artist.artist_id, name: artist.name });
    }
    this.audioLi.artists = artists;
    this.audioLi.audioTitle = this.audio.title;
  }

  displayTags() {
    this.audio.genres.forEach((genre) => {
      const genreDiv = document.createElement("div");
      genreDiv.href =
        "/genres/" +
        genre.genre_name.replace(/ /g, "+").replace(/\//g, "%2F").toLowerCase();
      genreDiv.classList.add("genre");
      genreDiv.setAttribute("data-genre-name", genre.genre_name.toLowerCase());
      genreDiv.style.backgroundColor = "white";
      genreDiv.innerText = genre.genre_name;
      genreDiv.addEventListener("click", this.insertTagParam);

      this.genres.append(genreDiv);
    });
  }

  insertTagParam(event) {
    lushURL.insertURLParam(
      "genres",
      event.target.getAttribute("data-genre-name")
    );
  }

  addEventListeners() {
    this.audioLi.actionButton.addEventListener("click", this.changeClass);
    this.clickableBackground.addEventListener("click", this.changeClass);

    this.audioLi.audioPlayer.addEventListener("timeupdate", this.audioProgress);
    this.audioLi.audioPlayer.addEventListener("ended", this.playNext);

    this.addButton.addEventListener("click", () => alert("Add"));
    this.deleteButton.addEventListener("click", () => alert("Delete"));
    this.editButton.addEventListener("click", this.editAudioButtonOnClick);
    this.infoButton.addEventListener("click", () => alert("Info"));
    this.progressBar.addEventListener("click", this.progressBarAct);
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
        const spanEl = document.createElement("span");
        spanEl.innerHTML = index == artists.length - 1 ? " & " : ", ";
        artistsDiv.appendChild(spanEl);
      }

      const linkEl = document.createElement("a"),
        link = `/artists/${artist.artist_id}/${artist.name
          .replace(/ /g, "+")
          .replace(/\//g, "%2F")}`;
      linkEl.setAttribute("href", link);
      linkEl.onclick = () => {
        showPage(linkEl.href);
        return false;
      };
      linkEl.innerText = artist.name;

      artistsDiv.appendChild(linkEl);
    });

    return artistsDiv;
  }

  changeClass = async () => {
    if (currentAudio && currentAudio !== this.audioLi) {
      currentAudio.classList.remove("current", "playing", "paused");

      stopAudio(currentAudio.audioPlayer);
      revokeObjectURL(currentAudio.audioPlayer);

      currentAudio.audioPlayer.onloadeddata = null;
    }

    currentAudio = this.audioLi;
    currentAudio.classList.add("current");

    if (currentAudio.classList.contains("playing")) {
      currentAudio.classList.remove("playing");
      currentAudio.classList.add("paused");

      this.audioLi.audioPlayer.pause();
    } else {
      currentAudio.classList.remove("paused");
      currentAudio.classList.add("playing");

      if (this.audioLi.audioPlayer.src === document.location.href) {
        await this.fetchBlob({
          blobID: Number(this.audioLi.blobID),
        });
      }

      this.audioLi.audioPlayer.play();
    }
  };

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
      this.audioLi.audioPlayer.currentTime /
        (Math.floor(this.audioLi.audioPlayer.duration) / this.progressBar.max)
    );

    this.progressBar.value = progress || 0;
    this.currentTime.innerHTML = this.audioTime(
      this.audioLi.audioPlayer.currentTime
    );
  };

  playNext = async () => {
    var nextSibling;
    if ((nextSibling = this.audioLi.nextSibling)) {
      nextSibling.actionButton.click();
    } else {
      currentAudio.classList.remove("current", "playing", "paused");

      stopAudio(currentAudio.audioPlayer);
      revokeObjectURL(currentAudio.audioPlayer);

      currentAudio.audioPlayer.onloadeddata = null;
    }
  };

  audioChangeTime = (event) => {
    const mouseX = Math.floor(
        event.pageX - this.progressBar.getBoundingClientRect().left
      ),
      progress = mouseX / this.progressBar.offsetWidth;
    this.audioLi.audioPlayer.currentTime =
      this.audioLi.audioPlayer.duration * progress;
  };

  progressBarAct = async (event) => {
    this.audioChangeTime(event);

    if (this.audioLi.classList.contains("paused")) {
      this.audioLi.actionButton.click();
    }
  };

  editAudioButtonOnClick = () => {
    editAudioWindow.open(this.audioLi);
  };

  setAudioPlayerSrc(url) {
    this.audioLi.audioPlayer.src = url;
  }
}

function revokeObjectURL(audioPlayer) {
  URL.revokeObjectURL(audioPlayer.src);
  audioPlayer.src = "";
}

function stopAudio(audioPlayer) {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}

export { currentAudio };
