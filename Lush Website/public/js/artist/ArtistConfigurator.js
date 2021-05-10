import { currentAudio } from "../audios/Audio.js";
import { header } from "../header/loadHeader.js";
import { lushURL } from "../partials/loadContent.js";

var rgb, bw;

export default class ArtistConfigurator {
  constructor(dataRequest) {
    this.artistContainer = document.getElementById("artist-container");

    this.defaultDataRequest = {
      artistId: this.processArtistId(),
      limit: 1,
      offset: 0,
    };
    this.dataRequest = { dataRequest: dataRequest || this.defaultDataRequest };

    this.artistPic = document.getElementById("artist-pic");
    this.imageWrapper = document.getElementById("image-wrapper");
    this.atTheBottomObject = { atTheBottom: false };

    this.configure();
    this.getArtist();
  }

  processArtistId() {
    if (lushURL.currentPage === "artist") {
      return location.pathname.split("/")[2];
    }
    return null;
  }

  configure() {
    window.onscroll = () => {
      if (
        !this.atTheBottomObject.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.artistPic.offsetTop + this.artistPic.offsetHeight - 100
      ) {
        this.atTheBottomObject.atTheBottom = true;

        this.defaultDataRequest.offset += this.defaultDataRequest.limit;
        this.getArtist();
      }
    };
  }

  getArtist() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/artistsData", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(this.dataRequest));

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const data = JSON.parse(xhr.response);
        console.log("Data:", data);

        const returnedRows = data.artists.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const artist of data.artists) {
              if (!currentAudio?.classList.contains("current")) {
                document.title = artist.artist_name;
              }

              this.constructArtist(artist);

              if (artist.image_id) {
                this.imageWrapper.style.backgroundImage = `url("https://drive.google.com/uc?export=view&id=${artist.image_id}")`;

                rgb = { r: artist.r, g: artist.g, b: artist.b };
                const [r, g, b] = [artist.r, artist.g, artist.b];
                document.getElementById(
                  "artist-background"
                ).style.background = `linear-gradient(rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))`;

                // document.getElementById(
                //   "play-artist-button"
                // ).style.background = `rgb(${r}, ${g}, ${b})`;

                header.header.classList.remove("border-bottom");
                header.header.classList.remove("no-color");
                header.header.classList.add("colored");
                header.header.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                header.setCurrentAudioMouseListeners(r, g, b);

                document
                  .getElementById("artist-pic")
                  .classList.add(this.calcBrightness(r, g, b));

                const p = 0.7;
                document.getElementById(
                  "artist-name"
                ).style.textShadow = `-${p}px -${p}px 0 rgb(${r}, ${g}, ${b}), ${p}px -${p}px 0 rgb(${r}, ${g}, ${b}), -${p}px ${p}px 0 rgb(${r}, ${g}, ${b}), ${p}px ${p}px 0 rgb(${r}, ${g}, ${b})`;

                bw = this.calcBrightness(r, g, b);
                header.header.classList.add(bw);
              } else {
                rgb = null;
              }
            }
          }
        }
      }
    };
  }

  calcBrightness(r, g, b) {
    const brightness = Math.round(
      (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000
    );
    const bw = brightness > 125 ? "black-theme" : "white-theme";

    return bw;
  }

  constructArtist(artist) {
    // const artistLiClone = this.artistLi.cloneNode(true);
    this.artistContainer.querySelector("#artist-name").innerText =
      artist.artist_name;
  }
}

export { rgb, bw };
