import insertNoResults from "../../partials/insertNoResults.js";

export default class ArtistConfigurator {
  constructor(artistLi, reqArtistDataSpec) {
    this.artistPic = document.getElementById("artist-pic");

    this.globalReqArtistData = {
      artistID: Number(document.location.pathname.split("/")[2]) || null,
      limit: 120,
      offset: 0,
    };

    this.atTheBottomObject = { atTheBottom: false };

    this.artistLi = artistLi;
    this.reqArtistDataSpec = reqArtistDataSpec || this.globalReqArtistData;

    this.getArtist();
    this.applyWindowOnScroll();
  }

  getArtist = () => {
    this.fetchDataChunk();
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
                imageWrapper = artistLi.querySelector("#image-wrapper");
              this.artistPic.appendChild(artistLi);

              const reqImageBlob = { blobID: artist.blob_id };
              this.fetchBlob(reqImageBlob, imageWrapper);
            }

            this.atTheBottomObject.atTheBottom = false;

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
        return url;
        // URL.revokeObjectURL(url);
      })
      .then((url) => {
        const img = document.createElement("img");
        img.src = url;

        img.onload = function () {
          const { r, g, b } = getAverageRGB(img);
          document.getElementById(
            "artist-background"
          ).style.background = `linear-gradient(0.25turn, rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))`;
          document.getElementById(
            "artist-pic"
          ).style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        };
      })
      .catch(console.error);
  };

  constructArtist = (artist) => {
    const artistLiClone = this.artistLi.cloneNode(true);

    artistLiClone.querySelector("#artist-name").innerText = artist.name;
    // artistLiClone.querySelector(".artist-link").href += artist.artist_id;

    return artistLiClone;
  };

  applyWindowOnScroll = () => {
    window.onscroll = () => {
      if (
        !this.atTheBottomObject.atTheBottom &&
        window.innerHeight + window.scrollY >=
          this.artistPic.offsetTop + this.artistPic.offsetHeight - 100
      ) {
        this.atTheBottomObject.atTheBottom = true;

        this.globalReqArtistData.offset += globalReqArtistData.limit;
        this.getArtist();
      }
    };
  };
}

function getAverageRGB(imgEl) {
  var blockSize = 5, // only visit every 5 pixels
    defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
    canvas = document.createElement("canvas"),
    context = canvas.getContext && canvas.getContext("2d"),
    data,
    width,
    height,
    i = -4,
    length,
    rgb = { r: 0, g: 0, b: 0 },
    count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    /* security error, img on diff domain */
    return defaultRGB;
  }

  length = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}
