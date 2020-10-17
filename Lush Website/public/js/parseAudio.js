import * as loadSongTemplate from "./loadSongTemplate.js";
// import player from "./partials/audio.js";

export default async function parseAudios() {
  var songsDiv = document.getElementById("songs"),
    songDiv = loadSongTemplate.songDiv;
  const reqAudioData = {
    limit: 10,
    offset: 1,
  };

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

        if (data.status === 200) {
          for (const audio of data.audios) {
            console.log("Audio:", audio);

            const songDiv = player(parseArtists(audio.artists), audio.title),
              reqAudioBlob = { blobID: audio.blob_id };

            fetchBlob(reqAudioBlob, songDiv);
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

              // When no more data needs to be consumed, break the reading
              if (done) {
                break;
              }

              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
            }

            // Close the stream
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

  function player(artists, title) {
    songDiv = songDiv.cloneNode(true);

    songDiv.querySelector(".audio-header>.artists").innerHTML = artists;
    songDiv.querySelector(".audio-header>.title").innerHTML = title;

    var audioPlayer = songDiv.querySelector("#audio-player");

    //Время

    var progressBar = songDiv.querySelector("#audio-hud__progress-bar");
    var currTime = songDiv.querySelector("#audio-hud__curr-time");
    var durationTime = songDiv.querySelector("#audio-hud__duration");

    //Кнопки

    var actionButton = songDiv.querySelector("#audio-hud__action");
    var muteButton = songDiv.querySelector("#audio-hud__mute");
    var volumeScale = songDiv.querySelector("#audio-hud__volume");
    var speedSelect = songDiv.querySelector("#audio-hud__speed");

    function audioAct() {
      //Запускаем или ставим на паузу

      if (audioPlayer.paused) {
        audioPlayer.play();

        actionButton.setAttribute(
          "class",
          "audio-hud__element audio-hud__action audio-hud__action_play"
        );
      } else {
        audioPlayer.pause();

        actionButton.setAttribute(
          "class",
          "audio-hud__element audio-hud__action audio-hud__action_pause"
        );
      }

      if (durationTime.innerHTML == "00:00") {
        durationTime.innerHTML = audioTime(audioPlayer.duration); //Об этой функции чуть ниже
      }
    }

    function audioTime(time) {
      //Рассчитываем время в секундах и минутах

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
      //Отображаем время воспроизведения

      const progress = Math.floor(
        audioPlayer.currentTime / (audioPlayer.duration / 100)
      );

      progressBar.value = progress || 0;
      currTime.innerHTML = audioTime(audioPlayer.currentTime);
    }

    function audioChangeTime(e) {
      //Перематываем
      var mouseX = Math.floor(e.pageX - progressBar.offsetLeft);
      var progress = mouseX / (progressBar.offsetWidth / 100);
      audioPlayer.currentTime = audioPlayer.duration * (progress / 100);
    }

    audioPlayer.onloadedmetadata = function () {
      durationTime.innerHTML = audioTime(audioPlayer.duration);

      actionButton.addEventListener("click", audioAct);

      audioPlayer.addEventListener("click", audioAct);
      audioPlayer.addEventListener("timeupdate", audioProgress);

      progressBar.addEventListener("click", audioChangeTime);
    };

    songsDiv.appendChild(songDiv);

    return songDiv;
  }
}
