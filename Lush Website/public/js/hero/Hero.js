import showPage from "../partials/loadContent.js";

export default class HeroPage {
  constructor() {
    this.centralBlock = document.getElementById("hero-central-block");
    // this.spiralGalaxy = document.getElementsByClassName("spiral-galaxy")[0];
    // this.imageWrappers = this.centralBlock.querySelector(".image-wrapper");
    // this.artistsEl = this.centralBlock.querySelector(".artists");
    // this.audioTitle = this.centralBlock.querySelector(".audio-title");
    this.recommendedAudioEls =
      this.centralBlock.querySelectorAll(".recommended-audio");

    this.configure();
    this.getRandomAudio();
  }

  configure() {
    // this.spiralGalaxy.addEventListener("click", this.getRandomAudio);
  }

  getRandomAudio() {
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("GET", "/randomAudio", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          resolve();

          this.displayAudios(xhr.response);
        }
      };

      xhr.send();
    });
  }

  outputsize(imageWrapper) {
    imageWrapper.style.height =
      imageWrapper.getBoundingClientRect().width + "px";
  }

  displayAudios(xhrResponse) {
    const data = JSON.parse(xhrResponse);

    const audiosData = data.audiosData;
    console.log("Data:", audiosData);

    audiosData.forEach((audioData, index) => {
      const recommendedAudioEl = this.recommendedAudioEls[index];
      const imageWrapper = recommendedAudioEl.querySelector(".image-wrapper");
      const artistsEl = recommendedAudioEl.querySelector(".artists");
      const audioTitle = recommendedAudioEl.querySelector(".audio-title");

      var image_id;
      for (const artist of audioData.artists) {
        if (artist.image_id) {
          image_id = artist.image_id;
          break;
        }
      }

      if (image_id) {
        imageWrapper.classList.remove("no-cover");
        imageWrapper.style.backgroundImage = `url("https://drive.google.com/uc?export=view&id=${image_id}")`;
      }

      this.outputsize(imageWrapper);

      new ResizeObserver(() => this.outputsize(imageWrapper)).observe(
        this.centralBlock
      );

      this.insertArtists(artistsEl, audioData.artists);

      audioTitle.innerText = audioData.title;
    });
  }

  insertArtists(artistsEl, artists) {
    const parsedArtists = this.parseArtists(artists);
    artistsEl.replaceWith(parsedArtists);
  }

  parseArtists(artists) {
    const artistsDiv = document.createElement("div");
    artistsDiv.setAttribute("class", "artists");

    artists.forEach((artist, index) => {
      if (index != 0) {
        const spanEl = document.createElement("span");
        spanEl.innerHTML = index == artists.length - 1 ? " & " : ", ";
        artistsDiv.appendChild(spanEl);
      }

      const linkEl = document.createElement("a");
      const link = `/artists/${artist.artist_id}/${artist.name
        .replace(/ /g, "+")
        .replace(/\//g, "%2F")}`;
      linkEl.setAttribute("href", link);
      linkEl.onclick = () => {
        showPage(linkEl.href);
        return false;
      };
      linkEl.innerText = artist.name;

      artistsDiv.appendChild(linkEl);
    });

    return artistsDiv;
  }
}
