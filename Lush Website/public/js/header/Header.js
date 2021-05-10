import showPage from "../partials/loadContent.js";
import { currentAudio } from "../audios/Audio.js";
import { lushURL } from "../partials/loadContent.js";
import { audios } from "../audios/AudiosConfigurator.js";

export default class Header {
  constructor(headerTemplate) {
    this.header = headerTemplate;
    this.audioli;
    this.audioPlayer;
    this.playPrevNextListenersAttached = false;

    this.currentAudioEl = this.header.querySelector("#current-audio");
    this.playButton = this.header.querySelector(".play-button");
    this.playPrevButton = this.header.querySelector(".prev-button");
    this.playNextButton = this.header.querySelector(".next-button");
    this.artistsEl = this.currentAudioEl.querySelector(
      ".audio-header>.artists"
    );
    this.titleEl = this.currentAudioEl.querySelector(".audio-header>.title");
    this.progressBar = this.header.querySelector(".progress-bar");
    this.pageLis = this.header.querySelectorAll("#pages a");
    this.linkEls = this.header.querySelectorAll("a");

    this.configure();
    this.display();
  }

  configure() {
    this.playButton.addEventListener("click", this.play);
    this.progressBar.addEventListener("click", this.progressBarAct);

    this.linkEls.forEach((link) => {
      link.onclick = () => {
        showPage(link.href);
        return false;
      };
    });
  }

  display() {
    document.getElementById("header").replaceWith(this.header);
  }

  setDefaultStyle() {
    this.header.style.backgroundColor = "";
    this.header.classList.remove("white-theme", "black-theme", "colored");
    this.header.classList.add("no-color");
    if (currentAudio) {
      this.header.classList.add("border-bottom");
    }

    this.currentAudioEl.style.backgroundColor = "";
    this.currentAudioEl.removeEventListener(
      "mouseover",
      this.changeBackgroundColor
    );
    this.currentAudioEl.removeEventListener(
      "mouseout",
      this.resetBackgroundColor
    );
  }

  setAudioPlayer(audioPlayer) {
    this.audioPlayer = audioPlayer;
    this.audioPlayer.addEventListener("playing", this.setPlayingStyle);
    this.audioPlayer.addEventListener("pause", this.setPauseStyle);
    this.audioPlayer.addEventListener("ended", this.setStopStyle);
  }

  displayCurrentAudio(artists, title) {
    this.currentAudioEl.classList.add("current", "playing");
    this.artistsEl.replaceWith(artists);
    this.artistsEl = artists;
    this.titleEl.innerText = title;

    if (lushURL.currentPage !== "artist") {
      this.header.classList.add("border-bottom");
    }
    this.header.classList.add("fixed");
    document.getElementById("main").classList.add("compensate-header");
    this.currentAudioEl.classList.remove("invisible");
  }

  changeBackgroundColor = () => {
    this.currentAudioEl.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  };

  resetBackgroundColor = (event) => {
    const { r, g, b } = event.currentTarget;
    this.currentAudioEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  };

  setCurrentAudioMouseListeners(r, g, b) {
    this.currentAudioEl.addEventListener(
      "mouseover",
      this.changeBackgroundColor
    );
    this.currentAudioEl.addEventListener("mouseout", this.resetBackgroundColor);
    this.currentAudioEl.r = r;
    this.currentAudioEl.g = g;
    this.currentAudioEl.b = b;

    // this.pageLis.forEach((pageLi) => {
    //   pageLi.addEventListener("mouseover", () => {
    //     pageLi.style.textDecoration = `underline rgb(${r}, ${g}, ${b})`;
    //   });
    //   pageLi.addEventListener("mouseout", () => {
    //     pageLi.style.textDecoration = "none";
    //   });
    // });
  }

  setPlayPrevNextListeners(audiosConfigurator) {
    if (!this.playPrevNextListenersAttached) {
      this.playPrevNextListenersAttached = true;

      this.playPrevButton.addEventListener(
        "click",
        audiosConfigurator.playPrev
      );
      this.playNextButton.addEventListener(
        "click",
        audiosConfigurator.playNext
      );
    }
  }

  play = async () => {
    if (currentAudio.classList.contains("playing")) {
      this.audioPlayer.pause();
    } else {
      if (this.audioPlayer.src === location.href) {
        await this.fetchBlob({
          blobId: Number(this.audio.blob_id),
        });
      }

      this.audioPlayer.play();
    }
  };

  progressBarAct = async (event) => {
    this.audioChangeTime(event);

    if (audios.get(currentAudio).audioLi.classList.contains("paused")) {
      audios.get(currentAudio).playButton.click();
    }
  };

  audioChangeTime = (event) => {
    const mouseX = Math.floor(
      event.pageX - this.progressBar.getBoundingClientRect().left
    );
    const progress = mouseX / this.progressBar.offsetWidth;
    audios.get(currentAudio).audioPlayer.currentTime =
      audios.get(currentAudio).audioPlayer.duration * progress;
  };

  setPlayingStyle = () => {
    this.currentAudioEl.classList.remove("paused");
    this.currentAudioEl.classList.add("playing");
  };

  setPauseStyle = () => {
    this.currentAudioEl.classList.remove("playing");
    this.currentAudioEl.classList.add("paused");
  };

  setStopStyle = () => {
    this.currentAudioEl.classList.remove("current", "playing", "paused");
  };
}
