import AudioPlayer from "./AudioPlayer.js";
import insertNoResults from "../partials/insertNoResults.js";

export default class AudiosConfigurator {
  constructor(audioContainer, reqAudioDataSpec) {
    this.audiosOl = document.getElementById("audios-ol");

    // var offset = 13082 - 11740 - 10;
    this.globalReqAudioData = {
      artistID: document.location.pathname.split("/")[2] || null,
      limit: 100,
      offset: 0,
    };

    this.atTheBottomObject = { atTheBottom: false };
    this.audios = [];

    this.audioContainer = audioContainer;
    this.reqAudioDataSpec = reqAudioDataSpec || this.globalReqAudioData;

    this.getAudios(this.audioContainer, this.reqAudioDataSpec);

    this.applyWindowOnScroll();
  }

  getAudios = async () => {
    this.audios.length = 0;

    this.fetchDataChunk();
  };

  fetchDataChunk = () => {
    $.ajax({
      type: "POST",
      url: "/audioData",
      data: JSON.stringify(this.reqAudioDataSpec),
      contentType: "application/json",
      dataType: "json",
      success: (data) => {
        console.log("Data:", data);

        const returnedRows = data.audios.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const audio of data.audios) {
              const audioPlayer = new AudioPlayer(
                this.audioContainer,
                audio.artists,
                audio.title,
                audio.duration
              );

              const audioLi = document.createElement("li");
              audioLi.appendChild(audioPlayer);
              audioLi.setAttribute("class", "audio-li");
              audioLi.setAttribute("data-audio-id", audio.id);
              audioLi.setAttribute("data-blob-id", audio.blob_id);

              this.audios.push(audioLi);

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

            this.audios.forEach((audio) => this.audiosOl.appendChild(audio));

            this.atTheBottomObject.atTheBottom = false;
          }
        }
      },
      // else if (!document.getElementById("audios-ol")) {
      //   insertNoResults();
      // }
    });
  };

  applyWindowOnScroll = () => {
    window.onscroll = () => {
      if (
        !this.atTheBottomObject.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.audiosOl.offsetTop + this.audiosOl.offsetHeight - 100
      ) {
        this.atTheBottomObject.atTheBottom = true;

        this.globalReqAudioData.offset += this.globalReqAudioData.limit;
        this.getAudios();
      }
    };
  };
}
