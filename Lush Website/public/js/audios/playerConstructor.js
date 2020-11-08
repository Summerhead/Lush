import * as getAudios from "./getAudios.js";
import { openEditAudioWindow } from "./editAudioWindow/editAudioWindow.js";
var metadataCount = 0;
var currentAudio;

export default function playerConstructor(
  audioLi,
  editAudioWindowContainer,
  artists,
  title
) {
  const audioLiClone = audioLi.cloneNode(true),
    audioPlayer = audioLiClone.querySelector("#audio-player"),
    progressBar = audioLiClone.querySelector("#audio-hud__progress-bar"),
    currTime = audioLiClone.querySelector("#audio-hud__curr-time>span"),
    durationTime = audioLiClone.querySelector("#audio-hud__duration>span"),
    actionButton = audioLiClone.querySelector("#audio-hud__action"),
    actionButtonImg = actionButton.querySelector("img"),
    deleteButton = audioLiClone.querySelector("#delete-button"),
    editButton = audioLiClone.querySelector("#edit-button"),
    infoButton = audioLiClone.querySelector("#info-button");

  audioLiClone.querySelector(".audio-header>.artists").innerText = artists;
  audioLiClone.querySelector(".audio-header>.title").innerText = title;

  const audioObject = {};
  audioObject.audioPlayer = audioPlayer;
  audioObject.progressBar = progressBar;
  audioObject.currTime = currTime;
  audioObject.durationTime = durationTime;
  audioObject.actionButton = actionButton;
  audioObject.actionButtonImg = actionButtonImg;

  function stopAudio() {
    currentAudio.audioPlayer.pause();
    currentAudio.audioPlayer.currentTime = 0;
    currentAudio.actionButton.setAttribute(
      "class",
      "audio-hud__element audio-hud__action"
    );
    currentAudio.actionButtonImg.src = "/public/content/icons/play.png";
  }

  function audioAct() {
    if (!!currentAudio && currentAudio !== audioObject) {
      stopAudio();
    }

    currentAudio = audioObject;

    if (audioPlayer.paused) {
      audioPlayer.play();

      actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_play"
      );

      actionButtonImg.src = "/public/content/icons/pause (2).png";
    } else {
      audioPlayer.pause();

      actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_pause"
      );

      actionButtonImg.src = "/public/content/icons/play.png";
    }
  }

  function audioTime(time) {
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

  function audioProgress() {
    const progress = Math.ceil(
      audioPlayer.currentTime /
        (Math.floor(audioPlayer.duration) / progressBar.max)
    );

    progressBar.value = progress || 0;
    currTime.innerHTML = audioTime(audioPlayer.currentTime);
  }

  function playNext(e) {
    stopAudio();

    var nextSibling;
    if ((nextSibling = e.target.parentNode.parentNode.nextSibling)) {
      nextSibling.querySelector("#audio-hud__action").click();
    }
  }

  function audioChangeTime(e) {
    const mouseX = Math.floor(
        e.pageX - progressBar.getBoundingClientRect().left
      ),
      progress = mouseX / progressBar.offsetWidth;
    audioPlayer.currentTime = audioPlayer.duration * progress;
  }

  function progressBarAct() {
    if (!!currentAudio && currentAudio !== audioObject) {
      currentAudio.audioPlayer.pause();
      currentAudio.audioPlayer.currentTime = 0;
      currentAudio.actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action"
      );
      currentAudio.actionButtonImg.src = "/public/content/icons/play.png";
    }

    currentAudio = audioObject;

    if (audioPlayer.paused) {
      audioPlayer.play();

      actionButton.setAttribute(
        "class",
        "audio-hud__element audio-hud__action audio-hud__action_play"
      );

      actionButtonImg.src = "/public/content/icons/pause (2).png";
    }
  }

  function editAudioButtonOnClick(e) {
    openEditAudioWindow(
      editAudioWindowContainer,
      e.target.closest(".audio-list-item")
    );
    editAudioWindowContainer.style.display = "block";
  }

  audioPlayer.onloadedmetadata = function () {
    durationTime.innerHTML = audioTime(audioPlayer.duration);
    progressBar.max = Math.floor(audioPlayer.duration);

    actionButton.addEventListener("click", audioAct);

    audioPlayer.addEventListener("timeupdate", audioProgress);
    audioPlayer.addEventListener("ended", playNext);

    progressBar.addEventListener("click", progressBarAct);
    progressBar.addEventListener("click", audioChangeTime);

    deleteButton.addEventListener("click", () => alert("Hello"));
    editButton.addEventListener("click", editAudioButtonOnClick);
    infoButton.addEventListener("click", () => alert("Hello"));

    metadataCount++;

    if (metadataCount == getAudios.returnedRows) {
      console.log("All metadata loaded.");
      getAudios.audiosDiv.appendChild(getAudios.audiosOl);
      getAudios.mainElement.appendChild(getAudios.audiosDiv);
    }
  };

  getAudios.audiosOl.appendChild(audioLiClone);

  return audioLiClone;
}
