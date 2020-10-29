import * as loadAudioTemplate from "./loadAudioTemplate.js";
// import player from "./partials/audio.js";

export default async function getAudios() {
  const mainElement = document.getElementsByTagName("main")[0],
    audiosDiv = document.createElement("div"),
    audiosOl = document.createElement("ol");
  audiosDiv.setAttribute("id", "audios");
  audiosOl.setAttribute("id", "audios-ordered-list");

  const reqAudioData = {
    artistID: Number(document.location.pathname.split("/")[2]) || null,
    limit: 50,
    offset: 0,
  };

  var metadataCount = 0;
  var rowReturned = 0;

  var currentAudio;
  var currentDropdown;

  fetchRow(reqAudioData);

  function fetchRow(audioReqData) {
    $.ajax({
      type: "POST",
      url: "/audioData",
      data: JSON.stringify(audioReqData),
      contentType: "application/json",
      dataType: "json",
      success: function (data) {
        console.log("Data:", data);

        rowReturned = data.audios.length;

        if (data.status === 200) {
          for (const audio of data.audios) {
            const audioDiv = constructPlayer(
                parseArtists(audio.artists),
                audio.title
              ),
              reqAudioBlob = { blobID: audio.blob_id };

            audioDiv.setAttribute("data-audio-id", audio.id);

            var artistAttributes = "";
            for (const [index, artist] of audio.artists.entries()) {
              const dataArtistAttribute = "data-artist-" + (index + 1);
              artistAttributes += dataArtistAttribute + " ";
              audioDiv.setAttribute(dataArtistAttribute, artist);
            }
            artistAttributes = artistAttributes.trim();
            audioDiv.setAttribute("data-artist-attributes", artistAttributes);
            audioDiv.setAttribute("data-audio-title", audio.title);

            fetchBlob(reqAudioBlob, audioDiv);
          }
        }
      },
      error: function (error) {
        console.log("Error:", error);
      },
    });
  }

  function fetchBlob(reqAudioBlob, songDiv) {
    fetch("/audioBlob", {
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
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => (songDiv.querySelector("#audio-player").src = url))
      .catch(console.error);
  }

  function parseArtists(artists) {
    if (artists.length > 2) {
      artists = [
        artists.slice(0, artists.length - 1).join(", "),
        artists[artists.length - 1],
      ].join(" & ");
    } else if (artists.length > 1) {
      artists = artists.join(" & ");
    }

    return artists;
  }

  function constructPlayer(artists, title) {
    const audioDiv = loadAudioTemplate.audioLi.cloneNode(true),
      audioPlayer = audioDiv.querySelector("#audio-player"),
      progressBar = audioDiv.querySelector("#audio-hud__progress-bar"),
      currTime = audioDiv.querySelector("#audio-hud__curr-time>span"),
      durationTime = audioDiv.querySelector("#audio-hud__duration>span"),
      actionButton = audioDiv.querySelector("#audio-hud__action"),
      actionButtonImg = actionButton.querySelector("img"),
      deleteButton = audioDiv.querySelector("#delete-button"),
      editButton = audioDiv.querySelector("#edit-button"),
      infoButton = audioDiv.querySelector("#info-button");

    audioDiv.querySelector(".audio-header>.artists").innerHTML = artists;
    audioDiv.querySelector(".audio-header>.title").innerHTML = title;

    const audioObject = {};
    audioObject.audioPlayer = audioPlayer;
    audioObject.progressBar = progressBar;
    audioObject.currTime = currTime;
    audioObject.durationTime = durationTime;
    audioObject.actionButton = actionButton;
    audioObject.actionButtonImg = actionButtonImg;

    function audioAct() {
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
      const editAudioWindow = document.getElementById("edit-audio-window");
      editAudioWindow.style.display = "block";

      window.onclick = function (event) {
        if (
          !event.target.matches("#edit-audio-window") &&
          !event.target.matches("#edit-button")
        ) {
          editAudioWindow.style.display = "none";
        }
      };
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

      if (metadataCount == rowReturned) {
        console.log("All metadata loaded.");
        audiosDiv.appendChild(audiosOl);
        mainElement.appendChild(audiosDiv);
      }
    };

    audiosOl.appendChild(audioDiv);

    return audioDiv;
  }
}
