import insertNoResults from "../partials/insertNoResults.js";

window.onscroll = function () {
  if (
    !atTheBottomObject.atTheBottom &&
    window.innerHeight + window.scrollY >=
      audiosOl.offsetTop + audiosOl.offsetHeight - 100
  ) {
    // console.log("At the bottom");
    atTheBottomObject.atTheBottom = true;

    globalReqAudioData.offset += globalReqAudioData.limit;
    const reqAudioData = Object.assign({}, globalReqAudioData);
    getArtists(reqAudioData);
  }
};

export default async function getArtists(artistLi) {
  const mainElement = document.getElementsByTagName("main")[0],
    artistsDiv = document.createElement("div"),
    artistsOl = document.createElement("ol");
  artistsDiv.setAttribute("id", "artists");
  artistsOl.setAttribute("id", "artists-ordered-list");

  const reqArtistData = {
    limit: 200,
    offset: 0,
  };

  var returnedRows = 0;

  fetchDataChunk(reqArtistData);

  function fetchDataChunk(audioReqData) {
    $.ajax({
      type: "POST",
      url: "/artistsData",
      data: JSON.stringify(audioReqData),
      contentType: "application/json",
      dataType: "json",
      success: function (data) {
        console.log("Data:", data);

        returnedRows = data.artists.length;

        if (data.status === 200) {
          if (returnedRows) {
            for (const artist of data.artists) {
              const artistLi = constructArtist(artist);
              artistsOl.appendChild(artistLi);

              const reqImageBlob = { blobID: artist.blob_id };
              fetchBlob(reqImageBlob, artistLi);
            }

            artistsDiv.appendChild(artistsOl);
            mainElement.appendChild(artistsDiv);
          } else if (!document.getElementById("artists")) {
            console.log(returnedRows);
            insertNoResults();
          }
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
            ).style.backgroundImage = `url("${url}")`)
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
    const artistLiClone = artistLi.cloneNode(true);

    artistLiClone.querySelector(".artist-name").innerText = artist.name;
    artistLiClone.querySelector(".artist-link").href += artist.artist_id;

    return artistLiClone;
  }
}
