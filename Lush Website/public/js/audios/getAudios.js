import AudioPlayer from "./AudioPlayer.js";
import insertNoResults from "../partials/insertNoResults.js";

const audiosOl = document.getElementById("audios-ol");

// var offset = 13082 - 11740 - 10;
const globalReqAudioData = {
  artistID: document.location.pathname.split("/")[2] || null,
  limit: 100,
  offset: 0,
};

const atTheBottomObject = { atTheBottom: false };
const audios = [];

export default async function getAudios(audioContainer, reqAudioDataSpec) {
  const reqAudioData = reqAudioDataSpec || globalReqAudioData;
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

        const returnedRows = data.audios.length;

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
              audioLi.setAttribute("class", "audio-li");
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
          }
        }
      },
      // else if (!document.getElementById("audios-ol")) {
      //   insertNoResults();
      // }
    });
  }

  window.onscroll = function () {
    if (
      !atTheBottomObject.atTheBottom &&
      window.innerHeight + window.scrollY >=
        audiosOl.offsetTop + audiosOl.offsetHeight - 100
    ) {
      atTheBottomObject.atTheBottom = true;

      globalReqAudioData.offset += globalReqAudioData.limit;
      const reqAudioData = Object.assign({}, globalReqAudioData);
      getAudios(audioContainer, reqAudioData);
    }
  };
}
