export default function player(artists, title, audioData) {
    // artistsDiv.innerHTML = artists;
    // titleDiv.innerHTML = audios["title"];

    var audioDiv = songDiv.getElementsByTagName("audio")[0];
    var blob = new Blob([new Uint8Array(audioData)], {
        type: "audio/ogg",
    });
    var blobUrl = URL.createObjectURL(blob);
    audioDiv.setAttribute("src", blobUrl);

    var audioPlayer = songDiv.querySelector("#audio-player");

    //Время

    var progressBar = document.getElementById("audio-hud__progress-bar");

    var currTime = document.getElementById("audio-hud__curr-time");

    var durationTime = songDiv.querySelector("#audio-hud__duration");

    //Кнопки

    var actionButton = songDiv.querySelector("#audio-hud__action");

    var muteButton = document.getElementById("audio-hud__mute");

    var volumeScale = document.getElementById("audio-hud__volume");

    var speedSelect = document.getElementById("audio-hud__speed");

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

    actionButton.addEventListener("click", audioAct);

    audioPlayer.addEventListener("click", audioAct);
}
