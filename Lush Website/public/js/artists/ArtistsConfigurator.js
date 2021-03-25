import Artist from "./Artist.js";
import { lushURL } from "../partials/loadContent.js";

export default class ArtistsConfigurator {
  constructor(artistLi, dataRequest) {
    this.artistLi = artistLi;

    this.defaultDataRequest = {
      artistID: document.location.pathname.split("/")[2] || null,
      search: this.processSearchQuery(lushURL.get("search")),
      genres: lushURL.get("genres"),
      limit: 140,
      offset: 0,
    };
    this.dataRequest = { dataRequest: dataRequest || this.defaultDataRequest };

    this.artistsOl = document.getElementById("artists-ol");
    this.atTheBottom = true;
    this.artistsRequestResolved = false;

    this.getArtists();
    this.applyWindowOnScroll();
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
      this.artistsRequestResolved = false;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/artistsData", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(JSON.stringify(this.dataRequest));

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          resolve(xhr);
        }
      };
    })
      .then((xhr) => this.displayArtists(xhr))
      .then(() => (this.artistsRequestResolved = true));
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

          const reqImageBlob = { blobID: artist.artistimage_blob_id };
          this.fetchBlob(reqImageBlob, imageWrapper);

          this.outputsize(imageWrapper);

          new ResizeObserver(() => this.outputsize(imageWrapper)).observe(
            artistLi
          );
        }

        // window.scroll(0, document.body.scrollHeight);

        if (returnedRows === this.dataRequest.dataRequest.limit) {
          this.atTheBottom = false;
        }
      }
    }
  }

  fetchBlob(reqImageBlob, imageWrapper) {
    fetch("/imageBlob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqImageBlob),
    })
      .then((response) => response.body)
      .then((rs) => {
        const reader = rs.getReader();

        return new ReadableStream({
          async start(controller) {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              controller.enqueue(value);
            }

            controller.close();
            reader.releaseLock();
          },
        });
      })
      .then((rs) => new Response(rs))
      .then((response) => response.blob())
      .then((blob) => (blob.size ? URL.createObjectURL(blob) : null))
      .then((url) => {
        if (url) {
          imageWrapper.classList.remove("no-cover");
          imageWrapper.style.backgroundImage = `url("${url}")`;
        }
        // URL.revokeObjectURL(url);
      })
      .catch(console.error);
  }

  applyWindowOnScroll() {
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

  setTag(event) {
    console.log("Set tag");

    // const xhr = new XMLHttpRequest();
    // xhr.open("POST", "/setTag", true);
    // xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState == 4 && xhr.status == 200) {
    //     const response = JSON.parse(xhr.response);
    //     console.log(response);
    //   }
    // };

    // const dataJSON = {
    //   artistID: event.target
    //     .closest(".artist-li")
    //     .getAttribute("data-artist-id"),
    // };

    // xhr.send(JSON.stringify(dataJSON));
  }
}
