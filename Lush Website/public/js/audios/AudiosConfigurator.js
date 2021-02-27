import AudioPlayer, { currentAudio } from "./AudioPlayer.js";
import insertNoResults from "../partials/insertNoResults.js";
import { rgb, bw } from "../artists/artist/ArtistConfigurator.js";

export default class AudiosConfigurator {
  constructor(audioLi, reqAudioDataSpec) {
    this.audioLi = audioLi;

    const URLSParams = new URLSearchParams(location.search);
    this.globalReqAudioData = {
      artistID: document.location.pathname.split("/")[2] || null,
      search: URLSParams.get("search"),
      genres: URLSParams.get("genres"),
      limit: 100,
      offset: 0,
    };
    this.reqAudioDataSpec = reqAudioDataSpec || this.globalReqAudioData;

    this.audiosOl = document.getElementById("audios-ol");
    this.atTheBottom = true;

    this.getAudios();
    this.applyWindowOnScroll();
  }

  getAudios() {
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

              const audioLi = isCurrentlyPlaying
                ? currentAudio
                : new AudioPlayer(this.audioLi, audio).audioLi;
              audioLi.audioId = audio.audio_id;

              this.audiosOl.appendChild(audioLi);
            }

            if (returnedRows === this.reqAudioDataSpec.limit) {
              this.atTheBottom = false;
            }
          }
        }

        this.waitRGB();
      },
      // else if (!document.getElementById("audios-ol")) {
      //   insertNoResults();
      // }
    });
  }

  waitRGB() {
    const waitRGB = setInterval(() => {
      const genreEls = [...document.getElementsByClassName("genre")];

      if (rgb && bw) {
        const { r, g, b } = rgb;
        genreEls.forEach((tagEl) => {
          tagEl.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
          tagEl.style.border = "0px";
          tagEl.style.color = bw;
        });
      }

      if (rgb === "" && bw === "") {
        genreEls.forEach((tagEl) => {
          tagEl.style.backgroundColor = "white";
          tagEl.style.border = "1px solid rgb(197, 197, 197)";
          tagEl.style.color = "black";
        });
      }

      if (location.pathname === "/music") {
        clearInterval(waitRGB);

        const genreEls = [...document.getElementsByClassName("genre")];
        genreEls.forEach((tagEl) => {
          tagEl.style.backgroundColor = "white";
          tagEl.style.border = "1px solid rgb(197, 197, 197)";
          tagEl.style.color = "black";
        });
      }
    }, 10);
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
