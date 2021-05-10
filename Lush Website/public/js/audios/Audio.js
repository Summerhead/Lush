import { audiosConfigurator, editAudioWindow } from "./loadAudios.js";
import showPage from "../partials/loadContent.js";
import { lushURL } from "../partials/loadContent.js";
import { audioSearchBar } from "../searchBar/audios/loadAudioSearchBar.js";
import { audios } from "./AudiosConfigurator.js";
import { header } from "../header/loadHeader.js";

var currentAudio;

export default class Audio {
  constructor(audioLi, audio) {
    this.audio = audio;
    this.audio.audioFullTitle = this.#constructAudioFullTitle();
    this.audioLi = audioLi.cloneNode(true);
    this.titleEl = this.audioLi.querySelector(".audio-header>.title");
    this.artistsEl = this.audioLi.querySelector(".audio-header>.artists");
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

    this.titleEl.innerText = this.audio.title;
    this.durationTime.innerText = this.audioTime(this.audio.duration);
    header.progressBar.max = Math.floor(this.audio.duration);
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
      (lushURL.hasGenres() &&
        !lushURL.getGenres().split("_").includes(genreName)) ||
      !lushURL.hasGenres()
    ) {
      lushURL.setGenre(genreName);

      audioSearchBar.insertGenreQuery(genreName);
      audioSearchBar.configureGenresRequest();
    }
  }

  addEventListeners() {
    this.playButton.addEventListener("click", this.play);
    this.clickableBackground.addEventListener("click", this.play);

    this.audioPlayer.addEventListener("timeupdate", this.audioProgress);
    this.audioPlayer.addEventListener("playing", this.setPlayingStyle);
    this.audioPlayer.addEventListener("pause", this.setPauseStyle);
    this.audioPlayer.addEventListener("ended", audiosConfigurator.playNext);

    // this.addButton.addEventListener("click", () => alert("Add"));
    // this.deleteButton.addEventListener("click", () => alert("Delete"));
    this.editButton.addEventListener("click", this.editAudioButtonOnClick);
    // this.infoButton.addEventListener("click", () => alert("Info"));
  }

  insertArtists() {
    const parsedArtists = this.parseArtists(this.audio.artists);
    this.artistsEl.replaceWith(parsedArtists);
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
    this.titleEl.innerText = title;
  }

  play = async () => {
    document.title = this.audio.audioFullTitle;
    header.setAudioPlayer(this.audioPlayer);

    if (currentAudio && currentAudio !== this.audioLi) {
      this.setStopStyle();
    }

    currentAudio = this.audioLi;
    currentAudio.classList.add("current");

    if (currentAudio.classList.contains("playing")) {
      this.audioPlayer.pause();
    } else {
      if (this.audioPlayer.src === location.href) {
        await this.fetchBlob({
          blobId: this.audio.blob_id,
        });
      }

      this.audioPlayer.volume = 0.6;
      this.audioPlayer.play();
    }
  };

  setPlayingStyle = () => {
    currentAudio.classList.remove("paused");
    currentAudio.classList.add("playing");

    this.configureCurrentAudio();
  };

  setPauseStyle = () => {
    currentAudio.classList.remove("playing");
    currentAudio.classList.add("paused");
  };

  setStopStyle = () => {
    currentAudio.classList.remove("current", "playing", "paused");

    const audioPlayer = audios.get(currentAudio)?.audioPlayer;
    stopAudio(audioPlayer);
    revokeObjectURL(audioPlayer);

    audioPlayer.onloadeddata = null;
  };

  configureCurrentAudio() {
    const parsedArtists = this.parseArtists(this.audio.artists);
    header.audioLi = this.audioLi;
    header.displayCurrentAudio(parsedArtists, this.audio.title);
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
        (Math.floor(this.audioPlayer.duration) / header.progressBar.max)
    );

    header.progressBar.value = progress || 0;
    this.currentTime.innerHTML = this.audioTime(this.audioPlayer.currentTime);
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
