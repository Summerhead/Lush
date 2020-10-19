import * as loadArtistTemplate from "./loadArtistTemplate.js";
// import player from "./partials/audio.js";

export default async function getAudios() {
  const mainElement = document.getElementsByTagName("main")[0],
    artistsDiv = document.createElement("div");
  artistsDiv.setAttribute("id", "artists");

  const reqArtistData = {
    limit: 200,
    offset: 1,
  };

  var metadataCount = 0;

  fetchRow(reqArtistData);

  function fetchRow(audioReqData) {
    $.ajax({
      type: "POST",
      url: "/artistsData",
      data: JSON.stringify(audioReqData),
      contentType: "application/json",
      dataType: "json",
      success: function (data) {
        console.log("Data:", data);

        if (data.status === 200) {
          data.artists
            .filter((artist) => artist.blob_id !== null)
            .map((artist) => {
              const artistDiv = constructArtist(artist.name);
              artistsDiv.appendChild(artistDiv);

              const reqImageBlob = { blobID: artist.blob_id };
              fetchBlob(reqImageBlob, artistDiv);
            });

          mainElement.appendChild(artistsDiv);
        }
      },
      error: function (error) {
        console.log("Error:", error);
      },
    });
  }

  function fetchBlob(reqImageBlob, songDiv) {
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
      .then((blob) => URL.createObjectURL(blob))
      .then(
        (url) =>
          (songDiv.querySelector(
            ".image"
          ).style = `background-image: url(${url});`)
      )
      .catch(console.error);
  }

  function parseArtists(artists) {
    if (artists.length > 2) {
      artists = [
        artists.slice(0, artists.length - 1).join(", "),
        artists[artists.length - 1],
      ].join(" & ");
    } else if (artists.length > 1) {
      artists = artists.join(" & ");
    }

    return artists;
  }

  function constructArtist(artist) {
    const artistDiv = loadArtistTemplate.artistDiv.cloneNode(true);

    artistDiv.querySelector(".artist-name").innerHTML = artist;

    // const imageEl = artistDiv.querySelector(".image");

    // imageEl.onloadedmetadata = () => {
    //   console.log("artistDiv:", artistDiv.querySelector(".image"));
    //   metadataCount++;

    //   if (metadataCount == reqArtistData.limit) {
    //     mainElement.appendChild(artistsDiv);
    //   }
    // };

    return artistDiv;
  }
}
