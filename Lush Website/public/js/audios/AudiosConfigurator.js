import Audio, { currentAudio } from "./Audio.js";
import { rgb, bw } from "../artist/ArtistConfigurator.js";
import { lushURL } from "../partials/loadContent.js";
import { header } from "../header/loadHeader.js";
import { editPlaylistWindow } from "../playlists/loadPlaylists.js";

const audios = new WeakMap();

export default class AudiosConfigurator {
  constructor(audioLi, audiosOlQuery, isDummy, dataRequest) {
    this.audioLi = audioLi;

    this.defaultDataRequest = {
      artistId: this.processArtistId(),
      playlistId: this.processPlaylistId(),
      search: lushURL.getQuery(),
      genres: this.processGenresQuery(lushURL.getGenres()),
      shuffle: this.processShuffleQuery(lushURL.getShuffle()),
      limit: 100,
      offset: 0,
    };
    this.dataRequest = { dataRequest: dataRequest || this.defaultDataRequest };

    this.audiosOlQuery = audiosOlQuery || "#main .audios-ol";
    this.audiosOl = document.querySelector(this.audiosOlQuery);
    this.audios = [];
    this.atTheBottom = true;
    this.audiosRequestResolved = false;
    this.rgb;
    this.isDummy = isDummy;

    header.setPlayPrevNextListeners(this);

    this.getAudios();
    this.applyWindowOnScroll();
  }

  processArtistId() {
    if (lushURL.currentPage === "artist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  processPlaylistId() {
    if (lushURL.currentPage === "playlist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  processGenresQuery(genres) {
    if (genres) {
      genres = genres.split("_");
    }
    return genres;
  }

  processShuffleQuery(shuffle) {
    if (shuffle == 1) {
      return true;
    }
    return false;
  }

  getAudios() {
    new Promise((resolve, reject) => {
      this.audiosRequestResolved = false;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/audioData", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(this.dataRequest));

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          resolve();

          if (this.isDummy) {
            this.displayAudiosForEditPlaylistWindow(xhr.response);
          } else {
            this.displayAudios(xhr.response);
          }
          this.setColorForTags();
        }
      };
    }).then(() => (this.audiosRequestResolved = true));
  }

  displayAudios(xhrResponse) {
    const data = JSON.parse(xhrResponse);
    console.log("Data:", data);

    const returnedRows = data.audios.length;

    if (data.status === 200) {
      if (returnedRows) {
        this.audios = [];

        for (const audio of data.audios) {
          const isCurrentlyPlaying =
            audio.audio_id === audios.get(currentAudio)?.audio.audio_id;

          var audioLi, audioClass;
          if (isCurrentlyPlaying) {
            audioClass = audios.get(currentAudio);
            audioLi = this.transformCurrentAudio();
          } else {
            audioClass = new Audio(this.audioLi, audio, this.isDummy);
            audioLi = audioClass.audioLi;
          }
          audioLi.audioId = audio.audio_id;
          audios.set(audioLi, audioClass);
          const imageWrapper = audioClass.imageWrapper;

          let image_id = null;
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

          // audioLi.draggable = true;
          // audioLi.addEventListener("drag", setDragging);
          // audioLi.addEventListener("dragover", setDraggedOver);
          // audioLi.addEventListener("drop", this.compare);

          this.audios.push(audioLi);

          this.audiosOl.appendChild(audioLi);
        }

        if (returnedRows === this.dataRequest.dataRequest.limit) {
          this.atTheBottom = false;
        }
      }
    }

    // this.waitRGB();
  }

  displayAudiosForEditPlaylistWindow(xhrResponse) {
    const data = JSON.parse(xhrResponse);
    console.log("Data:", data);

    const returnedRows = data.audios.length;

    if (data.status === 200) {
      if (returnedRows) {
        this.audios = [];

        for (const audio of data.audios) {
          var audioClass = new Audio(this.audioLi, audio, true);
          var audioLi = audioClass.audioLi;
          this.addEventListeners(audioLi);
          audioLi.audioId = audio.audio_id;
          audios.set(audioLi, audioClass);
          const imageWrapper = audioClass.imageWrapper;

          let image_id = null;
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

          this.audios.push(audioLi);

          this.audiosOl.appendChild(audioLi);
        }

        if (returnedRows === this.dataRequest.dataRequest.limit) {
          this.atTheBottom = false;
        }
      }
    }
  }

