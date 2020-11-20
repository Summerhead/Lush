import { audioLi } from "./loadAudioTemplate.js";
import AudioPlayer from "./AudioPlayer.js";
import insertNoResults from "../partials/insertNoResults.js";

const mainElement = document.getElementsByTagName("main")[0],
  audiosDiv = document.createElement("div"),
  audiosOl = document.createElement("ol");
audiosDiv.setAttribute("id", "audios");
audiosOl.setAttribute("id", "audios-ordered-list");
audiosDiv.appendChild(audiosOl);
mainElement.appendChild(audiosDiv);

var offset = 13082 - 11740 - 10;
const globalReqAudioData = {
  searchArtistID: document.location.search || null,
  limit: 100,
  //13082-11740-10
  offset: 0,
};

var metadataCountObject = 0;
var returnedRows = 0;

const atTheBottomObject = { atTheBottom: false };

const audios = [];

window.onscroll = function () {
  if (
    !atTheBottomObject.atTheBottom &&
    window.innerHeight + window.scrollY >=
      audiosOl.offsetTop + audiosOl.offsetHeight - 100
  ) {
    atTheBottomObject.atTheBottom = true;

    globalReqAudioData.offset += globalReqAudioData.limit;
    const reqAudioData = Object.assign({}, globalReqAudioData);
    getAudios(reqAudioData);
  }
};

export default async function getAudios(reqAudioDataSpec) {
  const audioContainer = audioLi;
  const reqAudioData = reqAudioDataSpec || globalReqAudioData;
  metadataCountObject = { metadataCount: 0 };
  audios.length = 0;

  fetchDataChunk(reqAudioData);

  function fetchDataChunk(audioReqData) {
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
                audio.artists,
                audio.title,
                audio.duration
              );

              const audioLi = document.createElement("li");
              audioLi.appendChild(audioPlayer);
              audioLi.setAttribute("class", "audio-list-item");
              audioLi.setAttribute("data-audio-id", audio.id);
              audioLi.setAttribute("data-blob-id", audio.blob_id);

              audios.push(audioLi);

              var artistAttributes = "";
              for (const [index, artist] of audio.artists.entries()) {
                const dataArtistAttribute = "data-artist-" + (index + 1);
                artistAttributes += dataArtistAttribute + " ";
                audioLi.setAttribute(dataArtistAttribute, artist.name);
              }
              artistAttributes = artistAttributes.trim();
              audioLi.setAttribute("data-artist-attributes", artistAttributes);
              audioLi.setAttribute("data-audio-title", audio.title);
            }

            audios.forEach((audio) => audiosOl.appendChild(audio));

            atTheBottomObject.atTheBottom = false;
          } else if (!document.getElementById("audios-ordered-list")) {
            insertNoResults();
          }
        }
      },
      error: function (error) {
        console.log("Error:", error);
      },
    });
  }
}

export {
  mainElement,
  audiosDiv,
  audiosOl,
  returnedRows,
  metadataCountObject,
  atTheBottomObject,
  audios,
};
