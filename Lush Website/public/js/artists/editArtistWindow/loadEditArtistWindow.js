import EditArtistWindow from "./EditArtistWindow.js";

export default function loadEditArtistWindow() {
  const xmlhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const template = new DOMParser().parseFromString(
            this.responseText,
            "text/html"
          ),
          editArtistWindowContainer = template.getElementById(
            "edit-artist-window-container"
          );

        resolve(editArtistWindowContainer);
      }
    };

    xmlhttp.open(
      "GET",
      "/public/html/partials/artists/editArtistWindow.html",
      true
    );
    xmlhttp.send();
  });
}
