import { editAudioWindow } from "./loadAudios.js";
import showPage from "../partials/loadContent.js";
import { lushURL } from "../partials/loadContent.js";
import { audiosConfigurator } from "../audios/loadAudios.js";
import { audioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";
import { audios } from "./AudiosConfigurator.js";
import { header } from "../header/loadHeader.js";

var currentAudio;
var progressBar;
const watchHeader = setInterval(() => {
  progressBar = header?.querySelector(".progress-bar");
  if (progressBar !== undefined) {
    progressBar.addEventListener("click", progressBarAct);
    // console.log(progressBar);
    clearInterval(watchHeader);
  }
}, 10);

const audioChangeTime = (event) => {
  const mouseX = Math.floor(
    event.pageX - progressBar.getBoundingClientRect().left
  );
  const progress = mouseX / progressBar.offsetWidth;
  audios.get(currentAudio).audioPlayer.currentTime =
    audios.get(currentAudio).audioPlayer.duration * progress;
};

const progressBarAct = async (event) => {
  audioChangeTime(event);

  if (audios.get(currentAudio).audioLi.classList.contains("paused")) {
    audios.get(currentAudio).playButton.click();
  }
};

export default class Audio {
  constructor(audioLi, audio) {
    this.audio = audio;
    this.audioLi = audioLi.cloneNode(true);
    this.title = this.audioLi.querySelector(".audio-header>.title");
    this.clickableBackground = this.audioLi.querySelector(
      ".clickable-background"
    );
    this.imageWrapper = this.audioLi.querySelector(".artist-image-wrapper");

    this.audioPlayer = document.createElement("audio");
    this.audioPlayer.setAttribute("src", "");
    this.audioPlayer.setAttribute("id", "audio-player");
    this.audioPlayer.setAttribute("class", "audio-player");
    this.audioPlayer.setAttribute("preload", "metadata");
    this.playButton = this.audioLi.querySelector(".play-button");
    this.audioFullTitle = this.#constructAudioFullTitle();

    this.genres = this.audioLi.querySelector(".genres");
    // this.progressBar = this.audioLi.querySelector(".progress-bar");
    this.currentTime = this.audioLi.querySelector(".curr-time>span");
    this.durationTime = this.audioLi.querySelector(".duration>span");

    this.addButton = this.audioLi.querySelector(".add-button");
    this.deleteButton = this.audioLi.querySelector(".delete-button");
    this.editButton = this.audioLi.querySelector(".edit-button");
    this.infoButton = this.audioLi.querySelector(".info-button");
    this.hiddenTime = this.audioLi.querySelector(".time .hidden");

    this.configure();
  }

  configure() {
    this.insertArtists();
    this.displayTags();
    this.addEventListeners();

    this.title.innerText = this.audio.title;
    this.durationTime.innerText = this.audioTime(this.audio.duration);
    progressBar.max = Math.floor(this.audio.duration);
  }

  displayTags() {
    this.audio.genres.forEach((genre) => {
      const genreDiv = document.createElement("div");
      genreDiv.href =
        "/genres/" + genre.genre_name.replace(/ /g, "+").replace(/\//g, "%2F");
      genreDiv.classList.add("genre");
      genreDiv.setAttribute("data-genre-name", genre.genre_name);
      genreDiv.style.backgroundColor = "white";
      genreDiv.innerText = genre.genre_name;
      genreDiv.addEventListener("click", this.insertTagParam);

      this.genres.append(genreDiv);
    });
  }

  insertTagParam(event) {
    const genreName = event.target.getAttribute("data-genre-name");
    if (
      (lushURL.has("genres") &&
        !lushURL.get("genres").split("_").includes(genreName)) ||
      !lushURL.has("genres")
    ) {
      lushURL.append("genres", genreName);

      audioSearchBar.insertGenreQuery(genreName);
      audioSearchBar.configureGenresRequest();
    }
  }

  addEventListeners() {
    this.playButton.addEventListener("click", this.play);
    this.clickableBackground.addEventListener("click", this.play);

    this.audioPlayer.addEventListener("timeupdate", this.audioProgress);
    this.audioPlayer.addEventListener("ended", this.playNext);

    this.addButton.addEventListener("click", () => alert("Add"));
    this.deleteButton.addEventListener("click", () => alert("Delete"));
    this.editButton.addEventListener("click", this.editAudioButtonOnClick);
    this.infoButton.addEventListener("click", () => alert("Info"));
  }

  insertArtists() {
    const parsedArtists = this.parseArtists(this.audio.artists);
    const artistsDiv = this.audioLi.querySelector(".audio-header>.artists");

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

      const linkEl = document.createElement("a");
      const link = `/artists/${artist.artist_id}/${artist.name
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

  #constructAudioFullTitle() {
    const artistNamesArray = this.audio.artists.reduce(function (rv, x) {
      rv.push(x.name);
      return rv;
    }, []);

    var artists;
    if (artistNamesArray.length <= 0) {
      artists = "";
    } else if (artistNamesArray.length === 1) {
      artists = artistNamesArray[0];
    } else {
      artists =
        artistNamesArray.slice(0, -1).join(", ") +
        " & " +
        artistNamesArray.slice(-1);
    }

    const audioFullTitle = this.audio.title + " — " + artists;

    return audioFullTitle;
  }

  setAttributes(title) {
    this.title.innerText = title;
  }

  hideTimePrev() {
    const prevAudio = audios.get(currentAudio);
    prevAudio.hiddenTime.classList.add("hidden");
    prevAudio.hiddenTime.classList.remove("display-flex");
  }

  showTime() {
    this.hiddenTime.classList.add("display-flex");
    this.hiddenTime.classList.remove("hidden");
  }

  play = async () => {
    document.title = this.audioFullTitle;

    if (currentAudio && currentAudio !== this.audioLi) {
      currentAudio.classList.remove("current", "playing", "paused");
      this.hideTimePrev();

      const audioPlayer = audios.get(currentAudio)?.audioPlayer;
      stopAudio(audioPlayer);
      revokeObjectURL(audioPlayer);

      audioPlayer.onloadeddata = null;
    }

    currentAudio = this.audioLi;
    currentAudio.classList.add("current");

    if (currentAudio.classList.contains("playing")) {
      currentAudio.classList.remove("playing");
      currentAudio.classList.add("paused");

      this.audioPlayer.pause();
    } else {
      currentAudio.classList.remove("paused");
      currentAudio.classList.add("playing");
      this.showTime();

      if (this.audioPlayer.src === document.location.href) {
        await this.fetchBlob({
          blobID: Number(this.audio.blob_id),
        });
      }

      this.displayCurrentAudio();
      this.audioPlayer.play();
    }
  };

  displayCurrentAudio() {
    const currentAudioEl = document.getElementById("current-audio");

    const artistsDiv = currentAudioEl.querySelector(".audio-header>.artists");
    const parsedArtists = this.parseArtists(this.audio.artists);
    artistsDiv.replaceWith(parsedArtists);

    const titleDiv = currentAudioEl.querySelector(".audio-header>.title");
    titleDiv.innerText = this.audio.title;

    header.classList.add("border-bottom");
    header.classList.add("fixed");
    document.getElementById("main").classList.add("compensate-header");
    currentAudioEl.style.visibility = "visible";
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
        console.log("Error occured while fetching blob.", error)
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
      this.audioPlayer.currentTime /
        (Math.floor(this.audioPlayer.duration) / progressBar.max)
    );

    progressBar.value = progress || 0;
    this.currentTime.innerHTML = this.audioTime(this.audioPlayer.currentTime);
  };

  playNext = async () => {
    var nextSibling;
    if ((nextSibling = this.audioLi.nextSibling)) {
      audios.get(nextSibling).playButton.click();
    } else {
      currentAudio.classList.remove("current", "playing", "paused");

      const audioPlayer = audios.get(currentAudio)?.audioPlayer;
      stopAudio(audioPlayer);
      revokeObjectURL(audioPlayer);

      audioPlayer.onloadeddata = null;
    }
  };

  editAudioButtonOnClick = () => {
    editAudioWindow.open(this.audioLi);
  };

  setAudioPlayerSrc(url) {
    this.audioPlayer.src = url;
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
