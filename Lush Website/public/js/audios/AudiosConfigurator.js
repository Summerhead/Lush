import Audio, { currentAudio } from "./Audio.js";
import { rgb, bw } from "../artists/artist/ArtistConfigurator.js";
import { lushURL } from "../partials/loadContent.js";

const audios = new WeakMap();

export default class AudiosConfigurator {
  constructor(audioLi, dataRequest) {
    this.audioLi = audioLi;
    this.defaultDataRequest = {
      artistID: document.location.pathname.split("/")[2],
      search: lushURL.get("search"),
      genres: this.processGenresQuery(lushURL.get("genres")),
      shuffle: this.processShuffleQuery(lushURL.get("shuffle")),
      limit: 100,
      offset: 0,
    };
    this.dataRequest = dataRequest || this.defaultDataRequest;

    this.audiosOl = document.getElementById("audios-ol");
    this.atTheBottom = true;
    this.audiosRequestResolved = false;

    this.getAudios();
    this.applyWindowOnScroll();
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
      xhr.send(JSON.stringify({ dataRequest: this.dataRequest }));

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          resolve();

          this.displayAudios(xhr);
        }
      };
    }).then(() => (this.audiosRequestResolved = true));
  }

  displayAudios(xhr) {
    const data = JSON.parse(xhr.response);
    console.log("Data:", data);

    const returnedRows = data.audios.length;

    if (data.status === 200) {
      if (returnedRows) {
        for (const audio of data.audios) {
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
          audioLi.audioId = audio.audio_id;
          audios.set(audioLi, audioClass);
          const imageWrapper = audioClass.imageWrapper;

          // console.log(audio.artists[0]);
          if (
            !Number.isInteger(Number(document.location.pathname.split("/")[2]))
          ) {
            const reqArtistBlobID = {
              artistID: audio.artists[0].artist_id,
            };
            this.fetchImageBlob(reqArtistBlobID, imageWrapper);
          }

          this.audiosOl.appendChild(audioLi);
        }

        if (returnedRows === this.dataRequest.limit) {
          this.atTheBottom = false;
        }
      }
    }

    this.waitRGB();
  }

  transformCurrentAudio() {
    if (Number.isInteger(Number(document.location.pathname.split("/")[2]))) {
      const currentAudioClass = audios.get(currentAudio);
      currentAudioClass.imageWrapper.removeAttribute("style");
      currentAudioClass.imageWrapper.classList.add("no-cover");
    }

    return currentAudio;
  }

  fetchImageBlob(reqImageBlob, imageWrapper) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/artistsData", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    const reqArtistDataSpec = {
      artistID: reqImageBlob.artistID || null,
      limit: 1,
      offset: 0,
    };
    xhr.send(JSON.stringify(reqArtistDataSpec));

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const data = JSON.parse(xhr.response);
        // console.log("Data:", data);

        const returnedRows = data.artists.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const artist of data.artists) {
              const reqImageBlob = { blobID: artist.blob_id };
              this.fetchBlob(reqImageBlob, imageWrapper);
            }
          }
        }
      }
    };
  }

  fetchBlob(reqImageBlob, imageWrapper) {
    fetch("/imageBlob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqImageBlob),
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
      .then((blob) => (blob.size ? URL.createObjectURL(blob) : null))
      .then((url) => {
        if (url) {
          imageWrapper.classList.remove("no-cover");
          imageWrapper.style.backgroundImage = `url("${url}")`;
        }
        // URL.revokeObjectURL(url);
      })
      .catch(console.error);
  }

  waitRGB() {
    const waitRGB = setInterval(() => {
      const genreEls = [...document.querySelectorAll(".audio-li .genre")];

      if (rgb && bw) {
        const { r, g, b } = rgb;
        genreEls.forEach((tagEl) => {
          tagEl.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
          tagEl.style.border = "0px";
          tagEl.style.color = bw;
        });
      }

      if (rgb === "" && bw === "") {
        genreEls.forEach((tagEl) => {
          tagEl.style.backgroundColor = "white";
          tagEl.style.border = "1px solid rgb(197, 197, 197)";
          tagEl.style.color = "black";
        });
      }

      if (location.pathname === "/music") {
        clearInterval(waitRGB);

        const genreEls = [...document.querySelectorAll(".audio-li .genre")];
        genreEls.forEach((tagEl) => {
          tagEl.style.backgroundColor = "white";
          tagEl.style.border = "1px solid rgb(197, 197, 197)";
          tagEl.style.color = "black";
        });
      }
    }, 10);
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
}

export { audios };
