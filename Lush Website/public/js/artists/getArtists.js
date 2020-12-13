import insertNoResults from "../partials/insertNoResults.js";

const artistsOl = document.getElementById("artists-ol");

const globalReqArtistData = {
  artistID: Number(document.location.pathname.split("/")[2]) || null,
  limit: 120,
  offset: 0,
};

const atTheBottomObject = { atTheBottom: false };

function outputsize(imageWrapper) {
  imageWrapper.style.height = imageWrapper.offsetWidth + "px";
}

export default async function getArtists(artistLi, reqArtistDataSpec) {
  const reqArtistData = reqArtistDataSpec || globalReqArtistData;

  fetchDataChunk(reqArtistData);

  function fetchDataChunk(artistReqData) {
    $.ajax({
      type: "POST",
      url: "/artistsData",
      data: JSON.stringify(artistReqData),
      contentType: "application/json",
      dataType: "json",
      success: function (data) {
        console.log("Data:", data);

        const returnedRows = data.artists.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const artist of data.artists) {
              const artistLi = constructArtist(artist),
                imageWrapper = artistLi.querySelector(".image-wrapper");
              artistsOl.appendChild(artistLi);

              const reqImageBlob = { blobID: artist.blob_id };
              fetchBlob(reqImageBlob, imageWrapper);

              outputsize(imageWrapper);

              new ResizeObserver(() => outputsize(imageWrapper)).observe(
                artistLi
              );
            }

            atTheBottomObject.atTheBottom = false;

            // window.scroll(0, document.body.scrollHeight);
          }
          // else if (!document.getElementById("artists")) {
          //   console.log(returnedRows);
          //   insertNoResults();
          // }
        }
      },
      error: function (error) {
        console.log("Error:", error);
      },
    });
  }

  function fetchBlob(reqImageBlob, imageWrapper) {
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
        url ? (imageWrapper.style.backgroundImage = `url("${url}")`) : null;
        // URL.revokeObjectURL(url);
      })
      .catch(console.error);
  }

  function constructArtist(artist) {
    const artistLiClone = artistLi.cloneNode(true);

    artistLiClone.querySelector(".artist-name").innerText = artist.name;
    artistLiClone.querySelector(".artist-link").href += artist.artist_id;

    return artistLiClone;
  }

  window.onscroll = function () {
    if (
      !atTheBottomObject.atTheBottom &&
      window.innerHeight + window.scrollY >=
        artistsOl.offsetTop + artistsOl.offsetHeight - 100
    ) {
      atTheBottomObject.atTheBottom = true;

      globalReqArtistData.offset += globalReqArtistData.limit;
      const reqArtistData = Object.assign({}, globalReqArtistData);
      getArtists(artistLi, reqArtistData);
    }
  };
}
