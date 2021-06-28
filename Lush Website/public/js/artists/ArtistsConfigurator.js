import Artist from "./Artist.js";
import { lushURL } from "../partials/loadContent.js";

export default class ArtistsConfigurator {
  constructor(artistLi, dataRequest) {
    this.artistLi = artistLi;

    this.defaultDataRequest = {
      artistId: null,
      search: this.processSearchQuery(lushURL.getQuery()),
      genres: lushURL.getGenres(),
      limit: 140,
      offset: 0,
    };
    this.dataRequest = { dataRequest: dataRequest || this.defaultDataRequest };

    this.artistsOl = document.getElementById("artists-ol");
    this.atTheBottom = true;
    this.requestResolved = false;

    this.configure();
    this.getArtists();
  }

  processSearchQuery(searchQuery) {
    return searchQuery?.replace('"', '\\"');
  }

  outputsize(imageWrapper) {
    imageWrapper.style.height =
      imageWrapper.getBoundingClientRect().width + "px";
  }

  getArtists() {
    new Promise((resolve, reject) => {
      this.requestResolved = false;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/artistsData", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          resolve(xhr);
        }
      };

      xhr.send(JSON.stringify(this.dataRequest));
    })
      .then((xhr) => this.displayArtists(xhr))
      .then(() => (this.requestResolved = true));
  }

  displayArtists(xhr) {
    const data = JSON.parse(xhr.response);
    console.log("Data:", data);

    const returnedRows = data.artists.length;

    if (data.status === 200) {
      if (returnedRows) {
        for (const artist of data.artists) {
          const artistClass = new Artist(this.artistLi, artist);
          const artistLi = artistClass.artistLi;
          const imageWrapper = artistClass.imageWrapper;

          this.artistsOl.appendChild(artistLi);

          this.outputsize(imageWrapper);

          new ResizeObserver(() => this.outputsize(imageWrapper)).observe(
            artistLi
          );
        }

        if (returnedRows === this.dataRequest.dataRequest.limit) {
          this.atTheBottom = false;
        }
      }
    }
  }

  configure() {
    window.onscroll = () => {
      if (
        !this.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.artistsOl.offsetTop + this.artistsOl.offsetHeight - 100
      ) {
        this.atTheBottom = true;

        this.defaultDataRequest.offset += this.defaultDataRequest.limit;
        this.getArtists();
      }
    };
  }
}
