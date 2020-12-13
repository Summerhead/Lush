// import { returnedRows, metadataCountObject, audios } from "./getAudios.js";
import { openEditAudioWindow } from "./editAudioWindow/editAudioWindow.js";

var currentAudio;
// var reqCount = 0;

export default class AudioPlayer extends HTMLElement {
  constructor(audioLi, artists, title, duration) {
    super();

    this.innerHTML = audioLi.innerHTML;

    this.actionButton = this.querySelector("#audio-hud__action");

    this.audioPlayer = document.createElement("audio");
    this.audioPlayer.setAttribute("src", "");
    this.audioPlayer.setAttribute("id", "audio-player");
    this.audioPlayer.setAttribute("class", "audio-player");
    this.audioPlayer.setAttribute("preload", "metadata");

    this.progressBar = this.querySelector("#audio-hud__progress-bar");
    this.currentTime = this.querySelector("#audio-hud__curr-time>span");
    this.durationTime = this.querySelector("#audio-hud__duration>span");

    this.deleteButton = this.querySelector("#delete-button");
    this.editButton = this.querySelector("#edit-button");
    this.infoButton = this.querySelector("#info-button");

    this.configureAudioPlayer(artists, title, duration);
  }

  configureAudioPlayer(artists, title, duration) {
    this.setAttribute("class", "audio-container");

    this.insertArtists(artists);
    this.querySelector(".audio-header>.title").innerText = title;
    this.durationTime.innerText = this.audioTime(duration);
    this.progressBar.max = Math.floor(duration);

    this.addEventListeners();
  }

  addEventListeners() {
    const mutationObserver = new MutationObserver(
      this.classListMutationDetector
    );
    mutationObserver.observe(this.actionButton, { attributes: true });

    this.actionButton.addEventListener("click", this.actionButtonChangeClass);

    this.audioPlayer.addEventListener("timeupdate", this.audioProgress);
    this.audioPlayer.addEventListener("ended", (audioElement) =>
      this.playNext(audioElement)
    );

    this.progressBar.addEventListener("click", this.progressBarAct);

    this.deleteButton.addEventListener("click", () => alert("Delete"));
    this.editButton.addEventListener("click", this.editAudioButtonOnClick);
    this.infoButton.addEventListener("click", () => alert("Info"));
  }

  // setOnLoadedMetadataActionListener() {
  //   this.audioPlayer.onloadedmetadata = () =>
  //     this.audioPlayerOnLoadedMetadata();
  // }

  insertArtists(artists) {
    const parsedArtists = this.parseArtists(artists),
      artistsDiv = this.querySelector(".audio-header>.artists");
    artistsDiv.innerHTML = parsedArtists;
  }

  parseArtists(artists) {
    artists = artists.map((artist) => {
      const aElement = document.createElement("a");
      aElement.setAttribute(
        "href",
        `/artists/${artist.name.split(" ").join("+")}/?id=${artist.id}`
      );
      aElement.innerText = artist.name;
      return aElement.outerHTML;
    });

    if (artists.length > 1) {
      artists = [
        artists.slice(0, artists.length - 1).join(", "),
        artists[artists.length - 1],
      ].join(" & ");
    }

    return artists;
  }

  // audioPlayerOnLoadedMetadata() {
  //   this.durationTime.innerHTML = this.audioTime(this.audioPlayer.duration);
  //   this.progressBar.max = Math.floor(this.audioPlayer.duration);

  //   this.revokeObjectURL();

  //   metadataCountObject.metadataCount++;
  //   if (metadataCountObject.metadataCount == returnedRows) {
  //     console.log("All metadata loaded.");

  //     audios.forEach((audio) => audiosOl.appendChild(audio));

  //     reqCount++;
  //     console.log("Req count:", reqCount);

  //     // window.scrollTo(0, document.body.scrollHeight);
  //   }

  //   this.audioPlayer.onloadedmetadata = null;
  // }

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

  actionButtonChangeClass = (e) => {
    if (currentAudio && currentAudio !== this) {
      currentAudio.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action"
      );
    }

    currentAudio = this;

    if (e.target.classList.contains("audio-hud__action_play")) {
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
      this.audioPlayer.onloadeddata = null;
    } else {
      this.progressBar.style.display = "block";
      if (this.actionButton.classList.contains("audio-hud__action_play")) {
        if (this.audioPlayer.src === document.location.href) {
          this.revoke = false;

          await this.fetchBlob({
            blobID: Number(
              this.closest(".audio-li").getAttribute("data-blob-id")
            ),
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

  playNext() {
    this.actionButton.setAttribute(
      "class",
      "audio-hud__element audio-hud__action"
    );

    var nextSibling;
    if ((nextSibling = this.closest(".audio-li").nextSibling)) {
      var nextAudio = nextSibling.querySelector(".audio-container");

      currentAudio = nextAudio;

      currentAudio.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_play"
      );
    }
  }

  audioChangeTime(e) {
    const mouseX = Math.floor(
        e.pageX - this.progressBar.getBoundingClientRect().left
      ),
      progress = mouseX / this.progressBar.offsetWidth;
    this.audioPlayer.currentTime = this.audioPlayer.duration * progress;
  }

  progressBarAct = async (e) => {
    if (this.audioPlayer.src === document.location.href) {
      this.revoke = false;

      await this.fetchBlob({
        blobID: Number(this.closest(".audio-li").getAttribute("data-blob-id")),
      });

      this.audioPlayer.onloadeddata = () => {
        this.audioChangeTime(e);
      };
    } else {
      this.audioChangeTime(e);
    }

    if (currentAudio && currentAudio !== this) {
      currentAudio.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action"
      );
    }

    currentAudio = this;

    if (this.audioPlayer.paused) {
      this.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_play"
      );
    }
  };

  editAudioButtonOnClick(e) {
    const editAudioWindowContainer = document.getElementById(
      "edit-audio-window-container"
    );

    openEditAudioWindow(
      editAudioWindowContainer,
      e.target.closest(".audio-li")
    );
  }

  setAudioPlayerSrc(url) {
    this.audioPlayer.src = url;
  }
}

window.customElements.define("audio-player", AudioPlayer);
