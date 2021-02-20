import insertNoResults from "../partials/insertNoResults.js";
import Artist from "./Artist.js";

export default class ArtistsConfigurator {
  constructor(artistLi, reqArtistDataSpec) {
    this.artistLi = artistLi;

    this.globalReqArtistData = {
      artistID: document.location.pathname.split("/")[2] || null,
      search: new URLSearchParams(location.search).get("search"),
      limit: 140,
      offset: 0,
    };
    this.reqArtistDataSpec = reqArtistDataSpec || this.globalReqArtistData;

    this.artistsOl = document.getElementById("artists-ol");
    this.atTheBottom = true;

    this.getArtists();
    this.applyWindowOnScroll();
  }

  getArtists() {
    this.fetchDataChunk();
  }

  outputsize(imageWrapper) {
    imageWrapper.style.height =
      imageWrapper.getBoundingClientRect().width + "px";
  }

  fetchDataChunk() {
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
              const artistClass = new Artist(this.artistLi, artist),
                artistLi = artistClass.artistLi,
                imageWrapper = artistClass.imageWrapper;
              this.artistsOl.appendChild(artistLi);

              const reqImageBlob = { blobID: artist.blob_id };
              this.fetchBlob(reqImageBlob, imageWrapper);

              this.outputsize(imageWrapper);

              new ResizeObserver(() => this.outputsize(imageWrapper)).observe(
                artistLi
              );
            }

            // [...document.getElementsByTagName("a")].forEach((link) => {
            //   link.onclick = () => {
            //     showPage(link.href);
            //     return false;
            //   };
            // });

            // console.log(document.getElementById("main").innerHTML);

            // pushState(this.href);

            // window.scroll(0, document.body.scrollHeight);

            if (returnedRows === this.reqArtistDataSpec.limit) {
              this.atTheBottom = false;
            }
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

        this.globalReqArtistData.offset += this.globalReqArtistData.limit;
        this.getArtists(this.artistLi);
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
