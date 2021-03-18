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
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/genresData", true);
    xhr.send();

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const data = JSON.parse(xhr.response);
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
      }
    };
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
