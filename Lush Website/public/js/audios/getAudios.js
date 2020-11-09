import insertNoResults from "../partials/insertNoResults.js";
import AudioPlayer from "./AudioPlayer.js";

const mainElement = document.getElementsByTagName("main")[0],
  audiosDiv = document.createElement("div"),
  audiosOl = document.createElement("ol");
audiosDiv.setAttribute("id", "audios");
audiosOl.setAttribute("id", "audios-ordered-list");

var returnedRows = 0;

export default async function getAudios(audioContainer) {
  const reqAudioData = {
    artistID: Number(document.location.pathname.split("/")[2]) || null,
    limit: 20,
    offset: 0,
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

        returnedRows = data.audios.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const audio of data.audios) {
              const audioPlayer = new AudioPlayer(
                  audioContainer,
                  parseArtists(audio.artists),
                  audio.title
                ),
                reqAudioBlob = { blobID: audio.blob_id };

              const audioLi = document.createElement("li");
              audioLi.appendChild(audioPlayer);
              audioLi.setAttribute("class", "audio-list-item");
              audioLi.setAttribute("data-audio-id", audio.id);

              audiosOl.appendChild(audioLi);

              var artistAttributes = "";
              for (const [index, artist] of audio.artists.entries()) {
                const dataArtistAttribute = "data-artist-" + (index + 1);
                artistAttributes += dataArtistAttribute + " ";
                audioLi.setAttribute(dataArtistAttribute, artist);
              }
              artistAttributes = artistAttributes.trim();
              audioLi.setAttribute("data-artist-attributes", artistAttributes);
              audioLi.setAttribute("data-audio-title", audio.title);

              fetchBlob(reqAudioBlob, audioPlayer);
            }
          } else if (!document.getElementById("audios")) {
            console.log(returnedRows);
            insertNoResults();
          }
        }
      },
      error: function (error) {
        console.log("Error:", error);
      },
    });
  }

  function fetchBlob(reqAudioBlob, audioPlayer) {
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
      .then((url) => audioPlayer.setAudioPlayerSrc(url))
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
}

export { mainElement, audiosDiv, audiosOl, returnedRows };
