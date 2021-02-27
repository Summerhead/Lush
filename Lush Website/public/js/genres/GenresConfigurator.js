import insertNoResults from "../partials/insertNoResults.js";

export default class GenresConfigurator {
  constructor(audioContainer, reqAudioDataSpec) {
    this.genresOl = document.getElementById("genres-ol");

    this.globalReqAudioData = {
      artistID: document.location.pathname.split("/")[2] || null,
      search: "",
      limit: 100,
      offset: 0,
    };

    this.atTheBottom = true;
    this.audioContainer = audioContainer;
    this.reqAudioDataSpec = reqAudioDataSpec || this.globalReqAudioData;

    this.getGenres();
    // this.applyWindowOnScroll();
  }

  getGenres() {
    this.fetchDataChunk();
  }

  fetchDataChunk() {
    $.ajax({
      type: "GET",
      url: "/genresData",
      dataType: "json",
      success: (data) => {
        console.log("Data:", data);

        const returnedRows = data.genres.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const genre of data.genres) {
              const genreLi = document.createElement("li");
              genreLi.innerText = genre.name + ": " + genre.audios_count;

              this.genresOl.appendChild(genreLi);
            }

            // this.genres.forEach((audio) => this.genresOl.appendChild(audio));

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
          this.genresOl.offsetTop + this.genresOl.offsetHeight - 200
      ) {
        this.atTheBottom = true;
        this.globalReqAudioData.offset += this.globalReqAudioData.limit;

        this.getGenres();
      }
    };
  }
}