  addEventListeners(audioLi) {
    audioLi.addEventListener("click", this.addChosenClass);
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

  playNext = async () => {
    const nextSibling = currentAudio.nextSibling;
    const currentAudioClass = audios.get(currentAudio);
    if (nextSibling) {
      currentAudioClass.setStopStyle();
      const nextAudioClass = audios.get(nextSibling);
      nextAudioClass.playButton.click();
    } else {
      currentAudioClass.setPauseStyle();
    }
  };

  playPrev = async () => {
    const prevSibling = currentAudio.previousSibling;
    const currentAudioClass = audios.get(currentAudio);
    if (prevSibling) {
      currentAudioClass.setStopStyle();
      const prevAudioClass = audios.get(prevSibling);
      prevAudioClass.playButton.click();
    } else {
      currentAudioClass.setPauseStyle();
    }
  };

  setColorForTags() {
    const genresEls = [...document.querySelectorAll(".audio-li .genres")];
    const genreEls = [...document.querySelectorAll(".audio-li .genre")];
    // const genreEls = [];
    // genresEls.forEach((el) =>
    //   el.querySelectorAll(".genre").forEach((genreEl) => genreEls.push(genreEl))
    // );

    if (
      rgb &&
      lushURL.currentPage !== "music" &&
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

  // waitRGB() {
  //   const waitRGB = setInterval(() => {
  //     const genresEls = [...document.querySelectorAll(".audio-li .genres")];
  //     const genreEls = [...document.querySelectorAll(".audio-li .genre")];

  //     if (rgb && bw) {
  //       this.rgb = rgb;
  //       const { r, g, b } = rgb;
  //       genresEls.forEach((tagEl) => {
  //         tagEl.classList.remove("no-color");
  //         tagEl.classList.add("colored", bw);
  //       });
  //       genreEls.forEach((tagEl) => {
  //         tagEl.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
  //         tagEl.r = r;
  //         tagEl.g = g;
  //         tagEl.b = b;
  //         tagEl.addEventListener("mouseover", this.setStyle);
  //         tagEl.addEventListener("mouseout", this.removeStyle);
  //       });
  //     }

  //     if (rgb === "" && bw === "") {
  //       genreEls.forEach((tagEl) => {
  //         tagEl.removeAttribute("style");
  //       });
  //     }

  //     if (
  //       lushURL.currentPage === "music" ||
  //       lushURL.currentPage === "playlist"
  //     ) {
  //       clearInterval(waitRGB);

  //       genresEls.forEach((tagEl) => {
  //         tagEl.classList.remove("colored", "white-theme", "black-theme");
  //       });
  //       genreEls.forEach((tagEl) => {
  //         tagEl.removeAttribute("style");
  //         tagEl.removeEventListener("mouseover", this.setStyle);
  //         tagEl.removeEventListener("mouseout", this.removeStyle);
  //       });
  //     }
  //   }, 10);
  // }

  setStyle(event) {
    const { r, g, b } = event.target;
    event.target.style.backgroundImage = `linear-gradient(rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}))`;
  }

  removeStyle(event) {
    event.target.style.backgroundImage = "";
  }

  applyWindowOnScroll() {
    window.onscroll = () => {
      if (
        !this.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.audiosOl.offsetTop + this.audiosOl.offsetHeight - 200
      ) {
        this.atTheBottom = true;
        this.defaultDataRequest.offset += this.defaultDataRequest.limit;

        this.getAudios();
      }
    };
  }

  renderItems = () => {
    this.audiosOl.innerText = "";
    console.log("here");
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
  dragging = e.target;
};

export { audios };
