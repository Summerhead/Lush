import insertNoResults from "../partials/insertNoResults.js";
import playerConstructor from "./playerConstructor.js";

const mainElement = document.getElementsByTagName("main")[0],
  audiosDiv = document.createElement("div"),
  audiosOl = document.createElement("ol");
audiosDiv.setAttribute("id", "audios");
audiosOl.setAttribute("id", "audios-ordered-list");
var returnedRows = 0;

export default async function getAudios(audioLi, editAudioWindowContainer) {
  const reqAudioData = {
    artistID: Number(document.location.pathname.split("/")[2]) || null,
    limit: 20,
    offset: 13082 - 11740 - 10,
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
              const audioDiv = playerConstructor(
                  audioLi,
                  editAudioWindowContainer,
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
}

export { mainElement, audiosDiv, audiosOl, returnedRows };
