import insertNoResults from "../partials/insertNoResults.js";
import Playlist from "./Playlist.js";

export default class PlaylistsConfigurator {
  constructor(playlistLi, reqPlaylistDataSpec) {
    this.playlistLi = playlistLi;

    const URLSParams = new URLSearchParams(location.search);
    this.globalReqPlaylistData = {
      playlistID: document.location.pathname.split("/")[2] || null,
      search: URLSParams.get("search"),
      genres: URLSParams.get("genres"),
      limit: 140,
      offset: 0,
    };
    this.reqPlaylistDataSpec =
      reqPlaylistDataSpec || this.globalReqPlaylistData;

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
    $.ajax({
      type: "POST",
      url: "/playlistsData",
      data: JSON.stringify(this.reqPlaylistDataSpec),
      contentType: "application/json",
      dataType: "json",
      success: (data) => {
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

            if (returnedRows === this.reqPlaylistDataSpec.limit) {
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
          this.playlistsOl.offsetTop + this.playlistsOl.offsetHeight - 100
      ) {
        this.atTheBottom = true;

        this.globalReqPlaylistData.offset += this.globalReqPlaylistData.limit;
        this.getPlaylists(this.playlistLi);
      }
    };
  }
}
