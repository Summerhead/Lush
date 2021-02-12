import AudioPlayer, { currentAudio } from "./AudioPlayer.js";
import insertNoResults from "../partials/insertNoResults.js";
// import { pushState } from "../partials/loadContent.js";

export default class AudiosConfigurator {
  constructor(audioContainer, reqAudioDataSpec, href) {
    this.audiosOl = document.getElementById("audios-ol");

    this.globalReqAudioData = {
      artistID: document.location.pathname.split("/")[2] || null,
      search: "",
      limit: 100,
      offset: 0,
    };

    this.atTheBottom = true;
    this.audios = [];
    this.audioContainer = audioContainer;
    this.reqAudioDataSpec = reqAudioDataSpec || this.globalReqAudioData;

    this.href = href;

    this.getAudios();
    this.applyWindowOnScroll();
  }

  getAudios() {
    this.audios.length = 0;
    this.fetchDataChunk();
  }

  fetchDataChunk() {
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
              const isCurrentlyPlaying =
                currentAudio && audio.audio_id === currentAudio.audioId;

              const audioPlayer = isCurrentlyPlaying
                ? currentAudio
                : new AudioPlayer(this.audioContainer, audio);
              audioPlayer.audioId = audio.audio_id;

              const audioContainer = document.createElement("div");
              audioContainer.classList.add("audio-container");
              audioContainer.appendChild(audioPlayer);

              const audioLi = document.createElement("li");
              audioLi.append(audioContainer);
              audioLi.classList.add("audio-li");
              if (isCurrentlyPlaying) audioLi.classList.add("playing");
              audioLi.setAttribute("data-audio-id", audio.audio_id);
              audioLi.setAttribute("data-blob-id", audio.blob_id);

              this.audios.push(audioLi);

              var artistAttributes = "";
              for (const [index, artist] of audio.artists.entries()) {
                const dataArtistAttribute = "data-artist-" + (index + 1);
                artistAttributes += dataArtistAttribute + " ";
                const artistJSON = { id: artist.artist_id, name: artist.name };
                audioLi.setAttribute(
                  dataArtistAttribute,
                  JSON.stringify(artistJSON)
                );
              }
              artistAttributes = artistAttributes.trim();
              audioLi.setAttribute("data-artist-attributes", artistAttributes);
              audioLi.setAttribute("data-audio-title", audio.title);
            }

            this.audios.forEach((audio) => this.audiosOl.appendChild(audio));

            // console.log(document.getElementById("main").innerHTML);

            // pushState(this.href);

            if (returnedRows === this.reqAudioDataSpec.limit) {
              this.atTheBottom = false;
            }
          }
        }
      },
      // else if (!document.getElementById("audios-ol")) {
      //   insertNoResults();
      // }
    });
  }

  applyWindowOnScroll() {
    window.onscroll = () => {
      if (
        !this.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.audiosOl.offsetTop + this.audiosOl.offsetHeight - 200
      ) {
        this.atTheBottom = true;
        this.globalReqAudioData.offset += this.globalReqAudioData.limit;

        this.getAudios();
      }
    };
  }
}
