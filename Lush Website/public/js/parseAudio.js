import * as loadSongTemplate from "./loadSongTemplate.js";
// import player from "./partials/audio.js";

export default function parseAudios() {
    var songsDiv = document.getElementById("songs"),
        songDiv = loadSongTemplate.songDiv,
        audioDiv;
    const rowLimit = 1,
        globOffset = -1;

    const image = document.getElementById("audio-player");

    var audioReqData = { call: true, rowLimit: rowLimit, offset: globOffset };

    for (var i = 0; i < 3; i++) {
        audioReqData.offset++;
        console.log("loop:", audioReqData);
        fetchRow(audioReqData);
    }

    function fetchRow(audioReqData) {
        var audioReqData2 = Object.assign({}, audioReqData);

        fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(audioReqData2),
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
            .then((response) => response.json())
            .then((json) => {
                console.log("json:", json);
                return json;
            })
            .then((json) =>
                player(json.audios[0].artists, json.audios[0].title, null)
            )
            .then(() => {
                songsDiv.appendChild(songDiv);
                return songDiv;
            })
            .then((songDiv) => {
                fetchBlob(audioReqData2, songDiv);
            })
            .catch(console.error);
    }

    function fetchBlob(audioReqData, songDiv) {
        var audioReqData2 = Object.assign({}, audioReqData);
        audioReqData2.call = false;
        console.log("audioReqData2:", audioReqData2);

        fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(audioReqData2),
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
            // // Update image
            .then((url) => (songDiv.querySelector("#audio-player").src = url))
            // .then(() => songsDiv.appendChild(songDiv))
            // .then((res) => console.log("res:", res))
            .catch(console.error);
    }

    async function updateProgress(offset) {
        var audioReqData = { rowLimit: rowLimit, offset: offset };
        console.log("Offset:", offset);

        $.ajax({
            type: "POST",
            url: "/",
            data: JSON.stringify(audioReqData),
            contentType: "application/json",
            dataType: "text",
            success: function (data) {
                console.log("Data:", data);

                // displayAudios(data["audios"]);

                // if (offset < globOffset + rowLimit * 4)
                //     updateProgress(offset + rowLimit);
            },
            error: function (x, t, m) {
                console.log("Error:", m);
            },
        });
    }

    // updateProgress(globOffset);

    function displayAudios(audios) {
        audios.forEach((audios) => {
            player(
                parseArtists(audios["artists"]),
                audios["title"],
                audios.audio.data
            );

            songsDiv.appendChild(songDiv);
        });
    }

    function parseArtists(artists) {
        if (artists.length > 2) {
            artists = artists.slice(0, artists.length - 1).join(", ");
            artists = [
                artists,
                audios["artists"][audios["artists"].length - 1],
            ].join(" & ");
        } else if (artists.length > 1) {
            artists = artists.join(" & ");
        }

        return artists;
    }

    function player(artists, title, audioData) {
        songDiv = songDiv.cloneNode(true);

        songDiv.querySelector(".audio-header>.artists").innerHTML = artists;
        songDiv.querySelector(".audio-header>.title").innerHTML = title;

        var audioDiv = songDiv.getElementsByTagName("audio")[0];
        var blob = new Blob([new Uint8Array(audioData)], {
            type: "audio/ogg",
        });
        var blobUrl = URL.createObjectURL(blob);
        audioDiv.setAttribute("src", audioData);

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
}
