import Audio, { currentAudio } from "./Audio.js";
import { rgb, bw } from "../artist/ArtistConfigurator.js";
import { lushURL } from "../partials/loadContent.js";
import { header } from "../header/loadHeader.js";
import { editPlaylistWindow } from "../playlists/loadPlaylists.js";
import { artistConfigurator } from "../artist/loadArtist.js";

const audios = new WeakMap();

export default class AudiosConfigurator {
  constructor(audioLi, audiosOlQuery, isDummy, audiosRequest) {
    this.audioLi = audioLi;

    this.defaultDataRequest = {
      artistId: lushURL.processArtistId(),
      playlistId: lushURL.processPlaylistId(),
      search: lushURL.getQuery(),
      genres: lushURL.processGenresQuery(),
      shuffle: lushURL.processShuffleQuery(),
      limit: 100,
      offset: 0,
    };
    this.dataRequest = audiosRequest || this.defaultDataRequest;

    this.audiosOlQuery = audiosOlQuery || "#main .audios-ol";
    this.audiosOl = document.querySelector(this.audiosOlQuery);
    this.audios = [];
    this.atTheBottom = true;
    this.requestResolved = false;
    this.rgb;
    this.isDummy = isDummy;

    header.setPlayPrevNextListeners(this);

    this.configure();
    this.fetchData();
  }

  configure() {
    window.onscroll = () => {
      if (
        !this.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.audiosOl.offsetTop + this.audiosOl.offsetHeight - 200
      ) {
        this.atTheBottom = true;
        this.dataRequest.offset += this.dataRequest.limit;

        this.fetchData();
      }
    };
  }

