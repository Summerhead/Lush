import * as loadArtistTemplate from "./loadArtistTemplate.js";
// import player from "./partials/audio.js";

export default async function getAudios() {
  const mainElement = document.getElementsByTagName("main")[0],
    artistsDiv = document.createElement("div"),
    artistsOl = document.createElement("ol");
  artistsDiv.setAttribute("id", "artists");
  artistsOl.setAttribute("id", "artists-ordered-list");

  const reqArtistData = {
    limit: 200,
    offset: 0,
  };

  var metadataCount = 0;
  var rowReturned = 0;

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

        rowReturned = data.artists.length;

        if (data.status === 200) {
          for (const artist of data.artists) {
            const artistLi = constructArtist(artist);
            artistsOl.appendChild(artistLi);

            const reqImageBlob = { blobID: artist.blob_id };
            fetchBlob(reqImageBlob, artistLi);
          }

          artistsDiv.appendChild(artistsOl);
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
      .then((blob) => {
        if (blob.size) return URL.createObjectURL(blob);
        return null;
      })
      .then((url) =>
        url
          ? (songDiv.querySelector(
              ".image-wrapper"
            ).style = `background-image:url("${url}")`)
          : null
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
    const artistLi = loadArtistTemplate.artistLi.cloneNode(true);

    artistLi.querySelector(".artist-name").innerHTML = artist.name;
    artistLi.querySelector(".artist-link").href += artist.artist_id;

    // const imageEl = artistDiv.querySelector(".image");

    // imageEl.onloadedmetadata = () => {
    //   console.log("artistDiv:", artistDiv.querySelector(".image"));
    //   metadataCount++;

    //   if (metadataCount == reqArtistData.limit) {
    //     mainElement.appendChild(artistsDiv);
    //   }
    // };

    return artistLi;
  }
}
