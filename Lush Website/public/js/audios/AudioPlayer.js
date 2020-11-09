import { mainElement, audiosDiv, audiosOl, returnedRows } from "./getAudios.js";
import { openEditAudioWindow } from "./editAudioWindow/editAudioWindow.js";

var metadataCount = 0;
var currentAudio;

export default class AudioPlayer extends HTMLElement {
  constructor(audioLi, artists, title) {
    super();

    for (const child of audioLi.children) {
      this.appendChild(child.cloneNode(true));
    }

    this.audioPlayer = this.querySelector("#audio-player");
    this.progressBar = this.querySelector("#audio-hud__progress-bar");
    this.currentTime = this.querySelector("#audio-hud__curr-time>span");
    this.durationTime = this.querySelector("#audio-hud__duration>span");
    this.actionButton = this.querySelector("#audio-hud__action");
    this.deleteButton = this.querySelector("#delete-button");
    this.editButton = this.querySelector("#edit-button");
    this.infoButton = this.querySelector("#info-button");

    this.configureAudioPlayer(artists, title);
  }

  configureAudioPlayer(artists, title) {
    this.setAttribute("class", "audio-container");

    this.querySelector(".audio-header>.artists").innerText = artists;
    this.querySelector(".audio-header>.title").innerText = title;

    this.audioPlayer.onloadedmetadata = () =>
      this.audioPlayerOnLoadedMetadata();
  }

  audioPlayerOnLoadedMetadata() {
    this.durationTime.innerHTML = this.audioTime(this.audioPlayer.duration);
    this.progressBar.max = Math.floor(this.audioPlayer.duration);

    const mutationObserver = new MutationObserver(
      this.classListMutationDetector.bind(this)
    );
    mutationObserver.observe(this.actionButton, { attributes: true });

    this.actionButton.addEventListener(
      "click",
      this.actionButtonChangeClass.bind(this)
    );

    this.audioPlayer.addEventListener(
      "timeupdate",
      this.audioProgress.bind(this)
    );
    this.audioPlayer.addEventListener("ended", (audioElement) =>
      this.playNext(audioElement)
    );

    this.progressBar.addEventListener("click", this.progressBarAct.bind(this));
    this.progressBar.addEventListener("click", (audioElement) =>
      this.audioChangeTime(audioElement)
    );

    this.deleteButton.addEventListener("click", () => alert("Delete"));
    this.editButton.addEventListener("click", this.editAudioButtonOnClick);
    this.infoButton.addEventListener("click", () => alert("Info"));

    metadataCount++;

    if (metadataCount == returnedRows) {
      console.log("All metadata loaded.");
      audiosDiv.appendChild(audiosOl);
      mainElement.appendChild(audiosDiv);
    }
  }

  classListMutationDetector(mutationsList) {
    mutationsList.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        this.audioAct();
      }
    });
  }

  actionButtonChangeClass(e) {
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
  }

  audioAct() {
    if (
      !this.actionButton.classList.contains("audio-hud__action_play") &&
      !this.actionButton.classList.contains("audio-hud__action_pause")
    ) {
      this.stopAudio();
    }

    if (this.actionButton.classList.contains("audio-hud__action_play")) {
      this.audioPlayer.play();
    } else {
      this.audioPlayer.pause();
    }
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

  audioProgress() {
    const progress = Math.ceil(
      this.audioPlayer.currentTime /
        (Math.floor(this.audioPlayer.duration) / this.progressBar.max)
    );

    this.progressBar.value = progress || 0;
    this.currentTime.innerHTML = this.audioTime(this.audioPlayer.currentTime);
  }

  playNext(e) {
    this.actionButton.setAttribute(
      "class",
      "audio-hud__element audio-hud__action"
    );

    var nextSibling;
    var nextAudio;
    if ((nextSibling = e.target.closest(".audio-list-item").nextSibling)) {
      nextAudio = nextSibling.querySelector(".audio-container");

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

  progressBarAct() {
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
  }

  editAudioButtonOnClick(e) {
    const editAudioWindowContainer = document.getElementById(
      "edit-audio-window-container"
    );

    openEditAudioWindow(
      editAudioWindowContainer,
      e.target.closest(".audio-list-item")
    );
    editAudioWindowContainer.style.display = "block";
  }

  setAudioPlayerSrc(url) {
    this.audioPlayer.src = url;
  }
}

window.customElements.define("audio-player", AudioPlayer);