  fetchData() {
    new Promise((resolve, reject) => {
      this.requestResolved = false;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/audiosData", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          resolve();

          this.displayAudios(xhr.response);
          this.setColorForTags();

          if (lushURL.currentPage === "artist") {
            artistConfigurator.setPlayFirstAudioEventListener();
          }
        }
      };

      xhr.send(JSON.stringify(this.dataRequest));
    }).then(() => (this.requestResolved = true));
  }

  displayAudios(xhrResponse) {
    const data = JSON.parse(xhrResponse);
    console.log("Data:", data);

    const returnedRows = data.audios.length;

    if (data.status === 200) {
      if (returnedRows) {
        for (const audio of data.audios) {
          if (this.isDummy) {
            var audioClass = new Audio(this.audioLi, audio);
            var audioLi = audioClass.audioLi;
            audioLi.addEventListener("click", this.addChosenClass);
          } else {
            const isCurrentlyPlaying =
              audio.audio_id === audios.get(currentAudio)?.audio.audio_id;

            var audioLi, audioClass;
            if (isCurrentlyPlaying) {
              audioClass = audios.get(currentAudio);
              audioLi = this.transformCurrentAudio();
            } else {
              audioClass = new Audio(this.audioLi, audio);
              audioLi = audioClass.audioLi;
            }
          }
          audioLi.audioId = audio.audio_id;
          audios.set(audioLi, audioClass);
          const imageWrapper = audioClass.imageWrapper;

          let image_id;
          for (const artist of audio.artists) {
            if (artist.image_id) {
              image_id = artist.image_id;
              break;
            }
          }

          if (lushURL.currentPage !== "artist" && image_id) {
            imageWrapper.classList.remove("no-cover");
            imageWrapper.style.backgroundImage = `url("https://drive.google.com/uc?export=view&id=${image_id}")`;
          }

          if (!this.isDummy) {
            audioClass.clickableBackground.draggable = true;
            audioClass.clickableBackground.addEventListener(
              "drag",
              setDragging
            );
            audioLi.addEventListener("dragover", setDraggedOver);
            audioLi.addEventListener("drop", this.compare);
          }

          this.audios.push(audioLi);

          this.audiosOl.appendChild(audioLi);
        }

        if (returnedRows === this.dataRequest.limit) {
          this.atTheBottom = false;
        }
      }
    }
  }

  addChosenClass = (event) => {
    const audioLi = event.target.closest(".audio-li");
    audioLi.classList.toggle("chosen");

    const chosenAudioId = audios.get(audioLi).audio.audio_id;
    if (editPlaylistWindow.chosenAudiosIds.has(chosenAudioId)) {
      editPlaylistWindow.chosenAudiosIds.delete(chosenAudioId);
    } else {
      editPlaylistWindow.chosenAudiosIds.add(chosenAudioId);
    }
  };

  transformCurrentAudio() {
    if (lushURL.currentPage === "artist") {
      const currentAudioClass = audios.get(currentAudio);
      currentAudioClass.imageWrapper.removeAttribute("style");
      currentAudioClass.imageWrapper.classList.add("no-cover");
    }

    return currentAudio;
  }

  playNext = (event) => {
    const currentAudioClass = audios.get(currentAudio);
    if (
      header.repeatCurrentAudio &&
      event.target !== header.playPrevButton &&
      event.target !== header.playNextButton
    ) {
      currentAudioClass.stopAudio(currentAudioClass.audioPlayer);
      currentAudioClass.play();
    } else {
      const nextSibling = currentAudio.nextSibling;
      if (nextSibling) {
        currentAudioClass.setStopStyle();
        const nextAudioClass = audios.get(nextSibling);
        nextAudioClass.playButton.click();
      } else {
        currentAudioClass.setPauseStyle();
      }
    }
  };

  playPrev() {
    const prevSibling = currentAudio.previousSibling;
    const currentAudioClass = audios.get(currentAudio);
    if (prevSibling) {
      currentAudioClass.setStopStyle();
      const prevAudioClass = audios.get(prevSibling);
      prevAudioClass.playButton.click();
    } else {
      currentAudioClass.setPauseStyle();
    }
  }

  playFirst = () => {
    const firstAudioLi = this.audiosOl.getElementsByClassName("audio-li")[0];
    const firstAudiolClass = audios.get(firstAudioLi);
    firstAudiolClass.play();
  };

  setColorForTags() {
    const genresEls = [...document.querySelectorAll(".audio-li .genres")];
    const genreEls = [...document.querySelectorAll(".audio-li .genre")];

    if (
      rgb &&
      lushURL.currentPage !== "music" &&
      lushURL.currentPage !== "playlists" &&
      lushURL.currentPage !== "playlist"
    ) {
      const { r, g, b } = rgb;

      genresEls.forEach((tagEl) => {
        tagEl.classList.remove("no-color");
        tagEl.classList.add("colored", bw);
      });

      genreEls.forEach((tagEl) => {
        tagEl.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        tagEl.r = r;
        tagEl.g = g;
        tagEl.b = b;
        tagEl.addEventListener("mouseover", this.setStyle);
        tagEl.addEventListener("mouseout", this.removeStyle);
      });
    } else {
      genresEls.forEach((tagEl) => {
        tagEl.classList.remove("colored", "white-theme", "black-theme");
      });

      genreEls.forEach((tagEl) => {
        tagEl.removeAttribute("style");
        tagEl.removeEventListener("mouseover", this.setStyle);
        tagEl.removeEventListener("mouseout", this.removeStyle);
      });
    }
  }

  setStyle(event) {
    const { r, g, b } = event.target;
    event.target.style.backgroundImage = `linear-gradient(rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}))`;
  }

  removeStyle(event) {
    event.target.style.backgroundImage = "";
  }

  renderItems = () => {
    this.audiosOl.innerText = "";
    this.audios.forEach((audioLi) => {
      this.audiosOl.appendChild(audioLi);
    });
  };

  compare = () => {
    const index1 = this.audios.indexOf(dragging);
    const index2 = this.audios.indexOf(draggedOver);
    this.audios.splice(index1, 1);
    this.audios.splice(index2, 0, dragging);

    this.renderItems();
  };
}

var dragging, draggedOver;

const setDraggedOver = (e) => {
  e.preventDefault();
  draggedOver = e.target.closest(".audio-li");
};

const setDragging = (e) => {
  dragging = e.target.closest(".audio-li");
};

export { audios };
