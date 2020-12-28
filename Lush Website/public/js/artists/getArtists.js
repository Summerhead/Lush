import insertNoResults from "../partials/insertNoResults.js";
import showPage from "../partials/loadContent.js";

export default class ArtistsConfigurator {
  constructor(artistLi, reqArtistDataSpec) {
    this.artistsOl = document.getElementById("artists-ol");

    this.globalReqArtistData = {
      artistID: Number(document.location.pathname.split("/")[2]) || null,
      limit: 140,
      offset: 0,
    };

    this.atTheBottomObject = { atTheBottom: false };

    this.artistLi = artistLi;
    this.reqArtistDataSpec = reqArtistDataSpec || this.globalReqArtistData;

    this.getArtists();

    this.applyWindowOnScroll(this.artistLi, this.reqArtistDataSpec);
  }

  getArtists = () => {
    this.fetchDataChunk(this.reqArtistData);
  };

  outputsize = (imageWrapper) => {
    imageWrapper.style.height = imageWrapper.offsetWidth + "px";
  };

  fetchDataChunk = () => {
    $.ajax({
      type: "POST",
      url: "/artistsData",
      data: JSON.stringify(this.reqArtistDataSpec),
      contentType: "application/json",
      dataType: "json",
      success: (data) => {
        console.log("Data:", data);

        const returnedRows = data.artists.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const artist of data.artists) {
              const artistLi = this.constructArtist(artist),
                imageWrapper = artistLi.querySelector(".image-wrapper");
              this.artistsOl.appendChild(artistLi);

              const reqImageBlob = { blobID: artist.blob_id };
              this.fetchBlob(reqImageBlob, imageWrapper);

              this.outputsize(imageWrapper);

              new ResizeObserver(() => this.outputsize(imageWrapper)).observe(
                artistLi
              );
            }

            this.atTheBottomObject.atTheBottom = false;

            [...document.getElementsByTagName("a")].forEach((link) => {
              link.onclick = () => {
                showPage(link);
                return false;
              };
            });

            // window.scroll(0, document.body.scrollHeight);
          }
          // else if (!document.getElementById("artists")) {
          //   console.log(returnedRows);
          //   insertNoResults();
          // }
        }
      },
      error: (error) => {
        console.log("Error:", error);
      },
    });
  };

  fetchBlob = (reqImageBlob, imageWrapper) => {
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
          imageWrapper.style.backgroundImage = `url("${url}")`;
        }
        // URL.revokeObjectURL(url);
      })
      .catch(console.error);
  };

  constructArtist = (artist) => {
    const artistLiClone = this.artistLi.cloneNode(true);

    artistLiClone.querySelector(".artist-name").innerText = artist.name;
    artistLiClone.querySelector(".artist-link").href += `${
      artist.artist_id
    }/${artist.name.split(" ").join("+")}`;

    return artistLiClone;
  };

  applyWindowOnScroll = () => {
    window.onscroll = () => {
      if (
        !this.atTheBottomObject.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.artistsOl.offsetTop + this.artistsOl.offsetHeight - 100
      ) {
        this.atTheBottomObject.atTheBottom = true;

        this.globalReqArtistData.offset += this.globalReqArtistData.limit;
        this.getArtists(this.artistLi);
      }
    };
  };
}
