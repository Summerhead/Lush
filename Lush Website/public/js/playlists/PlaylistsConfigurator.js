import Playlist from "./Playlist.js";

export default class PlaylistsConfigurator {
  constructor(playlistLi, dataRequest) {
    this.playlistLi = playlistLi;

    const URLSParams = new URLSearchParams(location.search);
    this.defaultDataRequest = {
      playlistID: document.location.pathname.split("/")[2] || null,
      search: URLSParams.get("search"),
      genres: URLSParams.get("genres"),
      limit: 140,
      offset: 0,
    };
    this.dataRequest = { dataRequest: dataRequest || this.defaultDataRequest };
    console.log(this.dataRequest);

    this.playlistsOl = document.getElementById("playlists-ol");
    this.atTheBottom = true;

    this.getPlaylists();
    this.applyWindowOnScroll();
  }

  getPlaylists() {
    this.fetchDataChunk();
  }

  outputsize(imageWrapper) {
    imageWrapper.style.height =
      imageWrapper.getBoundingClientRect().width + "px";
  }

  fetchDataChunk() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/playlistsData", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(this.dataRequest));

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const data = JSON.parse(xhr.response);
        console.log("Data:", data);

        const returnedRows = data.playlists.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const playlist of data.playlists) {
              const playlistClass = new Playlist(this.playlistLi, playlist),
                playlistLi = playlistClass.playlistLi,
                imageWrapper = playlistClass.imageWrapper;
              this.playlistsOl.appendChild(playlistLi);

              const reqImageBlob = { blobID: playlist.blob_id };
              this.fetchBlob(reqImageBlob, imageWrapper);

              this.outputsize(imageWrapper);

              new ResizeObserver(() => this.outputsize(imageWrapper)).observe(
                playlistLi
              );
            }

            if (returnedRows === this.dataRequest.dataRequest.limit) {
              this.atTheBottom = false;
            }
          }
        }
      }
    };
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
          this.playlistsOl.offsetTop + this.playlistsOl.offsetHeight - 100
      ) {
        this.atTheBottom = true;

        this.defaultDataRequest.offset += this.defaultDataRequest.limit;
        this.getPlaylists(this.playlistLi);
      }
    };
  }
}
