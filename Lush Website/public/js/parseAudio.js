import * as loadSongTemplate from "./loadSongTemplate.js";

export default function parseAudios() {
    var songsDiv = document.getElementById("songs");
    // console.log("songsDiv:", loadSongTemplate);
    // console.log("songsDiv:", loadSongTemplate.songsDiv);
    // console.log("songsDiv:", songsDiv2);
    var songDiv = loadSongTemplate.songDiv,
        artistsDiv = songDiv.getElementsByClassName("artists")[0],
        titleDiv = songDiv.getElementsByClassName("title")[0],
        audioDiv = songDiv.getElementsByClassName("audio")[0];
    var offset = -10;
    const rowLimit = 15;

    async function updateProgress(offset) {
        var audioReqData = { rowLimit: rowLimit, iteration: offset };
        console.log("iteration:", offset);

        $.ajax({
            type: "POST",
            url: "/",
            data: JSON.stringify(audioReqData),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                console.log("Data:", data);

                // data.forEach((dataPiece) => {
                displayAudios(data["results"]);
                // });

                // iteration += 10;
                console.log("offset:", offset);
                if (offset < rowLimit) updateProgress(offset + rowLimit);
            },
            error: function (x, t, m) {
                console.log("Error:", m);
            },
        });
    }

    // for (var i = 0; i < 10; i++) {
    updateProgress(0);
    // }

    var artists, audioSrc;
    function displayAudios(audios) {
        console.log("data.results:", audios);
        audios.forEach((audios) => {
            console.log(audios);
            artists = audios["artists"];

            if (artists.length > 2) {
                artists = artists.slice(0, artists.length - 1).join(", ");
                artists = [
                    artists,
                    audios["artists"][audios["artists"].length - 1],
                ].join(" & ");
            } else if (artists.length > 1) {
                artists = artists.join(" & ");
            }

            artistsDiv.innerHTML = artists;
            titleDiv.innerHTML = audios["title"];

            var blob = new Blob([new Uint8Array(audios.audio.data)], {
                type: "audio/ogg",
            });
            var blobUrl = URL.createObjectURL(blob);
            audioDiv
                .getElementsByClassName("source")[0]
                .setAttribute("src", blobUrl);
            // audioDiv.pause();
            audioDiv.load();

            songsDiv.appendChild(songDiv.cloneNode(true));
        });
    }
}
